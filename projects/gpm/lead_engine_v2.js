// Scarlett's Proactive Lead Engine v2
// Searches Companies House + Apollo, enriches with reasoning and summaries
const fetch = require("node-fetch");
const integrations = require("./integrations");
const memory = require("./scarlett_memory");

const API_BASE = "http://127.0.0.1:3100";
const ACCESS_CODE = "scarlett888";

async function api(path, opts = {}) {
  const url = API_BASE + path;
  const res = await fetch(url, {
    method: opts.method || "GET",
    headers: {
      "Content-Type": "application/json",
      "x-access-code": ACCESS_CODE,
      ...opts.headers
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined
  });
  return res.json();
}

// Generate reasoning for why a lead was selected using DeepSeek
async function generateReasoning(company) {
  try {
    const prompt = 'You are Scarlett, a business development assistant for Green Planet Makers (solar/heat pump installations).\nYou found a potential lead. Write 2-3 sentences explaining why this company is worth pursuing.\nKeep it natural, warm, and direct. Don\'t mention you\'re an AI.\n\nCompany: ' + (company.title || company.company_name) + '\nIndustry: Solar/Heat Pump Installers\nSource: Companies House';

    const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer sk-f59c8b2d71d54f0693c64e3a2f06b49b"
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150,
        temperature: 0.7
      })
    });
    const data = await res.json();
    return (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";
  } catch(e) {
    return "Found this company through Companies House - they operate in the renewable energy space.";
  }
}

// Generate a concise summary for the dashboard dossier
async function generateSummary(company, apolloOrg) {
  let summary = '**' + company.company_name + '**';
  if (apolloOrg) {
    if (apolloOrg.short_description) summary += ' - ' + apolloOrg.short_description;
    if (apolloOrg.phone) summary += '\n📞 Phone: ' + apolloOrg.phone;
    if (apolloOrg.website) summary += '\n🌐 Website: ' + apolloOrg.website;
    if (apolloOrg.linkedin_url) summary += '\n🔗 LinkedIn';
    if (apolloOrg.estimated_num_employees) summary += '\n👥 Employees: ' + apolloOrg.estimated_num_employees;
    if (apolloOrg.revenue_text) summary += '\n💰 Revenue: ' + apolloOrg.revenue_text;
    if (apolloOrg.city || apolloOrg.country) summary += '\n📍 Location: ' + [apolloOrg.city, apolloOrg.region, apolloOrg.country].filter(Boolean).join(", ");
  }
  if (company.address) summary += '\n\n**Registered Address:** ' + company.address;
  if (company.company_status) summary += '\n**Status:** ' + company.company_status;
  return summary;
}

// Search Apollo by company NAME (not guessed domain)
async function searchApolloByName(companyName) {
  try {
    // Try searching by organization name
    const url = "https://api.apollo.io/api/v1/organizations/search";
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "4YzkuTf35Rd67twlqbD-Og",
        "Cache-Control": "no-cache"
      },
      body: JSON.stringify({
        q_organization_name: companyName,
        page: 1,
        per_page: 3
      })
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.organizations && data.organizations.length > 0) {
      return data.organizations[0];
    }

    // Fallback: text search
    const res2 = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "4YzkuTf35Rd67twlqbD-Og",
        "Cache-Control": "no-cache"
      },
      body: JSON.stringify({
        q_text_search: companyName,
        page: 1,
        per_page: 3
      })
    });
    if (!res2.ok) return null;
    const data2 = await res2.json();
    return (data2.organizations && data2.organizations.length > 0) ? data2.organizations[0] : null;
  } catch(e) {
    return null;
  }
}

// Find leads using Companies House
async function findInstallerLeads() {
  const queries = ["solar panel installer", "heat pump installer", "renewable energy installer", "solar energy company"];
  const found = [];

  for (const query of queries) {
    try {
      const data = await integrations.searchCompanies(query);
      const items = data.items || [];
      for (const item of items.slice(0, 5)) {
        const existing = await api("/api/leads").catch(() => []);
        const alreadyExists = Array.isArray(existing) && existing.some(l =>
          l.company_name && l.company_name.toLowerCase() === item.title.toLowerCase()
        );
        if (!alreadyExists) {
          found.push({
            company_name: item.title,
            company_number: item.company_number,
            address: item.address_snippet,
            status: item.company_status,
            source: "scarlett_auto",
            website: null
          });
        }
      }
    } catch (e) {
      console.error('Search "' + query + '" failed: ' + e.message);
    }
  }
  return found;
}

// Enrich with Apollo + generate reasoning + summary
async function enrichWithApollo(leads) {
  const enriched = [];
  for (const lead of leads) {
    try {
      const apolloOrg = await searchApolloByName(lead.company_name);
      if (apolloOrg) {
        lead.phone = apolloOrg.phone || lead.phone;
        lead.website = apolloOrg.website || lead.website;
        lead.employees = apolloOrg.estimated_num_employees;
        lead.linkedin = apolloOrg.linkedin_url;
        lead.revenue = apolloOrg.revenue_text;
        lead.city = apolloOrg.city;
        lead.country = apolloOrg.country;
        lead.description = apolloOrg.short_description;
        lead.industry = apolloOrg.industry || "Solar/Heat Pump";
        lead.apollo_data = apolloOrg;

        // Get key people / decision makers
        if (apolloOrg.id) {
          try {
            const peopleUrl = "https://api.apollo.io/api/v1/people/search";
            const peopleRes = await fetch(peopleUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Api-Key": "4YzkuTf35Rd67twlqbD-Og"
              },
              body: JSON.stringify({
                organization_ids: [apolloOrg.id],
                page: 1,
                per_page: 3,
                person_titles: ["owner", "director", "manager", "founder", "ceo", "md", "managing director"]
              })
            });
            if (peopleRes.ok) {
              const peopleData = await peopleRes.json();
              if (peopleData.people && peopleData.people.length > 0) {
                const person = peopleData.people[0];
                lead.contact_name = person.name;
                lead.contact_title = person.title;
                lead.email = person.email || lead.email;
                lead.people = peopleData.people.slice(0, 3).map(function(p) {
                  return { name: p.name, title: p.title, email: p.email };
                });
              }
            }
          } catch(e) {}
        }
      }

      lead.reasoning = await generateReasoning(lead);
      lead.summary = await generateSummary(lead, apolloOrg);
      enriched.push(lead);
    } catch (e) {
      lead.reasoning = lead.reasoning || "Found this company through Companies House - they appear to be in renewable energy.";
      lead.summary = lead.summary || lead.company_name + ' - Renewable energy company';
      enriched.push(lead);
    }
  }
  return enriched;
}

// Check follow-ups
async function checkFollowUps() {
  const leads = await api("/api/leads").catch(function() { return []; });
  const followUps = [];
  if (!Array.isArray(leads)) return followUps;

  for (const lead of leads) {
    if (lead.status === "emailed" && lead.last_contacted) {
      const daysSince = (Date.now() - new Date(lead.last_contacted).getTime()) / 86400000;
      if (daysSince >= 3 && daysSince <= 5) {
        followUps.push(lead);
      } else if (daysSince >= 7) {
        followUps.push(Object.assign({}, lead, { urgent: true }));
      }
    }
  }
  return followUps;
}

// Generate email
async function generateEmail(lead, template) {
  if (!template) {
    const industry = lead.industry || "solar";
    template = memory.getBestTemplate(industry) || {
      subject_template: "Quick question about {{company}}",
      body_template: "Hi there,\n\nI noticed {{company}} is in the renewable energy space. We help companies like yours generate more leads through targeted outreach.\n\nWould you be open to a quick chat this week?\n\nBest,\nScarlett"
    };
  }
  const subject = template.subject_template.replace("{{company}}", lead.company_name || "your company");
  const body = template.body_template.replace("{{company}}", lead.company_name || "your company");
  return { subject: subject, body: body, template: template };
}

// Full pipeline
async function runLeadPipeline() {
  memory.init();
  console.log("🔍 Scarlett Lead Pipeline v2 starting...");
  const newLeads = await findInstallerLeads();
  console.log("   Found " + newLeads.length + " new potential leads");

  const enriched = await enrichWithApollo(newLeads);
  const enrichedCount = enriched.filter(function(l) { return l.apollo_data; }).length;
  console.log("   Enriched " + enrichedCount + " leads with Apollo");

  for (const lead of enriched) {
    try {
      const notes = JSON.stringify({
        reasoning: lead.reasoning || "",
        summary: lead.summary || "",
        description: lead.description || "",
        employees: lead.employees || null,
        revenue: lead.revenue || null,
        city: lead.city || null,
        country: lead.country || null,
        linkedin: lead.linkedin || null,
        people: lead.people || [],
        apollo_id: lead.apollo_data ? lead.apollo_data.id : null,
        found_at: new Date().toISOString()
      });

      await fetch(API_BASE + "/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-code": ACCESS_CODE
        },
        body: JSON.stringify({
          company_name: lead.company_name,
          company_number: lead.company_number,
          address: lead.address,
          website: lead.website || null,
          phone: lead.phone || null,
          email: lead.email || null,
          contact_name: lead.contact_name || null,
          contact_title: lead.contact_title || null,
          industry: lead.industry || "Solar/Heat Pump",
          location: [lead.city, lead.country].filter(Boolean).join(", ") || null,
          status: "new",
          source: lead.source || "scarlett_auto",
          notes: notes,
          score: lead.employees ? Math.min(lead.employees, 100) : 0
        })
      });
    } catch(e) {
      console.error("Failed to save lead " + lead.company_name + ": " + e.message);
    }
  }

  const followUps = await checkFollowUps();
  console.log("   " + followUps.length + " leads need follow-up");

  memory.learn("pipeline", "last_run", JSON.stringify({
    new_leads: newLeads.length,
    enriched: enrichedCount,
    follow_ups: followUps.length,
    timestamp: new Date().toISOString()
  }));

  return { newLeads: enriched, followUps: followUps };
}

module.exports = { findInstallerLeads: findInstallerLeads, enrichWithApollo: enrichWithApollo, checkFollowUps: checkFollowUps, generateEmail: generateEmail, runLeadPipeline: runLeadPipeline };

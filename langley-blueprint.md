# Langley Renewables — Commercial Solar Acquisition Engine
## Full Architecture Blueprint
*Prepared for Arcadian Maya — June 15, 2026*

---

## 1. Executive Summary

**Platform:** AI-powered commercial solar prospecting, qualification and engagement engine
**Client:** Langley Renewables
**Target:** 5-10 qualified, appointment-ready commercial solar opportunities per week (minimum 30kWp)
**Build time:** 4-6 weeks for MVP prototype

**The core idea:** Feed in a geographic area → platform scans commercial properties, enriches with business/financial data, assesses solar viability, scores each lead, then engages prospects via AI — delivering appointment-ready lead packages to the sales team.

---

## 2. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ Lead         │  │ AI WhatsApp  │  │ Sales Dashboard   │  │
│  │ Discovery    │  │ Assistant    │  │ (Lead pipeline,   │  │
│  │ Dashboard    │  │ Interface    │  │  scoring, reports)│  │
│  └─────────────┘  └──────────────┘  └───────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                     APPLICATION LAYER                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │
│  │ Discovery│ │Enrichment│ │  Solar   │ │   AI Engine   │  │
│  │ Engine   │ │ Engine   │ │ Assessor │ │(DeepSeek V4)  │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │
│  │ Lead     │ │ Outreach │ │ Reporting│ │   CRM Bridge  │  │
│  │ Scorer   │ │ Engine   │ │ Generator│ │(GHL/Monday)   │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                     DATA LAYER                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  PostgreSQL Database                                  │   │
│  │  (Properties, Companies, Leads, Scores, Engagements)  │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Redis Cache                                           │   │
│  │  (API response caching, rate limit management)         │   │
│  └──────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                  EXTERNAL API LAYER                          │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────┐ │
│  │Property│ │Companies│ │Credits-│ │DeepSeek│ │Google    │ │
│  │Data    │ │House   │ │afe     │ │V4 Flash│ │Maps      │ │
│  └────────┘ └────────┘ └────────┘ └────────┘ └──────────┘ │
│  ┌────────┐ ┌────────┐ ┌────────┐                          │
│  │Open-   │ │EPC     │ │Hunter  │                          │
│  │Meteo   │ │Register│ │.io     │                          │
│  └────────┘ └────────┘ └────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Core Engines — Detailed Breakdown

### 3.1 Discovery Engine

**Purpose:** Identify commercial properties that match the ideal customer profile.

**Input:** Geographic area (postcode district or radius)

**Process:**
```
1. Query PropertyData for commercial/industrial properties
   - Endpoints: /title, /uprn-title, /title-use-class
   - Filter: Class E (commercial), B2 (industrial), B8 (warehouse), C1 (hotels), C2 (care homes)
   
2. Filter by roof size potential (>200m² floor area → ~30kWp)
   - Endpoint: /floor-areas
   - Fallback: Estimate from property type + postcode averages

3. Cross-reference with Companies House
   - Query registered address → find active limited companies
   - Extract: company name, number, SIC code, incorporation date
   - Filter out: dissolved, liquidation, non-trading status
```

**Output:** List of candidate properties with:
- Full address + UPRN
- Property type classification
- Estimated floor area / roof space
- Linked company name + company number (if owner-occupied)
- Geographic coordinates

---

### 3.2 Enrichment Engine

**Purpose:** Score each candidate on ownership, financial strength, and electricity consumption.

**Sub-Engine A — Ownership Status (25% of final score)**
```
Query Pipeline:
1. PropertyData /title → check if company-owned
2. Companies House → check if registered address matches property
3. Cross-reference directors' home addresses with property (advanced)
4. Land Registry title documents for leasehold/freehold status

Output: Ownership score (0-100)
- Owner-occupier: 80-100
- Single tenant + landlord-owned: 40-60
- Multi-tenanted: 0-30
```

**Sub-Engine B — Financial Strength (15% of final score)**
```
Query Pipeline:
1. Companies House → pull latest filed accounts
   - Turnover, profit/loss, net worth
   - Cash at bank
   - Director loan accounts
2. Creditsafe (paid) → credit score, risk rating, CCJs
3. Company age → stability indicator

Output: Financial score (0-100)
- Creditsafe score 80-100 + profitable: 80-100
- Creditsafe 50-79: 40-70
- Below 50: 0-30 (reject)
```

**Sub-Engine C — Estimated Electricity Spend (25% of final score)**
```
Estimation Model (no direct API — built algorithm):
1. Look up SIC code → Industry energy intensity factor (kWh/£ turnover)
2. Calculate from turnover (from accounts) × intensity factor
3. Cross-reference with floor area × typical kWh/m² for sector
4. Apply time-of-use modifier (daytime-heavy industries score higher)

SIC-based intensity table (pre-built):
- Manufacturing (10-33): HIGH — 0.15-0.30 kWh/£
- Warehousing (52): MED-HIGH — 0.08-0.15 kWh/£
- Hotels (55): MED — 0.05-0.10 kWh/£  
- Schools/Education (85): MED — 0.06-0.12 kWh/£
- Care homes (87): MED — 0.06-0.12 kWh/£
- Offices (68-70): LOW-MED — 0.03-0.06 kWh/£

Output: Annual spend estimate + score (0-100)
- >£100K/yr: 90-100
- £50-100K/yr: 70-90
- £20-50K/yr: 40-70
- <£20K/yr: 0-30
```

---

### 3.3 Solar Assessor

**Purpose:** Calculate solar viability and financial return for each property.

**Input:** Address, roof area, property type, electricity consumption

**Process:**
```
1. Open-Meteo Solar API → solar irradiance at property location
   - Peak sun hours per day (UK: 2.5-4.0 depending on location)
   
2. Calculate installable capacity:
   - 1 kWp ≈ 5-7 m² of roof (UK commercial)
   - Roof utilisation factor: ~70% (accounting for obstructions, orientation)
   - kWp = (roofArea_m² × 0.70) / 6
   
3. Calculate annual generation:
   - Annual kWh = kWp × peakSunHours × 365 × 0.85 (system losses)
   
4. Calculate financials:
   - Annual savings = generation × self-consumption% × £0.25/kWh (commercial rate)
   - Export income = surplus × £0.08/kWh (SEG rate)
   - Payback years = system cost (£1,200/kWp installed) / annual savings
   - ROI over 25 years
   
5. Carbon impact:
   - Avoided CO₂ = annual kWh × 0.212 kgCO₂/kWh (UK grid average)
   - Carbon credit value = CO₂ tonnes × £40 (UK VCM rate)
```

**Output:**
- System size (kWp)
- Annual generation (kWh)
- Annual electricity savings (£)
- Payback period (years)
- 25-year ROI
- CO₂ reduction (tonnes/yr)
- Carbon credit value (£/yr)

---

### 3.4 AI Engagement Engine (DeepSeek V4 Flash)

**Purpose:** Generate personalised outreach and qualify prospects before human involvement.

**Sub-Engine A — Lead Qualification AI**
```
Capabilities:
- Generate personalised outreach emails (company-aware)
- Write WhatsApp introduction messages
- Answer prospect questions about solar viability
- Handle objections (cost, disruption, payback period)
- Book appointments (detect booking intent)

Technical:
- Model: DeepSeek V4 Flash (deekseek-v4-flash)
- Context: Company profile, solar assessment data, industry
- Prompt template per channel (email vs WhatsApp vs call script)
- Cost: ~$0.14/M input tokens, ~$0.28/M output
  - Per outreach email: ~2K tokens → ~$0.0003
  - Per conversation (10 turns): ~10K tokens → ~$0.002
  - Monthly at 40 leads × 2 emails + 5 WhatsApp turns: ~$0.50-2.00
```

**Sub-Engine B — AI Outreach Engine**
```
Email Pipeline:
1. Generate personalised subject line + body from lead data
2. Insert dynamic values (company name, savings figure, roof sqm)
3. Track opens/clicks (via tracking pixel or link)
4. Auto-follow-up sequence (Day 3, Day 7, Day 14)

WhatsApp Pipeline:
1. Initial intro message with personalised solar savings estimate
2. Answer FAQs automatically
3. Detect interest level from conversation
4. Flag for human call if "appointment" or "quote" intent detected

Call Script Generator:
1. Generate discovery call script from lead package
2. Include expected objections + rebuttals
3. Include appointment closing prompts
```

**Sub-Engine C — Lead Scoring Update (5% factor)**
```
- Website visits: Track via UTM/landing pages
- Email opens: Tracking pixel
- Email replies: NLP sentiment analysis
- WhatsApp replies: Intent classification
- => Hot (80-100), Warm (40-79), Cold (0-39)
```

---

### 3.5 Lead Scorer

**Purpose:** Produce final weighted score out of 100.

**Weighting Implementation:**
```
finalScore = (
    ownershipScore × 0.25 +
    electricityScore × 0.25 +
    solarScore × 0.20 +
    financialScore × 0.15 +
    multiSiteScore × 0.10 +
    engagementScore × 0.05
)

if finalScore >= 70: LEAD = "HOT — Hand to sales immediately"
if finalScore >= 45: LEAD = "WARM — AI nurture sequence"
if finalScore < 45:  LEAD = "COLD — Store for later"
```

---

## 4. Data Model (Database Schema)

### Core Tables

```sql
-- Properties
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uprn VARCHAR(12) UNIQUE NOT NULL,
    address_line_1 VARCHAR(255),
    address_line_2 VARCHAR(255),
    town VARCHAR(100),
    postcode VARCHAR(8),
    property_type VARCHAR(50),       -- commercial, industrial, etc
    use_class VARCHAR(10),           -- B2, B8, E, C1, C2
    floor_area_m2 DECIMAL(10,2),
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    roof_area_estimate_m2 DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Companies
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_number VARCHAR(10) UNIQUE NOT NULL,
    company_name VARCHAR(255),
    registered_address TEXT,
    sic_code VARCHAR(10),
    incorporation_date DATE,
    status VARCHAR(50),              -- active, dissolved, etc
    estimated_turnover DECIMAL(14,2),
    years_trading INTEGER,
    credit_score INTEGER,            -- from Creditsafe
    financial_score DECIMAL(5,2),    -- our calculation
    created_at TIMESTAMP DEFAULT NOW()
);

-- Property-Company Link
CREATE TABLE property_companies (
    property_id UUID REFERENCES properties(id),
    company_id UUID REFERENCES companies(id),
    relationship_type VARCHAR(50),   -- owner-occupier, tenant, landlord
    confidence_score DECIMAL(5,2),
    PRIMARY KEY (property_id, company_id)
);

-- Solar Assessments
CREATE TABLE solar_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id),
    peak_sun_hours DECIMAL(4,2),
    estimated_kwp DECIMAL(8,2),
    annual_generation_kwh DECIMAL(12,2),
    self_consumption_pct DECIMAL(5,2),
    annual_savings_gbp DECIMAL(10,2),
    system_cost_gbp DECIMAL(10,2),
    payback_years DECIMAL(5,2),
    roi_25yr_pct DECIMAL(5,2),
    co2_saved_tonnes DECIMAL(8,2),
    carbon_credit_value_gbp DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Electricity Estimates
CREATE TABLE electricity_estimates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    sic_code VARCHAR(10),
    estimated_annual_kwh DECIMAL(12,2),
    estimated_annual_spend_gbp DECIMAL(10,2),
    daytime_usage_pct DECIMAL(5,2),
    energy_intensity VARCHAR(20),    -- high, medium, low
    score DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Leads (final qualified opportunity)
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id),
    company_id UUID REFERENCES companies(id),
    solar_assessment_id UUID REFERENCES solar_assessments(id),
    lead_score DECIMAL(5,2),
    ownership_score DECIMAL(5,2),
    electricity_score DECIMAL(5,2),
    solar_score DECIMAL(5,2),
    financial_score DECIMAL(5,2),
    multisite_score DECIMAL(5,2),
    engagement_score DECIMAL(5,2),
    status VARCHAR(20),              -- cold, warm, hot, qualified, won, lost
    estimated_project_value_gbp DECIMAL(10,2),
    recommended_funding VARCHAR(50), -- self-funded, financed, PPA
    assigned_sales_rep VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- AI Engagements
CREATE TABLE engagements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id),
    channel VARCHAR(20),             -- email, whatsapp, call, web
    direction VARCHAR(10),           -- outbound, inbound
    content TEXT,
    sentiment VARCHAR(20),           -- positive, neutral, negative
    intent_detected VARCHAR(50),     -- interested, objection, booking
    created_at TIMESTAMP DEFAULT NOW()
);

-- Multi-Site Groups
CREATE TABLE multi_site_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_company_id UUID REFERENCES companies(id),
    name VARCHAR(255),
    total_sites INTEGER,
    estimated_portfolio_kwp DECIMAL(10,2)
);

CREATE TABLE multi_site_members (
    group_id UUID REFERENCES multi_site_groups(id),
    company_id UUID REFERENCES companies(id),
    property_id UUID REFERENCES properties(id)
);
```

---

## 5. API Integration Plan

### 5.1 PropertyData (£28/mo)

| Endpoint | Purpose | Credit Cost | Frequency |
|----------|---------|-------------|-----------|
| `/title` | Property ownership, tenure | 1 | Per property on scan |
| `/title-use-class` | Commercial use class | 1 | Per property on scan |
| `/floor-areas` | Internal floor area | 1 | Per property on scan |
| `/uprn-title` | Owner lookup by UPRN | 1 | Per property on scan |
| `/titles-by-company` | Find all properties owned by a company | 1 | For multi-site detection |
| `/sold-prices` | Comparable sales data | 1 | For valuation context |
| `/valuation-commercial-sale` | Commercial property value | 1 | For project value estimate |

**Estimated monthly usage:** 200-400 credits (£28 plan covers 500-1000 depending on tier)

### 5.2 Companies House (FREE)

| Endpoint | Purpose | Rate Limit |
|----------|---------|------------|
| `GET /company/{number}` | Company profile, SIC, status | 600 req/5min |
| `GET /company/{number}/officers` | Directors and secretaries | 600 req/5min |
| `GET /company/{number}/filing-history` | Accounts, confirmation statements | 600 req/5min |
| `GET /search/companies?q=` | Find company by name/trading name | 600 req/5min |
| `GET /company/{number}/persons-with-significant-control` | Ultimate beneficial owners | 600 req/5min |

**Implementation:** Node.js client with built-in rate limiter (queue + retry)

### 5.3 Creditsafe (PAYG ~£0.50-1/report)

| Call | Purpose |
|------|---------|
| `company/{country}/{number}/creditreport` | Full credit report |
| `company/{country}/{number}/creditlimit` | Recommended credit limit |
| `monitoring/create` | Watchlist for changes |

**Implementation:** Only called after a lead passes initial screening (save money). ~40-80 reports/month.

### 5.4 Open-Meteo Solar (FREE)

| Endpoint | Purpose |
|----------|---------|
| `GET /v1/forecast?latitude=X&longitude=Y&daily=shortwave_radiation_sum` | Daily solar irradiance |

**Implementation:** Free, unlimited, no API key needed.

### 5.5 Google Maps Platform (~£3-5/mo)

| API | Purpose |
|-----|---------|
| Maps Static API | Satellite roof imagery for visual verification |
| Geocoding API | Postcode → lat/lng (fallback) |
| Street View Static API | Front-of-building image for lead package |

**Usage:** ~500 requests/month at low volume

### 5.6 EPC Register (GOV.UK, FREE)

| Endpoint | Purpose |
|----------|---------|
| `GET /api/domestic/search?postcode=X` | Query domestic EPC data |
| `GET /api/non-domestic/search?postcode=X` | Commercial EPC data |

**Implementation:** Can also use Homedata as a paid alternative (£0-30/mo) for consolidated lookup.

### 5.7 DeepSeek V4 Flash (~$0.50-3/mo)

| Use | Tokens per call | Monthly cost estimate |
|-----|-----------------|----------------------|
| Outreach email generation | ~2K input + 500 output | ~$0.30 (40 leads × 2 emails) |
| WhatsApp conversation | ~1K per exchange | ~$0.50-1.50 (5-10 convos/mo) |
| Call script generation | ~3K input + 1K output | ~$0.10 |
| Sentiment analysis | ~500 input + 100 output | ~$0.05 (100 messages) |
| **Total AI costs** | | **~$1-3/mo** |

---

## 6. System Workflow — End to End

```
WEEKLY BATCH RUN (Every Sunday night / Monday morning):

1. DISCOVERY PHASE
   └─ For each target postcode district:
      ├─ PropertyData: Get all commercial properties
      ├─ Filter: >200m² floor area, Use class B/C/E
      └─ Companies House: Match to active companies
      
2. ENRICHMENT PHASE  
   └─ For each matched property+company:
      ├─ Ownership: PropertyData title → Land Registry check
      ├─ Financial: CH accounts → Creditsafe if score unclear
      ├─ Electricity: SIC code × turnover × intensity algorithm
      └─ Multi-site: CH group structure detection
      
3. SOLAR ASSESSMENT PHASE
   └─ For each property:
      ├─ Open-Meteo: Get solar irradiance for location
      ├─ Solar calculator: kWp, kWh, savings, payback, carbon
      └─ Google Maps: Fetch satellite + street view images
      
4. SCORING PHASE
   └─ Weighted algorithm runs:
      25% ownership + 25% electricity + 20% solar 
      + 15% financial + 10% multisite + 5% engagement

5. LEAD OUTPUT
   └─ Generate lead packages:
      ├─ HOT (score ≥70) → Push to CRM, alert sales team
      ├─ WARM (score 45-69) → AI outreach sequence
      └─ COLD (score <45) → Store for later/nurture

6. AI ENGAGEMENT PHASE (Continuous during week)
   └─ For WARM leads:
      ├─ Day 1: Personalised outreach email (DeepSeek)
      ├─ Day 3: Follow-up email with specific savings figure
      ├─ Day 7: WhatsApp intro message
      ├─ Day 14: Final email or call script generation
      └─ If reply received → AI conversation → detect intent
      
7. SALES HANDOFF
   └─ When intent detected (or HOT lead):
      ├─ Generate PDF lead package
      ├─ Push to CRM (GHL/Monday.com)
      ├─ Send sales rep briefing + call script
      └─ Create calendar entry for follow-up
```

---

## 7. Lead Package Output (Each Lead)

Every qualified opportunity delivered as a structured data package containing:

### Company Profile
- Company name, number, SIC code
- Number of employees (estimated from turnover)
- Years trading
- Industry sector
- Website URL

### Decision Maker Data
- Director names (from Companies House)
- Positions held
- Estimated email (Hunter.io or similar)
- LinkedIn URL (constructed from company name)

### Site Intelligence
- Full site address + postcode
- Aerial satellite image
- Roof area and usable estimate
- Property type and use class

### Solar Opportunity Summary
- Estimated system size (kWp)
- Annual generation (kWh)
- Annual savings (£)
- Carbon reduction (tonnes CO₂)
- Carbon credit value (£/yr)
- Payback period
- 25-year ROI

### Financial Indicators
- Credit score
- Finance eligibility assessment
- PPA suitability
- Ownership confidence score

### Lead Score Breakdown
- Final score (out of 100)
- Component scores
- Classification (Hot/Warm/Cold)
- Estimated project value (£)

### AI Briefing Notes
- Personalised summary for sales rep
- Recommended approach angle
- Key objections to prepare for
- Discovery call script

---

## 8. Technology Stack Recommendation

| Layer | Technology | Justification |
|-------|-----------|---------------|
| **Backend** | Node.js + Express + PM2 | Already running on IONOS server, familiar stack |
| **Database** | PostgreSQL 16 | Robust, spatial queries (PostGIS for geo), JSON support |
| **Cache** | Redis (optional) | API response caching, rate limiting |
| **Queue** | Bull/BullMQ | Background job processing for API calls |
| **Frontend** | Vanilla HTML/CSS/JS dashboard | Quick MVP, no framework lock-in |
| **PDF Generation** | Puppeteer or PDFKit | Lead package PDFs |
| **AI** | DeepSeek V4 Flash API | Cheapest capable model for text generation |
| **CRM Bridge** | GHL API or Monday.com API | Customer's existing system integration |
| **Hosting** | IONOS Ubuntu server (existing) | No additional hosting cost |
| **CI/CD** | PM2 + git hooks | Simple deployment pipeline |

---

## 9. Build Phases & Timeline

### Phase 1 — Core Discovery (Week 1)
- Set up PostgreSQL schema
- PropertyData + Companies House integration
- Basic property scanner
- **Output:** Raw list of candidate properties with linked companies

### Phase 2 — Enrichment (Week 2)
- Ownership status detection
- Financial analysis (accounts parsing)
- Electricity spend estimation model
- Credit score integration
- **Output:** Enriched leads with scores

### Phase 3 — Solar Assessment (Week 3)
- Open-Meteo solar integration
- Financial calculator (savings, payback, ROI)
- Carbon credit valuation
- Google Maps imagery
- **Output:** Full solar feasibility per lead

### Phase 4 — Scoring Engine (Week 3-4)
- Weighted algorithm implementation
- Multi-site detection
- Lead status classification
- Lead package generation
- **Output:** Qualified, scored leads with full packages

### Phase 5 — AI Engagement (Week 4-5)
- DeepSeek API integration
- Email outreach template engine
- WhatsApp assistant (via WhatsApp Business API)
- Call script generator
- Engagement tracking
- **Output:** Automated outreach campaigns

### Phase 6 — Delivery & CRM (Week 5-6)
- CRM bridge (GHL or Monday.com)
- Lead dashboard frontend
- PDF report generator
- Sales rep notification system
- **Output:** Complete platform ready for demo

---

## 10. Cost Summary

### Build Cost (One-Time)

| Item | Cost |
|------|------|
| Development (internal) | Server already set up, tools ready |
| PostgreSQL setup | FREE |
| Domain/subdomain (solar.langleyrenewables.co.uk) | £10/yr |
| SSL (Let's Encrypt) | FREE |
| **Total Build Cost** | **~£10** |

### Monthly Running Costs

| Service | Cost | Notes |
|---------|------|-------|
| PropertyData | £28/mo | ~200-400 credits |
| Creditsafe | £25-50/mo | ~40-80 credit reports |
| DeepSeek V4 Flash | ~£2-3/mo | AI outreach + engagement |
| Google Maps | ~£3-5/mo | Static + Street View imagery |
| IONOS server (already owned) | £0 | Existing infrastructure |
| Domain renewal | ~£0.83/mo | Already owned |
| Hunter.io (optional) | ~£34/mo | Only for email finding |
| **Total** | **~£60-90/mo** | **Or ~£25-30/mo without Hunter.io** |

### Recommended Client Pricing

| Component | Suggested |
|-----------|-----------|
| **Setup fee** | £5,000-8,000 |
| **Monthly retainer** | £399-599 |
| **Revenue share** | 10% of solar install value + carbon credit sales |

---

## 11. Key Technical Decisions

### Decision 1: Batch vs Real-Time Discovery
**Recommendation:** Batch weekly scans (Sunday night/Monday morning)
- Property/company data changes slowly
- Avoids burning API credits on real-time lookups
- One scan pass covers the target area completely
- Results persist in local database for instant daily dashboard use

### Decision 2: Credit Scoring — Buy vs Build
**Recommendation:** Hybrid approach
- **Buy Creditsafe** for the first batch (calibrate our internal model)
- **Build** a scoring model from Companies House accounts data (turnover, profit, age, filing timeliness)
- Use Creditsafe as a **verification layer** only for borderline scores or high-value leads
- Saves ~50% on credit report costs after initial calibration

### Decision 3: AI Model Selection
**Recommendation:** DeepSeek V4 Flash
- $0.14/M input tokens vs GPT-5.5 at $5/M — **35x cheaper**
- Quality is sufficient for email generation, script writing, qualification conversations
- If higher quality needed later, swap to DeepSeek V4 Pro or GPT without architecture change

### Decision 4: CRM Integration
**Recommendation:** Start with GHL (we already have access) + universal webhook for others
- GHL for initial deployment
- Monday.com if client prefers it
- Webhook-based architecture means any CRM can be plugged in

### Decision 5: WhatsApp Integration
**Recommendation:** Phase 2 feature — start with email + web forms
- WhatsApp Business API requires Meta approval (can take weeks)
- Email outreach can deliver 80% of the value immediately
- Add WhatsApp after prototype is proven

---

## 12. Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| API rate limits | Medium | Medium | Queue system, batch processing, staggered calls |
| PropertyData commercial coverage gaps | Medium | Medium | Supplement with Searchland / Homedata |
| Ownership detection accuracy | Medium | High | Confidence scoring + manual verification fallback |
| Electricity spend estimates | High | Medium | Build from multiple signals (SIC + floor + turnover) |
| Creditsafe cost scaling | Medium | Medium | Build internal score from CH accounts data |
| AI email quality | Low | Low | Human-review queue before sending |
| Client scope creep | High | High | Clear milestone sign-off per phase |

---

## 13. Next Steps

### Immediate Actions (Maya)
1. ✅ Check PropertyData trial status — restart if expired
2. ✅ Sign up for Companies House API key (free, instant)
3. ✅ Enable Google Maps Static + Geocoding APIs (set budget cap £10/mo)
4. ✅ Confirm client prefers GHL or Monday.com for CRM

### Build Commencement
1. Set up PostgreSQL database on IONOS server
2. Build Discovery Engine (PropertyData + CH scanner)
3. Run first test batch on 1 postcode district
4. Present raw lead output to client as proof of concept
5. Phase 2-6 after sign-off

---

*This blueprint is designed to be handed directly to a development team for scoping and build. Every component, API, table, and workflow is specified at production-ready detail.*

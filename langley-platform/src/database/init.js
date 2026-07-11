/**
 * Langley Solar Engine - Database Initialization (SQLite)
 */

const db = require('./pool');

function init() {
  console.log('🗄️ Initializing database...');

  db.exec(`
    CREATE TABLE IF NOT EXISTS properties (
      id TEXT PRIMARY KEY,
      uprn TEXT UNIQUE,
      address_line_1 TEXT,
      address_line_2 TEXT,
      town TEXT,
      postcode TEXT,
      property_type TEXT,
      use_class TEXT,
      floor_area_m2 REAL,
      latitude REAL,
      longitude REAL,
      roof_area_estimate_m2 REAL,
      epc_rating TEXT,
      epc_score INTEGER,
      raw_data TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY,
      company_number TEXT UNIQUE NOT NULL,
      company_name TEXT,
      registered_address TEXT,
      sic_code TEXT,
      incorporation_date TEXT,
      status TEXT,
      estimated_turnover REAL,
      years_trading INTEGER,
      credit_score INTEGER,
      financial_health TEXT,
      directors TEXT,
      raw_accounts TEXT,
      raw_data TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS property_companies (
      id TEXT PRIMARY KEY,
      property_id TEXT REFERENCES properties(id) ON DELETE CASCADE,
      company_id TEXT REFERENCES companies(id) ON DELETE CASCADE,
      relationship_type TEXT,
      confidence_score REAL,
      UNIQUE(property_id, company_id)
    );

    CREATE TABLE IF NOT EXISTS solar_assessments (
      id TEXT PRIMARY KEY,
      property_id TEXT REFERENCES properties(id) ON DELETE CASCADE,
      peak_sun_hours REAL,
      estimated_kwp REAL,
      annual_generation_kwh REAL,
      self_consumption_pct REAL DEFAULT 70,
      annual_savings_gbp REAL,
      system_cost_gbp REAL,
      payback_years REAL,
      roi_25yr_pct REAL,
      co2_saved_tonnes REAL,
      carbon_credit_value_gbp REAL,
      roof_image_url TEXT,
      street_image_url TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS electricity_estimates (
      id TEXT PRIMARY KEY,
      company_id TEXT REFERENCES companies(id) ON DELETE CASCADE,
      sic_code TEXT,
      industry_category TEXT,
      estimated_annual_kwh REAL,
      estimated_annual_spend_gbp REAL,
      daytime_usage_pct REAL DEFAULT 60,
      energy_intensity TEXT,
      score REAL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      property_id TEXT REFERENCES properties(id),
      company_id TEXT REFERENCES companies(id),
      solar_assessment_id TEXT REFERENCES solar_assessments(id),
      lead_score REAL,
      ownership_score REAL,
      electricity_score REAL,
      solar_score REAL,
      financial_score REAL,
      multisite_score REAL,
      engagement_score REAL,
      status TEXT DEFAULT 'cold',
      estimated_project_value_gbp REAL,
      recommended_funding TEXT,
      assigned_sales_rep TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS engagements (
      id TEXT PRIMARY KEY,
      lead_id TEXT REFERENCES leads(id) ON DELETE CASCADE,
      channel TEXT,
      direction TEXT,
      content TEXT,
      sentiment TEXT,
      intent_detected TEXT,
      metadata TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS scan_logs (
      id TEXT PRIMARY KEY,
      scan_type TEXT,
      postcode TEXT,
      properties_found INTEGER DEFAULT 0,
      companies_matched INTEGER DEFAULT 0,
      leads_generated INTEGER DEFAULT 0,
      status TEXT,
      duration_seconds INTEGER,
      error_message TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_properties_postcode ON properties(postcode);
    CREATE INDEX IF NOT EXISTS idx_properties_uprn ON properties(uprn);
    CREATE INDEX IF NOT EXISTS idx_companies_number ON companies(company_number);
    CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
    CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(lead_score DESC);
    CREATE INDEX IF NOT EXISTS idx_scan_logs_type ON scan_logs(scan_type);
  `);

  // Get table list
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all();
  console.log('✅ Database initialized with tables:', tables.map(t => t.name).join(', '));
}

// Run init
init();

module.exports = { init };

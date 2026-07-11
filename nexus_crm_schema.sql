-- Nexus CRM Schema for Supabase
-- Created 2026-06-03

-- 0. Users table (syncs with Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text,
    name text,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own record" ON users
    FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own record" ON users
    FOR UPDATE USING (id = auth.uid());

-- 1. contacts
CREATE TABLE IF NOT EXISTS contacts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text,
    email text,
    phone text,
    company text,
    title text,
    status text DEFAULT 'Lead',
    value numeric DEFAULT 0,
    tags text[],
    linkedin text,
    web text,
    notes text,
    user_id uuid,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own contacts" ON contacts
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own contacts" ON contacts
    FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own contacts" ON contacts
    FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own contacts" ON contacts
    FOR DELETE USING (user_id = auth.uid());

-- 2. deals
CREATE TABLE IF NOT EXISTS deals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text,
    contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
    value numeric,
    prob int,
    stage text DEFAULT 'Lead',
    close_date date,
    notes text,
    user_id uuid,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own deals" ON deals
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own deals" ON deals
    FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own deals" ON deals
    FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own deals" ON deals
    FOR DELETE USING (user_id = auth.uid());

-- 3. tasks
CREATE TABLE IF NOT EXISTS tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text,
    contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
    priority text DEFAULT 'Medium',
    category text,
    due date,
    recur text,
    notes text,
    done boolean DEFAULT false,
    user_id uuid,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks" ON tasks
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own tasks" ON tasks
    FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own tasks" ON tasks
    FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own tasks" ON tasks
    FOR DELETE USING (user_id = auth.uid());

-- 4. invoices
CREATE TABLE IF NOT EXISTS invoices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    type text,
    contact text,
    amount numeric,
    status text DEFAULT 'Draft',
    due date,
    notes text,
    user_id uuid,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invoices" ON invoices
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own invoices" ON invoices
    FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own invoices" ON invoices
    FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own invoices" ON invoices
    FOR DELETE USING (user_id = auth.uid());

-- 5. automations
CREATE TABLE IF NOT EXISTS automations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text,
    trigger_event text,
    action text,
    action_val text,
    enabled boolean DEFAULT true,
    runs int DEFAULT 0,
    user_id uuid,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE automations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own automations" ON automations
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own automations" ON automations
    FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own automations" ON automations
    FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own automations" ON automations
    FOR DELETE USING (user_id = auth.uid());

-- 6. notes
CREATE TABLE IF NOT EXISTS notes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text,
    type text DEFAULT 'Note',
    tags text[],
    body text,
    starred boolean DEFAULT false,
    user_id uuid,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notes" ON notes
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own notes" ON notes
    FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own notes" ON notes
    FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own notes" ON notes
    FOR DELETE USING (user_id = auth.uid());

-- 7. templates
CREATE TABLE IF NOT EXISTS templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text,
    stage text,
    subject text,
    body text,
    user_id uuid,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own templates" ON templates
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own templates" ON templates
    FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own templates" ON templates
    FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own templates" ON templates
    FOR DELETE USING (user_id = auth.uid());

-- 8. activity
CREATE TABLE IF NOT EXISTS activity (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
    type text,
    body text,
    user_id uuid,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity" ON activity
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own activity" ON activity
    FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own activity" ON activity
    FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own activity" ON activity
    FOR DELETE USING (user_id = auth.uid());

-- 9. events
CREATE TABLE IF NOT EXISTS events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text,
    date date,
    type text,
    contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
    user_id uuid,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own events" ON events
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own events" ON events
    FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own events" ON events
    FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own events" ON events
    FOR DELETE USING (user_id = auth.uid());

-- 10. files
CREATE TABLE IF NOT EXISTS files (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text,
    type text,
    size int,
    data_url text,
    user_id uuid,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own files" ON files
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own files" ON files
    FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own files" ON files
    FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own files" ON files
    FOR DELETE USING (user_id = auth.uid());

-- 11. maps
CREATE TABLE IF NOT EXISTS maps (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text,
    nodes jsonb DEFAULT '[]',
    user_id uuid,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE maps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own maps" ON maps
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own maps" ON maps
    FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own maps" ON maps
    FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own maps" ON maps
    FOR DELETE USING (user_id = auth.uid());

-- 12. webhooks
CREATE TABLE IF NOT EXISTS webhooks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event text,
    data jsonb,
    user_id uuid,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own webhooks" ON webhooks
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own webhooks" ON webhooks
    FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own webhooks" ON webhooks
    FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own webhooks" ON webhooks
    FOR DELETE USING (user_id = auth.uid());

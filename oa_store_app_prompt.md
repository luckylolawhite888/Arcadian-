# Out & About — Store App Prompt for AI Tools

## App Overview
A mobile web app (PWA) for local business owners to create and manage deals. Login with membership number + password. Dashboard shows active deals, create new deals with AI-assisted writing, and view simple analytics.

## Tech Stack
- **Framework:** React or Vue (whichever Base 44/Claude prefers)
- **Backend:** Supabase (already set up)
- **Supabase URL:** https://mdleurcenwmmenvkwjhl.supabase.co
- **Supabase Anon Key:** sb_publishable_mPjat_GLHfK1TwzPxEa2tQ_OvutOgDL
- **Auth:** Supabase Auth (email/password for store owners)

## Database Schema (already created)

### stores
- id: UUID (PK), name, slug, description, category, address, postcode, lat, lng, phone, website, logo_url, cover_url, is_active, created_at, updated_at

### store_memberships
- id: UUID (PK), store_id (FK → stores), user_id (FK → auth.users), role, membership_number (UNIQUE), is_active, created_at

### deals
- id: UUID (PK), store_id (FK → stores), title, description, image_urls (TEXT[]), deal_type ('end_of_day', 'flash_sale', 'ongoing', 'seasonal'), start_time, end_time, is_published, is_auto_removed, ai_generated, created_at, updated_at

### deal_views
- id: UUID (PK), deal_id (FK → deals), viewed_at, device_id

### social_posts
- id: UUID (PK), deal_id (FK → deals), platform, posted_at, post_url, status

### deal_repeats
- id: UUID (PK), original_deal_id, new_deal_id, repeated_at

## RLS Policies
- Store owners can read/write their own deals
- Store owners can edit their own store profile
- Users read their own memberships
- Anonymous users can read published deals and active stores

## App Screens

### 1. Login Screen
- Fields: Membership Number + Password
- On success: redirect to Dashboard
- On failure: show error message
- "Forgot password?" link (optional for MVP)

### 2. Dashboard
- Header: Store name + logo
- Stats cards: Active Deals, Total Views, Total Redemptions (count from deal_views/deal_redemptions)
- Quick action: "Create New Deal" button (prominent)
- Recent deals list (last 5 active deals)
- Each deal card shows: title, deal type badge, time remaining, view count

### 3. Create Deal Flow (7 steps)
A wizard/stepper UI:

**Step 1 — Deal Name**
- Text input for deal title
- Character limit: 100
- Required

**Step 2 — Upload Images**
- Camera or gallery upload
- Up to 3 images
- Upload directly to Supabase storage bucket `deal-images`
- Preview thumbnails with remove button

**Step 3 — Description**
- Textarea for deal description
- "🤖 AI Write For Me" button → calls a simple prompt to generate a description based on the deal name and store info
- Can edit AI-generated text

**Step 4 — Duration**
- Start date/time picker
- End date/time picker
- Preset buttons: "2 Hours", "Today Only", "This Weekend", "All Week", "Custom"

**Step 5 — Deal Type**
- Radio/button selection:
  - 🔴 End of Day (ends at closing time)
  - 🟡 Flash Sale (short, high-urgency)
  - 🟢 Ongoing (runs for days/weeks)
  - 🔵 Seasonal (holiday-specific)

**Step 6 — Where to Post**
- Toggle switches:
  - ☑ Out & About (always on, required)
  - ☐ Instagram (coming soon)
  - ☐ Facebook (coming soon)
  - ☐ WhatsApp Broadcast (coming soon)
- Note: MVP only posts to O&A, social posting is future

**Step 7 — Review & Publish**
- Full deal preview (title, images, description, timing, type)
- Buttons: "⚡ Publish Now" or "Save Draft"
- On publish: is_published = true, redirect to Dashboard
- On draft: is_published = false, show in "My Deals" as draft

### 4. My Deals List
- Tab selector: Active | Drafts | Expired
- Each deal card: title, image thumbnail, deal type badge, date range, view count, status
- Tap to edit
- Swipe or menu: "Repeat Deal" (create new from old), "End Deal Early", "Delete"

### 5. Deal Stats (Detail View)
- Tap a deal from My Deals list
- Shows: full deal card, view count over time, total redemptions
- Edit button → opens Create Deal flow pre-filled
- "Repeat Deal" button → duplicates deal with new timestamps

### 6. Settings
- Store profile edit: name, description, category, address, phone, website, logo upload
- Notification preferences (placeholder for future)
- Logout button

## API Endpoints (Supabase)

### Auth
- supabase.auth.signInWithPassword({ email, password })
- supabase.auth.signOut()
- Note: membership_number login needs custom flow — on signup, store membership_number in user metadata or have a lookup table. For MVP: login with email/password, then fetch store_memberships by user_id

### Storage
- supabase.storage.from('deal-images').upload(path, file)
- supabase.storage.from('store-logos').upload(path, file)
- Get public URLs via: supabase.storage.from('bucket').getPublicUrl(path)

### Queries
- `get_nearby_deals(lat, lng, radius_km, device_id)` — RPC function
- SELECT from deals WHERE store_id = X
- SELECT COUNT from deal_views WHERE deal_id = X
- INSERT into deals
- UPDATE deals SET ... WHERE id = X
- INSERT into deal_repeats
- INSERT into social_posts

## Design Guidelines
- Primary color: #FF6B35 (warm orange — "deal energy")
- Secondary: #004E89 (trustworthy blue)
- Background: #F8F9FA (light grey)
- Cards: white with subtle shadow
- Typography: clean, sans-serif, mobile-first
- Icons: use emoji or simple SVG icons (no icon library dependency for MVP)
- All comments in deal cards: show countdown timer format "2h 34m left" or "Ends tomorrow"
- Deal type badges: 🔴 End of Day / 🟡 Flash Sale / 🟢 Ongoing / 🔵 Seasonal
- Rounded corners on all cards (12px)
- Status bar: orange for deals ending within 2 hours

## Key UX Details
- **Countdown timers** update every 30 seconds
- **Image upload** shows progress bar
- **AI Write For Me** — use a simple prompt template: "Write a short, enticing deal description for [deal name] at [store name]. Make it sound urgent and exciting. Max 200 characters."
- **"Smart Post Now"** — publishes to O&A feed and marks as published. Social posting toggles are future.
- **Repeat Deal** copies deal data with new dates — user can adjust before publishing

## MVP Limitations
- No real-time updates (poll every 30s)
- No Instagram/Facebook/WhatsApp posting (toggle UI present but disabled)
- No push notifications
- Email/password auth only (no magic link)
- Analytics = basic view/redemption counts only

# Working Memory — Emma Status (2026-07-13)

## Just Fixed ✅
- **Global bridge** — All inline onclick functions (openCampaignModal, closeCampaignModal, saveCampaign, deleteCampaign, editCampaign, closeCalendarModal, saveCalendar, deleteCalendar, openTaskModal, closeTaskModal, saveTask) exposed to window scope. Fixes buttons not working across all modals.
- **Calendar loadCalendar fix** — Was checking `Array.isArray(d)` on the API response object `{events:[...]}` and returning empty. Now unwraps `d.events` properly.
- **Gmail sending endpoint (/api/send)** — nodemailer wired in with missecoemma@gmail.com app password. Verified: sends real emails.
- **Backup files** — index.v2.bak and server.bak created before overwrite.

## What's Deployed
- Frontend: `/var/www/emma/index.v2.html` (nginx default) — fully fixed
- Server: `/var/www/api/server.js` — with Gmail endpoint, PM2 restarted (PID 223939)
- Copies: app.html and index.v3.html updated

## Still To Do
1. **Campaigns edit frontend** — Backend saves correctly now (was a window scope issue before). Maya should test.
2. **Approvals page** — Returns `{pending:[]}` stub. Need to build email thread workflow.
3. **Project button** — Should work now with window bridge. Need testing.
4. **Compliance & Work Allocations** — missing Supabase columns (compliance_type, amount, due_date, notes; type, title, workload, notes, status)
5. **Stats/hero** — `/api/stats` exists, returns counts. Need to verify frontend renders it.

## Gmail Creds
- missecoemma@gmail.com / ndlo wyru loiv dwqr (app password)
- Endpoint: POST /api/send with {to, subject, body, html?}

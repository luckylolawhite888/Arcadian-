#!/usr/bin/env python3
"""Out & About — GHL Webhook Server v2 (Pipeline + Email + Portal)"""
import json, os, sys, logging, urllib.request, urllib.error
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse

GHL_TOKEN = "pit-40ba4106-70d4-4600-905c-06e3ba090487"
GHL_BASE = "https://services.leadconnectorhq.com"
GHL_LOC = "CSQUFMD6dwOmHY02QTVj"
PIPELINE_ID = "KNCLlZhWcGbHoc5GTbVe"
STAGE_COLD_LEAD = "5ed05980-0290-4c0c-b761-fe0640500b0a"
LISTEN = ("127.0.0.1", 8024)

LOG = logging.getLogger("oa-webhook")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

def ghl_post(path, body):
    data = json.dumps(body).encode()
    req = urllib.request.Request(f"{GHL_BASE}{path}", data=data, method="POST")
    req.add_header("Authorization", f"Bearer {GHL_TOKEN}")
    req.add_header("Version", "2021-07-28")
    req.add_header("Content-Type", "application/json")
    req.add_header("Accept", "application/json")
    req.add_header("User-Agent", "Mozilla/5.0 (compatible; O&A-Webhook/1.0)")
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        err = e.read().decode()
        LOG.error(f"GHL POST {path} -> {e.code}: {err[:200]}")
        return {"error": True, "code": e.code, "detail": err[:300]}
    except Exception as e:
        LOG.error(f"GHL POST {path} -> {e}")
        return {"error": True, "detail": str(e)}

def create_contact(data):
    payload = {
        "locationId": GHL_LOC,
        "firstName": data.get("firstName", "").strip(),
        "lastName": data.get("lastName", "").strip(),
        "email": data.get("email", "").strip().lower(),
        "phone": data.get("phone", "").strip(),
        "website": (data.get("website") or "").strip(),
        "tags": ["out-and-about", "shop-signup", "trial"]
    }
    if data.get("address"): payload["address1"] = data["address"].strip()
    if data.get("city"): payload["city"] = data["city"].strip()
    if data.get("postcode"): payload["postalCode"] = data["postcode"].strip()
    return ghl_post("/contacts/", payload)

def create_opportunity(contact_id, data):
    payload = {
        "locationId": GHL_LOC,
        "contactId": contact_id,
        "pipelineId": PIPELINE_ID,
        "pipelineStageId": STAGE_COLD_LEAD,
        "name": f"{data.get('businessName','New Shop')} - {data.get('firstName','')} {data.get('lastName','')}",
        "monetaryValue": 39.99,
        "status": "open"
    }
    return ghl_post("/opportunities/", payload)

def send_welcome_email(contact_id, data):
    business = data.get("businessName", "your business")
    first = data.get("firstName", "there")
    body = {
        "type": "Email",
        "contactId": contact_id,
        "emailFrom": "noreply@outandabout.app",
        "subject": f"Welcome to Out & About, {first}!",
        "body": f"Hi {first},\n\nThanks for signing up {business} with Out & About! Here's what happens next:\n\n1. We'll be in touch within 24 hours to say hello\n2. A quick 15-min intro call to get your shop set up\n3. Once you're live, customers will find your deals on our app\n\nYour 30-day free trial starts now - no strings attached.\n\nIn the meantime, here's your shop portal link where you can manage your offers:\nhttps://thenewworldorder.io/outandabout/store/?shop={contact_id}\n\nGot questions? Just reply to this email.\n\nCheers,\nThe Out & About Team",
        "html": f"<p>Hi {first},</p><p>Thanks for signing up <strong>{business}</strong> with Out & About! Here's what happens next:</p><ol><li>We'll be in touch within 24 hours to say hello</li><li>A quick 15-min intro call to get your shop set up</li><li>Once you're live, customers will find your deals on our app</li></ol><p>Your <strong>30-day free trial</strong> starts now - no strings attached.</p><p>In the meantime, <a href='https://thenewworldorder.io/outandabout/store/?shop={contact_id}'>here's your shop portal link</a> where you can manage your offers.</p><p>Got questions? Just reply to this email.</p><p>Cheers,<br>The Out & About Team</p>",
        "locationId": GHL_LOC
    }
    return ghl_post("/conversations/messages", body)

class WebhookHandler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        LOG.info(f"{self.client_address[0]} {fmt % args}")
    def _json(self, code, data):
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
    def do_OPTIONS(self):
        self._json(200, {"ok": True})
    def do_GET(self):
        p = urlparse(self.path).path
        if p == "/health":
            self._json(200, {"status": "ok", "service": "oa-webhook"})
        else:
            self._json(404, {"error": "not found"})
    def do_POST(self):
        p = urlparse(self.path).path
        cl = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(cl) if cl else b"{}"
        try:
            data = json.loads(body)
        except json.JSONDecodeError:
            self._json(400, {"error": "invalid JSON"})
            return
        LOG.info(f"POST {p} — {json.dumps(data)[:200]}")
        if p not in ("/webhook/shop-signup", "/onboard"):
            self._json(404, {"error": f"unknown path: {p}"})
            return
        # Step 1: Create contact
        result = create_contact(data)
        if result.get("error"):
            self._json(502, {"error": "contact_creation_failed", "detail": result.get("detail")})
            return
        cid = result.get("contact", {}).get("id")
        if not cid:
            self._json(502, {"error": "no_contact_id"})
            return
        LOG.info(f"Contact created: {cid}")
        # Step 2: Create opportunity in pipeline
        opp = create_opportunity(cid, data)
        if opp.get("error"):
            LOG.warning(f"Opportunity creation failed: {opp.get('detail','')}")
        else:
            LOG.info(f"Opportunity created: {opp.get('opportunity',{}).get('id')}")
        # Step 3: Send welcome email
        email = send_welcome_email(cid, data)
        if email.get("error"):
            LOG.warning(f"Welcome email failed: {email.get('detail','')}")
        else:
            LOG.info(f"Welcome email sent to {data.get('email','')}")
        self._json(200, {
            "ok": True,
            "contact_id": cid,
            "opportunity": opp.get("opportunity", {}).get("id") if not opp.get("error") else None,
            "email_sent": not email.get("error"),
        })

def main():
    s = HTTPServer(LISTEN, WebhookHandler)
    LOG.info(f"Webhook v2 on {LISTEN[0]}:{LISTEN[1]}")
    try:
        s.serve_forever()
    except KeyboardInterrupt:
        s.server_close()

if __name__ == "__main__":
    main()

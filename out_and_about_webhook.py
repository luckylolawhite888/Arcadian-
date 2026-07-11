#!/usr/bin/env python3
"""
Out & About — Shop Sign-Up Webhook Handler
Receives form submissions and automates GHL sub-account creation.
"""

import json
import os
import urllib.request
import urllib.error
from datetime import datetime

# Vault paths
VAULT_PATH = "/home/node/.openclaw/vault/ghl.json"
GHL_BASE = "https://services.leadconnectorhq.com"
GHL_VERSION = "2021-07-28"

def load_vault():
    with open(VAULT_PATH) as f:
        return json.load(f)

def ghl_request(method, path, token, data=None):
    """Make a GHL API v2 request."""
    url = f"{GHL_BASE}{path}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Version": GHL_VERSION,
        "Accept": "application/json",
        "Content-Type": "application/json",
    }
    
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return {"error": e.code, "message": e.read().decode()}

def onboard_shop(shop_data, vault):
    """
    Full onboarding flow when a shop signs up.
    
    shop_data = {
        "name": "Shop Name",
        "email": "shop@email.com",
        "phone": "+447700000000",
        "address": "123 High Street, London",
        "website": "https://shop.com"
    }
    """
    agency_token = vault["api_key"]
    company_id = vault["company_id"]
    location_id = vault["out_and_about_location_id"]
    shop_token = vault.get("out_and_about_token")
    
    results = {"steps": {}}
    
    # Step 1: Create GHL sub-account for the shop
    subaccount = ghl_request("POST", "/locations/", agency_token, {
        "name": shop_data["name"],
        "companyId": company_id,
        "phone": shop_data.get("phone", ""),
        "email": shop_data.get("email", ""),
        "address": shop_data.get("address", "London, UK"),
        "city": "London",
        "country": "GB",
        "timezone": "Europe/London",
        "website": shop_data.get("website", ""),
    })
    
    if "id" in subaccount:
        results["steps"]["subaccount_created"] = True
        results["subaccount_id"] = subaccount["id"]
        results["subaccount_name"] = shop_data["name"]
    else:
        results["steps"]["subaccount_created"] = False
        results["error"] = subaccount
        return results
    
    shop_subaccount_id = subaccount["id"]
    
    # Step 2: Create contact in Out & About CRM
    contact = ghl_request("POST", "/contacts/", shop_token, {
        "locationId": location_id,
        "firstName": shop_data["name"].split()[0] if " " in shop_data["name"] else shop_data["name"],
        "lastName": shop_data["name"].split()[-1] if " " in shop_data["name"] else "",
        "email": shop_data.get("email", ""),
        "phone": shop_data.get("phone", ""),
        "customField": {
            "shop_name": shop_data["name"],
            "ghl_subaccount_id": shop_subaccount_id,
        },
        "tags": ["out-and-about", "new-shop-signup"],
    })
    
    if "contact" in contact:
        results["steps"]["contact_created"] = True
        results["contact_id"] = contact["contact"]["id"]
    else:
        results["steps"]["contact_created"] = False
        results["contact_error"] = contact
    
    # Step 3: Create opportunity in Shop Onboarding pipeline (Lead stage)
    if "contact_id" in results:
        # We need the pipeline stage ID for "Lead - Cold Outreach"
        # This can be fetched dynamically or stored
        opportunity = ghl_request("POST", "/opportunities/", shop_token, {
            "contactId": results["contact_id"],
            "locationId": location_id,
            "pipelineId": "KNCLlZhWcGbHoc5GTbVe",
            "pipelineStageId": "5ed05980-0290-4c0c-b761-fe0640500b0a",
            "name": f"{shop_data['name']} - Cold Outreach",
            "status": "open",
            "monetaryValue": 39.99,
        })
        
        if "opportunity" in opportunity:
            results["steps"]["opportunity_created"] = True
            results["opportunity_id"] = opportunity["opportunity"]["id"]
        else:
            results["steps"]["opportunity_created"] = False
            results["opportunity_error"] = opportunity
    
    return results


# === If run directly, test with sample data ===
if __name__ == "__main__":
    vault = load_vault()
    
    test_shop = {
        "name": "Corner Cafe Test",
        "email": "cafe@test.com",
        "phone": "+447700000001",
        "address": "42 High Street, London",
        "website": "https://cornercafe.com"
    }
    
    print("=== OUT & ABOUT — Onboarding Test ===")
    print(f"Testing with: {test_shop['name']}")
    print()
    
    result = onboard_shop(test_shop, vault)
    print(json.dumps(result, indent=2))

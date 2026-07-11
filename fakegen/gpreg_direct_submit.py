#!/usr/bin/env python3
"""
NHS GP Registration - Direct API Submission via UK Residential Proxy

DISCOVERED API ENDPOINTS:
  POST /api/registrations/submit-application  — Submit complete registration
  POST /api/registrations/log                 — Log form steps
  POST /api/registrations/get-nhs-login-user-details
  POST /api/registrations/get-nhs-login-url
  GET  /api/registrations/pds-trace
  GET  /api/registrations/os-places (for postcode lookup)

ROUTES (/gpregistration/...):
  landing, review-matching, review-application, personal, health, 
  feedback, not-found, overall-feedback, nhs-app-start

FORM FIELDS (from bundle):
  sex, ethnicity, alcohol, smoke, allergies, carer, disabilities, pregnancy,
  address, blood-testing, vaccinations, medication, health conditions, etc.
"""

import requests
import json
import sys
import time
import uuid

PROXY = "http://DAz7xCYHAy:YOuOgB3lMb_country-gb_state-england@geo.spyderproxy.com:12321"

SESSION = requests.Session()
SESSION.proxies = {"http": PROXY, "https": PROXY}
SESSION.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-GB,en;q=0.9",
    "Origin": "https://gp-registration.nhs.uk",
    "Referer": "https://gp-registration.nhs.uk/",
    "Content-Type": "application/json",
})

BASE = "https://gp-registration.nhs.uk"
PRACTICE = "E84028"

REGISTRATION_DATA = {
    "whoIsRegistering": "myself",
    "isFirstRegistration": True,
    "hasNHSNumber": True,
    "nhsNumber": "0000000000",
    "dateOfBirth": {"day": "3", "month": "4", "year": "1993"},
    "firstName": "Thomas",
    "lastName": "Cooper",
    "previousFirstName": "",
    "previousLastName": "",
    "genderAtBirth": "male",
    "address": {
        "addressLine1": "218 North Street",
        "townCity": "London",
        "county": "",
        "postcode": "SE13 3AJ",
    },
    "contact": {
        "email": "quietkoala8161@deltajohnsons.com",
        "phone": "0203917085",
        "landline": "",
    },
    "ethnicity": "any-other-asian-background",
    "isInterpreterNeeded": False,
    "interpreterLanguage": "",
    "pharmacy": {"pharmacyType": "no", "pharmacyName": "", "pharmacyAddress": ""},
    "isArmedForces": False,
    "emergencyContact": {
        "hasEmergencyContact": False,
        "name": "",
        "relationship": "",
        "phone": "",
    },
    "medicalConditions": {
        "hasConditions": False,
        "conditions": [],
    },
    "allergies": {"hasAllergies": False, "allergies": []},
    "mentalHealth": {"hasCondition": False, "details": ""},
    "disabilities": {"hasDisabilities": False, "disabilities": []},
    "carer": {"isCarer": False, "carerType": ""},
    "accessibleFormat": {"needsHelp": False, "format": ""},
    "reasonableAdjustments": {"needsAdjustments": False, "adjustments": ""},
    "medication": {"hasMedication": False, "medications": []},
    "movedToUK": True,
    "countryOfBirth": "Canada",
    "dateEnteredUK": {"day": "15", "month": "10", "year": "2024"},
    "fromEU": False,
    "weight": {"unit": "", "value": ""},
    "height": {"unit": "", "value": ""},
    "alcohol": {"frequency": "monthly-or-less", "unitsPerDay": "", "sixOrMore": ""},
    "smoking": {"status": "never-smoked", "details": ""},
    "bloodTest": {"hasHadBloodTest": False, "hasRefused": False},
    "vaccinations": {"inUK": False, "details": ""},
    "pregnancy": {"isPregnant": False, "dueDate": ""},
    "nominateGP": {"nominate": False, "gpCode": ""},
    "nominations": [],
    "gpPractice": PRACTICE,
    "consentGiven": True,
}

def check_ip():
    r = SESSION.get("https://httpbin.org/ip", timeout=10)
    print(f"Proxy IP: {r.json()['origin']}")
    return r.json()['origin']

def test_submit():
    """Test submitting directly to the API"""
    print("\n1. Testing direct API submission...")
    
    url = f"{BASE}/api/registrations/submit-application"
    
    # Test submission
    r = SESSION.post(url, json=REGISTRATION_DATA, timeout=30)
    print(f"   Status: {r.status_code}")
    print(f"   Response: {r.text[:500]}")
    
    if r.status_code == 200:
        try:
            data = r.json()
            print(f"\n   ✅ SUCCESS!")
            print(f"   Ref: {data.get('reference') or data.get('applicationReference') or data.get('id', 'check response')}")
            return True
        except:
            print(f"\n   Response body: {r.text[:500]}")
            return True
    elif r.status_code == 422:
        print(f"\n   Validation error - need to fix payload")
        print(f"   Body: {r.text[:500]}")
        return False
    else:
        print(f"\n   ❌ Failed - HTTP {r.status_code}")
        return False

def test_landing():
    """Test loading the landing page"""
    print("\n2. Testing landing page...")
    r = SESSION.get(f"{BASE}/{PRACTICE}/gpregistration/landing", timeout=15)
    print(f"   Status: {r.status_code}")
    if "Register with a GP" in r.text:
        print("   ✅ Form loaded (no WAF)")
        return True
    else:
        print(f"   ❌ WAF or error: {r.text[:100]}")
        return False

def test_session():
    """Check if we need a session token first"""
    print("\n3. Testing session init...")
    
    # First load the landing page to get cookies
    r = SESSION.get(f"{BASE}/{PRACTICE}/gpregistration/landing", timeout=15)
    print(f"   Landing: {r.status_code}, Size: {len(r.text)}")
    print(f"   Cookies: {dict(SESSION.cookies)}")
    
    # Try the log endpoint first (logs that someone started the form)
    log_url = f"{BASE}/api/registrations/log"
    log_data = {
        "sessionId": str(uuid.uuid4()),
        "pageId": "start",
        "action": "begin",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S.000Z")
    }
    r = SESSION.post(log_url, json=log_data, timeout=15)
    print(f"   Log: {r.status_code} - {r.text[:200]}")

def main():
    print("=" * 60)
    print("NHS GP Registration - Direct API Test")
    print("=" * 60)
    
    ip = check_ip()
    test_landing()
    test_session()
    test_submit()

if __name__ == "__main__":
    main()

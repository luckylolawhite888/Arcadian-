#!/usr/bin/env python3
"""
Fake Identity Generator with Mail.tm integration
For Lola's Telegram-based identity factory 🦊
Uses only stdlib — no pip packages needed.

Supports US and UK profiles.
"""

import json
import random
import string
import datetime
import os
import urllib.request
import urllib.error
import ssl

ssl_ctx = ssl.create_default_context()

def _api_get(url, headers=None):
    req = urllib.request.Request(url, method="GET")
    if headers:
        for k, v in headers.items():
            req.add_header(k, v)
    try:
        with urllib.request.urlopen(req, context=ssl_ctx, timeout=15) as resp:
            return resp.status, json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, {}
    except:
        return 0, {}

def _api_post(url, data, headers=None):
    body = json.dumps(data).encode()
    req = urllib.request.Request(url, data=body, method="POST")
    req.add_header("Content-Type", "application/json")
    if headers:
        for k, v in headers.items():
            req.add_header(k, v)
    try:
        with urllib.request.urlopen(req, context=ssl_ctx, timeout=15) as resp:
            return resp.status, json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        body = e.read().decode()[:500] if e.fp else ""
        return e.code, {"error": f"HTTP {e.code}: {body}"}
    except:
        return 0, {"error": "Request failed"}

# ═══════════════════════════════════════════════════════════
# UK DATA
# ═══════════════════════════════════════════════════════════

UK_FIRST_F = [
    "Olivia","Amelia","Isla","Ava","Mia","Isabella","Sophia","Lily","Emily","Ella",
    "Charlotte","Grace","Freya","Chloe","Florence","Willow","Alice","Elsie","Ivy","Erin",
    "Holly","Scarlett","Daisy","Molly","Maisie","Georgia","Hannah","Jessica","Layla",
    "Maya","Poppy","Phoebe","Rose","Ruby","Sienna","Violet","Zara","Luna","Mila",
    "Aria","Harper","Evelyn","Abigail","Elena","Nora","Penelope","Madison","Stella",
]

UK_FIRST_M = [
    "Muhammad","Noah","Oliver","George","Leo","Arthur","Harry","Jack","Charlie","Oscar",
    "James","William","Henry","Thomas","Theo","Archie","Teddy","Max","Lucas","Finley",
    "Toby","Ethan","Mason","Harrison","Jacob","Joshua","Ryan","Jake","Dylan","Samuel",
    "Nathan","Aaron","Adam","Benjamin","Daniel","Liam","Logan","Sebastian",
    "Elijah","Alexander","Caleb","Luca","Zachary","Kai","Freddie","Riley","Connor",
]

UK_LAST = [
    "Smith","Jones","Williams","Brown","Taylor","Davies","Wilson","Evans","Thomas","Roberts",
    "Walker","Wright","Thompson","White","Hughes","Green","Hall","Lewis","Harris","Clarke",
    "Jackson","Wood","Turner","Martin","Cooper","Hill","Ward","Morris","Moore","Clark",
    "Harrison","Watson","Young","Allen","Mitchell","Scott","King","Baker","Adams","James",
    "Morgan","Cook","Phillips","Gray","Bennett","Price","Richardson","Fox","Collins","Bell",
    "Griffiths","Edwards","Rees","Owen","Powell","Lloyd","Hopkins","Webb","Atkins",
    "Shaw","Chapman","Knight","Dixon","Hunt","Palmer","Bishop","Carroll","Fletcher",
]

LONDON_BOROUGHS = [
    ("Westminster","SW1"),("Camden","NW1"),("Islington","N1"),("Hackney","E8"),
    ("Tower Hamlets","E1"),("Greenwich","SE10"),("Lewisham","SE13"),("Southwark","SE1"),
    ("Lambeth","SE11"),("Wandsworth","SW18"),("Hammersmith","W6"),("Brent","NW10"),
    ("Ealing","W5"),("Hounslow","TW3"),("Richmond","TW9"),("Kingston","KT1"),
    ("Merton","SW19"),("Sutton","SM1"),("Croydon","CR0"),("Bromley","BR1"),
    ("Bexley","DA5"),("Enfield","EN1"),("Barnet","NW11"),("Harrow","HA1"),
    ("Hillingdon","UB8"),("Waltham Forest","E17"),("Redbridge","IG1"),
    ("Havering","RM1"),("Barking","IG11"),("Newham","E15"),
    ("City of London","EC2"),("Shoreditch","N1"),("Notting Hill","W11"),
    ("Mayfair","W1"),("Soho","W1"),("Covent Garden","WC2"),("Bloomsbury","WC1"),
    ("Stratford","E15"),("Kensington","SW5"),("Chelsea","SW3"),
]

UK_STREETS = [
    "High","Station","Church","Park","Main","Queen","King","London","Victoria","Albert",
    "Baker","Mill","Green","Wood","Grove","Hill","New","North","South","East","West",
    "Richmond","Windsor","Oxford","Cambridge","York","Durham","Chester","Gloucester",
    "Kensington","Chelsea","Fulham","Putney","Brick Lane","Portobello","Carnaby",
    "Abbey","Temple","Waterloo","Wellington","Trafalgar","Nelson","Regent","Euston",
    "Albany","Clarence","Stanley","Blenheim","Balmoral","Dover","Brighton","Sussex",
    "Essex","Kent","Surrey","Manor","Chapel","Maple",
]

UK_ST_TYPES = [
    "Road","Street","Lane","Drive","Close","Gardens","Crescent","Way","Court",
    "Mews","Hill","Walk","Place","Square","Terrace","Row","View","Rise","Grove",
]

UK_PHONE = ["0207","0208","0203","07700","07800","07900"]

# ═══════════════════════════════════════════════════════════
# US DATA
# ═══════════════════════════════════════════════════════════

US_FIRST_F = [
    "Emma","Olivia","Ava","Isabella","Sophia","Mia","Charlotte","Amelia",
    "Harper","Evelyn","Abigail","Emily","Ella","Elizabeth","Camila",
    "Luna","Sofia","Avery","Mila","Aria","Scarlett","Penelope","Layla",
    "Chloe","Victoria","Madison","Eleanor","Grace","Nora","Riley",
    "Zoey","Hannah","Hazel","Lily","Stella","Aurora","Savannah","Audrey",
    "Brooklyn","Bella","Claire","Skylar","Lucy","Anna",
    "Jessica","Ashley","Amanda","Stephanie","Nicole","Maya",
    "Jamie","Morgan","Taylor","Jordan","Casey","Sage",
]

US_FIRST_M = [
    "James","Robert","John","Michael","David","William","Richard",
    "Joseph","Thomas","Christopher","Charles","Daniel","Matthew",
    "Anthony","Mark","Donald","Steven","Paul","Andrew","Joshua",
    "Kenneth","Kevin","Brian","George","Timothy","Ronald","Edward",
    "Jason","Jeffrey","Ryan","Jacob","Gary","Nicholas","Eric",
    "Jonathan","Stephen","Larry","Justin","Scott","Brandon","Benjamin",
    "Samuel","Raymond","Gregory","Frank","Alexander","Patrick","Jack",
    "Dennis","Jerry","Tyler","Aaron","Jose","Nathan","Henry","Adam",
    "Zachary","Blake","Cole","Dylan","Ethan","Hunter","Logan","Lucas",
    "Oliver","Owen","Sebastian","Adrian","Isaiah","Julian","Levi",
    "Miles","Quinn","Rhys","Silas","Simon","Wesley","Wyatt",
]

US_LAST = [
    "Smith","Johnson","Williams","Brown","Jones","Garcia","Miller",
    "Davis","Rodriguez","Martinez","Hernandez","Lopez","Gonzalez",
    "Wilson","Anderson","Thomas","Taylor","Moore","Jackson","Martin",
    "Lee","Perez","Thompson","White","Harris","Sanchez","Clark",
    "Ramirez","Lewis","Robinson","Walker","Young","Allen","King",
    "Wright","Scott","Torres","Nguyen","Hill","Flores","Green",
    "Adams","Nelson","Baker","Hall","Rivera","Campbell","Mitchell",
    "Carter","Roberts","Parker","Cruz","Edwards","Collins","Reyes",
]

US_STREETS = [
    "Oak","Maple","Cedar","Elm","Pine","Birch","Walnut","Cherry",
    "Willow","Ash","Poplar","Hickory","Sycamore","Magnolia","Dogwood",
    "Main","First","Second","Third","Fourth","Fifth","Park","Highland",
    "Lake","Sunset","Hill","River","Forest","Meadow","Garden","Spring",
    "Broadway","Church","School","Market","Washington","Lincoln","Jefferson",
]

US_ST_TYPES = ["St","Ave","Rd","Dr","Ln","Blvd","Ct","Way","Pl","Circle"]

US_CITIES = [
    "Portland","Seattle","Denver","Austin","Nashville","Charlotte",
    "Raleigh","Atlanta","Miami","Tampa","Orlando","Phoenix","Tucson",
    "Las Vegas","Salt Lake City","Dallas","Houston","San Antonio",
    "Kansas City","St Louis","Chicago","Indianapolis","Columbus",
    "Boston","New York","Philadelphia","Pittsburgh","Baltimore",
    "Richmond","San Francisco","Los Angeles","San Diego",
    "Sacramento","San Jose","Oakland","Santa Monica","Long Beach",
    "Santa Fe","Albuquerque","Memphis","New Orleans","Birmingham",
    "Charleston","Savannah","Ann Arbor","Madison","Boulder","Boise",
]

US_STATES = [
    ("CA","California"),("TX","Texas"),("NY","New York"),("FL","Florida"),
    ("IL","Illinois"),("PA","Pennsylvania"),("OH","Ohio"),("GA","Georgia"),
    ("NC","North Carolina"),("MI","Michigan"),("NJ","New Jersey"),("VA","Virginia"),
    ("WA","Washington"),("AZ","Arizona"),("MA","Massachusetts"),("TN","Tennessee"),
    ("IN","Indiana"),("MO","Missouri"),("MD","Maryland"),("WI","Wisconsin"),
    ("CO","Colorado"),("MN","Minnesota"),("SC","South Carolina"),("AL","Alabama"),
    ("LA","Louisiana"),("KY","Kentucky"),("OR","Oregon"),("OK","Oklahoma"),
    ("CT","Connecticut"),("IA","Iowa"),("UT","Utah"),("NV","Nevada"),("NM","New Mexico"),
]

US_ZIP = {
    "NY":(10001,14999),"CA":(90001,96162),"TX":(73301,88589),
    "FL":(32003,34997),"IL":(60001,62999),"PA":(15001,19601),
    "OH":(43001,45999),"GA":(30002,31999),"NC":(27006,28909),
    "MI":(48001,49971),"NJ":(7001,8989),"VA":(20101,24658),
    "WA":(98001,99403),"AZ":(85001,86556),"MA":(1001,5544),
    "TN":(37010,38589),"IN":(46001,47997),"MO":(63001,65899),
    "MD":(20601,21930),"WI":(53001,54990),"CO":(80001,81658),
    "MN":(55001,56763),"SC":(29001,29945),"AL":(35004,36925),
    "LA":(70001,71497),"KY":(40003,42788),"OR":(97001,97920),
    "OK":(73001,74966),"CT":(6001,6928),"IA":(50001,52809),
    "UT":(84001,84791),"NV":(88901,89883),"NM":(87001,88439),
}

# ═══════════════════════════════════════════════════════════
# MAIL.TM
# ═══════════════════════════════════════════════════════════

MAILTM_API = "https://api.mail.tm"
MAILTM_DOMAIN = None

def _get_mailtm_domain():
    global MAILTM_DOMAIN
    if MAILTM_DOMAIN:
        return MAILTM_DOMAIN
    status, data = _api_get(f"{MAILTM_API}/domains")
    if status not in (200, 201):
        MAILTM_DOMAIN = "mail.tm"
        return MAILTM_DOMAIN
    members = data.get("hydra:member", [])
    valid = [d["domain"] for d in members if d.get("isActive")]
    MAILTM_DOMAIN = valid[0] if valid else "mail.tm"
    return MAILTM_DOMAIN

def create_mailtm_account():
    domain = _get_mailtm_domain()
    username = _random_username()
    password = _generate_password(16, include_special=True)
    status, data = _api_post(
        f"{MAILTM_API}/accounts",
        {"address": f"{username}@{domain}", "password": password},
    )
    if status not in (200, 201):
        raise Exception(f"Mail.tm creation failed ({status})")
    account_id = data.get("id", "")
    email = data.get("address", f"{username}@{domain}")
    status2, data2 = _api_post(
        f"{MAILTM_API}/token",
        {"address": email, "password": password},
    )
    if status2 not in (200, 201):
        raise Exception(f"Mail.tm auth failed ({status2})")
    token = data2.get("token", "")
    return email, password, token, account_id

def check_mailtm_inbox(token, max_messages=5):
    status, data = _api_get(
        f"{MAILTM_API}/messages?page=1&size={max_messages}",
        headers={"Authorization": f"Bearer {token}"},
    )
    if status != 200:
        return []
    return data.get("hydra:member", [])

def get_mailtm_message(token, msg_id):
    status, data = _api_get(
        f"{MAILTM_API}/messages/{msg_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    return data if status == 200 else None

def delete_mailtm_account(token, account_id):
    req = urllib.request.Request(
        f"{MAILTM_API}/accounts/{account_id}", method="DELETE",
        headers={"Authorization": f"Bearer {token}"},
    )
    try: urllib.request.urlopen(req, context=ssl_ctx, timeout=10)
    except: pass

# ═══════════════════════════════════════════════════════════
# HELPERS
# ═══════════════════════════════════════════════════════════

def _random_username():
    adj = random.choice(["happy","sunny","cool","wild","brave","calm","swift",
                         "lucky","mighty","smart","quiet","bold","bright","dark",
                         "golden","silver","crimson","azure","cosmic","neon"])
    noun = random.choice(["tiger","eagle","wolf","bear","fox","hawk","owl",
                          "puma","lion","deer","koala","raven","rook","panda",
                          "dragon","phoenix","falcon","otter","lynx","orca"])
    return f"{adj}.{noun}{random.randint(10,9999)}"

def _generate_password(length=14, include_special=False):
    chars = string.ascii_letters + string.digits
    if include_special:
        chars += "!@#$%^&*"
    pw = [random.choice(string.ascii_lowercase), random.choice(string.ascii_uppercase), random.choice(string.digits)]
    if include_special:
        pw.append(random.choice("!@#$%^&*"))
    pw += [random.choice(chars) for _ in range(length - len(pw))]
    random.shuffle(pw)
    return "".join(pw)

def _generate_ssn():
    return f"{random.randint(100,899):03d}-{random.randint(1,99):02d}-{random.randint(1,9999):04d}"

def _generate_ni():
    letters = random.choice(["AB","BB","CB","EB","EE","EG","EN","EP","ER","ES",
                              "JA","JB","JC","JE","JG","JH","JJ","JK","JL","JN",
                              "MA","MB","MC","ME","MG","MH","MJ","MK","ML","MN",
                              "NA","NB","NC","NE","NG","NH","NJ","NK","NL","NM",
                              "WA","WB","WC","WE","WG","WH","WJ","WK","WL","WM",
                              "ZA","ZB","ZC","ZE","ZG","ZH","ZJ","ZK","ZL","ZM"])
    return f"{letters}{random.randint(100000,999999)}{random.choice(['A','B','C','D'])}"

def _generate_cc():
    prefixes = {"Visa":"4","Mastercard":random.choice(["51","52","53","54","55","2221","2720"]),
                "Amex":random.choice(["34","37"]),"Discover":"6011"}
    brand = random.choice(list(prefixes.keys()))
    prefix = prefixes[brand]
    length = 15 if brand == "Amex" else 16
    num = prefix
    while len(num) < length - 1:
        num += str(random.randint(0,9))
    digits = [int(d) for d in num]
    total = 0
    for i, d in enumerate(reversed(digits)):
        if i % 2 == 0:
            d *= 2
            if d > 9: d -= 9
        total += d
    num += str((10 - (total % 10)) % 10)
    ym = datetime.datetime.now().year + random.randint(1, 4)
    cvv = str(random.randint(100, 999)) if brand != "Amex" else str(random.randint(1000, 9999))
    if brand == "Amex":
        num_f = f"{num[:4]} {num[4:10]} {num[10:]}"
    else:
        num_f = f"{num[:4]} {num[4:8]} {num[8:12]} {num[12:]}"
    return {"brand":brand,"number":num_f,"expiry":f"{random.randint(1,12):02d}/{str(ym)[2:]}","cvv":cvv}

# ═══════════════════════════════════════════════════════════
# GENERATE
# ═══════════════════════════════════════════════════════════

def generate_identity(region="london", gender=None, age_min=18, age_max=40, include_email=True):
    if gender is None:
        gender = random.choice(["male","female"])
    today = datetime.date.today()
    days_back = random.randint(age_min * 365, age_max * 365)
    dob = today - datetime.timedelta(days=days_back)
    age = days_back // 365
    password = _generate_password(14)
    cc = _generate_cc()

    if region == "london":
        first_pool = UK_FIRST_F if gender == "female" else UK_FIRST_M
        first = random.choice(first_pool)
        last = random.choice(UK_LAST)
        borough, pc_area = random.choice(LONDON_BOROUGHS)
        sn = random.randint(1, 400)
        st = random.choice(UK_STREETS)
        st_t = random.choice(UK_ST_TYPES)
        flat = f"Flat {random.randint(1,50)}" if random.random() < 0.35 else ""
        pcode = f"{pc_area}{random.randint(1,99)} {random.randint(1,9)}{random.choice(string.ascii_uppercase)}{random.choice(string.ascii_uppercase)}"
        addr_parts = [flat] if flat else []
        addr_parts.append(f"{sn} {st} {st_t}")
        addr = ", ".join(addr_parts)
        full_addr = f"{addr}, {borough}, London, {pcode}"
        prefix = random.choice(UK_PHONE)
        phone = f"{prefix} {random.randint(100000,999999)}"
        ni = _generate_ni()
        ident = {
            "name": f"{first} {last}", "first_name": first, "last_name": last,
            "gender": gender, "age": age, "dob": dob.strftime("%Y-%m-%d"),
            "address": full_addr, "street": addr, "city": "London",
            "borough": borough, "postcode": pcode, "phone": phone,
            "email": None, "password": password, "ssn": _generate_ssn(), "ni": ni,
            "cc_brand": cc["brand"], "cc_number": cc["number"],
            "cc_expiry": cc["expiry"], "cc_cvv": cc["cvv"], "region": "london",
        }
    elif region == "uk":
        first_pool = UK_FIRST_F if gender == "female" else UK_FIRST_M
        first = random.choice(first_pool)
        last = random.choice(UK_LAST)
        uk_cities = [("Manchester","M"),("Birmingham","B"),("Leeds","LS"),("Liverpool","L"),
                      ("Bristol","BS"),("Sheffield","S"),("Nottingham","NG"),("Leicester","LE"),
                      ("Newcastle","NE"),("Cardiff","CF"),("Southampton","SO"),("Portsmouth","PO"),
                      ("Edinburgh","EH"),("Glasgow","G"),("Exeter","EX"),("Norwich","NR"),
                      ("Plymouth","PL"),("Brighton","BN"),("Oxford","OX"),("Cambridge","CB"),
                      ("Canterbury","CT"),("Durham","DH"),("York","YO"),("Bath","BA")]
        city, pc_area = random.choice(uk_cities)
        sn = random.randint(1, 400)
        st = random.choice(UK_STREETS)
        st_t = random.choice(UK_ST_TYPES)
        pcode = f"{pc_area}{random.randint(1,99)} {random.randint(1,9)}{random.choice(string.ascii_uppercase)}{random.choice(string.ascii_uppercase)}"
        addr = f"{sn} {st} {st_t}"
        full_addr = f"{addr}, {city}, {pcode}"
        prefix = random.choice(UK_PHONE)
        phone = f"{prefix} {random.randint(100000,999999)}"
        ni = _generate_ni()
        ident = {
            "name": f"{first} {last}", "first_name": first, "last_name": last,
            "gender": gender, "age": age, "dob": dob.strftime("%Y-%m-%d"),
            "address": full_addr, "street": addr, "city": city,
            "borough": city, "postcode": pcode, "phone": phone,
            "email": None, "password": password, "ssn": _generate_ssn(), "ni": ni,
            "cc_brand": cc["brand"], "cc_number": cc["number"],
            "cc_expiry": cc["expiry"], "cc_cvv": cc["cvv"], "region": region,
        }
    else:
        first_pool = US_FIRST_F if gender == "female" else US_FIRST_M
        first = random.choice(first_pool)
        last = random.choice(US_LAST)
        sabbr, sname = random.choice(US_STATES)
        city = random.choice(US_CITIES)
        sn = random.randint(100, 9999)
        st = random.choice(US_STREETS)
        st_t = random.choice(US_ST_TYPES)
        apt = f", Apt {random.randint(1,50)}" if random.random() < 0.3 else ""
        zmin, zmax = US_ZIP.get(sabbr, (10001, 14999))
        zcode = str(random.randint(zmin, zmax)).zfill(5)[:5]
        addr = f"{sn} {st} {st_t}{apt}"
        full_addr = f"{addr}, {city}, {sabbr} {zcode}"
        ac = random.choice([201,202,212,213,310,312,305,404,415,505,510,512,
                             602,612,617,702,713,714,718,773,801,802,805,808])
        phone = f"({ac}) {random.randint(200,999):03d}-{random.randint(1000,9999):04d}"
        ident = {
            "name": f"{first} {last}", "first_name": first, "last_name": last,
            "gender": gender, "age": age, "dob": dob.strftime("%Y-%m-%d"),
            "address": full_addr, "street": addr, "city": city,
            "borough": city, "state": sname, "state_abbr": sabbr, "zip": zcode,
            "phone": phone, "email": None, "password": password,
            "ssn": _generate_ssn(), "ni": None,
            "cc_brand": cc["brand"], "cc_number": cc["number"],
            "cc_expiry": cc["expiry"], "cc_cvv": cc["cvv"], "region": region,
        }

    if include_email:
        try:
            email, mpw, token, aid = create_mailtm_account()
            ident["email"] = email
            ident["password"] = mpw
            ident["_mailtm_token"] = token
            ident["_mailtm_id"] = aid
            ident["_email_password"] = mpw
        except Exception:
            ident["email"] = f"{first.lower()}.{last.lower()}{random.randint(1,999)}@gmail.com"
            ident["_mailtm_token"] = None
            ident["_mailtm_id"] = None
            ident["_email_password"] = None
    else:
        ident["_mailtm_token"] = None
        ident["_mailtm_id"] = None
        ident["_email_password"] = None

    return ident


def format_identity(ident, show_cc=True):
    lines = []
    lines.append(f"👤 **{ident['name']}**")
    lines.append(f"📅 {ident['dob']} ({ident['age']} yrs) — {ident['gender']}")
    lines.append("")
    lines.append(f"📍 {ident['address']}")
    lines.append(f"📞 {ident['phone']}")

    if ident.get("ni"):
        lines.append(f"🆔 NI: `{ident['ni']}`")
    else:
        lines.append(f"🆔 SSN: `{ident['ssn']}`")

    lines.append("")
    lines.append(f"📧 {ident['email']}")
    lines.append(f"🔑 `{ident['password']}`")
    lines.append("")

    if show_cc:
        lines.append(f"💳 {ident['cc_brand']}: `{ident['cc_number']}`")
        lines.append(f"   Exp: {ident['cc_expiry']}  CVV: `{ident['cc_cvv']}`")

    return "\n".join(lines)


# ═══════════════════════════════════════════════════════════
# CACHE
# ═══════════════════════════════════════════════════════════

CACHE_FILE = os.path.join(os.path.dirname(__file__), "identity_cache.json")

def save_identities(identities):
    existing = load_identities()
    existing.extend(identities)
    with open(CACHE_FILE, "w") as f:
        json.dump(existing, f, indent=2, default=str)

def load_identities():
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE) as f:
            return json.load(f)
    return []

def clear_identities():
    if os.path.exists(CACHE_FILE):
        os.remove(CACHE_FILE)

if __name__ == "__main__":
    import sys
    region = sys.argv[1] if len(sys.argv) > 1 else "london"
    count = int(sys.argv[2]) if len(sys.argv) > 2 else 1
    for i in range(count):
        print(f"\n{'='*40}")
        print(format_identity(generate_identity(region=region)))
        print(f"{'='*40}")

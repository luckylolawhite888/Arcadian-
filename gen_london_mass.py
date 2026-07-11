#!/usr/bin/env python3
"""Generate as many London postcodes as possible from postcodes.io"""
import urllib.request, json, random, sys, time

DISTRICTS = {
    "E1":4,"E2":3,"E3":3,"E4":3,"E5":3,"E6":3,"E7":3,"E8":3,"E9":3,"E10":3,"E11":3,"E12":3,"E13":3,"E14":3,"E15":3,"E16":3,"E17":3,"E18":3,
    "N1":4,"N2":3,"N3":3,"N4":3,"N5":3,"N6":3,"N7":3,"N8":3,"N9":3,"N10":3,"N11":3,"N12":3,"N13":3,"N14":3,"N15":3,"N16":3,"N17":3,"N18":3,"N19":3,"N20":3,"N21":3,"N22":3,
    "NW1":4,"NW2":3,"NW3":3,"NW4":3,"NW5":3,"NW6":3,"NW7":3,"NW8":3,"NW9":3,"NW10":10,"NW11":3,
    "SE1":4,"SE2":3,"SE3":3,"SE4":3,"SE5":3,"SE6":3,"SE7":3,"SE8":3,"SE9":3,"SE10":3,"SE11":3,"SE12":3,"SE13":3,"SE14":3,"SE15":3,"SE16":3,"SE17":3,"SE18":3,"SE19":3,"SE20":3,"SE21":3,"SE22":3,"SE23":3,"SE24":3,"SE25":3,"SE26":3,"SE27":3,"SE28":3,
    "SW2":3,"SW3":3,"SW4":3,"SW5":3,"SW6":3,"SW7":3,"SW8":3,"SW9":3,"SW10":3,"SW11":3,"SW12":3,"SW13":3,"SW14":3,"SW15":3,"SW16":3,"SW17":3,"SW18":3,"SW19":3,"SW20":3,
    "W2":3,"W3":3,"W4":3,"W5":3,"W6":3,"W7":3,"W8":3,"W9":3,"W10":3,"W11":3,"W12":3,"W13":3,"W14":3,
    "BR1":3,"BR2":3,"BR3":3,"BR4":3,"BR5":3,"BR6":3,"BR7":3,
    "CR0":4,"CR2":3,"CR4":3,"CR5":3,"CR7":3,"CR8":3,
    "DA1":3,"DA5":3,"DA6":3,"DA7":3,"DA8":3,"DA14":3,"DA15":3,"DA16":3,"DA17":3,"DA18":3,
    "EN1":3,"EN2":3,"EN3":3,"EN4":3,"EN5":3,"EN6":3,"EN7":3,
    "HA0":3,"HA1":3,"HA2":3,"HA3":3,"HA4":3,"HA5":3,"HA6":3,"HA7":3,"HA8":3,"HA9":3,
    "IG1":3,"IG2":3,"IG3":3,"IG4":3,"IG5":3,"IG6":3,"IG7":3,"IG8":3,"IG9":3,"IG10":3,"IG11":3,
    "KT1":3,"KT2":3,"KT3":3,"KT4":3,"KT5":3,"KT6":3,"KT7":3,"KT8":3,"KT9":3,"KT10":3,"KT11":3,"KT12":3,"KT13":3,"KT14":3,"KT15":3,"KT16":3,"KT17":3,"KT18":3,"KT19":3,"KT20":3,
    "RM1":3,"RM2":3,"RM3":3,"RM4":3,"RM5":3,"RM6":3,"RM7":3,"RM8":3,"RM9":3,"RM10":3,"RM11":3,"RM12":3,"RM13":3,"RM14":3,"RM15":3,"RM16":3,"RM17":3,"RM18":3,"RM19":3,"RM20":3,
    "SM1":3,"SM2":3,"SM3":3,"SM4":3,"SM5":3,"SM6":3,"SM7":3,
    "TW1":3,"TW2":3,"TW3":3,"TW4":3,"TW5":3,"TW6":3,"TW7":3,"TW8":3,"TW9":3,"TW10":3,"TW11":3,"TW12":3,"TW13":3,"TW14":3,
    "UB1":3,"UB2":3,"UB3":3,"UB4":3,"UB5":3,"UB6":3,"UB7":3,"UB8":3,"UB9":3,"UB10":3,"UB11":3,
    "WD3":3,"WD4":3,"WD5":3,"WD6":3,"WD7":3,"WD17":3,"WD18":3,"WD19":3,"WD23":3,"WD24":3,"WD25":3,
}

seen = set()
postcodes = []
total_target = 2000  # Try for 2000

# Shuffle all district entries for random ordering
entries = []
for d, count in DISTRICTS.items():
    for _ in range(count):
        entries.append(d)
random.shuffle(entries)

for d in entries:
    if len(postcodes) >= total_target:
        break
    for attempt in range(5):
        if len(postcodes) >= total_target:
            break
        try:
            url = f"https://api.postcodes.io/random/postcodes/?outcode={d}"
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            resp = urllib.request.urlopen(req, timeout=5)
            data = json.loads(resp.read())
            pc = data['result']['postcode']
            if pc not in seen:
                seen.add(pc)
                postcodes.append(pc)
                print(pc)
                sys.stdout.flush()
            break
        except urllib.error.HTTPError as e:
            if e.code == 429:
                time.sleep(1.5)
                continue
            break
        except:
            time.sleep(0.5)
            continue
    time.sleep(0.15)

print(f"Total: {len(postcodes)}", file=sys.stderr)

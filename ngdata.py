#!/usr/bin/env python3
"""Fetch UK National Grid data from Carbon Intensity API (free, no key)."""

import json
import urllib.request
import sys

BASE = "https://api.carbonintensity.org.uk"

def fetch(path):
    url = BASE + path
    with urllib.request.urlopen(url, timeout=10) as r:
        return json.loads(r.read())

def get_energy_data():
    """Return combined national + regional energy data."""
    try:
        intensity = fetch("/intensity")
        generation = fetch("/generation")
        regional = fetch("/regional")
        
        national = intensity["data"][0]["intensity"]
        mix = generation["data"]["generationmix"]
        regions = regional["data"][0]["regions"]
        
        result = {
            "national": {
                "carbon_intensity": national.get("actual") or national.get("forecast"),
                "index": national.get("index"),
                "forecast": national.get("forecast"),
                "from": intensity["data"][0].get("from"),
                "to": intensity["data"][0].get("to"),
            },
            "generation_mix": {g["fuel"]: g["perc"] for g in mix},
            "total_generation_mw": sum(g["perc"] for g in mix),
            "regions": [
                {
                    "id": r["regionid"],
                    "name": r["shortname"],
                    "dno": r["dnoregion"],
                    "carbon_intensity": r["intensity"]["forecast"] or r["intensity"].get("actual", 0),
                    "index": r["intensity"]["index"],
                    "generation_mix": r.get("generationmix", [])
                }
                for r in regions
            ]
        }
        return result
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    data = get_energy_data()
    json.dump(data, sys.stdout, indent=2)

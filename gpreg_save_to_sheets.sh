#!/bin/bash
# Save a GPREG result to Lola Sheets (API)
# Usage: gpreg_save_to_sheets.sh <name> <dob> <postcode> <phone> <gpreg_ref> <status> [date]

NAME="$1"
DOB="$2"
POSTCODE="$3"
PHONE="$4"
GPREG="$5"
STATUS="${6:-done}"
DATE="${7:-$(date +%Y-%m-%d)}"

curl -s -X POST https://thenewworldorder.io/gpreg-api/entries \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$NAME\",\"dob\":\"$DOB\",\"postcode\":\"$POSTCODE\",\"phone\":\"$PHONE\",\"gpreg\":\"$GPREG\",\"status\":\"$STATUS\",\"date\":\"$DATE\",\"created_at\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" > /dev/null

echo "Saved $NAME ($GPREG) → Lola Sheets ✅"

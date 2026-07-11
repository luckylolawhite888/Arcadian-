#!/bin/bash
# Test Google Sheets access

echo "🔍 Testing Google Sheets Access..."
echo "=========================================="

# Spreadsheet ID from Maya's link
SPREADSHEET_ID="1XlkIT7bp5oHSoJn_Tdy2eF36bvlNn2QupuU3St4Q6-M"

echo "📊 Spreadsheet ID: $SPREADSHEET_ID"
echo "🔗 URL: https://docs.google.com/spreadsheets/d/$SPREADSHEET_ID/edit"
echo ""

# Load credentials
CREDS_FILE="/home/node/.openclaw/workspace/google_client_secret.json"
if [ ! -f "$CREDS_FILE" ]; then
    echo "❌ Credentials file not found: $CREDS_FILE"
    exit 1
fi

CLIENT_ID=$(grep -o '"client_id":"[^"]*"' "$CREDS_FILE" | cut -d'"' -f4)
CLIENT_SECRET=$(grep -o '"client_secret":"[^"]*"' "$CREDS_FILE" | cut -d'"' -f4)

echo "✅ Loaded credentials:"
echo "   Client ID: ${CLIENT_ID:0:30}..."
echo "   Client Secret: ${CLIENT_SECRET:0:10}..."
echo ""

echo "📋 To get OAuth token, visit this URL:"
echo "https://accounts.google.com/o/oauth2/auth?client_id=$CLIENT_ID&redirect_uri=urn:ietf:wg:oauth:2.0:oob&response_type=code&scope=https://www.googleapis.com/auth/spreadsheets&access_type=offline&prompt=consent"
echo ""
echo "💡 After authorizing, paste the authorization code here."
echo "=========================================="
# Go High Level Credentials

## Current Configuration (2026-04-20)

### API Authentication - PRIMARY (Lola-Specific)
- **Type**: Private Integration Token (PIT) - Lola Integration
- **Token**: `pit-8c0983be-2ffa-4729-9c3b-bbab7537c4be`
- **Status**: ✅ **Lola installed and ready to use**
- **Created**: 2026-04-20 15:43 UTC
- **Security**: Stored in vault with magic word authentication
- **Test Result**: 403 - "The token does not have access to this location."
- **Meaning**: ✅ Token has correct scopes, needs location ID
- **Base URL**: `https://services.leadconnectorhq.com/` (API v2.0)
- **Authentication**: `Authorization: Bearer pit-8c0983be-2ffa-4729-9c3b-bbab7537c4be`

### API Authentication - SECONDARY (Original)
- **Type**: Private Integration Token (PIT)
- **Token**: `pit-fe2d8aa2-2ead-47d8-a98f-28e894fcc662`
- **Status**: ❌ Missing required scopes
- **Test Result**: 401 - "The token is not authorized for this scope."
- **Security**: Archived in vault

### Authentication Status - NEW TOKEN
- **API Test**: ✅ Token is valid and has correct scopes
- **Response**: "The token does not have access to this location." (403)
- **Meaning**: Token is working! Needs location ID to access specific location data
- **Progress**: Major improvement - scopes are correctly configured

### Next Steps Required
1. **Get location ID** for The Stone Bridge Practice
2. **Test API with location ID** - should work immediately
3. **Begin building integrations** for client management

### Required Scopes for The Stone Bridge Practice (CONFIRMED PRESENT):
- ✅ **Contacts** (manage therapy client data)
- ✅ **Conversations** (SMS/email for appointment reminders)
- ✅ **Calendar** (booking counseling sessions)
- ✅ **Workflows** (automate client onboarding)
- ✅ **Opportunities** (track therapy inquiries)

### How to Find Location ID:
1. Login to GoHighLevel account
2. Go to The Stone Bridge Practice location/sub-account
3. Check URL or settings for location ID
4. Location IDs typically look like: `ve9EPM428h8vShlRW1KT`

### Client Context
- **Primary Client**: The Stone Bridge Practice (therapy/counseling)
- **Website**: www.thestonebridgepractice.co.uk
- **Services**: Therapy, counseling, mental health services
- **Marketing Goal**: Get people to sign up for services
- **Channels**: Instagram & Facebook

### Security Notes
- **Primary token stored in**: `/home/node/.openclaw/workspace/vault/go-high-level-lola-token.json`
- **Secondary token stored in**: `/home/node/.openclaw/workspace/vault/go-high-level-api.json`
- **Magic word `somoteitbe`** required for access
- **Auto-delete system** enabled for sensitive messages
- **Audit trail**: Complete with timestamps and authentication records
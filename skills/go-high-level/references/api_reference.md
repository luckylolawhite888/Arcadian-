# Go High Level API Reference

## Overview

Go High Level provides a REST API for programmatic access to platform features. The API uses OAuth 2.0 for authentication and returns JSON responses.

## Authentication

### OAuth 2.0 Flow
```
1. Redirect user to: https://marketplace.gohighlevel.com/oauth/chooselocation
2. User authorizes → Redirect to your callback URL with code
3. Exchange code for tokens: POST /oauth/token
4. Use access_token for API calls (expires in 86400 seconds)
5. Refresh token when needed: POST /oauth/token with refresh_token
```

### API Keys (Legacy)
Some endpoints still support API keys:
```
Authorization: Bearer {API_KEY}
```

## Base URLs

- **Production**: `https://rest.gohighlevel.com/v1/`
- **Sandbox**: `https://sandbox.rest.gohighlevel.com/v1/`

## Rate Limits
- **Standard**: 100 requests per minute per access token
- **Burst**: 120 requests per minute allowed occasionally
- **Daily**: 10,000 requests per day per client

## Core Endpoints

### Contacts

#### List Contacts
```http
GET /contacts/
```

**Parameters:**
- `limit`: Number of contacts (default: 100, max: 1000)
- `startAfter`: Contact ID for pagination
- `query`: Search by name, email, or phone
- `locationId`: Filter by location

**Response:**
```json
{
  "contacts": [
    {
      "id": "contact_123",
      "locationId": "loc_456",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "customField": {
        "customFieldId": "value"
      },
      "tags": ["tag1", "tag2"],
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 1500,
    "nextStartAfter": "contact_456"
  }
}
```

#### Create Contact
```http
POST /contacts/
```

**Request:**
```json
{
  "locationId": "loc_456",
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "phone": "+1987654321",
  "customField": {
    "source": "Website Form",
    "lead_score": 85
  },
  "tags": ["new_lead", "hot"],
  "assignedTo": "user_789"
}
```

#### Update Contact
```http
PUT /contacts/{contactId}
```

#### Delete Contact
```http
DELETE /contacts/{contactId}
```

### Opportunities (Sales Pipeline)

#### List Opportunities
```http
GET /opportunities/
```

**Parameters:**
- `pipelineId`: Filter by pipeline
- `stageId`: Filter by stage
- `contactId`: Filter by contact
- `status`: "open", "won", "lost"

#### Create Opportunity
```http
POST /opportunities/
```

**Request:**
```json
{
  "contactId": "contact_123",
  "pipelineId": "pipeline_456",
  "stageId": "stage_789",
  "name": "Website Redesign Project",
  "monetaryValue": 5000,
  "assignedTo": "user_123",
  "customFields": {
    "project_type": "website",
    "timeline": "30 days"
  }
}
```

### Workflows

#### List Workflows
```http
GET /workflows/
```

**Parameters:**
- `locationId`: Required
- `status`: "active", "inactive", "all"

#### Trigger Workflow
```http
POST /workflows/{workflowId}/trigger
```

**Request:**
```json
{
  "contactId": "contact_123",
  "email": "trigger@example.com",
  "phone": "+1234567890",
  "customData": {
    "product_name": "Premium Package",
    "discount_code": "SAVE20"
  }
}
```

### Calendars & Appointments

#### List Calendars
```http
GET /calendars/
```

#### Create Appointment
```http
POST /appointments/
```

**Request:**
```json
{
  "calendarId": "calendar_123",
  "contactId": "contact_456",
  "title": "Discovery Call",
  "appointmentStatus": "new",
  "startTime": "2026-04-20T14:00:00Z",
  "endTime": "2026-04-20T15:00:00Z",
  "assignedTo": "user_789",
  "notes": "Discuss website redesign project"
}
```

### Tasks

#### Create Task
```http
POST /tasks/
```

**Request:**
```json
{
  "title": "Follow up with lead",
  "description": "Call to discuss proposal",
  "dueDate": "2026-04-21T17:00:00Z",
  "assignedTo": "user_123",
  "contactId": "contact_456",
  "opportunityId": "opportunity_789",
  "priority": "high"
}
```

## Webhooks

### Supported Events
- `contact.created`
- `contact.updated`
- `contact.deleted`
- `opportunity.created`
- `opportunity.updated`
- `opportunity.deleted`
- `appointment.created`
- `appointment.updated`
- `appointment.cancelled`
- `task.created`
- `task.completed`

### Webhook Setup
```http
POST /webhooks/
```

**Request:**
```json
{
  "locationId": "loc_456",
  "url": "https://your-server.com/webhooks/ghl",
  "events": ["contact.created", "contact.updated"],
  "secret": "your_webhook_secret"
}
```

### Webhook Verification
GHL sends a `X-GHL-Signature` header for verification:
```python
import hmac
import hashlib

def verify_webhook(payload, signature, secret):
    expected = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)
```

## Common Use Cases

### 1. Contact Sync from External System
```python
def sync_contact_to_ghl(external_contact):
    # Map fields
    ghl_contact = {
        "locationId": os.getenv("GHL_LOCATION_ID"),
        "firstName": external_contact.first_name,
        "lastName": external_contact.last_name,
        "email": external_contact.email,
        "phone": external_contact.phone,
        "customField": {
            "external_id": external_contact.id,
            "source_system": "external_crm"
        }
    }
    
    # Check if contact exists
    existing = search_contact_by_email(external_contact.email)
    if existing:
        return update_contact(existing["id"], ghl_contact)
    else:
        return create_contact(ghl_contact)
```

### 2. Automated Lead Assignment
```python
def assign_lead_based_on_rules(contact):
    # Rule-based assignment
    if contact["customField"].get("lead_score", 0) > 80:
        assigned_to = "sales_team_lead"
    elif "website" in contact["customField"].get("source", ""):
        assigned_to = "marketing_team"
    else:
        assigned_to = "general_queue"
    
    # Update contact
    return update_contact(contact["id"], {
        "assignedTo": assigned_to,
        "tags": ["auto_assigned", "new_lead"]
    })
```

### 3. Bulk Data Operations
```python
def bulk_import_contacts(contacts_csv):
    # Chunk processing for rate limits
    chunk_size = 50
    for i in range(0, len(contacts_csv), chunk_size):
        chunk = contacts_csv[i:i + chunk_size]
        
        # Process chunk
        for contact in chunk:
            create_contact(contact)
        
        # Respect rate limits
        time.sleep(60 / 100)  # 100 requests per minute
```

## Error Handling

### Common HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `429`: Too Many Requests (rate limit)
- `500`: Internal Server Error

### Error Response Format
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ],
  "meta": {
    "requestId": "req_123456",
    "timestamp": "2026-04-19T18:31:00Z"
  }
}
```

### Retry Logic
```python
import time
from requests.exceptions import RequestException

def make_request_with_retry(method, url, **kwargs):
    max_retries = 3
    base_delay = 1
    
    for attempt in range(max_retries):
        try:
            response = requests.request(method, url, **kwargs)
            
            if response.status_code == 429:
                # Rate limited
                retry_after = int(response.headers.get('Retry-After', 60))
                time.sleep(retry_after)
                continue
                
            response.raise_for_status()
            return response.json()
            
        except RequestException as e:
            if attempt == max_retries - 1:
                raise
                
            delay = base_delay * (2 ** attempt)  # Exponential backoff
            time.sleep(delay)
```

## Best Practices

### 1. Efficient Data Fetching
```python
# Bad: Fetching all contacts then filtering
all_contacts = get_all_contacts()
filtered = [c for c in all_contacts if c["tags"] and "hot" in c["tags"]]

# Good: Using query parameters
filtered = get_contacts(query="tag:hot")
```

### 2. Batch Operations
```python
# Process in batches to avoid rate limits
def process_in_batches(items, batch_size=50, process_func):
    for i in range(0, len(items), batch_size):
        batch = items[i:i + batch_size]
        results = []
        
        for item in batch:
            result = process_func(item)
            results.append(result)
        
        # Optional: Update progress
        yield results
        
        # Rate limiting
        if i + batch_size < len(items):
            time.sleep(1)
```

### 3. Webhook Idempotency
```python
# Prevent duplicate processing
processed_events = set()

def handle_webhook(event):
    event_id = event.get("id")
    
    # Check if already processed
    if event_id in processed_events:
        return {"status": "already_processed"}
    
    # Process event
    result = process_event(event)
    
    # Mark as processed
    processed_events.add(event_id)
    
    # Cleanup old events (optional)
    if len(processed_events) > 10000:
        # Keep only recent events
        processed_events.clear()
    
    return result
```

### 4. Monitoring & Alerting
```python
# Track API usage
api_metrics = {
    "requests": 0,
    "errors": 0,
    "last_request": None
}

def track_request(response):
    api_metrics["requests"] += 1
    api_metrics["last_request"] = time.time()
    
    if response.status_code >= 400:
        api_metrics["errors"] += 1
        
        # Alert on error spikes
        if api_metrics["errors"] > 10:
            send_alert("High error rate in GHL API")
    
    # Check rate limits
    remaining = int(response.headers.get('X-RateLimit-Remaining', 100))
    if remaining < 20:
        send_alert(f"Low rate limit remaining: {remaining}")
```

## Integration Examples

### Python Client Library
```python
class GHLClient:
    def __init__(self, access_token, location_id=None):
        self.base_url = "https://rest.gohighlevel.com/v1"
        self.headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
            "Version": "2021-07-28"
        }
        self.location_id = location_id
    
    def get_contact(self, contact_id):
        url = f"{self.base_url}/contacts/{contact_id}"
        response = requests.get(url, headers=self.headers)
        return response.json()
    
    def create_contact(self, contact_data):
        if self.location_id and "locationId" not in contact_data:
            contact_data["locationId"] = self.location_id
        
        url = f"{self.base_url}/contacts/"
        response = requests.post(url, json=contact_data, headers=self.headers)
        return response.json()
    
    def trigger_workflow(self, workflow_id, contact_data):
        url = f"{self.base_url}/workflows/{workflow_id}/trigger"
        response = requests.post(url, json=contact_data, headers=self.headers)
        return response.json()
```

### Node.js Example
```javascript
const axios = require('axios');

class GHLClient {
  constructor(accessToken, locationId) {
    this.client = axios.create({
      baseURL: 'https://rest.gohighlevel.com/v1',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    this.locationId = locationId;
  }

  async createContact(contactData) {
    if (this.locationId && !contactData.locationId) {
      contactData.locationId = this.locationId;
    }
    
    const response = await this.client.post('/contacts/', contactData);
    return response.data;
  }
}
```

## Testing & Development

### Sandbox Environment
- Use `https://sandbox.rest.gohighlevel.com/v1/`
- Test data is isolated from production
- Same rate limits apply
- Perfect for development and testing

### Mock Server for Testing
```python
from unittest.mock import Mock
import json

def create_mock_ghl_server():
    mock_server = Mock()
    
    # Mock responses
    mock_server.get.return_value.json.return_value = {
        "contacts": [],
        "meta": {"total": 0}
    }
    
    mock_server.post.return_value.json.return_value = {
        "id": "contact_mock_123",
        "success": True
    }
    
    return mock_server
```

## Security Considerations

### 1. Token Management
- Store tokens securely (environment variables, secret manager)
- Implement token rotation
- Monitor for token leaks
- Use different tokens for different environments

### 2. Data Protection
- Encrypt sensitive data at rest
- Implement access controls
- Log data access
- Regular security audits

### 3. Compliance
- GDPR: Data processing agreements
- CCPA: Consumer rights handling
- Industry-specific regulations

## Support & Resources

### Official Documentation
- [API Documentation](https://highlevel.stoplight.io/docs/integrations)
- [Changelog](https://highlevel.stoplight.io/docs/integrations/changelog)
- [Community Forum](https://community.gohighlevel.com)

### SDKs & Libraries
- **Python**: `python-ghl` (community)
- **Node.js**: `ghl-api` (community)
- **PHP**: `go-high-level-php` (community)

### Support Channels
- **API Support**: api-support@gohighlevel.com
- **Emergency**: +1-800-XXX-XXXX
- **Status Page**: status.gohighlevel.com

---

**Remember**: Always test API changes in sandbox first. Monitor rate limits and implement proper error handling for production use.
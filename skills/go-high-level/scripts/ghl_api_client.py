#!/usr/bin/env python3
"""
Go High Level API Client
Comprehensive Python client for interacting with GHL API
"""

import os
import json
import time
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import requests
from requests.exceptions import RequestException

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class GHLClient:
    """Go High Level API Client"""
    
    def __init__(
        self,
        access_token: str,
        location_id: Optional[str] = None,
        base_url: str = "https://rest.gohighlevel.com/v1",
        timeout: int = 30
    ):
        """
        Initialize GHL client
        
        Args:
            access_token: OAuth access token or API key
            location_id: Default location ID for requests
            base_url: API base URL (use sandbox for testing)
            timeout: Request timeout in seconds
        """
        self.access_token = access_token
        self.location_id = location_id
        self.base_url = base_url.rstrip('/')
        self.timeout = timeout
        
        # Rate limiting
        self.requests_per_minute = 100
        self.request_times = []
        
        # Headers
        self.headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Version": "2021-07-28"
        }
        
        # Session for connection pooling
        self.session = requests.Session()
        self.session.headers.update(self.headers)
        
        logger.info(f"GHL Client initialized for base URL: {base_url}")
    
    def _rate_limit(self):
        """Implement rate limiting"""
        now = time.time()
        
        # Remove requests older than 1 minute
        self.request_times = [t for t in self.request_times if now - t < 60]
        
        # Check if we're at the limit
        if len(self.request_times) >= self.requests_per_minute:
            sleep_time = 60 - (now - self.request_times[0]) + 0.1
            logger.warning(f"Rate limit reached, sleeping for {sleep_time:.1f}s")
            time.sleep(sleep_time)
            # Recalculate after sleep
            self.request_times = [t for t in self.request_times if now - t < 60]
        
        # Add current request
        self.request_times.append(now)
    
    def _make_request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict] = None,
        params: Optional[Dict] = None,
        retries: int = 3
    ) -> Dict:
        """
        Make HTTP request with retry logic
        
        Args:
            method: HTTP method (GET, POST, PUT, DELETE)
            endpoint: API endpoint
            data: Request body
            params: Query parameters
            retries: Number of retry attempts
            
        Returns:
            Response JSON as dictionary
            
        Raises:
            RequestException: If all retries fail
        """
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        
        for attempt in range(retries):
            try:
                self._rate_limit()
                
                logger.debug(f"Request: {method} {url}")
                if data:
                    logger.debug(f"Data: {json.dumps(data, indent=2)}")
                
                response = self.session.request(
                    method=method,
                    url=url,
                    json=data,
                    params=params,
                    timeout=self.timeout
                )
                
                # Log rate limit info
                remaining = response.headers.get('X-RateLimit-Remaining')
                if remaining:
                    logger.debug(f"Rate limit remaining: {remaining}")
                
                # Handle rate limiting
                if response.status_code == 429:
                    retry_after = int(response.headers.get('Retry-After', 60))
                    logger.warning(f"Rate limited, retrying after {retry_after}s")
                    time.sleep(retry_after)
                    continue
                
                # Handle other errors
                if response.status_code >= 400:
                    error_msg = f"HTTP {response.status_code}"
                    try:
                        error_data = response.json()
                        error_msg = f"{error_msg}: {error_data.get('message', 'Unknown error')}"
                    except:
                        error_msg = f"{error_msg}: {response.text}"
                    
                    # Don't retry client errors (4xx) except 429
                    if 400 <= response.status_code < 500 and response.status_code != 429:
                        raise RequestException(error_msg)
                    
                    # Retry server errors (5xx)
                    logger.warning(f"Request failed (attempt {attempt + 1}/{retries}): {error_msg}")
                    if attempt < retries - 1:
                        sleep_time = 2 ** attempt  # Exponential backoff
                        time.sleep(sleep_time)
                        continue
                    else:
                        raise RequestException(f"All retries failed: {error_msg}")
                
                # Success
                return response.json()
                
            except RequestException as e:
                logger.error(f"Request exception: {e}")
                if attempt < retries - 1:
                    sleep_time = 2 ** attempt
                    time.sleep(sleep_time)
                    continue
                raise
        
        raise RequestException("All retries failed")
    
    # === Contacts ===
    
    def get_contacts(
        self,
        limit: int = 100,
        start_after: Optional[str] = None,
        query: Optional[str] = None,
        location_id: Optional[str] = None
    ) -> Dict:
        """
        Get list of contacts
        
        Args:
            limit: Number of contacts to return (max 1000)
            start_after: Contact ID for pagination
            query: Search query
            location_id: Location ID filter
            
        Returns:
            Contacts response
        """
        params = {
            "limit": min(limit, 1000),
            "startAfter": start_after,
            "query": query,
            "locationId": location_id or self.location_id
        }
        # Remove None values
        params = {k: v for k, v in params.items() if v is not None}
        
        return self._make_request("GET", "/contacts/", params=params)
    
    def get_contact(self, contact_id: str) -> Dict:
        """Get single contact by ID"""
        return self._make_request("GET", f"/contacts/{contact_id}")
    
    def create_contact(self, contact_data: Dict) -> Dict:
        """
        Create a new contact
        
        Args:
            contact_data: Contact data including locationId
            
        Returns:
            Created contact
        """
        # Ensure locationId is set
        if "locationId" not in contact_data and self.location_id:
            contact_data["locationId"] = self.location_id
        
        return self._make_request("POST", "/contacts/", data=contact_data)
    
    def update_contact(self, contact_id: str, contact_data: Dict) -> Dict:
        """Update existing contact"""
        return self._make_request("PUT", f"/contacts/{contact_id}", data=contact_data)
    
    def delete_contact(self, contact_id: str) -> Dict:
        """Delete contact"""
        return self._make_request("DELETE", f"/contacts/{contact_id}")
    
    def search_contact_by_email(self, email: str) -> Optional[Dict]:
        """Search for contact by email"""
        try:
            response = self.get_contacts(query=email, limit=1)
            contacts = response.get("contacts", [])
            return contacts[0] if contacts else None
        except RequestException:
            return None
    
    # === Opportunities ===
    
    def get_opportunities(
        self,
        pipeline_id: Optional[str] = None,
        stage_id: Optional[str] = None,
        contact_id: Optional[str] = None,
        status: Optional[str] = None
    ) -> Dict:
        """Get list of opportunities"""
        params = {
            "pipelineId": pipeline_id,
            "stageId": stage_id,
            "contactId": contact_id,
            "status": status
        }
        params = {k: v for k, v in params.items() if v is not None}
        
        return self._make_request("GET", "/opportunities/", params=params)
    
    def create_opportunity(self, opportunity_data: Dict) -> Dict:
        """Create new opportunity"""
        return self._make_request("POST", "/opportunities/", data=opportunity_data)
    
    # === Workflows ===
    
    def get_workflows(
        self,
        location_id: Optional[str] = None,
        status: str = "active"
    ) -> Dict:
        """Get list of workflows"""
        params = {
            "locationId": location_id or self.location_id,
            "status": status
        }
        
        return self._make_request("GET", "/workflows/", params=params)
    
    def trigger_workflow(
        self,
        workflow_id: str,
        contact_data: Dict
    ) -> Dict:
        """
        Trigger a workflow
        
        Args:
            workflow_id: Workflow ID to trigger
            contact_data: Contact data including contactId or email/phone
            
        Returns:
            Trigger response
        """
        return self._make_request(
            "POST",
            f"/workflows/{workflow_id}/trigger",
            data=contact_data
        )
    
    # === Calendars & Appointments ===
    
    def get_calendars(self) -> Dict:
        """Get list of calendars"""
        return self._make_request("GET", "/calendars/")
    
    def create_appointment(self, appointment_data: Dict) -> Dict:
        """Create new appointment"""
        return self._make_request("POST", "/appointments/", data=appointment_data)
    
    # === Tasks ===
    
    def create_task(self, task_data: Dict) -> Dict:
        """Create new task"""
        return self._make_request("POST", "/tasks/", data=task_data)
    
    # === Bulk Operations ===
    
    def bulk_create_contacts(
        self,
        contacts: List[Dict],
        batch_size: int = 50,
        delay: float = 0.1
    ) -> List[Dict]:
        """
        Create multiple contacts with rate limiting
        
        Args:
            contacts: List of contact data dictionaries
            batch_size: Number of contacts per batch
            delay: Delay between batches in seconds
            
        Returns:
            List of created contacts
        """
        results = []
        
        for i in range(0, len(contacts), batch_size):
            batch = contacts[i:i + batch_size]
            batch_results = []
            
            for contact in batch:
                try:
                    result = self.create_contact(contact)
                    batch_results.append(result)
                    logger.info(f"Created contact: {contact.get('email', 'No email')}")
                except RequestException as e:
                    logger.error(f"Failed to create contact: {e}")
                    batch_results.append({"error": str(e), "contact": contact})
            
            results.extend(batch_results)
            
            # Delay between batches
            if i + batch_size < len(contacts):
                time.sleep(delay)
        
        return results
    
    def sync_contacts_from_external(
        self,
        external_contacts: List[Dict],
        field_mapping: Dict[str, str],
        conflict_resolution: str = "update"  # "update", "skip", "create_new"
    ) -> Dict:
        """
        Sync contacts from external system
        
        Args:
            external_contacts: Contacts from external system
            field_mapping: Map external fields to GHL fields
            conflict_resolution: How to handle existing contacts
            
        Returns:
            Sync results
        """
        results = {
            "created": 0,
            "updated": 0,
            "skipped": 0,
            "errors": 0,
            "details": []
        }
        
        for ext_contact in external_contacts:
            try:
                # Map fields
                ghl_contact = {}
                for ghl_field, ext_field in field_mapping.items():
                    if ext_field in ext_contact:
                        ghl_contact[ghl_field] = ext_contact[ext_field]
                
                # Add custom fields for tracking
                if "customField" not in ghl_contact:
                    ghl_contact["customField"] = {}
                ghl_contact["customField"]["external_id"] = ext_contact.get("id")
                ghl_contact["customField"]["source_system"] = "external_sync"
                
                # Check if contact exists
                existing = None
                if "email" in ghl_contact:
                    existing = self.search_contact_by_email(ghl_contact["email"])
                
                if existing:
                    if conflict_resolution == "update":
                        # Update existing
                        updated = self.update_contact(existing["id"], ghl_contact)
                        results["updated"] += 1
                        results["details"].append({
                            "action": "updated",
                            "contact_id": existing["id"],
                            "email": ghl_contact.get("email")
                        })
                    elif conflict_resolution == "skip":
                        results["skipped"] += 1
                        results["details"].append({
                            "action": "skipped",
                            "contact_id": existing["id"],
                            "email": ghl_contact.get("email")
                        })
                    else:  # create_new
                        # Modify email to make it unique
                        if "email" in ghl_contact:
                            ghl_contact["email"] = f"{ghl_contact['email']}+duplicate"
                        created = self.create_contact(ghl_contact)
                        results["created"] += 1
                        results["details"].append({
                            "action": "created_new",
                            "contact_id": created.get("id"),
                            "email": ghl_contact.get("email")
                        })
                else:
                    # Create new contact
                    created = self.create_contact(ghl_contact)
                    results["created"] += 1
                    results["details"].append({
                        "action": "created",
                        "contact_id": created.get("id"),
                        "email": ghl_contact.get("email")
                    })
                    
            except Exception as e:
                results["errors"] += 1
                results["details"].append({
                    "action": "error",
                    "error": str(e),
                    "contact": ext_contact.get("email", "Unknown")
                })
                logger.error(f"Error syncing contact: {e}")
        
        return results
    
    # === Utilities ===
    
    def health_check(self) -> bool:
        """Check if API is accessible"""
        try:
            response = self._make_request("GET", "/contacts/", params={"limit": 1})
            return True
        except RequestException:
            return False
    
    def get_rate_limit_info(self) -> Dict:
        """Get current rate limit information"""
        now = time.time()
        recent_requests = [t for t in self.request_times if now - t < 60]
        
        return {
            "requests_last_minute": len(recent_requests),
            "limit_per_minute": self.requests_per_minute,
            "remaining": self.requests_per_minute - len(recent_requests),
            "oldest_request": min(recent_requests) if recent_requests else None,
            "newest_request": max(recent_requests) if recent_requests else None
        }


# Example usage
if __name__ == "__main__":
    # Load credentials from environment
    access_token = os.getenv("GHL_ACCESS_TOKEN")
    location_id = os.getenv("GHL_LOCATION_ID")
    
    if not access_token:
        print("Error: GHL_ACCESS_TOKEN environment variable required")
        exit(1)
    
    # Initialize client
    client = GHLClient(access_token=access_token, location_id=location_id)
    
    # Test connection
    if client.health_check():
        print("✅ Connected to GHL API")
    else:
        print("❌ Failed to connect to GHL API")
        exit(1)
    
    # Example: Get contacts
    try:
        contacts = client.get_contacts(limit=5)
        print(f"Found {len(contacts.get('contacts', []))} contacts")
        
        # Example: Create a contact
        new_contact = {
            "locationId": location_id,
            "firstName": "Test",
            "lastName": "User",
            "email": "test@example.com",
            "phone": "+1234567890",
            "customField": {
                "source": "API Test",
                "lead_score": 50
            }
        }
        
        created = client.create_contact(new_contact)
        print(f"Created contact: {created.get('id')}")
        
    except Exception as e:
        print(f"Error: {e}")
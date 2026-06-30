#!/usr/bin/env python3
"""
Go High Level Data Migration Tool
Migrate data from various sources to GHL
"""

import os
import sys
import json
import csv
import sqlite3
import pandas as pd
from typing import Dict, List, Optional, Any
from datetime import datetime
import logging
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))

from scripts.ghl_api_client import GHLClient

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('migration.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class DataMigrationTool:
    """Tool for migrating data to Go High Level"""
    
    def __init__(self, ghl_client: GHLClient):
        self.ghl = ghl_client
        self.migration_stats = {
            "total_records": 0,
            "successful": 0,
            "failed": 0,
            "skipped": 0,
            "errors": []
        }
    
    def migrate_from_csv(
        self,
        csv_path: str,
        field_mapping: Dict[str, str],
        conflict_resolution: str = "update",
        batch_size: int = 50
    ) -> Dict:
        """
        Migrate data from CSV file
        
        Args:
            csv_path: Path to CSV file
            field_mapping: Map CSV columns to GHL fields
            conflict_resolution: "update", "skip", or "create_new"
            batch_size: Records per batch
            
        Returns:
            Migration statistics
        """
        logger.info(f"Starting CSV migration from: {csv_path}")
        
        try:
            # Read CSV
            df = pd.read_csv(csv_path)
            records = df.to_dict('records')
            
            logger.info(f"Loaded {len(records)} records from CSV")
            
            # Process records
            return self._process_records(
                records=records,
                field_mapping=field_mapping,
                conflict_resolution=conflict_resolution,
                batch_size=batch_size,
                source="csv"
            )
            
        except Exception as e:
            logger.error(f"CSV migration failed: {e}")
            self.migration_stats["errors"].append(str(e))
            return self.migration_stats
    
    def migrate_from_json(
        self,
        json_path: str,
        field_mapping: Dict[str, str],
        conflict_resolution: str = "update",
        batch_size: int = 50
    ) -> Dict:
        """
        Migrate data from JSON file
        
        Args:
            json_path: Path to JSON file
            field_mapping: Map JSON fields to GHL fields
            conflict_resolution: "update", "skip", or "create_new"
            batch_size: Records per batch
            
        Returns:
            Migration statistics
        """
        logger.info(f"Starting JSON migration from: {json_path}")
        
        try:
            with open(json_path, 'r') as f:
                records = json.load(f)
            
            if not isinstance(records, list):
                records = [records]
            
            logger.info(f"Loaded {len(records)} records from JSON")
            
            # Process records
            return self._process_records(
                records=records,
                field_mapping=field_mapping,
                conflict_resolution=conflict_resolution,
                batch_size=batch_size,
                source="json"
            )
            
        except Exception as e:
            logger.error(f"JSON migration failed: {e}")
            self.migration_stats["errors"].append(str(e))
            return self.migration_stats
    
    def migrate_from_sqlite(
        self,
        db_path: str,
        table_name: str,
        field_mapping: Dict[str, str],
        conflict_resolution: str = "update",
        batch_size: int = 50,
        where_clause: Optional[str] = None
    ) -> Dict:
        """
        Migrate data from SQLite database
        
        Args:
            db_path: Path to SQLite database
            table_name: Table to migrate from
            field_mapping: Map database columns to GHL fields
            conflict_resolution: "update", "skip", or "create_new"
            batch_size: Records per batch
            where_clause: Optional WHERE clause for filtering
            
        Returns:
            Migration statistics
        """
        logger.info(f"Starting SQLite migration from: {db_path}, table: {table_name}")
        
        try:
            # Connect to database
            conn = sqlite3.connect(db_path)
            
            # Build query
            query = f"SELECT * FROM {table_name}"
            if where_clause:
                query += f" WHERE {where_clause}"
            
            # Read data
            df = pd.read_sql_query(query, conn)
            conn.close()
            
            records = df.to_dict('records')
            
            logger.info(f"Loaded {len(records)} records from SQLite")
            
            # Process records
            return self._process_records(
                records=records,
                field_mapping=field_mapping,
                conflict_resolution=conflict_resolution,
                batch_size=batch_size,
                source="sqlite"
            )
            
        except Exception as e:
            logger.error(f"SQLite migration failed: {e}")
            self.migration_stats["errors"].append(str(e))
            return self.migration_stats
    
    def migrate_from_hubspot(
        self,
        api_key: str,
        field_mapping: Dict[str, str],
        conflict_resolution: str = "update",
        batch_size: int = 50,
        limit: int = 1000
    ) -> Dict:
        """
        Migrate data from HubSpot
        
        Args:
            api_key: HubSpot API key
            field_mapping: Map HubSpot fields to GHL fields
            conflict_resolution: "update", "skip", or "create_new"
            batch_size: Records per batch
            limit: Maximum number of contacts to migrate
            
        Returns:
            Migration statistics
        """
        logger.info("Starting HubSpot migration")
        
        try:
            # Import HubSpot client (would need hubspot-api-client package)
            # This is a simplified example
            import requests
            
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            
            # Get contacts from HubSpot
            url = "https://api.hubapi.com/crm/v3/objects/contacts"
            params = {
                "limit": min(limit, 100),
                "properties": "email,firstname,lastname,phone,company"
            }
            
            response = requests.get(url, headers=headers, params=params)
            response.raise_for_status()
            
            data = response.json()
            records = []
            
            for contact in data.get("results", []):
                properties = contact.get("properties", {})
                record = {
                    "id": contact.get("id"),
                    "email": properties.get("email"),
                    "firstname": properties.get("firstname"),
                    "lastname": properties.get("lastname"),
                    "phone": properties.get("phone"),
                    "company": properties.get("company")
                }
                records.append(record)
            
            logger.info(f"Loaded {len(records)} records from HubSpot")
            
            # Process records
            return self._process_records(
                records=records,
                field_mapping=field_mapping,
                conflict_resolution=conflict_resolution,
                batch_size=batch_size,
                source="hubspot"
            )
            
        except Exception as e:
            logger.error(f"HubSpot migration failed: {e}")
            self.migration_stats["errors"].append(str(e))
            return self.migration_stats
    
    def _process_records(
        self,
        records: List[Dict],
        field_mapping: Dict[str, str],
        conflict_resolution: str,
        batch_size: int,
        source: str
    ) -> Dict:
        """
        Process records for migration
        
        Args:
            records: List of records to migrate
            field_mapping: Field mapping dictionary
            conflict_resolution: How to handle conflicts
            batch_size: Records per batch
            source: Source system name
            
        Returns:
            Migration statistics
        """
        self.migration_stats["total_records"] = len(records)
        
        # Process in batches
        for i in range(0, len(records), batch_size):
            batch = records[i:i + batch_size]
            batch_num = (i // batch_size) + 1
            total_batches = (len(records) + batch_size - 1) // batch_size
            
            logger.info(f"Processing batch {batch_num}/{total_batches} ({len(batch)} records)")
            
            for record in batch:
                try:
                    # Map fields
                    ghl_record = self._map_fields(record, field_mapping, source)
                    
                    # Check for required fields
                    if not self._validate_record(ghl_record):
                        self.migration_stats["skipped"] += 1
                        logger.warning(f"Skipped record (missing required fields): {record.get('email', 'No email')}")
                        continue
                    
                    # Check if contact exists
                    existing = None
                    if "email" in ghl_record and ghl_record["email"]:
                        existing = self.ghl.search_contact_by_email(ghl_record["email"])
                    
                    if existing:
                        # Handle existing contact
                        self._handle_existing_contact(
                            existing=existing,
                            ghl_record=ghl_record,
                            conflict_resolution=conflict_resolution,
                            source=source
                        )
                    else:
                        # Create new contact
                        self._create_new_contact(ghl_record, source)
                        
                except Exception as e:
                    self.migration_stats["failed"] += 1
                    self.migration_stats["errors"].append({
                        "record": record.get("email", "Unknown"),
                        "error": str(e)
                    })
                    logger.error(f"Failed to process record: {e}")
            
            # Log progress
            success_rate = (self.migration_stats["successful"] / self.migration_stats["total_records"]) * 100
            logger.info(f"Progress: {self.migration_stats['successful']}/{self.migration_stats['total_records']} ({success_rate:.1f}%)")
        
        # Final summary
        logger.info("=" * 60)
        logger.info("MIGRATION COMPLETE")
        logger.info("=" * 60)
        logger.info(f"Total records: {self.migration_stats['total_records']}")
        logger.info(f"Successful: {self.migration_stats['successful']}")
        logger.info(f"Failed: {self.migration_stats['failed']}")
        logger.info(f"Skipped: {self.migration_stats['skipped']}")
        
        if self.migration_stats["errors"]:
            logger.warning(f"Errors: {len(self.migration_stats['errors'])}")
            # Save errors to file
            with open("migration_errors.json", "w") as f:
                json.dump(self.migration_stats["errors"], f, indent=2)
            logger.info("Errors saved to migration_errors.json")
        
        return self.migration_stats
    
    def _map_fields(
        self,
        record: Dict,
        field_mapping: Dict[str, str],
        source: str
    ) -> Dict:
        """Map source fields to GHL fields"""
        ghl_record = {}
        
        for ghl_field, source_field in field_mapping.items():
            if source_field in record:
                ghl_record[ghl_field] = record[source_field]
            elif "." in source_field:
                # Handle nested fields (e.g., "properties.email")
                parts = source_field.split(".")
                value = record
                for part in parts:
                    if isinstance(value, dict) and part in value:
                        value = value[part]
                    else:
                        value = None
                        break
                if value is not None:
                    ghl_record[ghl_field] = value
        
        # Add custom fields for tracking
        if "customField" not in ghl_record:
            ghl_record["customField"] = {}
        
        ghl_record["customField"]["migration_source"] = source
        ghl_record["customField"]["migration_date"] = datetime.now().isoformat()
        
        # Add external ID if available
        if "id" in record:
            ghl_record["customField"]["external_id"] = str(record["id"])
        
        return ghl_record
    
    def _validate_record(self, record: Dict) -> bool:
        """Validate record has required fields"""
        # At minimum need email or phone
        has_email = "email" in record and record["email"]
        has_phone = "phone" in record and record["phone"]
        
        if not (has_email or has_phone):
            return False
        
        # Location ID is required for GHL
        if "locationId" not in record and self.ghl.location_id:
            record["locationId"] = self.ghl.location_id
        
        return True
    
    def _handle_existing_contact(
        self,
        existing: Dict,
        ghl_record: Dict,
        conflict_resolution: str,
        source: str
    ):
        """Handle existing contact based on conflict resolution strategy"""
        contact_id = existing["id"]
        email = ghl_record.get("email", "No email")
        
        if conflict_resolution == "update":
            # Update existing contact
            try:
                # Preserve existing custom fields
                if "customField" in existing and "customField" in ghl_record:
                    existing_custom = existing.get("customField", {})
                    ghl_record["customField"] = {**existing_custom, **ghl_record["customField"]}
                
                self.ghl.update_contact(contact_id, ghl_record)
                self.migration_stats["successful"] += 1
                logger.info(f"Updated existing contact: {email}")
                
            except Exception as e:
                self.migration_stats["failed"] += 1
                logger.error(f"Failed to update contact {email}: {e}")
        
        elif conflict_resolution == "skip":
            # Skip existing contact
            self.migration_stats["skipped"] += 1
            logger.info(f"Skipped existing contact: {email}")
        
        else:  # create_new
            # Create as new contact with modified email
            if "email" in ghl_record and ghl_record["email"]:
                ghl_record["email"] = f"{ghl_record['email']}+duplicate_{source}"
            
            try:
                self.ghl.create_contact(ghl_record)
                self.migration_stats["successful"] += 1
                logger.info(f"Created duplicate contact: {ghl_record.get('email', 'No email')}")
                
            except Exception as e:
                self.migration_stats["failed"] += 1
                logger.error(f"Failed to create duplicate contact: {e}")
    
    def _create_new_contact(self, ghl_record: Dict, source: str):
        """Create new contact"""
        try:
            self.ghl.create_contact(ghl_record)
            self.migration_stats["successful"] += 1
            logger.info(f"Created new contact: {ghl_record.get('email', 'No email')}")
            
        except Exception as e:
            self.migration_stats["failed"] += 1
            logger.error(f"Failed to create contact: {e}")


# Field mapping presets
FIELD_MAPPING_PRESETS = {
    "hubspot": {
        "firstName": "firstname",
        "lastName": "lastname",
        "email": "email",
        "phone": "phone",
        "company": "company"
    },
    "salesforce": {
        "firstName": "FirstName",
        "lastName": "LastName",
        "email": "Email",
        "phone": "Phone",
        "company": "Company"
    },
    "zoho": {
        "firstName": "First_Name",
        "lastName": "Last_Name",
        "email": "Email",
        "phone": "Phone",
        "company": "Company"
    },
    "generic": {
        "firstName": "first_name",
        "lastName": "last_name",
        "email": "email",
        "phone": "phone",
        "company": "company"
    }
}


def create_migration_report(stats: Dict, output_path: str = "migration_report.json"):
    """Create detailed migration report"""
    report = {
        "timestamp": datetime.now().isoformat(),
        "summary": {
            "total_records": stats["total_records"],
            "successful": stats["successful"],
            "failed": stats["failed"],
            "skipped": stats["skipped"],
            "success_rate": (stats["successful"] / stats["total_records"] * 100) if stats["total_records"] > 0 else 0
        },
        "details": {
            "errors": stats["errors"][:10] if stats["errors"] else [],  # First 10 errors
            "total_errors": len(stats["errors"])
        },
        "recommendations": []
    }
    
    # Add recommendations based on results
    if stats["failed"] > 0:
        report["recommendations"].append(
            "Review migration_errors.json for details on failed records"
        )
    
    if stats["skipped"] > stats["total_records"] * 0.1:  # More than 10% skipped
        report["recommendations"].append(
            "Consider updating conflict resolution strategy to 'update' instead of 'skip'"
        )
    
    # Save report
    with open(output_path, "w") as f:
        json.dump(report, f, indent=2)
    
    logger.info(f"Migration report saved to: {output_path}")
    return report


# Example usage
if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Migrate data to Go High Level")
    parser.add_argument("--source", required=True, choices=["csv", "json", "sqlite", "hubspot"],
                       help="Source data format")
    parser.add_argument("--input", required=True, help="Input file or database path")
    parser.add_argument("--mapping", choices=list(FIELD_MAPPING_PRESETS.keys()), default="generic",
                       help="Field mapping preset")
    parser.add
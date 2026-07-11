#!/usr/bin/env python3
"""
Test Gumroad API access and create first product
"""

import json
import requests

class GumroadAPI:
    def __init__(self, access_token):
        self.base_url = "https://api.gumroad.com/v2"
        self.access_token = access_token.strip()
        self.headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }
    
    def test_connection(self):
        """Test if API token works"""
        try:
            response = requests.get(
                f"{self.base_url}/user",
                headers=self.headers
            )
            
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text[:200]}...")
            
            if response.status_code == 200:
                data = response.json()
                print("✅ GUMROAD API CONNECTED!")
                print(f"   User: {data.get('user', {}).get('name', 'N/A')}")
                print(f"   Email: {data.get('user', {}).get('email', 'N/A')}")
                return True
            else:
                print(f"❌ Connection failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Error connecting to Gumroad: {e}")
            return False
    
    def get_products(self):
        """Get existing products"""
        try:
            response = requests.get(
                f"{self.base_url}/products",
                headers=self.headers
            )
            
            if response.status_code == 200:
                data = response.json()
                products = data.get('products', [])
                print(f"📦 Found {len(products)} product(s):")
                
                for product in products:
                    print(f"   • {product.get('name', 'Unnamed')}")
                    print(f"     ID: {product.get('id', 'N/A')}")
                    print(f"     Price: ${product.get('price', 0)/100:.2f}")
                    print(f"     Sales: {product.get('sales_count', 0)}")
                    print()
                
                return products
            else:
                print(f"❌ Failed to get products: {response.status_code}")
                return []
                
        except Exception as e:
            print(f"❌ Error getting products: {e}")
            return []
    
    def create_product(self, product_data):
        """Create a new product"""
        try:
            response = requests.post(
                f"{self.base_url}/products",
                headers=self.headers,
                json=product_data
            )
            
            print(f"Create Product Status: {response.status_code}")
            print(f"Response: {response.text[:500]}")
            
            if response.status_code == 200:
                data = response.json()
                print("✅ PRODUCT CREATED!")
                print(f"   ID: {data.get('product', {}).get('id', 'N/A')}")
                print(f"   Name: {data.get('product', {}).get('name', 'N/A')}")
                print(f"   URL: {data.get('product', {}).get('short_url', 'N/A')}")
                return data.get('product', {})
            else:
                print(f"❌ Failed to create product: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"❌ Error creating product: {e}")
            return None
    
    def create_first_product(self):
        """Create our first digital product"""
        product_data = {
            "name": "AI Assistant Setup Kit - Lola Edition",
            "description": "Everything you need to set up your own AI assistant like Lola. Includes configuration files, integration scripts, and automation templates.",
            "price": 2900,  # $29.00 in cents
            "currency": "USD",
            "published": True,
            "customizable_price": False,
            "quantity_enabled": False,
            "require_shipping": False,
            "is_tiered_membership": False,
            "recurrence": None,
            "tags": ["ai", "automation", "productivity", "assistant", "openclaw"],
            "custom_fields": [
                {
                    "name": "Your Name",
                    "required": True,
                    "type": "text"
                },
                {
                    "name": "Use Case",
                    "required": False,
                    "type": "text"
                }
            ],
            "file_info": {
                "name": "lola_setup_kit.zip"
            },
            "max_purchase_count": None,
            "custom_permalink": "lola-ai-assistant-kit",
            "custom_receipt": "Thank you for purchasing the Lola AI Assistant Kit! Download link: {download_url}. Need help? Contact us.",
            "custom_summary": "AI Assistant Setup Kit",
            "subscription_duration": None
        }
        
        return self.create_product(product_data)

# Test the API
if __name__ == "__main__":
    print("🛒 GUMROAD API TEST")
    print("=" * 50)
    
    # Your API token
    ACCESS_TOKEN = "4RBA6NUQETEXGIJSQHEMHEWE3FRJI4VA"
    
    gumroad = GumroadAPI(ACCESS_TOKEN)
    
    # Test connection
    if gumroad.test_connection():
        print("\n" + "=" * 50)
        
        # Get existing products
        products = gumroad.get_products()
        
        print("\n" + "=" * 50)
        
        if not products:
            print("📭 No products found. Creating first product...")
            
            # Create first product
            product = gumroad.create_first_product()
            
            if product:
                print("\n🎉 FIRST PRODUCT CREATED!")
                print(f"\n🔗 Product URL: https://gumroad.com/l/{product.get('id', 'N/A')}")
                print(f"💰 Price: ${product.get('price', 0)/100:.2f}")
                print(f"📝 Name: {product.get('name', 'N/A')}")
                
                print("\n📋 Next steps:")
                print("1. Add actual files to the product")
                print("2. Create product thumbnail/image")
                print("3. Write detailed description")
                print("4. Set up marketing/promotion")
            else:
                print("❌ Failed to create product")
        else:
            print(f"📦 You already have {len(products)} product(s)")
            print("\n💡 Ideas for new products:")
            print("1. Monzo Automation Templates")
            print("2. Morning Briefing Generator")
            print("3. Trading Journal System")
            print("4. Pizza Ordering Assistant")
            
    else:
        print("❌ Cannot connect to Gumroad API")
        print("\n⚠️ Possible issues:")
        print("1. API token invalid/expired")
        print("2. Network/connection issue")
        print("3. Gumroad API down")
        print("4. Token needs specific permissions")
#!/usr/bin/env python3
"""
Test Gumroad API connection
"""

import requests
import json

class GumroadAPITester:
    def __init__(self, access_token):
        self.base_url = "https://api.gumroad.com/v2"
        self.access_token = access_token.strip()
        self.headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }
    
    def test_connection(self):
        """Test if API token works"""
        print("🔌 Testing Gumroad API connection...")
        print(f"Token: {self.access_token[:8]}...{self.access_token[-8:]}")
        
        try:
            response = requests.get(
                f"{self.base_url}/user",
                headers=self.headers,
                timeout=10
            )
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print("✅ GUMROAD API CONNECTED SUCCESSFULLY!")
                print(f"   User: {data.get('user', {}).get('name', 'N/A')}")
                print(f"   Email: {data.get('user', {}).get('email', 'N/A')}")
                print(f"   Balance: ${data.get('user', {}).get('balance', 0)/100:.2f}")
                return True, data
            else:
                print(f"❌ Connection failed: {response.status_code}")
                print(f"Response: {response.text[:200]}")
                return False, None
                
        except Exception as e:
            print(f"❌ Error connecting to Gumroad: {e}")
            return False, None
    
    def get_products(self):
        """Get existing products"""
        print("\n📦 Checking existing products...")
        try:
            response = requests.get(
                f"{self.base_url}/products",
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                products = data.get('products', [])
                print(f"Found {len(products)} product(s)")
                
                for product in products:
                    print(f"\n  📋 Product: {product.get('name', 'Unnamed')}")
                    print(f"     ID: {product.get('id', 'N/A')}")
                    print(f"     Price: ${product.get('price', 0)/100:.2f}")
                    print(f"     Sales: {product.get('sales_count', 0)}")
                    print(f"     Published: {product.get('published', False)}")
                    print(f"     URL: {product.get('short_url', 'N/A')}")
                
                return products
            else:
                print(f"❌ Failed to get products: {response.status_code}")
                print(f"Response: {response.text[:200]}")
                return []
                
        except Exception as e:
            print(f"❌ Error getting products: {e}")
            return []
    
    def check_product_details(self, product_id):
        """Check specific product details"""
        print(f"\n🔍 Checking product {product_id[:8]}...")
        try:
            response = requests.get(
                f"{self.base_url}/products/{product_id}",
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                product = data.get('product', {})
                print(f"✅ Product details retrieved")
                print(f"   Name: {product.get('name', 'N/A')}")
                print(f"   Description: {product.get('description', 'N/A')[:100]}...")
                print(f"   Price: ${product.get('price', 0)/100:.2f}")
                print(f"   File info: {product.get('file_info', {})}")
                return product
            else:
                print(f"❌ Failed to get product details: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"❌ Error getting product details: {e}")
            return None

def main():
    print("🛒 GUMROAD API CONNECTION TEST")
    print("=" * 60)
    
    # Your Gumroad API token
    ACCESS_TOKEN = "4RBA6NUQETEXGIJSQHEMHEWE3FRJI4VA"
    
    tester = GumroadAPITester(ACCESS_TOKEN)
    
    # Test connection
    connected, user_data = tester.test_connection()
    
    if connected:
        print("\n" + "=" * 60)
        
        # Get existing products
        products = tester.get_products()
        
        if products:
            print("\n" + "=" * 60)
            print("📊 PRODUCT STATUS SUMMARY:")
            print(f"Total products: {len(products)}")
            
            # Check each product
            for product in products:
                product_id = product.get('id')
                if product_id:
                    tester.check_product_details(product_id)
            
            print("\n✅ Gumroad account is active and products are accessible")
            print("\n📋 Next actions:")
            print("1. Verify product files are uploaded")
            print("2. Check product visibility (should be published)")
            print("3. Test purchase flow as a customer")
            print("4. Set up marketing campaign")
        else:
            print("\n📭 No products found in your Gumroad account")
            print("💡 You may need to create a product first via the web interface")
    
    else:
        print("\n❌ API CONNECTION FAILED")
        print("\n⚠️ Troubleshooting steps:")
        print("1. Check if API token is correct")
        print("2. Verify token has proper permissions")
        print("3. Check Gumroad status page (status.gumroad.com)")
        print("4. Try regenerating API token in Gumroad settings")

if __name__ == "__main__":
    main()
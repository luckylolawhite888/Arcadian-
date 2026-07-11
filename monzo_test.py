#!/usr/bin/env python3
"""
Monzo API Test with provided credentials
"""

import requests
import json
from datetime import datetime

class MonzoAPI:
    def __init__(self, access_token, user_id):
        self.base_url = "https://api.monzo.com"
        self.access_token = access_token.strip()
        self.user_id = user_id
        self.headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }
    
    def test_connection(self):
        """Test if the access token works"""
        try:
            response = requests.get(
                f"{self.base_url}/ping/whoami",
                headers=self.headers
            )
            
            if response.status_code == 200:
                data = response.json()
                print("✅ Monzo API Connection Successful!")
                print(f"   Authenticated: {data.get('authenticated', False)}")
                print(f"   Client ID: {data.get('client_id', 'N/A')}")
                print(f"   User ID: {data.get('user_id', 'N/A')}")
                return True
            else:
                print(f"❌ Connection failed: {response.status_code}")
                print(f"   Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Error connecting to Monzo: {e}")
            return False
    
    def get_accounts(self):
        """Get list of accounts"""
        try:
            response = requests.get(
                f"{self.base_url}/accounts",
                headers=self.headers
            )
            
            if response.status_code == 200:
                data = response.json()
                accounts = data.get('accounts', [])
                print(f"📊 Found {len(accounts)} account(s):")
                
                for account in accounts:
                    print(f"   • {account.get('description', 'Unknown')}")
                    print(f"     ID: {account.get('id', 'N/A')}")
                    print(f"     Created: {account.get('created', 'N/A')}")
                    print()
                
                return accounts
            else:
                print(f"❌ Failed to get accounts: {response.status_code}")
                return []
                
        except Exception as e:
            print(f"❌ Error getting accounts: {e}")
            return []
    
    def get_balance(self, account_id):
        """Get account balance"""
        try:
            response = requests.get(
                f"{self.base_url}/balance",
                headers=self.headers,
                params={"account_id": account_id}
            )
            
            if response.status_code == 200:
                data = response.json()
                balance_gbp = data.get('balance', 0) / 100  # Convert from pennies
                total_balance_gbp = data.get('total_balance', 0) / 100
                spend_today_gbp = data.get('spend_today', 0) / 100
                
                print(f"💰 Account Balance:")
                print(f"   Available: £{balance_gbp:.2f}")
                print(f"   Total (incl. pots): £{total_balance_gbp:.2f}")
                print(f"   Spent today: £{spend_today_gbp:.2f}")
                print(f"   Currency: {data.get('currency', 'N/A')}")
                
                return data
            else:
                print(f"❌ Failed to get balance: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"❌ Error getting balance: {e}")
            return None
    
    def get_transactions(self, account_id, limit=5):
        """Get recent transactions"""
        try:
            response = requests.get(
                f"{self.base_url}/transactions",
                headers=self.headers,
                params={
                    "account_id": account_id,
                    "limit": limit
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                transactions = data.get('transactions', [])
                print(f"💳 Recent transactions ({len(transactions)}):")
                
                for tx in transactions:
                    amount_gbp = tx.get('amount', 0) / 100
                    is_debit = amount_gbp < 0
                    amount_str = f"£{abs(amount_gbp):.2f}"
                    
                    print(f"   {'➖' if is_debit else '➕'} {tx.get('description', 'Unknown')}")
                    print(f"     Amount: {amount_str} {'(debit)' if is_debit else '(credit)'}")
                    print(f"     Date: {tx.get('created', 'N/A')}")
                    print(f"     Category: {tx.get('category', 'N/A')}")
                    if tx.get('notes'):
                        print(f"     Notes: {tx.get('notes')}")
                    print()
                
                return transactions
            else:
                print(f"❌ Failed to get transactions: {response.status_code}")
                return []
                
        except Exception as e:
            print(f"❌ Error getting transactions: {e}")
            return []
    
    def get_pots(self, account_id):
        """Get savings pots"""
        try:
            response = requests.get(
                f"{self.base_url}/pots",
                headers=self.headers,
                params={"current_account_id": account_id}
            )
            
            if response.status_code == 200:
                data = response.json()
                pots = data.get('pots', [])
                active_pots = [p for p in pots if not p.get('deleted', False)]
                
                print(f"🏦 Savings Pots ({len(active_pots)}):")
                
                for pot in active_pots:
                    balance_gbp = pot.get('balance', 0) / 100
                    print(f"   • {pot.get('name', 'Unnamed')}")
                    print(f"     Balance: £{balance_gbp:.2f}")
                    print(f"     Style: {pot.get('style', 'N/A')}")
                    print(f"     ID: {pot.get('id', 'N/A')}")
                    print()
                
                return active_pots
            else:
                print(f"❌ Failed to get pots: {response.status_code}")
                return []
                
        except Exception as e:
            print(f"❌ Error getting pots: {e}")
            return []

# Test with provided credentials
if __name__ == "__main__":
    print("🔐 Testing Monzo API Connection...")
    print("=" * 50)
    
    # Your provided credentials (I'll mask the token in output)
    ACCESS_TOKEN = "eyJhbGci0iJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJ x3IiwianRpIjoiYWNjdG9rXzAwMDBCNGdzZjYydml5VWtGROxwSF mEcWgFgv-DJrSzzOFPPU1e8iPCqnFav9naGJ4mDensbadUKaX0DE wF2g"
    USER_ID = "user_00009neg8h6jfNXmRDe3Pt"
    
    monzo = MonzoAPI(ACCESS_TOKEN, USER_ID)
    
    # Test connection
    if monzo.test_connection():
        print("\n" + "=" * 50)
        
        # Get accounts
        accounts = monzo.get_accounts()
        
        if accounts:
            # Use first account for balance/transactions
            first_account = accounts[0]
            account_id = first_account.get('id')
            
            print("\n" + "=" * 50)
            
            # Get balance
            monzo.get_balance(account_id)
            
            print("\n" + "=" * 50)
            
            # Get recent transactions
            monzo.get_transactions(account_id, limit=5)
            
            print("\n" + "=" * 50)
            
            # Get pots
            monzo.get_pots(account_id)
            
            print("🎉 Monzo API test complete!")
            print("\n📋 What I can now do for you:")
            print("1. Daily balance updates")
            print("2. Transaction monitoring")
            print("3. Spending categorization")
            print("4. Budget tracking")
            print("5. Savings pot management")
            print("6. Financial insights in morning briefings")
        else:
            print("❌ No accounts found or access issue")
    else:
        print("❌ Cannot proceed - authentication failed")
        print("\n⚠️ Possible issues:")
        print("1. Access token expired")
        print("2. Token format issue")
        print("3. Account access revoked")
        print("4. Network/API issue")
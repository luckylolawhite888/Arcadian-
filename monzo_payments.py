#!/usr/bin/env python3
"""
Monzo Payment Approval System
Safe, audited payment requests with Telegram approval
"""

import json
import time
from datetime import datetime, timedelta

class MonzoPaymentApproval:
    def __init__(self):
        self.payment_limits = {
            "max_single_payment": 1000.00,  # £1000 max per transaction
            "max_daily_total": 5000.00,     # £5000 max per day
            "require_approval": True,       # Always require approval
            "approval_timeout": 300,        # 5 minutes to approve
            "daily_reset_hour": 4           # Reset at 4 AM
        }
        
        self.payment_log = []
        self.load_credentials()
    
    def load_credentials(self):
        """Load Monzo credentials from file"""
        try:
            with open("/home/node/.openclaw/workspace/monzo_credentials.json", "r") as f:
                self.credentials = json.load(f)
            print("✅ Credentials loaded")
            return True
        except Exception as e:
            print(f"❌ Failed to load credentials: {e}")
            return False
    
    def create_payment_request(self, amount, description, recipient_type="pot", recipient_id=None):
        """Create a payment request for approval"""
        payment_id = f"pay_{int(time.time())}_{hash(description) % 10000}"
        
        request = {
            "payment_id": payment_id,
            "amount": float(amount),
            "description": description,
            "recipient_type": recipient_type,
            "recipient_id": recipient_id,
            "status": "pending",
            "created_at": datetime.utcnow().isoformat(),
            "expires_at": (datetime.utcnow() + timedelta(seconds=self.payment_limits["approval_timeout"])).isoformat(),
            "approved": False,
            "executed": False,
            "executed_at": None
        }
        
        # Check limits
        if not self.check_limits(request):
            return None
        
        # Save to log
        self.payment_log.append(request)
        self.save_log()
        
        return request
    
    def check_limits(self, request):
        """Check if payment is within limits"""
        amount = request["amount"]
        
        # Check single payment limit
        if amount > self.payment_limits["max_single_payment"]:
            print(f"❌ Payment £{amount:.2f} exceeds single payment limit (£{self.payment_limits['max_single_payment']:.2f})")
            return False
        
        # Check daily total
        today = datetime.utcnow().date()
        daily_total = sum(
            p["amount"] for p in self.payment_log 
            if datetime.fromisoformat(p["created_at"]).date() == today 
            and p["status"] == "approved"
        )
        
        if daily_total + amount > self.payment_limits["max_daily_total"]:
            print(f"❌ Payment would exceed daily limit (£{self.payment_limits['max_daily_total']:.2f})")
            print(f"   Already spent today: £{daily_total:.2f}")
            return False
        
        return True
    
    def format_approval_message(self, request):
        """Format payment request for Telegram approval"""
        amount = request["amount"]
        description = request["description"]
        payment_id = request["payment_id"]
        expires_at = datetime.fromisoformat(request["expires_at"])
        
        message = f"💸 PAYMENT REQUEST\n\n"
        message += f"💰 Amount: £{amount:.2f}\n"
        message += f"📝 Description: {description}\n"
        message += f"🆔 ID: {payment_id}\n"
        message += f"⏰ Approve by: {expires_at.strftime('%H:%M:%S')}\n\n"
        message += f"⚠️ This will move money from your Monzo account."
        
        # Create inline buttons
        buttons = [
            [
                {"text": "✅ Approve Payment", "callback_data": f"approve_{payment_id}"},
                {"text": "❌ Deny Payment", "callback_data": f"deny_{payment_id}"}
            ]
        ]
        
        return message, buttons
    
    def approve_payment(self, payment_id):
        """Approve a pending payment"""
        for payment in self.payment_log:
            if payment["payment_id"] == payment_id and payment["status"] == "pending":
                # Check if expired
                expires_at = datetime.fromisoformat(payment["expires_at"])
                if datetime.utcnow() > expires_at:
                    payment["status"] = "expired"
                    self.save_log()
                    return False, "Payment approval expired"
                
                payment["status"] = "approved"
                payment["approved"] = True
                payment["approved_at"] = datetime.utcnow().isoformat()
                self.save_log()
                return True, "Payment approved"
        
        return False, "Payment not found or already processed"
    
    def deny_payment(self, payment_id):
        """Deny a pending payment"""
        for payment in self.payment_log:
            if payment["payment_id"] == payment_id and payment["status"] == "pending":
                payment["status"] = "denied"
                payment["denied_at"] = datetime.utcnow().isoformat()
                self.save_log()
                return True, "Payment denied"
        
        return False, "Payment not found or already processed"
    
    def execute_payment(self, payment_id):
        """Execute an approved payment"""
        for payment in self.payment_log:
            if payment["payment_id"] == payment_id and payment["status"] == "approved" and not payment["executed"]:
                # TODO: Actually call Monzo API to make payment
                # For now, simulate execution
                
                payment["status"] = "executed"
                payment["executed"] = True
                payment["executed_at"] = datetime.utcnow().isoformat()
                self.save_log()
                
                # Log the execution
                execution_log = {
                    "payment_id": payment_id,
                    "amount": payment["amount"],
                    "description": payment["description"],
                    "executed_at": payment["executed_at"],
                    "status": "success"
                }
                
                with open("/home/node/.openclaw/workspace/payment_executions.json", "a") as f:
                    f.write(json.dumps(execution_log) + "\n")
                
                return True, f"Payment of £{payment['amount']:.2f} executed successfully"
        
        return False, "Payment not found, not approved, or already executed"
    
    def get_payment_status(self, payment_id):
        """Get status of a payment"""
        for payment in self.payment_log:
            if payment["payment_id"] == payment_id:
                return payment
        
        return None
    
    def get_todays_payments(self):
        """Get all payments from today"""
        today = datetime.utcnow().date()
        return [
            p for p in self.payment_log 
            if datetime.fromisoformat(p["created_at"]).date() == today
        ]
    
    def save_log(self):
        """Save payment log to file"""
        try:
            with open("/home/node/.openclaw/workspace/payment_log.json", "w") as f:
                json.dump(self.payment_log, f, indent=2)
        except Exception as e:
            print(f"❌ Failed to save payment log: {e}")
    
    def load_log(self):
        """Load payment log from file"""
        try:
            with open("/home/node/.openclaw/workspace/payment_log.json", "r") as f:
                self.payment_log = json.load(f)
        except FileNotFoundError:
            self.payment_log = []
        except Exception as e:
            print(f"❌ Failed to load payment log: {e}")
            self.payment_log = []

# Test the system
if __name__ == "__main__":
    print("🔐 MONZO PAYMENT APPROVAL SYSTEM")
    print("=" * 50)
    
    approval = MonzoPaymentApproval()
    approval.load_log()
    
    print("\n📊 Payment Limits:")
    print(f"   Max single payment: £{approval.payment_limits['max_single_payment']:.2f}")
    print(f"   Max daily total: £{approval.payment_limits['max_daily_total']:.2f}")
    print(f"   Approval timeout: {approval.payment_limits['approval_timeout']} seconds")
    
    print("\n📋 Today's payments:", len(approval.get_todays_payments()))
    
    # Example payment request
    print("\n" + "=" * 50)
    print("💸 Example Payment Request:")
    
    request = approval.create_payment_request(
        amount=50.00,
        description="Move to Savings Pot",
        recipient_type="pot",
        recipient_id="pot_0000..."
    )
    
    if request:
        message, buttons = approval.format_approval_message(request)
        print("\n📱 Telegram Approval Message:")
        print("-" * 30)
        print(message)
        print("-" * 30)
        print("\n🔄 Buttons:", buttons)
        
        print("\n✅ Payment approval system ready!")
        print("\n📁 Files created:")
        print("   • monzo_payments.py - Approval system")
        print("   • payment_log.json - Audit trail")
        print("   • payment_executions.json - Execution records")
    else:
        print("❌ Failed to create payment request (limit exceeded)")
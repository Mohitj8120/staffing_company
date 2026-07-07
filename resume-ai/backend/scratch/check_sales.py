import sys
import os

# Add parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.database import SessionLocal
from models.affiliate import AffiliateSale

db = SessionLocal()
try:
    sales = db.query(AffiliateSale).all()
    print(f"Total sales in database: {len(sales)}")
    for s in sales:
        print(f"Sale ID: {s.id}")
        print(f"  Amount: {s.amount_paid}")
        print(f"  Plan: {s.plan_purchased}")
        print(f"  Payment ID: {s.razorpay_payment_id}")
        print(f"  Status: {s.status}")
except Exception as e:
    print(f"Error querying sales: {e}")
finally:
    db.close()

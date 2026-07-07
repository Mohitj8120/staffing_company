import sys
import os

# Add parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.database import SessionLocal
from models.user import User

db = SessionLocal()
try:
    user = db.query(User).filter(User.email.ilike("%vitbhopal.ac%")).first()
    if user:
        user.subscription_status = "starter"
        db.commit()
        print(f"Successfully upgraded user '{user.email}' to subscription status: 'starter'")
    else:
        print("User not found.")
except Exception as e:
    print(f"Error upgrading user: {e}")
finally:
    db.close()

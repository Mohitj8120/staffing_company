import sys
import os

# Add parent directory to sys.path so we can import core and models
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.database import SessionLocal
from models.user import User

db = SessionLocal()
try:
    user = db.query(User).filter(User.email.ilike("%vitbhopal.ac%")).first()
    if user:
        print(f"User Found:")
        print(f"  ID: {user.id}")
        print(f"  Email: {user.email}")
        print(f"  Subscription Status: '{user.subscription_status}'")
        print(f"  Credits: {user.credits}")
    else:
        print("User with email pattern '%vitbhopal.ac%' not found.")
finally:
    db.close()

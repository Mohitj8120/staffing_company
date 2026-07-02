import sys
import os
import json
import jwt
from datetime import datetime, timedelta

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from main import app
from core.config import settings
from core.database import SessionLocal
from models.user import User

client = TestClient(app)

def test_jwt_generation_and_verification():
    print("\n--- Testing Custom JWT Session Flow (Free Auth) ---")
    
    # 1. Setup mock user in SQLite test DB
    db = SessionLocal()
    mock_user = db.query(User).filter(User.email == "test.jwt@averion.com").first()
    if not mock_user:
        mock_user = User(clerk_id="google-sub-mock-12345", email="test.jwt@averion.com")
        db.add(mock_user)
        db.commit()
        db.refresh(mock_user)
        
    print(f"Mock User ID: {mock_user.id}, Email: {mock_user.email}")
    
    # 2. Encode custom JWT session token
    payload = {
        "user_id": mock_user.id,
        "email": mock_user.email,
        "exp": datetime.utcnow() + timedelta(minutes=5)
    }
    token = jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")
    print(f"Generated Session JWT: {token[:30]}...{token[-20:]}")
    
    # 3. Test verification by calling protected /api/me endpoint
    print("Calling /api/me protected route with token in Authorization header...")
    response = client.get(
        "/api/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    print("Response status code:", response.status_code)
    print("Response JSON:", response.json())
    
    assert response.status_code == 200, "Authentication failed!"
    result = response.json()
    assert result["id"] == mock_user.id
    assert result["email"] == mock_user.email
    print("Protected route query successful, user retrieved successfully!")
    
    # 4. Test Expired Token rejection
    print("\n--- Testing Expired Token Rejection ---")
    expired_payload = {
        "user_id": mock_user.id,
        "email": mock_user.email,
        "exp": datetime.utcnow() - timedelta(minutes=5)
    }
    expired_token = jwt.encode(expired_payload, settings.JWT_SECRET, algorithm="HS256")
    
    expired_response = client.get(
        "/api/me",
        headers={"Authorization": f"Bearer {expired_token}"}
    )
    print("Expired Token response code:", expired_response.status_code)
    print("Expired Token response detail:", expired_response.json())
    assert expired_response.status_code == 401
    assert "expired" in expired_response.json()["detail"].lower()
    print("Expired token rejected correctly!")

    # 5. Test Invalid Secret Signature rejection
    print("\n--- Testing Invalid Secret Signature Rejection ---")
    invalid_secret_token = jwt.encode(payload, "wrong-secret-key-1234", algorithm="HS256")
    
    invalid_response = client.get(
        "/api/me",
        headers={"Authorization": f"Bearer {invalid_secret_token}"}
    )
    print("Invalid Token response code:", invalid_response.status_code)
    print("Invalid Token response detail:", invalid_response.json())
    assert invalid_response.status_code == 401
    assert "invalid" in invalid_response.json()["detail"].lower()
    print("Invalid token rejected correctly!")

    db.close()
    print("Custom JWT verification test passed successfully!")

if __name__ == "__main__":
    test_jwt_generation_and_verification()

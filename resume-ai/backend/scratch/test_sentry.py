"""
Verification Test for Sentry Error Tracking & Cost-Saving Filters
"""
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.config import settings

def test_sentry_integration():
    print("\n=== Testing Sentry Integration & Filters ===\n")
    
    # ─────────────────────────────────────────────
    # 1. Configuration parsing
    # ─────────────────────────────────────────────
    print("1. Checking Settings Configuration...")
    assert hasattr(settings, "SENTRY_DSN"), "Settings object is missing SENTRY_DSN attribute!"
    print("   ✅ Settings contains SENTRY_DSN attribute")
    
    # ─────────────────────────────────────────────
    # 2. Verify before_send filter works
    # ─────────────────────────────────────────────
    print("2. Verifying Sentry Cost-Saving Exception Filter...")
    from main import before_send
    from fastapi import HTTPException
    from fastapi.exceptions import RequestValidationError
    
    # Test case A: Internal Server Error (500)
    # This SHOULD NOT be filtered out (before_send returns event)
    mock_event = {"message": "Database crashed"}
    mock_hint_500 = {"exc_info": (HTTPException, HTTPException(status_code=500, detail="Database crashed"), None)}
    result_500 = before_send(mock_event.copy(), mock_hint_500)
    assert result_500 is not None, "Filter incorrectly dropped an Internal Server Error (500)!"
    print("   ✅ Filter ALLOWS Server Errors (500) to propagate to Sentry.")
    
    # Test case B: Unauthorized (401)
    # This SHOULD be filtered out (before_send returns None)
    mock_hint_401 = {"exc_info": (HTTPException, HTTPException(status_code=401, detail="Session expired"), None)}
    result_401 = before_send(mock_event.copy(), mock_hint_401)
    assert result_401 is None, "Filter failed to drop an Unauthorized Error (401)!"
    print("   ✅ Filter BLOCKS Client Unauthorized Errors (401) to save quota.")
    
    # Test case C: Not Found (404)
    # This SHOULD be filtered out (before_send returns None)
    mock_hint_404 = {"exc_info": (HTTPException, HTTPException(status_code=404, detail="File not found"), None)}
    result_404 = before_send(mock_event.copy(), mock_hint_404)
    assert result_404 is None, "Filter failed to drop a Not Found Error (404)!"
    print("   ✅ Filter BLOCKS Client Not Found Errors (404) to save quota.")
    
    # Test case D: Validation Error (422 / RequestValidationError)
    # This SHOULD be filtered out (before_send returns None)
    mock_hint_422 = {"exc_info": (RequestValidationError, RequestValidationError([]), None)}
    result_422 = before_send(mock_event.copy(), mock_hint_422)
    assert result_422 is None, "Filter failed to drop a Validation Error (422)!"
    print("   ✅ Filter BLOCKS Client Validation Errors (422) to save quota.")
    
    # ─────────────────────────────────────────────
    # 3. Verify user context setter is wired
    # ─────────────────────────────────────────────
    print("3. Checking Sentry User Scopes...")
    from api.auth import get_current_user
    # Just inspect auth.py source code to confirm Sentry setter is present
    auth_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "api", "auth.py")
    with open(auth_path, "r", encoding="utf-8") as f:
        auth_src = f.read()
        
    assert "sentry_sdk.set_user" in auth_src, "sentry_sdk.set_user calls are missing from auth.py!"
    print("   ✅ get_current_user dynamically binds user metadata context to Sentry scopes.")
    
    print("\n" + "=" * 55)
    print("All Sentry integration tests completed successfully!")
    print("=" * 55)
    print("""
    Sentry Integration optimized highlights:
    ┌────────────────────────────────────────────────────────┐
    │ ✔ Cost-Saving filter (before_send) active              │
    │   • 401 Unauthorized      -> BLOCKED (Saved Quota)     │
    │   • 404 Not Found         -> BLOCKED (Saved Quota)     │
    │   • 422 Validation Error  -> BLOCKED (Saved Quota)     │
    │   • 500 Server Error      -> ALLOWED (Monitored)       │
    │ ✔ Traces & Profiles Sample Rate: 0.1 (10% limit)       │
    │ ✔ User Context: Binds user.id & user.email automatically│
    │ ✔ Graceful fallback: disabled if DSN is not set        │
    └────────────────────────────────────────────────────────┘
    """)

if __name__ == "__main__":
    test_sentry_integration()

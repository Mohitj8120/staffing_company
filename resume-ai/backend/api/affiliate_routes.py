from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.orm import Session
from sqlalchemy import func as sql_func
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
import hashlib
import hmac
import json

from core.config import settings
from core.database import get_db
from api.auth import get_current_user
from models.user import User
from models.affiliate import Affiliate, AffiliateClick, AffiliateSignup, AffiliateSale, AffiliatePayout

router = APIRouter()

# ──────────────────────────────────────────────────────────
# Request / Response Models
# ──────────────────────────────────────────────────────────

class AffiliateApplyRequest(BaseModel):
    name: str
    preferred_code: str
    upi_id: Optional[str] = None
    bank_account: Optional[str] = None
    bank_ifsc: Optional[str] = None
    bank_name: Optional[str] = None
    social_url: Optional[str] = None

class TrackClickRequest(BaseModel):
    code: str
    referrer: Optional[str] = None
    user_agent: Optional[str] = None

class AdminUpdateRequest(BaseModel):
    status: Optional[str] = None
    commission_rate: Optional[float] = None
    admin_notes: Optional[str] = None
    min_payout: Optional[int] = None

class PayoutRequest(BaseModel):
    affiliate_id: int
    amount: float
    method: str  # upi / bank_transfer
    transaction_ref: Optional[str] = None
    admin_notes: Optional[str] = None


# ──────────────────────────────────────────────────────────
# PUBLIC ENDPOINTS
# ──────────────────────────────────────────────────────────

@router.get("/resolve/{code}")
async def resolve_affiliate_code(code: str, db: Session = Depends(get_db)):
    """Validate if a referral code exists and is active."""
    affiliate = db.query(Affiliate).filter(
        Affiliate.code == code.upper().strip(),
        Affiliate.status == "approved"
    ).first()
    
    if not affiliate:
        return {"valid": False}
    
    return {
        "valid": True,
        "code": affiliate.code,
        "name": affiliate.name
    }


@router.post("/track-click")
async def track_click(req: TrackClickRequest, request: Request, db: Session = Depends(get_db)):
    """Record a click when ?ref=CODE is visited."""
    affiliate = db.query(Affiliate).filter(
        Affiliate.code == req.code.upper().strip(),
        Affiliate.status == "approved"
    ).first()
    
    if not affiliate:
        return {"tracked": False, "reason": "Invalid or inactive code"}
    
    # Hash IP for GDPR compliance
    client_ip = request.client.host if request.client else "unknown"
    ip_hash = hashlib.sha256(client_ip.encode()).hexdigest()
    
    click = AffiliateClick(
        affiliate_id=affiliate.id,
        ip_hash=ip_hash,
        user_agent=req.user_agent,
        referrer=req.referrer
    )
    db.add(click)
    db.commit()
    
    return {"tracked": True, "code": affiliate.code}


@router.post("/track-signup")
async def track_signup(
    referred_user_id: int,
    ref_code: str,
    db: Session = Depends(get_db)
):
    """Internal: Called when a new user registers with an active affiliate cookie."""
    affiliate = db.query(Affiliate).filter(
        Affiliate.code == ref_code.upper().strip(),
        Affiliate.status == "approved"
    ).first()
    
    if not affiliate:
        return {"tracked": False}
    
    # Prevent duplicate signup attribution
    existing = db.query(AffiliateSignup).filter(
        AffiliateSignup.referred_user_id == referred_user_id
    ).first()
    
    if existing:
        return {"tracked": False, "reason": "User already attributed"}
    
    signup = AffiliateSignup(
        affiliate_id=affiliate.id,
        referred_user_id=referred_user_id,
        ref_code_used=ref_code.upper().strip()
    )
    db.add(signup)
    db.commit()
    
    return {"tracked": True}


# ──────────────────────────────────────────────────────────
# RAZORPAY WEBHOOK
# ──────────────────────────────────────────────────────────

@router.post("/webhook/razorpay")
async def razorpay_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Razorpay payment webhook — records affiliate sale + commission.
    Verifies webhook signature for security.
    """
    body = await request.body()
    
    # Verify webhook signature if secret is configured
    if settings.RAZORPAY_WEBHOOK_SECRET:
        signature = request.headers.get("x-razorpay-signature", "")
        expected = hmac.new(
            settings.RAZORPAY_WEBHOOK_SECRET.encode(),
            body,
            hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(signature, expected):
            raise HTTPException(status_code=400, detail="Invalid webhook signature")
    
    try:
        payload = json.loads(body)
    except:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")
    
    event = payload.get("event", "")
    
    # Handle payment.captured and payment_link.paid events
    if event in ("payment.captured", "payment_link.paid"):
        payment_entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
        
        payment_id = payment_entity.get("id")
        order_id = payment_entity.get("order_id")
        amount_paise = payment_entity.get("amount", 0)
        amount_inr = amount_paise / 100.0
        email = payment_entity.get("email", "").lower().strip()
        notes = payment_entity.get("notes", {})
        
        if not payment_id or not email:
            return {"status": "skipped", "reason": "Missing payment_id or email"}
        
        # Check for duplicate payment
        existing_sale = db.query(AffiliateSale).filter(
            AffiliateSale.razorpay_payment_id == payment_id
        ).first()
        if existing_sale:
            return {"status": "duplicate", "message": "Payment already recorded"}
        
        # Find the user by email
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return {"status": "skipped", "reason": "User not found"}
        
        # Determine plan from amount
        plan_map = {449: "starter", 849: "pro", 1149: "ultimate"}
        plan = plan_map.get(int(amount_inr), "unknown")
        
        # Update user subscription status
        if plan != "unknown":
            user.subscription_status = plan
            db.commit()
        
        # Check if this user was referred by an affiliate
        signup = db.query(AffiliateSignup).filter(
            AffiliateSignup.referred_user_id == user.id
        ).first()
        
        if signup:
            affiliate = db.query(Affiliate).filter(
                Affiliate.id == signup.affiliate_id,
                Affiliate.status == "approved"
            ).first()
            
            if affiliate:
                commission = round(amount_inr * affiliate.commission_rate, 2)
                
                sale = AffiliateSale(
                    affiliate_id=affiliate.id,
                    referred_user_id=user.id,
                    razorpay_payment_id=payment_id,
                    razorpay_order_id=order_id,
                    plan_purchased=plan,
                    amount_paid=amount_inr,
                    commission_amount=commission,
                    commission_rate=affiliate.commission_rate,
                    cookie_ref=signup.ref_code_used,
                    status="confirmed"
                )
                db.add(sale)
                db.commit()
                
                print(f"Affiliate Sale: {affiliate.code} earned ₹{commission} from {email} ({plan})")
                return {"status": "recorded", "affiliate": affiliate.code, "commission": commission}
        
        return {"status": "no_affiliate", "message": "Payment recorded but no affiliate attribution"}
    
    return {"status": "ignored", "event": event}


# ──────────────────────────────────────────────────────────
# AUTHENTICATED USER ENDPOINTS
# ──────────────────────────────────────────────────────────

@router.post("/apply")
async def apply_affiliate(
    req: AffiliateApplyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Apply to become an affiliate."""
    # Check if user already has an affiliate profile
    existing = db.query(Affiliate).filter(Affiliate.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"You already have an affiliate profile (code: {existing.code}, status: {existing.status})")
    
    # Sanitize and validate code
    code = req.preferred_code.upper().strip().replace(" ", "")
    if len(code) < 3 or len(code) > 20:
        raise HTTPException(status_code=400, detail="Code must be 3-20 characters")
    
    # Check code uniqueness
    code_exists = db.query(Affiliate).filter(Affiliate.code == code).first()
    if code_exists:
        raise HTTPException(status_code=400, detail=f"Code '{code}' is already taken. Please choose another.")
    
    affiliate = Affiliate(
        user_id=current_user.id,
        code=code,
        name=req.name,
        status="pending",
        upi_id=req.upi_id,
        bank_account=req.bank_account,
        bank_ifsc=req.bank_ifsc,
        bank_name=req.bank_name,
        social_url=req.social_url
    )
    db.add(affiliate)
    db.commit()
    db.refresh(affiliate)
    
    return {
        "status": "success",
        "message": "Application submitted! You'll be notified once approved.",
        "affiliate": {
            "id": affiliate.id,
            "code": affiliate.code,
            "status": affiliate.status
        }
    }


@router.get("/me")
async def get_affiliate_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get own affiliate profile + comprehensive stats."""
    affiliate = db.query(Affiliate).filter(Affiliate.user_id == current_user.id).first()
    
    if not affiliate:
        return {"has_affiliate": False}
    
    # Aggregate stats
    total_clicks = db.query(sql_func.count(AffiliateClick.id)).filter(
        AffiliateClick.affiliate_id == affiliate.id
    ).scalar() or 0
    
    total_signups = db.query(sql_func.count(AffiliateSignup.id)).filter(
        AffiliateSignup.affiliate_id == affiliate.id
    ).scalar() or 0
    
    total_sales = db.query(sql_func.count(AffiliateSale.id)).filter(
        AffiliateSale.affiliate_id == affiliate.id,
        AffiliateSale.status == "confirmed"
    ).scalar() or 0
    
    total_earnings = db.query(sql_func.coalesce(sql_func.sum(AffiliateSale.commission_amount), 0)).filter(
        AffiliateSale.affiliate_id == affiliate.id,
        AffiliateSale.status == "confirmed"
    ).scalar() or 0
    
    total_paid = db.query(sql_func.coalesce(sql_func.sum(AffiliatePayout.amount), 0)).filter(
        AffiliatePayout.affiliate_id == affiliate.id,
        AffiliatePayout.status == "completed"
    ).scalar() or 0
    
    pending_payout = round(float(total_earnings) - float(total_paid), 2)
    
    # Conversion rate
    conversion_rate = round((total_sales / total_clicks * 100), 1) if total_clicks > 0 else 0
    
    # Recent sales (last 20)
    recent_sales = db.query(AffiliateSale).filter(
        AffiliateSale.affiliate_id == affiliate.id
    ).order_by(AffiliateSale.created_at.desc()).limit(20).all()
    
    sales_list = [{
        "id": s.id,
        "plan": s.plan_purchased,
        "amount": s.amount_paid,
        "commission": s.commission_amount,
        "status": s.status,
        "date": s.created_at.strftime("%Y-%m-%d %H:%M") if s.created_at else "N/A"
    } for s in recent_sales]
    
    # Payout history
    payouts = db.query(AffiliatePayout).filter(
        AffiliatePayout.affiliate_id == affiliate.id
    ).order_by(AffiliatePayout.created_at.desc()).limit(20).all()
    
    payout_list = [{
        "id": p.id,
        "amount": p.amount,
        "method": p.method,
        "status": p.status,
        "transaction_ref": p.transaction_ref,
        "date": p.created_at.strftime("%Y-%m-%d %H:%M") if p.created_at else "N/A"
    } for p in payouts]
    
    # Clicks over last 30 days (daily breakdown)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    daily_clicks = db.query(
        sql_func.date(AffiliateClick.created_at).label("day"),
        sql_func.count(AffiliateClick.id).label("count")
    ).filter(
        AffiliateClick.affiliate_id == affiliate.id,
        AffiliateClick.created_at >= thirty_days_ago
    ).group_by(sql_func.date(AffiliateClick.created_at)).all()
    
    click_chart = [{"day": str(d.day), "clicks": d.count} for d in daily_clicks]
    
    return {
        "has_affiliate": True,
        "affiliate": {
            "id": affiliate.id,
            "code": affiliate.code,
            "name": affiliate.name,
            "status": affiliate.status,
            "commission_rate": affiliate.commission_rate,
            "upi_id": affiliate.upi_id,
            "social_url": affiliate.social_url,
            "min_payout": affiliate.min_payout,
            "created_at": affiliate.created_at.strftime("%Y-%m-%d") if affiliate.created_at else "N/A",
            "approved_at": affiliate.approved_at.strftime("%Y-%m-%d") if affiliate.approved_at else None
        },
        "stats": {
            "total_clicks": total_clicks,
            "total_signups": total_signups,
            "total_sales": total_sales,
            "total_earnings": round(float(total_earnings), 2),
            "total_paid": round(float(total_paid), 2),
            "pending_payout": pending_payout,
            "conversion_rate": conversion_rate
        },
        "recent_sales": sales_list,
        "payouts": payout_list,
        "click_chart": click_chart
    }


# ──────────────────────────────────────────────────────────
# ADMIN ENDPOINTS
# ──────────────────────────────────────────────────────────

def require_admin(current_user: User):
    if current_user.email.lower() != "mohitjain1619@gmail.com":
        raise HTTPException(status_code=403, detail="Admin access required")


@router.get("/admin/list")
async def admin_list_affiliates(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all affiliates with their stats."""
    require_admin(current_user)
    
    affiliates = db.query(Affiliate).order_by(Affiliate.created_at.desc()).all()
    
    results = []
    for a in affiliates:
        clicks = db.query(sql_func.count(AffiliateClick.id)).filter(
            AffiliateClick.affiliate_id == a.id
        ).scalar() or 0
        
        signups = db.query(sql_func.count(AffiliateSignup.id)).filter(
            AffiliateSignup.affiliate_id == a.id
        ).scalar() or 0
        
        sales_count = db.query(sql_func.count(AffiliateSale.id)).filter(
            AffiliateSale.affiliate_id == a.id,
            AffiliateSale.status == "confirmed"
        ).scalar() or 0
        
        total_earnings = db.query(sql_func.coalesce(sql_func.sum(AffiliateSale.commission_amount), 0)).filter(
            AffiliateSale.affiliate_id == a.id,
            AffiliateSale.status == "confirmed"
        ).scalar() or 0
        
        total_paid = db.query(sql_func.coalesce(sql_func.sum(AffiliatePayout.amount), 0)).filter(
            AffiliatePayout.affiliate_id == a.id,
            AffiliatePayout.status == "completed"
        ).scalar() or 0
        
        # Get user email
        user = db.query(User).filter(User.id == a.user_id).first()
        
        results.append({
            "id": a.id,
            "user_id": a.user_id,
            "email": user.email if user else "N/A",
            "code": a.code,
            "name": a.name,
            "status": a.status,
            "commission_rate": a.commission_rate,
            "upi_id": a.upi_id,
            "social_url": a.social_url,
            "clicks": clicks,
            "signups": signups,
            "sales": sales_count,
            "total_earnings": round(float(total_earnings), 2),
            "total_paid": round(float(total_paid), 2),
            "pending": round(float(total_earnings) - float(total_paid), 2),
            "created_at": a.created_at.strftime("%Y-%m-%d %H:%M") if a.created_at else "N/A",
            "admin_notes": a.admin_notes
        })
    
    return results


@router.put("/admin/{affiliate_id}/approve")
async def admin_approve_affiliate(
    affiliate_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Approve an affiliate application."""
    require_admin(current_user)
    
    affiliate = db.query(Affiliate).filter(Affiliate.id == affiliate_id).first()
    if not affiliate:
        raise HTTPException(status_code=404, detail="Affiliate not found")
    
    affiliate.status = "approved"
    affiliate.approved_at = datetime.utcnow()
    db.commit()
    
    return {"status": "success", "message": f"Affiliate {affiliate.code} approved"}


@router.put("/admin/{affiliate_id}/update")
async def admin_update_affiliate(
    affiliate_id: int,
    req: AdminUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update affiliate status, commission rate, notes, etc."""
    require_admin(current_user)
    
    affiliate = db.query(Affiliate).filter(Affiliate.id == affiliate_id).first()
    if not affiliate:
        raise HTTPException(status_code=404, detail="Affiliate not found")
    
    if req.status is not None:
        affiliate.status = req.status
        if req.status == "approved" and not affiliate.approved_at:
            affiliate.approved_at = datetime.utcnow()
    if req.commission_rate is not None:
        affiliate.commission_rate = req.commission_rate
    if req.admin_notes is not None:
        affiliate.admin_notes = req.admin_notes
    if req.min_payout is not None:
        affiliate.min_payout = req.min_payout
    
    db.commit()
    
    return {"status": "success", "message": f"Affiliate {affiliate.code} updated"}


@router.get("/admin/sales")
async def admin_list_sales(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all affiliate sales with details."""
    require_admin(current_user)
    
    sales = db.query(AffiliateSale).order_by(AffiliateSale.created_at.desc()).limit(100).all()
    
    results = []
    for s in sales:
        affiliate = db.query(Affiliate).filter(Affiliate.id == s.affiliate_id).first()
        user = db.query(User).filter(User.id == s.referred_user_id).first()
        
        results.append({
            "id": s.id,
            "affiliate_code": affiliate.code if affiliate else "N/A",
            "affiliate_name": affiliate.name if affiliate else "N/A",
            "customer_email": user.email if user else "N/A",
            "plan": s.plan_purchased,
            "amount": s.amount_paid,
            "commission": s.commission_amount,
            "rate": s.commission_rate,
            "razorpay_id": s.razorpay_payment_id,
            "status": s.status,
            "date": s.created_at.strftime("%Y-%m-%d %H:%M") if s.created_at else "N/A"
        })
    
    return results


@router.post("/admin/payout")
async def admin_create_payout(
    req: PayoutRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Record a manual payout to an affiliate."""
    require_admin(current_user)
    
    affiliate = db.query(Affiliate).filter(Affiliate.id == req.affiliate_id).first()
    if not affiliate:
        raise HTTPException(status_code=404, detail="Affiliate not found")
    
    payout = AffiliatePayout(
        affiliate_id=affiliate.id,
        amount=req.amount,
        method=req.method,
        status="completed",
        transaction_ref=req.transaction_ref,
        admin_notes=req.admin_notes
    )
    db.add(payout)
    db.commit()
    db.refresh(payout)
    
    # Link unpaid sales to this payout
    unpaid_sales = db.query(AffiliateSale).filter(
        AffiliateSale.affiliate_id == affiliate.id,
        AffiliateSale.payout_id == None,
        AffiliateSale.status == "confirmed"
    ).all()
    
    for sale in unpaid_sales:
        sale.payout_id = payout.id
    db.commit()
    
    return {
        "status": "success",
        "message": f"Payout of ₹{req.amount} recorded for {affiliate.code}",
        "payout_id": payout.id
    }

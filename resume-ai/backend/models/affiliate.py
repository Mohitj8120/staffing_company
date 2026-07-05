from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from .base import Base


class Affiliate(Base):
    """Core affiliate profile — one per user."""
    __tablename__ = "affiliates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)  # e.g. RAHUL25, PRIYA25
    name = Column(String(255), nullable=False)
    status = Column(String(20), default="pending", nullable=False)  # pending / approved / suspended
    commission_rate = Column(Float, default=0.25, nullable=False)  # 25% default
    
    # Payment details
    upi_id = Column(String(255), nullable=True)
    bank_account = Column(String(255), nullable=True)
    bank_ifsc = Column(String(20), nullable=True)
    bank_name = Column(String(255), nullable=True)
    
    # Social / contact
    social_url = Column(String(500), nullable=True)  # LinkedIn, Twitter, etc.
    
    # Admin notes
    admin_notes = Column(Text, nullable=True)
    
    # Payout config
    min_payout = Column(Integer, default=1000)  # ₹1000 minimum
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    approved_at = Column(DateTime(timezone=True), nullable=True)


class AffiliateClick(Base):
    """Every click on a referral link for analytics."""
    __tablename__ = "affiliate_clicks"

    id = Column(Integer, primary_key=True, index=True)
    affiliate_id = Column(Integer, ForeignKey("affiliates.id"), nullable=False, index=True)
    ip_hash = Column(String(64), nullable=True)  # SHA256 of IP for GDPR compliance
    user_agent = Column(String(500), nullable=True)
    referrer = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AffiliateSignup(Base):
    """When a referred user creates an account via affiliate link."""
    __tablename__ = "affiliate_signups"

    id = Column(Integer, primary_key=True, index=True)
    affiliate_id = Column(Integer, ForeignKey("affiliates.id"), nullable=False, index=True)
    referred_user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    ref_code_used = Column(String(50), nullable=False)  # The code that was in the cookie
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AffiliateSale(Base):
    """When a referred user makes a purchase — commission recorded here."""
    __tablename__ = "affiliate_sales"

    id = Column(Integer, primary_key=True, index=True)
    affiliate_id = Column(Integer, ForeignKey("affiliates.id"), nullable=False, index=True)
    referred_user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Payment details
    razorpay_payment_id = Column(String(255), nullable=True, unique=True)
    razorpay_order_id = Column(String(255), nullable=True)
    plan_purchased = Column(String(50), nullable=True)  # starter / pro / ultimate
    amount_paid = Column(Float, default=0, nullable=False)  # Total amount in INR
    commission_amount = Column(Float, default=0, nullable=False)  # 25% of amount
    commission_rate = Column(Float, default=0.25, nullable=False)  # Rate at time of sale
    
    # Attribution
    cookie_ref = Column(String(50), nullable=True)  # The ref code from cookie at purchase time
    
    # Status
    status = Column(String(20), default="confirmed")  # confirmed / disputed / refunded
    payout_id = Column(Integer, ForeignKey("affiliate_payouts.id"), nullable=True)  # Linked when paid out
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AffiliatePayout(Base):
    """Payout records — admin manually triggers payouts."""
    __tablename__ = "affiliate_payouts"

    id = Column(Integer, primary_key=True, index=True)
    affiliate_id = Column(Integer, ForeignKey("affiliates.id"), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    method = Column(String(50), nullable=False)  # upi / bank_transfer
    status = Column(String(20), default="completed")  # pending / completed / failed
    transaction_ref = Column(String(255), nullable=True)  # UPI ref / bank transfer ID
    admin_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

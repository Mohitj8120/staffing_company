import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Users, TrendingUp, DollarSign, Copy, CheckCircle, ArrowRight, Link2, BarChart3, Shield, Clock, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Scene3D from '../components/Scene3D';
import '../index.css';
import { API_BASE_URL } from '../config';
import { useAuthContext } from '../context/AuthContext';

function AffiliatePage() {
  const { user, isAuthenticated, getToken } = useAuthContext();
  const navigate = useNavigate();
  
  // Application form state
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [upiId, setUpiId] = useState('');
  const [socialUrl, setSocialUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  
  // Earnings calculator
  const [referrals, setReferrals] = useState(10);
  const [selectedPlan, setSelectedPlan] = useState(849);
  
  // FAQ accordion
  const [openFaq, setOpenFaq] = useState(null);
  
  // Check existing affiliate status
  const [affiliateStatus, setAffiliateStatus] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  
  useEffect(() => {
    async function checkStatus() {
      if (!isAuthenticated) {
        setCheckingStatus(false);
        return;
      }
      try {
        const token = await getToken();
        const res = await fetch(`${API_BASE_URL}/api/affiliate/me`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAffiliateStatus(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCheckingStatus(false);
      }
    }
    checkStatus();
  }, [isAuthenticated, getToken]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;
    
    setSubmitting(true);
    setSubmitResult(null);
    
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/api/affiliate/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: name.trim(),
          preferred_code: code.trim().toUpperCase(),
          upi_id: upiId.trim() || null,
          social_url: socialUrl.trim() || null
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        setSubmitResult({ type: 'success', message: data.message });
        setAffiliateStatus({ has_affiliate: true, affiliate: data.affiliate });
      } else {
        setSubmitResult({ type: 'error', message: data.detail || 'Application failed' });
      }
    } catch (err) {
      setSubmitResult({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };
  
  const commissionAmount = Math.round(referrals * selectedPlan * 0.25);
  
  const faqs = [
    {
      q: "How does the affiliate program work?",
      a: "Share your unique referral link on LinkedIn, Twitter, or any platform. When someone signs up and purchases a plan through your link, you earn 25% commission on their payment. It's that simple."
    },
    {
      q: "How long does the cookie last?",
      a: "We use a 30-day cookie with Last Click attribution. If someone clicks your link, you'll get credit for any purchase they make within 30 days — even if they come back directly without your link."
    },
    {
      q: "What if someone clicks another affiliate's link after mine?",
      a: "We follow Last Click attribution. The most recent referral link clicked before purchase gets the commission. This ensures fair credit to the affiliate who most directly influenced the sale."
    },
    {
      q: "When do I get paid?",
      a: "Payouts are processed monthly. Once your pending balance reaches the minimum payout threshold (₹1,000), we'll transfer your earnings via UPI or bank transfer."
    },
    {
      q: "Can I track my referral performance?",
      a: "Absolutely! Your dashboard shows real-time stats including clicks, signups, conversions, earnings, and payout history. You'll have full visibility into your performance."
    },
    {
      q: "Is there a limit to how much I can earn?",
      a: "No limits! The more people you refer, the more you earn. Some of our top affiliates earn significantly by sharing with their LinkedIn and professional networks."
    }
  ];
  
  const steps = [
    { icon: Users, title: "Sign Up", desc: "Apply for the affiliate program and get your unique referral code approved.", color: "#8a2be2" },
    { icon: Link2, title: "Share", desc: "Share your referral link on LinkedIn, Twitter, job forums, or anywhere your audience is.", color: "#00f2fe" },
    { icon: DollarSign, title: "Earn 25%", desc: "Earn 25% commission on every successful purchase made through your referral link.", color: "#10b981" }
  ];
  
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Scene3D />
      
      <div style={{ 
        position: 'absolute', top: 0, left: 0, 
        width: '100%', height: '100%', 
        overflowY: 'auto', overflowX: 'hidden', zIndex: 10 
      }}>
        {/* Navbar */}
        <motion.header
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="landing-header"
        >
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="landing-logo-icon">
              <Zap color="white" size={20} />
            </div>
            <h1 className="landing-logo-text text-gradient">
              Resume<span style={{color: 'var(--accent-secondary)'}}>AI</span>
            </h1>
          </Link>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard"><button className="dashboard-btn">Dashboard</button></Link>
              </>
            ) : (
              <Link to="/"><button className="dashboard-btn">Home</button></Link>
            )}
          </div>
        </motion.header>
        
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem', paddingTop: '7rem' }}>
          
          {/* ═══════════════════════════════════════════════════════════ */}
          {/* HERO SECTION */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ textAlign: 'center', marginBottom: '5rem' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', bounce: 0.4 }}
            >
              <span style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(0,242,254,0.1))',
                border: '1px solid rgba(16,185,129,0.3)',
                padding: '8px 20px',
                borderRadius: '50px',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#10b981',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                marginBottom: '1.5rem'
              }}>
                💰 Affiliate Program
              </span>
            </motion.div>
            
            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, 3.8rem)',
              fontWeight: 900,
              lineHeight: 1.1,
              margin: '1rem 0',
              color: 'white'
            }}>
              Earn <span className="text-gradient-accent">25% Commission</span><br />
              on Every Sale
            </h1>
            
            <p style={{
              fontSize: 'clamp(1rem, 2vw, 1.3rem)',
              color: 'var(--text-muted)',
              maxWidth: '650px',
              margin: '1.5rem auto',
              lineHeight: 1.7
            }}>
              Join the Averion Careers affiliate program and earn recurring commissions 
              by sharing AI-powered resume optimization with your LinkedIn network, 
              job seekers, and professional community.
            </p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '2rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 700 }}>
                <CheckCircle size={20} /> 25% Commission Rate
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00f2fe', fontWeight: 700 }}>
                <Clock size={20} /> 30-Day Cookie Window
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8a2be2', fontWeight: 700 }}>
                <Shield size={20} /> Monthly Payouts
              </div>
            </motion.div>
          </motion.section>
          
          {/* ═══════════════════════════════════════════════════════════ */}
          {/* HOW IT WORKS */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{ marginBottom: '5rem' }}
          >
            <h2 style={{ textAlign: 'center', fontSize: '2rem', color: 'white', marginBottom: '3rem', fontWeight: 800 }}>
              How It <span className="text-gradient-accent">Works</span>
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
              {steps.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.15, duration: 0.6 }}
                  whileHover={{ scale: 1.03, y: -5 }}
                  className="glass-panel"
                  style={{ padding: '2.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}
                >
                  <div style={{
                    position: 'absolute', top: '-20px', right: '-20px',
                    width: '100px', height: '100px',
                    background: `radial-gradient(circle, ${step.color}15, transparent)`,
                    borderRadius: '50%'
                  }} />
                  
                  <div style={{
                    width: '70px', height: '70px',
                    borderRadius: '20px',
                    background: `linear-gradient(135deg, ${step.color}20, ${step.color}05)`,
                    border: `1px solid ${step.color}40`,
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    margin: '0 auto 1.5rem',
                    boxShadow: `0 0 30px ${step.color}15`
                  }}>
                    <step.icon size={32} color={step.color} />
                  </div>
                  
                  <div style={{
                    fontSize: '0.75rem', fontWeight: 800, color: step.color,
                    textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.5rem'
                  }}>
                    Step {idx + 1}
                  </div>
                  
                  <h3 style={{ color: 'white', fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.8rem' }}>
                    {step.title}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                    {step.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.section>
          
          {/* ═══════════════════════════════════════════════════════════ */}
          {/* EARNINGS CALCULATOR */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glass-panel"
            style={{ padding: '3rem', marginBottom: '5rem', position: 'relative', overflow: 'hidden' }}
          >
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
              background: 'linear-gradient(90deg, #10b981, #00f2fe, #8a2be2)'
            }} />
            
            <h2 style={{ fontSize: '1.8rem', color: 'white', marginBottom: '0.5rem', fontWeight: 800 }}>
              <BarChart3 size={24} style={{ verticalAlign: 'middle', marginRight: '10px', color: '#10b981' }} />
              Earnings Calculator
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
              See how much you could earn by referring job seekers to Averion Careers.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', alignItems: 'center' }}>
              <div>
                <label style={{ display: 'block', color: 'white', fontWeight: 600, marginBottom: '0.8rem' }}>
                  Monthly Referrals: <span style={{ color: '#10b981', fontWeight: 800, fontSize: '1.3rem' }}>{referrals}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={referrals}
                  onChange={(e) => setReferrals(parseInt(e.target.value))}
                  style={{
                    width: '100%', height: '8px', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.1)',
                    outline: 'none', cursor: 'pointer',
                    accentColor: '#10b981'
                  }}
                />
                
                <label style={{ display: 'block', color: 'white', fontWeight: 600, marginBottom: '0.8rem', marginTop: '1.5rem' }}>
                  Average Plan
                </label>
                <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                  {[{ price: 449, name: 'Starter' }, { price: 849, name: 'Pro' }, { price: 1149, name: 'Ultimate' }].map(p => (
                    <button
                      key={p.price}
                      onClick={() => setSelectedPlan(p.price)}
                      style={{
                        background: selectedPlan === p.price ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.05)',
                        border: selectedPlan === p.price ? 'none' : '1px solid rgba(255,255,255,0.1)',
                        color: 'white',
                        padding: '10px 18px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        transition: 'all 0.3s'
                      }}
                    >
                      ₹{p.price} ({p.name})
                    </button>
                  ))}
                </div>
              </div>
              
              <motion.div
                key={commissionAmount}
                initial={{ scale: 0.95, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                  background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(0,242,254,0.05))',
                  border: '1px solid rgba(16,185,129,0.2)',
                  borderRadius: '20px',
                  padding: '2.5rem',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.5rem' }}>
                  Your Monthly Earnings
                </div>
                <div style={{
                  fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #10b981, #00f2fe)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1.2
                }}>
                  ₹{commissionAmount.toLocaleString('en-IN')}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  {referrals} referrals × ₹{selectedPlan} × 25%
                </div>
              </motion.div>
            </div>
          </motion.section>
          
          {/* ═══════════════════════════════════════════════════════════ */}
          {/* APPLICATION FORM / STATUS */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glass-panel"
            style={{ padding: '3rem', marginBottom: '5rem' }}
            id="apply-section"
          >
            <h2 style={{ fontSize: '1.8rem', color: 'white', marginBottom: '0.5rem', fontWeight: 800 }}>
              {affiliateStatus?.has_affiliate ? 'Your Affiliate Status' : 'Apply Now'}
            </h2>
            
            {!isAuthenticated ? (
              <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
                  Please sign in with Google to apply for the affiliate program.
                </p>
                <Link to="/">
                  <button className="primary-btn" style={{ padding: '14px 30px', fontSize: '1.05rem' }}>
                    Sign In to Apply <ArrowRight size={18} style={{ verticalAlign: 'middle', marginLeft: '5px' }} />
                  </button>
                </Link>
              </div>
            ) : checkingStatus ? (
              <div style={{ color: 'var(--accent-secondary)', padding: '2rem 0', textAlign: 'center' }}>
                Checking your affiliate status...
              </div>
            ) : affiliateStatus?.has_affiliate ? (
              <div style={{ padding: '1rem 0' }}>
                {affiliateStatus.affiliate.status === 'pending' && (
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(234,179,8,0.1), rgba(234,179,8,0.02))',
                    border: '1px solid rgba(234,179,8,0.3)',
                    borderRadius: '16px',
                    padding: '2rem',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                    <h3 style={{ color: '#eab308', fontSize: '1.4rem', marginBottom: '0.5rem' }}>Application Under Review</h3>
                    <p style={{ color: 'var(--text-muted)' }}>
                      Your application with code <strong style={{ color: '#eab308' }}>{affiliateStatus.affiliate.code}</strong> is being reviewed.
                      You'll receive access once approved (usually within 24-48 hours).
                    </p>
                  </div>
                )}
                
                {affiliateStatus.affiliate.status === 'approved' && (
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.02))',
                    border: '1px solid rgba(16,185,129,0.3)',
                    borderRadius: '16px',
                    padding: '2rem',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                    <h3 style={{ color: '#10b981', fontSize: '1.4rem', marginBottom: '0.5rem' }}>You're an Approved Affiliate!</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                      Head to your Dashboard → Affiliate tab to access your referral link, track stats, and view earnings.
                    </p>
                    <Link to="/dashboard">
                      <button className="primary-btn" style={{ padding: '12px 28px' }}>
                        Go to Affiliate Dashboard <ArrowRight size={18} style={{ verticalAlign: 'middle', marginLeft: '5px' }} />
                      </button>
                    </Link>
                  </div>
                )}
                
                {affiliateStatus.affiliate.status === 'suspended' && (
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.02))',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: '16px',
                    padding: '2rem',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                    <h3 style={{ color: '#ef4444', fontSize: '1.4rem', marginBottom: '0.5rem' }}>Account Suspended</h3>
                    <p style={{ color: 'var(--text-muted)' }}>
                      Your affiliate account has been suspended. Please contact support for more information.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                  Fill in the details below to apply. After admin approval, you'll get your unique referral link.
                </p>
                
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', color: 'white', fontWeight: 600, marginBottom: '0.5rem' }}>Full Name *</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="custom-input"
                        style={{ width: '100%', padding: '12px 16px', background: '#0d0d14' }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: 'white', fontWeight: 600, marginBottom: '0.5rem' }}>Preferred Referral Code *</label>
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                        placeholder="e.g. RAHUL25"
                        className="custom-input"
                        style={{ width: '100%', padding: '12px 16px', background: '#0d0d14', textTransform: 'uppercase' }}
                        maxLength={20}
                        required
                      />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>3-20 characters, letters and numbers only</span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', color: 'white', fontWeight: 600, marginBottom: '0.5rem' }}>UPI ID (for payouts)</label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="e.g. rahul@upi"
                        className="custom-input"
                        style={{ width: '100%', padding: '12px 16px', background: '#0d0d14' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: 'white', fontWeight: 600, marginBottom: '0.5rem' }}>LinkedIn / Social URL</label>
                      <input
                        type="url"
                        value={socialUrl}
                        onChange={(e) => setSocialUrl(e.target.value)}
                        placeholder="e.g. https://linkedin.com/in/rahulsharma"
                        className="custom-input"
                        style={{ width: '100%', padding: '12px 16px', background: '#0d0d14' }}
                      />
                    </div>
                  </div>
                  
                  {submitResult && (
                    <div style={{
                      padding: '1rem 1.5rem',
                      borderRadius: '12px',
                      background: submitResult.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                      border: `1px solid ${submitResult.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                      color: submitResult.type === 'success' ? '#10b981' : '#ef4444',
                      fontWeight: 600
                    }}>
                      {submitResult.message}
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    className="primary-btn"
                    disabled={submitting || !name.trim() || !code.trim()}
                    style={{
                      padding: '14px 30px',
                      fontSize: '1.05rem',
                      width: 'fit-content',
                      opacity: submitting ? 0.6 : 1,
                      background: 'linear-gradient(135deg, #10b981, #059669)'
                    }}
                  >
                    {submitting ? 'Submitting...' : 'Submit Application'} 
                    {!submitting && <ArrowRight size={18} style={{ verticalAlign: 'middle', marginLeft: '8px' }} />}
                  </button>
                </form>
              </>
            )}
          </motion.section>
          
          {/* ═══════════════════════════════════════════════════════════ */}
          {/* FAQ SECTION */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{ marginBottom: '5rem' }}
          >
            <h2 style={{ textAlign: 'center', fontSize: '2rem', color: 'white', marginBottom: '2.5rem', fontWeight: 800 }}>
              Frequently Asked <span className="text-gradient-accent">Questions</span>
            </h2>
            
            <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {faqs.map((faq, idx) => (
                <motion.div
                  key={idx}
                  className="glass-panel"
                  style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }}
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  <div style={{
                    padding: '1.2rem 1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ color: 'white', fontWeight: 600, fontSize: '1rem' }}>{faq.q}</span>
                    <motion.div
                      animate={{ rotate: openFaq === idx ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown size={20} color="var(--text-muted)" />
                    </motion.div>
                  </div>
                  
                  <AnimatePresence>
                    {openFaq === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div style={{
                          padding: '0 1.5rem 1.2rem',
                          color: 'var(--text-muted)',
                          fontSize: '0.95rem',
                          lineHeight: 1.7,
                          borderTop: '1px solid rgba(255,255,255,0.05)'
                        }}>
                          <div style={{ paddingTop: '1rem' }}>{faq.a}</div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </main>
        
        {/* Footer */}
        <footer style={{
          marginTop: '2rem',
          padding: '4rem 2rem 2rem 2rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          background: 'rgba(5, 5, 10, 0.4)',
          backdropFilter: 'blur(20px)',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            maxWidth: '1200px',
            flexWrap: 'wrap',
            gap: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'linear-gradient(135deg, #00f2fe 0%, #8a2be2 100%)',
                display: 'flex', justifyContent: 'center', alignItems: 'center'
              }}>
                <span style={{ fontWeight: 900, fontSize: '1rem', color: '#030306' }}>A</span>
              </div>
              <span style={{ fontWeight: 800, letterSpacing: '0.5px', color: 'white' }}>AVERION CAREERS</span>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <Link to="/about" style={{ color: '#9494a8', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#00f2fe'} onMouseLeave={(e) => e.target.style.color = '#9494a8'}>About Us</Link>
              <Link to="/terms" style={{ color: '#9494a8', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#00f2fe'} onMouseLeave={(e) => e.target.style.color = '#9494a8'}>Terms</Link>
              <Link to="/privacy" style={{ color: '#9494a8', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#00f2fe'} onMouseLeave={(e) => e.target.style.color = '#9494a8'}>Privacy</Link>
              <Link to="/refund" style={{ color: '#ef4444', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>Refund Policy</Link>
            </div>
          </div>
          <div style={{ color: '#52526b', fontSize: '0.8rem', marginTop: '1rem' }}>
            &copy; {new Date().getFullYear()} Averion Careers. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}

export default AffiliatePage;

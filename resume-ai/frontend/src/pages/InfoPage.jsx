import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Info, HelpCircle, FileText, Shield, DollarSign, Cookie, 
  ArrowLeft, ExternalLink, ShieldCheck, Mail, CheckCircle2, AlertTriangle
} from 'lucide-react';

export default function InfoPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Map route paths to tab indices
  const getInitialTab = () => {
    const path = location.pathname.replace('/', '');
    const tabMap = {
      'about': 'about',
      'faq': 'faq',
      'terms': 'terms',
      'privacy': 'privacy',
      'refund': 'refund',
      'cookies': 'cookies'
    };
    return tabMap[path] || 'about';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  // Sync tab state with URL path
  useEffect(() => {
    const tab = getInitialTab();
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    navigate(`/${tabName}`);
  };

  const menuItems = [
    { id: 'about', label: 'About Us', icon: Info, color: '#00f2fe' },
    { id: 'faq', label: 'FAQs & Help', icon: HelpCircle, color: '#3b82f6' },
    { id: 'terms', label: 'Terms & Conditions', icon: FileText, color: '#8a2be2' },
    { id: 'privacy', label: 'Privacy Policy', icon: Shield, color: '#10b981' },
    { id: 'refund', label: 'Refund Policy', icon: DollarSign, color: '#ef4444' },
    { id: 'cookies', label: 'Cookies Policy', icon: Cookie, color: '#f59e0b' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#030306',
      backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(138, 43, 226, 0.05) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(0, 242, 254, 0.04) 0%, transparent 40%)',
      color: '#ffffff',
      fontFamily: "'Inter', sans-serif",
      padding: '2rem 1.5rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Dynamic Background Gradients */}
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0, 242, 254, 0.05) 0%, transparent 70%)',
        top: '20%',
        left: '-10%',
        filter: 'blur(80px)',
        pointerEvents: 'none'
      }} />

      {/* Main Container */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Header Block */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '3rem',
          paddingBottom: '1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #00f2fe 0%, #8a2be2 100%)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0 0 20px rgba(0, 242, 254, 0.25)'
            }}>
              <span style={{ fontWeight: 900, fontSize: '1.25rem', color: '#030306' }}>A</span>
            </div>
            <div>
              <span style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '0.5px' }}>AVERION</span>
              <span style={{ fontWeight: 300, fontSize: '1.2rem', color: '#9494a8' }}> CAREERS</span>
            </div>
          </div>

          <button 
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '10px 20px',
              borderRadius: '12px',
              color: '#d1d1e0',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.borderColor = '#00f2fe';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            }}
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
        </header>

        {/* Content Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: '2.5rem',
          alignItems: 'flex-start'
        }}>
          {/* Left Navigation Bar */}
          <nav style={{
            background: 'rgba(15, 15, 25, 0.45)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '24px',
            padding: '1.25rem',
            position: 'sticky',
            top: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '14px',
                    background: isActive ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                    border: 'none',
                    color: isActive ? '#ffffff' : '#9494a8',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.95rem',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.color = '#9494a8';
                  }}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="activeGlow"
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: '15%',
                        height: '70%',
                        width: '3.5px',
                        borderRadius: '10px',
                        background: item.color,
                        boxShadow: `0 0 10px ${item.color}`
                      }}
                    />
                  )}
                  <Icon size={18} color={isActive ? item.color : '#9494a8'} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Content Area */}
          <main style={{
            background: 'rgba(15, 15, 25, 0.3)',
            backdropFilter: 'blur(25px)',
            border: '1px solid rgba(255, 255, 255, 0.03)',
            borderRadius: '30px',
            padding: '3rem',
            boxShadow: '0 40px 80px -30px rgba(0,0,0,0.5)',
            minHeight: '600px'
          }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'about' && <AboutUsContent />}
                {activeTab === 'faq' && <FAQContent />}
                {activeTab === 'terms' && <TermsContent />}
                {activeTab === 'privacy' && <PrivacyContent />}
                {activeTab === 'refund' && <RefundContent />}
                {activeTab === 'cookies' && <CookiesContent />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* Footer */}
        <footer style={{
          marginTop: '6rem',
          textAlign: 'center',
          color: '#52526b',
          fontSize: '0.85rem',
          paddingBottom: '2rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.03)',
          paddingTop: '2rem'
        }}>
          &copy; {new Date().getFullYear()} Averion Careers. All rights reserved. Built with Neural Optimization technology.
        </footer>
      </div>
    </div>
  );
}

// ==========================================
// SUB-COMPONENTS FOR TAB CONTENTS
// ==========================================

function AboutUsContent() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
        <Info size={32} color="#00f2fe" />
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>About Us</h1>
      </div>
      <p style={{ color: '#d1d1e0', lineHeight: 1.7, fontSize: '1.05rem', marginBottom: '2rem' }}>
        Averion Careers is at the forefront of automated recruitment technology. Our mission is to democratize highly advanced, enterprise-grade resume parsing and ATS (Applicant Tracking System) tailoring, giving job seekers the exact mathematical edge they need to secure interviews in a highly competitive market.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div style={styles.contentCard}>
          <div style={{ ...styles.iconWrapper, background: 'rgba(0, 242, 254, 0.08)', borderColor: 'rgba(0, 242, 254, 0.2)' }}>
            <ShieldCheck size={20} color="#00f2fe" />
          </div>
          <h3 style={styles.cardHeader}>Neural Target Matching</h3>
          <p style={styles.cardText}>
            Our system breaks down incoming JDs into semantic node vectors and maps them to your current credentials without inflating experience details.
          </p>
        </div>

        <div style={styles.contentCard}>
          <div style={{ ...styles.iconWrapper, background: 'rgba(138, 43, 226, 0.08)', borderColor: 'rgba(138, 43, 226, 0.2)' }}>
            <CheckCircle2 size={20} color="#8a2be2" />
          </div>
          <h3 style={styles.cardHeader}>STAR Achievement Focus</h3>
          <p style={styles.cardText}>
            Every single bullet point rewritten by our AI is structured around the Action-Task-Result framework to highlight concrete impact metrics.
          </p>
        </div>
      </div>

      <h2 style={styles.sectionTitle}>Our Technology Stack</h2>
      <p style={{ color: '#9494a8', lineHeight: 1.6, marginBottom: '1.5rem' }}>
        We integrate state-of-the-art Large Language Models (LLMs) with custom parsing utilities to generate beautiful, production-ready DOCX and PDF formats. By running asynchronous processing workers, we make sure your optimization runs smoothly behind the scenes with minimal processing latency.
      </p>
    </div>
  );
}

function FAQContent() {
  const faqs = [
    {
      q: "How does the AI optimize my resume?",
      a: "Our neural engine scans the exact context and vocabulary of the Job Description you provide. It identifies core skill gaps, extracts primary keywords, and reformulates your existing descriptions to match what ATS software and recruiters look for, highlighting STAR metrics."
    },
    {
      q: "Are my educational grades protected?",
      a: "Yes! By default, Averion Careers enforces 'Grade Protection'. This guarantees that any GPA, percentage, mark, or graduation year you declare remains entirely untouched and secure from AI formatting changes."
    },
    {
      q: "Will my subscription work on the mobile app and extension?",
      a: "Absolutely! We synchronize your user session using Clerk/JWT auth. Any active tier (Starter Pro, Elite, or Apex) is automatically applied across our React Web App, Chrome Extension parser, and mobile app."
    },
    {
      q: "What is the daily credit reset timing?",
      a: "Daily credit quotas (e.g. 5 for Starter, 12 for Pro) reset automatically at 00:00 UTC every day."
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2.5rem' }}>
        <HelpCircle size={32} color="#3b82f6" />
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>Frequently Asked Questions</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
        {faqs.map((faq, i) => (
          <div key={i} style={{
            background: 'rgba(255, 255, 255, 0.01)',
            border: '1px solid rgba(255, 255, 255, 0.03)',
            borderRadius: '20px',
            padding: '1.5rem 1.8rem'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', margin: '0 0 0.8rem 0' }}>
              Q. {faq.q}
            </h3>
            <p style={{ color: '#9494a8', lineHeight: 1.6, margin: 0, fontSize: '0.95rem' }}>
              {faq.a}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TermsContent() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
        <FileText size={32} color="#8a2be2" />
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>Terms of Service</h1>
      </div>
      <p style={{ color: '#52526b', fontSize: '0.85rem', marginBottom: '2rem' }}>Last updated: July 6, 2026</p>

      <div style={styles.richText}>
        <h2>1. Acceptance of Terms</h2>
        <p>
          By creating an account or using the Averion Careers resume generation services on our website, mobile application, or browser extensions, you agree to comply with and be bound by these Terms of Service.
        </p>

        <h2>2. Subscription and Usage Tiers</h2>
        <p>
          We offer dynamic subscription levels subject to credit limits. Daily allocations are governed by strict database records and cannot be rolled over to the next day. Any attempt to bypass, script, or abuse API rate limits will lead to immediate account termination.
        </p>

        <h2>3. Accuracy of Credentials</h2>
        <p>
          Our platform performs semantic adjustments to format your experiences effectively. You remain solely responsible for validating the accuracy and truthfulness of your final generated resumes before sending them to employers.
        </p>
      </div>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
        <Shield size={32} color="#10b981" />
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>Privacy Policy</h1>
      </div>
      <p style={{ color: '#52526b', fontSize: '0.85rem', marginBottom: '2rem' }}>Last updated: July 6, 2026</p>

      <div style={styles.richText}>
        <h2>1. Information We Collect</h2>
        <p>
          We capture authorization data via secure Google Sign-In protocols (storing identifiers under JWT tokens). We store the text contents of your uploaded resume templates and job descriptions solely for processing optimization operations.
        </p>

        <h2>2. Data Processing and Storage</h2>
        <p>
          All resume parsing operations are processed securely via transient worker queues. Completed resume PDF files are stored in secure object cloud repositories (R2/S3 storage) for up to 15 minutes before being garbage-collected to preserve privacy.
        </p>

        <h2>3. Third-party APIs</h2>
        <p>
          We utilize external LLMs (such as Google Gemini APIs) to perform tailoring. Your data is sent as raw prompts for contextual processing and is never used by upstream providers to train public models.
        </p>
      </div>
    </div>
  );
}

function RefundContent() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
        <DollarSign size={32} color="#ef4444" />
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>Refund Policy</h1>
      </div>
      <p style={{ color: '#52526b', fontSize: '0.85rem', marginBottom: '2rem' }}>Last updated: July 6, 2026</p>

      {/* Warning Box */}
      <div style={{
        background: 'rgba(239, 68, 68, 0.08)',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        borderRadius: '20px',
        padding: '1.5rem 1.8rem',
        display: 'flex',
        gap: '16px',
        alignItems: 'flex-start',
        marginBottom: '2rem'
      }}>
        <AlertTriangle size={24} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ color: '#ffffff', fontWeight: 700, margin: '0 0 0.5rem 0', fontSize: '1.05rem' }}>Important: Strict No-Refunds Policy</h4>
          <p style={{ color: '#e6c3c3', margin: 0, fontSize: '0.9rem', lineHeight: 1.5 }}>
            Due to the high computational costs associated with processing and tailoring resumes through advanced Large Language Models, all sales on Averion Careers are final.
          </p>
        </div>
      </div>

      <div style={styles.richText}>
        <h2>1. Why We Do Not Offer Refunds</h2>
        <p>
          Every time you run an optimization job or extract structural data from a job description, our systems invoke direct neural calculations through premium APIs (such as Google Gemini) and spin up background formatting workers. These operations incur immediate, irreversible infrastructure costs.
        </p>
        <p>
          Consequently, **we do not provide refunds, credits, or pro-rated billing** for any subscription plan once a transaction has been successfully completed.
        </p>

        <h2>2. Cancel Anytime</h2>
        <p>
          You have full control over your subscription status. You can cancel your monthly renewal package at any time directly through the Billing & Settings panel on your Dashboard. Upon cancellation, your premium credits will remain completely active and usable until the end of your current active billing cycle.
        </p>

        <h2>3. Failed Transactions</h2>
        <p>
          In the event of a duplicate charge or failed transaction where a bank debit occurs without credits being updated on your account, please reach out immediately with your Razorpay transaction ID to <span style={{ color: '#00f2fe', fontWeight: 600 }}>support@averioncareers.com</span>.
        </p>
      </div>
    </div>
  );
}

function CookiesContent() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
        <Cookie size={32} color="#f59e0b" />
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>Cookies Policy</h1>
      </div>
      <p style={{ color: '#52526b', fontSize: '0.85rem', marginBottom: '2rem' }}>Last updated: July 6, 2026</p>

      <div style={styles.richText}>
        <h2>1. How We Use Cookies</h2>
        <p>
          We use essential browser cookies and local storage tokens to keep you logged in to your dashboard across page refreshes.
        </p>

        <h2>2. Types of Cookies in Use</h2>
        <ul>
          <li><strong>Authentication Tokens:</strong> Stored locally (`jwt_token` inside LocalStorage) to uniquely verify your identity when communication occurs with our endpoints.</li>
          <li><strong>Performance Monitoring:</strong> Standard telemetry cookies (via Sentry) to log performance parameters and catch errors to improve user experience.</li>
        </ul>

        <h2>3. Disabling Cookies</h2>
        <p>
          You can disable local storage cookies directly through your browser privacy controls. However, doing so will prevent you from accessing your workspace dashboard or generating optimized resumes.
        </p>
      </div>
    </div>
  );
}

const styles = {
  contentCard: {
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    borderRadius: '20px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  iconWrapper: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    borderWidth: '1px',
    borderStyle: 'solid',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardHeader: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#ffffff',
    margin: 0
  },
  cardText: {
    color: '#9494a8',
    fontSize: '0.9rem',
    lineHeight: 1.5,
    margin: 0
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 800,
    marginTop: '2.5rem',
    marginBottom: '1rem',
    fontFamily: "'Space Grotesk', sans-serif"
  },
  richText: {
    color: '#d1d1e0',
    lineHeight: 1.7,
    fontSize: '0.95rem',
    '& h2': {
      color: '#ffffff',
      fontSize: '1.25rem',
      fontWeight: 700,
      marginTop: '2rem',
      marginBottom: '0.8rem'
    },
    '& p': {
      marginBottom: '1.2rem'
    },
    '& ul': {
      paddingLeft: '20px',
      marginBottom: '1.2rem'
    },
    '& li': {
      marginBottom: '0.5rem',
      color: '#9494a8'
    }
  }
};

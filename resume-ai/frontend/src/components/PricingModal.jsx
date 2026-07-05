import React from 'react';
import { motion } from 'framer-motion';
import { X, Check, Zap, Sparkles, Star, Award } from 'lucide-react';

const PLANS = [
  {
    name: 'Free Starter',
    price: '₹0',
    period: 'forever',
    description: 'Perfect for a quick update or testing out our AI neural parser.',
    resumes: '3 Resumes Total',
    features: [
      '3 Tailored Resumes total',
      'ATS score optimization check',
      'Standard template output',
      'PDF direct download link',
      'Academic scores retention'
    ],
    color: '#9494a8',
    gradient: 'linear-gradient(135deg, rgba(148, 148, 168, 0.1) 0%, rgba(148, 148, 168, 0.03) 100%)',
    borderGlow: 'rgba(148, 148, 168, 0.2)',
    badgeIcon: Star,
    popular: false
  },
  {
    name: 'Starter Pro',
    price: '₹449',
    period: 'month',
    description: 'Designed for active job seekers targeting multiple fields.',
    resumes: '5 Resumes Daily',
    features: [
      '5 Tailored Resumes daily',
      'Custom PDF filenames',
      'Advanced ATS tailoring (STAR method)',
      'Direct system notification download',
      'No ads / background processing priority',
      'Chrome Extension access'
    ],
    color: '#00f2fe',
    gradient: 'linear-gradient(135deg, rgba(0, 242, 254, 0.15) 0%, rgba(79, 172, 254, 0.05) 100%)',
    borderGlow: 'rgba(0, 242, 254, 0.3)',
    badgeIcon: Zap,
    popular: false,
    buttonId: 'pl_T9vLKHdlNPrIjy'
  },
  {
    name: 'Elite Executive',
    price: '₹849',
    period: 'month',
    description: 'Our most popular plan for power users and competitive SDE applications.',
    resumes: '12 Resumes Daily',
    features: [
      '12 Tailored Resumes daily',
      'Magic Redesign templates 🪄',
      'Full ATS keyword optimization',
      'Highest AI engine queue priority',
      'Dedicated dashboard profile storage',
      'All premium certification link injections'
    ],
    color: '#8a2be2',
    gradient: 'linear-gradient(135deg, rgba(138, 43, 226, 0.2) 0%, rgba(99, 29, 194, 0.05) 100%)',
    borderGlow: 'rgba(138, 43, 226, 0.5)',
    badgeIcon: Sparkles,
    popular: true,
    buttonId: 'pl_T9vNdCidB5goIU'
  },
  {
    name: 'Infinite Apex',
    price: '₹1149',
    period: 'month',
    description: 'Ultimate power plan for consultants and high-volume applications.',
    resumes: '25 Resumes Daily',
    features: [
      '25 Tailored Resumes daily',
      'All features of Elite Executive',
      'Multiple base profile storage (SDE, PM, QA)',
      '1-on-1 resume review discount',
      'Unlimited download rebuild actions',
      'Priority customer support'
    ],
    color: '#ffaa00',
    gradient: 'linear-gradient(135deg, rgba(255, 170, 0, 0.2) 0%, rgba(255, 100, 0, 0.05) 100%)',
    borderGlow: 'rgba(255, 170, 0, 0.5)',
    badgeIcon: Award,
    popular: false,
    buttonId: 'pl_T9vPEEoTvv2QRI'
  }
];

function RazorpayButton({ buttonId }) {
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    if (!buttonId) return;
    
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    const form = document.createElement('form');
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
    script.setAttribute('data-payment_button_id', buttonId);
    script.async = true;

    form.appendChild(script);
    if (containerRef.current) {
      containerRef.current.appendChild(form);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [buttonId]);

  return <div ref={containerRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }} />;
}

export default function PricingModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(3, 3, 5, 0.85)',
        backdropFilter: 'blur(25px)',
        WebkitBackdropFilter: 'blur(25px)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem 1rem',
        overflowY: 'auto'
      }}
    >
      {/* Background Glowing Blobs */}
      <div 
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(138, 43, 226, 0.15) 0%, transparent 70%)',
          top: '10%',
          left: '15%',
          filter: 'blur(50px)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
      <div 
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 242, 254, 0.12) 0%, transparent 70%)',
          bottom: '10%',
          right: '15%',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        transition={{ type: 'spring', duration: 0.6 }}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '1400px',
          background: 'rgba(15, 15, 25, 0.45)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '30px',
          padding: '2.5rem',
          boxShadow: '0 50px 100px -20px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(255, 255, 255, 0.03)',
          zIndex: 1,
          margin: 'auto 0'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 75, 75, 0.2)';
            e.currentTarget.style.borderColor = 'rgba(255, 75, 75, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          }}
        >
          <X size={20} color="white" />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span 
            style={{
              padding: '6px 16px',
              background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.2), rgba(0, 242, 254, 0.2))',
              border: '1px solid rgba(138, 43, 226, 0.3)',
              borderRadius: '100px',
              color: '#00f2fe',
              fontWeight: 800,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              display: 'inline-block',
              marginBottom: '1rem',
              boxShadow: '0 0 20px rgba(0, 242, 254, 0.15)'
            }}
          >
            Pricing & Subscriptions
          </span>
          <h2 style={{ fontSize: '3rem', fontWeight: 800, margin: '0 0 0.8rem 0', fontFamily: "'Space Grotesk', sans-serif" }}>
            Choose Your <span style={{
              background: 'linear-gradient(135deg, #00f2fe 0%, #8a2be2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Neural Limit</span>
          </h2>
          <p style={{ color: '#9494a8', fontSize: '1.15rem', maxWidth: '600px', margin: '0 auto' }}>
            Scale up your tailoring constraints. Upgrade instantly to match competitive industry standards.
          </p>
        </div>

        {/* Grid of Plans */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem'
          }}
        >
          {PLANS.map((plan, idx) => {
            const BadgeIcon = plan.badgeIcon;
            return (
              <motion.div
                key={plan.name}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                style={{
                  background: plan.gradient,
                  borderRadius: '24px',
                  border: plan.popular ? `2px solid ${plan.color}` : '1px solid rgba(255, 255, 255, 0.05)',
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: plan.popular 
                    ? `0 30px 60px -15px rgba(138, 43, 226, 0.3), inset 0 0 0 1px ${plan.borderGlow}` 
                    : `0 20px 40px -10px rgba(0,0,0,0.5), inset 0 0 0 1px ${plan.borderGlow}`,
                  transition: 'border-color 0.3s'
                }}
              >
                {/* Popular Ribbon / Badge */}
                {plan.popular && (
                  <div 
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: plan.color,
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '4px 12px',
                      borderRadius: '100px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: `0 0 15px ${plan.color}`
                    }}
                  >
                    <Star size={12} fill="white" />
                    Popular
                  </div>
                )}

                {/* Plan Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                  <div 
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: `rgba(255, 255, 255, 0.05)`,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      border: `1px solid ${plan.borderGlow}`
                    }}
                  >
                    <BadgeIcon size={18} color={plan.color} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>
                    {plan.name}
                  </h3>
                </div>

                <p style={{ color: '#9494a8', fontSize: '0.9rem', minHeight: '45px', margin: '0 0 1.5rem 0', lineHeight: 1.4 }}>
                  {plan.description}
                </p>

                {/* Pricing Block */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '0.8rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white' }}>{plan.price}</span>
                  <span style={{ color: '#9494a8', fontSize: '0.9rem' }}>/{plan.period}</span>
                </div>

                <div 
                  style={{
                    color: plan.color,
                    fontWeight: 800,
                    fontSize: '1rem',
                    marginBottom: '1.5rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  ⚡ {plan.resumes}
                </div>

                {/* Divider */}
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', marginBottom: '1.5rem' }} />

                {/* Features List */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '2rem' }}>
                  {plan.features.map(feat => (
                    <div key={feat} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <div 
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: `rgba(255, 255, 255, 0.03)`,
                          border: `1px solid ${plan.borderGlow}`,
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginTop: '2px',
                          flexShrink: 0
                        }}
                      >
                        <Check size={10} color={plan.color} strokeWidth={3} />
                      </div>
                      <span style={{ color: '#d1d1e0', fontSize: '0.85rem', lineHeight: 1.3 }}>{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Action button */}
                {/* Action button */}
                {plan.price === '₹0' ? (
                  <button
                    style={{
                      width: '100%',
                      padding: '12px 24px',
                      borderRadius: '12px',
                      background: 'rgba(255,255,255,0.03)',
                      border: `1px solid ${plan.borderGlow}`,
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                    onClick={onClose}
                  >
                    Get Started
                  </button>
                ) : (
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
                    <RazorpayButton buttonId={plan.buttonId} />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

import React from 'react';
import {
  ShieldCheck,
  Zap,
  Package,
  History,
  Sparkles,
  Clock,
  Layers,
  Bell,
  User,
  ChevronDown,
  HelpCircle
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  pendingCount,
  onOpenSimulate,
  onOpenAudit,
  onOpenZapier,
  isMockMode,
  setIsMockMode
}) {
  return (
    <header style={{ marginBottom: '24px' }}>
      {/* Primary Top Bar - Authentic PayPal Corporate Dark Navy */}
      <div style={{
        background: '#001c64',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        width: '100%'
      }}>
        <div style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 32px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#ffffff'
        }}>
          {/* Brand & Left Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            {/* Authentic PayPal Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <svg width="26" height="32" viewBox="0 0 28 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.16 7.64C22.61 3.51 19.34 0.5 14.58 0.5H4.25C3.51 0.5 2.87 1.04 2.76 1.77L0.03 19.16C-0.07 19.8 0.42 20.36 1.07 20.36H6.84L5.19 30.82C5.09 31.46 5.58 32.02 6.23 32.02H11.51C12.19 32.02 12.77 31.53 12.87 30.86L14.77 18.79L14.86 18.23C14.96 17.56 15.54 17.07 16.22 17.07H17.43C22.25 17.07 26.04 15.11 27.17 9.42C27.67 6.89 26.68 7.64 23.16 7.64Z" fill="#0079C1"/>
                <path d="M23.16 7.64C22.61 3.51 19.34 0.5 14.58 0.5H4.25C3.51 0.5 2.87 1.04 2.76 1.77L0.03 19.16C-0.07 19.8 0.42 20.36 1.07 20.36H6.84L8.51 9.81C8.61 9.14 9.19 8.65 9.87 8.65H18.79C22.56 8.65 25.56 10.19 24.69 14.58C24.47 15.68 23.95 16.52 23.16 7.64Z" fill="#00457C"/>
                <path d="M10.15 17.07L8.48 27.62C8.38 28.29 8.87 28.85 9.52 28.85H13.6C14.28 28.85 14.86 28.36 14.96 27.69L16.22 17.07H10.15Z" fill="#0079C1"/>
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: '1.1' }}>
                  PayPal <span style={{ fontWeight: 400, opacity: 0.85, fontSize: '0.95rem' }}>Business</span>
                </span>
              </div>
            </div>

            {/* Navigation Links */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={() => setActiveTab('disputes')}
                style={{
                  background: activeTab === 'disputes' ? 'rgba(255, 255, 255, 0.16)' : 'transparent',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-pill)',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background 0.15s'
                }}
              >
                <ShieldCheck size={16} />
                Resolution Center
                {pendingCount > 0 && (
                  <span style={{
                    background: '#d92d20',
                    color: '#ffffff',
                    fontSize: '0.7rem',
                    borderRadius: '999px',
                    padding: '2px 7px',
                    fontWeight: 800
                  }}>
                    {pendingCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('timeline')}
                style={{
                  background: activeTab === 'timeline' ? 'rgba(255, 255, 255, 0.16)' : 'transparent',
                  color: activeTab === 'timeline' ? '#ffffff' : 'rgba(255, 255, 255, 0.8)',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-pill)',
                  fontWeight: 600,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background 0.15s'
                }}
              >
                <Clock size={16} />
                Deadline Timeline
              </button>

              <button
                onClick={() => setActiveTab('restock')}
                style={{
                  background: activeTab === 'restock' ? 'rgba(255, 255, 255, 0.16)' : 'transparent',
                  color: activeTab === 'restock' ? '#ffffff' : 'rgba(255, 255, 255, 0.8)',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-pill)',
                  fontWeight: 600,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background 0.15s'
                }}
              >
                <Package size={16} />
                Channel3 Restock
              </button>
            </nav>
          </div>

          {/* Right Tools & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Simulate Webhook Button */}
            <button
              onClick={onOpenSimulate}
              className="btn btn-paypal-gold"
              style={{ padding: '7px 16px', fontSize: '0.8rem' }}
              title="Simulate incoming PayPal dispute webhook"
            >
              <Sparkles size={14} />
              Simulate Dispute
            </button>

            {/* Zapier Modal Trigger */}
            <button
              onClick={onOpenZapier}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: 'var(--radius-pill)',
                color: '#ffffff',
                padding: '7px 14px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Zap size={14} color="#ffc439" />
              Zapier
            </button>

            {/* Audit Ledger Trigger */}
            <button
              onClick={onOpenAudit}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: 'var(--radius-pill)',
                color: '#ffffff',
                padding: '7px 14px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <History size={14} />
              Audit Ledger
            </button>

            {/* Mock / Live Engine Switch */}
            <button
              onClick={() => setIsMockMode(!isMockMode)}
              style={{
                background: isMockMode ? 'rgba(234, 179, 8, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                border: `1px solid ${isMockMode ? '#eab308' : '#22c55e'}`,
                borderRadius: 'var(--radius-pill)',
                color: '#ffffff',
                padding: '6px 12px',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: isMockMode ? '#facc15' : '#4ade80'
              }} />
              {isMockMode ? 'Mock Mode' : 'Live Sandbox'}
            </button>

            {/* Profile Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              borderLeft: '1px solid rgba(255, 255, 255, 0.15)',
              paddingLeft: '12px',
              marginLeft: '2px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#0070ba',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.82rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }}>
                M
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary PayPal Sub-Header / Breadcrumb Banner with max-width alignment */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid var(--border-light)',
        width: '100%'
      }}>
        <div style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '18px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{ fontSize: '0.76rem', color: '#687173', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              PayPal Merchant Operations &gt; Resolution Center
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#003087', marginTop: '2px', letterSpacing: '-0.02em' }}>
              Resolution Center
            </h1>
            <p style={{ fontSize: '0.84rem', color: '#475569', marginTop: '2px' }}>
              Review, contest, and resolve buyer disputes. Powered by AI evidence drafting with mandatory human sign-off.
            </p>
          </div>

          {/* PayPal Seller Protection Notice Card */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 'var(--radius-md)',
            padding: '10px 18px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
          }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: '#dcfce7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <ShieldCheck size={20} color="#15803d" />
            </div>
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#166534' }}>
                PayPal Seller Protection Active
              </div>
              <div style={{ fontSize: '0.75rem', color: '#15803d' }}>
                Covered orders with proof of delivery are safeguarded against chargebacks.
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

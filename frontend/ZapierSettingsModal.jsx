import React, { useState } from 'react';
import {
  Zap,
  CheckCircle2,
  X,
  MessageSquare,
  FileSpreadsheet,
  Send,
  ExternalLink,
  Code
} from 'lucide-react';
import { api } from './apiClient.js';

export default function ZapierSettingsModal({ onClose }) {
  const [testNotificationResult, setTestNotificationResult] = useState(null);
  const [testAuditResult, setTestAuditResult] = useState(null);
  const [loadingNotification, setLoadingNotification] = useState(false);
  const [loadingAudit, setLoadingAudit] = useState(false);

  const handleTestNotification = async () => {
    try {
      setLoadingNotification(true);
      const res = await api.testZapierNotification();
      setTestNotificationResult(res);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoadingNotification(false);
    }
  };

  const handleTestAudit = async () => {
    try {
      setLoadingAudit(true);
      const res = await api.testZapierAudit();
      setTestAuditResult(res);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoadingAudit(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-fade" style={{ maxWidth: '680px' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border-light)',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#fff8e6',
              border: '1px solid #ffe399',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Zap size={22} color="#b45309" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#003087' }}>
                Zapier Automated Workflows
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#475569' }}>
                Automated multi-channel notifications and compliance logging
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Workflow 1: New Dispute Notification */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-md)',
          padding: '18px',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={18} color="#0070ba" />
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#003087' }}>
                Flow 1: Real-Time Slack & Email Alerts
              </h3>
            </div>
            <button
              onClick={handleTestNotification}
              disabled={loadingNotification}
              className="btn btn-paypal-outline"
              style={{ padding: '5px 14px', fontSize: '0.78rem' }}
            >
              <Send size={13} />
              {loadingNotification ? 'Firing...' : 'Test Webhook'}
            </button>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#334155', lineHeight: '1.5', marginBottom: '10px' }}>
            Whenever PayPal emits a dispute webhook, the Copilot prepares the draft and dispatches a rich message to your Slack channel with the dispute details, win score, and 1-click approval URL.
          </p>

          {testNotificationResult && (
            <div style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              padding: '10px 14px',
              borderRadius: '6px',
              fontSize: '0.76rem',
              color: '#065f46',
              fontWeight: 600
            }}>
              ✓ Dispatched to Zapier: {testNotificationResult.webhook_url}
            </div>
          )}
        </div>

        {/* Workflow 2: Approved Dispute Google Sheet Audit Log */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-md)',
          padding: '18px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileSpreadsheet size={18} color="#007b36" />
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#003087' }}>
                Flow 2: Google Sheets Audit Trail
              </h3>
            </div>
            <button
              onClick={handleTestAudit}
              disabled={loadingAudit}
              className="btn btn-paypal-outline"
              style={{ padding: '5px 14px', fontSize: '0.78rem' }}
            >
              <Send size={13} />
              {loadingAudit ? 'Logging...' : 'Test Webhook'}
            </button>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#334155', lineHeight: '1.5', marginBottom: '10px' }}>
            When a human seller approves a dispute draft, Zapier automatically appends an audit row to your Google Sheet containing the dispute ID, approver name, tracking proof, and timestamp.
          </p>

          {testAuditResult && (
            <div style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              padding: '10px 14px',
              borderRadius: '6px',
              fontSize: '0.76rem',
              color: '#065f46',
              fontWeight: 600
            }}>
              ✓ Dispatched audit entry to Zapier: {testAuditResult.webhook_url}
            </div>
          )}
        </div>

        {/* Environment Variable Hint */}
        <div style={{
          padding: '12px 16px',
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '8px',
          fontSize: '0.8rem',
          color: '#1e40af'
        }}>
          💡 <strong>Setup Tip:</strong> Configure <code>ZAPIER_DISPUTE_WEBHOOK_URL</code> and <code>ZAPIER_AUDIT_WEBHOOK_URL</code> in your <code>.env</code> file or Render dashboard to connect to your live Zapier Zaps!
        </div>
      </div>
    </div>
  );
}

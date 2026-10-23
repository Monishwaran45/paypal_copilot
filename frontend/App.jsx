import React, { useState, useEffect } from 'react';
import Navbar from './Navbar.jsx';
import DisputeGrid from './DisputeGrid.jsx';
import DetailPanel from './DetailPanel.jsx';
import DeadlineTimeline from './DeadlineTimeline.jsx';
import RestockChannel3 from './RestockChannel3.jsx';
import AuditTrailModal from './AuditTrailModal.jsx';
import ZapierSettingsModal from './ZapierSettingsModal.jsx';
import SimulateDisputeModal from './SimulateDisputeModal.jsx';
import { initialMockDisputes } from './initialMockData.js';
import { api } from './apiClient.js';

export default function App() {
  const [activeTab, setActiveTab] = useState('disputes'); // 'disputes' | 'timeline' | 'restock'
  const [disputes, setDisputes] = useState(initialMockDisputes);
  const [selectedDispute, setSelectedDispute] = useState(initialMockDisputes[0]);
  const [isMockMode, setIsMockMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showZapierModal, setShowZapierModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Fetch disputes on initial load or mode change
  useEffect(() => {
    loadDisputes();
  }, [isMockMode]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  const loadDisputes = async () => {
    if (isMockMode) {
      setDisputes(initialMockDisputes);
      if (!selectedDispute) setSelectedDispute(initialMockDisputes[0]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await api.getDisputes();
      if (res.disputes && res.disputes.length > 0) {
        setDisputes(res.disputes);
        setSelectedDispute(prev => {
          if (!prev) return res.disputes[0];
          const matched = res.disputes.find(d => d.dispute_id === prev.dispute_id);
          return matched || res.disputes[0];
        });
      }
    } catch (err) {
      console.warn('Backend API unavailable, using mock data:', err);
      setDisputes(initialMockDisputes);
      if (!selectedDispute) setSelectedDispute(initialMockDisputes[0]);
    } finally {
      setLoading(false);
    }
  };

  // Handle 1-Click Human Approval
  const handleApprove = async (disputeId, approverName) => {
    try {
      if (isMockMode) {
        setDisputes(prev => prev.map(d => {
          if (d.dispute_id === disputeId) {
            return {
              ...d,
              status: 'UNDER_REVIEW',
              seller_approval: {
                approved: true,
                approved_at: new Date().toISOString(),
                approver_id: approverName,
                rejection_reason: null
              }
            };
          }
          return d;
        }));
        setSelectedDispute(prev => ({
          ...prev,
          status: 'UNDER_REVIEW',
          seller_approval: {
            approved: true,
            approved_at: new Date().toISOString(),
            approver_id: approverName,
            rejection_reason: null
          }
        }));
        showToast(`Dispute ${disputeId} approved and submitted to PayPal!`);
        return;
      }

      const res = await api.approveDispute(disputeId, approverName);
      if (res.dispute) {
        setDisputes(prev => prev.map(d => d.dispute_id === disputeId ? res.dispute : d));
        setSelectedDispute(res.dispute);
        showToast(`Dispute ${disputeId} approved & submitted with audit hash ${res.audit?.hash?.substring(0, 8)}...`);
      }
    } catch (err) {
      alert('Approval failed: ' + err.message);
    }
  };

  // Handle Reject/Concede Claim
  const handleReject = async (disputeId, reason) => {
    try {
      if (isMockMode) {
        setDisputes(prev => prev.map(d => {
          if (d.dispute_id === disputeId) {
            return {
              ...d,
              status: 'RESOLVED',
              seller_approval: {
                approved: false,
                conceded: true,
                approved_at: new Date().toISOString(),
                approver_id: 'seller_merchant',
                rejection_reason: reason
              }
            };
          }
          return d;
        }));
        setSelectedDispute(prev => ({
          ...prev,
          status: 'RESOLVED',
          seller_approval: {
            approved: false,
            conceded: true,
            approved_at: new Date().toISOString(),
            approver_id: 'seller_merchant',
            rejection_reason: reason
          }
        }));
        showToast(`Claim conceded and buyer refunded.`);
        return;
      }

      const res = await api.rejectDispute(disputeId, reason);
      if (res.dispute) {
        setDisputes(prev => prev.map(d => d.dispute_id === disputeId ? res.dispute : d));
        setSelectedDispute(res.dispute);
        showToast(`Dispute ${disputeId} claim conceded.`);
      }
    } catch (err) {
      alert('Action failed: ' + err.message);
    }
  };

  // Handle Evidence Save
  const handleSaveEvidence = async (disputeId, text) => {
    if (isMockMode) {
      setDisputes(prev => prev.map(d => d.dispute_id === disputeId ? { ...d, ai_drafted_evidence: text } : d));
      setSelectedDispute(prev => ({ ...prev, ai_drafted_evidence: text }));
      return;
    }
    const res = await api.updateEvidence(disputeId, text);
    if (res.dispute) {
      setDisputes(prev => prev.map(d => d.dispute_id === disputeId ? res.dispute : d));
      setSelectedDispute(res.dispute);
    }
  };

  // Handle New Dispute Simulated
  const handleSimulated = (newDispute) => {
    setDisputes(prev => [newDispute, ...prev]);
    setSelectedDispute(newDispute);
    setActiveTab('disputes');
    showToast(`Incoming PayPal dispute ${newDispute.dispute_id} analyzed! Win score: ${newDispute.win_score}%`);
  };

  const pendingCount = disputes.filter(d => d.status === 'WAITING_FOR_SELLER_RESPONSE').length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f5f7fa' }}>
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={pendingCount}
        onOpenSimulate={() => setShowSimulateModal(true)}
        onOpenAudit={() => setShowAuditModal(true)}
        onOpenZapier={() => setShowZapierModal(true)}
        isMockMode={isMockMode}
        setIsMockMode={setIsMockMode}
      />

      {/* PayPal Style Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '32px',
          zIndex: 2000,
          background: '#003087',
          color: '#ffffff',
          boxShadow: '0 10px 25px rgba(0, 48, 135, 0.35)',
          borderRadius: 'var(--radius-pill)',
          padding: '12px 24px',
          fontSize: '0.88rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }} className="animate-fade">
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80' }} />
          {toastMessage}
        </div>
      )}

      {/* Main Content Area */}
      <main style={{ flex: 1, maxWidth: '1440px', width: '100%', margin: '0 auto', padding: '0 32px 48px 32px' }}>
        {activeTab === 'disputes' && (
          <div>
            {/* AG Grid Dispute Table */}
            <DisputeGrid
              disputes={disputes}
              selectedDispute={selectedDispute}
              onSelectDispute={(d) => setSelectedDispute(d)}
            />

            {/* Case Detail Panel & Evidence Studio */}
            {selectedDispute && (
              <DetailPanel
                dispute={selectedDispute}
                onApprove={handleApprove}
                onReject={handleReject}
                onSaveEvidence={handleSaveEvidence}
                onClose={() => setSelectedDispute(null)}
              />
            )}
          </div>
        )}

        {activeTab === 'timeline' && (
          <DeadlineTimeline
            disputes={disputes}
            onSelectDispute={(d) => {
              setSelectedDispute(d);
              setActiveTab('disputes');
            }}
          />
        )}

        {activeTab === 'restock' && (
          <RestockChannel3 />
        )}
      </main>

      {/* Modals */}
      {showSimulateModal && (
        <SimulateDisputeModal
          onClose={() => setShowSimulateModal(false)}
          onSimulated={handleSimulated}
        />
      )}

      {showAuditModal && (
        <AuditTrailModal
          disputeId={selectedDispute?.dispute_id}
          onClose={() => setShowAuditModal(false)}
        />
      )}

      {showZapierModal && (
        <ZapierSettingsModal
          onClose={() => setShowZapierModal(false)}
        />
      )}

      {/* Official PayPal Style Footer */}
      <footer style={{
        background: '#ffffff',
        borderTop: '1px solid var(--border-light)',
        padding: '24px 32px',
        fontSize: '0.8rem',
        color: '#687173'
      }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '20px', fontWeight: 600, color: '#0070ba' }}>
            <span style={{ cursor: 'pointer' }}>Help & Contact</span>
            <span style={{ cursor: 'pointer' }}>Security</span>
            <span style={{ cursor: 'pointer' }}>Seller Protection</span>
            <span style={{ cursor: 'pointer' }}>Legal</span>
            <span style={{ cursor: 'pointer' }}>Privacy</span>
          </div>

          <div>
            © 2026 PayPal AI Dispute Copilot • Powered by PayPal Sandbox, AG Grid, Bryntum, Zapier, Elastic, KERNEL, Channel3 & Render
          </div>
        </div>
      </footer>
    </div>
  );
}

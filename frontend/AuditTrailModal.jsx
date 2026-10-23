import React, { useState, useEffect } from 'react';
import {
  History,
  ShieldCheck,
  CheckCircle2,
  X,
  Hash,
  UserCheck,
  Cpu,
  ArrowRight
} from 'lucide-react';
import { api } from './apiClient.js';

export default function AuditTrailModal({ onClose, disputeId }) {
  const [trail, setTrail] = useState([]);
  const [integrity, setIntegrity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAudit();
  }, [disputeId]);

  const loadAudit = async () => {
    try {
      setLoading(true);
      const res = await api.getAuditTrail(disputeId);
      setTrail(res.audit_trail || []);
      setIntegrity(res.ledger_integrity || { valid: true });
    } catch (err) {
      console.warn('Failed to fetch audit trail:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-fade" style={{ maxWidth: '820px' }}>
        {/* Modal Header */}
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
              background: '#e0f2fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <History size={22} color="#0070ba" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#003087' }}>
                Cryptographic Audit Ledger
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#475569' }}>
                SHA-256 chained audit entries guaranteeing immutable human-in-the-loop compliance
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: integrity?.valid ? '#ecfdf5' : '#fef2f2',
              border: `1.5px solid ${integrity?.valid ? '#a7f3d0' : '#fecaca'}`,
              borderRadius: 'var(--radius-pill)',
              padding: '5px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.74rem',
              color: integrity?.valid ? '#065f46' : '#991b1b',
              fontWeight: 700
            }}>
              <ShieldCheck size={14} color={integrity?.valid ? '#059669' : '#dc2626'} />
              {integrity?.valid ? 'Chain Integrity: 100% Valid' : 'Integrity Mismatch'}
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
        </div>

        {/* Audit Log Entries List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '65vh', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
              Loading cryptographic ledger...
            </div>
          ) : trail.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
              No audit logs recorded yet.
            </div>
          ) : (
            trail.map((entry, idx) => {
              const isHuman = entry.actor?.type?.includes('HUMAN');
              const isAI = entry.actor?.type === 'AI';

              return (
                <div
                  key={entry.entryId}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    fontSize: '0.84rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="font-mono" style={{ color: '#0070ba', fontWeight: 800, fontSize: '0.88rem' }}>
                        {entry.entryId}
                      </span>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-pill)',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        background: isHuman ? '#ecfdf5' : isAI ? '#f5f3ff' : '#f1f5f9',
                        color: isHuman ? '#065f46' : isAI ? '#6b21a8' : '#475569',
                        border: `1px solid ${isHuman ? '#a7f3d0' : isAI ? '#ddd6fe' : '#e2e8f0'}`
                      }}>
                        {isHuman ? 'HUMAN SELLER SIGNATURE' : isAI ? 'AI AGENT DRAFT' : entry.actor?.type || 'SYSTEM'}
                      </span>
                      <span style={{
                        fontSize: '0.74rem',
                        color: '#64748b'
                      }}>
                        Dispute: <strong style={{ color: '#0f172a' }}>{entry.disputeId}</strong>
                      </span>
                    </div>

                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <p style={{ color: '#1e293b', marginBottom: '10px', lineHeight: '1.5' }}>
                    {entry.details}
                  </p>

                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    background: '#ffffff',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.72rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: '#64748b', minWidth: '85px', fontWeight: 600 }}>SHA-256 Hash:</span>
                      <span className="font-mono" style={{ color: '#003087', fontWeight: 600, wordBreak: 'break-all' }}>
                        {entry.hash}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: '#64748b', minWidth: '85px', fontWeight: 600 }}>Previous Link:</span>
                      <span className="font-mono" style={{ color: '#64748b', wordBreak: 'break-all' }}>
                        {entry.prevHash}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

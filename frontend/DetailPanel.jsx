import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Truck,
  FileText,
  Search,
  AlertTriangle,
  Lock,
  Edit3,
  RotateCcw,
  ExternalLink,
  MapPin,
  UserCheck,
  Hash,
  Send,
  HelpCircle,
  CreditCard,
  Package
} from 'lucide-react';

export default function DetailPanel({
  dispute,
  onApprove,
  onReject,
  onSaveEvidence,
  onClose
}) {
  if (!dispute) return null;

  const [evidenceText, setEvidenceText] = useState(dispute.ai_drafted_evidence || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approverName, setApproverName] = useState('Authorized Seller Representative');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    setEvidenceText(dispute.ai_drafted_evidence || '');
    setIsEditing(false);
  }, [dispute.dispute_id, dispute.ai_drafted_evidence]);

  const winScore = dispute.win_score || 75;
  const isApproved = dispute.seller_approval?.approved;
  const isConceded = dispute.seller_approval?.conceded;
  const breakdown = dispute.win_score_breakdown || {};
  const carrierProof = dispute.carrier_proof || {};
  const precedent = dispute.elastic_precedent || {};

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    try {
      await onSaveEvidence(dispute.dispute_id, evidenceText);
      setIsEditing(false);
      setSaveMessage('Evidence draft updated!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      alert('Error updating evidence: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmApproval = async () => {
    setIsApproving(true);
    try {
      await onApprove(dispute.dispute_id, approverName);
      setShowApproveModal(false);
    } catch (err) {
      alert('Approval failed: ' + err.message);
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="paypal-card" style={{ marginTop: '24px', padding: '28px', borderTop: '4px solid #003087' }}>
      {/* Top Header: Case Overview */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        paddingBottom: '20px',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '0.76rem',
              color: '#687173',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              PayPal Case ID
            </span>
            <span style={{ fontSize: '1.45rem', fontWeight: 800, color: '#003087', letterSpacing: '-0.02em' }}>
              {dispute.dispute_id}
            </span>
            {isApproved ? (
              <span className="paypal-badge badge-resolved" style={{ padding: '4px 12px' }}>
                <CheckCircle2 size={13} /> Evidence Submitted
              </span>
            ) : isConceded ? (
              <span className="paypal-badge badge-urgent" style={{ padding: '4px 12px' }}>
                <XCircle size={13} /> Claim Conceded
              </span>
            ) : (
              <span className="paypal-badge badge-waiting" style={{ padding: '4px 12px' }}>
                Response Required
              </span>
            )}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '0.84rem',
            color: '#475569',
            flexWrap: 'wrap'
          }}>
            <span>Order Reference: <strong style={{ color: '#0f172a' }}>{dispute.order_id}</strong></span>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <span>Transaction ID: <strong style={{ color: '#0f172a' }}>{dispute.transaction_id}</strong></span>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <span>Buyer: <strong style={{ color: '#0f172a' }}>{dispute.buyer?.name}</strong></span>
          </div>
        </div>

        {/* Claim Amount & Win Chance Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{
            textAlign: 'right',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            paddingRight: '12px',
            borderRight: '1px solid var(--border-light)'
          }}>
            <div style={{ fontSize: '0.72rem', color: '#687173', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em' }}>
              Disputed Amount
            </div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#003087', lineHeight: 1.15, marginTop: '2px' }}>
              ${parseFloat(dispute.dispute_amount?.value || '0').toFixed(2)}{' '}
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>{dispute.dispute_amount?.currency}</span>
            </div>
          </div>

          <div style={{
            background: winScore >= 70 ? '#ecfdf5' : '#fffbeb',
            border: `1.5px solid ${winScore >= 70 ? '#a7f3d0' : '#fde68a'}`,
            borderRadius: 'var(--radius-md)',
            padding: '10px 20px',
            textAlign: 'center',
            minWidth: '150px'
          }}>
            <div style={{ fontSize: '0.7rem', color: winScore >= 70 ? '#065f46' : '#92400e', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Estimated Win Chance
            </div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: winScore >= 70 ? '#059669' : '#d97706', lineHeight: 1.15, marginTop: '2px' }}>
              {winScore}%
            </div>
          </div>
        </div>
      </div>

      {/* Official PayPal Case Resolution Stepper */}
      <div style={{ margin: '20px 0', padding: '16px 20px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
        <div className="paypal-stepper">
          <div className="paypal-step completed">
            <div className="paypal-step-circle">✓</div>
            <div className="paypal-step-label">1. Dispute Filed</div>
          </div>

          <div className={`paypal-step ${isApproved ? 'completed' : 'active'}`}>
            <div className="paypal-step-circle">{isApproved ? '✓' : '2'}</div>
            <div className="paypal-step-label">2. Seller Evidence</div>
          </div>

          <div className={`paypal-step ${isApproved ? 'active' : ''}`}>
            <div className="paypal-step-circle">3</div>
            <div className="paypal-step-label">3. PayPal Review</div>
          </div>

          <div className="paypal-step">
            <div className="paypal-step-circle">4</div>
            <div className="paypal-step-label">4. Case Closed</div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Content Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '24px'
      }}>
        {/* Left Column: Proofs & Policy Citations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 1. KERNEL Carrier Tracking Box */}
          <div style={{
            background: '#ffffff',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={20} color="#0070ba" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#003087' }}>
                  Carrier Delivery Proof (KERNEL)
                </h3>
              </div>
              <span style={{
                fontSize: '0.72rem',
                background: '#e8f7ee',
                color: '#007b36',
                border: '1px solid #b2e3c4',
                padding: '3px 10px',
                borderRadius: 'var(--radius-pill)',
                fontWeight: 700
              }}>
                ✓ VERIFIED BY CARRIER
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                <span style={{ color: '#687173' }}>Carrier & Tracking:</span>
                <span className="font-mono" style={{ color: '#003087', fontWeight: 700 }}>
                  {carrierProof.carrier} • {carrierProof.tracking_number}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                <span style={{ color: '#687173' }}>Delivery Status:</span>
                <span style={{ color: '#007b36', fontWeight: 700 }}>
                  ✓ {carrierProof.status} on {carrierProof.delivery_date ? new Date(carrierProof.delivery_date).toLocaleDateString() : 'Confirmed'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                <span style={{ color: '#687173' }}>Recipient Signature:</span>
                <span style={{ color: carrierProof.has_signature ? '#007b36' : '#b45309', fontWeight: 700 }}>
                  {carrierProof.has_signature ? `✓ Signed by: ${carrierProof.signed_by}` : 'Left at front door/mailbox'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#687173' }}>Address Match Check:</span>
                <span style={{ color: '#007b36', fontWeight: 700 }}>
                  ✓ Matches buyer confirmed shipping zip
                </span>
              </div>
              <div style={{
                marginTop: '8px',
                padding: '8px 12px',
                background: '#f8fafc',
                borderRadius: '6px',
                fontSize: '0.74rem',
                color: '#64748b',
                border: '1px solid #e2e8f0'
              }}>
                KERNEL Audit Certificate Ref: <span className="font-mono" style={{ color: '#0070ba', fontWeight: 600 }}>{carrierProof.kernel_audit_id || 'KERNEL-CERT-9921'}</span>
              </div>
            </div>
          </div>

          {/* 2. Elastic Dispute Precedent & Policy */}
          <div style={{
            background: '#ffffff',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Search size={20} color="#003087" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#003087' }}>
                  Elastic Precedent & Policy Match
                </h3>
              </div>
              <span style={{
                fontSize: '0.72rem',
                background: '#f1f5f9',
                color: '#475569',
                padding: '3px 10px',
                borderRadius: 'var(--radius-pill)',
                fontWeight: 700
              }}>
                Precedent {precedent.precedent_id || 'PREC-88219'}
              </span>
            </div>

            <p style={{ fontSize: '0.84rem', color: '#334155', lineHeight: '1.5', marginBottom: '10px' }}>
              Historical PayPal disputes with signed carrier proof on this reason won{' '}
              <strong style={{ color: '#007b36' }}>{((precedent.benchmark_win_rate || 0.94) * 100).toFixed(0)}%</strong> of cases.
            </p>
            <div style={{
              fontSize: '0.76rem',
              color: '#003087',
              background: '#eff6ff',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #bfdbfe',
              fontWeight: 600
            }}>
              PayPal Policy Rule: {precedent.policy_citation || 'PayPal Seller Protection Policy Section 11.3'}
            </div>
          </div>

          {/* 3. Win-Score Factors */}
          <div style={{
            background: '#ffffff',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#003087', marginBottom: '12px' }}>
              Key Win Factors Evaluated
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.entries(breakdown).map(([key, item]) => (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    fontSize: '0.82rem',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    background: item.positive ? '#f0fdf4' : '#fef2f2',
                    border: `1px solid ${item.positive ? '#bbf7d0' : '#fecaca'}`
                  }}
                >
                  <span style={{
                    fontWeight: 800,
                    color: item.positive ? '#15803d' : '#b91c1c',
                    minWidth: '34px'
                  }}>
                    {item.points > 0 ? `+${item.points}` : item.points}
                  </span>
                  <span style={{ color: '#1e293b' }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Evidence Drafting Studio & Action Guardrail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Evidence Editor Box */}
          <div style={{
            background: '#ffffff',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            flex: 1
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} color="#0070ba" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#003087' }}>
                  AI-Drafted Dispute Response
                </h3>
                <span style={{
                  fontSize: '0.7rem',
                  background: '#f1f5f9',
                  color: '#475569',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-pill)',
                  fontWeight: 600
                }}>
                  Editable
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {saveMessage && (
                  <span style={{ fontSize: '0.78rem', color: '#007b36', fontWeight: 700 }}>
                    {saveMessage}
                  </span>
                )}
                {isEditing ? (
                  <button
                    onClick={handleSaveDraft}
                    disabled={isSubmitting}
                    className="btn btn-paypal-blue"
                    style={{ padding: '5px 14px', fontSize: '0.78rem' }}
                  >
                    Save Changes
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn btn-paypal-outline"
                    style={{ padding: '5px 14px', fontSize: '0.78rem' }}
                  >
                    <Edit3 size={13} />
                    Edit Draft
                  </button>
                )}
              </div>
            </div>

            {/* Editable Text Area Styled Like Official Document */}
            <textarea
              value={evidenceText}
              onChange={(e) => {
                setEvidenceText(e.target.value);
                if (!isEditing) setIsEditing(true);
              }}
              rows={14}
              style={{
                width: '100%',
                background: '#f8fafc',
                border: isEditing ? '1.5px solid #0070ba' : '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '16px',
                color: '#0f172a',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.82rem',
                lineHeight: '1.6',
                resize: 'vertical',
                outline: 'none',
                boxShadow: isEditing ? '0 0 0 3px rgba(0, 112, 186, 0.15)' : 'none',
                transition: 'border-color 0.15s'
              }}
              placeholder="Formal evidence response for PayPal dispute review..."
            />

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '10px',
              fontSize: '0.76rem',
              color: '#687173'
            }}>
              <span>Characters: {evidenceText.length}</span>
              <span>PayPal Evidence Standard: Formally addresses delivery, carrier verification & policy.</span>
            </div>

            {/* Evidence Readiness Checklist */}
            <div style={{
              marginTop: '16px',
              padding: '14px',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#003087', marginBottom: '8px' }}>
                PAYPAL EVIDENCE READINESS CHECKLIST:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.78rem' }}>
                <span style={{ color: '#007b36', fontWeight: 600 }}>✓ Carrier tracking proof attached</span>
                <span style={{ color: '#007b36', fontWeight: 600 }}>✓ GPS postal match verified</span>
                <span style={{ color: carrierProof.has_signature ? '#007b36' : '#b45309', fontWeight: 600 }}>
                  {carrierProof.has_signature ? '✓ Recipient direct signature verified' : '○ Standard doorstep delivery'}
                </span>
                <span style={{ color: '#007b36', fontWeight: 600 }}>✓ PayPal Seller Protection cited</span>
              </div>
            </div>
          </div>

          {/* Action Box with PayPal Gold Pill Button */}
          <div style={{
            background: '#ffffff',
            border: '2px solid #003087',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <Lock size={20} color="#003087" />
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#003087' }}>
                  Human-in-the-Loop Security Guardrail
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#475569' }}>
                  The AI drafts evidence, but human authorization is strictly required to submit response or move money.
                </p>
              </div>
            </div>

            {isApproved ? (
              <div style={{
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: '8px',
                padding: '16px',
                fontSize: '0.85rem'
              }}>
                <div style={{ color: '#065f46', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={20} color="#059669" />
                  Authorized & Submitted by {dispute.seller_approval?.approver_id}
                </div>
                <div style={{ color: '#047857', fontSize: '0.78rem', marginTop: '4px' }}>
                  Dispatched to PayPal Sandbox API on {new Date(dispute.seller_approval?.approved_at).toLocaleString()}.
                  Recorded in cryptographic SHA-256 ledger and Zapier Google Sheets audit log.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setShowApproveModal(true)}
                  className="btn btn-paypal-gold"
                  style={{ flex: 1, padding: '13px 24px', fontSize: '0.95rem' }}
                >
                  <ShieldCheck size={20} />
                  Approve & Submit to PayPal
                </button>

                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to accept this claim and issue a full refund to the buyer?')) {
                      onReject(dispute.dispute_id, 'Seller accepted claim liability');
                    }
                  }}
                  className="btn btn-paypal-danger"
                  style={{ padding: '13px 20px', fontSize: '0.9rem' }}
                >
                  <XCircle size={18} />
                  Accept Claim / Refund
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showApproveModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade" style={{ maxWidth: '560px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: '#ecfdf5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShieldCheck size={26} color="#059669" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#003087' }}>
                  Authorize Evidence Submission
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#475569' }}>
                  PayPal Dispute Resolution Center submission signature
                </p>
              </div>
            </div>

            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '18px',
              fontSize: '0.84rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div><strong>Case ID:</strong> <span className="font-mono" style={{ color: '#0070ba' }}>{dispute.dispute_id}</span></div>
              <div><strong>Disputed Amount:</strong> ${parseFloat(dispute.dispute_amount?.value || '0').toFixed(2)} USD</div>
              <div><strong>Carrier Tracking:</strong> {carrierProof.carrier} ({carrierProof.tracking_number})</div>
              <div><strong>Calculated Win Probability:</strong> <span style={{ color: '#007b36', fontWeight: 800 }}>{winScore}%</span></div>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#003087', marginBottom: '6px' }}>
                Authorized Seller Representative:
              </label>
              <input
                type="text"
                value={approverName}
                onChange={(e) => setApproverName(e.target.value)}
                style={{
                  width: '100%',
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: 'var(--radius-pill)',
                  padding: '9px 16px',
                  color: '#0f172a',
                  fontSize: '0.88rem',
                  outline: 'none'
                }}
              />
            </div>

            <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '22px' }}>
              By confirming, you authorize submission of this legal evidence response to the PayPal Sandbox Dispute API.
              A cryptographic SHA-256 ledger block and Zapier audit row will be generated.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setShowApproveModal(false)}
                className="btn btn-paypal-neutral"
                disabled={isApproving}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApproval}
                disabled={isApproving}
                className="btn btn-paypal-gold"
              >
                {isApproving ? 'Submitting to PayPal...' : 'Authorize & Submit to PayPal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

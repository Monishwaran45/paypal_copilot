import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Play,
  AlertTriangle,
  Package,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { api } from './apiClient.js';

export default function SimulateDisputeModal({ onClose, onSimulated }) {
  const [loading, setLoading] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('high_value');
  const [customReason, setCustomReason] = useState('MERCHANDISE_OR_SERVICE_NOT_RECEIVED');
  const [customAmount, setCustomAmount] = useState('499.00');
  const [customItem, setCustomItem] = useState('MacBook Pro M3 USB-C Docking Station');
  const [customBuyer, setCustomBuyer] = useState('Alexander Wright');

  const presets = [
    {
      id: 'high_value',
      title: 'High-Value Item Not Received ($849.50)',
      reason: 'MERCHANDISE_OR_SERVICE_NOT_RECEIVED',
      amount: '849.50',
      item: 'Sony Alpha a7 IV Camera Body',
      buyer: 'Marcus Vance',
      carrier: 'UPS',
      dueHours: 48,
      desc: 'Tests high-value signature requirement, KERNEL carrier proof, and Elastic precedent matching.'
    },
    {
      id: 'urgent',
      title: 'URGENT Deadline (< 18 Hours Left)',
      reason: 'UNAUTHORISED_TRANSACTION',
      amount: '189.00',
      item: 'AirPods Max Silver',
      buyer: 'Samantha Fox',
      carrier: 'FedEx',
      dueHours: 16,
      desc: 'Triggers Bryntum timeline red urgent alert radar and immediate Zapier Slack notification.'
    },
    {
      id: 'snad',
      title: 'Significantly Not As Described (SNAD)',
      reason: 'NOT_AS_DESCRIBED',
      amount: '310.00',
      item: 'Vintage Mechanical Watch (Serviced)',
      buyer: 'David Kim',
      carrier: 'USPS Priority',
      dueHours: 96,
      desc: 'Tests return RMA policy drafting and empirical precedent win-score adjustment.'
    }
  ];

  const handleSimulate = async () => {
    try {
      setLoading(true);
      let payload = {};

      if (selectedPreset === 'custom') {
        payload = {
          reason: customReason,
          amount: customAmount,
          item_name: customItem,
          buyer_name: customBuyer,
          carrier: 'UPS',
          due_hours: 48
        };
      } else {
        const p = presets.find(x => x.id === selectedPreset);
        payload = {
          reason: p.reason,
          amount: p.amount,
          item_name: p.item,
          buyer_name: p.buyer,
          carrier: p.carrier,
          due_hours: p.dueHours
        };
      }

      const res = await api.simulateDispute(payload);
      if (res.dispute) {
        onSimulated(res.dispute);
        onClose();
      }
    } catch (err) {
      alert('Simulation error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-fade" style={{ maxWidth: '640px' }}>
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
              background: '#e0f2fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={22} color="#0070ba" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#003087' }}>
                Simulate PayPal Webhook Dispute
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#475569' }}>
                Instant test harness for live demos and hackathon judging
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

        {/* Preset Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          {presets.map(p => (
            <div
              key={p.id}
              onClick={() => setSelectedPreset(p.id)}
              style={{
                background: selectedPreset === p.id ? '#eff6ff' : '#f8fafc',
                border: selectedPreset === p.id ? '2px solid #0070ba' : '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 18px',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 800, color: '#003087', fontSize: '0.92rem' }}>
                  {p.title}
                </span>
                <span style={{
                  fontSize: '0.72rem',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-pill)',
                  background: '#e2e8f0',
                  color: '#475569',
                  fontWeight: 700
                }}>
                  {p.carrier} • {p.dueHours}h deadline
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#475569', marginTop: '4px' }}>
                {p.desc}
              </p>
            </div>
          ))}

          {/* Custom option */}
          <div
            onClick={() => setSelectedPreset('custom')}
            style={{
              background: selectedPreset === 'custom' ? '#eff6ff' : '#f8fafc',
              border: selectedPreset === 'custom' ? '2px solid #0070ba' : '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 18px',
              cursor: 'pointer'
            }}
          >
            <span style={{ fontWeight: 800, color: '#003087', fontSize: '0.92rem' }}>
              Custom Parameters
            </span>
          </div>
        </div>

        {selectedPreset === 'custom' && (
          <div style={{
            background: '#f8fafc',
            border: '1px solid var(--border-light)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#003087', display: 'block', marginBottom: '4px' }}>
                Dispute Reason:
              </label>
              <select
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                style={{
                  width: '100%',
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  color: '#0f172a',
                  fontSize: '0.84rem'
                }}
              >
                <option value="MERCHANDISE_OR_SERVICE_NOT_RECEIVED">Item Not Received (INR)</option>
                <option value="UNAUTHORISED_TRANSACTION">Unauthorized Transaction</option>
                <option value="NOT_AS_DESCRIBED">Significantly Not As Described (SNAD)</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#003087', display: 'block', marginBottom: '4px' }}>
                  Amount ($ USD):
                </label>
                <input
                  type="text"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    color: '#0f172a',
                    fontSize: '0.84rem'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#003087', display: 'block', marginBottom: '4px' }}>
                  Buyer Name:
                </label>
                <input
                  type="text"
                  value={customBuyer}
                  onChange={(e) => setCustomBuyer(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    color: '#0f172a',
                    fontSize: '0.84rem'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={onClose}
            className="btn btn-paypal-neutral"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSimulate}
            disabled={loading}
            className="btn btn-paypal-gold"
          >
            <Play size={15} />
            {loading ? 'AI Copilot Analyzing...' : 'Dispatch Webhook Event'}
          </button>
        </div>
      </div>
    </div>
  );
}

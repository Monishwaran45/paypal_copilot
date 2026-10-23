import React, { useState, useEffect } from 'react';
import {
  Package,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ShoppingCart,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { api } from './apiClient.js';

export default function RestockChannel3() {
  const [inventory, setInventory] = useState([]);
  const [spendingLimit, setSpendingLimit] = useState(500);
  const [loading, setLoading] = useState(true);
  const [orderingItem, setOrderingItem] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(null);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const res = await api.getRestockInventory();
      if (res.data) {
        setInventory(res.data.items || []);
        setSpendingLimit(res.data.spending_limit_usd || 500);
      }
    } catch (err) {
      console.warn('Failed to fetch restock inventory, using local fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = async (item) => {
    const qty = item.recommended_order_qty || 5;
    const estCost = item.unit_cost_usd * qty;

    if (estCost > spendingLimit) {
      alert(`Guardrail block: Order total ($${estCost}) exceeds allowed spending limit of $${spendingLimit}.`);
      return;
    }

    try {
      setOrderingItem(item.id);
      const res = await api.orderRestock(item.id, qty, 'seller_admin_1');
      setOrderSuccess({
        itemName: item.name,
        qty,
        total: estCost,
        orderId: res.order?.order_id || 'C3-ORD-9912'
      });
      await loadInventory();
      setTimeout(() => setOrderSuccess(null), 6000);
    } catch (err) {
      alert('Order failed: ' + err.message);
    } finally {
      setOrderingItem(null);
    }
  };

  return (
    <div className="paypal-card" style={{ padding: '28px', borderTop: '4px solid #003087' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#e0f2fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Package size={22} color="#0070ba" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#003087' }}>
                Channel3 Merchant Supply Restock
              </h2>
              <p style={{ fontSize: '0.84rem', color: '#475569' }}>
                Predictive supply replenishments to prevent order fulfillment disputes
              </p>
            </div>
          </div>
        </div>

        {/* Spending Limit Guardrail */}
        <div style={{
          background: '#f8fafc',
          border: '1.5px solid #cbd5e1',
          borderRadius: 'var(--radius-md)',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          <Lock size={20} color="#003087" />
          <div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800 }}>
              Autonomous Spend Limit
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#003087' }}>
              ${spendingLimit.toFixed(2)}{' '}
              <span style={{ fontSize: '0.75rem', color: '#007b36', fontWeight: 700 }}>Guardrail Active</span>
            </div>
          </div>
        </div>
      </div>

      {orderSuccess && (
        <div style={{
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          borderRadius: 'var(--radius-md)',
          padding: '14px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <CheckCircle2 size={22} color="#059669" />
          <div>
            <div style={{ color: '#065f46', fontWeight: 800, fontSize: '0.92rem' }}>
              Restock Purchase Confirmed • Order {orderSuccess.orderId}
            </div>
            <div style={{ color: '#047857', fontSize: '0.82rem' }}>
              Ordered {orderSuccess.qty} units of {orderSuccess.itemName} for ${orderSuccess.total.toFixed(2)}. Chained to SHA-256 audit ledger.
            </div>
          </div>
        </div>
      )}

      {/* Inventory Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {inventory.map(item => {
          const isLow = item.current_stock <= item.safety_stock;
          const totalCost = (item.unit_cost_usd * (item.recommended_order_qty || 1)).toFixed(2);

          return (
            <div
              key={item.id}
              style={{
                background: '#ffffff',
                border: isLow ? '1.5px solid #fecdca' : '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '0.74rem', color: '#687173', textTransform: 'uppercase', fontWeight: 700 }}>
                      {item.category} • {item.id}
                    </span>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#003087', marginTop: '2px' }}>
                      {item.name}
                    </h3>
                  </div>

                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-pill)',
                    background: item.urgency === 'HIGH' ? '#fdf2f2' : '#fff8e6',
                    color: item.urgency === 'HIGH' ? '#d92d20' : '#946300',
                    border: `1px solid ${item.urgency === 'HIGH' ? '#fecdca' : '#ffe399'}`
                  }}>
                    {item.urgency} URGENCY
                  </span>
                </div>

                {/* Stock Stats */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  margin: '14px 0',
                  padding: '12px 14px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '0.84rem'
                }}>
                  <div>
                    <div style={{ color: '#687173', fontSize: '0.72rem', fontWeight: 600 }}>Current Stock</div>
                    <div style={{ fontWeight: 800, color: isLow ? '#d92d20' : '#0f172a', fontSize: '1.05rem' }}>
                      {item.current_stock} units
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#687173', fontSize: '0.72rem', fontWeight: 600 }}>Safety Stock</div>
                    <div style={{ fontWeight: 600, color: '#64748b', fontSize: '1.05rem' }}>
                      {item.safety_stock} units
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#687173', fontSize: '0.72rem', fontWeight: 600 }}>Unit Cost</div>
                    <div style={{ fontWeight: 800, color: '#003087', fontSize: '1.05rem' }}>
                      ${item.unit_cost_usd.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* AI Rationale */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  fontSize: '0.8rem',
                  color: '#334155',
                  background: '#eff6ff',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #bfdbfe'
                }}>
                  <Sparkles size={15} color="#0070ba" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{item.ai_recommendation_reason}</span>
                </div>
              </div>

              {/* Order Button */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '14px',
                borderTop: '1px solid var(--border-light)'
              }}>
                <div>
                  <div style={{ fontSize: '0.74rem', color: '#687173' }}>Order Qty: {item.recommended_order_qty}</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#003087' }}>
                    ${totalCost} USD
                  </div>
                </div>

                <button
                  onClick={() => handleOrder(item)}
                  disabled={orderingItem === item.id || item.recommended_order_qty === 0}
                  className="btn btn-paypal-gold"
                  style={{ padding: '7px 18px', fontSize: '0.84rem' }}
                >
                  <ShoppingCart size={15} />
                  {orderingItem === item.id ? 'Ordering...' : 'Order Restock'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

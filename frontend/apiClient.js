import { initialMockDisputes } from './initialMockData.js';

// Standalone in-memory / local storage state for pure frontend development
const STORAGE_KEY_DISPUTES = 'paypal_copilot_disputes_v1';
const STORAGE_KEY_AUDIT = 'paypal_copilot_audit_v1';
const STORAGE_KEY_RESTOCK = 'paypal_copilot_restock_v1';

const defaultRestockItems = [
  {
    id: 'C3-INV-101',
    name: '4x6 Direct Thermal Shipping Labels (500/roll)',
    category: 'Packaging',
    current_stock: 4,
    safety_stock: 10,
    unit_cost_usd: 14.50,
    recommended_order_qty: 15,
    urgency: 'HIGH',
    ai_recommendation_reason: 'Dispute velocity up 42% due to package tracking delays. Immediate restock prevents shipment stalls.'
  },
  {
    id: 'C3-INV-102',
    name: 'Bubble Mailer Padded Envelopes #0 (Pack of 100)',
    category: 'Packaging',
    current_stock: 12,
    safety_stock: 20,
    unit_cost_usd: 22.00,
    recommended_order_qty: 10,
    urgency: 'MEDIUM',
    ai_recommendation_reason: 'Restock before upcoming weekend volume surge to maintain SLA fulfillment.'
  },
  {
    id: 'C3-INV-103',
    name: 'Heavy-Duty Reinforced Packing Tape (6-Pack)',
    category: 'Shipping Supplies',
    current_stock: 3,
    safety_stock: 8,
    unit_cost_usd: 18.50,
    recommended_order_qty: 8,
    urgency: 'HIGH',
    ai_recommendation_reason: 'Carrier damage dispute defense requires reinforced sealing. Current supply critically low.'
  },
  {
    id: 'C3-INV-104',
    name: 'ESD Anti-Static Component Bags (Pack of 50)',
    category: 'Electronics Protection',
    current_stock: 45,
    safety_stock: 30,
    unit_cost_usd: 16.00,
    recommended_order_qty: 0,
    urgency: 'LOW',
    ai_recommendation_reason: 'Sufficient inventory buffer. Restock not required at current sales velocity.'
  }
];

const defaultAuditEntries = [
  {
    entryId: 'AUD-99120',
    disputeId: 'PP-D-1094821',
    timestamp: '2026-10-23T11:15:00.000Z',
    actor: { type: 'AI_AGENT', id: 'copilot_agent_v2' },
    action: 'DRAFT_EVIDENCE_GENERATED',
    details: 'AI Agent retrieved carrier delivery proof (UPS tracking 1Z9999999999999999) via KERNEL and matched Elastic precedent PREC-88219 (96% win probability).',
    hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    prevHash: '0000000000000000000000000000000000000000000000000000000000000000'
  },
  {
    entryId: 'AUD-99121',
    disputeId: 'PP-D-2049182',
    timestamp: '2026-10-23T12:05:30.000Z',
    actor: { type: 'AI_AGENT', id: 'copilot_agent_v2' },
    action: 'DRAFT_EVIDENCE_GENERATED',
    details: 'AI Agent drafted unauthorized claim response citing PayPal Seller Protection Policy Section 11.2.',
    hash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
    prevHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  }
];

function getStoredDisputes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DISPUTES);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [...initialMockDisputes];
}

function saveStoredDisputes(list) {
  try {
    localStorage.setItem(STORAGE_KEY_DISPUTES, JSON.stringify(list));
  } catch (e) {}
}

function getStoredAudit() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUDIT);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [...defaultAuditEntries];
}

function saveStoredAudit(list) {
  try {
    localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(list));
  } catch (e) {}
}

function getStoredRestock() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RESTOCK);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [...defaultRestockItems];
}

function saveStoredRestock(list) {
  try {
    localStorage.setItem(STORAGE_KEY_RESTOCK, JSON.stringify(list));
  } catch (e) {}
}

export const api = {
  async getDisputes(status = null) {
    const list = getStoredDisputes();
    const filtered = status ? list.filter(d => d.status === status) : list;
    return { success: true, count: filtered.length, disputes: filtered };
  },

  async getDispute(id) {
    const list = getStoredDisputes();
    const matched = list.find(d => d.dispute_id === id);
    if (!matched) throw new Error(`Dispute ${id} not found`);
    return { success: true, dispute: matched };
  },

  async updateEvidence(id, evidenceText, approverId = 'seller_merchant_primary') {
    const list = getStoredDisputes();
    const idx = list.findIndex(d => d.dispute_id === id);
    if (idx === -1) throw new Error(`Dispute ${id} not found`);

    list[idx].ai_drafted_evidence = evidenceText;
    saveStoredDisputes(list);
    return { success: true, dispute: list[idx] };
  },

  async approveDispute(id, approverId = 'seller_merchant_primary') {
    const list = getStoredDisputes();
    const idx = list.findIndex(d => d.dispute_id === id);
    if (idx === -1) throw new Error(`Dispute ${id} not found`);

    const now = new Date().toISOString();
    list[idx].status = 'UNDER_REVIEW';
    list[idx].seller_approval = {
      approved: true,
      conceded: false,
      approved_at: now,
      approver_id: approverId,
      rejection_reason: null
    };
    saveStoredDisputes(list);

    // Record in local audit trail
    const auditList = getStoredAudit();
    const prev = auditList[auditList.length - 1];
    const newEntry = {
      entryId: `AUD-${Math.floor(10000 + Math.random() * 90000)}`,
      disputeId: id,
      timestamp: now,
      actor: { type: 'HUMAN_APPROVER', id: approverId },
      action: 'DISPUTE_EVIDENCE_SUBMITTED',
      details: `Human seller representative "${approverId}" authorized formal evidence submission to PayPal Sandbox API.`,
      hash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      prevHash: prev ? prev.hash : '0000000000000000000000000000000000000000000000000000000000000000'
    };
    auditList.push(newEntry);
    saveStoredAudit(auditList);

    return { success: true, dispute: list[idx], audit: newEntry };
  },

  async rejectDispute(id, reason, approverId = 'seller_merchant_primary') {
    const list = getStoredDisputes();
    const idx = list.findIndex(d => d.dispute_id === id);
    if (idx === -1) throw new Error(`Dispute ${id} not found`);

    const now = new Date().toISOString();
    list[idx].status = 'RESOLVED';
    list[idx].seller_approval = {
      approved: false,
      conceded: true,
      approved_at: now,
      approver_id: approverId,
      rejection_reason: reason
    };
    saveStoredDisputes(list);

    return { success: true, dispute: list[idx] };
  },

  async simulateDispute(scenario = {}) {
    const list = getStoredDisputes();
    const newId = `PP-D-${Math.floor(4000000 + Math.random() * 5000000)}`;
    const dueHours = scenario.due_hours || 48;
    const dueDate = new Date(Date.now() + dueHours * 60 * 60 * 1000).toISOString();

    const simulated = {
      dispute_id: newId,
      status: 'WAITING_FOR_SELLER_RESPONSE',
      dispute_amount: {
        currency: 'USD',
        value: parseFloat(scenario.amount || '450.00').toFixed(2)
      },
      reason: scenario.reason || 'MERCHANDISE_OR_SERVICE_NOT_RECEIVED',
      dispute_life_cycle_stage: 'INQUIRY',
      seller_response_due_date: dueDate,
      order_id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      transaction_id: `TRX-${Math.floor(10000000 + Math.random() * 90000000)}X`,
      buyer: {
        name: scenario.buyer_name || 'Alexander Wright',
        email: 'alex.wright@example.com',
        shipping_address: {
          line1: '120 Market Street',
          city: 'Seattle',
          state: 'WA',
          postal_code: '98101',
          country_code: 'US'
        }
      },
      item: {
        name: scenario.item_name || 'USB-C Dual 4K Pro Docking Station',
        sku: 'ACC-DCK-PRO',
        quantity: 1,
        price: parseFloat(scenario.amount || '450.00').toFixed(2)
      },
      carrier_proof: {
        carrier: scenario.carrier || 'UPS',
        tracking_number: '1Z' + Math.random().toString().slice(2, 18),
        status: 'DELIVERED',
        delivery_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        signed_by: scenario.buyer_name || 'A. WRIGHT',
        has_signature: true,
        carrier_verified: true,
        kernel_audit_id: `KERNEL-SIM-${Math.floor(1000 + Math.random() * 9000)}`,
        delivery_address_verified: true
      },
      win_score: 91,
      win_score_breakdown: {
        carrier_delivery_verified: {
          points: 40,
          label: 'Carrier proof of delivery confirmed via KERNEL',
          positive: true
        },
        signature_on_file: {
          points: 25,
          label: 'Recipient signature confirmed on delivery file',
          positive: true
        },
        address_match: {
          points: 20,
          label: 'GPS zip matches transaction address',
          positive: true
        },
        elastic_precedent: {
          points: 12,
          label: 'Elastic precedent similarity indicates 94% win rate',
          positive: true
        },
        risk_deduction: {
          points: -6,
          label: 'Simulated high-priority case',
          positive: false
        }
      },
      elastic_precedent: {
        precedent_id: 'PREC-77192',
        similarity: 0.95,
        benchmark_win_rate: 0.94,
        policy_citation: 'PayPal Seller Protection Policy Section 11.3 (Proof of Delivery)'
      },
      ai_drafted_evidence: `Dear PayPal Dispute Resolution Team,\n\nWe respectfully contest Dispute ${newId} regarding Order for ${scenario.item_name || 'Product'} ($${scenario.amount || '450.00'}).\n\n1. PROOF OF SHIPMENT & DELIVERY:\nThe order was dispatched via ${scenario.carrier || 'UPS'} to the verified PayPal shipping address.\n\n2. CARRIER AUDIT CONFIRMATION:\nCarrier confirms delivery was successfully completed with signature on file. Audited via KERNEL.\n\n3. PAYPAL SELLER PROTECTION:\nAll criteria under Seller Protection Policy Section 11.3 have been satisfied.\n\nRespectfully submitted,\nAuthorized Merchant Representative`,
      seller_approval: {
        approved: false,
        approved_at: null,
        approver_id: null,
        rejection_reason: null
      }
    };

    list.unshift(simulated);
    saveStoredDisputes(list);
    return { success: true, dispute: simulated };
  },

  async getAuditTrail(disputeId = null) {
    const list = getStoredAudit();
    const filtered = disputeId ? list.filter(a => a.disputeId === disputeId) : list;
    return {
      success: true,
      count: filtered.length,
      audit_trail: filtered.reverse(),
      ledger_integrity: {
        valid: true,
        checked_entries: filtered.length,
        verified_at: new Date().toISOString()
      }
    };
  },

  async getRestockInventory() {
    const items = getStoredRestock();
    return {
      success: true,
      data: {
        spending_limit_usd: 500.0,
        items
      }
    };
  },

  async orderRestock(itemId, quantity, approverId = 'seller_merchant_primary') {
    const items = getStoredRestock();
    const idx = items.findIndex(i => i.id === itemId);
    if (idx === -1) throw new Error('Item not found');

    const totalCost = items[idx].unit_cost_usd * quantity;
    if (totalCost > 500) {
      throw new Error(`Spending limit exceeded ($${totalCost} > $500.00)`);
    }

    items[idx].current_stock += quantity;
    items[idx].urgency = 'LOW';
    saveStoredRestock(items);

    return {
      success: true,
      order: {
        order_id: `C3-ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        item_id: itemId,
        quantity,
        total_usd: totalCost,
        status: 'DISPATCHED'
      }
    };
  },

  async testZapierNotification() {
    return {
      success: true,
      channel: 'slack',
      webhook_url: 'https://hooks.zapier.com/hooks/catch/paypal-slack-demo'
    };
  },

  async testZapierAudit() {
    return {
      success: true,
      channel: 'google_sheets',
      webhook_url: 'https://hooks.zapier.com/hooks/catch/audit-sheets-demo'
    };
  }
};

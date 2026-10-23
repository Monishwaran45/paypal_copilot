export const initialMockDisputes = [
  {
    dispute_id: 'PP-D-1094821',
    status: 'WAITING_FOR_SELLER_RESPONSE',
    dispute_amount: { currency: 'USD', value: '849.50' },
    reason: 'MERCHANDISE_OR_SERVICE_NOT_RECEIVED',
    dispute_life_cycle_stage: 'CHARGEBACK',
    seller_response_due_date: '2026-10-24T08:30:00Z',
    order_id: 'ORD-99321',
    transaction_id: 'TRX-71049281A',
    buyer: {
      name: 'Marcus Vance',
      email: 'm.vance@example.com',
      shipping_address: {
        line1: '742 Evergreen Terrace',
        city: 'Springfield',
        state: 'OR',
        postal_code: '97477',
        country_code: 'US'
      }
    },
    item: {
      name: 'Sony Alpha a7 IV Mirrorless Camera Body',
      sku: 'CAM-SNY-A7IV',
      quantity: 1,
      price: '849.50'
    },
    carrier_proof: {
      carrier: 'UPS',
      tracking_number: '1Z9999999999999999',
      status: 'DELIVERED',
      delivery_date: '2026-10-20T14:22:10Z',
      signed_by: 'M. VANCE',
      has_signature: true,
      carrier_verified: true,
      kernel_audit_id: 'KERNEL-UPS-20261020-9921',
      delivery_address_verified: true
    },
    win_score: 94,
    win_score_breakdown: {
      carrier_delivery_verified: {
        points: 40,
        label: 'Carrier proof of delivery confirmed via KERNEL',
        positive: true
      },
      signature_on_file: {
        points: 25,
        label: 'Recipient signature matches buyer name (M. VANCE)',
        positive: true
      },
      address_match: {
        points: 20,
        label: 'Delivery GPS/zip strictly matches PayPal confirmed shipping address',
        positive: true
      },
      elastic_precedent: {
        points: 15,
        label: 'Elastic similarity matches 96% historical win rate (PREC-88219)',
        positive: true
      },
      risk_deduction: {
        points: -6,
        label: 'Transaction above $750 requires explicit signature per policy (met)',
        positive: false
      }
    },
    elastic_precedent: {
      precedent_id: 'PREC-88219',
      similarity: 0.98,
      benchmark_win_rate: 0.96,
      policy_citation: 'PayPal Seller Protection Policy Section 11.3 (Proof of Delivery with Online Tracking and Recipient Signature)'
    },
    ai_drafted_evidence: `Dear PayPal Dispute Resolution Team,\n\nWe respectfully contest Dispute PP-D-1094821 regarding Order ORD-99321 (Transaction TRX-71049281A) for the Sony Alpha a7 IV Mirrorless Camera ($849.50).\n\n1. PROOF OF SHIPMENT & DELIVERY:\nThe order was dispatched promptly via UPS tracking number 1Z9999999999999999 to the buyer's verified PayPal address (742 Evergreen Terrace, Springfield, OR 97477).\n\n2. RECIPIENT SIGNATURE CONFIRMATION:\nUPS delivered the package on October 20, 2026 at 2:22 PM. Per PayPal high-value policy requirements for orders over $750, a Direct Signature was required and obtained from the buyer: "M. VANCE". Carrier tracking verified via KERNEL (Audit Ref: KERNEL-UPS-20261020-9921).\n\n3. PAYPAL SELLER PROTECTION:\nAs verified above, the merchant has satisfied all requirements under PayPal Seller Protection Policy Section 11.3. The tracking information demonstrates conclusive delivery to the buyer's registered PayPal address prior to this claim.\n\nWe kindly request that PayPal release the reserved funds and close this case in the seller's favor.\n\nRespectfully submitted,\nAuthorized Merchant Representative`,
    seller_approval: {
      approved: false,
      approved_at: null,
      approver_id: null,
      rejection_reason: null
    }
  },
  {
    dispute_id: 'PP-D-2049182',
    status: 'WAITING_FOR_SELLER_RESPONSE',
    dispute_amount: { currency: 'USD', value: '129.99' },
    reason: 'UNAUTHORISED_TRANSACTION',
    dispute_life_cycle_stage: 'INQUIRY',
    seller_response_due_date: '2026-10-23T23:59:00Z',
    order_id: 'ORD-88102',
    transaction_id: 'TRX-44910283B',
    buyer: {
      name: 'Sarah Jenkins',
      email: 'sarah.j88@example.com',
      shipping_address: {
        line1: '1204 Pine Hollow Way',
        city: 'Austin',
        state: 'TX',
        postal_code: '78704',
        country_code: 'US'
      }
    },
    item: {
      name: 'Wireless Noise Cancelling Studio Headphones',
      sku: 'AUD-NC-900',
      quantity: 1,
      price: '129.99'
    },
    carrier_proof: {
      carrier: 'FedEx',
      tracking_number: '927489028192038192',
      status: 'DELIVERED',
      delivery_date: '2026-10-18T10:04:12Z',
      signed_by: 'Front Porch / Safe Place',
      has_signature: false,
      carrier_verified: true,
      kernel_audit_id: 'KERNEL-FDX-20261018-4412',
      delivery_address_verified: true
    },
    win_score: 88,
    win_score_breakdown: {
      carrier_delivery_verified: {
        points: 35,
        label: 'FedEx tracking confirms delivery prior to unauthorized dispute filing',
        positive: true
      },
      address_match: {
        points: 25,
        label: 'Dispatched strictly to PayPal confirmed transaction address',
        positive: true
      },
      seller_protection_eligible: {
        points: 20,
        label: 'Order was marked Eligible for Seller Protection on transaction page',
        positive: true
      },
      elastic_precedent: {
        points: 12,
        label: 'Precedent match PREC-61904 has 89% seller win rate',
        positive: true
      },
      risk_deduction: {
        points: -4,
        label: 'No physical signature (not mandated for items under $750)',
        positive: false
      }
    },
    elastic_precedent: {
      precedent_id: 'PREC-61904',
      similarity: 0.94,
      benchmark_win_rate: 0.89,
      policy_citation: 'PayPal Seller Protection Policy Section 11.2 (Unauthorized Transactions - Proof of Shipment)'
    },
    ai_drafted_evidence: `Dear PayPal Resolutions,\n\nRegarding Dispute PP-D-2049182 for Order ORD-88102 ($129.99):\n\nThe merchant fulfilled this order following all PayPal Seller Protection criteria:\n- Shipped via FedEx tracking #927489028192038192\n- Shipped directly to the buyer's confirmed address: 1204 Pine Hollow Way, Austin, TX 78704.\n- Delivered on October 18, 2026 before the dispute was logged.\n\nUnder PayPal Seller Protection Section 11.2, tangible items shipped to the transaction address are fully protected against unauthorized transaction claims.\n\nWe request that the chargeback be covered by PayPal Seller Protection without debit to the merchant balance.`,
    seller_approval: {
      approved: false,
      approved_at: null,
      approver_id: null,
      rejection_reason: null
    }
  },
  {
    dispute_id: 'PP-D-3301984',
    status: 'WAITING_FOR_SELLER_RESPONSE',
    dispute_amount: { currency: 'USD', value: '249.00' },
    reason: 'NOT_AS_DESCRIBED',
    dispute_life_cycle_stage: 'DISPUTE',
    seller_response_due_date: '2026-10-27T16:00:00Z',
    order_id: 'ORD-77401',
    transaction_id: 'TRX-10394821C',
    buyer: {
      name: 'Elena Rostova',
      email: 'e.rostova@example.com',
      shipping_address: {
        line1: '450 Sutter St',
        city: 'San Francisco',
        state: 'CA',
        postal_code: '94108',
        country_code: 'US'
      }
    },
    item: {
      name: 'Custom Mechanical Keyboard - Blue Switches',
      sku: 'KB-MEC-BLU',
      quantity: 1,
      price: '249.00'
    },
    carrier_proof: {
      carrier: 'USPS Priority',
      tracking_number: '9400111899562819028192',
      status: 'DELIVERED',
      delivery_date: '2026-10-15T11:45:00Z',
      signed_by: 'In/At Mailbox',
      has_signature: false,
      carrier_verified: true,
      kernel_audit_id: 'KERNEL-USPS-20261015-8192',
      delivery_address_verified: true
    },
    win_score: 68,
    win_score_breakdown: {
      product_listing_accurate: {
        points: 30,
        label: 'Product spec sheet and QA inspection log matches delivered item',
        positive: true
      },
      return_policy_clear: {
        points: 25,
        label: 'Clear 30-day merchant return policy with return RMA instructions',
        positive: true
      },
      elastic_precedent: {
        points: 18,
        label: 'SNAD cases historically require buyer return item before refund (PREC-55120)',
        positive: true
      },
      risk_deduction: {
        points: -15,
        label: 'Buyer claims sound profile does not match online demo video',
        positive: false
      }
    },
    elastic_precedent: {
      precedent_id: 'PREC-55120',
      similarity: 0.86,
      benchmark_win_rate: 0.62,
      policy_citation: 'PayPal Dispute Resolution Rules: Significantly Not As Described requires item return before refund.'
    },
    ai_drafted_evidence: `Dear PayPal Resolutions Team,\n\nIn response to Dispute PP-D-3301984 for Order ORD-77401:\n\nThe product shipped matches the exact manufacturer specifications outlined on the listing (Custom Mechanical Keyboard with authentic Blue tactile switches, serial #KB-8821).\n\nIf the buyer is dissatisfied with switch acoustics, we have provided an RMA return authorization. Under PayPal policy for SNAD claims, the buyer must return the item in original condition with tracking before any refund is authorized.\n\nWe request PayPal require buyer return proof before taking action.`,
    seller_approval: {
      approved: false,
      approved_at: null,
      approver_id: null,
      rejection_reason: null
    }
  }
];

import React, { useMemo, useState, useRef, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Search,
  Filter,
  ShieldCheck,
  ArrowUpRight
} from 'lucide-react';

export default function DisputeGrid({ disputes, selectedDispute, onSelectDispute }) {
  const gridRef = useRef(null);
  const [filterType, setFilterType] = useState('ALL');
  const [quickSearch, setQuickSearch] = useState('');

  // Status renderer (Authentic PayPal Resolution Center badge - vertically centered)
  const StatusCellRenderer = (params) => {
    const status = params.value || '';
    let badge = null;

    if (status === 'WAITING_FOR_SELLER_RESPONSE') {
      badge = (
        <span className="paypal-badge badge-waiting">
          <Clock size={12} />
          Needs response
        </span>
      );
    } else if (status === 'UNDER_REVIEW') {
      badge = (
        <span className="paypal-badge badge-review">
          <CheckCircle2 size={12} />
          Under review
        </span>
      );
    } else if (status === 'RESOLVED') {
      badge = (
        <span className="paypal-badge badge-resolved">
          <CheckCircle2 size={12} />
          Resolved
        </span>
      );
    } else {
      badge = <span className="paypal-badge badge-waiting">{status}</span>;
    }

    return (
      <div style={{ display: 'flex', alignItems: 'center', height: '100%', width: '100%' }}>
        {badge}
      </div>
    );
  };

  // Case ID and Transaction details renderer (no clipping, clean 2-line layout)
  const CaseIdCellRenderer = (params) => {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        lineHeight: 1.35
      }}>
        <div style={{
          fontWeight: 700,
          color: '#0070ba',
          fontSize: '0.88rem',
          letterSpacing: '-0.01em'
        }}>
          {params.value}
        </div>
        <div style={{
          fontSize: '0.74rem',
          color: '#687173',
          marginTop: '2px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          Order {params.data?.order_id || 'ORD-001'} • {params.data?.buyer?.name || 'Customer'}
        </div>
      </div>
    );
  };

  // Amount renderer
  const AmountCellRenderer = (params) => {
    const data = params.data;
    const currency = data?.dispute_amount?.currency || 'USD';
    const value = parseFloat(data?.dispute_amount?.value || '0').toFixed(2);
    return (
      <div style={{ display: 'flex', alignItems: 'center', height: '100%', width: '100%' }}>
        <span style={{ fontWeight: 800, color: '#003087', fontSize: '0.98rem' }}>
          ${value}{' '}
          <span style={{ color: '#64748b', fontSize: '0.74rem', fontWeight: 600 }}>{currency}</span>
        </span>
      </div>
    );
  };

  // Reason renderer
  const ReasonCellRenderer = (params) => {
    const reason = params.value || '';
    let label = reason;
    let badgeBg = '#eff6ff';
    let textColor = '#005ea6';

    if (reason === 'MERCHANDISE_OR_SERVICE_NOT_RECEIVED') {
      label = 'Item Not Received (INR)';
      badgeBg = '#eff6ff';
      textColor = '#005ea6';
    } else if (reason === 'UNAUTHORISED_TRANSACTION') {
      label = 'Unauthorized Transaction';
      badgeBg = '#fff8e6';
      textColor = '#946300';
    } else if (reason === 'NOT_AS_DESCRIBED') {
      label = 'Not As Described (SNAD)';
      badgeBg = '#fdf2f8';
      textColor = '#9d174d';
    }

    return (
      <div style={{ display: 'flex', alignItems: 'center', height: '100%', width: '100%' }}>
        <span style={{
          background: badgeBg,
          color: textColor,
          padding: '4px 12px',
          borderRadius: 'var(--radius-pill)',
          fontSize: '0.78rem',
          fontWeight: 600,
          whiteSpace: 'nowrap'
        }}>
          {label}
        </span>
      </div>
    );
  };

  // Win Score Cell Renderer
  const WinScoreCellRenderer = (params) => {
    const score = params.value || 0;
    let color = '#007b36';
    let barColor = '#10b981';
    let bg = '#e8f7ee';

    if (score < 70) {
      color = '#946300';
      barColor = '#f59e0b';
      bg = '#fff8e6';
    }
    if (score < 50) {
      color = '#d92d20';
      barColor = '#ef4444';
      bg = '#fdf2f2';
    }

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '100%', width: '100%', paddingRight: '8px' }}>
        <div style={{
          flex: 1,
          height: '7px',
          background: '#e2e8f0',
          borderRadius: '999px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${score}%`,
            height: '100%',
            background: barColor,
            borderRadius: '999px'
          }} />
        </div>
        <span style={{
          background: bg,
          color: color,
          padding: '3px 9px',
          borderRadius: 'var(--radius-pill)',
          fontWeight: 800,
          fontSize: '0.78rem',
          minWidth: '44px',
          textAlign: 'center'
        }}>
          {score}%
        </span>
      </div>
    );
  };

  // Deadline Cell Renderer
  const DeadlineCellRenderer = (params) => {
    const dueDateStr = params.value;
    if (!dueDateStr) return <span style={{ color: '#687173' }}>No deadline</span>;

    const due = new Date(dueDateStr).getTime();
    const now = Date.now();
    const diffHours = Math.round((due - now) / (1000 * 60 * 60));

    const isResolved = params.data?.status === 'RESOLVED' || params.data?.seller_approval?.approved;
    if (isResolved) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <span style={{ color: '#007b36', fontSize: '0.82rem', fontWeight: 700 }}>
            ✓ Case Closed
          </span>
        </div>
      );
    }

    let badge = null;
    if (diffHours <= 0) {
      badge = (
        <span className="paypal-badge badge-urgent">
          <AlertTriangle size={12} />
          Overdue
        </span>
      );
    } else if (diffHours <= 24) {
      badge = (
        <span className="paypal-badge badge-urgent">
          <AlertTriangle size={12} />
          {diffHours}h left (Urgent)
        </span>
      );
    } else if (diffHours <= 72) {
      badge = (
        <span className="paypal-badge badge-waiting">
          <Clock size={12} />
          {Math.round(diffHours / 24)} days left
        </span>
      );
    } else {
      badge = (
        <span style={{ color: '#475569', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Clock size={13} color="#64748b" />
          {Math.round(diffHours / 24)} days left
        </span>
      );
    }

    return (
      <div style={{ display: 'flex', alignItems: 'center', height: '100%', width: '100%' }}>
        {badge}
      </div>
    );
  };

  // Action Button Renderer
  const ActionCellRenderer = (params) => {
    const isSelected = selectedDispute?.dispute_id === params.data?.dispute_id;
    return (
      <div style={{ display: 'flex', alignItems: 'center', height: '100%', width: '100%' }}>
        <button
          className={isSelected ? 'btn btn-paypal-blue' : 'btn btn-paypal-outline'}
          style={{ padding: '6px 16px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
          onClick={(e) => {
            e.stopPropagation();
            onSelectDispute(params.data);
          }}
        >
          View Case
          <ChevronRight size={13} />
        </button>
      </div>
    );
  };

  // Column definitions with generous minWidth to prevent ellipsis clipping
  const columnDefs = useMemo(() => [
    {
      headerName: 'Status',
      field: 'status',
      width: 165,
      minWidth: 155,
      cellRenderer: StatusCellRenderer,
      sortable: true,
      filter: true
    },
    {
      headerName: 'Case ID / Reference',
      field: 'dispute_id',
      minWidth: 230,
      flex: 1.2,
      cellRenderer: CaseIdCellRenderer,
      sortable: true,
      filter: true
    },
    {
      headerName: 'Disputed Amount',
      field: 'dispute_amount.value',
      width: 175,
      minWidth: 165,
      cellRenderer: AmountCellRenderer,
      sortable: true,
      filter: 'agNumberColumnFilter'
    },
    {
      headerName: 'Dispute Reason',
      field: 'reason',
      minWidth: 235,
      flex: 1.2,
      cellRenderer: ReasonCellRenderer,
      sortable: true,
      filter: true
    },
    {
      headerName: 'Estimated Win Score',
      field: 'win_score',
      width: 200,
      minWidth: 190,
      cellRenderer: WinScoreCellRenderer,
      sortable: true,
      filter: 'agNumberColumnFilter'
    },
    {
      headerName: 'Response Due Date',
      field: 'seller_response_due_date',
      width: 200,
      minWidth: 190,
      cellRenderer: DeadlineCellRenderer,
      sortable: true,
      filter: true
    },
    {
      headerName: 'Action',
      width: 140,
      minWidth: 135,
      cellRenderer: ActionCellRenderer,
      sortable: false,
      filter: false
    }
  ], [selectedDispute]);

  const defaultColDef = useMemo(() => ({
    resizable: true,
    suppressMovable: true
  }), []);

  // Filter disputes based on tabs
  const filteredDisputes = useMemo(() => {
    if (!disputes) return [];
    let list = [...disputes];

    if (filterType === 'WAITING') {
      list = list.filter(d => d.status === 'WAITING_FOR_SELLER_RESPONSE');
    } else if (filterType === 'URGENT') {
      const now = Date.now();
      list = list.filter(d => {
        if (d.status === 'RESOLVED') return false;
        const due = new Date(d.seller_response_due_date).getTime();
        const diffHours = (due - now) / (1000 * 60 * 60);
        return diffHours <= 24;
      });
    } else if (filterType === 'RESOLVED') {
      list = list.filter(d => d.status === 'RESOLVED' || d.seller_approval?.approved);
    }

    if (quickSearch.trim()) {
      const q = quickSearch.toLowerCase();
      list = list.filter(d =>
        d.dispute_id?.toLowerCase().includes(q) ||
        d.order_id?.toLowerCase().includes(q) ||
        d.buyer?.name?.toLowerCase().includes(q) ||
        d.reason?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [disputes, filterType, quickSearch]);

  const onRowClicked = useCallback((event) => {
    onSelectDispute(event.data);
  }, [onSelectDispute]);

  return (
    <div className="paypal-card" style={{ padding: '24px' }}>
      {/* PayPal Tabs and Filter Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '20px',
        borderBottom: '1px solid var(--border-light)',
        paddingBottom: '16px'
      }}>
        {/* PayPal Tab Filter Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilterType('ALL')}
            style={{
              background: filterType === 'ALL' ? '#003087' : '#f1f5f9',
              color: filterType === 'ALL' ? '#ffffff' : '#475569',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              padding: '8px 18px',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            All Disputes ({disputes.length})
          </button>

          <button
            onClick={() => setFilterType('WAITING')}
            style={{
              background: filterType === 'WAITING' ? '#003087' : '#f1f5f9',
              color: filterType === 'WAITING' ? '#ffffff' : '#475569',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              padding: '8px 18px',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            Requires Response ({disputes.filter(d => d.status === 'WAITING_FOR_SELLER_RESPONSE').length})
          </button>

          <button
            onClick={() => setFilterType('URGENT')}
            style={{
              background: filterType === 'URGENT' ? '#d92d20' : '#fdf2f2',
              color: filterType === 'URGENT' ? '#ffffff' : '#d92d20',
              border: '1px solid #fecdca',
              borderRadius: 'var(--radius-pill)',
              padding: '8px 18px',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s'
            }}
          >
            <AlertTriangle size={14} />
            Urgent (&lt; 24h)
          </button>

          <button
            onClick={() => setFilterType('RESOLVED')}
            style={{
              background: filterType === 'RESOLVED' ? '#007b36' : '#f1f5f9',
              color: filterType === 'RESOLVED' ? '#ffffff' : '#475569',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              padding: '8px 18px',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            Resolved Cases
          </button>
        </div>

        {/* Quick Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search Case ID, Buyer, Order..."
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              style={{
                background: '#f8fafc',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-pill)',
                padding: '9px 18px 9px 38px',
                color: '#1e293b',
                fontSize: '0.85rem',
                outline: 'none',
                width: '280px'
              }}
            />
          </div>
        </div>
      </div>

      {/* AG Grid Container with Height accommodating 68px rows cleanly */}
      <div className="ag-theme-alpine" style={{ width: '100%', height: '480px' }}>
        <AgGridReact
          ref={gridRef}
          rowData={filteredDisputes}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowSelection="single"
          onRowClicked={onRowClicked}
          animateRows={true}
          headerHeight={48}
          rowHeight={68}
          overlayNoRowsTemplate="<span style='color: #64748b;'>No disputes match your filter.</span>"
        />
      </div>
    </div>
  );
}

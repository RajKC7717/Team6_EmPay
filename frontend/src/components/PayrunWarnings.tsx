import React from 'react';
import { PayrunWarning } from '../utils/salary';

interface Props {
  warnings: PayrunWarning[];
  onFix?: (w: PayrunWarning) => void;
}

const PayrunWarnings: React.FC<Props> = ({ warnings, onFix }) => {
  if (warnings.length === 0) {
    return (
      <div className="alert alert-success" style={{ marginBottom: 18 }}>
        ✓ All employees are ready for payroll. No warnings detected.
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: 20,
      marginBottom: 18,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{ fontSize: 20 }}>⚠️</span>
        <h3 style={{ fontSize: 15.5, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Action Required Before Payrun
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {warnings.map((w, i) => {
          const isHigh = w.severity === 'high';
          const color = isHigh ? 'var(--red-600)' : 'var(--amber-600)';
          const bg = isHigh ? 'var(--red-50)' : 'var(--amber-50)';
          return (
            <div key={i} style={{
              padding: '12px 14px',
              background: bg,
              borderRadius: 8,
              borderLeft: `3px solid ${color}`,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
            }}>
              <span style={{ fontSize: 16, marginTop: 1 }}>{isHigh ? '🔴' : '🟡'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color, fontSize: 13.5 }}>{w.message}</div>
                {w.employees && w.employees.length > 0 && (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                    {w.employees.slice(0, 5).map((e) => e.name).join(', ')}
                    {w.employees.length > 5 ? ` +${w.employees.length - 5} more` : ''}
                  </div>
                )}
                {w.blocksPayrun && (
                  <div style={{ fontSize: 11, color, marginTop: 4, fontWeight: 600 }}>
                    ✦ Payroll cannot be generated until this is resolved
                  </div>
                )}
              </div>
              {onFix && (
                <button className="btn-secondary btn-sm" onClick={() => onFix(w)}>Fix Now</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PayrunWarnings;

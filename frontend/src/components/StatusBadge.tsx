import React from 'react';

interface Props {
  status: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  approved: 'success',
  active: 'success',
  paid: 'success',
  present: 'success',
  completed: 'success',
  pending: 'warning',
  draft: 'warning',
  in_progress: 'warning',
  half_day: 'warning',
  rejected: 'danger',
  inactive: 'danger',
  absent: 'danger',
  cancelled: 'neutral',
  on_leave: 'info',
  generated: 'info',
  not_started: 'neutral',
};

const StatusBadge: React.FC<Props> = ({ status, variant }) => {
  const v = variant || STATUS_VARIANT[status?.toLowerCase()] || 'neutral';
  const label = status?.replace(/_/g, ' ');
  return <span className={`status-badge status-${v}`}>{label}</span>;
};

export default StatusBadge;

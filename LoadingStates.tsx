import React from 'react';
import { AlertTriangle, Info, RefreshCw } from 'lucide-react';

export const Skeleton = ({ className = '', style }: { className?: string; style?: React.CSSProperties }) => (
  <div className={`skeleton ${className}`} style={style}></div>
);

export const CardSkeleton = () => (
  <div className="card skeleton-card">
    <Skeleton className="skeleton-text" style={{ width: '60%' }} />
    <Skeleton className="skeleton-text" style={{ width: '40%' }} />
    <Skeleton className="skeleton-text" style={{ width: '80%', marginTop: '1rem' }} />
  </div>
);

export const PageSkeleton = () => (
  <div className="grid grid-3 animate-in">
    <CardSkeleton />
    <CardSkeleton />
    <CardSkeleton />
    <div className="card skeleton-card" style={{ gridColumn: '1 / -1', height: '300px' }}></div>
  </div>
);

export const Spinner = ({ className = '' }: { className?: string }) => (
  <div className={`spinner ${className}`}></div>
);

export const EmptyState = ({ icon: Icon = Info, title, description, action }: any) => (
  <div className="empty-state animate-in">
    <Icon size={48} style={{ color: 'var(--text-tertiary)' }} />
    <h3>{title}</h3>
    <p>{description}</p>
    {action && <div style={{ marginTop: '1rem' }}>{action}</div>}
  </div>
);

export const ErrorState = ({ message = 'Something went wrong', onRetry }: { message?: string; onRetry?: () => void }) => (
  <div className="error-state animate-in">
    <AlertTriangle size={48} style={{ color: 'var(--danger)' }} />
    <h3>Error Loading Data</h3>
    <p>{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
        <RefreshCw size={16} /> Retry
      </button>
    )}
  </div>
);

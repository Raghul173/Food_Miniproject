import React from 'react';

export default function StatusBadge({ status, size = 'md' }) {
  if (!status) return null;

  const s = String(status).toUpperCase();

  const styles = {
    AVAILABLE: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
    REQUESTED: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20',
    ACCEPTED: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/20',
    PICKUP_SCHEDULED: 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-500/20',
    COLLECTED: 'bg-orange-50 text-orange-700 border-orange-200 ring-orange-500/20',
    DELIVERED: 'bg-teal-50 text-teal-700 border-teal-200 ring-teal-500/20',
    COMPLETED: 'bg-emerald-100 text-emerald-800 border-emerald-300 ring-emerald-500/30',
    EXPIRED: 'bg-slate-100 text-slate-600 border-slate-300 ring-slate-500/10',
    CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20',
    REJECTED: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20',
    OPEN: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
    FULFILLED: 'bg-emerald-100 text-emerald-800 border-emerald-300 ring-emerald-500/30',
    RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
    IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/20',
    DISMISSED: 'bg-slate-100 text-slate-600 border-slate-300 ring-slate-500/10',
    // Urgency
    HIGH: 'bg-red-50 text-red-700 border-red-200 ring-red-500/20 font-semibold',
    MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20',
    LOW: 'bg-slate-50 text-slate-600 border-slate-200 ring-slate-500/10',
    // Diets
    VEGETARIAN: 'bg-green-50 text-green-700 border-green-200',
    NON_VEGETARIAN: 'bg-red-50 text-red-700 border-red-200',
    VEGAN: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold',
    EGGETARIAN: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    UNKNOWN: 'bg-slate-50 text-slate-500 border-slate-200'
  };

  const currentStyle = styles[s] || 'bg-slate-100 text-slate-700 border-slate-200';
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  const label = s.replace(/_/g, ' ');

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border shadow-xs tracking-wide uppercase ${sizeClasses} ${currentStyle}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {label}
    </span>
  );
}

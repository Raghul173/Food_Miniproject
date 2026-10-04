import React from 'react';

export default function LoadingSpinner({ size = 'md', message = 'Loading...' }) {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3">
      <div
        className={`animate-spin rounded-full border-emerald-200 border-t-emerald-600 ${sizeMap[size] || sizeMap.md}`}
      />
      {message && <p className="text-xs font-medium text-slate-500">{message}</p>}
    </div>
  );
}

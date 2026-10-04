import React from 'react';

export default function Card({
  children,
  title,
  subtitle,
  actions,
  className = '',
  bodyClassName = 'p-6',
  hover = false
}) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs transition-all duration-200 ${
        hover ? 'hover:shadow-md hover:border-slate-300' : ''
      } ${className}`}
    >
      {(title || subtitle || actions) && (
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between gap-4">
          <div>
            {title && <h3 className="text-base font-semibold text-slate-900 tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}

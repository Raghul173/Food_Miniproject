import React from 'react';

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel = 'vs last month',
  color = 'primary', // 'primary', 'secondary', 'blue', 'purple', 'emerald'
  description,
  className = ''
}) {
  const colorMap = {
    primary: {
      bg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      badge: 'text-emerald-700 bg-emerald-100/60'
    },
    secondary: {
      bg: 'bg-amber-50 text-amber-600 border-amber-100',
      badge: 'text-amber-700 bg-amber-100/60'
    },
    blue: {
      bg: 'bg-blue-50 text-blue-600 border-blue-100',
      badge: 'text-blue-700 bg-blue-100/60'
    },
    purple: {
      bg: 'bg-purple-50 text-purple-600 border-purple-100',
      badge: 'text-purple-700 bg-purple-100/60'
    },
    emerald: {
      bg: 'bg-teal-50 text-teal-600 border-teal-100',
      badge: 'text-teal-700 bg-teal-100/60'
    }
  };

  const scheme = colorMap[color] || colorMap.primary;

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs transition-all duration-200 hover:shadow-md ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h4 className="text-2xl font-bold text-slate-900 mt-1.5 tracking-tight">{value}</h4>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl border ${scheme.bg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(trend || description) && (
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs">
          {trend && (
            <span className={`px-1.5 py-0.5 rounded font-medium ${scheme.badge}`}>
              {trend}
            </span>
          )}
          <span className="text-slate-500">{description || trendLabel}</span>
        </div>
      )}
    </div>
  );
}

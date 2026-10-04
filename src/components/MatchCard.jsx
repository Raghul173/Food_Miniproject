import React, { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, MapPin, Users, HeartHandshake, Sparkles } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function MatchCard({ match, onRequest }) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const { donation, score, matchPercentage, reasons = [], breakdown } = match;

  let scoreColor = 'text-emerald-600 bg-emerald-50 border-emerald-200';
  let badgeColor = 'bg-emerald-600';
  if (score < 60) {
    scoreColor = 'text-slate-600 bg-slate-50 border-slate-200';
    badgeColor = 'bg-slate-600';
  } else if (score < 80) {
    scoreColor = 'text-amber-600 bg-amber-50 border-amber-200';
    badgeColor = 'bg-amber-600';
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 p-5 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        {/* Left: Donation Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
              {donation.food_category}
            </span>
            <StatusBadge status={donation.diet_type} size="sm" />
            <StatusBadge status={donation.status} size="sm" />
          </div>

          <h3 className="text-lg font-bold text-slate-900 leading-snug">{donation.food_name}</h3>

          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{donation.description}</p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-3">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-semibold">{donation.servings} Servings</span> ({donation.quantity} {donation.unit})
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{donation.pickup_address}, {donation.city}</span>
            </div>
          </div>
        </div>

        {/* Right: Score Ring / Badge */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 shrink-0">
          <div
            className={`px-3.5 py-2 rounded-2xl border flex items-center gap-2 font-bold ${scoreColor}`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span className="text-base tracking-tight">{matchPercentage || `${score}% Match`}</span>
          </div>

          <button
            onClick={() => onRequest(donation, score)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <HeartHandshake className="w-4 h-4" /> Request Food
          </button>
        </div>
      </div>

      {/* Transparent Reasons */}
      <div className="mt-4 pt-3.5 border-t border-slate-100">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-2">
          Match Explanation
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {reasons.slice(0, 4).map((r, idx) => (
            <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-700">
              <span className="text-emerald-600 font-bold shrink-0">{r.startsWith('✓') ? '✓' : r.startsWith('✗') ? '✗' : '~'}</span>
              <span className="line-clamp-1">{r.replace(/^[✓✗~]\s*/, '')}</span>
            </div>
          ))}
        </div>

        {/* Expandable Breakdown Button */}
        {breakdown && (
          <div className="mt-3">
            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              {showBreakdown ? 'Hide Weighted Score Breakdown' : 'View Full Weighted Score Breakdown'}
              {showBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showBreakdown && (
              <div className="mt-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2 text-xs">
                {Object.entries(breakdown).map(([key, item]) => (
                  <div key={key} className="flex items-center justify-between text-xs">
                    <span className="capitalize font-medium text-slate-700">
                      {key} ({item.weight}%)
                    </span>
                    <span className="text-slate-500 text-[11px]">{item.reason}</span>
                    <span className="font-bold text-slate-900 shrink-0 ml-2">
                      {item.score}/{item.weight} pts
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

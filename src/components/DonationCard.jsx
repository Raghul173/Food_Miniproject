import React from 'react';
import { Clock, MapPin, Users, AlertTriangle, ShieldCheck, HeartHandshake } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function DonationCard({
  donation,
  onRequest,
  onViewDetails,
  showActions = true,
  isRecipient = false
}) {
  const now = new Date();
  const consumeDate = donation.consume_before ? new Date(donation.consume_before) : null;
  const hoursLeft = consumeDate ? (consumeDate - now) / (1000 * 60 * 60) : 999;
  const isExpiringSoon = hoursLeft > 0 && hoursLeft <= 3;
  const isExpired = hoursLeft <= 0 || donation.status === 'EXPIRED';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between">
      {/* Top Banner if expiring soon */}
      {isExpiringSoon && donation.status === 'AVAILABLE' && (
        <div className="bg-amber-500 text-white px-4 py-1.5 text-xs font-semibold flex items-center gap-1.5 tracking-wide">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>Surplus Deadline Approaching ({Math.max(1, Math.round(hoursLeft))}h remaining)</span>
        </div>
      )}

      <div className="p-5 flex-1">
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
              {donation.food_category}
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-1.5 leading-snug line-clamp-1">
              {donation.food_name}
            </h3>
          </div>
          <StatusBadge status={donation.status} size="sm" />
        </div>

        {donation.description && (
          <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
            {donation.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2 my-3 text-xs">
          <div className="bg-slate-50 rounded-xl p-2.5 flex items-center gap-2 border border-slate-100">
            <Users className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-600 font-bold uppercase">Servings</p>
              <p className="font-bold text-slate-900">
                {donation.servings} people ({donation.quantity} {donation.unit})
              </p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-2.5 flex items-center gap-2 border border-slate-100">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-600 font-bold uppercase">Consume Before</p>
              <p className="font-bold text-slate-900 truncate">
                {consumeDate
                  ? consumeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Details & Location */}
        <div className="space-y-1.5 text-xs text-slate-600 pt-1">
          <div className="flex items-center gap-1.5">
            <StatusBadge status={donation.diet_type} size="sm" />
            {donation.allergens && donation.allergens !== 'None' && (
              <span className="text-[11px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full font-medium">
                Allergens: {donation.allergens}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-slate-500 pt-1 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">
              {donation.pickup_address}, {donation.city}
            </span>
          </div>

          {donation.donor_name && (
            <div className="flex items-center gap-1.5 text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="font-medium text-slate-700">{donation.donor_name}</span>
            </div>
          )}
        </div>

        {/* Safety advisory */}
        {isExpiringSoon && (
          <div className="mt-3 p-2 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-800 leading-tight">
            The stated consumption deadline is approaching. Please verify storage and food-handling conditions before distribution.
          </div>
        )}
      </div>

      {showActions && (
        <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(donation)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 py-1.5 px-3 rounded-lg hover:bg-slate-200/60 transition-colors"
            >
              Details
            </button>
          )}

          {isRecipient && donation.status === 'AVAILABLE' && !isExpired && onRequest && (
            <button
              onClick={() => onRequest(donation)}
              className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              <HeartHandshake className="w-4 h-4" /> Request Food
            </button>
          )}
        </div>
      )}
    </div>
  );
}

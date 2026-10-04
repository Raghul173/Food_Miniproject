import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  Truck,
  MapPin,
  Phone,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ExternalLink
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function RecipientRequests() {
  const { showToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [cancelId, setCancelId] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/requests');
      if (res.data?.success) {
        setRequests(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load requests.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCancelRequest = async () => {
    if (!cancelId) return;
    setCancelling(true);
    try {
      const res = await api.patch(`/requests/${cancelId}/cancel`);
      if (res.data?.success) {
        showToast('Request cancelled.', 'info');
        setRequests((prev) =>
          prev.map((r) => (r.id === cancelId ? { ...r, status: 'CANCELLED' } : r))
        );
      }
    } catch (err) {
      showToast('Failed to cancel request.', 'error');
    } finally {
      setCancelling(false);
      setCancelId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Track Surplus Requests & Pickups
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor donor acceptance, scheduled logistics details, and delivery milestones
        </p>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching requested surplus items..." />
      ) : requests.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-xs">
          You haven't requested any food surplus yet. Explore matching donations to begin!
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{req.food_name}</h3>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded uppercase">
                      {req.food_category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Offered by <span className="font-semibold text-slate-800">{req.donor_name}</span> ({req.donor_org_type || 'Restaurant'})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {req.match_score && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      {req.match_score}% Match
                    </span>
                  )}
                  <StatusBadge status={req.status} size="sm" />
                </div>
              </div>

              {/* Servings & Contact Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Servings</span>
                  <p className="font-bold text-slate-900 text-sm">{req.requested_servings} Meals</p>
                  <p className="text-slate-500 text-[11px]">Diet: {req.diet_type}</p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Donor Contact</span>
                  <p className="font-semibold text-slate-900 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {req.donor_phone || '+91 9444123456'}
                  </p>
                  <p className="text-slate-500 text-[11px] truncate">{req.donor_email}</p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Pickup Location</span>
                  <p className="text-slate-700 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{req.pickup_address || req.donation_pickup_address}</span>
                  </p>
                </div>
              </div>

              {/* Pickup Logistics Schedule (if accepted) */}
              {req.pickup_date && (
                <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-950">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Calendar className="w-4 h-4 text-emerald-600" /> {req.pickup_date}
                    </span>
                    <span className="flex items-center gap-1.5 font-bold">
                      <Clock className="w-4 h-4 text-emerald-600" /> {req.pickup_time}
                    </span>
                    <span className="flex items-center gap-1.5 font-semibold text-emerald-800">
                      <Truck className="w-4 h-4 text-emerald-600" /> {req.delivery_method?.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {req.special_instructions && (
                    <span className="text-xs text-slate-600 font-medium">
                      Note: {req.special_instructions}
                    </span>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-400">
                  Submitted on {new Date(req.requested_at).toLocaleDateString()}
                </span>

                {req.status === 'PENDING' && (
                  <button
                    onClick={() => setCancelId(req.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    Cancel Request
                  </button>
                )}

                {req.status === 'COMPLETED' && (
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Distributed Successfully
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm Cancel Dialog */}
      <ConfirmDialog
        isOpen={!!cancelId}
        onClose={() => setCancelId(null)}
        onConfirm={handleCancelRequest}
        title="Cancel Food Request?"
        message="Are you sure you want to withdraw your request for this food donation?"
        confirmText="Yes, Cancel Request"
        danger={true}
        loading={cancelling}
      />
    </div>
  );
}

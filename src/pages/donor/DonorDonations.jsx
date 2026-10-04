import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, Trash2, MapPin, Users, Clock, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function DonorDonations() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Cancel dialog
  const [cancelId, setCancelId] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      let url = `/donations?donor_id=${user.id}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const res = await api.get(url);
      if (res.data?.success) {
        setDonations(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load donations.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [user.id, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDonations();
  };

  const handleConfirmCancel = async () => {
    if (!cancelId) return;
    setCancelling(true);
    try {
      const res = await api.delete(`/donations/${cancelId}`);
      if (res.data?.success) {
        showToast('Donation cancelled.', 'info');
        setDonations((prev) =>
          prev.map((d) => (d.id === cancelId ? { ...d, status: 'CANCELLED' } : d))
        );
      }
    } catch (err) {
      showToast('Failed to cancel donation.', 'error');
    } finally {
      setCancelling(false);
      setCancelId(null);
    }
  };

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'AVAILABLE', label: 'Available' },
    { value: 'REQUESTED', label: 'Requested' },
    { value: 'ACCEPTED', label: 'Accepted' },
    { value: 'PICKUP_SCHEDULED', label: 'Pickup Scheduled' },
    { value: 'COLLECTED', label: 'Collected' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'EXPIRED', label: 'Expired' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Manage Food Donations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track published surplus inventory and distribution milestones
          </p>
        </div>

        <Link
          to="/donor/donations/create"
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2 self-start sm:self-auto shrink-0"
        >
          <PlusCircle className="w-4 h-4" /> Post New Donation
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by food name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-xl text-xs border border-slate-200 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs text-slate-500 font-medium shrink-0">Filter Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-emerald-600"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Donations List */}
      {loading ? (
        <LoadingSpinner message="Fetching your donations..." />
      ) : donations.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-xs space-y-3">
          <p className="font-semibold text-slate-700">No food donations found.</p>
          <p>You haven't posted any surplus items matching this filter.</p>
          <Link
            to="/donor/donations/create"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs"
          >
            <PlusCircle className="w-4 h-4" /> Create First Donation
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {donations.map((d) => (
            <div
              key={d.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded uppercase">
                    {d.food_category}
                  </span>
                  <StatusBadge status={d.status} size="sm" />
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">{d.food_name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">{d.description}</p>

                <div className="grid grid-cols-2 gap-2 my-3 text-xs">
                  <div className="bg-slate-50 rounded-xl p-2 border border-slate-100 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Servings</span>
                      <span className="font-bold text-slate-800">
                        {d.servings} ({d.quantity} {d.unit})
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-2 border border-slate-100 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Expiry</span>
                      <span className="font-bold text-slate-800 truncate">
                        {new Date(d.consume_before).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 space-y-1">
                  <div className="flex items-center gap-1 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{d.pickup_address}, {d.city}</span>
                  </div>
                  <div>
                    Diet: <span className="font-semibold text-slate-700">{d.diet_type}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <Link
                  to="/donor/requests"
                  className="text-xs font-bold text-emerald-600 hover:underline"
                >
                  View Requests ({d.pending_requests_count || 0})
                </Link>

                {['AVAILABLE', 'REQUESTED'].includes(d.status) && (
                  <button
                    onClick={() => setCancelId(d.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Cancel donation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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
        onConfirm={handleConfirmCancel}
        title="Cancel Food Donation?"
        message="Are you sure you want to cancel this donation? Recipients will no longer be able to request it."
        confirmText="Cancel Donation"
        danger={true}
        loading={cancelling}
      />
    </div>
  );
}

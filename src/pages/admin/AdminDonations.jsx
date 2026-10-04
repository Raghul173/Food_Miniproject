import React, { useState, useEffect } from 'react';
import { Search, Trash2, MapPin, Users, Clock, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function AdminDonations() {
  const { showToast } = useToast();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const [cancelId, setCancelId] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      let url = '/donations?';
      if (statusFilter) url += `status=${statusFilter}&`;
      if (search) url += `search=${encodeURIComponent(search)}`;

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
  }, [statusFilter]);

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
        showToast('Donation marked cancelled by admin.', 'success');
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Donation Supervision
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor all food surplus batches, verify safety compliance, and withdraw non-compliant items
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by food name, donor, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-xl text-xs border border-slate-200 focus:outline-none focus:border-indigo-600 focus:bg-white"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs text-slate-500 font-medium shrink-0">Filter Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 font-semibold text-slate-700 focus:outline-none focus:border-indigo-600"
          >
            <option value="">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="REQUESTED">Requested</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="COMPLETED">Completed</option>
            <option value="EXPIRED">Expired</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching food surplus records..." />
      ) : donations.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-xs">
          No donations found.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 divide-y divide-slate-100">
              <thead className="bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Food Item</th>
                  <th className="px-6 py-4">Donor Organization</th>
                  <th className="px-6 py-4">Quantity / Servings</th>
                  <th className="px-6 py-4">Deadline</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {donations.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-sm">{d.food_name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {d.food_category} • {d.diet_type}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{d.donor_name}</div>
                      <div className="text-[11px] text-slate-400">
                        {d.city} • {d.donor_phone}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{d.servings} Servings</div>
                      <div className="text-[11px] text-slate-400">
                        {d.quantity} {d.unit}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">
                        {new Date(d.consume_before).toLocaleDateString()}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(d.consume_before).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={d.status} size="sm" />
                    </td>

                    <td className="px-6 py-4 text-right">
                      {['AVAILABLE', 'REQUESTED'].includes(d.status) && (
                        <button
                          onClick={() => setCancelId(d.id)}
                          className="px-2.5 py-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200"
                        >
                          Cancel Listing
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!cancelId}
        onClose={() => setCancelId(null)}
        onConfirm={handleConfirmCancel}
        title="Admin Cancellation"
        message="Are you sure you want to cancel this surplus donation? It will immediately be withdrawn from match recommendations."
        confirmText="Confirm Cancel"
        danger={true}
        loading={cancelling}
      />
    </div>
  );
}

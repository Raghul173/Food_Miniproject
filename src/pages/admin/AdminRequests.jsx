import React, { useState, useEffect } from 'react';
import { Search, Calendar, Truck, Clock, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminRequests() {
  const { showToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      let url = '/admin/requests?';
      if (statusFilter) url += `status=${statusFilter}`;

      const res = await api.get(url);
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
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Surplus Requests & Logistics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Supervise all donor-recipient handoffs, match scores, and delivery fulfillment
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 font-medium shrink-0">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 font-semibold text-slate-700 shadow-xs focus:outline-none focus:border-indigo-600"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="COMPLETED">Completed</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching request transactions..." />
      ) : requests.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-xs">
          No requests found matching criteria.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 divide-y divide-slate-100">
              <thead className="bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Food Item</th>
                  <th className="px-6 py-4">Recipient Organization</th>
                  <th className="px-6 py-4">Donor Organization</th>
                  <th className="px-6 py-4">Servings & Match</th>
                  <th className="px-6 py-4">Pickup Schedule</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-sm">{r.food_name}</div>
                      <div className="text-[11px] text-slate-400">
                        {r.food_category} • {r.diet_type}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{r.recipient_name}</div>
                      <div className="text-[11px] text-slate-400">
                        {r.recipient_phone}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{r.donor_name}</div>
                      <div className="text-[11px] text-slate-400">{r.donor_phone}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{r.requested_servings} Servings</div>
                      {r.match_score && (
                        <div className="text-[11px] text-emerald-700 font-semibold">
                          {r.match_score}% Score
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {r.pickup_date ? (
                        <div>
                          <div className="font-medium text-slate-800">
                            {r.pickup_date} at {r.pickup_time}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {r.delivery_method?.replace(/_/g, ' ')}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Not scheduled</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={r.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

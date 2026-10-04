import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, Ban, RefreshCw, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminUsers() {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let url = '/admin/users?';
      if (roleFilter) url += `role=${roleFilter}&`;
      if (search) url += `search=${encodeURIComponent(search)}`;

      const res = await api.get(url);
      if (res.data?.success) {
        setUsers(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load users list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleVerify = async (id) => {
    try {
      const res = await api.patch(`/admin/users/${id}/verify`);
      if (res.data?.success) {
        showToast('User verified successfully.', 'success');
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, is_verified: true } : u)));
      }
    } catch (err) {
      showToast('Failed to verify user.', 'error');
    }
  };

  const handleSuspend = async (id) => {
    try {
      const res = await api.patch(`/admin/users/${id}/suspend`);
      if (res.data?.success) {
        showToast('User account suspended.', 'info');
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, is_active: false } : u)));
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to suspend user.', 'error');
    }
  };

  const handleActivate = async (id) => {
    try {
      const res = await api.patch(`/admin/users/${id}/activate`);
      if (res.data?.success) {
        showToast('User account reactivated.', 'success');
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, is_active: true } : u)));
      }
    } catch (err) {
      showToast('Failed to activate user.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">User Management</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review, verify organization credentials, or restrict access across donors and recipients
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-xl text-xs border border-slate-200 focus:outline-none focus:border-indigo-600 focus:bg-white"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs text-slate-500 font-medium shrink-0">Filter Role:</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 font-semibold text-slate-700 focus:outline-none focus:border-indigo-600"
          >
            <option value="">All Roles</option>
            <option value="DONOR">Donors Only</option>
            <option value="RECIPIENT">Recipients Only</option>
            <option value="ADMIN">Administrators</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <LoadingSpinner message="Fetching user directory..." />
      ) : users.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-xs">
          No users found matching your filters.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 divide-y divide-slate-100">
              <thead className="bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">User / Organization</th>
                  <th className="px-6 py-4">Role & Category</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Verification</th>
                  <th className="px-6 py-4">Account Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-sm">{u.name}</div>
                      <div className="text-[11px] text-slate-400">
                        Joined {new Date(u.created_at).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide ${
                          u.role === 'DONOR'
                            ? 'bg-emerald-50 text-emerald-800'
                            : u.role === 'RECIPIENT'
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-indigo-50 text-indigo-800'
                        }`}
                      >
                        {u.role}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {u.donor_org || u.recipient_org || 'Standard Account'}
                      </p>
                    </td>

                    <td className="px-6 py-4 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Mail className="w-3 h-3 text-slate-400" /> {u.email}
                      </div>
                      {u.phone && (
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                          <Phone className="w-3 h-3 text-slate-400" /> {u.phone}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {u.is_verified ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-medium text-[11px] bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          Pending
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {u.is_active ? (
                        <span className="text-emerald-600 font-bold text-xs">Active</span>
                      ) : (
                        <span className="text-rose-600 font-bold text-xs">Suspended</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right space-x-2">
                      {!u.is_verified && (
                        <button
                          onClick={() => handleVerify(u.id)}
                          className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
                        >
                          Verify
                        </button>
                      )}

                      {u.role !== 'ADMIN' && (
                        u.is_active ? (
                          <button
                            onClick={() => handleSuspend(u.id)}
                            className="px-2.5 py-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(u.id)}
                            className="px-2.5 py-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200"
                          >
                            Activate
                          </button>
                        )
                      )}
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

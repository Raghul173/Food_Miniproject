import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Package,
  Inbox,
  CheckCircle,
  Clock,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import api from '../../services/api';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.get('/admin/dashboard');
        if (res.data?.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading administrator dashboard..." />;
  }

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded-md">
            Administration & Operations
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            System Overview & Metrics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time platform operations, regulatory compliance, and community surplus tracking
          </p>
        </div>

        <Link
          to="/admin/reports"
          className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto shrink-0"
        >
          <TrendingUp className="w-4 h-4" /> View Full Analytics
        </Link>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Users"
          value={stats?.totalUsers || 0}
          icon={Users}
          color="blue"
          description={`${stats?.totalDonors || 0} Donors • ${stats?.totalRecipients || 0} Recipients`}
        />

        <StatCard
          title="Active Food Surplus"
          value={stats?.activeDonations || 0}
          icon={Package}
          color="primary"
          description="Available for immediate match"
        />

        <StatCard
          title="Pending Requests"
          value={stats?.pendingRequests || 0}
          icon={Inbox}
          color="secondary"
          description="Awaiting donor scheduling"
        />

        <StatCard
          title="Completed Transactions"
          value={stats?.completedDonations || 0}
          icon={CheckCircle}
          color="emerald"
          description={`${stats?.peopleServed || 0} people served`}
        />
      </div>

      {/* Secondary Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Expired Listings"
          value={stats?.expiredDonations || 0}
          icon={Clock}
          color="primary"
          description="Past consumption deadline"
        />

        <StatCard
          title="Cancelled Donations"
          value={stats?.cancelledDonations || 0}
          icon={Package}
          color="purple"
          description="Withdrawn by donor"
        />

        <StatCard
          title="Successful Matches"
          value={stats?.successfulMatches || 0}
          icon={TrendingUp}
          color="blue"
          description="Fulfillments via matching engine"
        />

        <StatCard
          title="Open Complaints"
          value={stats?.pendingComplaints || 0}
          icon={ShieldAlert}
          color="secondary"
          description="Disputes needing review"
        />
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <Link
          to="/admin/users"
          className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Users className="w-5 h-5" />
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">User Management</h3>
          <p className="text-xs text-slate-500 mt-1">
            Verify organization FSSAI licenses, activate or suspend member accounts.
          </p>
        </Link>

        <Link
          to="/admin/donations"
          className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Package className="w-5 h-5" />
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Monitor Food Inventory</h3>
          <p className="text-xs text-slate-500 mt-1">
            Supervise commercial donations, verify safety labels and cancel invalid batches.
          </p>
        </Link>

        <Link
          to="/admin/complaints"
          className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Dispute & Complaint Resolution</h3>
          <p className="text-xs text-slate-500 mt-1">
            Investigate delivery or quality issues and record official resolution notes.
          </p>
        </Link>
      </div>
    </div>
  );
}

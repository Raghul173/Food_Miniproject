import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  PlusCircle,
  Users,
  CheckCircle,
  Clock,
  Star,
  ArrowRight,
  Inbox,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function DonorDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [activeDonations, setActiveDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [analRes, reqRes, donRes] = await Promise.all([
          api.get('/analytics/donor'),
          api.get('/requests?status=PENDING'),
          api.get(`/donations?donor_id=${user.id}&status=AVAILABLE`)
        ]);

        if (analRes.data?.success) setAnalytics(analRes.data.data);
        if (reqRes.data?.success) setPendingRequests(reqRes.data.data || []);
        if (donRes.data?.success) setActiveDonations(donRes.data.data || []);
      } catch (err) {
        console.error('DonorDashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user.id]);

  if (loading) {
    return <LoadingSpinner message="Loading donor dashboard..." />;
  }

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md">
            Food Donor Workspace
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Welcome back, {user.name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your kitchen surplus, accept recipient requests, and track community impact.
          </p>
        </div>

        <Link
          to="/donor/donations/create"
          className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 self-start sm:self-auto shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Create Donation (NLP)
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Published"
          value={analytics?.totalDonations || 0}
          icon={Package}
          color="primary"
          description="Lifetime food surplus"
        />

        <StatCard
          title="Active Surplus"
          value={analytics?.activeDonations || 0}
          icon={Clock}
          color="secondary"
          description="Available for matching"
        />

        <StatCard
          title="People Served"
          value={analytics?.peopleServed || 0}
          icon={Users}
          color="blue"
          description="Beneficiaries nourished"
        />

        <StatCard
          title="Donor Rating"
          value={`${analytics?.averageRating || 5.0} ★`}
          icon={Star}
          color="purple"
          description={`${analytics?.reviewCount || 0} verified reviews`}
        />
      </div>

      {/* Pending Incoming Requests Alert Banner */}
      {pendingRequests.length > 0 && (
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 text-white rounded-xl shrink-0">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-950">
                You have {pendingRequests.length} incoming food request(s)
              </h4>
              <p className="text-xs text-amber-800">
                Recipients are waiting for your approval to schedule pickup.
              </p>
            </div>
          </div>
          <Link
            to="/donor/requests"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors self-start sm:self-auto"
          >
            Review Requests
          </Link>
        </div>
      )}

      {/* Grid: Active Surplus & Recent Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Donations */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Current Active Surplus</h3>
                <p className="text-[11px] text-slate-500">Live listings available to NGOs</p>
              </div>
              <Link to="/donor/donations" className="text-xs text-emerald-600 hover:underline font-semibold">
                View All
              </Link>
            </div>

            {activeDonations.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No active surplus food listed right now.
              </div>
            ) : (
              <div className="space-y-3">
                {activeDonations.slice(0, 4).map((d) => (
                  <div
                    key={d.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{d.food_name}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {d.servings} Servings • Good until {new Date(d.consume_before).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <StatusBadge status={d.status} size="sm" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/donor/donations/create"
            className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 justify-center"
          >
            <PlusCircle className="w-4 h-4" /> Post New Food Donation
          </Link>
        </div>

        {/* Incoming Requests */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recent Requests</h3>
                <p className="text-[11px] text-slate-500">Beneficiary community requests</p>
              </div>
              <Link to="/donor/requests" className="text-xs text-emerald-600 hover:underline font-semibold">
                Manage
              </Link>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No pending requests awaiting approval.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.slice(0, 4).map((req) => (
                  <div
                    key={req.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{req.recipient_name}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Requested {req.requested_servings} servings of "{req.food_name}"
                      </p>
                    </div>
                    <Link
                      to="/donor/requests"
                      className="px-2.5 py-1 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shrink-0"
                    >
                      Review
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/donor/requests"
            className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 justify-center"
          >
            View All Requests <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

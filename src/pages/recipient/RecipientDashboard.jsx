import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  PlusCircle,
  Inbox,
  Users,
  Heart,
  ArrowRight,
  Clock,
  MapPin,
  CheckCircle
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function RecipientDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [topMatches, setTopMatches] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [analRes, matchRes, reqRes] = await Promise.all([
          api.get('/analytics/recipient'),
          api.get('/matches'),
          api.get('/requests')
        ]);

        if (analRes.data?.success) setAnalytics(analRes.data.data);
        if (matchRes.data?.success) setTopMatches((matchRes.data.data || []).slice(0, 3));
        if (reqRes.data?.success) setRecentRequests((reqRes.data.data || []).slice(0, 4));
      } catch (err) {
        console.error('RecipientDashboard error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user.id]);

  if (loading) {
    return <LoadingSpinner message="Loading recipient workspace..." />;
  }

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded-md">
            Recipient Beneficiary Workspace
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Welcome, {user.name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Discover matched commercial food surplus, schedule pickups, and feed your community beneficiaries.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
          <Link
            to="/recipient/requirements/create"
            className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" /> Post Requirement
          </Link>

          <Link
            to="/recipient/matches"
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" /> Intelligent Matches
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Requirements"
          value={analytics?.activeRequirements || 0}
          icon={PlusCircle}
          color="primary"
          description="Open for matching"
        />

        <StatCard
          title="Active Requests"
          value={analytics?.pendingRequests || 0}
          icon={Inbox}
          color="secondary"
          description="Awaiting donor confirmation"
        />

        <StatCard
          title="Accepted Pickups"
          value={analytics?.acceptedRequests || 0}
          icon={Clock}
          color="blue"
          description="Ready for collection"
        />

        <StatCard
          title="Meals Received"
          value={analytics?.mealsReceived || 0}
          icon={Heart}
          color="emerald"
          description="Beneficiaries served"
        />
      </div>

      {/* Top AI Matches Feed */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> High Compatibility Surplus
            </div>
            <h3 className="text-base font-bold text-slate-900">Intelligent Match Recommendations</h3>
          </div>

          <Link
            to="/recipient/matches"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            View All Matches <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {topMatches.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No active donation matches at the moment. Post a food requirement to help our matching engine!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topMatches.map((m) => (
              <div
                key={m.donation.id}
                className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex flex-col justify-between hover:border-emerald-300 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded uppercase">
                      {m.donation.food_category}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                      {m.matchPercentage || `${m.score}%`}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 leading-snug">{m.donation.food_name}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{m.reasons[0]}</p>

                  <div className="text-[11px] text-slate-600 mt-2 space-y-0.5">
                    <p>Servings: <span className="font-semibold">{m.donation.servings} people</span></p>
                    <p className="truncate">Donor: {m.donation.donor_name}</p>
                  </div>
                </div>

                <Link
                  to="/recipient/matches"
                  className="mt-3 w-full py-2 text-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                >
                  Request Surplus
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Requests Tracking */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Your Recent Food Requests</h3>
            <p className="text-xs text-slate-500">Track pending confirmations and scheduled pickups</p>
          </div>

          <Link
            to="/recipient/requests"
            className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
          >
            Track All Requests <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentRequests.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            You haven't requested any food donations yet.
          </div>
        ) : (
          <div className="space-y-3">
            {recentRequests.map((r) => (
              <div
                key={r.id}
                className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900">{r.food_name}</h4>
                    <span className="text-[10px] text-slate-500">• from {r.donor_name}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Requested: <span className="font-semibold text-slate-700">{r.requested_servings} Servings</span> • {new Date(r.requested_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={r.status} size="sm" />
                  <Link
                    to="/recipient/requests"
                    className="text-xs font-semibold text-emerald-600 hover:underline"
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

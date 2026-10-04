import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  TrendingUp,
  Package,
  Users,
  CheckCircle,
  Clock,
  Download,
  Activity
} from 'lucide-react';
import api from '../../services/api';
import StatCard from '../../components/StatCard';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';

const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b'];

export default function AdminReports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await api.get('/analytics/admin');
        if (res.data?.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load admin analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Calculating real-time database analytics..." />;
  }

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded-md">
            Verified MySQL Data Analytics
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            System Analytics & Impact Metrics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Aggregated statistics dynamically queried from MySQL tables — zero hardcoded counts
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto shrink-0"
        >
          <Download className="w-4 h-4" /> Export Report (Print)
        </button>
      </div>

      {/* Top Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Published Donations"
          value={data?.totalDonations || 0}
          icon={Package}
          color="primary"
          description="Tracked food surplus events"
        />

        <StatCard
          title="Completed Rescues"
          value={data?.completedDonations || 0}
          icon={CheckCircle}
          color="emerald"
          description="Delivered to beneficiaries"
        />

        <StatCard
          title="Food Rescued (kg)"
          value={`${data?.foodRescued || 0} kg`}
          icon={TrendingUp}
          color="secondary"
          description="Diverted from waste"
        />

        <StatCard
          title="People Nourished"
          value={data?.peopleServed || 0}
          icon={Users}
          color="blue"
          description="Direct community impact"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Donations by Month */}
        <Card title="Donations Activity (By Month)" subtitle="Published vs Completed surplus trends">
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.byMonth || []}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="count" name="Total Published" fill="#059669" radius={[6, 6, 0, 0]} />
                <Bar dataKey="completed" name="Completed" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 2: Food Categories Breakdown */}
        <Card title="Surplus by Food Category" subtitle="Distribution across food types">
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.categories || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                  fontSize={10}
                >
                  {(data?.categories || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 3: Completed vs Cancelled vs Expired */}
        <Card title="Listing Status Distribution" subtitle="Resolution efficiency of surplus">
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.statusDist || []} layout="vertical">
                <XAxis type="number" stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={90} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="value" name="Donations" fill="#f59e0b" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 4: Diet Type Distribution */}
        <Card title="Dietary Preferences" subtitle="Vegetarian vs Vegan vs Non-veg volume">
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.dietDist || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  fontSize={10}
                >
                  {(data?.dietDist || []).map((entry, index) => (
                    <Cell key={`diet-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 5: User Growth by Role */}
        <Card
          title="Community Growth"
          subtitle="Donor vs Recipient registrations over time"
          className="lg:col-span-2"
        >
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.userGrowth || []}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area
                  type="monotone"
                  dataKey="donors"
                  name="Donors"
                  stroke="#059669"
                  fill="#10b981"
                  fillOpacity={0.25}
                />
                <Area
                  type="monotone"
                  dataKey="recipients"
                  name="Recipients"
                  stroke="#f59e0b"
                  fill="#fbbf24"
                  fillOpacity={0.25}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Audit Trail Feed */}
      <Card title="Audit Log Trail" subtitle="System events and verified state changes">
        <div className="space-y-2 text-xs divide-y divide-slate-100">
          {(data?.recentActivity || []).map((act, idx) => (
            <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                  {act.action}
                </span>
                <span className="text-slate-500 font-mono text-[11px] truncate max-w-md">
                  {typeof act.details === 'object' ? JSON.stringify(act.details) : act.details}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 shrink-0">
                {new Date(act.created_at).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

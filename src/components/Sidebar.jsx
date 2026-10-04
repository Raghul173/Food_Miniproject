import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  Package,
  Inbox,
  Clock,
  User,
  Sparkles,
  Users,
  ShieldAlert,
  BarChart3,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, isDonor, isRecipient, isAdmin } = useAuth();

  const donorLinks = [
    { to: '/donor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/donor/donations/create', label: 'Create Donation (NLP)', icon: PlusCircle, badge: 'AI' },
    { to: '/donor/donations', label: 'My Donations', icon: Package },
    { to: '/donor/requests', label: 'Incoming Requests', icon: Inbox },
    { to: '/donor/history', label: 'History & Ratings', icon: Clock },
    { to: '/donor/profile', label: 'Organization Profile', icon: User }
  ];

  const recipientLinks = [
    { to: '/recipient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/recipient/matches', label: 'Intelligent Matches', icon: Sparkles, badge: 'AI' },
    { to: '/recipient/requirements/create', label: 'Post Requirement (NLP)', icon: PlusCircle },
    { to: '/recipient/requirements', label: 'My Requirements', icon: FileText },
    { to: '/recipient/requests', label: 'Track Requests', icon: Inbox },
    { to: '/recipient/history', label: 'History & Ratings', icon: Clock },
    { to: '/recipient/profile', label: 'Organization Profile', icon: User }
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'System Overview', icon: LayoutDashboard },
    { to: '/admin/users', label: 'User Directory', icon: Users },
    { to: '/admin/donations', label: 'All Donations', icon: Package },
    { to: '/admin/requests', label: 'All Requests', icon: Inbox },
    { to: '/admin/complaints', label: 'Disputes & Issues', icon: ShieldAlert },
    { to: '/admin/reports', label: 'Analytics & Reports', icon: BarChart3 }
  ];

  const links = isDonor ? donorLinks : isRecipient ? recipientLinks : isAdmin ? adminLinks : [];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        {/* User Card */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 shadow-xs">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-900 truncate leading-tight">{user?.name}</h4>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded uppercase tracking-wider inline-block mt-0.5">
              {user?.role}
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to.endsWith('/dashboard')}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      <span>{link.label}</span>
                    </div>
                    {link.badge && (
                      <span
                        className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full ${
                          isActive
                            ? 'bg-emerald-800 text-emerald-100'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {link.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Role Tip */}
      <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100/60 text-[11px] text-emerald-900 mt-6">
        <p className="font-bold">Natural Language Active</p>
        <p className="text-emerald-700/80 text-[10px] mt-0.5 leading-snug">
          Type descriptions in plain English; our local AI extracts structured meal data automatically.
        </p>
      </div>
    </aside>
  );
}

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Utensils, LogOut, User, LayoutDashboard, Menu, X, Shield, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationPanel from './NotificationPanel';

export default function Navbar() {
  const { user, isAuthenticated, isDonor, isRecipient, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardLink = () => {
    if (isDonor) return '/donor/dashboard';
    if (isRecipient) return '/recipient/dashboard';
    if (isAdmin) return '/admin/dashboard';
    return '/';
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                FoodShare
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                  Surplus AI
                </span>
              </span>
              <p className="text-[10px] text-slate-500 font-medium -mt-1 hidden sm:block">
                Donation & Surplus Management
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link to="/" className="hover:text-emerald-600 transition-colors">
              Home
            </Link>
            {isAuthenticated ? (
              <>
                <Link to={getDashboardLink()} className="hover:text-emerald-600 transition-colors flex items-center gap-1.5">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                {isDonor && (
                  <>
                    <Link to="/donor/donations" className="hover:text-emerald-600 transition-colors">
                      My Donations
                    </Link>
                    <Link to="/donor/requests" className="hover:text-emerald-600 transition-colors">
                      Requests
                    </Link>
                  </>
                )}
                {isRecipient && (
                  <>
                    <Link to="/recipient/matches" className="hover:text-emerald-600 transition-colors flex items-center gap-1 text-emerald-600 font-semibold">
                      <Heart className="w-3.5 h-3.5" /> Intelligent Matches
                    </Link>
                    <Link to="/recipient/requirements" className="hover:text-emerald-600 transition-colors">
                      Requirements
                    </Link>
                    <Link to="/recipient/requests" className="hover:text-emerald-600 transition-colors">
                      My Requests
                    </Link>
                  </>
                )}
                {isAdmin && (
                  <>
                    <Link to="/admin/users" className="hover:text-emerald-600 transition-colors">
                      Users
                    </Link>
                    <Link to="/admin/donations" className="hover:text-emerald-600 transition-colors">
                      Donations
                    </Link>
                    <Link to="/admin/reports" className="hover:text-emerald-600 transition-colors">
                      Analytics
                    </Link>
                  </>
                )}
              </>
            ) : null}
          </nav>

          {/* Right Section: Notifications & User profile */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <NotificationPanel />

                <div className="h-6 w-px bg-slate-200 hidden sm:block" />

                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-slate-900 leading-tight">{user.name}</p>
                    <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-1.5 py-0.5 rounded">
                      {user.role}
                    </span>
                  </div>

                  <Link
                    to={isDonor ? '/donor/profile' : isRecipient ? '/recipient/profile' : '/admin/dashboard'}
                    className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 hover:border-emerald-600 transition-colors font-bold text-xs"
                    title="Profile"
                  >
                    {user.name.charAt(0)}
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl md:hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-700 hover:text-emerald-600"
          >
            Home
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to={getDashboardLink()}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-medium text-slate-700 hover:text-emerald-600"
              >
                Dashboard
              </Link>
              {isDonor && (
                <>
                  <Link
                    to="/donor/donations"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm font-medium text-slate-700 hover:text-emerald-600"
                  >
                    Donations
                  </Link>
                  <Link
                    to="/donor/donations/create"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm font-medium text-emerald-600 font-semibold"
                  >
                    + Donate Food (NLP)
                  </Link>
                  <Link
                    to="/donor/requests"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm font-medium text-slate-700 hover:text-emerald-600"
                  >
                    Requests
                  </Link>
                </>
              )}
              {isRecipient && (
                <>
                  <Link
                    to="/recipient/matches"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm font-medium text-emerald-600 font-semibold"
                  >
                    Intelligent Matches
                  </Link>
                  <Link
                    to="/recipient/requirements/create"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm font-medium text-slate-700 hover:text-emerald-600"
                  >
                    + Request Food (NLP)
                  </Link>
                  <Link
                    to="/recipient/requests"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm font-medium text-slate-700 hover:text-emerald-600"
                  >
                    Track Requests
                  </Link>
                </>
              )}
              {isAdmin && (
                <>
                  <Link
                    to="/admin/users"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm font-medium text-slate-700"
                  >
                    Manage Users
                  </Link>
                  <Link
                    to="/admin/reports"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm font-medium text-slate-700"
                  >
                    Analytics
                  </Link>
                </>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="block w-full text-left text-sm font-medium text-rose-600 pt-2 border-t border-slate-100"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-xl"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-semibold text-white bg-emerald-600 rounded-xl"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

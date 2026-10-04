import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Utensils, Lock, Mail, ArrowRight, Shield, Heart, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import FormInput from '../components/FormInput';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      showToast(`Welcome back, ${res.user.name}!`, 'success');
      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else if (res.user.role === 'DONOR') {
        navigate('/donor/dashboard', { replace: true });
      } else if (res.user.role === 'RECIPIENT') {
        navigate('/recipient/dashboard', { replace: true });
      } else if (res.user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } else {
      setErrorMsg(res.message);
      showToast(res.message, 'error');
    }
  };

  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoading(true);
    setErrorMsg('');

    const res = await login(demoEmail, demoPassword);
    setLoading(false);

    if (res.success) {
      showToast(`Logged in as ${res.user.name}`, 'success');
      if (res.user.role === 'DONOR') navigate('/donor/dashboard');
      else if (res.user.role === 'RECIPIENT') navigate('/recipient/dashboard');
      else if (res.user.role === 'ADMIN') navigate('/admin/dashboard');
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xl">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md mb-3">
            <Utensils className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign In to FoodShare
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Access your food surplus dashboard, matching feed, and active pickups
          </p>
        </div>

        {/* Quick Demo Logins Bar */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
            ⚡ 1-Click Demo Accounts
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('donor1@foodshare.org', 'DonorPassword@123')}
              className="px-2 py-2 text-center rounded-xl border border-emerald-200 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-900 text-xs font-bold transition-colors flex flex-col items-center gap-1"
            >
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>Green Leaf</span>
              <span className="text-[9px] text-emerald-700 font-medium">Donor</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('recipient1@foodshare.org', 'RecipientPassword@123')}
              className="px-2 py-2 text-center rounded-xl border border-amber-200 bg-amber-50/80 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-colors flex flex-col items-center gap-1"
            >
              <Heart className="w-4 h-4 text-amber-600" />
              <span>Hope NGO</span>
              <span className="text-[9px] text-amber-700 font-medium">Recipient</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('admin@foodshare.org', 'AdminPassword@123')}
              className="px-2 py-2 text-center rounded-xl border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-900 text-xs font-bold transition-colors flex flex-col items-center gap-1"
            >
              <Shield className="w-4 h-4 text-indigo-600" />
              <span>Admin</span>
              <span className="text-[9px] text-indigo-700 font-medium">Manager</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Email Address"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@organization.org"
            required
          />

          <FormInput
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Sign In <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-emerald-600 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}

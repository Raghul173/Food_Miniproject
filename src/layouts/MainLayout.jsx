import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Heart, Utensils, ShieldCheck } from 'lucide-react';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2 font-medium text-slate-700">
              <Utensils className="w-4 h-4 text-emerald-600" />
              <span>Food Donation & Surplus Management System</span>
            </div>
            <p className="flex items-center gap-1">
              Engineered with local explainable AI & community care <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            </p>
            <div className="flex items-center gap-4 text-slate-400">
              <span>Zero external AI APIs</span>
              <span>•</span>
              <span>100% Local & Privacy-Preserving</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

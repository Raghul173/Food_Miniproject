import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

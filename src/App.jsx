import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Providers
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layouts & Protection
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Donor Pages
import DonorDashboard from './pages/donor/DonorDashboard';
import DonorProfile from './pages/donor/DonorProfile';
import DonorDonations from './pages/donor/DonorDonations';
import CreateDonation from './pages/donor/CreateDonation';
import DonorRequests from './pages/donor/DonorRequests';
import DonorHistory from './pages/donor/DonorHistory';

// Recipient Pages
import RecipientDashboard from './pages/recipient/RecipientDashboard';
import RecipientProfile from './pages/recipient/RecipientProfile';
import RecipientRequirements from './pages/recipient/RecipientRequirements';
import CreateRequirement from './pages/recipient/CreateRequirement';
import RecipientMatches from './pages/recipient/RecipientMatches';
import RecipientRequests from './pages/recipient/RecipientRequests';
import RecipientHistory from './pages/recipient/RecipientHistory';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDonations from './pages/admin/AdminDonations';
import AdminRequests from './pages/admin/AdminRequests';
import AdminComplaints from './pages/admin/AdminComplaints';
import AdminReports from './pages/admin/AdminReports';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Layout */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Donor Workspace */}
            <Route
              path="/donor"
              element={
                <ProtectedRoute allowedRoles={['DONOR']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<DonorDashboard />} />
              <Route path="profile" element={<DonorProfile />} />
              <Route path="donations" element={<DonorDonations />} />
              <Route path="donations/create" element={<CreateDonation />} />
              <Route path="requests" element={<DonorRequests />} />
              <Route path="history" element={<DonorHistory />} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Recipient Workspace */}
            <Route
              path="/recipient"
              element={
                <ProtectedRoute allowedRoles={['RECIPIENT']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<RecipientDashboard />} />
              <Route path="profile" element={<RecipientProfile />} />
              <Route path="requirements" element={<RecipientRequirements />} />
              <Route path="requirements/create" element={<CreateRequirement />} />
              <Route path="matches" element={<RecipientMatches />} />
              <Route path="requests" element={<RecipientRequests />} />
              <Route path="history" element={<RecipientHistory />} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Admin Workspace */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="donations" element={<AdminDonations />} />
              <Route path="requests" element={<AdminRequests />} />
              <Route path="complaints" element={<AdminComplaints />} />
              <Route path="reports" element={<AdminReports />} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

import { useEffect } from "react";
import { supabase } from "./lib/supabase";
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FarmerDashboard from './pages/FarmerDashboard';
import AddBatchPage from './pages/AddBatchPage';
import MyBatchesPage from './pages/MyBatchesPage';
import TransportDashboard from './pages/TransportDashboard';
import WarehouseDashboard from './pages/WarehouseDashboard';
import RetailerDashboard from './pages/RetailerDashboard';
import ConsumerVerifyPage from './pages/ConsumerVerifyPage';
import BlockchainExplorerPage from './pages/BlockchainExplorerPage';
import AdminPanelPage from './pages/AdminPanelPage';
import FutureScopePage from './pages/FutureScopePage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-agri-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && (!user?.role || (!allowedRoles.includes(user.role.toLowerCase()) && user.role.toLowerCase() !== 'admin'))) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Layout with Sidebar for Dashboard routes
const DashboardLayout = ({ children }) => {
  return (
    <div className="flex relative">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full transition-all duration-300">
        {children}
      </main>
    </div>
  );
};

export default function App() {
  useEffect(() => {
    const testSupabase = async () => {
      if (!supabase) {
        console.warn("⚠️ Supabase is not configured. Skipping connection test.");
        return;
      }
      const { data, error } = await supabase
        .from("farmers")
        .select("*");

      if (error) {
        console.error("❌ Supabase connection error:", error);
      } else {
        console.log("✅ Supabase connected!");
        console.log("Farmers:", data);
      }
    };

    testSupabase();
  }, []);
  const location = useLocation();
  const isPublicStandalone = ['/', '/login', '/register'].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#0F172A]">
      <Navbar />

      {isPublicStandalone ? (
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </div>
      ) : (
        <div className="flex-1">
          <Routes>
            {/* Public Utility Routes */}
            <Route path="/verify" element={<main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full"><ConsumerVerifyPage /></main>} />
            <Route path="/explorer" element={<main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full"><BlockchainExplorerPage /></main>} />
            <Route path="/future-scope" element={<main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full"><FutureScopePage /></main>} />

            {/* Protected Role Dashboards */}
            <Route path="/farmer/dashboard" element={<ProtectedRoute allowedRoles={['farmer']}><DashboardLayout><FarmerDashboard /></DashboardLayout></ProtectedRoute>} />
            <Route path="/farmer/add-batch" element={<ProtectedRoute allowedRoles={['farmer']}><DashboardLayout><AddBatchPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/farmer/my-batches" element={<ProtectedRoute allowedRoles={['farmer']}><DashboardLayout><MyBatchesPage /></DashboardLayout></ProtectedRoute>} />

            <Route path="/transport/dashboard" element={<ProtectedRoute allowedRoles={['transport']}><DashboardLayout><TransportDashboard /></DashboardLayout></ProtectedRoute>} />
            <Route path="/warehouse/dashboard" element={<ProtectedRoute allowedRoles={['warehouse']}><DashboardLayout><WarehouseDashboard /></DashboardLayout></ProtectedRoute>} />
            <Route path="/retailer/dashboard" element={<ProtectedRoute allowedRoles={['retailer']}><DashboardLayout><RetailerDashboard /></DashboardLayout></ProtectedRoute>} />

            <Route path="/admin/panel" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout><AdminPanelPage /></DashboardLayout></ProtectedRoute>} />

            <Route path="/profile" element={<ProtectedRoute><DashboardLayout><ProfilePage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><DashboardLayout><SettingsPage /></DashboardLayout></ProtectedRoute>} />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      )}
    </div>
  );
}

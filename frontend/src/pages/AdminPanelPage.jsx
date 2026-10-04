import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import StatCard from '../components/StatCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import NotificationToast from '../components/NotificationToast';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import { Users, Package, Activity, ShieldCheck, Check, X, Trash2, Award } from 'lucide-react';

export default function AdminPanelPage() {
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState({ text: '', type: 'success' });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [uRes, aRes] = await Promise.all([
        adminService.getUsers(),
        adminService.getAnalytics()
      ]);
      setUsers(uRes.data);
      setAnalytics(aRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId, approved) => {
    try {
      await adminService.approveUser(userId, approved);
      setToastMsg({ text: `User status updated to ${approved ? 'Approved' : 'Rejected'}`, type: 'success' });
      fetchAdminData();
    } catch (err) {
      console.error(err);
      setToastMsg({ text: 'Failed to update approval status', type: 'error' });
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user account?")) return;
    try {
      await adminService.deleteUser(userId);
      setToastMsg({ text: 'User deleted successfully', type: 'success' });
      fetchAdminData();
    } catch (err) {
      console.error(err);
      setToastMsg({ text: err.response?.data?.detail || 'Failed to delete user', type: 'error' });
    }
  };

  // Chart Data formatters
  const roleChartData = analytics ? Object.keys(analytics.role_distribution).map(k => ({
    name: k.toUpperCase(),
    value: analytics.role_distribution[k]
  })) : [];

  const statusChartData = analytics ? Object.keys(analytics.status_distribution).map(k => ({
    name: k,
    batches: analytics.status_distribution[k]
  })) : [];

  const COLORS = ['#16A34A', '#22C55E', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899'];

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            System Administration & Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitor platform usage, manage RBAC user registrations, and view supply chain health metrics
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <LoadingSkeleton count={4} />
      ) : analytics ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Registered Users" value={analytics.total_users} icon={Users} color="agri" subtext={`${analytics.pending_approvals} pending approvals`} />
          <StatCard title="Total Crop Batches" value={analytics.total_batches} icon={Package} color="blue" subtext="Registered on blockchain" />
          <StatCard title="Active Transactions" value={analytics.total_transactions} icon={Activity} color="amber" subtext="Custody log entries" />
          <StatCard title="Storage & Retail" value={analytics.warehouse_stored_count + analytics.retail_available_count} icon={ShieldCheck} color="emerald" subtext="Hub & Supermarket stock" />
        </div>
      ) : null}

      {/* RECHARTS ANALYTICS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Bar Chart: Batch Status Distribution */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Package className="w-5 h-5 text-agri-600" />
            Batch Status Lifecycle Breakdown
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusChartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: '12px', background: '#1E293B', color: '#fff' }} />
                <Bar dataKey="batches" fill="#16A34A" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Role Distribution */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-agri-600" />
            Platform Stakeholder Role Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {roleChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', background: '#1E293B', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* USER MANAGEMENT TABLE */}
      <div className="glass-card p-6">
        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-agri-600" />
          Manage Platform User Accounts & Approvals
        </h3>

        {loading ? (
          <LoadingSkeleton type="table" count={5} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-3">ID</th>
                  <th className="py-3 px-3">Name</th>
                  <th className="py-3 px-3">Email</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Approval Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-500">#{u.id}</td>
                    <td className="py-3.5 px-3 font-semibold text-slate-900 dark:text-slate-100">{u.name}</td>
                    <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300">{u.email}</td>
                    <td className="py-3.5 px-3 uppercase font-bold text-agri-600 dark:text-agri-400">{u.role}</td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        u.is_approved ? 'bg-agri-100 text-agri-700 border border-agri-300' : 'bg-amber-100 text-amber-700 border border-amber-300'
                      }`}>
                        {u.is_approved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right space-x-2">
                      {!u.is_approved ? (
                        <button
                          onClick={() => handleApprove(u.id, true)}
                          className="px-2.5 py-1 text-xs font-bold text-white bg-agri-600 hover:bg-agri-700 rounded-lg shadow-sm"
                        >
                          Approve
                        </button>
                      ) : (
                        <button
                          onClick={() => handleApprove(u.id, false)}
                          className="px-2.5 py-1 text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg"
                        >
                          Revoke
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(u.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <NotificationToast
        message={toastMsg.text}
        type={toastMsg.type}
        onClose={() => setToastMsg({ text: '', type: 'success' })}
      />

    </div>
  );
}

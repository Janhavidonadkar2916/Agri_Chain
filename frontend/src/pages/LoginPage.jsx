import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, Mail, Lock, UserCheck, ArrowRight, ShieldCheck } from 'lucide-react';
import NotificationToast from '../components/NotificationToast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('farmer');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const roles = [
    { id: 'farmer', label: 'Farmer' },
    { id: 'transport', label: 'Transport' },
    { id: 'warehouse', label: 'Warehouse' },
    { id: 'retailer', label: 'Retailer' },
    { id: 'consumer', label: 'Consumer' },
    { id: 'admin', label: 'Admin' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const user = await login(email, password, role);
      const userRole = user?.role?.toLowerCase() || '';
      
      switch (userRole) {
        case 'farmer': navigate('/farmer/dashboard'); break;
        case 'transport': navigate('/transport/dashboard'); break;
        case 'warehouse': navigate('/warehouse/dashboard'); break;
        case 'retailer': navigate('/retailer/dashboard'); break;
        case 'admin': navigate('/admin/panel'); break;
        default: navigate('/verify'); break;
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoRole) => {
    setRole(demoRole);
    setEmail(`${demoRole}@agrichain.com`);
    setPassword(`${demoRole}123`);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header Badge */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-agri-600 to-agri-500 text-white mx-auto flex items-center justify-center shadow-agri">
            <Sprout className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            Sign In to AgriChain
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Access your role-based Web3 supply chain portal
          </p>
        </div>

        {/* Login Form Card */}
        <div className="glass-card p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Role Selection Tabs */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Select Your Login Role
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`py-2.5 px-2 text-xs font-bold rounded-xl border transition-all ${
                      role === r.id
                        ? 'bg-agri-600 text-white border-agri-600 shadow-agri'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@agrichain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-agri-500"
                />
                <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-4" />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Password reset link sent to email."); }} className="text-xs font-semibold text-agri-600 dark:text-agri-400 hover:underline">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-agri-500"
                />
                <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-4" />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 font-bold text-sm text-white bg-agri-600 hover:bg-agri-700 rounded-xl shadow-agri hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign In as {roles.find(r => r.id === role)?.label}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Pre-fill Buttons */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-700 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
              Quick Demo Login Shortcuts
            </span>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {['farmer', 'transport', 'warehouse', 'retailer', 'admin'].map((dRole) => (
                <button
                  key={dRole}
                  type="button"
                  onClick={() => handleQuickDemo(dRole)}
                  className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-agri-100 dark:hover:bg-agri-950 transition-colors"
                >
                  {dRole}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Register Link */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-agri-600 dark:text-agri-400 hover:underline">
            Create new account
          </Link>
        </p>

      </div>

      <NotificationToast
        message={errorMsg}
        type="error"
        onClose={() => setErrorMsg('')}
      />
    </div>
  );
}

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, MapPin, ShieldCheck, Calendar, Award } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
          User Account Profile
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage your AgriChain identity, role credentials, and physical address
        </p>
      </div>

      <div className="glass-card p-5 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-5 pb-6 border-b border-slate-100 dark:border-slate-700">
          <div className="w-20 h-20 rounded-3xl bg-agri-600 text-white flex items-center justify-center font-extrabold text-3xl shadow-agri shrink-0">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{user?.name}</h2>
            <span className="text-xs font-bold uppercase tracking-wider text-agri-600 dark:text-agri-400 px-3 py-1 rounded-full bg-agri-50 dark:bg-agri-950 border border-agri-200 dark:border-agri-800 inline-block mt-1">
              {(user?.role || 'User')} Account
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="text-slate-400 font-bold flex items-center gap-1">
              <Mail className="w-4 h-4 text-agri-600" />
              Email Address
            </span>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 break-all">{user.email}</p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="text-slate-400 font-bold flex items-center gap-1">
              <Phone className="w-4 h-4 text-agri-600" />
              Phone Contact
            </span>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user.phone || 'Not provided'}</p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1 sm:col-span-2">
            <span className="text-slate-400 font-bold flex items-center gap-1">
              <MapPin className="w-4 h-4 text-agri-600" />
              Physical Location / Address
            </span>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user.address || 'Green Valley Farm, Punjab'}</p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-agri-600" />
            RBAC Account Status: Verified & Approved
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            Member since {new Date(user.created_at || Date.now()).toLocaleDateString()}
          </span>
        </div>
      </div>

    </div>
  );
}

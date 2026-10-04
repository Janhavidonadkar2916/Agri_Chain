import React from 'react';
import { motion } from 'framer-motion';

export default function StatCard({ title, value, icon: Icon, color = "agri", subtext }) {
  const colorMap = {
    agri: "bg-agri-50 dark:bg-agri-950/60 text-agri-600 dark:text-agri-400 border-agri-200 dark:border-agri-800",
    blue: "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    amber: "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    purple: "bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800",
    emerald: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
  };

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      className="glass-card p-5 flex items-center justify-between"
    >
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {title}
        </span>
        <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 font-sans">
          {value}
        </div>
        {subtext && (
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
            {subtext}
          </p>
        )}
      </div>

      {Icon && (
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm ${colorMap[color] || colorMap.agri}`}>
          <Icon className="w-6 h-6" />
        </div>
      )}
    </motion.div>
  );
}

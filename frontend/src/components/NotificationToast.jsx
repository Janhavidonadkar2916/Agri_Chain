import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function NotificationToast({ message, type = "success", onClose, duration = 4000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const typeMap = {
    success: { icon: CheckCircle2, bg: "bg-agri-600 text-white", border: "border-agri-500" },
    error: { icon: AlertCircle, bg: "bg-red-600 text-white", border: "border-red-500" },
    info: { icon: Info, bg: "bg-blue-600 text-white", border: "border-blue-500" }
  };

  const current = typeMap[type] || typeMap.info;
  const Icon = current.icon;

  return (
    <AnimatePresence>
      <div className="fixed bottom-6 right-6 z-50">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border ${current.bg} ${current.border}`}
        >
          <Icon className="w-5 h-5 shrink-0" />
          <span className="text-sm font-semibold pr-2">{message}</span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

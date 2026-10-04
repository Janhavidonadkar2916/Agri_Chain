import React from 'react';
import { Sprout, Truck, Warehouse, ShoppingBag, UserCheck, CheckCircle2, Clock, ShieldCheck, Hash } from 'lucide-react';

export default function TimelineView({ timeline = [], currentStatus = "Created" }) {
  const steps = [
    { key: "Farmer", label: "Farm Harvest", icon: Sprout, role: "Farmer" },
    { key: "Transport", label: "In Transit", icon: Truck, role: "Transport" },
    { key: "Warehouse", label: "Cold Storage", icon: Warehouse, role: "Warehouse" },
    { key: "Retailer", label: "Retail Outlet", icon: ShoppingBag, role: "Retailer" },
    { key: "Consumer", label: "End Consumer", icon: UserCheck, role: "Consumer" }
  ];

  const getStepState = (role) => {
    const rolesOrder = ["Farmer", "Transport", "Warehouse", "Retailer", "Consumer"];
    const statusRoleMap = {
      "Created": "Farmer",
      "In Transit": "Transport",
      "Stored": "Warehouse",
      "Available": "Retailer",
      "Sold": "Consumer"
    };

    const currentRole = statusRoleMap[currentStatus] || "Farmer";
    const currentIndex = rolesOrder.indexOf(currentRole);
    const stepIndex = rolesOrder.indexOf(role);

    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "active";
    return "pending";
  };

  return (
    <div className="space-y-6">
      
      {/* Horizontal Flow Badges */}
      <div className="p-6 glass-card overflow-x-auto">
        <div className="flex items-center justify-between min-w-[650px] relative">
          
          {/* Connector Bar Background */}
          <div className="absolute top-7 left-8 right-8 h-1 bg-slate-200 dark:bg-slate-700 z-0" />
          
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const state = getStepState(step.role);
            const isCompleted = state === "completed";
            const isActive = state === "active";

            return (
              <div key={step.key} className="relative z-10 flex flex-col items-center group">
                
                {/* Node Circle */}
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold transition-all duration-300 ${
                    isCompleted
                      ? 'bg-agri-600 text-white shadow-agri ring-4 ring-agri-100 dark:ring-agri-950'
                      : isActive
                      ? 'bg-amber-500 text-white shadow-lg ring-4 ring-amber-100 dark:ring-amber-950 animate-pulse'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-7 h-7" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>

                {/* Node Label */}
                <span className={`text-xs font-bold mt-2.5 ${isActive ? 'text-amber-600 dark:text-amber-400' : isCompleted ? 'text-agri-600 dark:text-agri-400' : 'text-slate-400 dark:text-slate-500'}`}>
                  {step.label}
                </span>

                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
                  Step 0{idx + 1}
                </span>
              </div>
            );
          })}

        </div>
      </div>

      {/* Vertical Detailed Provenance Logs */}
      <div className="glass-card p-6">
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-agri-600" />
          Verified Blockchain Event Provenance
        </h3>

        {timeline.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-sm">
            No history logs recorded yet.
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-agri-500/30">
            {timeline.map((item, idx) => (
              <div key={item.id || idx} className="relative flex items-start gap-4">
                
                {/* Node Marker */}
                <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-agri-600 border-2 border-white dark:border-slate-800 shadow-sm flex items-center justify-center text-white text-[10px] font-bold">
                  {idx + 1}
                </div>

                {/* Log Content Card */}
                <div className="flex-1 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {item.action}
                    </h4>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-agri-600" />
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Actor: <strong className="text-agri-700 dark:text-agri-300">{item.actor_name}</strong>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-agri-100 dark:bg-agri-950 text-agri-700 dark:text-agri-300 font-medium">
                      {item.from_role} → {item.to_role}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono">
                      Block #{item.block_number}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 font-mono text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
                    <Hash className="w-3 h-3 text-agri-600 shrink-0" />
                    Tx Hash: <span className="truncate text-agri-700 dark:text-agri-400">{item.tx_hash}</span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

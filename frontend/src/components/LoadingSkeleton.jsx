import React from 'react';

export default function LoadingSkeleton({ count = 3, type = "card" }) {
  const items = Array.from({ length: count });

  if (type === "table") {
    return (
      <div className="w-full space-y-3 animate-pulse">
        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl" />
        {items.map((_, i) => (
          <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
      {items.map((_, i) => (
        <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
          <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-1/2" />
          <div className="h-8 bg-slate-300 dark:bg-slate-700 rounded w-3/4" />
        </div>
      ))}
    </div>
  );
}

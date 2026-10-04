import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ArrowLeft, Search } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <div className="text-center max-w-md space-y-6 glass-card p-10 shadow-2xl">
        <div className="w-16 h-16 rounded-3xl bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center font-extrabold text-2xl">
          404
        </div>

        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            Page Not Found
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            The requested AgriChain URL route does not exist or has been relocated on the network.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            to="/"
            className="py-3 px-6 text-xs font-bold text-white bg-agri-600 hover:bg-agri-700 rounded-xl shadow-agri transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home Page
          </Link>
          <Link
            to="/verify"
            className="py-3 px-6 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4 text-agri-600" />
            Verify a Crop QR Code
          </Link>
        </div>
      </div>
    </div>
  );
}

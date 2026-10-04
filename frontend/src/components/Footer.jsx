import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ShieldCheck, Github, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Col 1: Brand & Tagline */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-agri-600 flex items-center justify-center text-white shadow-agri">
              <Sprout className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl text-slate-900 dark:text-slate-100 tracking-tight">
              AgriChain
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Blockchain-based agricultural supply chain transparency platform. Guaranteeing farm-to-fork provenance, authenticity, and immutable quality data.
          </p>
          <div className="flex items-center gap-2 text-xs text-agri-600 dark:text-agri-400 font-semibold bg-agri-50 dark:bg-agri-950/60 p-2.5 rounded-xl border border-agri-200 dark:border-agri-800">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            Secured by Solidity Smart Contracts & SHA-256
          </div>
        </div>

        {/* Col 2: Navigation Links */}
        <div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-4">
            Platform Links
          </h4>
          <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
            <li><Link to="/" className="hover:text-agri-600 transition-colors">Home Landing</Link></li>
            <li><Link to="/verify" className="hover:text-agri-600 transition-colors">Scan QR & Verify</Link></li>
            <li><Link to="/explorer" className="hover:text-agri-600 transition-colors">Blockchain Block Explorer</Link></li>
            <li><Link to="/future-scope" className="hover:text-agri-600 transition-colors">Hardware Roadmap</Link></li>
          </ul>
        </div>

        {/* Col 3: Role Portals */}
        <div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-4">
            User Roles
          </h4>
          <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
            <li><Link to="/login" className="hover:text-agri-600 transition-colors">Farmer Dashboard</Link></li>
            <li><Link to="/login" className="hover:text-agri-600 transition-colors">Logistics & Transport</Link></li>
            <li><Link to="/login" className="hover:text-agri-600 transition-colors">Warehouse Management</Link></li>
            <li><Link to="/login" className="hover:text-agri-600 transition-colors">Retailer Hub</Link></li>
            <li><Link to="/login" className="hover:text-agri-600 transition-colors">System Admin Portal</Link></li>
          </ul>
        </div>

        {/* Col 4: Project Info */}
        <div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-4">
            Project Specs
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Designed for Final Year PBL Project, Hackathons & Supply Chain Tech Startups.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              React + Vite
            </span>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              FastAPI
            </span>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Solidity
            </span>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Web3.py
            </span>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              PostgreSQL
            </span>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <p>© 2026 AgriChain. All rights reserved.</p>
        <p className="mt-2 sm:mt-0 font-medium">
          Built with <span className="text-red-500">♥</span> for Agricultural Transparency
        </p>
      </div>
    </footer>
  );
}

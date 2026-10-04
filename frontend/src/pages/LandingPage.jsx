import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sprout,
  Truck,
  Warehouse,
  ShoppingBag,
  UserCheck,
  ShieldCheck,
  QrCode,
  Lock,
  Eye,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Award,
  Globe2,
  ChevronRight
} from 'lucide-react';
import Footer from '../components/Footer';

export default function LandingPage() {
  const steps = [
    { title: "Farmer", desc: "Crop batch registered on chain with QR code", icon: Sprout, color: "from-green-500 to-emerald-600" },
    { title: "Transport", desc: "GPS & logistics logs updated during transit", icon: Truck, color: "from-blue-500 to-indigo-600" },
    { title: "Warehouse", desc: "Cold storage receipt & rack allocation", icon: Warehouse, color: "from-purple-500 to-violet-600" },
    { title: "Retailer", desc: "Supermarket pricing & stock verification", icon: ShoppingBag, color: "from-amber-500 to-orange-600" },
    { title: "Consumer", desc: "Instant QR scan revealing true farm provenance", icon: UserCheck, color: "from-agri-600 to-emerald-500" },
  ];

  const features = [
    { title: "Blockchain Security", desc: "Immutable Solidity smart contracts prevent counterfeit logs or tampering.", icon: Lock },
    { title: "QR Traceability", desc: "Instant QR code generation per batch for seamless scanning across the supply chain.", icon: QrCode },
    { title: "Secure Transactions", desc: "Cryptographic SHA-256 hashes link every single custody transfer.", icon: ShieldCheck },
    { title: "End-to-End Transparency", desc: "Complete visibility into harvest dates, storage racks, and transport handlers.", icon: Eye },
    { title: "Instant Product Verification", desc: "Consumers scan or search Batch IDs to instantly check authentic origin badges.", icon: CheckCircle },
  ];

  const stats = [
    { label: "Tracked Batches", val: "10,000+", icon: Sprout },
    { label: "Verified Farmers", val: "2,500+", icon: Award },
    { label: "Logistics Partners", val: "150+", icon: Truck },
    { label: "Blockchain Integrity", val: "100%", icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-agri-500/20 to-agri-300/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-agri-100 dark:bg-agri-950/80 text-agri-700 dark:text-agri-300 font-semibold text-xs border border-agri-200 dark:border-agri-800 shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-agri-600" />
              Next-Gen Blockchain Agricultural Provenance
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-6xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-tight"
            >
              Farm to Fork Transparency using{' '}
              <span className="bg-gradient-to-r from-agri-600 via-agri-500 to-emerald-500 bg-clip-text text-transparent">
                Blockchain
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-xl text-slate-600 dark:text-slate-300 font-normal leading-relaxed"
            >
              AgriChain guarantees complete agricultural supply chain visibility. Empower farmers, transport agents, warehouses, retailers, and end consumers with immutable QR verification.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-4 pt-4"
            >
              <Link
                to="/register"
                className="px-8 py-4 text-base font-bold text-white bg-agri-600 hover:bg-agri-700 rounded-2xl shadow-agri hover:shadow-lg transition-all duration-300 flex items-center gap-2"
              >
                Get Started Now
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/verify"
                className="px-8 py-4 text-base font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 rounded-2xl shadow-soft transition-all duration-300 flex items-center gap-2"
              >
                Verify a Batch QR
                <QrCode className="w-5 h-5 text-agri-600" />
              </Link>
            </motion.div>

          </div>

          {/* LARGE SUPPLY CHAIN DIAGRAM */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-16 glass-card p-8 sm:p-10 relative overflow-hidden"
          >
            <div className="text-center mb-8">
              <span className="text-xs font-bold text-agri-600 dark:text-agri-400 uppercase tracking-widest block">
                Immutable Supply Chain Flow
              </span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                Five-Stage Decentralized Lifecycle
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 relative">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.title}
                    className="relative bg-slate-50 dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/80 flex flex-col items-center text-center space-y-3 group hover:border-agri-500 transition-all duration-300"
                  >
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${step.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="text-[10px] font-extrabold text-agri-600 dark:text-agri-400 uppercase tracking-widest">
                      Stage 0{idx + 1}
                    </span>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {step.desc}
                    </p>

                    {idx < steps.length - 1 && (
                      <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 z-20">
                        <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-agri-600 shadow-sm">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>

        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-16 bg-white dark:bg-slate-900/80 border-y border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-agri-600 dark:text-agri-400 uppercase tracking-widest">
              Core Capabilities
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">
              Built for Absolute Trust & Verification
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="p-6 glass-card border border-slate-100 dark:border-slate-800 hover:border-agri-400 transition-all space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-agri-100 dark:bg-agri-950 text-agri-600 dark:text-agri-400 flex items-center justify-center font-bold">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* STATISTICS SECTION */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card p-6 sm:p-10 bg-gradient-to-r from-agri-900 via-agri-800 to-slate-900 text-white rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center relative z-10">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md mx-auto flex items-center justify-center text-agri-400">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="text-3xl sm:text-4xl font-extrabold font-sans text-white">
                      {stat.val}
                    </div>
                    <p className="text-xs font-semibold text-agri-200 uppercase tracking-wider">
                      {stat.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className="py-16 bg-slate-100/60 dark:bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <span className="text-xs font-bold text-agri-600 dark:text-agri-400 uppercase tracking-widest">
              About AgriChain
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              Eliminating Agricultural Fraud & Counterfeits
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              Traditional food supply chains suffer from information asymmetry, unverified origins, and counterfeit labeling. AgriChain bridges the physical-digital gap by linking every crop harvest batch to a unique QR code recorded on an immutable Web3 smart contract.
            </p>
            <ul className="space-y-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <li className="flex items-center gap-2 text-agri-700 dark:text-agri-400">
                <CheckCircle className="w-5 h-5 text-agri-600" />
                Guaranteed fair pricing and proof of harvest for farmers
              </li>
              <li className="flex items-center gap-2 text-agri-700 dark:text-agri-400">
                <CheckCircle className="w-5 h-5 text-agri-600" />
                Real-time transit logging and cold storage temperature compliance
              </li>
              <li className="flex items-center gap-2 text-agri-700 dark:text-agri-400">
                <CheckCircle className="w-5 h-5 text-agri-600" />
                Complete consumer confidence in organic certification & authenticity
              </li>
            </ul>
          </div>

          <div className="glass-card p-8 space-y-6">
            <h3 className="font-bold text-xl text-slate-900 dark:text-slate-100">
              Ready to verify a produce batch?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Experience AgriChain’s instant public verification portal. Enter a Batch ID or scan a QR code to view live farm-to-fork provenance.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/verify"
                className="flex-1 py-3 px-4 text-center font-bold text-sm text-white bg-agri-600 hover:bg-agri-700 rounded-xl shadow-md transition-all"
              >
                Scan Produce QR Code
              </Link>
              <Link
                to="/explorer"
                className="flex-1 py-3 px-4 text-center font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-all"
              >
                View Blockchain Explorer
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}

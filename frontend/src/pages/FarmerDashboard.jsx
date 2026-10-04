import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { farmerService } from '../services/api';
import StatCard from '../components/StatCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { Sprout, PlusCircle, Package, Truck, ShieldCheck, ArrowRight, Eye } from 'lucide-react';

export default function FarmerDashboard() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const res = await farmerService.getMyBatches();
      setBatches(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalBatches = batches.length;
  const pendingShipments = batches.filter(b => b.status === "Created" || b.status === "In Transit").length;
  const completedBatches = batches.filter(b => b.status === "Stored" || b.status === "Available" || b.status === "Sold").length;
  const verifiedBatches = batches.filter(b => b.blockchain_hash).length;

  return (
    <div className="space-y-6">
      
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            Farmer Harvest Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage your crop harvest batches & track blockchain custody transfers
          </p>
        </div>

        <Link
          to="/farmer/add-batch"
          className="px-5 py-2.5 text-sm font-bold text-white bg-agri-600 hover:bg-agri-700 rounded-xl shadow-agri hover:shadow-lg transition-all flex items-center gap-2 self-start"
        >
          <PlusCircle className="w-5 h-5" />
          Register New Crop Batch
        </Link>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <LoadingSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Batches" value={totalBatches} icon={Sprout} color="agri" subtext="All registered crops" />
          <StatCard title="Pending Shipments" value={pendingShipments} icon={Truck} color="amber" subtext="In transit or created" />
          <StatCard title="Completed Warehoused" value={completedBatches} icon={Package} color="blue" subtext="Stored or retailed" />
          <StatCard title="Verified Hashes" value={verifiedBatches} icon={ShieldCheck} color="emerald" subtext="Web3 contract verified" />
        </div>
      )}

      {/* Recent Batches Quick Table */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Package className="w-5 h-5 text-agri-600" />
            Recent Crop Registrations
          </h3>
          <Link
            to="/farmer/my-batches"
            className="text-xs font-bold text-agri-600 dark:text-agri-400 hover:underline flex items-center gap-1"
          >
            View All Batches ({totalBatches})
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <LoadingSkeleton type="table" count={3} />
        ) : batches.length === 0 ? (
          <div className="text-center py-10 space-y-3">
            <Sprout className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-500">No crop batches registered yet.</p>
            <Link
              to="/farmer/add-batch"
              className="inline-block text-xs font-bold text-agri-600 hover:underline"
            >
              Click here to create your first crop batch
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-3">Batch ID</th>
                  <th className="py-3 px-3">Crop Name</th>
                  <th className="py-3 px-3">Quantity</th>
                  <th className="py-3 px-3">Harvest Date</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Current Custody</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {batches.slice(0, 5).map((batch) => (
                  <tr key={batch.batch_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-agri-600 dark:text-agri-400">
                      {batch.batch_id}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      {batch.crop_name}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-600 dark:text-slate-300">
                      {batch.quantity} kg
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {batch.harvest_date}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-agri-100 dark:bg-agri-950 text-agri-700 dark:text-agri-300 border border-agri-300 dark:border-agri-800">
                        {batch.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-medium">
                      {batch.current_owner}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        to={`/verify?batchId=${batch.batch_id}`}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-agri-600 hover:text-white transition-colors inline-flex items-center gap-1 font-semibold"
                        title="View Public Provenance"
                      >
                        <Eye className="w-4 h-4" />
                        Verify
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { farmerService } from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import QRCodeDisplay from '../components/QRCodeDisplay';
import { Package, Search, Filter, Eye, QrCode, ShieldCheck, X } from 'lucide-react';

export default function MyBatchesPage() {
  const [batches, setBatches] = useState([]);
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedBatch, setSelectedBatch] = useState(null);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const res = await farmerService.getMyBatches();
      setBatches(res.data);
      setFilteredBatches(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = [...batches];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(b => 
        b.batch_id.toLowerCase().includes(q) ||
        b.crop_name.toLowerCase().includes(q) ||
        b.village.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'ALL') {
      result = result.filter(b => b.status.toUpperCase() === statusFilter.toUpperCase());
    }
    setFilteredBatches(result);
  }, [searchQuery, statusFilter, batches]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            My Registered Crop Batches
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            View full chain custody, blockchain hashes, and QR badges for your crops
          </p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search Batch ID or Crop..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-agri-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-agri-500 w-full sm:w-auto"
          >
            <option value="ALL">All Statuses</option>
            <option value="Created">Created</option>
            <option value="In Transit">In Transit</option>
            <option value="Stored">Stored</option>
            <option value="Available">Available</option>
            <option value="Sold">Sold</option>
          </select>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="glass-card p-6">
        {loading ? (
          <LoadingSkeleton type="table" count={5} />
        ) : filteredBatches.length === 0 ? (
          <div className="text-center py-12 text-slate-400 space-y-2">
            <Package className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-sm font-semibold">No crop batches match your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-3">Batch ID</th>
                  <th className="py-3 px-3">Crop Name</th>
                  <th className="py-3 px-3">Quantity</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Current Owner</th>
                  <th className="py-3 px-3">Blockchain Hash</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredBatches.map((batch) => (
                  <tr key={batch.batch_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-bold text-agri-600 dark:text-agri-400">
                      {batch.batch_id}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-900 dark:text-slate-100">
                      {batch.crop_name}
                    </td>
                    <td className="py-3.5 px-3 font-medium text-slate-600 dark:text-slate-300">
                      {batch.quantity} kg
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-agri-100 dark:bg-agri-950 text-agri-700 dark:text-agri-300 border border-agri-300 dark:border-agri-800">
                        {batch.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-medium text-slate-600 dark:text-slate-300">
                      {batch.current_owner}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[11px] text-slate-400 max-w-[140px] truncate">
                      {batch.blockchain_hash}
                    </td>
                    <td className="py-3.5 px-3 text-right space-x-2">
                      <button
                        onClick={() => setSelectedBatch(batch)}
                        className="p-1.5 rounded-lg bg-agri-50 dark:bg-agri-950 text-agri-600 dark:text-agri-400 border border-agri-200 dark:border-agri-800 hover:bg-agri-600 hover:text-white transition-colors"
                        title="View QR Code"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                      <a
                        href={`/verify?batchId=${batch.batch_id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors inline-block"
                        title="View Public Provenance Page"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL & QR MODAL */}
      {selectedBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-agri-600" />
                Batch Details & QR Badge
              </h3>
              <button onClick={() => setSelectedBatch(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <QRCodeDisplay
              batchId={selectedBatch.batch_id}
              cropName={selectedBatch.crop_name}
              harvestDate={selectedBatch.harvest_date}
            />

            <div className="space-y-2 text-xs bg-slate-50 dark:bg-slate-900 p-4 rounded-xl font-mono text-slate-600 dark:text-slate-300">
              <p><strong>Batch ID:</strong> {selectedBatch.batch_id}</p>
              <p><strong>Block Number:</strong> #{selectedBatch.block_number}</p>
              <p className="truncate"><strong>Tx Hash:</strong> {selectedBatch.tx_hash}</p>
              <p className="truncate"><strong>Block Hash:</strong> {selectedBatch.blockchain_hash}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

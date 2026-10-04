import React, { useState, useEffect } from 'react';
import { blockchainService } from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import NotificationToast from '../components/NotificationToast';
import { Search, ShieldCheck, Hash, Clock, User, Link as LinkIcon, Box, CheckCircle2 } from 'lucide-react';

export default function BlockchainExplorerPage() {
  const [blocks, setBlocks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchBlocks();
  }, []);

  const fetchBlocks = async () => {
    try {
      const res = await blockchainService.getBlocks();
      setBlocks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setErrorMsg('');

    try {
      const res = await blockchainService.search(searchQuery.trim());
      setSearchResult(res.data);
    } catch (err) {
      console.error(err);
      setSearchResult(null);
      setErrorMsg(err.response?.data?.detail || "No block found matching query.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-8 py-4">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-agri-100 dark:bg-agri-950 text-agri-700 dark:text-agri-300 text-xs font-bold border border-agri-300">
          <Search className="w-4 h-4 text-agri-600" />
          Web3 Ledger Explorer
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
          AgriChain Blockchain Block Explorer
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Search blocks, inspect transaction hashes, and verify cryptographic Merkle tree linkage
        </p>
      </div>

      {/* SEARCH BAR */}
      <div className="glass-card p-6 max-w-2xl mx-auto">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search Batch ID, Block Hash, or Tx Hash..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-agri-500 outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
          </div>

          <button
            type="submit"
            disabled={searching}
            className="px-6 py-3.5 font-bold text-xs text-white bg-agri-600 hover:bg-agri-700 rounded-xl shadow-agri transition-all w-full sm:w-auto text-center"
          >
            {searching ? 'Searching...' : 'Search Ledger'}
          </button>
        </form>
      </div>

      {/* SEARCH RESULT VIEW */}
      {searchResult && (
        <div className="glass-card p-6 border-2 border-agri-500 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Box className="w-5 h-5 text-agri-600" />
              Verified Block Details
            </h3>
            <button onClick={() => setSearchResult(null)} className="text-xs text-agri-600 font-bold hover:underline">
              Clear Search
            </button>
          </div>

          {searchResult.block && (
            <div className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border">
                  <span className="text-slate-400 font-bold block mb-1">Block Number:</span>
                  <span className="text-lg font-bold text-agri-600">#{searchResult.block.block_number}</span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border">
                  <span className="text-slate-400 font-bold block mb-1">Associated Batch ID:</span>
                  <span className="text-lg font-bold text-slate-800 dark:text-slate-200">{searchResult.block.batch_id}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border space-y-2">
                <div>
                  <span className="text-slate-400 font-bold">Current Block Hash:</span>
                  <span className="text-agri-600 font-bold block truncate">{searchResult.block.current_hash}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold">Previous Block Hash (Parent Linkage):</span>
                  <span className="text-slate-500 block truncate">{searchResult.block.prev_hash}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold">Transaction Hash:</span>
                  <span className="text-slate-500 block truncate">{searchResult.block.tx_hash}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* LATEST BLOCKS LIST TABLE */}
      <div className="glass-card p-6">
        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-agri-600" />
          Recent Verified Web3 Smart Contract Blocks
        </h3>

        {loading ? (
          <LoadingSkeleton type="table" count={5} />
        ) : blocks.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            No blockchain blocks registered yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-3">Block #</th>
                  <th className="py-3 px-3">Batch ID</th>
                  <th className="py-3 px-3">Current Hash</th>
                  <th className="py-3 px-3">Previous Hash</th>
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-3">Current Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {blocks.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors font-mono">
                    <td className="py-3.5 px-3 font-bold text-agri-600">
                      #{b.block_number}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-800 dark:text-slate-200">
                      {b.batch_id}
                    </td>
                    <td className="py-3.5 px-3 text-agri-600 font-bold max-w-[150px] truncate">
                      {b.current_hash}
                    </td>
                    <td className="py-3.5 px-3 text-slate-400 max-w-[150px] truncate">
                      {b.prev_hash}
                    </td>
                    <td className="py-3.5 px-3 text-slate-500 font-sans">
                      {new Date(b.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300 font-sans font-medium">
                      {b.owner}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <NotificationToast message={errorMsg} type="error" onClose={() => setErrorMsg('')} />
    </div>
  );
}

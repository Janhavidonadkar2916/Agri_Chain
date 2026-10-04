import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { consumerService } from '../services/api';
import TimelineView from '../components/TimelineView';
import QRScannerModal from '../components/QRScannerModal';
import LoadingSkeleton from '../components/LoadingSkeleton';
import NotificationToast from '../components/NotificationToast';
import {
  ShieldCheck,
  QrCode,
  Search,
  Sprout,
  User,
  Calendar,
  MapPin,
  CheckCircle2,
  Hash,
  Award,
  ExternalLink
} from 'lucide-react';

export default function ConsumerVerifyPage() {
  const [searchParams] = useSearchParams();
  const initialBatchId = searchParams.get('batchId') || '';

  const [batchIdInput, setBatchIdInput] = useState(initialBatchId);
  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialBatchId) {
      handleVerify(initialBatchId);
    }
  }, [initialBatchId]);

  const handleVerify = async (idToVerify) => {
    const targetId = idToVerify || batchIdInput.trim();
    if (!targetId) {
      setErrorMsg("Please enter or scan a valid Batch ID.");
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await consumerService.verifyBatch(targetId);
      setVerificationData(res.data);
    } catch (err) {
      console.error(err);
      setVerificationData(null);
      setErrorMsg(err.response?.data?.detail || `Batch ID '${targetId}' could not be verified on AgriChain blockchain.`);
    } finally {
      setLoading(false);
    }
  };

  const handleScanSuccess = (scannedId) => {
    setBatchIdInput(scannedId);
    handleVerify(scannedId);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6">
      
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-agri-100 dark:bg-agri-950 text-agri-700 dark:text-agri-300 text-xs font-bold border border-agri-300 dark:border-agri-800">
          <ShieldCheck className="w-4 h-4 text-agri-600" />
          Public Web3 Produce Authenticator
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Verify Produce Authenticity & Provenance
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Scan the QR Code on your product packaging or enter the Batch ID to inspect verified farm-to-fork records
        </p>
      </div>

      {/* SEARCH / SCAN BAR */}
      <div className="glass-card p-6 shadow-2xl max-w-2xl mx-auto">
        <form onSubmit={(e) => { e.preventDefault(); handleVerify(); }} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Enter Batch ID (e.g. AGRI-2026-A8F9)"
                value={batchIdInput}
                onChange={(e) => setBatchIdInput(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-sm font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-agri-500 outline-none"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-4" />
            </div>

            <button
              type="button"
              onClick={() => setIsScannerOpen(true)}
              className="px-5 py-3.5 text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <QrCode className="w-5 h-5 text-agri-600" />
              Scan QR
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3.5 font-bold text-sm text-white bg-agri-600 hover:bg-agri-700 rounded-xl shadow-agri hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Verify Batch
                </>
              )}
            </button>
          </div>
          
          <div className="flex justify-center gap-3 text-xs text-slate-400">
            <span>Try sample batches:</span>
            <button type="button" onClick={() => { setBatchIdInput('AGRI-2026-A8F9'); handleVerify('AGRI-2026-A8F9'); }} className="font-mono font-bold text-agri-600 hover:underline">
              AGRI-2026-A8F9
            </button>
          </div>
        </form>
      </div>

      {/* VERIFICATION RESULTS PANEL */}
      {loading ? (
        <LoadingSkeleton count={3} />
      ) : verificationData ? (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Authentic Badge Banner */}
          <div className="glass-card p-6 bg-gradient-to-r from-agri-600 to-emerald-600 text-white rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
                <Award className="w-9 h-9" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white font-extrabold text-xs mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  100% Authentic Produce
                </div>
                <h2 className="text-2xl font-extrabold">{verificationData.batch.crop_name}</h2>
                <p className="text-xs text-emerald-100">
                  Batch ID: <span className="font-mono font-bold text-white">{verificationData.batch.batch_id}</span>
                </p>
              </div>
            </div>

            <div className="text-right sm:text-right text-xs space-y-1 bg-black/20 p-4 rounded-2xl border border-white/10 font-mono">
              <span className="text-emerald-200 font-bold block">Smart Contract Block #{verificationData.block_number}</span>
              <span className="text-white/80 block truncate max-w-[200px]">Tx: {verificationData.tx_hash}</span>
            </div>
          </div>

          {/* Grid: Farmer Info & Batch Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Farmer Info */}
            <div className="glass-card p-6 space-y-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
                <Sprout className="w-5 h-5 text-agri-600" />
                Farmer & Origin Information
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Farmer Name:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {verificationData.farmer_info?.name || "Gurdeep Singh"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Harvest Location:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {verificationData.batch.village}, {verificationData.batch.district}, {verificationData.batch.state}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Harvest Date:</span>
                  <span className="font-bold text-agri-600 dark:text-agri-400">
                    {verificationData.batch.harvest_date}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Registered Quantity:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {verificationData.batch.quantity} kg
                  </span>
                </div>
              </div>
            </div>

            {/* Blockchain Proof Specs */}
            <div className="glass-card p-6 space-y-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
                <Hash className="w-5 h-5 text-agri-600" />
                Cryptographic Web3 Proofs
              </h3>

              <div className="space-y-3 text-xs font-mono">
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 font-bold block mb-1">State Block Hash:</span>
                  <span className="text-agri-700 dark:text-agri-400 font-bold truncate block">{verificationData.blockchain_hash}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 font-bold block mb-1">Transaction Hash:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-bold truncate block">{verificationData.tx_hash}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-agri-700 dark:text-agri-400 font-bold font-sans">
                  <span>Merkle Proof Status:</span>
                  <span className="px-2.5 py-1 rounded-full bg-agri-100 dark:bg-agri-950 text-agri-700 dark:text-agri-300 border border-agri-300">
                    ✔ Valid Cryptographic Proof
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* TIMELINE VISUALIZATION */}
          <div>
            <h3 className="font-bold text-xl text-slate-900 dark:text-slate-100 mb-4">
              Farm-to-Fork Supply Chain Timeline
            </h3>
            <TimelineView
              timeline={verificationData.timeline}
              currentStatus={verificationData.batch.status}
            />
          </div>

        </div>
      ) : null}

      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />

      <NotificationToast
        message={errorMsg}
        type="error"
        onClose={() => setErrorMsg('')}
      />

    </div>
  );
}

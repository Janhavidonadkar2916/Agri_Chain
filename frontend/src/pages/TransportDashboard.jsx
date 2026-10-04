import React, { useState, useEffect } from 'react';
import { transportService, farmerService } from '../services/api';
import StatCard from '../components/StatCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import QRScannerModal from '../components/QRScannerModal';
import NotificationToast from '../components/NotificationToast';
import { Truck, QrCode, CheckCircle2, MapPin, Play, ShieldCheck, Search } from 'lucide-react';

export default function TransportDashboard() {
  const [activeShipments, setActiveShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedBatch, setScannedBatch] = useState(null);

  // Form Inputs for shipment pickup
  const [startForm, setStartForm] = useState({
    transport_company: 'AgriLogistics Express',
    driver_name: 'Rajesh Kumar',
    vehicle_no: 'PB-10-AB-9876',
    pickup_location: 'Farm Depot, Ludhiana',
    destination: 'Central Cold Storage, Gurgaon'
  });

  const [toastMsg, setToastMsg] = useState({ text: '', type: 'success' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      const res = await transportService.getActiveShipments();
      setActiveShipments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleScanSuccess = async (batchId) => {
    try {
      setLoading(true);
      const res = await farmerService.getBatchDetail(batchId);
      setScannedBatch(res.data);
      setToastMsg({ text: `Batch ID '${batchId}' scanned successfully!`, type: 'success' });
    } catch (err) {
      console.error(err);
      setToastMsg({ text: `Batch ID '${batchId}' not found in registry.`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleStartTransport = async (batchId) => {
    setSubmitting(true);
    try {
      await transportService.startShipment({
        batch_id: batchId,
        ...startForm
      });
      setToastMsg({ text: `Shipment for '${batchId}' started! Blockchain status updated to 'In Transit'.`, type: 'success' });
      setScannedBatch(null);
      fetchShipments();
    } catch (err) {
      console.error(err);
      setToastMsg({ text: err.response?.data?.detail || 'Failed to start transport.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteDelivery = async (batchId) => {
    setSubmitting(true);
    try {
      await transportService.completeShipment({ batch_id: batchId });
      setToastMsg({ text: `Delivery for '${batchId}' marked complete! Ready for warehouse receipt.`, type: 'success' });
      setScannedBatch(null);
      fetchShipments();
    } catch (err) {
      console.error(err);
      setToastMsg({ text: err.response?.data?.detail || 'Failed to complete delivery.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const totalActive = activeShipments.filter(s => s.status === 'In Transit').length;
  const totalCompleted = activeShipments.filter(s => s.status !== 'In Transit' && s.status !== 'Created').length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            Logistics & Transport Control
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Scan crop QR codes to pick up shipments and record real-time transport custody
          </p>
        </div>

        <button
          onClick={() => setIsScannerOpen(true)}
          className="px-5 py-2.5 text-sm font-bold text-white bg-agri-600 hover:bg-agri-700 rounded-xl shadow-agri hover:shadow-lg transition-all flex items-center gap-2 self-start"
        >
          <QrCode className="w-5 h-5" />
          Scan Crop Batch QR Code
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Active In Transit" value={totalActive} icon={Truck} color="amber" subtext="Live on route" />
        <StatCard title="Delivered Shipments" value={totalCompleted} icon={CheckCircle2} color="emerald" subtext="Received at hub" />
        <StatCard title="Total Registered" value={activeShipments.length} icon={ShieldCheck} color="agri" subtext="Tracked on chain" />
      </div>

      {/* SCANNED BATCH ACTION CARD */}
      {scannedBatch && (
        <div className="glass-card p-6 border-2 border-agri-500 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-agri-600" />
              Scanned Batch Details ({scannedBatch.batch_id})
            </h3>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-agri-100 text-agri-700">
              Status: {scannedBatch.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2 text-xs bg-slate-50 dark:bg-slate-900 p-4 rounded-xl">
              <p><strong>Crop Name:</strong> {scannedBatch.crop_name}</p>
              <p><strong>Quantity:</strong> {scannedBatch.quantity} kg</p>
              <p><strong>Harvest Date:</strong> {scannedBatch.harvest_date}</p>
              <p><strong>Farm Origin:</strong> {scannedBatch.village}, {scannedBatch.district}, {scannedBatch.state}</p>
              <p><strong>Current Custodian:</strong> {scannedBatch.current_owner}</p>
            </div>

            {/* Transport Details Form */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Company</label>
                  <input
                    type="text"
                    value={startForm.transport_company}
                    onChange={(e) => setStartForm({ ...startForm, transport_company: e.target.value })}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-agri-500 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Driver</label>
                  <input
                    type="text"
                    value={startForm.driver_name}
                    onChange={(e) => setStartForm({ ...startForm, driver_name: e.target.value })}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-agri-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Vehicle No.</label>
                  <input
                    type="text"
                    value={startForm.vehicle_no}
                    onChange={(e) => setStartForm({ ...startForm, vehicle_no: e.target.value })}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-agri-500 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Destination</label>
                  <input
                    type="text"
                    value={startForm.destination}
                    onChange={(e) => setStartForm({ ...startForm, destination: e.target.value })}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-agri-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                {scannedBatch.status === 'Created' && (
                  <button
                    onClick={() => handleStartTransport(scannedBatch.batch_id)}
                    disabled={submitting}
                    className="w-full sm:flex-1 py-3 px-4 font-bold text-xs text-white bg-agri-600 hover:bg-agri-700 rounded-xl shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-4 h-4" />
                    Start Transport (Set In Transit)
                  </button>
                )}

                {scannedBatch.status === 'In Transit' && (
                  <button
                    onClick={() => handleCompleteDelivery(scannedBatch.batch_id)}
                    disabled={submitting}
                    className="w-full sm:flex-1 py-3 px-4 font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Complete Transport Delivery
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Active Shipments Table */}
      <div className="glass-card p-6">
        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Truck className="w-5 h-5 text-agri-600" />
          Active Transport Queue & Logistical Batches
        </h3>

        {loading ? (
          <LoadingSkeleton type="table" count={4} />
        ) : activeShipments.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            No active transport shipments pending.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-3">Batch ID</th>
                  <th className="py-3 px-3">Crop</th>
                  <th className="py-3 px-3">Quantity</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Origin Farm</th>
                  <th className="py-3 px-3 text-right">Quick Scan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {activeShipments.map((shipment) => (
                  <tr key={shipment.batch_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-bold text-agri-600 dark:text-agri-400">
                      {shipment.batch_id}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      {shipment.crop_name}
                    </td>
                    <td className="py-3.5 px-3 font-medium text-slate-600 dark:text-slate-300">
                      {shipment.quantity} kg
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        shipment.status === 'In Transit'
                          ? 'bg-amber-100 text-amber-700 border border-amber-300'
                          : 'bg-agri-100 text-agri-700 border border-agri-300'
                      }`}>
                        {shipment.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-500">
                      {shipment.village}, {shipment.district}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => handleScanSuccess(shipment.batch_id)}
                        className="px-3 py-1.5 font-bold text-xs text-white bg-agri-600 hover:bg-agri-700 rounded-lg shadow-sm"
                      >
                        Inspect Batch
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />

      <NotificationToast
        message={toastMsg.text}
        type={toastMsg.type}
        onClose={() => setToastMsg({ text: '', type: 'success' })}
      />

    </div>
  );
}

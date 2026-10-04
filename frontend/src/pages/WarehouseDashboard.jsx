import React, { useState, useEffect } from 'react';
import { warehouseService, farmerService } from '../services/api';
import StatCard from '../components/StatCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import QRScannerModal from '../components/QRScannerModal';
import NotificationToast from '../components/NotificationToast';
import { Warehouse, QrCode, PackageCheck, Send, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function WarehouseDashboard() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedBatch, setScannedBatch] = useState(null);

  const [whName, setWhName] = useState('Central Cold Storage Ltd');
  const [rackLocation, setRackLocation] = useState('Rack-A-Row-12');
  const [retailerDestination, setRetailerDestination] = useState('Organic SuperMart');

  const [toastMsg, setToastMsg] = useState({ text: '', type: 'success' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await warehouseService.getInventory();
      setInventory(res.data);
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
      setToastMsg({ text: `Batch ID '${batchId}' retrieved!`, type: 'success' });
    } catch (err) {
      console.error(err);
      setToastMsg({ text: `Batch ID '${batchId}' not found.`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleReceiveWarehouse = async (batchId) => {
    setSubmitting(true);
    try {
      await warehouseService.receiveBatch({
        batch_id: batchId,
        warehouse_name: whName,
        rack_location: rackLocation
      });
      setToastMsg({ text: `Batch '${batchId}' stored at '${rackLocation}'! Blockchain status updated to 'Stored'.`, type: 'success' });
      setScannedBatch(null);
      fetchInventory();
    } catch (err) {
      console.error(err);
      setToastMsg({ text: err.response?.data?.detail || 'Failed to receive into warehouse.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDispatchWarehouse = async (batchId) => {
    setSubmitting(true);
    try {
      await warehouseService.dispatchBatch({
        batch_id: batchId,
        destination_retailer: retailerDestination
      });
      setToastMsg({ text: `Batch '${batchId}' dispatched to retailer '${retailerDestination}'!`, type: 'success' });
      setScannedBatch(null);
      fetchInventory();
    } catch (err) {
      console.error(err);
      setToastMsg({ text: err.response?.data?.detail || 'Failed to dispatch batch.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const totalStored = inventory.filter(b => b.status === 'Stored').length;
  const totalIncoming = inventory.filter(b => b.status === 'In Transit').length;
  const totalOutgoing = inventory.filter(b => b.status === 'Available' || b.status === 'Sold').length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            Warehouse & Cold Storage Hub
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage rack locations, receive incoming harvest, and authorize retailer dispatches
          </p>
        </div>

        <button
          onClick={() => setIsScannerOpen(true)}
          className="px-5 py-2.5 text-sm font-bold text-white bg-agri-600 hover:bg-agri-700 rounded-xl shadow-agri hover:shadow-lg transition-all flex items-center gap-2 self-start"
        >
          <QrCode className="w-5 h-5" />
          Scan QR & Receive Batch
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Warehouse Inventory" value={totalStored} icon={Warehouse} color="agri" subtext="Racks populated" />
        <StatCard title="Incoming Transit" value={totalIncoming} icon={PackageCheck} color="amber" subtext="En route to hub" />
        <StatCard title="Dispatched Retailed" value={totalOutgoing} icon={Send} color="blue" subtext="Sent to supermarkets" />
        <StatCard title="Total Managed" value={inventory.length} icon={ShieldCheck} color="emerald" subtext="Verified on chain" />
      </div>

      {/* SCANNED BATCH WAREHOUSE RECEIVE / DISPATCH PANEL */}
      {scannedBatch && (
        <div className="glass-card p-6 border-2 border-agri-500 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-agri-600" />
              Scanned Warehouse Batch ({scannedBatch.batch_id})
            </h3>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-agri-100 text-agri-700">
              Current Status: {scannedBatch.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 text-xs bg-slate-50 dark:bg-slate-900 p-4 rounded-xl">
              <p><strong>Crop Name:</strong> {scannedBatch.crop_name}</p>
              <p><strong>Quantity:</strong> {scannedBatch.quantity} kg</p>
              <p><strong>Harvest Date:</strong> {scannedBatch.harvest_date}</p>
              <p><strong>Current Custodian:</strong> {scannedBatch.current_owner}</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Warehouse Name</label>
                  <input
                    type="text"
                    value={whName}
                    onChange={(e) => setWhName(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-agri-500 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Assign Storage Rack</label>
                  <input
                    type="text"
                    value={rackLocation}
                    onChange={(e) => setRackLocation(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-agri-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => handleReceiveWarehouse(scannedBatch.batch_id)}
                  disabled={submitting}
                  className="w-full sm:flex-1 py-3 px-4 font-bold text-xs text-white bg-agri-600 hover:bg-agri-700 rounded-xl shadow-md flex items-center justify-center gap-1.5"
                >
                  <PackageCheck className="w-4 h-4" />
                  Receive & Store in Warehouse
                </button>

                <button
                  onClick={() => handleDispatchWarehouse(scannedBatch.batch_id)}
                  disabled={submitting}
                  className="w-full sm:flex-1 py-3 px-4 font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md flex items-center justify-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  Dispatch to Retailer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="glass-card p-6">
        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Warehouse className="w-5 h-5 text-agri-600" />
          Warehouse Rack Inventory Table
        </h3>

        {loading ? (
          <LoadingSkeleton type="table" count={4} />
        ) : inventory.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            No warehouse inventory items available.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-3">Batch ID</th>
                  <th className="py-3 px-3">Crop Name</th>
                  <th className="py-3 px-3">Quantity</th>
                  <th className="py-3 px-3">Storage Rack</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {inventory.map((item) => (
                  <tr key={item.batch_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-bold text-agri-600 dark:text-agri-400">
                      {item.batch_id}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      {item.crop_name}
                    </td>
                    <td className="py-3.5 px-3 font-medium text-slate-600 dark:text-slate-300">
                      {item.quantity} kg
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-600 dark:text-slate-300">
                      {item.current_owner || 'Warehouse Vault'}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-agri-100 text-agri-700 border border-agri-300">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => handleScanSuccess(item.batch_id)}
                        className="px-3 py-1.5 font-bold text-xs text-white bg-agri-600 hover:bg-agri-700 rounded-lg shadow-sm"
                      >
                        Inspect
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

import React, { useState, useEffect } from 'react';
import { retailerService, farmerService } from '../services/api';
import StatCard from '../components/StatCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import QRScannerModal from '../components/QRScannerModal';
import NotificationToast from '../components/NotificationToast';
import { ShoppingBag, QrCode, DollarSign, Tag, CheckCircle2, ShieldCheck, ShoppingCart } from 'lucide-react';

export default function RetailerDashboard() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedBatch, setScannedBatch] = useState(null);

  const [storeName, setStoreName] = useState('Organic SuperMart');
  const [pricePerKg, setPricePerKg] = useState(65.0);

  const [toastMsg, setToastMsg] = useState({ text: '', type: 'success' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await retailerService.getInventory();
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
      setToastMsg({ text: `Batch ID '${batchId}' loaded into retail inspector!`, type: 'success' });
    } catch (err) {
      console.error(err);
      setToastMsg({ text: `Batch ID '${batchId}' not found.`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleReceiveRetailer = async (batchId) => {
    setSubmitting(true);
    try {
      await retailerService.receiveProduct({
        batch_id: batchId,
        store_name: storeName,
        price: parseFloat(pricePerKg) || 50.0
      });
      setToastMsg({ text: `Product '${batchId}' now AVAILABLE in store @ ₹${pricePerKg}/kg!`, type: 'success' });
      setScannedBatch(null);
      fetchInventory();
    } catch (err) {
      console.error(err);
      setToastMsg({ text: err.response?.data?.detail || 'Failed to receive product.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSellProduct = async (batchId) => {
    setSubmitting(true);
    try {
      await retailerService.sellProduct({ batch_id: batchId });
      setToastMsg({ text: `Product '${batchId}' marked SOLD to end consumer! Blockchain status updated.`, type: 'success' });
      setScannedBatch(null);
      fetchInventory();
    } catch (err) {
      console.error(err);
      setToastMsg({ text: err.response?.data?.detail || 'Failed to complete sale.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const totalAvailable = inventory.filter(b => b.status === 'Available').length;
  const totalSold = inventory.filter(b => b.status === 'Sold').length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            Supermarket & Retailer Hub
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Set consumer pricing, manage retail stock, and record point-of-sale customer transactions
          </p>
        </div>

        <button
          onClick={() => setIsScannerOpen(true)}
          className="px-5 py-2.5 text-sm font-bold text-white bg-agri-600 hover:bg-agri-700 rounded-xl shadow-agri hover:shadow-lg transition-all flex items-center gap-2 self-start"
        >
          <QrCode className="w-5 h-5" />
          Scan QR & Receive Stock
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Available on Shelves" value={totalAvailable} icon={ShoppingBag} color="agri" subtext="Ready for sale" />
        <StatCard title="Total Sold to Consumers" value={totalSold} icon={ShoppingCart} color="emerald" subtext="Final stage reached" />
        <StatCard title="Retail Batches" value={inventory.length} icon={Tag} color="blue" subtext="Tracked on chain" />
      </div>

      {/* SCANNED BATCH RETAILER PRICING / SALE PANEL */}
      {scannedBatch && (
        <div className="glass-card p-6 border-2 border-agri-500 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-agri-600" />
              Scanned Retail Produce ({scannedBatch.batch_id})
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
              <p><strong>Farm Origin:</strong> {scannedBatch.village}, {scannedBatch.district}</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Store Name</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-agri-500 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Retail Price (₹/kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={pricePerKg}
                    onChange={(e) => setPricePerKg(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-agri-600 dark:text-agri-400 font-bold text-xs focus:ring-2 focus:ring-agri-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => handleReceiveRetailer(scannedBatch.batch_id)}
                  disabled={submitting}
                  className="w-full sm:flex-1 py-3 px-4 font-bold text-xs text-white bg-agri-600 hover:bg-agri-700 rounded-xl shadow-md flex items-center justify-center gap-1.5"
                >
                  <Tag className="w-4 h-4" />
                  Make Available in Store
                </button>

                <button
                  onClick={() => handleSellProduct(scannedBatch.batch_id)}
                  disabled={submitting}
                  className="w-full sm:flex-1 py-3 px-4 font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md flex items-center justify-center gap-1.5"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Sell to Consumer (Point of Sale)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Retail Inventory Table */}
      <div className="glass-card p-6">
        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-agri-600" />
          Retail Store Inventory & Pricing Table
        </h3>

        {loading ? (
          <LoadingSkeleton type="table" count={4} />
        ) : inventory.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            No retail store inventory available.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-3">Batch ID</th>
                  <th className="py-3 px-3">Crop Name</th>
                  <th className="py-3 px-3">Quantity</th>
                  <th className="py-3 px-3">Retail Price</th>
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
                    <td className="py-3.5 px-3 font-bold text-agri-700 dark:text-agri-300">
                      {item.price ? `₹${item.price.toFixed(2)} / kg` : '₹65.00 / kg'}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        item.status === 'Sold'
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                          : 'bg-agri-100 text-agri-700 border border-agri-300'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => handleScanSuccess(item.batch_id)}
                        className="px-3 py-1.5 font-bold text-xs text-white bg-agri-600 hover:bg-agri-700 rounded-lg shadow-sm"
                      >
                        Manage Price & Sale
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

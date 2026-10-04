import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { farmerService } from '../services/api';
import QRCodeDisplay from '../components/QRCodeDisplay';
import NotificationToast from '../components/NotificationToast';
import { Sprout, Upload, CheckCircle2, ArrowLeft, ShieldCheck, QrCode } from 'lucide-react';

export default function AddBatchPage() {
  const [formData, setFormData] = useState({
    crop_name: '',
    quantity: '',
    harvest_date: new Date().toISOString().split('T')[0],
    village: '',
    district: '',
    state: '',
    description: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdBatch, setCreatedBatch] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      if (imageFile) {
        data.append('image', imageFile);
      }

      const res = await farmerService.addBatch(data);
      setCreatedBatch(res.data);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Failed to register crop batch. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/farmer/dashboard')}
            className="text-xs font-bold text-slate-500 hover:text-agri-600 flex items-center gap-1 mb-1 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Farmer Dashboard
          </button>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            Register New Agricultural Crop Batch
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Generate an immutable Web3 Smart Contract block and QR Code for your harvest
          </p>
        </div>
      </div>

      {createdBatch ? (
        /* SUCCESS RESULT STATE WITH QR CODE DISPLAY */
        <div className="glass-card p-8 text-center space-y-6 border-2 border-agri-500">
          <div className="w-16 h-16 rounded-full bg-agri-100 dark:bg-agri-950 text-agri-600 dark:text-agri-400 mx-auto flex items-center justify-center shadow-agri animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              Crop Batch Successfully Registered on Blockchain!
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Smart contract block #{createdBatch.block_number} mined & verified
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center text-left">
            <div className="space-y-3 bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase">Crop Title</span>
                <p className="font-extrabold text-lg text-slate-900 dark:text-slate-100">{createdBatch.crop_name}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400">Quantity:</span>
                  <p className="font-bold text-slate-700 dark:text-slate-200">{createdBatch.quantity} kg</p>
                </div>
                <div>
                  <span className="text-slate-400">Harvest Date:</span>
                  <p className="font-bold text-slate-700 dark:text-slate-200">{createdBatch.harvest_date}</p>
                </div>
              </div>
              <div className="text-xs">
                <span className="text-slate-400">Origin Farm:</span>
                <p className="font-bold text-slate-700 dark:text-slate-200">{createdBatch.village}, {createdBatch.district}, {createdBatch.state}</p>
              </div>
              <div className="text-[11px] font-mono bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                <span className="text-agri-600 dark:text-agri-400 font-bold block mb-0.5">Blockchain Tx Hash:</span>
                <span className="truncate block text-slate-500">{createdBatch.tx_hash}</span>
              </div>
            </div>

            {/* Generated QR Code Component */}
            <QRCodeDisplay
              batchId={createdBatch.batch_id}
              cropName={createdBatch.crop_name}
              harvestDate={createdBatch.harvest_date}
            />
          </div>

          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setCreatedBatch(null)}
              className="px-6 py-2.5 font-bold text-xs text-agri-700 dark:text-agri-300 bg-agri-50 dark:bg-agri-950 border border-agri-300 dark:border-agri-700 rounded-xl"
            >
              Add Another Batch
            </button>
            <button
              onClick={() => navigate('/farmer/my-batches')}
              className="px-6 py-2.5 font-bold text-xs text-white bg-agri-600 hover:bg-agri-700 rounded-xl shadow-md"
            >
              Go to My Batches Table
            </button>
          </div>
        </div>
      ) : (
        /* BATCH CREATION FORM */
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Crop Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Crop Name / Variety *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Wheat (Sonalika HD-2967)"
                  value={formData.crop_name}
                  onChange={(e) => setFormData({ ...formData, crop_name: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-agri-500 outline-none"
                />
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Quantity (in Kilograms / Quintals) *
                </label>
                <input
                  type="number"
                  required
                  step="0.1"
                  placeholder="e.g. 500"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-agri-500 outline-none"
                />
              </div>
            </div>

            {/* Grid 2: Harvest Date & Village */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Harvest Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.harvest_date}
                  onChange={(e) => setFormData({ ...formData, harvest_date: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-agri-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Village / Farm Area *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mullanpur"
                  value={formData.village}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-agri-500 outline-none"
                />
              </div>
            </div>

            {/* Grid 3: District & State */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  District *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ludhiana"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-agri-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Punjab"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-agri-500 outline-none"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Crop Description & Organic Certifications
              </label>
              <textarea
                rows="3"
                placeholder="Describe farming techniques, soil quality, or organic certifications..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-agri-500 outline-none resize-none"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Upload Crop Photo
              </label>
              <div className="flex items-center gap-4">
                <label className="flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-agri-500 cursor-pointer bg-slate-50 dark:bg-slate-900/60 transition-colors">
                  <Upload className="w-5 h-5 text-agri-600" />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    {imageFile ? imageFile.name : 'Click to upload image'}
                  </span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>

                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-xl border-2 border-agri-500" />
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 font-bold text-sm text-white bg-agri-600 hover:bg-agri-700 rounded-xl shadow-agri hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  Submit & Generate Blockchain QR Code
                </>
              )}
            </button>

          </form>
        </div>
      )}

      <NotificationToast message={errorMsg} type="error" onClose={() => setErrorMsg('')} />
    </div>
  );
}

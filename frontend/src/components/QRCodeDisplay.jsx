import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Printer, QrCode, ShieldCheck } from 'lucide-react';

export default function QRCodeDisplay({ batchId, cropName, harvestDate, size = 180 }) {
  const qrRef = useRef(null);
  const verifyUrl = `${window.location.origin}/verify?batchId=${encodeURIComponent(batchId)}`;

  const handleDownload = () => {
    const svgElement = qrRef.current.querySelector('svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = size + 40;
      canvas.height = size + 40;
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);

        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngFile;
        downloadLink.download = `AgriChain_QR_${batchId}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Batch QR Code - ${batchId}</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 40px; }
            .badge { border: 2px solid #16A34A; padding: 20px; border-radius: 16px; display: inline-block; }
            h2 { color: #16A34A; margin-bottom: 5px; }
            p { margin: 4px 0; color: #475569; }
            .batch { font-family: monospace; font-weight: bold; background: #F1F5F9; padding: 6px 12px; border-radius: 6px; }
          </style>
        </head>
        <body>
          <div class="badge">
            <h2>🌱 AgriChain Product Verification</h2>
            <p><strong>Crop:</strong> ${cropName || 'Agricultural Batch'}</p>
            <p><strong>Harvest Date:</strong> ${harvestDate || 'N/A'}</p>
            <div style="margin: 20px 0;">${qrRef.current ? qrRef.current.innerHTML : ''}</div>
            <p class="batch">Batch ID: ${batchId}</p>
            <p style="font-size: 12px; color: #94A3B8;">Scan QR Code to verify complete supply chain provenance</p>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex flex-col items-center p-5 glass-card text-center">
      <div className="flex items-center gap-1.5 text-xs font-bold text-agri-600 dark:text-agri-400 bg-agri-50 dark:bg-agri-950/60 px-3 py-1 rounded-full border border-agri-200 dark:border-agri-800 mb-3">
        <ShieldCheck className="w-4 h-4" />
        Cryptographic QR Badge
      </div>

      <div ref={qrRef} className="p-4 bg-white rounded-2xl border-2 border-agri-500 shadow-soft mb-3">
        <QRCodeSVG
          value={verifyUrl}
          size={size}
          level="H"
          includeMargin={false}
          imageSettings={{
            src: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌱</text></svg>",
            x: undefined,
            y: undefined,
            height: 32,
            width: 32,
            excavate: true,
          }}
        />
      </div>

      <div className="font-mono text-sm font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-700/60 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-600 mb-3">
        {batchId}
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mb-4">
        Contains full provenance metadata & blockchain transaction links.
      </p>

      <div className="flex items-center gap-2 w-full max-w-xs">
        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-agri-700 dark:text-agri-300 bg-agri-50 hover:bg-agri-100 dark:bg-agri-950 dark:hover:bg-agri-900 border border-agri-300 dark:border-agri-700 rounded-xl transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Download
        </button>
        <button
          onClick={handlePrint}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-white bg-agri-600 hover:bg-agri-700 rounded-xl shadow-md transition-all"
        >
          <Printer className="w-3.5 h-3.5" />
          Print QR
        </button>
      </div>
    </div>
  );
}

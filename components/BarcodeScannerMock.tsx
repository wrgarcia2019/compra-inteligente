
import React, { useState } from 'react';
import { BUTTON_SECONDARY_CLASS, INPUT_CLASS } from '../constants';
import { CameraIcon, QrCodeIcon } from './Icons';

interface BarcodeScannerMockProps {
  onBarcodeScanned: (barcode: string) => void;
}

const BarcodeScannerMock = ({ onBarcodeScanned }: BarcodeScannerMockProps) => {
  const [manualBarcode, setManualBarcode] = useState('');
  const [isScanning, setIsScanning] = useState(false); // Mock state

  const handleScanClick = () => {
    // In a real app, you'd activate the camera here.
    // For this mock, we'll simulate a few outcomes.
    setIsScanning(true);
    const mockBarcodes = ["1234567890123", "9876543210987", "1122334455667"];
    const randomBarcode = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)];
    
    // Simulate a delay for scanning
    setTimeout(() => {
      // FIX: Removed extraneous backslash before the template literal's opening backtick and ensured correct interpolation.
      const confirmScan = window.confirm(`Simular leitura do código de barras: ${randomBarcode}? \nOu cancele para inserir manualmente.`);
      if (confirmScan) {
        onBarcodeScanned(randomBarcode);
      }
      setIsScanning(false);
    }, 500);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      onBarcodeScanned(manualBarcode.trim());
      setManualBarcode('');
    }
  };

  return (
    <div className="my-4 p-4 border border-slate-700 rounded-lg bg-slate-800">
      <h3 className="text-lg font-semibold text-slate-200 mb-3 flex items-center">
        <QrCodeIcon className="w-5 h-5 mr-2 text-sky-400" />
        Leitor de Código de Barras (Simulado)
      </h3>
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <button
          type="button"
          onClick={handleScanClick}
          disabled={isScanning}
          // Changed className to use string concatenation to avoid parsing issues. This approach is robust.
          className={BUTTON_SECONDARY_CLASS + " flex items-center justify-center grow sm:grow-0" + (isScanning ? ' opacity-50 cursor-not-allowed' : '')}
        >
          <CameraIcon className="w-5 h-5 mr-2" />
          {isScanning ? 'Escaneando...' : 'Escanear Código'}
        </button>
        <span className="text-slate-400 hidden sm:inline">OU</span>
        <form onSubmit={handleManualSubmit} className="flex-grow flex gap-2">
          <input
            type="text"
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
            placeholder="Digitar código manualmente"
            // Changed className to use string concatenation. This approach is robust.
            className={INPUT_CLASS + " flex-grow"}
          />
          <button type="submit" className={BUTTON_SECONDARY_CLASS}>
            Adicionar
          </button>
        </form>
      </div>
      <p className="text-xs text-slate-500 mt-2">
        Funcionalidade de câmera real requer integração com biblioteca de scanner e permissões.
      </p>
    </div>
  );
};

export default BarcodeScannerMock;
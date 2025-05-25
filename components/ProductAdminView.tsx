
import React, { useState } from 'react';
import { useShoppingContext } from '../contexts/ShoppingDataContext';
import { INPUT_CLASS, BUTTON_PRIMARY_CLASS, BUTTON_SECONDARY_CLASS, CARD_CLASS, PRIMARY_COLOR } from '../constants';
import { ClipboardListIcon, ArrowLeftCircleIcon } from './Icons';

interface ProductAdminViewProps {
  onBackToMarketSetup: () => void;
}

const ProductAdminView = ({ onBackToMarketSetup }: ProductAdminViewProps) => {
  const { products, addProduct } = useShoppingContext();
  const [barcode, setBarcode] = useState('');
  const [productName, setProductName] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) {
      setFeedbackMessage({ type: 'error', text: 'O nome do produto é obrigatório.' });
      return;
    }
    const trimmedBarcode = barcode.trim() || undefined; 

    try {
      const newOrExistingProduct = addProduct(productName.trim(), trimmedBarcode);
      setFeedbackMessage({ type: 'success', text: `Produto "${newOrExistingProduct.name}" ${trimmedBarcode ? 'com código ' + trimmedBarcode : ''} salvo/atualizado com sucesso!` });
      setBarcode('');
      setProductName('');
    } catch (error) {
      console.error("Erro ao adicionar produto:", error);
      setFeedbackMessage({ type: 'error', text: 'Erro ao salvar o produto.' });
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className={`${CARD_CLASS} p-6 w-full max-w-2xl mx-auto`}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <ClipboardListIcon className={`w-8 h-8 text-${PRIMARY_COLOR}-500 mr-3`} />
            <h2 className="text-2xl font-semibold text-white">Administrar Produtos</h2>
          </div>
          <button 
            onClick={onBackToMarketSetup} 
            className={`${BUTTON_SECONDARY_CLASS} text-sm flex items-center`}
          >
            <ArrowLeftCircleIcon className="w-5 h-5 mr-2"/>
            Voltar
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <div>
            <label htmlFor="barcodeAdmin" className="block mb-1 text-sm font-medium text-slate-300">
              Código de Barras (Opcional)
            </label>
            <input
              type="text"
              id="barcodeAdmin"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              className={INPUT_CLASS}
              placeholder="Digite ou escaneie o código de barras"
            />
          </div>
          <div>
            <label htmlFor="productNameAdmin" className="block mb-1 text-sm font-medium text-slate-300">
              Nome do Produto (Obrigatório)
            </label>
            <input
              type="text"
              id="productNameAdmin"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className={INPUT_CLASS}
              placeholder="Ex: Leite Integral UHT Caixa 1L"
              required
            />
          </div>
          <button type="submit" className={`${BUTTON_PRIMARY_CLASS} w-full`}>
            Adicionar/Atualizar Produto
          </button>
          {feedbackMessage && (
            <p className={"mt-3 text-sm " + (feedbackMessage.type === 'success' ? 'text-green-400' : 'text-red-400')}>
              {feedbackMessage.text}
            </p>
          )}
        </form>

        <div>
          <h3 className="text-xl font-semibold text-slate-100 mb-3">Produtos Cadastrados ({products.length})</h3>
          {products.length === 0 ? (
            <p className="text-slate-400">Nenhum produto cadastrado ainda.</p>
          ) : (
            <ul className="max-h-96 overflow-y-auto bg-slate-700 p-3 rounded-md space-y-2">
              {products.map(p => (
                <li key={p.id} className="text-sm text-slate-300 p-2 bg-slate-600 rounded">
                  <strong>{p.name}</strong>
                  <br />
                  <span className="text-xs text-sky-400">ID/Código: {p.id}</span>
                  {p.id !== p.barcode && p.barcode && <span className="text-xs text-sky-400 ml-2">Barcode Registrado: {p.barcode}</span> }
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductAdminView;

import React, { useState, useCallback, useEffect } from 'react';
import { Market, Product, StagingItem, ProductPriceInfo } from '../types';
import { useShoppingContext } from '../contexts/ShoppingDataContext';
import BarcodeScannerMock from './BarcodeScannerMock';
import PriceGraph from './PriceGraph';
import { INPUT_CLASS, BUTTON_PRIMARY_CLASS, BUTTON_SECONDARY_CLASS, CARD_CLASS, PRIMARY_COLOR } from '../constants';
import { PlusCircleIcon, MinusCircleIcon, TrashIcon, ArrowRightCircleIcon } from './Icons';

interface ProductManagementViewProps {
  currentMarket: Market;
  budget: number;
  pendingItems: StagingItem[];
  setPendingItems: React.Dispatch<React.SetStateAction<StagingItem[]>>;
  onMoveToCart: (item: StagingItem) => void;
  onMoveAllToCart: () => void;
  marketNameDisplay: string;
}

const ProductManagementView = ({
  currentMarket,
  budget,
  pendingItems,
  setPendingItems,
  onMoveToCart,
  onMoveAllToCart,
  marketNameDisplay
}: ProductManagementViewProps) => {
  const { getProductByBarcodeOrId, addProduct, getProductPriceInfo } = useShoppingContext();

  const [productIdentifier, setProductIdentifier] = useState('');
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState<number | string>(1);
  const [unitPrice, setUnitPrice] = useState<number | string>('');
  const [currentProductInfo, setCurrentProductInfo] = useState<Product | null>(null);
  const [priceDetailsForForm, setPriceDetailsForForm] = useState<ProductPriceInfo | null>(null);
  // No longer need pendingItemsPriceDetailsMap as getProductPriceInfo is sync

  const resetForm = useCallback(() => {
    setProductIdentifier('');
    setProductName('');
    setQuantity(1);
    setUnitPrice('');
    setCurrentProductInfo(null);
    setPriceDetailsForForm(null);
  }, []);
  
  const fetchProductDetails = useCallback((identifierToSearch: string) => {
    const trimmedIdentifier = identifierToSearch.trim();
    if (!trimmedIdentifier) {
        setCurrentProductInfo(null);
        setPriceDetailsForForm(null);
        setProductName(''); 
        return;
    }

    const product = getProductByBarcodeOrId(trimmedIdentifier);
    setCurrentProductInfo(product || null);

    if (product) {
      setProductName(product.name);
      const priceInfo = getProductPriceInfo(product.id, currentMarket.id);
      setPriceDetailsForForm(priceInfo);
    } else {
      setProductName(trimmedIdentifier); 
      const potentialCanonicalIdForName = trimmedIdentifier.toLowerCase();
      const priceInfo = getProductPriceInfo(potentialCanonicalIdForName, currentMarket.id);
      setPriceDetailsForForm(priceInfo);
    }
  }, [getProductByBarcodeOrId, getProductPriceInfo, currentMarket.id, setProductName, setCurrentProductInfo, setPriceDetailsForForm]);


  const handleBarcodeScanned = useCallback((barcode: string) => {
    setProductIdentifier(barcode);
    fetchProductDetails(barcode);
  }, [fetchProductDetails]);

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const nameFromInput = productName.trim();
    const currentUnitPrice = Number(unitPrice);
    const currentQuantity = Number(quantity);

    if (!nameFromInput || !currentUnitPrice || currentQuantity <= 0 || currentUnitPrice <= 0) {
      alert('Preencha nome do produto, quantidade e preço válidos.');
      return;
    }
    
    const barcodeFromIdentifierField = productIdentifier.trim() || undefined;
    const productToAdd = addProduct(nameFromInput, barcodeFromIdentifierField);
    
    const newItem: StagingItem = {
      productId: productToAdd.id,       
      productName: productToAdd.name,   
      quantity: currentQuantity,
      unitPrice: currentUnitPrice,
    };

    setPendingItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.productId === newItem.productId);
      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += newItem.quantity;
        updatedItems[existingItemIndex].unitPrice = newItem.unitPrice; 
        return updatedItems;
      }
      return [...prevItems, newItem];
    });
    
    // No need to call recordPrice here, it will be called on finalizePurchase
    resetForm();
  };
  
  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setPendingItems(prev => prev.filter(item => item.productId !== productId));
    } else {
      setPendingItems(prev => prev.map(item => item.productId === productId ? { ...item, quantity: newQuantity } : item));
    }
  };

  const handlePendingItemPriceChange = (productId: string, newPriceString: string) => {
    setPendingItems(prevItems =>
        prevItems.map(item => {
            if (item.productId === productId) {
                if (newPriceString === "") {
                    return { ...item, unitPrice: 0 }; 
                }
                const newPrice = parseFloat(newPriceString);
                if (!isNaN(newPrice) && newPrice >= 0) {
                    return { ...item, unitPrice: newPrice };
                }
            }
            return item;
        })
    );
  };

  const handlePendingItemPriceBlur = (productId: string) => {
      setPendingItems(prevItems =>
          prevItems.map(item => {
              if (item.productId === productId) {
                  if (item.unitPrice <= 0) { 
                      return { ...item, unitPrice: 0.01 }; 
                  }
              }
              return item;
          })
      );
  };

  const removeItem = (productId: string) => {
    setPendingItems(prev => prev.filter(item => item.productId !== productId));
  };

  const totalPendingValue = pendingItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const isOverBudgetPending = totalPendingValue > budget;

  let graphDataPending;
  if (!isOverBudgetPending) {
      graphDataPending = [
          { name: 'Itens Pendentes', value: totalPendingValue, fill: '#f87171' }, 
          { name: 'Saldo Orçamento', value: Math.max(0, budget - totalPendingValue), fill: '#34d399' } 
      ];
  } else {
      graphDataPending = [
          { name: 'Orçamento (Coberto)', value: budget, fill: '#34d399' },
          { name: 'Valor Excedente', value: totalPendingValue - budget, fill: '#f87171' }
      ];
  }
  const pendingGraphTitle = `Pendentes (R$${totalPendingValue.toFixed(2)}) vs Orçamento (R$${budget.toFixed(2)})`;

  const formatDisplayDate = (isoDate: string | null): string => {
    if (!isoDate) return '';
    try {
      const date = new Date(isoDate);
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) {
      return 'Data inválida';
    }
  };

  const renderPriceInfo = (priceInfo: ProductPriceInfo | null, market: Market) => {
    if (!priceInfo) return null;

    const { lastPriceInCurrentMarket, lastPriceDateInCurrentMarket, cheapestPriceOverall } = priceInfo;
    const messageNoHistory = "Sem histórico de preços para este item.";
    
    const hasLastPriceInCurrentMarket = lastPriceInCurrentMarket !== null;
    
    let showCheapestFromOtherMarket = false;
    let cheapestPriceText = '';

    if (cheapestPriceOverall && cheapestPriceOverall.marketName.toLowerCase() !== market.name.toLowerCase()) {
        if (hasLastPriceInCurrentMarket) {
            if (cheapestPriceOverall.price < lastPriceInCurrentMarket!) {
                showCheapestFromOtherMarket = true;
            }
        } else { 
            showCheapestFromOtherMarket = true;
        }
    }

    if (showCheapestFromOtherMarket && cheapestPriceOverall) {
         cheapestPriceText = `Menor preço: R$ ${cheapestPriceOverall.price.toFixed(2)} (em ${cheapestPriceOverall.marketName})`;
    }

    if (!hasLastPriceInCurrentMarket && !showCheapestFromOtherMarket) {
        return <p className="text-xs text-slate-400 mt-1">{messageNoHistory}</p>;
    }

    return (
        <div className="text-xs mt-1 space-y-0.5">
            {hasLastPriceInCurrentMarket && (
                <p className="text-sky-300">
                    Últ. preço em {market.name}: R$ {lastPriceInCurrentMarket!.toFixed(2)} 
                    {lastPriceDateInCurrentMarket && ` (em ${formatDisplayDate(lastPriceDateInCurrentMarket)})`}
                </p>
            )}
            {showCheapestFromOtherMarket && cheapestPriceText && (
                <p className="text-amber-400">{cheapestPriceText}</p>
            )}
        </div>
    );
  };

  // Removed useEffect for fetchAllPendingPriceInfo, getProductPriceInfo is now sync

  const updatePriceInfoForProductName = useCallback((name: string) => {
    const trimmedName = name.trim();
    if (trimmedName) {
        const potentialCanonicalIdForName = trimmedName.toLowerCase();
        const priceInfo = getProductPriceInfo(potentialCanonicalIdForName, currentMarket.id);
        setPriceDetailsForForm(priceInfo);
    } else {
        setPriceDetailsForForm(null);
    }
  }, [getProductPriceInfo, currentMarket.id, setPriceDetailsForForm]);


  return (
    <div className="p-4 space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-semibold text-white">Adicionar Produtos</h2>
        <p className={`text-lg text-${PRIMARY_COLOR}-400`}>Comprando em: {marketNameDisplay}</p>
      </div>
      
      <BarcodeScannerMock onBarcodeScanned={handleBarcodeScanned} />
      
      <form onSubmit={handleAddProduct} className={`${CARD_CLASS} p-6 space-y-4`}>
        <h3 className="text-xl font-semibold text-white mb-2">Novo Item</h3>
        
        <div>
            <label htmlFor="productIdentifier" className="block mb-1 text-sm font-medium text-slate-300">
            Código de Barras / ID do Produto (Opcional)
            </label>
            <input
            type="text"
            id="productIdentifier"
            value={productIdentifier}
            onChange={(e) => {
                const newIdentifier = e.target.value;
                setProductIdentifier(newIdentifier);
                if(!newIdentifier.trim()){ 
                    setCurrentProductInfo(null);
                    setPriceDetailsForForm(null);
                    if(currentProductInfo && productName === currentProductInfo.name && (currentProductInfo.id === (currentProductInfo.barcode || '') || currentProductInfo.id === currentProductInfo.name.toLowerCase() )) {
                       setProductName('');
                    }
                }
            }}
            onBlur={() => {
                const trimmedId = productIdentifier.trim();
                if (trimmedId) {
                   fetchProductDetails(trimmedId);
                } else { 
                    setCurrentProductInfo(null);
                    setPriceDetailsForForm(null);
                }
            }}
            className={INPUT_CLASS}
            placeholder="Escaneie ou digite o código/ID"
            />
        </div>

        <div>
            <label htmlFor="productName" className="block mb-1 text-sm font-medium text-slate-300">
            Nome do Produto (Obrigatório)
            </label>
            <input
            type="text"
            id="productName"
            value={productName} 
            onChange={(e) => {
                const newName = e.target.value;
                setProductName(newName);
                if (productIdentifier.trim() === '') { 
                     if (currentProductInfo && newName !== currentProductInfo.name) { 
                        setCurrentProductInfo(null); 
                        updatePriceInfoForProductName(newName);
                     } else if (!currentProductInfo && newName.trim()) { 
                        updatePriceInfoForProductName(newName);
                     } else if (!newName.trim()) {
                        setPriceDetailsForForm(null); 
                     }
                }
            }}
            className={INPUT_CLASS}
            placeholder="Ex: Leite Integral 1L"
            required
            readOnly={!!currentProductInfo && !!productIdentifier.trim() && productName === currentProductInfo.name && currentProductInfo.id === productIdentifier.trim()}
            />
        </div>

        <div className="bg-slate-700 p-2 rounded min-h-[40px]">
            {renderPriceInfo(priceDetailsForForm, currentMarket)}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="quantity" className="block mb-1 text-sm font-medium text-slate-300">Quantidade</label>
            <input type="number" id="quantity" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value,10)))} className={INPUT_CLASS} min="1" required />
          </div>
          <div>
            <label htmlFor="unitPrice" className="block mb-1 text-sm font-medium text-slate-300">Preço Unitário (R$)</label>
            <input type="number" id="unitPrice" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} className={INPUT_CLASS} placeholder="Ex: 5.99" step="0.01" min="0.01" required />
          </div>
        </div>
        <button type="submit" className={`${BUTTON_PRIMARY_CLASS} w-full md:w-auto`}>
          Adicionar à Lista
        </button>
        { (currentProductInfo || productName || productIdentifier || unitPrice || quantity !== 1 ) && 
            <button type="button" onClick={resetForm} className={`${BUTTON_SECONDARY_CLASS} w-full md:w-auto mt-2 md:mt-0 md:ml-2`}>
                Limpar Formulário
            </button>
        }
      </form>

      {pendingItems.length > 0 && (
        <div className={`${CARD_CLASS} p-6 mt-6`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-white">Lista de Pendentes</h3>
            <button onClick={onMoveAllToCart} className={`${BUTTON_PRIMARY_CLASS} text-sm flex items-center`}>
              Mover Tudo Para Carrinho <ArrowRightCircleIcon className="w-4 h-4 ml-2" />
            </button>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {pendingItems.map(item => {
              const priceInfo = getProductPriceInfo(item.productId, currentMarket.id);
              return (
                <div key={item.productId} className={`bg-slate-700 p-3 rounded-md shadow flex flex-col sm:flex-row justify-between items-start sm:items-center transition-all duration-300 hover:bg-slate-600`}>
                  <div className="flex-grow mb-2 sm:mb-0">
                    <p className="font-medium text-slate-100">{item.productName}</p>
                    <div className="flex items-center my-1">
                        <span className="text-sm text-slate-400 mr-1">R$</span>
                        <input
                            type="number"
                            value={item.unitPrice <= 0 ? '' : item.unitPrice} 
                            onChange={(e) => handlePendingItemPriceChange(item.productId, e.target.value)}
                            onBlur={() => handlePendingItemPriceBlur(item.productId)}
                            className={`${INPUT_CLASS} !py-1 !px-2 !text-sm w-24 !inline-block !mr-2`}
                            min="0.01"
                            step="0.01"
                            placeholder="0.00"
                            aria-label={`Preço unitário de ${item.productName}`}
                        />
                        <span className="text-sm text-slate-400">x {item.quantity} = R$ {(item.unitPrice * item.quantity).toFixed(2)}</span>
                    </div>
                    <div className="border-t border-slate-600 pt-1 mt-1 min-h-[30px]">
                        {renderPriceInfo(priceInfo, currentMarket)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 self-center sm:self-auto mt-2 sm:mt-0">
                    <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className={`p-1 text-slate-400 hover:text-${PRIMARY_COLOR}-400 rounded-full`}>
                      <MinusCircleIcon className="w-6 h-6" />
                    </button>
                    <span className="text-slate-200 w-6 text-center" aria-live="polite">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className={`p-1 text-slate-400 hover:text-${PRIMARY_COLOR}-400 rounded-full`}>
                      <PlusCircleIcon className="w-6 h-6" />
                    </button>
                    <button onClick={() => onMoveToCart(item)} className={`p-1 text-green-400 hover:text-green-300 rounded-full`} title="Mover para Carrinho">
                      <ArrowRightCircleIcon className="w-6 h-6" />
                    </button>
                    <button onClick={() => removeItem(item.productId)} className={`p-1 text-red-400 hover:text-red-300 rounded-full`} title="Remover da Lista">
                      <TrashIcon className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6">
            <PriceGraph data={graphDataPending} title={pendingGraphTitle} isOverBudget={isOverBudgetPending} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagementView;
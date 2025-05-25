
import React, { useState, useEffect } from 'react';
import { Market } from '../types';
import { useShoppingContext } from '../contexts/ShoppingDataContext';
import { INPUT_CLASS, BUTTON_PRIMARY_CLASS, CARD_CLASS, DEFAULT_BUDGET, PRIMARY_COLOR } from '../constants';
import { Cog6ToothIcon, ArrowRightCircleIcon } from './Icons';


interface MarketSetupProps {
  onSetupComplete: (market: Market, budget: number) => void;
}

const MarketSetup = ({ onSetupComplete }: MarketSetupProps) => {
  const { markets, addMarket, findMarketByName } = useShoppingContext();
  const [selectedMarketName, setSelectedMarketName] = useState('');
  const [newMarketName, setNewMarketName] = useState('');
  const [budget, setBudget] = useState<number | string>(DEFAULT_BUDGET);
  const [showNewMarketInput, setShowNewMarketInput] = useState(false);

  useEffect(() => {
    if (markets.length > 0 && !selectedMarketName) {
      setSelectedMarketName(markets[0].name);
    }
    if (markets.length === 0 && !showNewMarketInput) {
        setShowNewMarketInput(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markets]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let marketToUse: Market | undefined;

    if (showNewMarketInput && newMarketName.trim()) {
      marketToUse = findMarketByName(newMarketName.trim());
      if (!marketToUse) {
        marketToUse = addMarket(newMarketName.trim());
      }
    } else if (selectedMarketName) {
      marketToUse = findMarketByName(selectedMarketName);
    }

    if (marketToUse && budget && Number(budget) > 0) {
      onSetupComplete(marketToUse, Number(budget));
    } else {
      alert("Por favor, selecione ou adicione um mercado e defina um orçamento válido.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-[calc(100vh-120px)]">
      <div className={`${CARD_CLASS} w-full max-w-lg`}>
        <div className="text-center mb-6">
          <Cog6ToothIcon className={`w-16 h-16 text-${PRIMARY_COLOR}-500 mx-auto mb-3`} />
          <h2 className="text-2xl font-semibold text-white">Configurar Compras</h2>
          <p className="text-slate-400">Selecione o mercado e defina seu orçamento.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="marketSelect" className="block mb-2 text-sm font-medium text-slate-300">
              Supermercado
            </label>
            {!showNewMarketInput && markets.length > 0 && (
              <select
                id="marketSelect"
                value={selectedMarketName}
                onChange={(e) => setSelectedMarketName(e.target.value)}
                className={INPUT_CLASS}
              >
                {markets.map((market) => (
                  <option key={market.id} value={market.name}>
                    {market.name}
                  </option>
                ))}
              </select>
            )}
            
            {showNewMarketInput || markets.length === 0 ? (
              <input
                type="text"
                placeholder="Nome do Novo Supermercado"
                value={newMarketName}
                onChange={(e) => setNewMarketName(e.target.value)}
                className={INPUT_CLASS + " mt-2"}
              />
            ) : null}

            <button
              type="button"
              onClick={() => setShowNewMarketInput(!showNewMarketInput)}
              className={`mt-2 text-sm text-${PRIMARY_COLOR}-400 hover:text-${PRIMARY_COLOR}-300`}
            >
              {showNewMarketInput ? (markets.length > 0 ? 'Selecionar Existente' : 'Cancelar Novo Mercado') : 'Adicionar Novo Supermercado'}
            </button>
          </div>

          <div>
            <label htmlFor="budget" className="block mb-2 text-sm font-medium text-slate-300">
              Orçamento (R$)
            </label>
            <input
              type="number"
              id="budget"
              value={budget}
              onChange={(e) => setBudget(parseFloat(e.target.value) || '')}
              className={INPUT_CLASS}
              placeholder="Ex: 200"
              min="0"
              step="0.01"
            />
          </div>

          <button type="submit" className={`${BUTTON_PRIMARY_CLASS} w-full flex items-center justify-center`}>
            Iniciar Compras
            <ArrowRightCircleIcon className="w-5 h-5 ml-2" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default MarketSetup;
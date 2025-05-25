
import React from 'react';
import { CartItem } from '../types';
// Ensuring PriceGraph has a valid default export.
import PriceGraph from './PriceGraph';
import { BUTTON_PRIMARY_CLASS, BUTTON_SECONDARY_CLASS, CARD_CLASS, PRIMARY_COLOR } from '../constants';
import { TrashIcon, ArrowLeftCircleIcon, CheckCircleIcon } from './Icons';

interface ShoppingCartViewProps {
  cartItems: CartItem[];
  budget: number;
  onRemoveFromCart: (productId: string) => void; // Moves back to pending
  onDeleteItemFromCart: (productId: string) => void; // Deletes item permanently from cart
  onFinalizePurchase: () => void;
  onGoBackToPending: () => void; // Button to explicitly go back
  marketNameDisplay: string;
}

const ShoppingCartView = ({
  cartItems,
  budget,
  onRemoveFromCart,
  onDeleteItemFromCart,
  onFinalizePurchase,
  onGoBackToPending,
  marketNameDisplay
}: ShoppingCartViewProps) => {
  const totalCartValue = cartItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const isOverBudgetCart = totalCartValue > budget;

  let graphDataCart;
  if (!isOverBudgetCart) {
      graphDataCart = [
          { name: 'Total do Carrinho', value: totalCartValue, fill: '#f87171' }, // Red for spent
          { name: 'Saldo Orçamento', value: Math.max(0, budget - totalCartValue), fill: '#34d399' } // Green for remaining
      ];
  } else {
      graphDataCart = [
          { name: 'Orçamento (Coberto)', value: budget, fill: '#34d399' }, // Green for covered budget
          { name: 'Valor Excedente', value: totalCartValue - budget, fill: '#f87171' } // Red for exceeding amount
      ];
  }
  // FIX: Corrected template literal interpolation
  const cartGraphTitle = `Carrinho (R$${totalCartValue.toFixed(2)}) vs Orçamento (R$${budget.toFixed(2)})`;


  return (
    <div className="p-4 space-y-6">
      <div className={`${CARD_CLASS} p-6`}>
        <div className="text-center mb-2">
             <h2 className="text-2xl font-semibold text-white">Carrinho de Compras</h2>
             {/* FIX: Corrected template literal interpolation for dynamic class */}
             <p className={`text-lg text-${PRIMARY_COLOR}-400`}>Mercado: {marketNameDisplay}</p>
        </div>
        <div className="flex justify-end items-center mb-6">
            <button onClick={onGoBackToPending} className={`${BUTTON_SECONDARY_CLASS} text-sm flex items-center`}>
                <ArrowLeftCircleIcon className="w-5 h-5 mr-2" /> Voltar para Lista
            </button>
        </div>

        {cartItems.length === 0 ? (
          <p className="text-slate-400 text-center py-8">Seu carrinho está vazio.</p>
        ) : (
          <div className="space-y-3 mb-6 max-h-96 overflow-y-auto pr-2">
            {cartItems.map(item => (
              <div key={item.productId} className="bg-slate-700 p-3 rounded-md shadow flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="flex-grow mb-2 sm:mb-0">
                  <p className="font-medium text-slate-100">{item.productName}</p>
                  <p className="text-sm text-slate-400">R$ {item.unitPrice.toFixed(2)} x {item.quantity} = R$ {(item.unitPrice * item.quantity).toFixed(2)}</p>
                </div>
                <div className="flex items-center space-x-2 self-end sm:self-center mt-2 sm:mt-0">
                    <button 
                        onClick={() => onRemoveFromCart(item.productId)} 
                        className={`p-1.5 text-yellow-400 hover:text-yellow-300 bg-slate-600 hover:bg-slate-500 rounded-full`} 
                        title="Mover de volta para Pendentes"
                    >
                        <ArrowLeftCircleIcon className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => onDeleteItemFromCart(item.productId)}
                        className={`p-1.5 text-red-400 hover:text-red-300 bg-slate-600 hover:bg-slate-500 rounded-full`}
                        title="Excluir Item do Carrinho"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-slate-700 pt-6">
          <div className="flex justify-between items-center text-xl font-semibold text-white mb-6">
            <span>Total do Carrinho:</span>
            <span className={isOverBudgetCart ? 'text-red-400 font-bold' : ''}>R$ {totalCartValue.toFixed(2)}</span>
          </div>
          
          <PriceGraph data={graphDataCart} title={cartGraphTitle} isOverBudget={isOverBudgetCart} />

          {cartItems.length > 0 && (
            <button 
              onClick={onFinalizePurchase} 
              className={`${BUTTON_PRIMARY_CLASS} w-full mt-8 text-lg flex items-center justify-center`}
            >
              <CheckCircleIcon className="w-6 h-6 mr-2" />
              Finalizar Compra
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingCartView;
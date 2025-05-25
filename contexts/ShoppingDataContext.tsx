
import React, { createContext, useContext, ReactNode } from 'react';
import { useShoppingData as useShoppingDataInternal } from '../hooks/useShoppingData';
import { Market, Product, PriceRecord, ShoppingSession, ProductPriceInfo } from '../types';

interface ShoppingDataContextType {
  markets: Market[];
  addMarket: (name: string) => Market;
  findMarketByName: (name: string) => Market | undefined;
  getMarketById: (id: string) => Market | undefined;
  products: Product[];
  addProduct: (name: string, barcode?: string) => Product;
  getProductByBarcodeOrId: (identifier: string) => Product | undefined;
  priceHistory: PriceRecord[]; // Added priceHistory
  recordPrice: (productId: string, marketId: string, marketName: string, price: number) => void;
  getProductPriceInfo: (productId: string, currentMarketId: string) => ProductPriceInfo;
  shoppingSessions: ShoppingSession[];
  saveShoppingSession: (session: Omit<ShoppingSession, 'id' | 'date'>) => void;
}

const ShoppingDataContext = createContext<ShoppingDataContextType | undefined>(undefined);

interface ShoppingDataProviderProps {
  children: ReactNode;
}

export const ShoppingDataProvider = ({ children }: ShoppingDataProviderProps) => {
  const shoppingData = useShoppingDataInternal();

  return (
    <ShoppingDataContext.Provider value={shoppingData}>
      {children}
    </ShoppingDataContext.Provider>
  );
};

export const useShoppingContext = (): ShoppingDataContextType => {
  const context = useContext(ShoppingDataContext);
  if (context === undefined) {
    throw new Error('useShoppingContext must be used within a ShoppingDataProvider');
  }
  return context;
};
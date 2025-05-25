
import { useCallback } from 'react';
import { Market, Product, PriceRecord, ShoppingSession, ProductPriceInfo } from '../types';
import useLocalStorage from './useLocalStorage';

export function useShoppingData() {
  const [markets, setMarkets] = useLocalStorage<Market[]>('markets', []);
  const [products, setProducts] = useLocalStorage<Product[]>('products', []);
  const [priceHistory, setPriceHistory] = useLocalStorage<PriceRecord[]>('priceHistory', []);
  const [shoppingSessions, setShoppingSessions] = useLocalStorage<ShoppingSession[]>('shoppingSessions', []);

  const addMarket = useCallback((name: string): Market => {
    const trimmedName = name.trim();
    const existingMarket = markets.find(m => m.name.toLowerCase() === trimmedName.toLowerCase());
    if (existingMarket) {
      return existingMarket;
    }
    const newMarket: Market = { id: Date.now().toString(), name: trimmedName };
    setMarkets(prevMarkets => [...prevMarkets, newMarket]);
    return newMarket;
  }, [markets, setMarkets]);

  const findMarketByName = useCallback((name: string): Market | undefined => {
    return markets.find(m => m.name.toLowerCase() === name.trim().toLowerCase());
  }, [markets]);
  
  const getMarketById = useCallback((id: string): Market | undefined => {
    return markets.find(m => m.id === id);
  }, [markets]);

  const addProduct = useCallback((name: string, barcode?: string): Product => {
    const trimmedName = name.trim();
    const uniqueBarcode = barcode?.trim();
    const canonicalId = uniqueBarcode && uniqueBarcode.length > 0 ? uniqueBarcode : trimmedName.toLowerCase();

    const existingProduct = products.find(p => p.id === canonicalId);
    if (existingProduct) {
      // Optionally update name or barcode if they differ, though ID is primary
      if (existingProduct.name !== trimmedName || (uniqueBarcode && existingProduct.barcode !== uniqueBarcode)) {
        setProducts(prev => prev.map(p => p.id === canonicalId ? {...p, name: trimmedName, barcode: uniqueBarcode || p.barcode } : p));
        return { ...existingProduct, name: trimmedName, barcode: uniqueBarcode || existingProduct.barcode };
      }
      return existingProduct;
    }

    const newProduct: Product = {
      id: canonicalId,
      name: trimmedName,
      barcode: uniqueBarcode,
    };
    setProducts(prevProducts => [...prevProducts, newProduct]);
    return newProduct;
  }, [products, setProducts]);

  const getProductByBarcodeOrId = useCallback((identifier: string): Product | undefined => {
    const trimmedIdentifier = identifier.trim();
    if (!trimmedIdentifier) return undefined;

    // Try direct ID match first (could be barcode or lowercase name)
    let product = products.find(p => p.id === trimmedIdentifier);
    if (product) return product;

    // If not found and identifier wasn't lowercase, try lowercase ID
    const lowercasedIdentifier = trimmedIdentifier.toLowerCase();
    if (trimmedIdentifier !== lowercasedIdentifier) {
      product = products.find(p => p.id === lowercasedIdentifier);
      if (product) return product;
    }
    
    // Fallback: search by barcode field if identifier wasn't the ID
    return products.find(p => p.barcode === trimmedIdentifier);
  }, [products]);

  const recordPrice = useCallback((productId: string, marketId: string, marketName: string, price: number) => {
    const newPriceRecord: PriceRecord = {
      productId,
      marketId,
      marketName,
      price,
      date: new Date().toISOString(),
    };

    setPriceHistory(prevHistory => {
      // Logic to keep only the last price of the day for the same product in the same market
      const todayDateString = new Date(newPriceRecord.date).toDateString();
      const filteredHistory = prevHistory.filter(pr => 
        !(pr.productId === productId && pr.marketId === marketId && new Date(pr.date).toDateString() === todayDateString)
      );
      return [...filteredHistory, newPriceRecord];
    });
  }, [setPriceHistory]);

  const getProductPriceInfo = useCallback((productId: string, currentMarketId: string): ProductPriceInfo => {
    const historyForProduct = priceHistory
      .filter(r => r.productId === productId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by date, recent first

    let lastPriceInCurrentMarket: number | null = null;
    let lastPriceDateInCurrentMarket: string | null = null;
    let cheapestPriceOverall: { price: number; marketName: string } | null = null;

    const currentMarketRecords = historyForProduct.filter(r => r.marketId === currentMarketId);
    if (currentMarketRecords.length > 0) {
      lastPriceInCurrentMarket = currentMarketRecords[0].price;
      lastPriceDateInCurrentMarket = currentMarketRecords[0].date;
    }

    if (historyForProduct.length > 0) {
      const sortedByPrice = [...historyForProduct].sort((a, b) => a.price - b.price);
      cheapestPriceOverall = { price: sortedByPrice[0].price, marketName: sortedByPrice[0].marketName };
    }
    
    return { lastPriceInCurrentMarket, lastPriceDateInCurrentMarket, cheapestPriceOverall };
  }, [priceHistory]);
  
  const saveShoppingSession = useCallback((sessionData: Omit<ShoppingSession, 'id' | 'date'>) => {
    const newSession: ShoppingSession = {
      ...sessionData,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    setShoppingSessions(prevSessions => [...prevSessions, newSession]);

    for (const item of sessionData.finalizedItems) {
      recordPrice(item.productId, sessionData.marketId, sessionData.marketName, item.unitPrice);
    }
  }, [setShoppingSessions, recordPrice]);

  return {
    markets,
    addMarket,
    findMarketByName,
    getMarketById,
    products,
    addProduct,
    getProductByBarcodeOrId,
    priceHistory, // Expose priceHistory directly
    recordPrice,
    getProductPriceInfo,
    shoppingSessions,
    saveShoppingSession,
  };
}
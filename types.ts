
export interface Product {
  id: string; // Unique ID, could be barcode
  name: string;
  barcode?: string;
  // priceRecords: PriceRecord[]; // Removed: Price history will be global
}

export interface PriceRecord {
  productId: string; // Link back to the product
  marketId: string;
  marketName: string; // For display purposes
  price: number;
  date: string; // ISO date string
}

export interface ProductPriceInfo {
  lastPriceInCurrentMarket: number | null;
  lastPriceDateInCurrentMarket: string | null; // Added date for the last price
  cheapestPriceOverall: { price: number; marketName: string } | null;
}

export interface Market {
  id: string;
  name: string;
}

export interface ShoppingListItemCore {
  productId: string;
  productName: string; // Denormalized for convenience
  quantity: number;
  unitPrice: number; // Price at which it was added in current session
}

export interface StagingItem extends ShoppingListItemCore {}

export interface CartItem extends ShoppingListItemCore {}

export interface ShoppingSession {
  id: string; // Unique ID for the session
  marketId: string;
  marketName: string;
  budget: number;
  finalizedItems: CartItem[];
  totalSpent: number;
  date: string; // ISO date string
}

export enum AppPhase {
  AUTH = 'AUTH',
  MARKET_SETUP = 'MARKET_SETUP',
  PRODUCT_ENTRY = 'PRODUCT_ENTRY', // Combines Phase 1 (adding) and Phase 2 (pending list)
  SHOPPING_CART = 'SHOPPING_CART', // Phase 3
  PRODUCT_ADMIN = 'PRODUCT_ADMIN', // New phase for managing products
}

export interface User {
  id: string;
  name: string;
}
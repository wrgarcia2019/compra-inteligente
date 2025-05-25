
import React, { useState, useCallback, useEffect } from 'react';
import { AppPhase, User, Market, StagingItem, CartItem } from './types';
import { useShoppingContext } from './contexts/ShoppingDataContext';
import Header from './components/Header';
import Auth from './components/Auth';
import MarketSetup from './components/MarketSetup';
// Ensuring ProductManagementView has a valid default export.
// This error is resolved if ProductManagementView.tsx correctly exports a default component.
import ProductManagementView from './components/ProductManagementView';
// Ensuring ShoppingCartView has a valid default export.
// This error is resolved if ShoppingCartView.tsx correctly exports a default component.
import ShoppingCartView from './components/ShoppingCartView';
// Ensuring ProductAdminView has a valid default export.
// This error is resolved if ProductAdminView.tsx correctly exports a default component.
import ProductAdminView from './components/ProductAdminView'; // Import new view
import { DEFAULT_BUDGET } from './constants';
import { ArrowRightCircleIcon, ShoppingBagIcon } from './components/Icons';

// Removed React.FC type annotation to allow TypeScript to correctly infer the component's return type.
// This addresses the error "Type '() => void' is not assignable to type 'FC<{}>'"
// and resolves the related 'no default export' error for this module by ensuring it's a standard functional component returning JSX.
const App = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPhase, setCurrentPhase] = useState<AppPhase>(AppPhase.AUTH);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [budget, setBudget] = useState<number>(DEFAULT_BUDGET);
  const [pendingItems, setPendingItems] = useState<StagingItem[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const { saveShoppingSession } = useShoppingContext();

  useEffect(() => {
    const storedUser = localStorage.getItem('smartGroceryUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
      const storedPhase = localStorage.getItem('smartGroceryPhase') as AppPhase;
      const storedMarket = localStorage.getItem('smartGroceryMarket');
      const storedBudget = localStorage.getItem('smartGroceryBudget');

      if(storedPhase && storedPhase !== AppPhase.AUTH) {
        setCurrentPhase(storedPhase);
        if(storedMarket) setSelectedMarket(JSON.parse(storedMarket));
        if(storedBudget) setBudget(parseFloat(storedBudget));
      } else {
        setCurrentPhase(AppPhase.MARKET_SETUP);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  const persistAppState = useCallback(() => {
    if(currentUser && currentPhase !== AppPhase.AUTH) {
      localStorage.setItem('smartGroceryPhase', currentPhase);
      if(selectedMarket) localStorage.setItem('smartGroceryMarket', JSON.stringify(selectedMarket));
      localStorage.setItem('smartGroceryBudget', budget.toString());
    } else {
      localStorage.removeItem('smartGroceryPhase');
      localStorage.removeItem('smartGroceryMarket');
      localStorage.removeItem('smartGroceryBudget');
    }
  }, [currentUser, currentPhase, selectedMarket, budget]);

  useEffect(() => {
    persistAppState();
  }, [persistAppState]);


  const handleLogin = useCallback((user: User) => {
    setCurrentUser(user);
    localStorage.setItem('smartGroceryUser', JSON.stringify(user));
    setCurrentPhase(AppPhase.MARKET_SETUP);
  }, []);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('smartGroceryUser');
    localStorage.removeItem('smartGroceryPhase');
    localStorage.removeItem('smartGroceryMarket');
    localStorage.removeItem('smartGroceryBudget');
    setCurrentPhase(AppPhase.AUTH);
    setSelectedMarket(null);
    setBudget(DEFAULT_BUDGET);
    setPendingItems([]);
    setCartItems([]);
  }, []);

  const handleMarketSetupComplete = useCallback((market: Market, newBudget: number) => {
    setSelectedMarket(market);
    setBudget(newBudget);
    setCurrentPhase(AppPhase.PRODUCT_ENTRY);
  }, []);

  const handleNavigateToProductAdmin = useCallback(() => {
    setCurrentPhase(AppPhase.PRODUCT_ADMIN);
  }, []);

  const handleMoveToCart = useCallback((itemToMove: StagingItem) => {
    setCartItems(prevCart => {
      const existingCartItemIndex = prevCart.findIndex(ci => ci.productId === itemToMove.productId);
      if (existingCartItemIndex > -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingCartItemIndex].quantity += itemToMove.quantity;
        // Update price if it's different, user might have changed it in pending
        updatedCart[existingCartItemIndex].unitPrice = itemToMove.unitPrice; 
        return updatedCart;
      }
      return [...prevCart, { ...itemToMove }];
    });
    setPendingItems(prevPending => prevPending.filter(pi => pi.productId !== itemToMove.productId));
  }, []);

  const handleMoveAllToCart = useCallback(() => {
    let updatedCart = [...cartItems];
    pendingItems.forEach(itemToMove => {
        const existingCartItemIndex = updatedCart.findIndex(ci => ci.productId === itemToMove.productId);
        if(existingCartItemIndex > -1) {
            updatedCart[existingCartItemIndex].quantity += itemToMove.quantity;
            updatedCart[existingCartItemIndex].unitPrice = itemToMove.unitPrice; // Ensure price from pending is used
        } else {
            updatedCart.push({...itemToMove});
        }
    });
    setCartItems(updatedCart);
    setPendingItems([]);
  }, [cartItems, pendingItems]);


  const handleRemoveFromCart = useCallback((productIdToRemove: string) => {
    const itemToMoveBack = cartItems.find(ci => ci.productId === productIdToRemove);
    if (itemToMoveBack) {
      setPendingItems(prevPending => {
        const existingPendingItemIndex = prevPending.findIndex(pi => pi.productId === itemToMoveBack.productId);
        if (existingPendingItemIndex > -1) {
          const updatedPending = [...prevPending];
          updatedPending[existingPendingItemIndex].quantity += itemToMoveBack.quantity;
           // Price might have been specific to cart session, keep from cart
          updatedPending[existingPendingItemIndex].unitPrice = itemToMoveBack.unitPrice;
          return updatedPending;
        }
        return [...prevPending, { ...itemToMoveBack }];
      });
      setCartItems(prevCart => prevCart.filter(ci => ci.productId !== productIdToRemove));
    }
  }, [cartItems]);

  const handleDeleteItemFromCart = useCallback((productIdToDelete: string) => {
    setCartItems(prevCart => prevCart.filter(ci => ci.productId !== productIdToDelete));
  }, []);


  const handleFinalizePurchase = useCallback(() => {
    if (!selectedMarket || cartItems.length === 0) {
      alert("Nenhum item no carrinho ou mercado não selecionado.");
      return;
    }
    const totalSpent = cartItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    saveShoppingSession({
      marketId: selectedMarket.id,
      marketName: selectedMarket.name,
      budget: budget,
      finalizedItems: cartItems,
      totalSpent: totalSpent,
    });
    alert('Compra finalizada! Total gasto: R$ ' + totalSpent.toFixed(2) + ' em ' + selectedMarket.name + '. Os preços foram registrados.');
    setPendingItems([]);
    setCartItems([]);
    setCurrentPhase(AppPhase.MARKET_SETUP); // Go back to market setup for a new session
  }, [selectedMarket, cartItems, budget, saveShoppingSession]);
  
  const navigateToShoppingCart = () => {
    if (pendingItems.length === 0 && cartItems.length === 0) { // If cart is also empty, not just pending
        alert("Adicione itens à lista antes de prosseguir para o carrinho.");
        return;
    }
    setCurrentPhase(AppPhase.SHOPPING_CART);
  };


  const renderCurrentPhase = () => {
    switch (currentPhase) {
      case AppPhase.AUTH:
        return <Auth onLogin={handleLogin} />;
      case AppPhase.MARKET_SETUP:
        if (!currentUser) return <Auth onLogin={handleLogin} />;
        return <MarketSetup onSetupComplete={handleMarketSetupComplete} />;
      case AppPhase.PRODUCT_ENTRY:
        if (!currentUser || !selectedMarket) return <MarketSetup onSetupComplete={handleMarketSetupComplete} />;
        return (
          <ProductManagementView
            currentMarket={selectedMarket}
            budget={budget}
            pendingItems={pendingItems}
            setPendingItems={setPendingItems}
            onMoveToCart={handleMoveToCart}
            onMoveAllToCart={handleMoveAllToCart}
            marketNameDisplay={selectedMarket.name}
          />
        );
      case AppPhase.SHOPPING_CART:
        if (!currentUser || !selectedMarket) return <MarketSetup onSetupComplete={handleMarketSetupComplete} />;
        return (
          <ShoppingCartView
            cartItems={cartItems}
            budget={budget}
            onRemoveFromCart={handleRemoveFromCart}
            onDeleteItemFromCart={handleDeleteItemFromCart}
            onFinalizePurchase={handleFinalizePurchase}
            onGoBackToPending={() => setCurrentPhase(AppPhase.PRODUCT_ENTRY)}
            marketNameDisplay={selectedMarket.name}
          />
        );
      case AppPhase.PRODUCT_ADMIN:
        if (!currentUser) return <Auth onLogin={handleLogin} />;
        return <ProductAdminView onBackToMarketSetup={() => setCurrentPhase(AppPhase.MARKET_SETUP)} />;
      default:
        return <Auth onLogin={handleLogin} />;
    }
  };

  const isAppActive = currentUser && currentPhase !== AppPhase.AUTH;

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-slate-100">
      <Header 
        user={currentUser} 
        onLogout={handleLogout} 
        currentPhaseActive={isAppActive}
        currentPhase={currentPhase}
        onNavigateToProductAdmin={handleNavigateToProductAdmin}
      />
      <main className="flex-grow container mx-auto px-0 sm:px-4 py-4 w-full">
        {renderCurrentPhase()}
      </main>
      {isAppActive && (currentPhase === AppPhase.PRODUCT_ENTRY || currentPhase === AppPhase.SHOPPING_CART) && (
        <footer className="sticky bottom-0 bg-slate-800 p-3 shadow-top z-40 border-t border-slate-700">
          <div className="container mx-auto flex justify-around items-center">
            <button 
                onClick={() => setCurrentPhase(AppPhase.PRODUCT_ENTRY)}
                disabled={currentPhase === AppPhase.PRODUCT_ENTRY}
                className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-colors duration-150 ${
                  currentPhase === AppPhase.PRODUCT_ENTRY
                    ? 'bg-sky-600 text-white cursor-default'
                    : 'bg-slate-700 hover:bg-sky-500 text-slate-300 hover:text-white'
                }`}
            >
                <ShoppingBagIcon className="w-5 h-5"/> <span>Lista</span>
            </button>
            <button 
                onClick={navigateToShoppingCart}
                disabled={currentPhase === AppPhase.SHOPPING_CART}
                className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-colors duration-150 ${
                  currentPhase === AppPhase.SHOPPING_CART
                    ? 'bg-sky-600 text-white cursor-default'
                    : 'bg-slate-700 hover:bg-sky-500 text-slate-300 hover:text-white'
                }`}
            >
                <ArrowRightCircleIcon className="w-5 h-5"/> <span>Carrinho</span> 
                {(cartItems.length > 0) && <span className="bg-red-500 text-xs text-white rounded-full px-1.5 py-0.5">{cartItems.length}</span>}
            </button>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;
    
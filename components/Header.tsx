
import React from 'react';
import { User, AppPhase } from '../types';
import { APP_TITLE, PRIMARY_COLOR } from '../constants';
import { ShoppingBagIcon, UserCircleIcon, LogoutIcon, ClipboardListIcon } from './Icons';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  currentPhaseActive: boolean; 
  currentPhase: AppPhase;
  onNavigateToProductAdmin: () => void;
}

const Header = ({ user, onLogout, currentPhaseActive, currentPhase, onNavigateToProductAdmin }: HeaderProps) => {
  return (
    <header className={`bg-slate-800 shadow-md p-4 flex justify-between items-center sticky top-0 z-50`}>
      <div className="flex items-center">
        {/* FIX: Corrected template literal interpolation for dynamic class */}
        <ShoppingBagIcon className={`w-8 h-8 text-${PRIMARY_COLOR}-400 mr-3`} />
        <h1 className={`text-xl sm:text-2xl font-bold text-white`}>{APP_TITLE}</h1>
      </div>
      {user && currentPhaseActive && (
        <div className="flex items-center space-x-3">
          {currentPhase !== AppPhase.PRODUCT_ADMIN && (
            <button
              onClick={onNavigateToProductAdmin}
              className={`bg-teal-500 hover:bg-teal-600 text-white p-2 rounded-full transition-colors duration-150`}
              title="Administrar Produtos"
            >
              <ClipboardListIcon className="w-5 h-5" />
            </button>
          )}
          {/* FIX: Corrected template literal interpolation for dynamic class */}
          <UserCircleIcon className={`w-7 h-7 text-${PRIMARY_COLOR}-300 hidden sm:block`} />
          <span className={`text-slate-300 hidden sm:block`}>Olá, {user.name}</span>
          <button
            onClick={onLogout}
            className={`bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors duration-150`}
            title="Logout"
          >
            <LogoutIcon className="w-5 h-5" />
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
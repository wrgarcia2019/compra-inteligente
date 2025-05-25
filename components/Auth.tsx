
import React, { useState } from 'react';
import { User } from '../types';
import { BUTTON_PRIMARY_CLASS, INPUT_CLASS, CARD_CLASS, PRIMARY_COLOR } from '../constants';
import { UserCircleIcon } from './Icons';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth = ({ onLogin }: AuthProps) => {
  const [username, setUsername] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin({ id: Date.now().toString(), name: username.trim() });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className={`${CARD_CLASS} w-full max-w-md`}>
        <div className="text-center mb-8">
          {/* FIX: Corrected template literal interpolation for dynamic class */}
          <UserCircleIcon className={`w-20 h-20 text-${PRIMARY_COLOR}-500 mx-auto mb-4`} />
          <h2 className="text-3xl font-bold text-white">Bem-vindo!</h2>
          <p className="text-slate-400">Faça login para gerenciar suas compras.</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="username" className="block mb-2 text-sm font-medium text-slate-300">
              Nome de Usuário
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={INPUT_CLASS}
              placeholder="Ex: João Silva"
              required
            />
          </div>
          <button type="submit" className={`${BUTTON_PRIMARY_CLASS} w-full`}>
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
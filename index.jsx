
import React from 'react';
import ReactDOM from 'react-dom/client';
// Assuming App.tsx provides a default export. The related error suggests it might have been missing or invalid.
import App from './App';
import { ShoppingDataProvider } from './contexts/ShoppingDataContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ShoppingDataProvider>
      <App />
    </ShoppingDataProvider>
  </React.StrictMode>
);
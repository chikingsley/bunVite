// src/main.tsx

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { StoreProvider } from '@/components/providers/StoreProvider'
import { initializePersistence } from '@/utils/store-config'

// Initialize persistence layer
async function initializeApp() {
  try {
    await initializePersistence();
    console.log('Store persistence initialized');
  } catch (error) {
    console.error('Failed to initialize persistence:', error);
  }
}

// Initialize and render
initializeApp().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <StoreProvider>
        <App />
      </StoreProvider>
    </StrictMode>,
  )
});

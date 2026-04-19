import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ChronosProvider } from './hooks/useChronosStore';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChronosProvider>
      <App />
    </ChronosProvider>
  </StrictMode>,
);

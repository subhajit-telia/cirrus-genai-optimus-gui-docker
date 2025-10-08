import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import "./theme/variables.css"
import { MsalProvider } from '@azure/msal-react';
import { msalInstance } from './config/msalConfig';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <MsalProvider instance={msalInstance}>
    <App />
  </MsalProvider>
);
// src/types/global.d.ts
export {};

declare global {
  interface Window {
    RUNTIME_ENV: {
      REACT_APP_API_URL: string;
      REACT_APP_ENV: string;
      AZURE_CLIENT_ID: string;
      AZURE_TENANT_ID: string;
    };
  }
}

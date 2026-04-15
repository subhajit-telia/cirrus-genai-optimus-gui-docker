// src/types/global.d.ts
export {};

declare global {
  interface Window {
    RUNTIME_ENV: {
      REACT_APP_API_URL: string;
      REACT_APP_ENV?: string;
      API_ENDPOINT?: string;
      API_KEY?: string;
      AZURE_AD_CLIENT_ID?: string;
      AZURE_AD_TENANT_ID?: string;
      REACT_APP_URL?: string;
    };
  }
}

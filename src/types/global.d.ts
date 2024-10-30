// src/types/global.d.ts
export {};

declare global {
  interface Window {
    RUNTIME_ENV: {
      REACT_APP_API_URL: string;
      REACT_APP_ENV: string;
    };
  }
}

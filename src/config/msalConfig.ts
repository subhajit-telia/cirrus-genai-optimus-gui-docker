import { PublicClientApplication } from "@azure/msal-browser";
import { NetworkInfo } from "../routes/network";

console.log("env>>", import.meta.env.VITE_API_BASE_URL);
console.log("NetworkInfo>>", NetworkInfo.AZURE_CLIENT_ID);
const currentUrl = window.location.href;
console.log("Current URL:", currentUrl);
const RUNTIME_ENV = (window as any).RUNTIME_ENV || {};
console.log("RUNTIME_ENV:", RUNTIME_ENV);

const AZURE_TENANT_ID = '05764a73-8c6f-4538-83cd-413f1e1b5665';
let AZURE_CLIENT_ID;
if (currentUrl.toLowerCase().includes('dev')) {
  AZURE_CLIENT_ID = 'REMOVED';
}else if (currentUrl.toLowerCase().includes('stage')) {
  AZURE_CLIENT_ID = 'REMOVED';
}else {
  AZURE_CLIENT_ID = 'REMOVED';
}



const msalConfig = {
  auth: {
    clientId: AZURE_CLIENT_ID, // Application (client) ID from Azure
    authority: `https://login.microsoftonline.com/${AZURE_TENANT_ID}`, // Directory (tenant) ID from Azure
    // redirectUri: "http://localhost:8100/use-cases",
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: true,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);
import { PublicClientApplication } from "@azure/msal-browser";
import { NetworkInfo } from "../routes/network";

console.log("NetworkInfo>>", NetworkInfo.AZURE_CLIENT_ID);
const currentUrl = window.location.href;
console.log("Current URL:", currentUrl);
const RUNTIME_ENV = (window as any).RUNTIME_ENV || {};
console.log("RUNTIME_ENV:", RUNTIME_ENV);

console.log("MSAL Config Values:", {
  clientId: process.env.AZURE_AD_CLIENT_ID,
  clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
  tenantId: process.env.AZURE_AD_TENANT_ID,
});


const msalConfig = {
  auth: {
    clientId: `${NetworkInfo.AZURE_CLIENT_ID}`, // Application (client) ID from Azure
    authority: `https://login.microsoftonline.com/${NetworkInfo.AZURE_TENANT_ID}`, // Directory (tenant) ID from Azure
    // redirectUri: "http://localhost:8100/use-cases",
    clientSecret: NetworkInfo.AZURE_SECRET_ID,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: true,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);
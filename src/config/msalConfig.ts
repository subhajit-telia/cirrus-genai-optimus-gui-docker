import { PublicClientApplication } from "@azure/msal-browser";

console.log("window.RUNTIME_ENV?", window.RUNTIME_ENV)

const msalConfig = {
  auth: {
    clientId: window.RUNTIME_ENV?.AZURE_CLIENT_ID, // Application (client) ID from Azure
    authority: `https://login.microsoftonline.com/${window.RUNTIME_ENV?.AZURE_TENANT_ID}`, // Directory (tenant) ID from Azure
    // redirectUri: "http://localhost:8100/use-cases",
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: true,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);
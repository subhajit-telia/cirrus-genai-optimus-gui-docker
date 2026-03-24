import { PublicClientApplication } from "@azure/msal-browser";

console.log("window.RUNTIME_ENV 1?", window.RUNTIME_ENV)
const msalConfig = {
  auth: {
    clientId: window.RUNTIME_ENV?.AZURE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${window.RUNTIME_ENV?.AZURE_TENANT_ID}`,
    // redirectUri: "http://localhost:8100/use-cases", // Update as needed
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: true,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);
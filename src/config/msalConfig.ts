import { PublicClientApplication } from "@azure/msal-browser";
import { NetworkInfo } from "../routes/network";
const msalConfig = {
  auth: {
    clientId: NetworkInfo.AZURE_CLIENT_ID, // from window.RUNTIME_ENV at runtime
    authority: `https://login.microsoftonline.com/${NetworkInfo.AZURE_TENANT_ID}`, // from window.RUNTIME_ENV at runtime
    // redirectUri: "http://localhost:8100/use-cases",
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: true,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);
import { PublicClientApplication } from "@azure/msal-browser";
import { NetworkInfo } from "../routes/network";

console.log("NetworkInfo>>", NetworkInfo)
const msalConfig = {
  auth: {
    clientId: NetworkInfo.AZURE_CLIENT_ID, // Application (client) ID from Azure
    authority: `https://login.microsoftonline.com/${NetworkInfo.AZURE_TENANT_ID}`,
    // redirectUri: "http://localhost:8100/use-cases",
    clientSecret: NetworkInfo.AZURE_SECRET_ID,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: true,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);

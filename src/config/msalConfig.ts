import { PublicClientApplication } from "@azure/msal-browser";
import { NetworkInfo } from "../routes/network";

console.log("NetworkInfo>>", NetworkInfo);
const currentUrl = window.location.href;
console.log("Current URL:", currentUrl);
const AZURE_TENANT_ID = '';
let AZURE_CLIENT_ID = '';
let AZURE_SECRET_ID = ''


const msalConfig = {
  auth: {
    clientId: AZURE_CLIENT_ID, // Application (client) ID from Azure
    authority: `https://login.microsoftonline.com/${AZURE_TENANT_ID}`, // Directory (tenant) ID from Azure
    // redirectUri: "http://localhost:8100/use-cases",
    clientSecret: AZURE_SECRET_ID,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: true,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);

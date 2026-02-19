import { PublicClientApplication } from "@azure/msal-browser";
import { NetworkInfo } from "../routes/network";

console.log("NetworkInfo>>", NetworkInfo.AZURE_CLIENT_ID);
const currentUrl = window.location.href;
console.log("Current URL:", currentUrl);
const RUNTIME_ENV = (window as any).RUNTIME_ENV || {};
console.log("RUNTIME_ENV:", RUNTIME_ENV);

const AZURE_TENANT_ID = '05764a73-8c6f-4538-83cd-413f1e1b5665';
let AZURE_CLIENT_ID;
if (currentUrl.toLowerCase().includes('dev')) {
  AZURE_CLIENT_ID = 'a8a6ba07-6881-4c2a-aa0e-cf5f09e64fe5';
}else if (currentUrl.toLowerCase().includes('stage')) {
  AZURE_CLIENT_ID = 'd869b7d7-c404-430d-8b5d-a9d8d2cc0bba';
}else {
  AZURE_CLIENT_ID = '2e0ed0b0-05a6-46c1-8fde-f50fc6dbdf9c';
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
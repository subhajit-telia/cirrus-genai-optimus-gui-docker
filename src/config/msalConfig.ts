import { PublicClientApplication } from "@azure/msal-browser";
import { NetworkInfo } from "../routes/network";

console.log("NetworkInfo>>", NetworkInfo);
const currentUrl = window.location.href;
console.log("Current URL:", currentUrl);
const AZURE_TENANT_ID = '05764a73-8c6f-4538-83cd-413f1e1b5665';
let AZURE_CLIENT_ID;
let AZURE_SECRET_ID
if (currentUrl.toLowerCase().includes('dev')) {
  AZURE_CLIENT_ID = 'a8a6ba07-6881-4c2a-aa0e-cf5f09e64fe5';
  AZURE_SECRET_ID = '570b785c-a174-4055-a493-6a97a8ab8f27';
}else if (currentUrl.toLowerCase().includes('stage')) {
  AZURE_CLIENT_ID = 'd869b7d7-c404-430d-8b5d-a9d8d2cc0bba';
  AZURE_SECRET_ID = '1e37bef3-615f-4d15-ab32-e60a9d19f018';
}else {
  AZURE_CLIENT_ID = '2e0ed0b0-05a6-46c1-8fde-f50fc6dbdf9c';
  AZURE_SECRET_ID = 'b8f921e2-cde6-4941-a226-bf2bb79e1f4b';
}

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

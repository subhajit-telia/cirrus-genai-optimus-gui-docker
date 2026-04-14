import { AuthenticationResult } from "@azure/msal-browser";
import { useMsal } from "@azure/msal-react";
import { IonButton, IonLabel, IonSegmentButton } from "@ionic/react";
import { useHistory } from "react-router-dom";
import { useAuth } from "../../config/AuthContext";
import { NetworkInfo } from "../../routes/network";

const LoginButton = () => {
  const { instance } = useMsal();
  const history = useHistory();
  const { login } = useAuth();

  const handleLogin = async () => {
    const currentUrl = window.location.href;
    console.log("Current URL:", currentUrl);
    console.log("ACCESSTOKEN:", NetworkInfo.ACCESSTOKEN);
    console.log("AZURE_AD_TENANT_ID:", NetworkInfo.AZURE_TENANT_ID);
    console.log("URL:", NetworkInfo.URL);
    let reactAppUrl;
    if (currentUrl.toLowerCase().includes('dev')) {
      reactAppUrl = 'https://genai-optimus-gui.cirrus-dev.teliacompany.net';
    }else if (currentUrl.toLowerCase().includes('stage')) {
      reactAppUrl = 'https://genai-optimus-gui.cirrus-stage.teliacompany.net';
    }else {
      reactAppUrl = 'https://genai-optimus-gui.cirrus.teliacompany.net';
    }
    console.log("React App URL:", reactAppUrl);
    try {
      const response: AuthenticationResult = await instance.loginPopup({
        scopes: ["User.Read", "profile", "openid", "email"], // Request necessary scopes
        redirectUri: reactAppUrl, // Force base URL
      });

      console.log("Login Response:", response);

      // Extract user details
      const account = response.account;
      console.log("User Info:", account?.name, account?.username);

      // Store access_token for API calls
      const accessToken = response.accessToken;
      
      if (accessToken) {
        getUserDetails(accessToken);
        const groups = ((response.idTokenClaims as { groups?: string[] })?.groups || []).filter(
          (group) => group.includes('OPTIMUS') || group.includes('KNOWLEDGEBASE')
        );
        const isUser = groups.includes('HID100007708_PROD_CIRRUS_GENAI_OPTIMUS_USER');
        const isAdmin = groups.includes('HID100007708_PROD_CIRRUS_GENAI_OPTIMUS_ADMIN');
        const userData = {
          verification: true,
          roles: {
            user: isUser || true,
            admin: isAdmin
          },
          tiga_roles: groups || [],
          username: account?.username,
          display_name: account?.name
        };
        localStorage.setItem('user', JSON.stringify(userData));

        if (userData.roles.admin === true && userData.roles.user === true) {
          login('admin');
        }else if (userData.roles.admin === true) {
          login('admin');
        }else if (userData.roles.user === true) {
          login('user');
        }
        history.push('/b2c');
      }
      console.log("Access Token:", accessToken);
    } catch (error) {
      console.error("Login Failed:", error);
    }
  };

  /* -------------get user details data start------------- */
  const getUserDetails = async (accessToken:string) => {
    try {
      const urlData = 'https://graph.microsoft.com/v1.0/me';

      const response = await fetch(urlData, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      const responseData = await response.json();
      console.log("Success graph data:", responseData);

      if (response.ok) {

      }
      
    } catch (error: any) {
      console.error("catch failed:", error);
    }
  };
  /* get user details data end */
  // return <IonSegmentButton onClick={handleLogin} className='hidden size-min min-w-0 h-7 min-h-6' value="sso"><IonLabel  className='m-0 text-xs'>AZURE AD</IonLabel></IonSegmentButton>;
  return <IonButton className='btn-primary' shape="round" onClick={handleLogin}>Telia Single Sign-On</IonButton>;
};

export default LoginButton;

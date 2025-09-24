import { AuthenticationResult } from "@azure/msal-browser";
import { useMsal } from "@azure/msal-react";
import { IonButton } from "@ionic/react";
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
    let reactAppUrl;
    if (currentUrl.toLowerCase().includes('dev')) {
      reactAppUrl = 'https://genai-optimus-gui.cirrus-dev.teliacompany.net';
    }else if (currentUrl.toLowerCase().includes('stage')) {
      reactAppUrl = 'https://genai-optimus-gui.cirrus-stage.teliacompany.net';
    }else {
      reactAppUrl = 'https://genai-optimus.cirrus.teliacompany.net';
    }
    console.log("React App URL:", reactAppUrl);
    try {
      const response: AuthenticationResult = await instance.loginPopup({
        scopes: ["User.Read"], // Request necessary scopes
        redirectUri: reactAppUrl, // Force base URL
      });

      console.log("Login Response:", response);

      // Extract user details
      const account = response.account;
      console.log("User Info:", account?.name, account?.username);

      // Store "removed" for API calls
      const accessToken = response.accessToken;
      if (accessToken) {
        login('user');
        history.push('/use-cases');
      }
      console.log("Access Token:", accessToken);
    } catch (error) {
      console.error("Login Failed:", error);
    }
  };

  return <IonButton onClick={handleLogin} className='btn-primary' shape="round">Login with TCAD</IonButton> ;
};

export default LoginButton;

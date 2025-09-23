import { useMsal } from "@azure/msal-react";
import { IonItem, IonIcon, IonLabel } from "@ionic/react";
import { power } from "ionicons/icons";
import { useAuth } from "../../config/AuthContext";

const LogoutButton = () => {
  const { instance } = useMsal();
  const { logout } = useAuth();
  
  const handleLogout = async () => {
    try {
      await instance.logoutPopup(); // Use logoutRedirect() if needed

      // Return a response after successful logout
      console.log("User successfully logged out");
      logout();
      return { success: true, message: "Logout successful" };
    } catch (error) {
      console.error("Logout Failed:", error);
      return { success: false, message: "Logout failed", error };
    }
  };

  return <IonItem onClick={handleLogout} className='text-sm' button={true} detail={false}>
            <IonIcon className='text-base' aria-hidden="true" icon={power} slot="start"></IonIcon>
            <IonLabel>Logout</IonLabel>
          </IonItem>;
};

export default LogoutButton;

import { IonAvatar, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonMenuButton, IonPopover, IonRouterLink, IonTitle, IonToolbar } from '@ionic/react';
import './Header.css';
import { menuOutline, person, power } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import logo from '../../theme/assets/logo.png'
import { useEffect, useState } from 'react';
import { useAuth } from '../../config/AuthContext';
import LogoutButton from '../logoutbutton/LogoutButton';
import { useMsal } from '@azure/msal-react';
import { menuController } from "@ionic/core";

interface ContainerProps { }

interface UserData {
    username: string;
    display_name: string;
    verification: string;
    roles: {
        admin: boolean;
        user: boolean;
    }
}

const AppHeader: React.FC<ContainerProps> = () => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const location = useLocation();
    const history = useHistory();

    const currentPath = location.pathname.startsWith('/') 
    ? location.pathname.substring(1) 
    : location.pathname;

    const { logout } = useAuth();
    const { instance } = useMsal();

    useEffect(() => {
        let userLocalData:any = localStorage.getItem('user');
        setUserData(JSON.parse(userLocalData));
        console.log('userData', JSON.parse(userLocalData));
    }, []);

    /* handleLogout start */
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

  const toggleMenu = async () => {
    await menuController.toggle();
  };
    
  return (
    <IonHeader className='flex px-5 items-center justify-between'>
        <div>
            <IonToolbar className='header-toolbar'>
                {(userData) && (currentPath === 'b2c' || currentPath === 'b2b') ?
                    <IonTitle className='cursor-pointer'>
                        <IonRouterLink routerLink={currentPath} routerDirection="none"></IonRouterLink>
                    </IonTitle>
                : 
                <IonTitle className='capitalize p-0'>{currentPath} List</IonTitle>
                }
                <IonButtons slot="end">
                    <IonMenuButton />
                </IonButtons>
            </IonToolbar>
        </div>
        <div className='grow'>
            {(userData) && (currentPath === 'b2c' || currentPath === 'b2b') &&
                <>
                    <IonRouterLink routerLink="/b2c" routerDirection="none" className={`${location.pathname === '/b2c' ? 'border-b-2 border-[#990ae3] pb-1 text-[#990ae3] font-bold' : ''} mx-1.5 text-sm cursor-pointer text-[#000]`}>B2C</IonRouterLink>
                    <IonRouterLink routerLink="/b2b" routerDirection="none" className={`${location.pathname === '/b2b' ? 'border-b-2 border-[#990ae3] pb-1 text-[#990ae3] font-bold' : ''} mx-1.5 text-sm cursor-pointer text-[#000]`}>B2B</IonRouterLink>
                </>
            }
        </div>
        <div>
            <IonItem id="cover-trigger" button detail={false} lines="none">
                <IonAvatar className="w-6 h-6" aria-hidden="true" slot="start">
                    <img  alt="" src="https://ionicframework.com/docs/img/demos/avatar.svg" />
                </IonAvatar>
                {userData && (
                    <IonLabel className='text-nowrap capitalize !text-black'>
                        {userData.display_name || userData.username.replace(/_/g, ' ')}
                        <p>{userData.roles.admin ? 'Admin' : 'User'}</p>
                    </IonLabel>
                )}
            </IonItem>
            <IonPopover className='profile-popover' trigger="cover-trigger" side="bottom" alignment="end">
                <IonContent>
                    <IonList className='p-0'>
                        {(userData && userData.roles.admin) && (currentPath === 'b2c' || currentPath === 'b2b') ?
                            <IonItem routerLink="users" className='text-sm' button={true} detail={false}>
                                <IonIcon className='text-base' aria-hidden="true" icon={person} slot="start"></IonIcon>
                                <IonLabel>Admin Page</IonLabel>
                            </IonItem>
                        : (userData && userData.roles.admin) && (currentPath !== 'b2c' || 'b2b') ?
                            <IonItem routerLink="b2c" className='text-sm' button={true} detail={false}>
                                <IonIcon className='text-base' aria-hidden="true" icon={person} slot="start"></IonIcon>
                                <IonLabel>User Page</IonLabel>
                            </IonItem>
                        :
                        <></>
                        }
                        
                        <IonItem onClick={() => handleLogout()}  className='text-sm' button={true} detail={false}>
                            <IonIcon className='text-base' aria-hidden="true" icon={power} slot="start"></IonIcon>
                            <IonLabel>Logout</IonLabel>
                        </IonItem>
                    </IonList>
                </IonContent>
            </IonPopover>
        </div>
        
        
    </IonHeader>
  );
};

export default AppHeader;
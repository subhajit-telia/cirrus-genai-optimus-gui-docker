import { IonAvatar, IonButtons, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonMenuButton, IonPage, IonPopover, IonRow, IonTitle, IonToolbar } from '@ionic/react';
import './Header.css';
import { person, power } from 'ionicons/icons';
import { useLocation } from 'react-router-dom';
import logo from '../../theme/assets/logo.png'

interface ContainerProps { }

const AppHeader: React.FC<ContainerProps> = () => {
    const location = useLocation();

    const currentPath = location.pathname.startsWith('/') 
    ? location.pathname.substring(1) 
    : location.pathname;

    console.log('location', location);
  return (
    <IonHeader className='flex px-5 items-center justify-between'>
        <div>
            <IonToolbar>
                {location.pathname === '/home' ?
                    <IonTitle><img className="w-20" src={logo}/></IonTitle>
                : 
                <IonTitle className='capitalize p-0'>{currentPath} List</IonTitle>
                }
                <IonButtons slot="end">
                    <IonMenuButton />
                </IonButtons>
            </IonToolbar>
        </div>
        <div className='grow'>
            {location.pathname === '/home' &&
                <><IonLabel className='mx-1.5 text-sm cursor-pointer border-b-2 border-[#990ae3] pb-1 text-[#990ae3] font-bold'>B2C</IonLabel><IonLabel className='mx-1.5 text-sm cursor-pointer'>B2B</IonLabel></>
            }
        </div>
        <div>
            <IonItem id="cover-trigger" button detail={false} lines="none">
                <IonAvatar className="w-6 h-6" aria-hidden="true" slot="start">
                    <img  alt="" src="https://ionicframework.com/docs/img/demos/avatar.svg" />
                </IonAvatar>
                <IonLabel>Huey</IonLabel>
            </IonItem>
            <IonPopover className='profile-popover' trigger="cover-trigger" side="bottom" alignment="end">
                <IonContent>
                    <IonList className='p-0'>
                        <IonItem className='text-sm' button={true} detail={false}>
                            <IonIcon className='text-base' aria-hidden="true" icon={person} slot="start"></IonIcon>
                            <IonLabel>Profile</IonLabel>
                        </IonItem>
                        <IonItem className='text-sm' button={true} detail={false}>
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
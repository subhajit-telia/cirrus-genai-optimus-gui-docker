import { IonAvatar, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonPage, IonPopover, IonRow, IonTitle, IonToolbar } from '@ionic/react';
import './Header.css';
import { person, power } from 'ionicons/icons';
interface ContainerProps { }

const AppHeader: React.FC<ContainerProps> = () => {
  return (
    <IonHeader className='flex px-5 items-center justify-between'>
        <div>
            <IonToolbar>
                <IonTitle><img className="w-20" src='src/theme/assets/logo.png'/></IonTitle>
            </IonToolbar>
        </div>
        <div className='grow'>
            <IonLabel className='mx-1.5 text-sm cursor-pointer border-b-2 border-[#990ae3] pb-1 text-[#990ae3] font-bold'>B2B</IonLabel>
            <IonLabel className='mx-1.5 text-sm cursor-pointer'>B2C</IonLabel>
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
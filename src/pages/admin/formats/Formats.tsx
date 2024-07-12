import { IonButton, IonCard, IonContent, IonIcon, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonPage, IonSplitPane } from '@ionic/react';
import { useEffect, useState } from 'react';
import AppHeader from '../../../components/header/Header';
import Sidenav from '../../../components/sidenav/Sidenav';
import { createOutline, listCircle, trashOutline } from 'ionicons/icons';
import templateData from '../../../template.json';
import { NetworkInfo } from '../../../routes/network';

interface UserData {
  username: string;
  role: string
}

const Formats: React.FC = () => {
  /* Variables start */
  const [userList, setUserList] = useState<UserData[]>([]);

  useEffect(() => {

    getUsersData();
  }, []);

  /* -------------get users data start------------- */
  const getUsersData = async () => {
    try {
      const urlData = NetworkInfo.URL + '/resource/get?table=users';

      const response = await fetch(urlData);
      const responseData = await response.json();
      console.log("Success:", responseData);
      setUserList(responseData);
    } catch (error: any) {
      console.error("catch failed:", error);
    }
  };
  /* get users data end */

  return (
    <>
    <IonSplitPane contentId="main">
    <Sidenav/>
    <IonPage id="main">
      
      <AppHeader/>
      
      <IonContent className='page-body'>
        
          <IonList className='bg-transparent'>
            {userList.map((item, index) => (
              <IonCard>

              
              <IonItemSliding>
                <IonItem button={true}>
                  <IonLabel>
                    <p className='font-bold'>Username: {item.username}</p>
                    <p>Role: {item.role}</p>
                  </IonLabel>
                  <IonButton slot="end" size="small" color="warning">
                    <IonIcon icon={createOutline}></IonIcon>
                  </IonButton>
                  <IonButton color="danger" slot="end" size="small">
                    <IonIcon icon={trashOutline}></IonIcon>
                  </IonButton>
                </IonItem>
                <IonItemOptions>
                  <IonItemOption color="warning">Edit</IonItemOption>
                  <IonItemOption color="danger">Delete</IonItemOption>
                </IonItemOptions>
              </IonItemSliding>
              </IonCard>
            ))}
          </IonList>
      </IonContent>
    </IonPage>
    </IonSplitPane>
    </>
  );
};

export default Formats;

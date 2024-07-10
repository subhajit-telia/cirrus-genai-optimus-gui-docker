import { IonButton, IonCard, IonContent, IonIcon, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonPage, IonSplitPane } from '@ionic/react';
import { useEffect } from 'react';
import AppHeader from '../../../components/header/Header';
import Sidenav from '../../../components/sidenav/Sidenav';
import { createOutline, listCircle, trashOutline } from 'ionicons/icons';
import templateData from '../../../template.json';

const Users: React.FC = () => {
  /* Variables start */
  

  useEffect(() => {

    
  }, []);

  return (
    <>
    <IonSplitPane contentId="main">
    <Sidenav/>
    <IonPage id="main">
      
      <AppHeader/>
      
      <IonContent className='page-body'>
        
          <IonList className='bg-transparent'>
            {templateData.usersList.map((item, index) => (
              <IonCard>

              
              <IonItemSliding>
                <IonItem button={true}>
                  <IonLabel>{item.email}</IonLabel>
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

export default Users;

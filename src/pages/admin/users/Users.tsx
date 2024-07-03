import { IonContent, IonPage } from '@ionic/react';
import { useEffect } from 'react';
import AppHeader from '../../../components/header/Header';
import Sidenav from '../../../components/sidenav/Sidenav';
const Users: React.FC = () => {
  /* Variables start */
  

  useEffect(() => {

    
  }, []);

  return (
    <>
    <Sidenav/>
    <IonPage id="main">
      
      <AppHeader/>
      
      <IonContent className='page-body'>
            
      </IonContent>
    </IonPage>
    </>
  );
};

export default Users;

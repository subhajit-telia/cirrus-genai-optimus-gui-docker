import { IonContent, IonPage, IonSplitPane } from '@ionic/react';
import { useEffect } from 'react';
import Sidenav from '../../../components/sidenav/Sidenav';
import AppHeader from '../../../components/header/Header';
const Segments: React.FC = () => {
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
            
      </IonContent>
    </IonPage>
    </IonSplitPane>
    </>
  );
};

export default Segments;

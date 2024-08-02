import React from 'react';
import { IonPage, IonContent, IonButton } from '@ionic/react';
import { useHistory } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const history = useHistory();

  return (
    <IonPage>
      <IonContent>
        <div className='not-found'>
            <div>
                <h1 className='text-4xl'>Something went wrong!</h1>
                <p className='mt-6'>The page you are looking for does not exist or you have not permission.</p>
                <IonButton className='mt-6' onClick={() => history.push('/')}>Go to Home</IonButton>
            </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default NotFoundPage;
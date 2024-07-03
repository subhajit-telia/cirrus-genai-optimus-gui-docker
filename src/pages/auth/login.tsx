import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonChip, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonInput, IonInputPasswordToggle, IonLoading, IonPage, IonRow, IonSelect, IonSelectOption, IonSpinner, IonTextarea, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../../components/ExploreContainer';
import AppHeader from '../../components/header/Header';
import { lockClosed, send, sync } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import Tabs from '../../components/tab/Tab';
import templateData from '../../template.json';
import { useForm } from "react-hook-form";
import AWS from 'aws-sdk';
import { HTTPMethod, NetworkInfo } from '../../routes/network';
import './Login.css';
const Login: React.FC = () => {
  /* Variables start */
  

  useEffect(() => {

    
  }, []);

  return (
    <IonPage>
      <IonContent>
            <div className="video-background">
                <video autoPlay muted loop id="background-video">
                    <source src="src/theme/assets/bg-video.mp4" type="video/mp4"></source>
                </video>
            </div>
            <div className="content flex items-center justify-around h-full">
                <div className='content-box'>
                    <p className='text-4xl font-bold'>Welcome to Gen-AI</p>
                </div>
                <div className='login-box py-5 px-4 bg-[#64119478] rounded-lg'>
                    <p className='mb-3.5 text-xl'>Sign In</p>
                    <div>
                        <IonInput className='mb-3.5' label="Email" labelPlacement="stacked" fill="outline"></IonInput>
                        <IonInput className='mb-3.5' type="password" label="Password" labelPlacement="stacked" fill="outline">
                            <IonInputPasswordToggle slot="end"></IonInputPasswordToggle>
                        </IonInput>
                    </div>
                    <p className='mb-3.5 cursor-pointer'>Forgot password?</p>
                    <div className='text-center mb-3.5'>
                        <IonButton type='submit' className='btn-primary' shape="round">
                            {/* {loading && <IonSpinner className='mr-2' name="bubbles"></IonSpinner>} */}
                            Sign in
                        </IonButton>
                    </div>
                </div>
            </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;

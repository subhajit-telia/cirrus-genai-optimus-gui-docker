import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonChip, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonInput, IonInputPasswordToggle, IonLabel, IonLoading, IonPage, IonRow, IonSegment, IonSegmentButton, IonSelect, IonSelectOption, IonSpinner, IonTextarea, IonTitle, IonToolbar } from '@ionic/react';
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
import loginVideo from '../../theme/assets/bg-video.mp4'

interface UserAddModel {
    username: string;
    password: string;
  }

const Login: React.FC = () => {
  /* Variables start */
  const [loading, setLoading] = useState<boolean>(false);
  const [segmentValue, setSegmentValue] = useState('user');

  useEffect(() => {

    
  }, []);

  /* -----------Handle form submit start----------- */
  const handleFormSubmit = async (data: any) => {
    setLoading(true);
    let formUrl = NetworkInfo.URL + '/login/check';
    data.role = [segmentValue];
    console.log('payload', data);
    try {
      const response = await fetch(formUrl, {
        method: HTTPMethod.POST,
        headers: {
            'Content-Type': 'application/json'
          },
        body: JSON.stringify(data),
      });
      const responseData = await response.json();
      console.log("Success:", responseData);

      if (response.ok) {
        setLoading(false);
      }
      
    } catch (error: any) {
      console.error("Login failed:", error);
      setLoading(false);
    }
  };
  /* Handle form submit end */

   /* ------Handle form input field changes start------ */
   const {
    register: register,
    handleSubmit: handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<UserAddModel>({
    defaultValues: {
    },
  });
  /* Handle form input field changes end */

  /* ------------handleSegmentChange start------------ */
  const handleSegmentChange = (event:any) => {
    console.log("handleSegmentChange", event.detail.value);
    setSegmentValue(event.detail.value);
  };
  /* handleSegmentChange end */


  return (
    <IonPage>
      <IonContent>
            <div className="video-background">
                <video autoPlay muted loop id="background-video">
                    <source src={loginVideo} type="video/mp4"></source>
                </video>
            </div>
            <div className="content flex items-center justify-around h-full">
                <div className='content-box'>
                    <p className='text-4xl font-bold'>Welcome to Gen-AI</p>
                </div>
                <div className='login-box py-5 px-4 bg-[#6f139ec7] rounded-lg'>
                    <form onSubmit={handleSubmit(handleFormSubmit)} className="w-full">
                        <div className='flex justify-between'>
                            <p className='mb-3.5 text-xl'>Sign In</p>
                            <IonSegment onIonChange={handleSegmentChange} className='w-36 h-7 bg-white rounded-[50px]' value="user">
                                <IonSegmentButton className='w-20 min-w-0 h-7 min-h-6 ' value="user">
                                    <IonLabel className='m-0 text-xs'>User</IonLabel>
                                </IonSegmentButton>
                                <IonSegmentButton className='w-20 min-w-0 h-7 min-h-6 ' value="admin">
                                    <IonLabel className='m-0 text-xs'>Admin</IonLabel>
                                </IonSegmentButton>
                            </IonSegment>
                        </div>
                        
                        <div>
                            <IonInput className='mb-3.5' label="Email" labelPlacement="stacked" fill="outline"
                                {...register("username", {
                                    validate: {},
                                })}
                            ></IonInput>
                            <IonInput className='mb-3.5' type="password" label="Password" labelPlacement="stacked" fill="outline"
                                {...register("password", {
                                    validate: {},
                                })}
                            >
                                <IonInputPasswordToggle slot="end"></IonInputPasswordToggle>
                            </IonInput>
                        </div>
                        <p className='mb-3.5 cursor-pointer'>Forgot password?</p>
                        <div className='text-center mb-3.5'>
                            <IonButton type='submit' className='btn-primary' shape="round">
                                {loading && <IonSpinner className='mr-2' name="bubbles"></IonSpinner>}
                                Sign in
                            </IonButton>
                        </div>
                    </form>
                </div>
            </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;

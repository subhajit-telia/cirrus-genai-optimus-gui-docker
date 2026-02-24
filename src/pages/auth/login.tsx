import { IonButton, IonContent, IonInput, IonInputPasswordToggle, IonLabel, IonPage, IonSegment, IonSegmentButton, IonSpinner, IonText, IonToast } from '@ionic/react';
import { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { HTTPMethod, NetworkInfo } from '../../routes/network';
import './Login.css';
import loginVideo from '../../theme/assets/bg-video.mp4'
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../config/AuthContext';
import LoginButton from '../../components/loginbutton/LoginButton';

interface UserAddModel {
    username: string;
    password: string;
  }

const Login: React.FC = () => {
  /* Variables start */
  const [loading, setLoading] = useState<boolean>(false);
  const [isShowError, setIsShowError] = useState(false);
  const [isErrorMsg, setIsErrorMsg] = useState('');
  const [segmentValue, setSegmentValue] = useState('tcad');
  const history = useHistory();
  const { login } = useAuth();
  const apiUrl = `${NetworkInfo.URL}`;

  useEffect(() => {
    console.log(`Using API URL: ${apiUrl}`);
    
  }, []);

  const handleLogin = (_role:string) => {
    login(_role);
    history.push('/b2c');
    
  };

  /* -----------Handle form submit start----------- */
  const handleFormSubmit = async (data: any) => {
    setLoading(true);
    let formUrl:any;
    // console.log('payload', data);
    // console.log('segmentValue', segmentValue);

    if (segmentValue === 'tcad') {
      formUrl = apiUrl + '/tcad_login/check';
    }else {
      formUrl = apiUrl + '/login/check';
    }

    try {
      const response = await fetch(formUrl, {
        method: HTTPMethod.POST,
        headers: {
            'Content-Type': 'application/json'
          },
        body: JSON.stringify(data),
      });
      const responseData = await response.json();
      // console.log("Success:", responseData);

      if (response.ok) {
        setLoading(false);
        if (responseData.verification === true) {
          // console.log('login');
          localStorage.setItem('user', JSON.stringify(responseData));
          setIsShowError(true);
          if (responseData.roles.admin === true && responseData.roles.user === true) {
            handleLogin('admin');
            setIsErrorMsg('Logged in as admin');
          }else if (responseData.roles.admin === true) {
            handleLogin('admin');
            setIsErrorMsg('Logged in as admin');
          }else if (responseData.roles.user === true) {
            handleLogin('user');
            setIsErrorMsg('Logged in as user');
          }else {
            setIsErrorMsg('Please check your credential.');
          }
        }else {
          // console.log('login faild');
          setIsShowError(true);
          setIsErrorMsg('Please check your credential.');
        }
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
    // console.log("handleSegmentChange", event.detail.value);
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
            <div className="content flex justify-around flex-col sm:flex-row h-full">
                <div className='content-box'>
                    <p className='md:text-8xl text-3xl font-bold text-white'>Welcome to Optimus</p>
                </div>
                <div className='login-box size-[40%] py-5 px-4 bg-[#6f139ec7] rounded-lg'>
                    <form onSubmit={handleSubmit(handleFormSubmit)} className="w-full">
                        <div className='flex flex-col items-center mb-5'>
                            <p className='mb-3.5 text-xl text-white text-start'>Choose your login method</p>
                            <IonSegment onIonChange={handleSegmentChange} className='size-min h-7 bg-white rounded-[50px]' value={segmentValue}>
                                <IonSegmentButton className='size-min min-w-0 h-7 min-h-6' value="tcad">
                                    <IonLabel className='m-0 text-xs'>TCAD</IonLabel>
                                </IonSegmentButton>
                                <IonSegmentButton className='size-min min-w-0 h-7 min-h-6' value="appId">
                                    <IonLabel className='m-0 text-xs'>APP ID</IonLabel>
                                </IonSegmentButton>
                                
                                {/* <LoginButton /> */}
                            </IonSegment>
                        </div>
                        
                        <div>
                            <IonInput className='text-white' label="Username" labelPlacement="stacked" fill="outline"
                                {...register("username", {
                                    required: "Username is required",
                                    validate: {},
                                })}
                                onIonInput={(e:any) => setValue("username", e.detail.value)}
                            ></IonInput>
                            <IonText color="warning"  className='text-xs mb-3.5 block'>{errors?.["username"]?.message} </IonText>
                            <IonInput className='text-white' type="password" label="Password" labelPlacement="stacked" fill="outline"
                                {...register("password", {
                                    required: "Password is required",
                                    validate: {},
                                })}
                                onIonInput={(e:any) => setValue("password", e.detail.value)}
                            >
                                <IonInputPasswordToggle slot="end"></IonInputPasswordToggle>
                            </IonInput>
                            <IonText color="warning"  className='text-xs mb-3.5 block'>{errors?.["password"]?.message} </IonText>
                        </div>
                        <div className='text-center mb-3.5'>
                            <IonButton type='submit' className='btn-primary' shape="round">
                                {loading && <IonSpinner className='mr-2' name="bubbles"></IonSpinner>}
                                Sign in
                            </IonButton>
                        </div>
                    </form>
                </div>
            </div>
        <IonToast
          className='custom-toast'
          isOpen={isShowError}
          message={isErrorMsg}
          duration={3000}
          onDidDismiss={() => setIsShowError(false)}
        ></IonToast>
      </IonContent>
    </IonPage>
  );
};

export default Login;

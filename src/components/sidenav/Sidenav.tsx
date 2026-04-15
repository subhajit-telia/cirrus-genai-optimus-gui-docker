import {
  IonButton,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonMenu,
    IonMenuToggle,
    IonSpinner,
    IonTitle,
    IonToolbar,
  } from '@ionic/react';
  
  import { useLocation } from 'react-router-dom';
  import { codeWorkingOutline, colorFilter, listOutline, optionsOutline, peopleOutline, settings, sync, trailSignOutline } from 'ionicons/icons';
  import './Sidenav.css';
import { NetworkInfo } from '../../routes/network';
import { useState } from 'react';
import logo from '../../theme/assets/logo.png'
import teliaOptimus from '../../theme/assets/telia-optimus.png'
  
  interface AppPage {
    url: string;
    iosIcon: string;
    mdIcon: string;
    title: string;
  }
  
  const appPages: AppPage[] = [
    {
      title: 'Formats',
      url: '/formats',
      iosIcon: optionsOutline,
      mdIcon: optionsOutline
    },
    {
      title: 'Prompts',
      url: '/prompts',
      iosIcon: codeWorkingOutline,
      mdIcon: codeWorkingOutline
    },
    {
      title: 'Purpose',
      url: '/purpose',
      iosIcon: trailSignOutline,
      mdIcon: trailSignOutline
    },
    {
      title: 'Segments',
      url: '/segments',
      iosIcon: listOutline,
      mdIcon: listOutline
    },
    {
      title: 'Examples',
      url: '/examples',
      iosIcon: colorFilter,
      mdIcon: colorFilter
    },
    {
      title: 'Configuration',
      url: '/config',
      iosIcon: settings,
      mdIcon: settings
    }
  ];
  
  const Sidenav: React.FC = () => {
    const location = useLocation();
    const [loading, setLoading] = useState<boolean>(false);
    const [btnMsg, setBtnMsg] = useState('Sync to S3');

    /* -------------get Config data start------------- */
  // const syncToS3 = async () => {
  //   setBtnMsg('Sync.....');
  //   setLoading(true);
  //   try {
  //     const urlData = NetworkInfo.URL + '/sync_from_s3';

  //     const response = await fetch(urlData);
  //     const responseData = await response.json();
  //     console.log("Success:", responseData);

  //     if (response.ok && responseData === true) {
  //       setBtnMsg('Sync Done.');
  //       setLoading(false);

  //       setTimeout(() => {
  //         setBtnMsg('Sync to S3');
  //       }, 3000);
  //     }else {
  //       setBtnMsg('Sync Failed!');
  //       setLoading(false);
  //     }
      
  //   } catch (error: any) {
  //     console.error("catch failed:", error);
  //     setLoading(false);
  //   }
  // };
  /* get config data end */
  
    return (
      <IonMenu className='md:max-w-48' contentId="main" type="overlay">
        <IonHeader className="ion-no-border px-5">
          <IonToolbar>
            <img src={teliaOptimus} />
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonList id="inbox-list">
            {appPages.map((appPage, index) => {
              return (
                <IonMenuToggle key={index} autoHide={false}>
                  <IonItem className={location.pathname === appPage.url ? 'selected' : ''} routerLink={appPage.url} routerDirection="none" lines="none" detail={false}>
                    <IonIcon aria-hidden="true" slot="start" ios={appPage.iosIcon} md={appPage.mdIcon} />
                    <IonLabel>{appPage.title}</IonLabel>
                  </IonItem>
                </IonMenuToggle>
              );
            })}
          </IonList>
          {/* <IonButton onClick={() => syncToS3()} className='btn-primary' expand="block" shape="round">
              {loading ?
                <IonSpinner className='mr-2' name="bubbles"></IonSpinner>
                :
                <IonIcon aria-hidden="true" slot="start" ios={sync} md={sync} />
              }
              {btnMsg}
          </IonButton> */}
        </IonContent>
      </IonMenu>
    );
  };
  
  export default Sidenav;
  
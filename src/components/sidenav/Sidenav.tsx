import {
    IonContent,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonMenu,
    IonMenuToggle,
    IonNote,
  } from '@ionic/react';
  
  import { useLocation } from 'react-router-dom';
  import { archiveOutline, archiveSharp, bookmarkOutline, codeWorkingOutline, heartOutline, heartSharp, listOutline, mailOutline, mailSharp, optionsOutline, paperPlaneOutline, paperPlaneSharp, peopleOutline, trailSignOutline, trashOutline, trashSharp, warningOutline, warningSharp } from 'ionicons/icons';
  import './Sidenav.css';
  
  interface AppPage {
    url: string;
    iosIcon: string;
    mdIcon: string;
    title: string;
  }
  
  const appPages: AppPage[] = [
    {
      title: 'Users',
      url: '/users',
      iosIcon: peopleOutline,
      mdIcon: peopleOutline
    },
    {
      title: 'Channels',
      url: '/channels',
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
  ];
  
  const Sidenav: React.FC = () => {
    const location = useLocation();
  
    return (
      <IonMenu className='md:max-w-48' contentId="main" type="overlay">
        <IonContent>
          <IonList id="inbox-list">
            <IonListHeader className='mb-8'>
              <img className="w-20" src='src/theme/assets/logo.png'/>
            </IonListHeader>
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
        </IonContent>
      </IonMenu>
    );
  };
  
  export default Sidenav;
  
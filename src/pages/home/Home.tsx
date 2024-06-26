import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonChip, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonInput, IonPage, IonRow, IonSelect, IonSelectOption, IonTextarea, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../../components/ExploreContainer';
import './Home.css';
import AppHeader from '../../components/header/Header';
import { lockClosed, send } from 'ionicons/icons';
import { useState } from 'react';
import Tabs from '../../components/tab/Tab';

type ActiveChipsState = {
  [key: string]: boolean;
};

interface Tab {
  id: number;
  label: string;
  content: JSX.Element; // Assuming content is JSX.Element (React node)
}

const Home: React.FC = () => {
  /* Variables start */
  const [activeChips, setActiveChips] = useState<ActiveChipsState>({});

  const tabs: Tab[] = [
    {
      id: 1,
      label: 'Tab 1',
      content: <div>Content of Tab 1</div>,
    },
    {
      id: 2,
      label: 'Tab 2',
      content: <div>Content of Tab 2</div>,
    },
    {
      id: 3,
      label: 'Tab 3',
      content: <div>Content of Tab 3</div>,
    },
  ];

  /* onClickSegment start */
  const onClickSegment = (id: string) => {
    setActiveChips(prevState => ({
        ...prevState,
        [id]: !prevState[id]  // Toggle the boolean value
    }));


    console.log('activeChips', activeChips)
};
  /* onClickSegment end */



  return (
    <IonPage>
      <AppHeader/>
      <IonContent className='page-body'>
        <div className='max-w-[80%] m-auto relative'>
          <div className='text-center'>
            <img className='m-auto' src='src/theme/assets/optimus-logo.png' />
            <p>AI-assistance</p>
          </div>
          <IonGrid>
            <IonRow>
              <IonCol size="4">
                <IonCard className='rounded-xl text-[#000]'>
                  <IonCardHeader>
                    <IonCardSubtitle className='font-bold'>I want to create a...</IonCardSubtitle>
                  </IonCardHeader>

                  <IonCardContent>
                    <IonSelect className='min-h-10 field-item' label="Select desired format below" multiple={true} interface="popover" labelPlacement="floating" fill="outline">
                      <IonSelectOption value="sms">SMS</IonSelectOption>
                      <IonSelectOption value="email">Email</IonSelectOption>
                      <IonSelectOption value="puff">Puff to website</IonSelectOption>
                      <IonSelectOption value="appmedelande">App mediation</IonSelectOption>
                      <IonSelectOption value="epost">Epost (Hero area)</IonSelectOption>
                    </IonSelect>
                  </IonCardContent>
                </IonCard>
              </IonCol>
              <IonCol size="4">
                <IonCard className='rounded-xl text-[#000]'>
                  <IonCardHeader>
                    <IonCardSubtitle className='font-bold'>With the purpose...</IonCardSubtitle>
                  </IonCardHeader>

                  <IonCardContent>
                    <IonSelect className='min-h-10 field-item' label="Which product/offer do you want to report on?" interface="popover" labelPlacement="floating" fill="outline">
                      <IonSelectOption value="upsell">Upsell</IonSelectOption>
                      <IonSelectOption value="crosssell">Cross sell</IonSelectOption>
                      <IonSelectOption value="new">New customer</IonSelectOption>
                    </IonSelect>
                  </IonCardContent>
                </IonCard>
              </IonCol>
              <IonCol size="4">
                <IonCard className='rounded-xl text-[#000]'>
                  <IonCardHeader>
                    <IonCardSubtitle className='font-bold'>About...</IonCardSubtitle>
                  </IonCardHeader>

                  <IonCardContent>
                    <IonInput className='!min-h-10 field-item' label="Which product/offer do you want to report on?" labelPlacement="floating" fill="outline" placeholder="Enter text"></IonInput>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
          <p className='text-center'>I want to create versions to the following segments</p>
          <div className='segments flex items-center justify-center mt-2.5'>
            <IonChip onClick={() => onClickSegment('chip1')} className={`${activeChips['chip1']} mx-2.5 min-h-6 py-0 bg-[#f5e0ff] text-[#4a2a59]`}>Optimizers</IonChip>
            <IonChip onClick={() => onClickSegment('chip2')} className={`${activeChips['chip2']} mx-2.5 min-h-6 py-0 bg-[#f5e0ff] text-[#4a2a59]`}>Maximizers</IonChip>
            <IonChip onClick={() => onClickSegment('chip3')} className={`${activeChips['chip3']} mx-2.5 min-h-6 py-0 bg-[#f5e0ff] text-[#4a2a59]`}>Support seekers</IonChip>
            <IonChip onClick={() => onClickSegment('chip4')} className={`${activeChips['chip4']} mx-2.5 min-h-6 py-0 bg-[#f5e0ff] text-[#4a2a59]`}>Rationals</IonChip>
            <IonChip onClick={() => onClickSegment('chip5')} className={`${activeChips['chip5']} mx-2.5 min-h-6 py-0 bg-[#f5e0ff] text-[#4a2a59]`}>Techies</IonChip>
          </div>
          <div className='text-center mt-6'>
            <IonButton className='btn-primary' shape="round">Start the magic</IonButton>
          </div>
          <div className="container mx-auto p-4">
            <h1 className="text-xl font-bold mb-4">Tabs Example</h1>
            <Tabs tabs={tabs} />
          </div>

          <IonGrid className=' bottom-0 left-0 right-0 max-w-[80%] m-auto'>
            <IonRow>
              <IonCol>
                <IonTextarea
                  className='bottom-textarea rounded-xl mx-2.5'
                  aria-label="Custom textarea"
                  placeholder="Write your own promt."
                  autoGrow={true}
                  counter={true}
                  maxlength={2000}
                >
                  <IonButton size="small" fill="clear" slot="end">
                    <IonIcon className='text-primary' slot="icon-only" icon={send}></IonIcon>
                  </IonButton>
                </IonTextarea>
              </IonCol>
            </IonRow>
          </IonGrid>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;

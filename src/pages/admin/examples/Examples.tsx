import { IonAlert, IonButton, IonButtons, IonCard, IonCheckbox, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInput, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonModal, IonPage, IonProgressBar,    IonSpinner, IonSplitPane, IonTextarea, IonTitle, IonToolbar } from '@ionic/react';
import { useEffect, useRef, useState } from 'react';
import AppHeader from '../../../components/header/Header';
import Sidenav from '../../../components/sidenav/Sidenav';
import { add, closeOutline, createOutline, listCircle, trashOutline } from 'ionicons/icons';
import templateData from '../../../template.json';
import { HTTPMethod, NetworkInfo } from '../../../routes/network';
import { OverlayEventDetail } from '@ionic/core/components';
import { useForm } from 'react-hook-form';

interface ExampleAddModel {
  example: string;
  example_id: string;
  segment_id: string;
  purpose_id: string;
  format_id: string;
  user_prompt: string;
  b2b: number | boolean;
  b2c: number | boolean;
}

const Examples: React.FC = () => {
  /* Variables start */
  const [exampleList, setExampleList] = useState<ExampleAddModel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const modal = useRef<HTMLIonModalElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [targetIndex, setTargetIndex] = useState<number>();

  useEffect(() => {

    getExamplesData();
  }, []);

  /* -------------get Examples data start------------- */
  const getExamplesData = async () => {
    setLoading(true);
    try {
      const urlData = NetworkInfo.URL + '/resource/get?table=examples';

      const response = await fetch(urlData);
      const responseData = await response.json();
      console.log("Success:", responseData);

      if (response.ok) {
        setExampleList(responseData);
        setLoading(false);
      }
      
    } catch (error: any) {
      console.error("catch failed:", error);
      setLoading(false);
    }
  };
  /* get examples data end */

  /* modal functions start */

  const onModalDismiss = () => {
    setIsOpenModal(false);
    setIsEdit(false);
    setValue("example", '');
    setValue("example_id", '');
    setValue("segment_id", '');
    setValue("purpose_id", '');
    setValue("format_id", '');
    setValue("user_prompt", '');
    setValue("b2b", false);
    setValue("b2c", false);
  }

  const handleDeleteAleart = (_indicator:boolean, _value:number) => {
    if (_indicator === true) {
      setIsOpen(true);
      setTargetIndex(_value);
    }else if (_indicator === false) {
      let updatedExamples = exampleList;

      let delIndex:any = targetIndex;
      updatedExamples.splice(delIndex, 1);

      console.log('updatedExamples', updatedExamples);
      setIsOpen(false);
      handleExamplesUpdate(updatedExamples);
    }

  }
  
  /* modal functions end */

  /* handle edit start */
  const handleEdit = (_value:any, _index:number) => {
    console.log('_value', _value);
    setValue("example", _value.example);
    setValue("example_id", _value.example_id);
    setValue("segment_id", _value.segment_id);
    setValue("purpose_id", _value.purpose_id);
    setValue("format_id", _value.format_id);
    setValue("user_prompt", _value.user_prompt);

    if (_value.b2b === 1) {
      setValue("b2b", true);
    }else {
      setValue("b2b", false);
    }
    if (_value.b2c === 1) {
      setValue("b2c", true);
    }else {
      setValue("b2b", false);
    }

    setIsOpenModal(true);
    setIsEdit(true);
    setTargetIndex(_index);
  }
  /* handle edit end */
  
  /* check password hashed or not start */
  const isBcryptHash = (password:any) => {
    return typeof password === 'string' && password.length === 60 && (password.startsWith('$2a$') || password.startsWith('$2b$') || password.startsWith('$2y$'));
  };
  /* check password hashed or not end */

  /* -----------Handle form submit start----------- */
  const handleFormSubmit = async (data: any) => {
    console.log('handleFormSubmit', data);
    let payLoad:any = {};
    payLoad.example_name = data.example_name;
    payLoad.example_definition = data.example_definition;
    payLoad.example_id = `${data.example_name.replace(/\s+/g, '')}`;

    if (data.b2b === true) {
      payLoad.b2b = 1;
    }else {
      payLoad.b2b = 0;
    }

    if (data.b2c === true) {
      payLoad.b2c = 1;
    }else {
      payLoad.b2c = 0;
    }

    

    let prevExampleList = exampleList;
    let index:any = targetIndex;

    console.log('finalData', payLoad);
    if (isEdit === true) {
      prevExampleList.splice(index, 1, payLoad);
    }else {
      prevExampleList = [...exampleList, payLoad];
    }

    
    console.log('prevList', prevExampleList);

    handleExamplesUpdate(prevExampleList);
  }
  const handleExamplesUpdate = async (allExample: ExampleAddModel[]) => {
    setLoading(true);
    let formUrl = NetworkInfo.URL + '/resource/put';
    console.log('payload', allExample);

    let updatedExamples = allExample;

    let finalPayload = {
      table: "examples",
      json_obj: updatedExamples
    }
    
    try {
      const response = await fetch(formUrl, {
        method: HTTPMethod.PUT,
        headers: {
            'Content-Type': 'application/json'
          },
        body: JSON.stringify(finalPayload),
      });
      const responseData = await response.json();
      console.log("Success:", responseData);

      if (response.ok && responseData === true) {
        reset();
        setLoading(false);
        setIsEdit(false);
        setTargetIndex(-1);
        getExamplesData();
        onModalDismiss();
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
  } = useForm<ExampleAddModel>({
    defaultValues: {
      b2b: false,
      b2c: false,
    },
  });
  const isB2b = watch('b2b');
  const isB2c = watch('b2c');
  /* Handle form input field changes end */

  return (
    <>
    <IonSplitPane contentId="main">
    <Sidenav/>
    <IonPage id="main">
      
      <AppHeader/>
      
      <IonContent className='page-body'>
        {loading && 
        <IonProgressBar type="indeterminate"></IonProgressBar>
        }
        
          <IonList className='bg-transparent'>
            {exampleList.map((item, index) => (
              <IonCard key={index}>
                <IonItemSliding>
                  <IonItem button={true}>
                    <IonLabel>
                      <p className='font-bold'>Example name: {item.example}</p>
                      <p>
                        Is B2B: {item.b2b === 1 ? 'Yes' : item.b2b === 0 ? 'No' : 'invalid value'}
                      </p>
                      <p>
                        Is B2C: {item.b2c === 1 ? 'Yes' : item.b2c === 0 ? 'No' : 'invalid value'}
                      </p>
                      <p>Example Definition: {item.example}</p>
                    </IonLabel>
                    <IonButton id="open-modal" onClick={() => handleEdit(item, index)} slot="end" size="small" color="warning">
                      <IonIcon icon={createOutline}></IonIcon>
                    </IonButton>
                    <IonButton onClick={() => handleDeleteAleart(true, index)} color="danger" slot="end" size="small">
                      <IonIcon icon={trashOutline}></IonIcon>
                    </IonButton>
                  </IonItem>
                  <IonItemOptions>
                    <IonItemOption id="open-modal" onClick={() => handleEdit(item, index)} color="warning">Edit</IonItemOption>
                    <IonItemOption onClick={() => handleDeleteAleart(true, index)} color="danger">Delete</IonItemOption>
                  </IonItemOptions>
                </IonItemSliding>
              </IonCard>
            ))}
          </IonList>

          {/* modal start */}
          <IonModal id="example-modal" isOpen={isOpenModal} onWillDismiss={() => onModalDismiss()}>
            <IonHeader>
              <IonToolbar>
                <IonTitle className='text-sm font-bold'>Examples Add & Edit</IonTitle>
                <IonButtons slot="end">
                  <IonButton size="small" shape="round" onClick={() => onModalDismiss()}>
                    <IonIcon slot="icon-only" icon={closeOutline}></IonIcon>
                  </IonButton>
                </IonButtons>
              </IonToolbar>
            </IonHeader>
            <div className="ion-padding">
              <form onSubmit={handleSubmit(handleFormSubmit)} className="w-full">
                <IonInput className='mb-4 text-sm' label="Example Name" labelPlacement="floating" fill="outline" placeholder="Enter Example Name"
                  {...register("example", {
                    validate: {},
                  })}
                ></IonInput>

                <IonTextarea
                  className='mb-4 text-sm'
                  label="Example Definition"
                  labelPlacement="floating"
                  fill="outline"
                  placeholder="Enter class definition"
                  autoGrow={true}
                  {...register("example", {
                    validate: {},
                  })}
                ></IonTextarea>

                <div className='flex justify-between mb-4 text-sm'>
                  <IonCheckbox 
                    {...register("b2b", {
                      validate: {},
                    })}
                    checked={isB2b as boolean}
                    onIonChange={(event: any) => {
                      console.log('event', event.detail.checked);
                      setValue("b2b", event.detail.checked);
                    }}
                    labelPlacement="start">Is B2B</IonCheckbox>

                  <IonCheckbox 
                    {...register("b2c", {
                      validate: {},
                    })}
                    checked={isB2c as boolean}
                    onIonChange={(event: any) => {
                      console.log('event', event.detail.checked);
                      setValue("b2c", event.detail.checked);
                    }}
                    labelPlacement="start">Is B2C</IonCheckbox>
                </div>
                
                <div className='text-center'>
                  <IonButton size='small' type='submit' className='btn-primary' shape="round">
                    {loading && <IonSpinner className='mr-2' name="bubbles"></IonSpinner>}
                    Save
                  </IonButton>
                  <IonButton onClick={() => onModalDismiss()} size='small' type='reset' fill='outline' shape="round">
                    Cancel
                  </IonButton>
                </div>
              </form>
            </div>
          </IonModal>
          {/* modal end */}

          {/* aleart start */}
          <IonAlert
            isOpen={isOpen}
            header="Delete example!"
            subHeader="Are you want to delete this example?"
            trigger="present-alert"
            buttons={[
              {
                text: 'Cancel',
                role: 'cancel',
                handler: () => {
                  setIsOpen(false)
                  console.log('Alert canceled');
                },
              },
              {
                text: 'Delete',
                role: 'confirm',
                handler: () => {
                  handleDeleteAleart(false, 0);
                  console.log('Alert confirmed');
                },
              },
            ]}
            onDidDismiss={({ detail }) => console.log(`Dismissed with role: ${detail.role}`)}
          ></IonAlert>
          {/* aleart end */}

          <IonFab slot="fixed" vertical="bottom" horizontal="end">
            <IonFabButton size="small" onClick={() => setIsOpenModal(true)}>
              <IonIcon icon={add}></IonIcon>
            </IonFabButton>
          </IonFab>
      </IonContent>
    </IonPage>
    </IonSplitPane>
    </>
  );
};

export default Examples;

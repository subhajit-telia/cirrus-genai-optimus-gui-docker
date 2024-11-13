import { IonAlert, IonButton, IonButtons, IonCard, IonCheckbox, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInput, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonModal, IonPage, IonProgressBar, IonSpinner, IonSplitPane, IonTextarea, IonTitle, IonToast, IonToolbar } from '@ionic/react';
import { useEffect, useRef, useState } from 'react';
import AppHeader from '../../../components/header/Header';
import Sidenav from '../../../components/sidenav/Sidenav';
import { add, closeOutline, createOutline, trashOutline } from 'ionicons/icons';
import { HTTPMethod, NetworkInfo } from '../../../routes/network';
import { useForm } from 'react-hook-form';

interface PurposeAddModel {
  purpose_name: string;
  purpose_id: string;
  purpose_definition: string;
  purpose_written_description: string;
  b2b: number | boolean;
  b2c: number | boolean;
}

const Purpose: React.FC = () => {
  /* Variables start */
  const [purposeList, setPurposeList] = useState<PurposeAddModel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const modal = useRef<HTMLIonModalElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [targetIndex, setTargetIndex] = useState<number>();
  const [isShowError, setIsShowError] = useState(false);
  const [isErrorMsg, setIsErrorMsg] = useState('');
  const apiUrl = `${NetworkInfo.URL}`;

  useEffect(() => {

    getPurposesData();
  }, []);

  /* -------------get Purposes data start------------- */
  const getPurposesData = async () => {
    setLoading(true);
    try {
      const urlData = apiUrl + '/resource/get?table=purposes';

      const response = await fetch(urlData, {
        method: 'GET',
        headers: {
          '"removed"': `${NetworkInfo.ACCESSTOKEN}`,
          'Content-Type': 'application/json',
        },
      });
      const responseData = await response.json();
      console.log("Success:", responseData);

      if (response.ok) {
        setPurposeList(responseData);
        setLoading(false);
      }
      
    } catch (error: any) {
      console.error("catch failed:", error);
      setLoading(false);
    }
  };
  /* get purposes data end */

  /* modal functions start */

  const onModalDismiss = () => {
    setIsOpenModal(false);
    setIsEdit(false);
    setValue("purpose_definition", '');
    setValue("purpose_written_description", '');
    setValue("purpose_name", '');
    setValue("b2b", false);
    setValue("b2c", false);
  }

  const handleDeleteAleart = (_indicator:boolean, _value:number) => {
    if (_indicator === true) {
      setIsOpen(true);
      setTargetIndex(_value);
    }else if (_indicator === false) {
      let updatedPurposes = purposeList;

      let delIndex:any = targetIndex;
      updatedPurposes.splice(delIndex, 1);

      console.log('updatedPurposes', updatedPurposes);
      setIsOpen(false);
      handlePurposesUpdate(updatedPurposes);
    }

  }
  
  /* modal functions end */

  /* handle edit start */
  const handleEdit = (_value:any, _index:number) => {
    console.log('_value', _value);
    setValue("purpose_definition", _value.purpose_definition);
    setValue("purpose_written_description", _value.purpose_written_description);
    setValue("purpose_name", _value.purpose_name);
    setValue("purpose_id", _value.purpose_id);

    if (_value.b2b === 1) {
      setValue("b2b", true);
    }else {
      setValue("b2b", false);
    }
    if (_value.b2c === 1) {
      setValue("b2c", true);
    }else {
      setValue("b2c", false);
    }

    setIsOpenModal(true);
    setIsEdit(true);
    setTargetIndex(_index);
  }
  /* handle edit end */

  /* -----------Handle form submit start----------- */
  const handleFormSubmit = async (data: any) => {
    console.log('handleFormSubmit', data);
    let payLoad:any = {};
    payLoad.purpose_name = data.purpose_name;
    payLoad.purpose_definition = data.purpose_definition;
    payLoad.purpose_written_description = data.purpose_written_description;
    

    if (isEdit) {
      payLoad.purpose_id = getValues("purpose_id");
    }else {
      payLoad.purpose_id = `${data.purpose_name.replace(/\s+/g, '')}`;
    }

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

    

    let prevPurposeList = purposeList;
    let index:any = targetIndex;

    console.log('finalData', payLoad);
    if (isEdit === true) {
      prevPurposeList.splice(index, 1, payLoad);
    }else {
      prevPurposeList = [...purposeList, payLoad];
    }

    
    console.log('prevList', prevPurposeList);

    handlePurposesUpdate(prevPurposeList);
  }
  const handlePurposesUpdate = async (allPurpose: PurposeAddModel[]) => {
    setLoading(true);
    let formUrl = apiUrl + '/resource/put';
    console.log('payload', allPurpose);

    let updatedPurposes = allPurpose;

    let finalPayload = {
      table: "purposes",
      json_obj: updatedPurposes
    }
    
    try {
      const response = await fetch(formUrl, {
        method: HTTPMethod.PUT,
        headers: {
          '"removed"': `${NetworkInfo.ACCESSTOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(finalPayload),
      });
      const responseData = await response.json();
      console.log("Success:", responseData);

      if (response.ok) {
        if (responseData.ErrorMessage) {
          console.error("Error response:", responseData);
          setIsShowError(true);
          setIsErrorMsg(responseData.ErrorMessage);
          setLoading(false);
          
        }else {
          setIsShowError(true);
          setIsErrorMsg(responseData);
          reset();
          setLoading(false);
          setIsEdit(false);
          setTargetIndex(-1);
          getPurposesData();
          onModalDismiss();
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
    getValues,
    watch,
    formState: { errors }
  } = useForm<PurposeAddModel>({
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
            {purposeList.map((item, index) => (
              <IonCard key={index}>
                <IonItemSliding>
                  <IonItem button={true}>
                    <IonLabel>
                      <p className='font-bold'>Purpose name: {item.purpose_name}</p>
                      <p>Purpose Description: {item.purpose_written_description}</p>
                      <p>
                        B2B: {item.b2b === 1 ? 'Yes' : item.b2b === 0 ? 'No' : 'invalid value'}
                      </p>
                      <p>
                        B2C: {item.b2c === 1 ? 'Yes' : item.b2c === 0 ? 'No' : 'invalid value'}
                      </p>
                      <p>Purpose Definition: {item.purpose_definition}</p>
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
                <IonTitle className='text-sm font-bold'>Purposes Add & Edit</IonTitle>
                <IonButtons slot="end">
                  <IonButton size="small" shape="round" onClick={() => onModalDismiss()}>
                    <IonIcon slot="icon-only" icon={closeOutline}></IonIcon>
                  </IonButton>
                </IonButtons>
              </IonToolbar>
            </IonHeader>
            <div className="ion-padding">
              <form onSubmit={handleSubmit(handleFormSubmit)} className="w-full">
                <IonInput className='mb-4 text-sm' label="Purpose Name" labelPlacement="floating" fill="outline" placeholder="Enter Purpose Name"
                  {...register("purpose_name", {
                    validate: {},
                  })}
                ></IonInput>

                <IonInput className='mb-4 text-sm' label="Purpose Description" labelPlacement="floating" fill="outline" placeholder="Enter Purpose Description"
                  {...register("purpose_written_description", {
                    validate: {},
                  })}
                ></IonInput>

                <IonTextarea
                  className='mb-4 text-sm'
                  label="Purpose Definition"
                  labelPlacement="floating"
                  fill="outline"
                  placeholder="Enter class definition"
                  autoGrow={true}
                  {...register("purpose_definition", {
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
                    labelPlacement="start">B2B</IonCheckbox>

                  <IonCheckbox 
                    {...register("b2c", {
                      validate: {},
                    })}
                    checked={isB2c as boolean}
                    onIonChange={(event: any) => {
                      console.log('event', event.detail.checked);
                      setValue("b2c", event.detail.checked);
                    }}
                    labelPlacement="start">B2C</IonCheckbox>
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
            header="Delete purpose!"
            subHeader="Are you want to delete this purpose?"
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

          <IonToast
            className='custom-toast'
            isOpen={isShowError}
            message={isErrorMsg}
            duration={3000}
            onDidDismiss={() => setIsShowError(false)}
          ></IonToast>
      </IonContent>
    </IonPage>
    </IonSplitPane>
    </>
  );
};

export default Purpose;

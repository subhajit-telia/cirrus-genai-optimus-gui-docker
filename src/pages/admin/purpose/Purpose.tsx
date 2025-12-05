import { IonAlert, IonButton, IonButtons, IonCard, IonCheckbox, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInput, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonModal, IonPage, IonProgressBar, IonSelect, IonSelectOption, IonSpinner, IonSplitPane, IonTextarea, IonTitle, IonToast, IonToolbar } from '@ionic/react';
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
  use_cases: string[];
  user_id: string;
  status: string;
  version_number: number;
  purpose_version_id: string;
  updated_at: string;
}

const Purpose: React.FC = () => {
  /* Variables start */
  const [purposeList, setPurposeList] = useState<PurposeAddModel[]>([]);
  const [purposeVersionList, setPurposeVersionList] = useState<PurposeAddModel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const modal = useRef<HTMLIonModalElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [targetItem, setTargetItem] = useState<PurposeAddModel>();
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
      const urlData = apiUrl + '/resource/purpose';

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

  const onChangeVersion = (version: number) => {
    const matchedVersion = purposeVersionList.find(purpose => purpose.version_number === version);
    console.log('matchedVersion', matchedVersion);
    handleEdit(matchedVersion);
  };

  const handleDeleteAleart = (_indicator:boolean, _value:PurposeAddModel) => {
    setIsEdit(true);
    if (_indicator === true) {
      setIsOpen(true);
      setTargetItem(_value);
    }else if (_indicator === false) {

      console.log('updatedPurposes', targetItem);
      setIsOpen(false);
      handlePurposesUpdate(targetItem as PurposeAddModel, 'delete');
    }

  }
  
  /* modal functions end */

  /* handle edit start */
  const handleEdit = (_value:any) => {
    console.log('_value', _value);
    const matchedPurpose = purposeList.filter(purpose => purpose.purpose_id === _value.purpose_id);
    console.log('matchedPurpose', matchedPurpose);
    setPurposeVersionList(purposeList.filter(purpose => purpose.purpose_id === _value.purpose_id));

    setValue("purpose_definition", _value.purpose_definition);
    setValue("purpose_written_description", _value.purpose_written_description);
    setValue("purpose_name", _value.purpose_name);
    setValue("purpose_id", _value.purpose_id);
    setValue("purpose_version_id", _value.purpose_version_id);

    if (_value.use_cases && _value.use_cases.includes("b2b")) {
      setValue("b2b", true);
    } else {
      setValue("b2b", false);
    }
    if (_value.use_cases && _value.use_cases.includes("b2c")) {
      setValue("b2c", true);
    } else {
      setValue("b2c", false);
    }

    setIsOpenModal(true);
    setIsEdit(true);
    setTargetItem(_value);
  }
  /* handle edit end */

  /* -----------Handle form submit start----------- */
  const handleFormSubmit = async (data: any) => {
    console.log('handleFormSubmit', data);
    let userLocalData:any = localStorage.getItem('user');
    let userData = JSON.parse(userLocalData);
    let payLoad:any = {};
    payLoad.purpose_name = data.purpose_name;
    payLoad.purpose_definition = data.purpose_definition;
    payLoad.purpose_written_description = data.purpose_written_description;
    payLoad.user_id = userData.username;
    payLoad.purpose_version_id = data.purpose_version_id;
    payLoad.type = 'purpose';

    if (isEdit) {
      payLoad.purpose_id = getValues("purpose_id");
    }else {
      payLoad.purpose_id = `${data.purpose_name.replace(/\s+/g, '')}${data.b2b === true ? 'B2B' : ''}${data.b2c === true ? 'B2C' : ''}`;
    }
    
    payLoad.use_cases = [];
    if (data.b2b === true) {
      payLoad.use_cases.push("b2b");
    }
    if (data.b2c === true) {
      payLoad.use_cases.push("b2c");
    }

    console.log('payLoad', payLoad);
    console.log('targetItem', targetItem);

    // Check if any value was changed between payLoad and targetItem
    if (isEdit && targetItem) {
      const changedFields: string[] = [];
      
      // Compare each field
      if (payLoad.purpose_name !== targetItem.purpose_name) changedFields.push('purpose_name');
      if (payLoad.purpose_definition !== targetItem.purpose_definition) changedFields.push('purpose_definition');
      if (payLoad.purpose_written_description !== targetItem.purpose_written_description) changedFields.push('purpose_written_description');
      
      // Compare use_cases arrays
      const targetUseCases = targetItem.use_cases || [];
      if (JSON.stringify(payLoad.use_cases.sort()) !== JSON.stringify(targetUseCases.sort())) {
        changedFields.push('use_cases');
      }
      
      console.log('Changed fields:', changedFields);
      console.log('Has changes:', changedFields.length > 0);
      
      if (changedFields.length === 0) {
        console.log('No changes detected');
        handlePurposesUpdate(payLoad, 'status');
      }else {
        handlePurposesUpdate(payLoad, isEdit ? 'edit' : 'add');
      }
    }else {
      handlePurposesUpdate(payLoad, isEdit ? 'edit' : 'add');
    }

    
  }
  const handlePurposesUpdate = async (purposeItem: PurposeAddModel, type:string) => {
    setLoading(true);
    console.log('payload', purposeItem);
    
    try {
      const response = await fetch(isEdit && type === 'delete' ? NetworkInfo.URL + '/resource/purpose/' + purposeItem.purpose_id + '/deprecate' : isEdit && type === 'status' ? NetworkInfo.URL + '/resource/purpose/' + purposeItem.purpose_version_id + '/activate' : NetworkInfo.URL + '/resource/purpose', {
        method: isEdit && type === 'delete' ? HTTPMethod.PATCH : isEdit && type === 'status' ? HTTPMethod.PATCH : HTTPMethod.POST,
        headers: {
          '"removed"': `${NetworkInfo.ACCESSTOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(purposeItem),
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
          setIsErrorMsg(responseData.message || 'Purpose updated successfully');
          reset();
          setLoading(false);
          setIsEdit(false);
          setTargetItem(undefined);
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
              item.status === 'active' && (
                <IonCard key={index}>
                  <IonItemSliding>
                    <IonItem button={true}>
                      <IonLabel>
                        <p className='font-bold'>Purpose name: {item.purpose_name}</p>
                        <p>Purpose Description: {item.purpose_written_description}</p>
                        <p>
                          B2B: {item.use_cases && item.use_cases.includes("b2b") ? 'Yes' : 'No'}
                          </p>
                          <p>
                          B2C: {item.use_cases && item.use_cases.includes("b2c") ? 'Yes' : 'No'}
                          </p>
                        <p>Purpose Definition: {item.purpose_definition}</p>
                        <p className='border-t'>Version: {item.version_number}</p>
                        <p>Updated By: {item.user_id}</p>
                        <p>Updated at: {new Date(item.updated_at).toLocaleDateString('en-GB')} {new Date(item.updated_at).toLocaleTimeString('en-GB', { hour12: false })}</p>
                      </IonLabel>
                      <IonButton id="open-modal" onClick={() => handleEdit(item)} slot="end" size="small" color="warning">
                        <IonIcon icon={createOutline}></IonIcon>
                      </IonButton>
                      <IonButton onClick={() => handleDeleteAleart(true, item)} color="danger" slot="end" size="small">
                        <IonIcon icon={trashOutline}></IonIcon>
                      </IonButton>
                    </IonItem>
                    <IonItemOptions>
                      <IonItemOption id="open-modal" onClick={() => handleEdit(item)} color="warning">Edit</IonItemOption>
                      <IonItemOption onClick={() => handleDeleteAleart(true, item)} color="danger">Delete</IonItemOption>
                    </IonItemOptions>
                  </IonItemSliding>
                </IonCard>
              )
            ))}
          </IonList>

          {/* modal start */}
          <IonModal id="example-modal" isOpen={isOpenModal} onWillDismiss={() => onModalDismiss()}>
            <IonHeader>
              <IonToolbar>
                <div className='flex'>
                  <IonTitle className='text-sm font-bold'>Purposes Add & Edit</IonTitle>
                  <IonSelect onIonChange={(e) => onChangeVersion(e.detail.value)} value={targetItem?.version_number} placeholder="Select Status" className={`min-h-8 field-item text-sm w-[200px] ${!isEdit && 'hidden'}`} label="Select version" interface="popover" labelPlacement="stacked" fill="outline">
                    {purposeVersionList
                      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                      .map((item, index) => (
                        <IonSelectOption key={index} value={item.version_number} className={`${item.status === 'inactive' ? 'text-red' : 'text-green'}`}>
                          {item.version_number} - {new Date(item.updated_at).toLocaleDateString('en-GB')} {new Date(item.updated_at).toLocaleTimeString('en-GB', { hour12: false })}
                        </IonSelectOption>
                      ))}
                  </IonSelect>
                </div>
                
                <IonButtons slot="end">
                  <IonButton size="small" shape="round" onClick={() => onModalDismiss()}>
                    <IonIcon slot="icon-only" icon={closeOutline}></IonIcon>
                  </IonButton>
                </IonButtons>
              </IonToolbar>
            </IonHeader>
            <div className="ion-padding inner-content">
              <form onSubmit={handleSubmit(handleFormSubmit)} className="w-full">
                <IonInput disabled={isEdit} className='mb-4 text-sm' label="Purpose Name" labelPlacement="floating" fill="outline" placeholder="Enter Purpose Name"
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
                  <IonButton title='Save edit data.' size='small' type='submit' className='btn-primary' shape="round">
                    {loading && <IonSpinner className='mr-2' name="bubbles"></IonSpinner>}
                    Save
                  </IonButton>
                  <IonButton title='Cancel' onClick={() => onModalDismiss()} size='small' type='reset' fill='outline' shape="round">
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
                  handleDeleteAleart(false, targetItem as PurposeAddModel);
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

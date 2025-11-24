import { IonAlert, IonButton, IonButtons, IonCard, IonCheckbox, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInput, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonModal, IonPage, IonProgressBar, IonSelect, IonSelectOption, IonSpinner, IonSplitPane, IonTextarea, IonTitle, IonToast, IonToolbar } from '@ionic/react';
import { useEffect, useRef, useState } from 'react';
import AppHeader from '../../../components/header/Header';
import Sidenav from '../../../components/sidenav/Sidenav';
import { add, closeOutline, createOutline, trashOutline } from 'ionicons/icons';
import { HTTPMethod, NetworkInfo } from '../../../routes/network';
import { useForm } from 'react-hook-form';

interface SegmentAddModel {
  segment_name: string;
  segment_id: string;
  segment_definition: string;
  b2b: number | boolean;
  b2c: number | boolean;
  use_cases: string[];
  user_id: string;
  status: string;
  version_number: number;
  segment_version_id: string;
}

const Segments: React.FC = () => {
  /* Variables start */
  const [segmentList, setSegmentList] = useState<SegmentAddModel[]>([]);
  const [segmentVersionList, setSegmentVersionList] = useState<SegmentAddModel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const modal = useRef<HTMLIonModalElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [targetItem, setTargetItem] = useState<SegmentAddModel>();
  const [isShowError, setIsShowError] = useState(false);
  const [isErrorMsg, setIsErrorMsg] = useState('');
  const apiUrl = `${NetworkInfo.URL}`;

  useEffect(() => {

    getSegmentsData();
  }, []);

  /* -------------get Segments data start------------- */
  const getSegmentsData = async () => {
    setLoading(true);
    try {
      const urlData = apiUrl + '/resource/segment';

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
        setSegmentList(responseData);
        setLoading(false);
      }
      
    } catch (error: any) {
      console.error("catch failed:", error);
      setLoading(false);
    }
  };
  /* get segments data end */

  /* modal functions start */

  const onModalDismiss = () => {
    setIsOpenModal(false);
    setIsEdit(false);
    setValue("segment_definition", '');
    setValue("segment_name", '');
    setValue("b2b", false);
    setValue("b2c", false);
  }

  const onChangeVersion = (version: number) => {
    const matchedVersion = segmentVersionList.find(segment => segment.version_number === version);
    console.log('matchedVersion', matchedVersion);
    handleEdit(matchedVersion);
  };

  const handleDeleteAleart = (_indicator:boolean, _value:SegmentAddModel) => {
    setIsEdit(true);
    if (_indicator === true) {
      setIsOpen(true);
      setTargetItem(_value);
    }else if (_indicator === false) {

      console.log('updatedSegments', targetItem);
      setIsOpen(false);
      handleSegmentsUpdate(targetItem as SegmentAddModel, 'delete');
    }

  }
  
  /* modal functions end */

  /* handle edit start */
  const handleEdit = (_value:any) => {
    console.log('_value', _value);
    const matchedSegment = segmentList.filter(segment => segment.segment_id === _value.segment_id);
    console.log('matchedSegment', matchedSegment);
    setSegmentVersionList(segmentList.filter(segment => segment.segment_id === _value.segment_id));

    setValue("segment_definition", _value.segment_definition);
    setValue("segment_name", _value.segment_name);
    setValue("segment_id", _value.segment_id);
    setValue("segment_version_id", _value.segment_version_id);

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
    payLoad.segment_name = data.segment_name;
    payLoad.segment_definition = data.segment_definition;
    payLoad.user_id = userData.username;
    payLoad.segment_version_id = data.segment_version_id;
    payLoad.type = 'segment';

    if (isEdit) {
      payLoad.segment_id = getValues("segment_id");
    }else {
      payLoad.segment_id = `${data.segment_name.replace(/\s+/g, '')}${data.b2b === true ? 'B2B' : ''}${data.b2c === true ? 'B2C' : ''}`;
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
      if (payLoad.segment_name !== targetItem.segment_name) changedFields.push('segment_name');
      if (payLoad.segment_definition !== targetItem.segment_definition) changedFields.push('segment_definition');
      
      // Compare use_cases arrays
      const targetUseCases = targetItem.use_cases || [];
      if (JSON.stringify(payLoad.use_cases.sort()) !== JSON.stringify(targetUseCases.sort())) {
        changedFields.push('use_cases');
      }
      
      console.log('Changed fields:', changedFields);
      console.log('Has changes:', changedFields.length > 0);
      
      if (changedFields.length === 0) {
        console.log('No changes detected');
        handleSegmentsUpdate(payLoad, 'status');
      }else {
        handleSegmentsUpdate(payLoad, isEdit ? 'edit' : 'add');
      }
    }else {
      handleSegmentsUpdate(payLoad, isEdit ? 'edit' : 'add');
    }

    
  }
  const handleSegmentsUpdate = async (segmentItem: SegmentAddModel, type:string) => {
    setLoading(true);
    console.log('payload', segmentItem);
    
    try {
      const response = await fetch(isEdit && type === 'delete' ? NetworkInfo.URL + '/resource/segment/' + segmentItem.segment_id + '/deprecate' : isEdit && type === 'status' ? NetworkInfo.URL + '/resource/segment/' + segmentItem.segment_version_id + '/activate' : NetworkInfo.URL + '/resource/segment', {
        method: isEdit && type === 'delete' ? HTTPMethod.PATCH : isEdit && type === 'status' ? HTTPMethod.PATCH : HTTPMethod.POST,
        headers: {
          '"removed"': `${NetworkInfo.ACCESSTOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(segmentItem),
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
          setIsErrorMsg(responseData.message || 'Segment updated successfully');
          reset();
          setLoading(false);
          setIsEdit(false);
          setTargetItem(undefined);
          getSegmentsData();
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
  } = useForm<SegmentAddModel>({
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
            {segmentList.map((item, index) => (
              item.status === 'active' && (
                <IonCard key={index}>
                  <IonItemSliding>
                    <IonItem button={true}>
                      <IonLabel>
                        <p className='font-bold'>Segment name: {item.segment_name}</p>
                        <p>
                          B2B: {item.use_cases && item.use_cases.includes("b2b") ? 'Yes' : 'No'}
                        </p>
                        <p>
                          B2C: {item.use_cases && item.use_cases.includes("b2c") ? 'Yes' : 'No'}
                        </p>
                        <p>Segment Definition: {item.segment_definition}</p>
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
                  <IonTitle className='text-sm font-bold'>Segments Add & Edit</IonTitle>
                  <IonSelect onIonChange={(e) => onChangeVersion(e.detail.value)} value={targetItem?.version_number} placeholder="Select Status" className={`min-h-8 field-item text-sm w-[150px] ${!isEdit && 'hidden'}`} label="Select version" interface="popover" labelPlacement="stacked" fill="outline">
                    {segmentVersionList.map((item, index) => (
                      <IonSelectOption key={index} value={item.version_number}>{item.version_number}</IonSelectOption>
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
                <IonInput disabled={isEdit} className='mb-4 text-sm' label="Segment Name" labelPlacement="floating" fill="outline" placeholder="Enter Segment Name"
                  {...register("segment_name", {
                    validate: {},
                  })}
                ></IonInput>

                <IonTextarea
                  className='mb-4 text-sm'
                  label="Segment Definition"
                  labelPlacement="floating"
                  fill="outline"
                  placeholder="Enter class definition"
                  autoGrow={true}
                  {...register("segment_definition", {
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
            header="Delete segment!"
            subHeader="Are you want to delete this segment?"
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
                  handleDeleteAleart(false, targetItem as SegmentAddModel);
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

export default Segments;

import { IonAlert, IonButton, IonButtons, IonCard, IonCheckbox, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInput, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonModal, IonPage, IonProgressBar, IonSpinner, IonSplitPane, IonTextarea, IonTitle, IonToast, IonToolbar } from '@ionic/react';
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
}

const Segments: React.FC = () => {
  /* Variables start */
  const [segmentList, setSegmentList] = useState<SegmentAddModel[]>([]);
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

    getSegmentsData();
  }, []);

  /* -------------get Segments data start------------- */
  const getSegmentsData = async () => {
    setLoading(true);
    try {
      const urlData = apiUrl + '/resource/get?table=segments';

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

  const handleDeleteAleart = (_indicator:boolean, _value:number) => {
    if (_indicator === true) {
      setIsOpen(true);
      setTargetIndex(_value);
    }else if (_indicator === false) {
      let updatedSegments = segmentList;

      let delIndex:any = targetIndex;
      updatedSegments.splice(delIndex, 1);

      console.log('updatedSegments', updatedSegments);
      setIsOpen(false);
      handleSegmentsUpdate(updatedSegments);
    }

  }
  
  /* modal functions end */

  /* handle edit start */
  const handleEdit = (_value:any, _index:number) => {
    console.log('_value', _value);
    setValue("segment_definition", _value.segment_definition);
    setValue("segment_name", _value.segment_name);
    setValue("segment_id", _value.segment_id);

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
    console.log('isEdit', isEdit);
    let payLoad:any = {};
    payLoad.segment_name = data.segment_name;
    payLoad.segment_definition = data.segment_definition;
    if (isEdit) {
      payLoad.segment_id = getValues("segment_id");
    }else {
      payLoad.segment_id = `${data.segment_name.replace(/\s+/g, '')}`;
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

    

    let prevSegmentList = segmentList;
    let index:any = targetIndex;

    console.log('finalData', payLoad);
    if (isEdit === true) {
      prevSegmentList.splice(index, 1, payLoad);
    }else {
      prevSegmentList = [...segmentList, payLoad];
    }

    
    console.log('prevList', prevSegmentList);

    handleSegmentsUpdate(prevSegmentList);
  }
  const handleSegmentsUpdate = async (allSegment: SegmentAddModel[]) => {
    setLoading(true);
    let formUrl = apiUrl + '/resource/put';
    console.log('payload', allSegment);

    let updatedSegments = allSegment;

    let finalPayload = {
      table: "segments",
      json_obj: updatedSegments
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
              <IonCard key={index}>
                <IonItemSliding>
                  <IonItem button={true}>
                    <IonLabel>
                      <p className='font-bold'>Segment name: {item.segment_name}</p>
                      <p>
                        B2B: {item.b2b === 1 ? 'Yes' : item.b2b === 0 ? 'No' : 'invalid value'}
                      </p>
                      <p>
                        B2C: {item.b2c === 1 ? 'Yes' : item.b2c === 0 ? 'No' : 'invalid value'}
                      </p>
                      <p>Segment Definition: {item.segment_definition}</p>
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
                <IonTitle className='text-sm font-bold'>Segments Add & Edit</IonTitle>
                <IonButtons slot="end">
                  <IonButton size="small" shape="round" onClick={() => onModalDismiss()}>
                    <IonIcon slot="icon-only" icon={closeOutline}></IonIcon>
                  </IonButton>
                </IonButtons>
              </IonToolbar>
            </IonHeader>
            <div className="ion-padding inner-content">
              <form onSubmit={handleSubmit(handleFormSubmit)} className="w-full">
                <IonInput className='mb-4 text-sm' label="Segment Name" labelPlacement="floating" fill="outline" placeholder="Enter Segment Name"
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

export default Segments;

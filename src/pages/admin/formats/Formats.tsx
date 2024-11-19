import { IonAlert, IonButton, IonButtons, IonCard, IonCheckbox, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInput, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonModal, IonPage, IonProgressBar, IonSpinner, IonSplitPane, IonTextarea, IonTitle, IonToast, IonToolbar } from '@ionic/react';
import { useEffect, useRef, useState } from 'react';
import AppHeader from '../../../components/header/Header';
import Sidenav from '../../../components/sidenav/Sidenav';
import { add, closeOutline, createOutline, trashOutline } from 'ionicons/icons';
import { HTTPMethod, NetworkInfo } from '../../../routes/network';
import { useForm } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface FormatAddModel {
  format_name: string;
  format_id: string;
  format_class_name: string;
  format_class_definition: string;
  format_written_description: string;
  quality_check: number | boolean;
  b2b: number | boolean;
  b2c: number | boolean;
}

const Formats: React.FC = () => {
  /* Variables start */
  const [formatList, setFormatList] = useState<FormatAddModel[]>([]);
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

    getFormatsData();
  }, []);

  /* -------------get Formats data start------------- */
  const getFormatsData = async () => {
    setLoading(true);
    try {
      const urlData = apiUrl + '/resource/get?table=formats';

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
        setFormatList(responseData);
        setLoading(false);
      }
      
    } catch (error: any) {
      console.error("catch failed:", error);
      setLoading(false);
    }
  };
  /* get formats data end */

  /* modal functions start */

  const onModalDismiss = () => {
    setIsOpenModal(false);
    setIsEdit(false);
    setValue("format_class_definition", '');
    setValue("format_written_description", '');
    setValue("format_name", '');
    setValue("format_class_name", '');
    setValue("b2b", false);
    setValue("b2c", false);
    setValue("quality_check", false);
  }

  const handleDeleteAleart = (_indicator:boolean, _value:number) => {
    if (_indicator === true) {
      setIsOpen(true);
      setTargetIndex(_value);
    }else if (_indicator === false) {
      let updatedFormats = formatList;

      let delIndex:any = targetIndex;
      updatedFormats.splice(delIndex, 1);

      console.log('updatedFormats', updatedFormats);
      setIsOpen(false);
      handleFormatsUpdate(updatedFormats);
    }

  }
  
  /* modal functions end */

  /* handle edit start */
  const handleEdit = (_value:any, _index:number) => {
    console.log('_value', _value);
    setValue("format_class_definition", _value.format_class_definition);
    setValue("format_written_description", _value.format_written_description);
    setValue("format_name", _value.format_name);
    setValue("format_id", _value.format_id);
    setValue("format_class_name", _value.format_class_name);
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
    if (_value.quality_check === 1) {
      setValue("quality_check", true);
    }else {
      setValue("quality_check", false);
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
    payLoad.format_name = data.format_name;
    payLoad.format_class_definition = data.format_class_definition;
    payLoad.format_written_description = data.format_written_description;
    payLoad.format_class_name = data.format_class_name;

    if (isEdit) {
      payLoad.format_id = getValues("format_id");
    }else {
      payLoad.format_id = `${data.format_name.replace(/\s+/g, '')}${data.b2b === true ? 'B2B' : ''}${data.b2c === true ? 'B2C' : ''}`
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

    if (data.quality_check === true) {
      payLoad.quality_check = 1;
    }else {
      payLoad.quality_check = 0;
    }

    

    let prevFormatList = formatList;
    let index:any = targetIndex;

    console.log('finalData', payLoad);
    if (isEdit === true) {
      prevFormatList.splice(index, 1, payLoad);
    }else {
      prevFormatList = [...formatList, payLoad];
    }

    
    console.log('prevList', prevFormatList);

    handleFormatsUpdate(prevFormatList);
  }
  const handleFormatsUpdate = async (allFormat: FormatAddModel[]) => {
    setLoading(true);
    let formUrl = apiUrl + '/resource/put';
    console.log('payload', allFormat);

    let updatedFormats = allFormat;

    let finalPayload = {
      table: "formats",
      json_obj: updatedFormats
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
          getFormatsData();
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
  } = useForm<FormatAddModel>({
    defaultValues: {
      b2b: false,
      b2c: false,
      quality_check: false,
    },
  });
  const isCheckQuality = watch('quality_check');
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
            {formatList.map((item, index) => (
              <IonCard key={index}>
                <IonItemSliding>
                  <IonItem button={true}>
                    <IonLabel>
                      <p className='font-bold'>Format name: {item.format_name}</p>
                      <p>Format description: {item.format_written_description}</p>
                      <p>Class name: {item.format_class_name}</p>
                      <p>
                        B2B: {item.b2b === 1 ? 'Yes' : item.b2b === 0 ? 'No' : 'invalid value'}
                      </p>
                      <p>
                        B2C: {item.b2c === 1 ? 'Yes' : item.b2c === 0 ? 'No' : 'invalid value'}
                      </p>
                      <p>Quality checked: {item.quality_check === 1 ? 'Yes' : item.quality_check === 0 ? 'No' : 'invalid value'}</p>
                      <p>Class Definition:</p>
                      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} children={item.format_class_definition}/>
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
                <IonTitle className='text-sm font-bold'>Formats Add & Edit</IonTitle>
                <IonButtons slot="end">
                  <IonButton size="small" shape="round" onClick={() => onModalDismiss()}>
                    <IonIcon slot="icon-only" icon={closeOutline}></IonIcon>
                  </IonButton>
                </IonButtons>
              </IonToolbar>
            </IonHeader>
            <div className="ion-padding">
              <form onSubmit={handleSubmit(handleFormSubmit)} className="w-full">
                <IonInput className='mb-4 text-sm' label="Format Name" labelPlacement="floating" fill="outline" placeholder="Enter Format Name"
                  {...register("format_name", {
                    validate: {},
                  })}
                ></IonInput>

                <IonInput className='mb-4 text-sm' label="Format Description" labelPlacement="floating" fill="outline" placeholder="Enter Format Description"
                  {...register("format_written_description", {
                    validate: {},
                  })}
                ></IonInput>
              
                <IonInput className='mb-4 text-sm' label="Class Name" labelPlacement="floating" fill="outline" placeholder="Enter class name"
                  {...register("format_class_name", {
                    validate: {},
                  })}
                ></IonInput>

                <IonTextarea
                  className='mb-4 text-sm'
                  label="Class Definition"
                  labelPlacement="floating"
                  fill="outline"
                  placeholder="Enter class definition"
                  autoGrow={true}
                  {...register("format_class_definition", {
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

                <IonCheckbox 
                  {...register("quality_check", {
                    validate: {},
                  })}
                  checked={isCheckQuality as boolean}
                  onIonChange={(event: any) => {
                    console.log('event', event.detail.checked);
                    setValue("quality_check", event.detail.checked);
                  }}
                  className='mb-4 text-sm' labelPlacement="start">Rewrite output if it does not match schema</IonCheckbox>
                
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
            header="Delete format!"
            subHeader="Are you want to delete this format?"
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

export default Formats;

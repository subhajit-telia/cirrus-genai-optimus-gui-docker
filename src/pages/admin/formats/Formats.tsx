import { IonAlert, IonButton, IonButtons, IonCard, IonCheckbox, IonContent, IonFab, IonFabButton, IonFabList, IonHeader, IonIcon, IonInput, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonModal, IonPage, IonProgressBar, IonSelect, IonSelectOption, IonSpinner, IonSplitPane, IonTextarea, IonTitle, IonToast, IonToolbar } from '@ionic/react';
import { useEffect, useRef, useState } from 'react';
import AppHeader from '../../../components/header/Header';
import Sidenav from '../../../components/sidenav/Sidenav';
import { add, chevronForwardCircle, closeOutline, colorPalette, createOutline, document, globe, trashOutline } from 'ionicons/icons';
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
  use_cases: string[];
  user_id:string;
  status: string;
  version_number: number;
  format_version_id: string;
}

const Formats: React.FC = () => {
  /* Variables start */
  const [formatList, setFormatList] = useState<FormatAddModel[]>([]);
  const [formatVersionList, setFormatVersionList] = useState<FormatAddModel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const modal = useRef<HTMLIonModalElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [targetItem, setTargetItem] = useState<FormatAddModel>();
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
      const urlData = apiUrl + '/resource/format';

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

  const onChangeVersion = (version: number) => {
    const matchedVersion = formatVersionList.find(format => format.version_number === version);
    console.log('matchedVersion', matchedVersion);
    handleEdit(matchedVersion);
  };

  const handleDeleteAleart = (_indicator:boolean, _value:FormatAddModel) => {
    setIsEdit(true);
    if (_indicator === true) {
      setIsOpen(true);
      setTargetItem(_value);
    }else if (_indicator === false) {

      console.log('updatedFormats', targetItem);
      setIsOpen(false);
      handleFormatsUpdate(targetItem as FormatAddModel, 'delete');
    }

  }
  
  /* modal functions end */

  /* handle edit start */
  const handleEdit = (_value:any) => {
    console.log('_value', _value);
    const matchedFormat = formatList.filter(format => format.format_id === _value.format_id);
    console.log('matchedFormat', matchedFormat);
    setFormatVersionList(formatList.filter(format => format.format_id === _value.format_id));

    setValue("format_class_definition", _value.format_class_definition);
    setValue("format_written_description", _value.format_written_description);
    setValue("format_name", _value.format_name);
    setValue("format_id", _value.format_id);
    setValue("format_class_name", _value.format_class_name);
    setValue("format_version_id", _value.format_version_id);

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

    
    if (_value.quality_check === 1) {
      setValue("quality_check", true);
    }else {
      setValue("quality_check", false);
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
    payLoad.format_name = data.format_name;
    payLoad.format_class_definition = data.format_class_definition;
    payLoad.format_written_description = data.format_written_description;
    payLoad.format_class_name = data.format_class_name;
    payLoad.user_id = userData.username;
    payLoad.format_version_id = data.format_version_id;
    payLoad.type = 'format';

    if (isEdit) {
      payLoad.format_id = getValues("format_id");
    }else {
      payLoad.format_id = `${data.format_name.replace(/\s+/g, '')}${data.b2b === true ? 'B2B' : ''}${data.b2c === true ? 'B2C' : ''}`;
    }
    
    payLoad.use_cases = [];
    if (data.b2b === true) {
      payLoad.use_cases.push("b2b");
    }
    if (data.b2c === true) {
      payLoad.use_cases.push("b2c");
    }

    if (data.quality_check === true) {
      payLoad.quality_check = 1;
    }else {
      payLoad.quality_check = 0;
    }

    console.log('payLoad', payLoad);
    console.log('targetItem', targetItem);

    // Check if any value was changed between payLoad and targetItem
    if (isEdit &&targetItem) {
      const changedFields: string[] = [];
      
      // Compare each field
      if (payLoad.format_name !== targetItem.format_name) changedFields.push('format_name');
      if (payLoad.format_class_definition !== targetItem.format_class_definition) changedFields.push('format_class_definition');
      if (payLoad.format_written_description !== targetItem.format_written_description) changedFields.push('format_written_description');
      if (payLoad.format_class_name !== targetItem.format_class_name) changedFields.push('format_class_name');
      if (payLoad.quality_check !== (targetItem.quality_check === 1 ? 1 : 0)) changedFields.push('quality_check');
      
      // Compare use_cases arrays
      const targetUseCases = targetItem.use_cases || [];
      if (JSON.stringify(payLoad.use_cases.sort()) !== JSON.stringify(targetUseCases.sort())) {
        changedFields.push('use_cases');
      }
      
      console.log('Changed fields:', changedFields);
      console.log('Has changes:', changedFields.length > 0);
      
      if (changedFields.length === 0) {
        console.log('No changes detected');
        // Optionally show a toast message or prevent the update
        // setIsShowError(true);
        // setIsErrorMsg('No changes detected');
        // return;
        handleFormatsUpdate(payLoad, 'status');
      }else {
        handleFormatsUpdate(payLoad, isEdit ? 'edit' : 'add');
      }
    }else {
      handleFormatsUpdate(payLoad, isEdit ? 'edit' : 'add');
    }

    
  }
  const handleFormatsUpdate = async (formatItem: FormatAddModel, type:string) => {
    setLoading(true);
    console.log('payload', formatItem);
    
    try {
      const response = await fetch(isEdit && type === 'delete' ? NetworkInfo.URL + '/resource/format/' + formatItem.format_id + '/deprecate' : isEdit && type === 'status' ? NetworkInfo.URL + '/resource/format/' + formatItem.format_version_id + '/activate' : NetworkInfo.URL + '/resource/format', {
        method: isEdit && type === 'delete' ? HTTPMethod.PATCH : isEdit && type === 'status' ? HTTPMethod.PATCH : HTTPMethod.POST,
        headers: {
          '"removed"': `${NetworkInfo.ACCESSTOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formatItem),
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
          setIsErrorMsg(responseData.message || 'Format updated successfully');
          reset();
          setLoading(false);
          setIsEdit(false);
          setTargetItem(undefined);
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
              item.status === 'active' && (
                <IonCard key={index}>
                  <IonItemSliding>
                    <IonItem button={true}>
                      <IonLabel>
                        <p className='font-bold'>Format name: {item.format_name}</p>
                        <p>Format description: {item.format_written_description}</p>
                        <p>Class name: {item.format_class_name}</p>
                          <p>
                          B2B: {item.use_cases && item.use_cases.includes("b2b") ? 'Yes' : 'No'}
                          </p>
                          <p>
                          B2C: {item.use_cases && item.use_cases.includes("b2c") ? 'Yes' : 'No'}
                          </p>
                        <p>Quality checked: {item.quality_check === 1 ? 'Yes' : item.quality_check === 0 ? 'No' : 'invalid value'}</p>
                        <p>Class Definition:</p>
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} children={item.format_class_definition}/>
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
                  <IonTitle className='text-sm font-bold'>Formats Add & Edit</IonTitle>
                  <IonSelect onIonChange={(e) => onChangeVersion(e.detail.value)} value={targetItem?.version_number} placeholder="Select Status" className={`min-h-8 field-item text-sm w-[150px] ${!isEdit && 'hidden'}`} label="Select version" interface="popover" labelPlacement="stacked" fill="outline">
                    {formatVersionList.map((item, index) => (
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
                <IonInput disabled={isEdit} className='mb-4 text-sm' label="Format Name" labelPlacement="floating" fill="outline" placeholder="Enter Format Name"
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
                  handleDeleteAleart(false, targetItem as FormatAddModel);
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

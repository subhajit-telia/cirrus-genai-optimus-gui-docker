import { IonAlert, IonButton, IonButtons, IonCard, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInput, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonModal, IonPage, IonProgressBar, IonSelect, IonSelectOption, IonSpinner, IonSplitPane, IonTextarea, IonTitle, IonToast, IonToolbar } from '@ionic/react';
import { useEffect, useRef, useState } from 'react';
import AppHeader from '../../../components/header/Header';
import Sidenav from '../../../components/sidenav/Sidenav';
import { add, closeOutline, createOutline, listCircle, trashOutline } from 'ionicons/icons';
import { HTTPMethod, NetworkInfo } from '../../../routes/network';
import { useForm } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface PromptAddModel {
  prompt_id: string;
  prompt: string;
  user_id: string;
  status: string;
  version_number: number;
  prompt_version_id: string;
}

const Prompts: React.FC = () => {
  /* Variables start */
  const [promptList, setPromptList] = useState<PromptAddModel[]>([]);
  const [promptVersionList, setPromptVersionList] = useState<PromptAddModel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const modal = useRef<HTMLIonModalElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [targetItem, setTargetItem] = useState<PromptAddModel>();
  const [isShowError, setIsShowError] = useState(false);
  const [isErrorMsg, setIsErrorMsg] = useState('');
  const apiUrl = `${NetworkInfo.URL}`;

  useEffect(() => {

    getPromptsData();
  }, []);

  /* -------------get Prompts data start------------- */
  const getPromptsData = async () => {
    setLoading(true);
    try {
      const urlData = apiUrl + '/resource/prompt';

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
        setPromptList(responseData);
        setLoading(false);
      }
      
    } catch (error: any) {
      console.error("catch failed:", error);
      setLoading(false);
    }
  };
  /* get prompts data end */

  /* modal functions start */

  const onModalDismiss = () => {
    setIsOpenModal(false);
    setIsEdit(false);
    setValue("prompt", '');
    setValue("prompt_id", '');
  }

  const onChangeVersion = (version: number) => {
    const matchedVersion = promptVersionList.find(prompt => prompt.version_number === version);
    console.log('matchedVersion', matchedVersion);
    handleEdit(matchedVersion);
  };

  const handleDeleteAleart = (_indicator:boolean, _value:PromptAddModel) => {
    setIsEdit(true);
    if (_indicator === true) {
      setIsOpen(true);
      setTargetItem(_value);
    }else if (_indicator === false) {

      console.log('updatedPrompts', targetItem);
      setIsOpen(false);
      handlePromptsUpdate(targetItem as PromptAddModel, 'delete');
    }

  }
  
  /* modal functions end */

  /* handle edit start */
  const handleEdit = (_value:any) => {
    console.log('_value', _value);
    const matchedPrompt = promptList.filter(prompt => prompt.prompt_id === _value.prompt_id);
    console.log('matchedPrompt', matchedPrompt);
    setPromptVersionList(promptList.filter(prompt => prompt.prompt_id === _value.prompt_id));

    setValue("prompt", _value.prompt);
    setValue("prompt_id", _value.prompt_id);
    setValue("prompt_version_id", _value.prompt_version_id);

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
    payLoad.prompt_id = data.prompt_id;
    payLoad.prompt = data.prompt;
    payLoad.user_id = userData.username;
    payLoad.prompt_version_id = data.prompt_version_id;
    payLoad.type = 'prompt';

    console.log('payLoad', payLoad);
    console.log('targetItem', targetItem);

    // Check if any value was changed between payLoad and targetItem
    if (isEdit && targetItem) {
      const changedFields: string[] = [];
      
      // Compare each field
      if (payLoad.prompt_id !== targetItem.prompt_id) changedFields.push('prompt_id');
      if (payLoad.prompt !== targetItem.prompt) changedFields.push('prompt');
      
      console.log('Changed fields:', changedFields);
      console.log('Has changes:', changedFields.length > 0);
      
      if (changedFields.length === 0) {
        console.log('No changes detected');
        handlePromptsUpdate(payLoad, 'status');
      }else {
        handlePromptsUpdate(payLoad, isEdit ? 'edit' : 'add');
      }
    }else {
      handlePromptsUpdate(payLoad, isEdit ? 'edit' : 'add');
    }

    
  }
  const handlePromptsUpdate = async (promptItem: PromptAddModel, type:string) => {
    setLoading(true);
    console.log('payload', promptItem);
    
    try {
      const response = await fetch(isEdit && type === 'delete' ? NetworkInfo.URL + '/resource/prompt/' + promptItem.prompt_id + '/deprecate' : isEdit && type === 'status' ? NetworkInfo.URL + '/resource/prompt/' + promptItem.prompt_version_id + '/activate' : NetworkInfo.URL + '/resource/prompt', {
        method: isEdit && type === 'delete' ? HTTPMethod.PATCH : isEdit && type === 'status' ? HTTPMethod.PATCH : HTTPMethod.POST,
        headers: {
          '"removed"': `${NetworkInfo.ACCESSTOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(promptItem),
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
          setIsErrorMsg(responseData.message || 'Prompt updated successfully');
          reset();
          setLoading(false);
          setIsEdit(false);
          setTargetItem(undefined);
          getPromptsData();
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
    watch,
    formState: { errors }
  } = useForm<PromptAddModel>({
    defaultValues: {
    },
  });
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
            {promptList.map((item, index) => (
              item.status === 'active' && (
                <IonCard key={index}>
                  <IonItemSliding>
                    <IonItem button={true}>
                      <IonLabel>
                        <p className='font-bold'>Prompt name: {item.prompt_id}</p>
                        
                        <p>Prompt:</p>
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} children={item.prompt}/>
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
                  <IonTitle className='text-sm font-bold'>Prompts Add & Edit</IonTitle>
                  <IonSelect onIonChange={(e) => onChangeVersion(e.detail.value)} value={targetItem?.version_number} placeholder="Select Status" className={`min-h-8 field-item text-sm w-[150px] ${!isEdit && 'hidden'}`} label="Select version" interface="popover" labelPlacement="stacked" fill="outline">
                    {promptVersionList
                      .sort((a, b) => a.version_number - b.version_number)
                      .map((item, index) => (
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
                <IonInput disabled={isEdit} className='mb-4 text-sm' label="Prompt Name" labelPlacement="floating" fill="outline" placeholder="Enter Prompt Name"
                  {...register("prompt_id", {
                    validate: {},
                  })}
                ></IonInput>

                <IonTextarea
                  className='mb-4 text-sm'
                  label="Prompt Definition"
                  labelPlacement="floating"
                  fill="outline"
                  placeholder="Enter class definition"
                  autoGrow={true}
                  {...register("prompt", {
                    validate: {},
                  })}
                ></IonTextarea>
                
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
            header="Delete prompt!"
            subHeader="Are you want to delete this prompt?"
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
                  handleDeleteAleart(false, targetItem as PromptAddModel);
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

export default Prompts;

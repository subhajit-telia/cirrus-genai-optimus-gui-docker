import { IonAlert, IonButton, IonButtons, IonCard, IonCheckbox, IonCol, IonContent, IonFab, IonFabButton, IonGrid, IonHeader, IonIcon, IonInput, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonModal, IonPage, IonProgressBar, IonRadio, IonRadioGroup, IonRow, IonSegment, IonSegmentButton, IonSpinner, IonSplitPane, IonTextarea, IonTitle, IonToolbar } from '@ionic/react';
import { useEffect, useRef, useState } from 'react';
import AppHeader from '../../../components/header/Header';
import Sidenav from '../../../components/sidenav/Sidenav';
import { add, closeOutline, createOutline, listCircle, trashOutline } from 'ionicons/icons';
import templateData from '../../../template.json';
import { HTTPMethod, NetworkInfo } from '../../../routes/network';
import { OverlayEventDetail } from '@ionic/core/components';
import { useForm } from 'react-hook-form';
import { integer } from 'aws-sdk/clients/cloudfront';

interface ConfigAddModel {

    memory_type: string;
    model_name: string;
    agent_type: string;

    quality_check_enabled: boolean;
    quality_check_retry_count: number;
    generation_max_"removed"s: number;
    context_max_"removed"s: number;
    temperature: number;


}

const Config: React.FC = () => {
  /* Variables start */
  const [configList, setConfigList] = useState<ConfigAddModel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingForm, setLoadingForm] = useState<boolean>(false);

  useEffect(() => {

    getConfigData();
  }, []);

  /* -------------get Config data start------------- */
  const getConfigData = async () => {
    setLoading(true);
    try {
      const urlData = NetworkInfo.URL + '/config/get';

      const response = await fetch(urlData);
      const responseData = await response.json();
      console.log("Success:", responseData);

      if (response.ok) {
        setValue("agent_type", responseData.agent_type);
        setValue("memory_type", responseData.memory_type);
        setValue("model_name", responseData.model.model_name);
        setValue("context_max_"removed"s", responseData.model.context_max_"removed"s);
        setValue("generation_max_"removed"s", responseData.model.generation_max_"removed"s);
        setValue("temperature", responseData.model.temperature);

        setValue("quality_check_enabled", responseData.quality_check_enabled);
        setValue("quality_check_retry_count", responseData.quality_check_retry_count);
        setConfigList(responseData);
        setLoading(false);
      }
      
    } catch (error: any) {
      console.error("catch failed:", error);
      setLoading(false);
    }
  };
  /* get config data end */

  /* -----------Handle form submit start----------- */
  const handleFormSubmit = async (data: any) => {
    setLoadingForm(true);
    console.log('handleFormSubmit', data);
    let payLoad:any = configList;
    payLoad.memory_type = data.memory_type;
    payLoad.model.model_name = data.model_name;
    payLoad.agent_type = data.agent_type;
    payLoad.quality_check_retry_count = data.quality_check_retry_count;
    payLoad.model.generation_max_"removed"s = data.generation_max_"removed"s;
    payLoad.model.context_max_"removed"s = data.context_max_"removed"s;
    payLoad.model.temperature = data.temperature;
    payLoad.quality_check_enabled = data.quality_check_enabled;

    console.log('payLoad', payLoad)
    handleConfigUpdate(payLoad);
  }
  const handleConfigUpdate = async (allConfig: ConfigAddModel[]) => {
    setLoadingForm(true);
    let formUrl = NetworkInfo.URL + '/config/put';
    console.log('allConfig', allConfig);
    
    try {
      const response = await fetch(formUrl, {
        method: HTTPMethod.PUT,
        headers: {
            'Content-Type': 'application/json'
          },
        body: JSON.stringify(allConfig),
      });
      const responseData = await response.json();
      console.log("Success:", responseData);

      if (response.ok && responseData === true) {
        setLoadingForm(false);
        getConfigData();
      }
      
    } catch (error: any) {
      console.error("Login failed:", error);
      setLoadingForm(false);
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
  } = useForm<ConfigAddModel>({
    defaultValues: {
    },
  });

  const isQualityGates = watch('quality_check_enabled');
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
            <IonCard className='p-2'>
                <form onSubmit={handleSubmit(handleFormSubmit)} className="w-full">
                    <IonGrid>
                        <IonRow>
                            <IonCol size="4">
                                <IonInput className='mb-4 text-sm' label="Memory Type" labelPlacement="floating" fill="outline" placeholder="Enter Memory Type"
                                {...register("memory_type", {
                                    validate: {},
                                })}
                                ></IonInput>
                            </IonCol>

                            <IonCol size="4">
                                <IonInput className='mb-4 text-sm' label="Model" labelPlacement="floating" fill="outline" placeholder="Enter Model"
                                {...register("model_name", {
                                    validate: {},
                                })}
                                ></IonInput>
                            </IonCol>

                            <IonCol size="4">
                                <IonInput className='mb-4 text-sm' label="Agent Type" labelPlacement="floating" fill="outline" placeholder="Enter Agent Type"
                                {...register("agent_type", {
                                    validate: {},
                                })}
                                ></IonInput>
                            </IonCol>

                            <IonCol size="4">
                                <IonInput type='number' className='mb-4 text-sm' label="Retry count" labelPlacement="floating" fill="outline" placeholder="Enter Retry count"
                                {...register("quality_check_retry_count", {
                                    validate: {},
                                })}
                                ></IonInput>
                            </IonCol>

                            <IonCol size="4">
                                <IonInput type='number' className='mb-4 text-sm' label="Genaration max "removed"s" labelPlacement="floating" fill="outline" placeholder="Enter Max "removed"s"
                                {...register("generation_max_"removed"s", {
                                    validate: {},
                                })}
                                ></IonInput>
                            </IonCol>

                            <IonCol size="4">
                                <IonInput  type='number' className='mb-4 text-sm' label="Context max "removed"s" labelPlacement="floating" fill="outline" placeholder="Enter Context max "removed"s"
                                {...register("context_max_"removed"s", {
                                    validate: {},
                                })}
                                ></IonInput>
                            </IonCol>

                            <IonCol size="4">
                                <IonInput type='number' step="0.1" className='mb-4 text-sm' label="Temperature" labelPlacement="floating" fill="outline" placeholder="Enter temperature"
                                {...register("temperature", {
                                    validate: {},
                                })}
                                ></IonInput>
                            </IonCol>

                            <IonCol size="4" className='flex items-center'>
                                <IonCheckbox 
                                {...register("quality_check_enabled", {
                                    validate: {},
                                })}
                                checked={isQualityGates as boolean}
                                onIonChange={(event: any) => {
                                    console.log('event', event.detail.checked);
                                    setValue("quality_check_enabled", event.detail.checked);
                                }}
                                className='mb-4 text-sm' labelPlacement="start">Quality checked?</IonCheckbox>
                            </IonCol>

                        </IonRow>
                    </IonGrid>
                    <div className='flex justify-end'>
                        <IonButton type='submit' className='btn-primary' shape="round">
                            {loadingForm && <IonSpinner className='mr-2' name="bubbles"></IonSpinner>}
                            Update
                        </IonButton>
                        <IonButton type='reset' fill='outline' shape="round">
                            Reset
                        </IonButton>
                    </div>
                </form>
            </IonCard>
            
      </IonContent>
    </IonPage>
    </IonSplitPane>
    </>
  );
};

export default Config;

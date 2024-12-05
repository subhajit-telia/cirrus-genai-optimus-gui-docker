import { IonButton, IonCard, IonCheckbox, IonCol, IonContent, IonGrid, IonInput, IonPage, IonProgressBar, IonRow, IonSpinner, IonSplitPane } from '@ionic/react';
import { useEffect, useState } from 'react';
import AppHeader from '../../../components/header/Header';
import Sidenav from '../../../components/sidenav/Sidenav';
import { HTTPMethod, NetworkInfo } from '../../../routes/network';
import { useForm } from 'react-hook-form';

interface ConfigAddModel {
    llm_name: string;
    wait_min: number;
    wait_increment: number;
    max_attempts: number;
    history_unit_test: boolean;

    quality_check_enabled: boolean;
    quality_check_retry_count: number;
    generation_max_"removed"s: number;
    temperature: number;
    example_validation_steps: number;
    test_example_chance: number;
    example_acceptance_threshold: number;
    example_automatic_approval: boolean;
    edit_max_attempts: number;
}

const Config: React.FC = () => {
  /* Variables start */
  const [configList, setConfigList] = useState<ConfigAddModel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingForm, setLoadingForm] = useState<boolean>(false);
  const apiUrl = `${NetworkInfo.URL}`;

  useEffect(() => {

    getConfigData();
  }, []);

  /* -------------get Config data start------------- */
  const getConfigData = async () => {
    setLoading(true);
    try {
      const urlData = apiUrl + '/config/get';

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
        setValue("quality_check_enabled", responseData.quality_check_enabled);
        setValue("quality_check_retry_count", responseData.quality_check_retry_count);

        setValue("llm_name", responseData.model.llm_name);
        setValue("generation_max_"removed"s", responseData.model.generation_max_"removed"s);
        setValue("temperature", responseData.model.temperature);

        setValue("wait_min", responseData.retry.wait_min);
        setValue("wait_increment", responseData.retry.wait_increment);
        setValue("max_attempts", responseData.retry.max_attempts);

        setValue("history_unit_test", responseData.history_unit_test);

        setValue("edit_max_attempts", responseData.retry.edit_max_attempts);
        setValue("test_example_chance", responseData.example_validation.test_example_chance);
        setValue("example_validation_steps", responseData.example_validation.example_validation_steps);
        setValue("example_acceptance_threshold", responseData.example_validation.example_acceptance_threshold);
        setValue("example_automatic_approval", responseData.example_validation.example_automatic_approval);
        
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

    payLoad.quality_check_enabled = data.quality_check_enabled;
    payLoad.quality_check_retry_count = data.quality_check_retry_count;

    payLoad.model.llm_name = data.llm_name;
    payLoad.model.generation_max_"removed"s = data.generation_max_"removed"s;
    payLoad.model.temperature = data.temperature;

    payLoad.retry.wait_min = data.wait_min;
    payLoad.retry.wait_increment = data.wait_increment;
    payLoad.retry.max_attempts = data.max_attempts;

    payLoad.history_unit_test = data.history_unit_test;

    payLoad.retry.edit_max_attempts = data.edit_max_attempts;
    payLoad.example_validation.test_example_chance = data.test_example_chance;
    payLoad.example_validation.example_validation_steps = data.example_validation_steps;
    payLoad.example_validation.example_acceptance_threshold = data.example_acceptance_threshold;
    payLoad.example_validation.example_automatic_approval = data.example_automatic_approval;
    

    console.log('payLoad', payLoad)
    handleConfigUpdate(payLoad);
  }
  const handleConfigUpdate = async (allConfig: ConfigAddModel[]) => {
    setLoadingForm(true);
    let formUrl = apiUrl + '/config/put';
    console.log('allConfig', allConfig);
    
    try {
      const response = await fetch(formUrl, {
        method: HTTPMethod.PUT,
        headers: {
          '"removed"': `${NetworkInfo.ACCESSTOKEN}`,
          'Content-Type': 'application/json',
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
  const isHistoryUnitTest = watch('history_unit_test');
  const isExampleAutomaticApproval = watch('example_automatic_approval');
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
                                <IonInput className='mb-4 text-sm' label="LLM Name" labelPlacement="floating" fill="outline" placeholder="Enter LLM"
                                {...register("llm_name", {
                                    validate: {},
                                })}
                                ></IonInput>
                            </IonCol>

                            <IonCol size="4">
                                <IonInput type='number' className='mb-4 text-sm' label="Number of retries for LLM fix answer" labelPlacement="floating" fill="outline" placeholder="Enter the value"
                                {...register("quality_check_retry_count", {
                                    validate: {},
                                })}
                                ></IonInput>
                            </IonCol>

                            <IonCol size="4">
                                <IonInput type='number' className='mb-4 text-sm' label="Wait period (s) if LLM does not return answer" labelPlacement="floating" fill="outline" placeholder="Enter the value"
                                {...register("wait_min", {
                                    validate: {},
                                })}
                                ></IonInput>
                            </IonCol>

                            <IonCol size="4">
                                <IonInput type='number' className='mb-4 text-sm' label="Wait increase (s) if LLM does not return answer" labelPlacement="floating" fill="outline" placeholder="Enter the value"
                                {...register("wait_increment", {
                                    validate: {},
                                })}
                                ></IonInput>
                            </IonCol>

                            <IonCol size="4">
                                <IonInput type='number' className='mb-4 text-sm' label="Maximum times to wait for LLM to return answer" labelPlacement="floating" fill="outline" placeholder="Enter the value"
                                {...register("max_attempts", {
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
                                <IonInput type='number' step="0.1" className='mb-4 text-sm' label="Temperature" labelPlacement="floating" fill="outline" placeholder="Enter temperature"
                                {...register("temperature", {
                                    validate: {},
                                })}
                                ></IonInput>
                            </IonCol>

                            <IonCol size="4">
                                <IonInput type='number' step="0.1" className='mb-4 text-sm' label="Example Validation Steps" labelPlacement="floating" fill="outline" placeholder="Enter Validation Steps"
                                {...register("example_validation_steps", {
                                    validate: {},
                                })}
                                ></IonInput>
                            </IonCol>

                            <IonCol size="4">
                                <IonInput type='number' step="0.1" className='mb-4 text-sm' label="User Test Case Random Allocation" labelPlacement="floating" fill="outline" placeholder="Enter User Test Case"
                                {...register("test_example_chance", {
                                    validate: {},
                                })}
                                ></IonInput>
                            </IonCol>

                            <IonCol size="4">
                                <IonInput type='number' step="0.1" className='mb-4 text-sm' label="Example Acceptance Threshold" labelPlacement="floating" fill="outline" placeholder="Enter Example Acceptance Threshold"
                                {...register("example_acceptance_threshold", {
                                    validate: {},
                                })}
                                ></IonInput>
                            </IonCol>
                            
                            <IonCol size="4">
                                <IonInput type='number' className='mb-4 text-sm' label="Maximum attempts for the LLM to generate correct edits" labelPlacement="floating" fill="outline" placeholder="Enter Maximum attempts for the LLM to generate correct edits"
                                {...register("edit_max_attempts", {
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
                                className='mb-4 text-sm' labelPlacement="start">Allowing LLM to fix answer</IonCheckbox>
                            </IonCol>

                            <IonCol size="4" className='flex items-center'>
                                <IonCheckbox 
                                {...register("history_unit_test", {
                                    validate: {},
                                })}
                                checked={isHistoryUnitTest as boolean}
                                onIonChange={(event: any) => {
                                    console.log('event', event.detail.checked);
                                    setValue("history_unit_test", event.detail.checked);
                                }}
                                className='mb-4 text-sm' labelPlacement="start">Save user history and feedback</IonCheckbox>
                            </IonCol>

                            <IonCol size="4" className='flex items-center'>
                                <IonCheckbox 
                                {...register("example_automatic_approval", {
                                    validate: {},
                                })}
                                checked={isExampleAutomaticApproval as boolean}
                                onIonChange={(event: any) => {
                                    console.log('event', event.detail.checked);
                                    setValue("example_automatic_approval", event.detail.checked);
                                }}
                                className='mb-4 text-sm' labelPlacement="start">Automatic Approval of Validated Examples</IonCheckbox>
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

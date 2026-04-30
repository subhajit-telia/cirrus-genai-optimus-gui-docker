import { IonAccordion, IonAccordionGroup, IonButton, IonCard, IonCheckbox, IonCol, IonContent, IonGrid, IonIcon, IonInput, IonItem, IonLabel, IonPage, IonPopover, IonProgressBar, IonRow, IonSelect, IonSelectOption, IonSpinner, IonSplitPane, IonToast } from '@ionic/react';
import { useEffect, useState } from 'react';
import AppHeader from '../../../components/header/Header';
import Sidenav from '../../../components/sidenav/Sidenav';
import { HTTPMethod, NetworkInfo } from '../../../routes/network';
import { useForm } from 'react-hook-form';
import { filter, informationCircle, informationCircleOutline } from 'ionicons/icons';
import { getValue } from '@mdxeditor/editor';

interface ConfigAddModel {
    llm_name: string;
    reasoning_effort: string;
    wait_min: number;
    wait_increment: number;
    max_attempts: number;
    history_unit_test: boolean;

    quality_check_enabled: boolean;
    quality_check_retry_count: number;
    generation_max_tokens: number;
    temperature: number;
    example_validation_steps: number;
    max_file_size_mb: number;
    generic_env: string;
    personalized_env: string;
    max_token_length: number;
    test_example_chance: number;
    example_acceptance_threshold: number;
    example_automatic_approval: boolean;
    automatic_feedback_enabled: boolean;
    edit_max_attempts: number;
    provider: string;
    enabled: boolean;
    max_results: number;
    allowed_use_cases_b2b: boolean;
    allowed_use_cases_b2c: boolean;
    web_search_generation_max_tokens: number;
    web_search_llm_name: string;
    no_cache: boolean;
    web_search_reasoning_effort: string;
    web_search_temperature: number;
}

const Config: React.FC = () => {
  /* Variables start */
  const [configList, setConfigList] = useState<ConfigAddModel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingForm, setLoadingForm] = useState<boolean>(false);
  const apiUrl = `${NetworkInfo.URL}`;
  const [isShowError, setIsShowError] = useState(false);
  const [isErrorMsg, setIsErrorMsg] = useState('');

  const reasoningEfforts = [
    { id: 1, data: 'none'},
    { id: 1, data: 'low'},
    { id: 1, data: 'medium'},
    { id: 1, data: 'high'},
    { id: 1, data: 'max'},
  ]

  useEffect(() => {

    getConfigData();
  }, []);

  /* -------------get Config data start------------- */
  const getConfigData = async () => {
    setLoading(true);
    try {
      const urlData = apiUrl + '/config/?filters=status:active';

      const response = await fetch(urlData, {
        method: 'GET',
        headers: {
          'access_token': `${NetworkInfo.ACCESSTOKEN}`,
          'Content-Type': 'application/json',
        },
      });
      
      const responseData = await response.json();
            console.log("Success:", responseData);
          
          // Find the active config and extract config_value
          const activeConfig = responseData.find((config: any) => config.status === 'active');
          const configValue = activeConfig?.config_value;
          
          console.log("Active Config Value:", configValue);

      if (response.ok) {
        setValue("quality_check_enabled", configValue.quality_check_enabled);
        setValue("quality_check_retry_count", configValue.quality_check_retry_count);

        setValue("llm_name", configValue.model.llm_name);
        setValue("reasoning_effort", configValue.model.reasoning_effort);
        setValue("generation_max_tokens", configValue.model.generation_max_tokens);
        setValue("temperature", configValue.model.temperature);

        setValue("wait_min", configValue.retry.wait_min);
        setValue("wait_increment", configValue.retry.wait_increment);
        setValue("max_attempts", configValue.retry.max_attempts);

        setValue("history_unit_test", configValue.history_unit_test);

        setValue("edit_max_attempts", configValue.retry.edit_max_attempts);
        setValue("test_example_chance", configValue.example_validation.test_example_chance);
        setValue("example_validation_steps", configValue.example_validation.example_validation_steps);
        setValue("max_file_size_mb", configValue.attachment.max_file_size_mb);
        setValue("generic_env", configValue.contentful.generic_env);
        setValue("personalized_env", configValue.contentful.personalized_env);
        setValue("max_token_length", configValue.attachment.max_token_length);
        setValue("example_acceptance_threshold", configValue.example_validation.example_acceptance_threshold);
        setValue("example_automatic_approval", configValue.example_validation.example_automatic_approval);
        setValue("automatic_feedback_enabled", configValue.automatic_feedback_enabled);

        setValue("provider", configValue.web_search.provider);
        setValue("enabled", configValue.web_search.enabled);
        setValue("max_results", configValue.web_search.max_results);
        setValue("allowed_use_cases_b2b", Array.isArray(configValue.web_search.allowed_use_cases) && configValue.web_search.allowed_use_cases.includes('b2b'));
        setValue("allowed_use_cases_b2c", Array.isArray(configValue.web_search.allowed_use_cases) && configValue.web_search.allowed_use_cases.includes('b2c'));
        
        setValue("web_search_generation_max_tokens", configValue.web_search.model.generation_max_tokens);
        setValue("web_search_llm_name", configValue.web_search.model.llm_name);
        setValue("no_cache", configValue.web_search.model.no_cache);
        setValue("web_search_reasoning_effort", configValue.web_search.model.reasoning_effort);
        setValue("web_search_temperature", configValue.web_search.model.temperature);
        setConfigList(configValue);
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
    payLoad.model.reasoning_effort = data.reasoning_effort;
    payLoad.model.generation_max_tokens = data.generation_max_tokens;
    payLoad.model.temperature = data.temperature;

    payLoad.retry.wait_min = data.wait_min;
    payLoad.retry.wait_increment = data.wait_increment;
    payLoad.retry.max_attempts = data.max_attempts;

    payLoad.history_unit_test = data.history_unit_test;

    payLoad.retry.edit_max_attempts = data.edit_max_attempts;
    payLoad.example_validation.test_example_chance = data.test_example_chance;
    payLoad.example_validation.example_validation_steps = data.example_validation_steps;
    payLoad.attachment.max_file_size_mb = data.max_file_size_mb;
    payLoad.contentful.generic_env = data.generic_env;
    payLoad.contentful.personalized_env = data.personalized_env;
    payLoad.attachment.max_token_length = data.max_token_length;
    payLoad.example_validation.example_acceptance_threshold = data.example_acceptance_threshold;
    payLoad.example_validation.example_automatic_approval = data.example_automatic_approval;
    payLoad.automatic_feedback_enabled = data.automatic_feedback_enabled;
    payLoad.web_search.provider = data.provider;
    payLoad.web_search.enabled = data.enabled;
    payLoad.web_search.max_results = data.max_results;    
    payLoad.web_search.allowed_use_cases = [];
    if (data.allowed_use_cases_b2b) payLoad.web_search.allowed_use_cases.push('b2b');
    if (data.allowed_use_cases_b2c) payLoad.web_search.allowed_use_cases.push('b2c');

    payLoad.web_search.model.generation_max_tokens = data.web_search_generation_max_tokens;
    payLoad.web_search.model.llm_name = data.web_search_llm_name;
    payLoad.web_search.model.no_cache = data.no_cache;
    payLoad.web_search.model.reasoning_effort = data.web_search_reasoning_effort;
    payLoad.web_search.model.temperature = data.web_search_temperature;
    console.log('payLoad', payLoad)
    handleConfigUpdate(payLoad);
  }
  const handleConfigUpdate = async (allConfig: ConfigAddModel[]) => {
    let userLocalData:any = localStorage.getItem('user');
    let userData = JSON.parse(userLocalData);
    setLoadingForm(true);
    let formUrl = apiUrl + '/config/';
    
    const finalPayload = {
      config_value: allConfig,
      status: 'active',
      user_id: userData.username
    };
    console.log('finalPayload', finalPayload);
    
    try {
      const response = await fetch(formUrl, {
        method: HTTPMethod.POST,
        headers: {
          'access_token': `${NetworkInfo.ACCESSTOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalPayload),
      });
      const responseData = await response.json();
      console.log("Success:", responseData);

      if (response.ok) {
        setIsShowError(true);
        setIsErrorMsg(responseData.message || 'Configuration updated successfully');
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
    getValues,
    watch,
    formState: { errors }
  } = useForm<ConfigAddModel>({
    defaultValues: {
    },
  });

  const isQualityGates = watch('quality_check_enabled');
  const isHistoryUnitTest = watch('history_unit_test');
  const isExampleAutomaticApproval = watch('example_automatic_approval');
  const isAutomaticFeedbackEnabled = watch('automatic_feedback_enabled');
  const isWebSearchEnabled = watch('enabled');
  const isAllowedUseCasesB2B = watch('allowed_use_cases_b2b');
  const isAllowedUseCasesB2C = watch('allowed_use_cases_b2c');
    const isNoCache = watch('no_cache');
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
                        <p className='font-bold text-lg text-black mb-2.5'>Model Parameters</p>
                        <IonRow>
                            <IonCol size="3">
                                <IonInput className='mb-4 text-sm' label="LLM Name" labelPlacement="floating" fill="outline" placeholder="Enter LLM"
                                {...register("llm_name", {
                                    validate: {},
                                })}
                                >
                                    <IonIcon id="llm-name" className="block absolute left-0 -top-1.5 z-10 cursor-pointer" slot="icon-only" icon={informationCircle}></IonIcon>
                                </IonInput>
                                <IonPopover className="rating-popover" size="auto" trigger="llm-name" triggerAction="hover">
                                    <IonContent class="ion-padding">
                                        Model name. See <a target='blank' className='underline text-blue-600 font-bold' href='https://genai-infra-llms.cirrus-dev.teliacompany.net/docs#/'>here</a> to find the different options.
                                    </IonContent>
                                </IonPopover>
                            </IonCol>
                            <IonCol size="3">
                                <div className='relative text-black'>
                                    <IonSelect value={getValues('reasoning_effort')} placeholder="Select reasoning effort" className='field-item text-sm' label="Reasoning Effort" interface="popover" labelPlacement="stacked" fill="outline"
                                    {...register("reasoning_effort", {
                                        validate: {},
                                    })}>
                                    {reasoningEfforts.map((item, index) => (
                                        <IonSelectOption key={index} value={item.data}>{item.data}</IonSelectOption>
                                    ))}
                                    </IonSelect>
                                    <IonIcon id="reasoning" className="block absolute left-0 -top-1.5 z-10 cursor-pointer" slot="icon-only" icon={informationCircle}></IonIcon>
                                </div>
                                
                                <IonPopover className="rating-popover" size="auto" trigger="reasoning" triggerAction="hover">
                                    <IonContent class="ion-padding">
                                        How much the LLM should think before responding. Less thinking gives faster responses, but may reduce output quality.
                                    </IonContent>
                                </IonPopover>
                            </IonCol>
                            <IonCol size="3">
                                <IonInput type='number' step="0.1" className='mb-4 text-sm' label="Temperature" labelPlacement="floating" fill="outline" placeholder="Enter temperature"
                                    {...register("temperature", {
                                        validate: {},
                                    })}
                                    ><IonIcon id="temperature" className="block absolute left-0 -top-1.5 z-10 cursor-pointer" slot="icon-only" icon={informationCircle}></IonIcon>
                                </IonInput>
                                <IonPopover className="rating-popover" size="auto" trigger="temperature" triggerAction="hover">
                                    <IonContent class="ion-padding">
                                        Temperature is used to control the randomness of the output. When you set it higher, you'll get more random outputs. When you set it lower, towards 0, the values are more deterministic.
                                    </IonContent>
                                </IonPopover>
                            </IonCol>
                            <IonCol size="3" className='flex items-center'>
                                <IonCheckbox 
                                {...register("automatic_feedback_enabled", {
                                    validate: {},
                                })}
                                checked={isAutomaticFeedbackEnabled as boolean}
                                onIonChange={(event: any) => {
                                    console.log('event', event.detail.checked);
                                    setValue("automatic_feedback_enabled", event.detail.checked);
                                }}
                                className='mb-4 text-sm' labelPlacement="start"><IonIcon id="automatic-feedback" className=" z-10 cursor-pointer" icon={informationCircle}></IonIcon> Automatic Feedback</IonCheckbox>
                                <IonPopover className="rating-popover" size="auto" trigger="automatic-feedback" triggerAction="hover">
                                    <IonContent class="ion-padding">
                                        Whether automatic feedback generation is enabled. When enabled, the system evaluates the generated copy using an LLM and produces structured feedback automatically.
                                    </IonContent>
                                </IonPopover>
                            </IonCol>
                        </IonRow>
                        
                        <p className='font-bold text-lg text-black mb-2.5'>Copy Generation Settings</p>
                        <IonRow>
                            <IonCol size="4">
                                <IonInput type='number' className='mb-4 text-sm' label="Maximum times to wait for LLM to return answer" labelPlacement="floating" fill="outline" placeholder="Enter the value"
                                    {...register("max_attempts", {
                                        validate: {},
                                    })}
                                    ><IonIcon id="maximum-times-wait" className="block absolute left-0 -top-1.5 z-10 cursor-pointer" slot="icon-only" icon={informationCircle}></IonIcon>
                                </IonInput>
                                <IonPopover className="rating-popover" size="auto" trigger="maximum-times-wait" triggerAction="hover">
                                    <IonContent class="ion-padding">
                                        Sometimes the LLM may not return a valid answer (e.g. because the rate limit is reached). This is the maximum number of times the LLM will be requested to return an answer.
                                    </IonContent>
                                </IonPopover>
                            </IonCol>
                            <IonCol size="4">
                                <IonInput type='number' className='mb-4 text-sm' label="Generation max tokens" labelPlacement="floating" fill="outline" placeholder="Enter Max tokens"
                                    {...register("generation_max_tokens", {
                                        validate: {},
                                    })}
                                    ><IonIcon id="genaration-max" className="block absolute left-0 -top-1.5 z-10 cursor-pointer" slot="icon-only" icon={informationCircle}></IonIcon>
                                </IonInput>
                                <IonPopover className="rating-popover" size="auto" trigger="genaration-max" triggerAction="hover">
                                    <IonContent class="ion-padding">
                                        Maximum number of tokens in the answer of the LLM. If the LLM attempts to generate more tokens, there may be a cut-off mid-response.
                                    </IonContent>
                                </IonPopover>
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
                                className='mb-4 text-sm' labelPlacement="start"><IonIcon id="allowing-llm" className="z-10 cursor-pointer" icon={informationCircle}></IonIcon> Allowing LLM to fix answer </IonCheckbox>
                                <IonPopover className="rating-popover" size="auto" trigger="allowing-llm" triggerAction="hover">
                                    <IonContent class="ion-padding">
                                        Whether to perform quality checks for formats for which this is specified. If checked, the output can be tested against e.g. the specified character limit, and if it does not match, the LLM will be asked to change the text.
                                    </IonContent>
                                </IonPopover>
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
                                className='mb-4 text-sm' labelPlacement="start"><IonIcon id="save-user-history" className=" z-10 cursor-pointer" icon={informationCircle}></IonIcon> Do not save user history and feedback</IonCheckbox>
                                <IonPopover className="rating-popover" size="auto" trigger="save-user-history" triggerAction="hover">
                                    <IonContent class="ion-padding">
                                        If checked, then interactions with the tool will not be saved to the database.
                                    </IonContent>
                                </IonPopover>
                            </IonCol>
                            <IonCol size="4">
                                <IonInput type='number' className='mb-4 text-sm' label="Number of retries for LLM fix answer" labelPlacement="floating" fill="outline" placeholder="Enter the value"
                                    {...register("quality_check_retry_count", {
                                        validate: {},
                                    })}
                                    ><IonIcon id="number-of-retries" className="block absolute left-0 -top-1.5 z-10 cursor-pointer" slot="icon-only" icon={informationCircle}></IonIcon>
                                </IonInput>
                                <IonPopover className="rating-popover" size="auto" trigger="number-of-retries" triggerAction="hover">
                                    <IonContent class="ion-padding">
                                    Determines how often the LLM is asked to correct the output if the quality check fails.
                                    </IonContent>
                                </IonPopover>
                            </IonCol>
                            <IonCol size="4">
                                <IonInput type='number' className='mb-4 text-sm' label="Wait period (s) if LLM does not return answer" labelPlacement="floating" fill="outline" placeholder="Enter the value"
                                    {...register("wait_min", {
                                        validate: {},
                                    })}
                                    ><IonIcon id="wait-period" className="block absolute left-0 -top-1.5 z-10 cursor-pointer" slot="icon-only" icon={informationCircle}></IonIcon>
                                </IonInput>
                                <IonPopover className="rating-popover" size="auto" trigger="wait-period" triggerAction="hover">
                                    <IonContent class="ion-padding">
                                        If the LLM does not return a valid answer(e.g. because the rate limit is reached), this is the minimum wait time in seconds after the first attempt failed before the LLM is asked to try again.
                                    </IonContent>
                                </IonPopover>
                            </IonCol>
                            <IonCol size="4">
                                <IonInput type='number' className='mb-4 text-sm' label="Wait increase (s) if LLM does not return answer" labelPlacement="floating" fill="outline" placeholder="Enter the value"
                                    {...register("wait_increment", {
                                        validate: {},
                                    })}
                                    ><IonIcon id="wait-increase" className="block absolute left-0 -top-1.5 z-10 cursor-pointer" slot="icon-only" icon={informationCircle}></IonIcon>
                                </IonInput>
                                <IonPopover className="rating-popover" size="auto" trigger="wait-increase" triggerAction="hover">
                                    <IonContent class="ion-padding">
                                        If the LLM does not return a valid answer multiple times (e.g. because the rate limit is reached), the wait time will be incremented by this number of seconds.
                                    </IonContent>
                                </IonPopover>
                            </IonCol>
                            <IonCol size="4">
                                <IonInput type='number' className='mb-4 text-sm' label="Maximum attempts for the LLM to generate correct edits" labelPlacement="floating" fill="outline" placeholder="Enter Maximum attempts for the LLM to generate correct edits"
                                {...register("edit_max_attempts", {
                                    validate: {},
                                })}
                                ><IonIcon id="maximum-attempts" className="block absolute left-0 -top-1.5 z-10 cursor-pointer" slot="icon-only" icon={informationCircle}></IonIcon>
                                </IonInput>
                                <IonPopover className="rating-popover" size="auto" trigger="maximum-attempts" triggerAction="hover">
                                    <IonContent class="ion-padding">
                                        Maximum number of retries for the LLM to return the correct format when using the editing capability.
                                    </IonContent>
                                </IonPopover>
                            </IonCol>
                        </IonRow>
                        <p className='font-bold text-lg text-black mb-2.5'>Example validation:</p>
                        <IonRow>
                            <IonCol size="4">
                                <IonInput type='number' step="0.1" className='mb-4 text-sm' label="Example Validation Steps" labelPlacement="floating" fill="outline" placeholder="Enter Validation Steps"
                                    {...register("example_validation_steps", {
                                        validate: {},
                                    })}
                                    ><IonIcon id="example-validation" className="block absolute left-0 -top-1.5 z-10 cursor-pointer" slot="icon-only" icon={informationCircle}></IonIcon>
                                </IonInput>
                                <IonPopover className="rating-popover" size="auto" trigger="example-validation" triggerAction="hover">
                                    <IonContent class="ion-padding">
                                        Number of times an example is to be tested before it can be evaluated.
                                    </IonContent>
                                </IonPopover>
                            </IonCol>
                            <IonCol size="4">
                                <IonInput type='number' step="0.1" className='mb-4 text-sm' label="User Test Case Random Allocation" labelPlacement="floating" fill="outline" placeholder="Enter User Test Case"
                                    {...register("test_example_chance", {
                                        validate: {},
                                    })}
                                    ><IonIcon id="user-test-case" className="block absolute left-0 -top-1.5 z-10 cursor-pointer" slot="icon-only" icon={informationCircle}></IonIcon>
                                </IonInput>
                                <IonPopover className="rating-popover" size="auto" trigger="user-test-case" triggerAction="hover">
                                    <IonContent class="ion-padding">
                                        In case a test example is present, it will be tested (in case of a matching request) with this probability. Between 0 and 1.
                                    </IonContent>
                                </IonPopover>
                            </IonCol>
                            <IonCol size="4">
                                <IonInput type='number' step="0.1" className='mb-4 text-sm' label="Example Acceptance Threshold" labelPlacement="floating" fill="outline" placeholder="Enter Example Acceptance Threshold"
                                    {...register("example_acceptance_threshold", {
                                        validate: {},
                                    })}
                                    ><IonIcon id="example-acceptance" className="block absolute left-0 -top-1.5 z-10 cursor-pointer" slot="icon-only" icon={informationCircle}></IonIcon>
                                </IonInput>
                                <IonPopover className="rating-popover" size="auto" trigger="example-acceptance" triggerAction="hover">
                                    <IonContent class="ion-padding">
                                        Number of time an LLM answer created using an example should be better than one without for it to be validated/approved. Should be lower than the Example validation steps.
                                    </IonContent>
                                </IonPopover>
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
                                className='mb-4 text-sm' labelPlacement="start"><IonIcon id="automatic-approval" className=" z-10 cursor-pointer" icon={informationCircle}></IonIcon> Automatic Approval of Validated Examples</IonCheckbox>
                                <IonPopover className="rating-popover" size="auto" trigger="automatic-approval" triggerAction="hover">
                                    <IonContent class="ion-padding">
                                        Whether examples that reach the acceptance threshold will get their status changed from 'testing' to 'approved' (if checked) or 'validated' (if unchecked). 
                                    </IonContent>
                                </IonPopover>
                            </IonCol>
                            
                        </IonRow>
                        <p className='font-bold text-lg text-black mb-2.5'>Attachment Settings:</p>
                        <IonRow>
                            <IonCol size="4">
                                <IonInput type='number' step="0.1" className='mb-4 text-sm' label="Max File Size (MB)" labelPlacement="floating" fill="outline" placeholder="Enter Max File Size"
                                    {...register("max_file_size_mb", {
                                        validate: {},
                                    })}
                                    ><IonIcon id="max-file-size" className="block absolute left-0 -top-1.5 z-10 cursor-pointer" slot="icon-only" icon={informationCircle}></IonIcon>
                                </IonInput>
                                <IonPopover className="rating-popover" size="auto" trigger="max-file-size" triggerAction="hover">
                                    <IonContent class="ion-padding">
                                        Maximum allowed file size for the attachment, measured in megabytes (MB). This value restricts the size of the document that can be uploaded or processed. If the file exceeds this limit, it will be rejected.
                                    </IonContent>
                                </IonPopover>
                            </IonCol>
                            <IonCol size="4">
                                <IonInput type='number' step="0.1" className='mb-4 text-sm' label="Max Token Length" labelPlacement="floating" fill="outline" placeholder="Enter Max Token Length"
                                    {...register("max_token_length", {
                                        validate: {},
                                    })}
                                    ><IonIcon id="max-token-length" className="block absolute left-0 -top-1.5 z-10 cursor-pointer" slot="icon-only" icon={informationCircle}></IonIcon>
                                </IonInput>
                                <IonPopover className="rating-popover" size="auto" trigger="max-token-length" triggerAction="hover">
                                    <IonContent class="ion-padding">
                                        Maximum number of tokens allowed for the attachment. This value limits the length of the attached document in terms of tokens, where a token is a single unit of text (such as a word, punctuation mark, or part of a word) as used by the language model (LLM). If the document exceeds this limit, it will be truncated.
                                    </IonContent>
                                </IonPopover>
                            </IonCol>
                        </IonRow>

                        <p className='font-bold text-lg text-black mb-2.5'>Contentful Settings:</p>
                        <IonRow>
                            <IonCol size="4">
                                <IonInput type='text' className='mb-4 text-sm' label="Generic Environment" labelPlacement="floating" fill="outline" placeholder="Generic Environment ID "
                                    {...register("generic_env", {
                                        validate: {},
                                    })}
                                    ><IonIcon id="generic_env" className="block absolute left-0 -top-1.5 z-10 cursor-pointer" slot="icon-only" icon={informationCircle}></IonIcon>
                                </IonInput>
                                <IonPopover className="rating-popover" size="auto" trigger="generic_env" triggerAction="hover">
                                    <IonContent class="ion-padding">
                                        This environment id specifies the target Contentful environment where all generic content from Optimus will be sent. The value is case-sensitive. 
                                    </IonContent>
                                </IonPopover>
                            </IonCol>
                            <IonCol size="4">
                                <IonInput type='text' className='mb-4 text-sm' label="Personalized Environment" labelPlacement="floating" fill="outline" placeholder="Personalized Environment ID"
                                    {...register("personalized_env", {
                                        validate: {},
                                    })}
                                    ><IonIcon id="personalized_env" className="block absolute left-0 -top-1.5 z-10 cursor-pointer" slot="icon-only" icon={informationCircle}></IonIcon>
                                </IonInput>
                                <IonPopover className="rating-popover" size="auto" trigger="personalized_env" triggerAction="hover">
                                    <IonContent class="ion-padding">
                                        This environment id specifies the target Contentful environment where all personalized content from Optimus will be sent. The value is case-sensitive.
                                    </IonContent>
                                </IonPopover>
                            </IonCol>
                        </IonRow>

                        <p className='font-bold text-lg text-black mb-2.5'>Web Search Settings:</p>
                        <IonRow>
                            <IonCol size="4">
                                <IonInput className='mb-4 text-sm' label="Web search provider" labelPlacement="floating" fill="outline" placeholder="Enter Web Search Provider"
                                    {...register("provider", {
                                        validate: {},
                                    })}
                                    ><IonIcon id="web-search-provider" className="block absolute left-0 -top-1.5 z-10 cursor-pointer" slot="icon-only" icon={informationCircle}></IonIcon>
                                </IonInput>
                                <IonPopover className="rating-popover" size="auto" trigger="web-search-provider" triggerAction="hover">
                                    <IonContent class="ion-padding">
                                        This is web search provider used for retrieval augmented generation. The value is case-sensitive. If no provider is specified, web search will be disabled.
                                    </IonContent>
                                </IonPopover>
                            </IonCol>
                            <IonCol size="4">
                                <IonInput type='number' step="0.1" className='mb-4 text-sm' label="Max Results" labelPlacement="floating" fill="outline" placeholder="Enter Max Results"
                                    {...register("max_results", {
                                        validate: {},
                                    })}
                                    ><IonIcon id="max-results" className="block absolute left-0 -top-1.5 z-10 cursor-pointer" slot="icon-only" icon={informationCircle}></IonIcon>
                                </IonInput>
                                <IonPopover className="rating-popover" size="auto" trigger="max-results" triggerAction="hover">
                                    <IonContent class="ion-padding">
                                        This is the maximum number of web search results to be returned by the web search provider and used for retrieval augmented generation.
                                    </IonContent>
                                </IonPopover>
                            </IonCol>
                            <IonCol size="4" className='flex items-center'>
                                <IonCheckbox 
                                {...register("enabled", {
                                    validate: {},
                                })}
                                checked={isWebSearchEnabled as boolean}
                                onIonChange={(event: any) => {
                                    console.log('event', event.detail.checked);
                                    setValue("enabled", event.detail.checked);
                                }}
                                className='mb-4 text-sm' labelPlacement="start"><IonIcon id="web-search-enabled" className=" z-10 cursor-pointer" icon={informationCircle}></IonIcon> Enable Web Search</IonCheckbox>
                                <IonPopover className="rating-popover" size="auto" trigger="web-search-enabled" triggerAction="hover">
                                    <IonContent class="ion-padding">
                                        Whether to enable web search for retrieval augmented generation.
                                    </IonContent>
                                </IonPopover>
                            </IonCol>
                            
                        </IonRow>
                        <IonRow>
                            <IonCol size="12" className='flex items-center'>
                                <p className='font-bold text-xs mb-0 mr-4'>
                                    <IonIcon id="b2c-use-case" className="z-10 cursor-pointer" icon={informationCircle}></IonIcon>
                                    Allowed Use Cases: {isAllowedUseCasesB2C || isAllowedUseCasesB2B ?
                                    `${isAllowedUseCasesB2C ? 'B2C ' : ''}${isAllowedUseCasesB2B ? 'B2B' : ''}`
                                    :
                                    'None'
                                    }
                                </p>
                                <IonPopover className="rating-popover" size="auto" trigger="b2c-use-case" triggerAction="hover">
                                    <IonContent class="ion-padding">
                                        Enable Business-to-Consumer use cases.
                                    </IonContent>
                                </IonPopover>
                                <IonCheckbox 
                                {...register("allowed_use_cases_b2c", {
                                    validate: {},
                                })}
                                checked={isAllowedUseCasesB2C as boolean}
                                onIonChange={(event: any) => {
                                    setValue("allowed_use_cases_b2c", event.detail.checked);
                                }}
                                className='mb-0 mr-4 text-sm' labelPlacement="start"> B2C</IonCheckbox>
                                
                                <IonCheckbox 
                                {...register("allowed_use_cases_b2b", {
                                    validate: {},
                                })}
                                checked={isAllowedUseCasesB2B}
                                onIonChange={(event: any) => {
                                    setValue("allowed_use_cases_b2b", event.detail.checked);
                                }}
                                className='mb-0 mr-4 text-sm' labelPlacement="start"> B2B</IonCheckbox>
                                
                            </IonCol>
                        </IonRow>
                        <IonRow>
                            <IonCol size='12'>
                                <IonCard>
                                    <IonAccordionGroup>
                                        <IonAccordion value="first">
                                            <IonItem slot="header" color="light">
                                                <IonLabel>Web Search Advanced configuration</IonLabel>
                                            </IonItem>
                                            <div className="ion-padding" slot="content">
                                                <IonRow>
                                                    <IonCol size="4">
                                                        <IonInput type='number' step="0.1" className='mb-4 text-sm' label="Generation Max Tokens" labelPlacement="floating" fill="outline" placeholder="Enter Generation Max Tokens"
                                                            {...register("web_search_generation_max_tokens", {
                                                                validate: {},
                                                            })}
                                                            ><IonIcon id="generation-max-tokens" className="block absolute left-0 -top-1.5 z-10 cursor-pointer" slot="icon-only" icon={informationCircle}></IonIcon>
                                                        </IonInput>
                                                        <IonPopover className="rating-popover" size="auto" trigger="generation-max-tokens" triggerAction="hover">
                                                            <IonContent class="ion-padding">
                                                                Maximum number of tokens in the answer of the LLM. If the LLM attempts to generate more tokens, there may be a cut-off mid-response.
                                                            </IonContent>
                                                        </IonPopover>
                                                    </IonCol>
                                                    <IonCol size="4">
                                                        <IonInput type='number' step="0.1" className='mb-4 text-sm' label="Temperature" labelPlacement="floating" fill="outline" placeholder="Enter Temperature"
                                                            {...register("web_search_temperature", {
                                                                validate: {},
                                                            })}
                                                            ><IonIcon id="temperature" className="block absolute left-0 -top-1.5 z-10 cursor-pointer" slot="icon-only" icon={informationCircle}></IonIcon>
                                                        </IonInput>
                                                        <IonPopover className="rating-popover" size="auto" trigger="temperature" triggerAction="hover">
                                                            <IonContent class="ion-padding">
                                                                Temperature is used to control the randomness of the output. When you set it higher, you'll get more random outputs. When you set it lower, towards 0, the values are more deterministic.
                                                            </IonContent>
                                                        </IonPopover>
                                                    </IonCol>
                                                    <IonCol size="4">
                                                        <IonInput className='mb-4 text-sm' label="LLM Name" labelPlacement="floating" fill="outline" placeholder="Enter LLM Name"
                                                            {...register("web_search_llm_name", {
                                                                validate: {},
                                                            })}
                                                            ><IonIcon id="llm-name" className="block absolute left-0 -top-1.5 z-10 cursor-pointer" slot="icon-only" icon={informationCircle}></IonIcon>
                                                        </IonInput>
                                                        <IonPopover className="rating-popover" size="auto" trigger="llm-name" triggerAction="hover">
                                                            <IonContent class="ion-padding">
                                                                The name of the LLM used for copy generation. This should match the name of one of the LLMs configured in the system.
                                                            </IonContent>
                                                        </IonPopover>
                                                    </IonCol>
                                                    <IonCol size="4">
                                                        <IonInput className='mb-4 text-sm' label="Reasoning Effort" labelPlacement="floating" fill="outline" placeholder="Enter Reasoning Effort"
                                                            {...register("web_search_reasoning_effort", {
                                                                validate: {},
                                                            })}
                                                            ><IonIcon id="reasoning-effort" className="block absolute left-0 -top-1.5 z-10 cursor-pointer" slot="icon-only" icon={informationCircle}></IonIcon>
                                                        </IonInput>
                                                        <IonPopover className="rating-popover" size="auto" trigger="reasoning-effort" triggerAction="hover">
                                                            <IonContent class="ion-padding">
                                                                The reasoning effort required for the LLM to generate copy. This should match the configuration in the system.
                                                            </IonContent>
                                                        </IonPopover>
                                                    </IonCol>
                                                    <IonCol size="4" className='flex items-center'>
                                                        <IonCheckbox 
                                                        {...register("no_cache", {
                                                            validate: {},
                                                        })}
                                                        checked={isNoCache as boolean}
                                                        onIonChange={(event: any) => {
                                                            console.log('event', event.detail.checked);
                                                            setValue("no_cache", event.detail.checked);
                                                        }}
                                                        className='mb-4 text-sm' labelPlacement="start"><IonIcon id="no-cache" className=" z-10 cursor-pointer" icon={informationCircle}></IonIcon> Automatic Approval of Validated Examples</IonCheckbox>
                                                        <IonPopover className="rating-popover" size="auto" trigger="no-cache" triggerAction="hover">
                                                            <IonContent class="ion-padding">
                                                                Whether to disable caching of LLM answers. If checked, the system will not cache any LLM answers, which means that the same request may yield different answers if the LLM is non-deterministic (e.g. because of a temperature setting above 0). Additionally, it may increase response times and costs, since the LLM will be asked for an answer every time instead of retrieving it from the cache.
                                                            </IonContent>
                                                        </IonPopover>
                                                    </IonCol>
                                                    
                                                </IonRow>
                                            </div>
                                        </IonAccordion>
                                    </IonAccordionGroup>
                                </IonCard>
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

export default Config;

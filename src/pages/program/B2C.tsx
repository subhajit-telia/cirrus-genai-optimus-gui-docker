import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonChip, IonCol, IonContent, IonFab, IonFabButton, IonFabList, IonGrid, IonHeader, IonIcon, IonInput, IonLoading, IonPage, IonPopover, IonProgressBar, IonRow, IonSelect, IonSelectOption, IonSkeletonText, IonSpinner, IonText, IonTextarea, IonTitle, IonToast, IonToolbar } from '@ionic/react';
import ExploreContainer from '../../components/ExploreContainer';
import AppHeader from '../../components/header/Header';
import { chevronUpCircle, colorPalette, globe, information, link, lockClosed, send, sync, thumbsDownOutline, thumbsUpOutline } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import Tabs from '../../components/tab/Tab';
import templateData from '../../template.json';
import { useForm } from "react-hook-form";
import AWS from 'aws-sdk';
import { HTTPMethod, NetworkInfo } from '../../routes/network';
import DOMPurify from 'dompurify';
import packageJson from '../../../package.json';
import Multiselect from 'multiselect-react-dropdown';
import optimusLogo from '../../theme/assets/optimus-logo.png'
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

type Tab = {
  segment_id: string;
  segment_name: string;
  data: [innerTab]
}
interface innerTab {
  format_id: string,
  format_name: string,
  answer: string
}

interface UserAddModel {
  format: string;
  purpose: string;
  products: string;
  question: string;
}

interface Segment {
  segment_name: string;
  segment_id: string;
  isActive: boolean;
}
interface Purposes {
  purpose_name: string;
  purpose_id: string;
}
interface Products {
  product_id: string;
  product_name: string;
}
interface Formats {
  format_name: string;
  format_id: string;
}

const B2C: React.FC = () => {
  /* Variables start */
  const [segments, setSegments] = useState<Segment[]>([]);
  const [purposes, setPurposes] = useState<Purposes[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Products[]>([]);
  const [products, setProducts] = useState<Products[]>([]);
  const [formats, setFormats] = useState<Formats[]>([]);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingSegments, setLoadingSegments] = useState<boolean>(false);
  const [loadingPurposes, setLoadingPurposes] = useState<boolean>(false);
  const [loadingFormats, setLoadingFormats] = useState<boolean>(false);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);
  const [isShowError, setIsShowError] = useState(false);
  const [isErrorMsg, setIsErrorMsg] = useState('');

  useEffect(() => {
    getSegmentsData();
    getPurposesData();
    getFormatsData();
    getProductsData();

  }, [setSegments]);

  const onSelect = (selectedList:any, selectedItem:any) => {
    setSelectedProducts(selectedList);
    console.log('onSelect', selectedList);
    console.log('onSelect', selectedItem);
    
    // const ids = selectedList.map((product: { product_id: any; }) => product.product_id);
    // setPurposeIds(ids);
  };

  const onRemove = (selectedList:any, removedItem:any) => {
    setSelectedProducts(selectedList);
    console.log('onRemove', selectedList);
    console.log('onRemove', removedItem);
  };
  
  /* -------------get segments data start------------- */
  const getSegmentsData = async () => {
    setLoadingSegments(true);
    try {
      const urlData =NetworkInfo.URL + '/resource/get?table=segments&use_case=content_creation_b2c&columns=segment_id&columns=segment_name';

      const response = await fetch(urlData);
      const responseData = await response.json();
      console.log("Success:", responseData);
      if (response.ok) {
        setSegments(responseData);
        setLoadingSegments(false);
      }
      
    } catch (error: any) {
      console.error("catch failed:", error);
      setLoadingSegments(false);
    }
  };
  /* get segments data end */

  /* -------------get purposes data start------------- */
  const getPurposesData = async () => {
    setLoadingPurposes(true);
    try {
      const urlData =NetworkInfo.URL + '/resource/get?table=purposes&use_case=content_creation_b2c&columns=purpose_id&columns=purpose_name';

      const response = await fetch(urlData);
      const responseData = await response.json();
      console.log("Success:", responseData);

      if (response.ok) {
        setPurposes(responseData);
        setLoadingPurposes(false);
      }
    } catch (error: any) {
      console.error("catch failed:", error);
      setLoadingPurposes(false);
    }
  };
  /* get purposes data end */

  /* -------------get products data start------------- */
  const getProductsData = async () => {
    setLoadingProducts(true);
    try {
      const urlData =NetworkInfo.URL + '/resource/get?table=products&use_case=content_creation_b2c&columns=product_id&columns=product_name';

      const response = await fetch(urlData);
      const responseData = await response.json();
      console.log("Success:", responseData);
      
      if (response.ok) {
        setProducts(responseData);
        setLoadingProducts(false);
      }
    } catch (error: any) {
      console.error("catch failed:", error);
      setLoadingProducts(false);
    }
  };
  /* get products data end */

  /* -------------get formats data start------------- */
  const getFormatsData = async () => {
    setLoadingFormats(true);
    try {
      const urlData =NetworkInfo.URL + '/resource/get?table=formats&use_case=content_creation_b2c&columns=format_id&columns=format_name';

      const response = await fetch(urlData);
      const responseData = await response.json();
      console.log("Success:", responseData);
      
      if (response.ok) {
        setFormats(responseData);
        setLoadingFormats(false);
      }
    } catch (error: any) {
      console.error("catch failed:", error);
      setLoadingFormats(false);
    }
  };
  /* get formats data end */

  /* onClickSegment start */
  const onClickSegment = async (index: number) => {
    setSegments(prevSegmentData => 
      prevSegmentData.map((segment, i) => 
        i === index ? { ...segment, isActive: !segment.isActive } : segment
      )
    );

    console.log('segments', segments);
  };


  /* onClickSegment end */

  /* Function to generate dynamic string using current date and time */
  const generateDateTimeString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const date = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

    return `${year}${month}${date}${hours}${minutes}${seconds}${milliseconds}`;
  };

  /* Function to show loading indicator */
  const showLoadingIndicator = (_isLoading:boolean) => {
    setLoading(_isLoading);
    
  };

  /* -----------Handle form submit start----------- */
  let arrayTab:any;
  let arrayNoSegment:any;
  const handleFormSubmit = (data:any) => {
    let productIds = selectedProducts.map(product => product.product_id);
    data.segment = segments
    .filter(segment => segment.isActive)
    .map(segment => segment.segment_id);

    console.log('data', data);

    if (data.segment.length !== 0 && data.format !== undefined && data.format !== '') {
      console.log('>>>A');
      arrayTab  =  data.segment.map((segment: any) => ({
        segment_id: segment,
        segment_name: segments.find(s => s.segment_id === segment)?.segment_name,
        data: data.format.map((format: any) => ({
          format_id: format,
          format_name: formats.find(f => f.format_id === format)?.format_name,
        }))
      }));

      
    }else if (data.segment.length !== 0 && (data.format === undefined || data.format === '') && data.question !== '') {
      console.log('>>>B');
      arrayTab  =  data.segment.map((segment: any) => ({
        segment_id: segment,
        segment_name: segments.find(s => s.segment_id === segment)?.segment_name,
        data: [{
          format_id: 'customPrompts',
          format_name: data.question
        }]
      }));
      
    }else if (data.segment.length === 0 && data.format !== undefined && data.format !== ''){
      console.log('>>>C');
      console.log(data.format.length);
      arrayNoSegment = data.format.map((format: any) => ({
        format_id: format,
        format_name: formats.find(f => f.format_id === format)?.format_name,
      }))
      
    }
    

    
    

    if (data.format !== undefined && data.format !== '' && data.segment.length > 0) {
      console.log('>>>1');
      data.format.forEach((format: any) => {
        data.segment.forEach((segment: any) => {
          console.log('call>>>>',format, segment);
          let eachItem = {
            user : 'ibu4416',
            session_id : generateDateTimeString(),
            qid : generateDateTimeString(),
            use_case : 'content_creation_b2c',
            product_ids : productIds,
            question: data.question,
            purpose_id: data.purpose,
            segment_id: segment,
            format_id: format
          }
          handleApiCall(eachItem);
        });
      });
      setTabs(arrayTab);
    }else if (data.format !== undefined && data.format !== '' && data.segment.length === 0) {
      console.log('>>>2');
      data.format.forEach((format: any) => {
        let eachItem = {
          user : 'ibu4416',
          session_id : generateDateTimeString(),
          qid : generateDateTimeString(),
          use_case : 'content_creation_b2c',
          product_ids : productIds,
          question: data.question,
          purpose_id: data.purpose,
          segment_id: '',
          format_id: format
        }
        handleApiCall(eachItem);
      });
      setTabs(arrayNoSegment);
    }else if ((data.format === undefined || data.format === '') && data.segment.length !== 0 && data.question !== '') {
      console.log('>>>3');
      data.segment.forEach((segment: any) => {
        let eachItem = {
          user : 'ibu4416',
          session_id : generateDateTimeString(),
          qid : generateDateTimeString(),
          use_case : 'content_creation_b2c',
          product_ids : productIds,
          question: data.question,
          purpose_id: data.purpose,
          segment_id: segment,
          format_id: ''
        }
        handleApiCall(eachItem);
      });
      setTabs(arrayTab);
    }else {
      console.log('>>>4');
      if ((data.format === undefined || data.format === '') && data.question === '') {
        setIsShowError(true);
        setIsErrorMsg('You have to choose any format or write any prompts.');
      }else {
        let eachItem = {
          user : 'ibu4416',
          session_id : generateDateTimeString(),
          qid : generateDateTimeString(),
          use_case : 'content_creation_b2c',
          product_ids : productIds,
          question: data.question,
          purpose_id: data.purpose,
          segment_id: '',
          format_id: ''
        }
        arrayNoSegment= [];
        let customFormat = {
          format_id: 'customPrompts',
          format_name: data.question
        };
        arrayNoSegment.push(customFormat);
        handleApiCall(eachItem);
        setTabs(arrayNoSegment);
      }
      
    }
    console.log('arrayTab', arrayTab);
    console.log('arrayNoSegment', arrayNoSegment);
    
  };
  const handleApiCall = async (data: any) => {
    setLoading(true);
    let formUrl = NetworkInfo.URL + '/process_json';
    console.log('payload', data);
    try {
      const response = await fetch(formUrl, {
        method: HTTPMethod.POST,
        headers: {
          Authorization: `Bearer`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
      });
      const responseData = await response.json();
      console.log("Success:", responseData);

      if (response.ok) {
        console.log('arrayTab>>>', arrayTab);
        console.log('arrayNoSegment', arrayNoSegment);
        console.log('tabs>>>', tabs);
        let updatedDataArray = tabs;
        if (arrayTab !== undefined) {
          updatedDataArray = arrayTab.map((segment: { segment_id: any; segment_name: any; data: any[]; }) => {
            if (segment.segment_id === responseData.input_params.segment_id) {
              segment.segment_name = responseData.input_params.segment_name;
              if (segment.data.length !== 0) {
                segment.data = segment.data.map(format => {
                  if (format.format_id === responseData.input_params.format_id) {
                    return {
                      ...format,
                      answer: DOMPurify.sanitize(responseData.answer),
                      format_name: responseData.input_params.format_name
                    };
                  }else if (responseData.input_params.format_id === "" || responseData.input_params.format_id === undefined){
                    return {
                      ...format,
                      answer: DOMPurify.sanitize(responseData.answer),
                      format_name: responseData.input_params.question
                    };
                  }
                  return format;
                });
              }else {
                console.log('Seg....',segment.data.length)
                let noFormat = {
                  format_id: responseData.input_params.segment_id,
                  answer: DOMPurify.sanitize(responseData.answer),
                  format_name: ' '
                };
                segment.data.push(noFormat);
              }
              
            }
            return segment;
          });
          console.log('updatedDataArray', updatedDataArray);
  
          setTabs(updatedDataArray);
        }else {
          arrayNoSegment = arrayNoSegment.map((format: { format_id: any; }) => {
            if (format.format_id === responseData.input_params.format_id || format.format_id === 'customPrompts') {
              return {
                ...format,
                answer: DOMPurify.sanitize(responseData.answer),
                format_name: responseData.input_params.format_name === '' ? responseData.input_params.question : responseData.input_params.format_name
              };
            }
            return format;
          });
          console.log('prevArray', arrayNoSegment);
          setTabs(arrayNoSegment);
        }
        

        console.log('tabs', tabs);
        setLoading(false);
        showLoadingIndicator(false);
      }
      
    } catch (error: any) {
      console.error("Login failed:", error);
      setIsShowError(true);
      setIsErrorMsg('Something went wrong!');
      setLoading(false);
      showLoadingIndicator(false);
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
  } = useForm<UserAddModel>({
    defaultValues: {
    },
  });
  /* Handle form input field changes end */

  /* ---------------Reset form start--------------- */
  const handleReset = () => {
    reset();

    const updatedSegments = segments.map(segment => ({
      ...segment,
      isActive: false
    }));
    arrayTab = [];
    arrayNoSegment = [];
    setSegments(updatedSegments);
    setTabs([]);
    setSelectedProducts([]);
    setValue("format", '');
    setValue("purpose", '');
    setValue("products", '');
    setValue("question", '');
  };

  /*  Reset form end */

  return (
    <IonPage>
      <AppHeader/>
      <IonContent className='page-body'>
        <div className='max-w-[80%] m-auto relative'>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="w-full">
            <div className='text-center'>
              <img className='m-auto' src={optimusLogo} />
              <p>AI-assistance</p>
            </div>
            <IonGrid>
              <IonRow>
                <IonCol size="12" size-lg="4" size-md="4" size-sm="12">
                  <div className='rounded-xl text-[#000] bg-white shadow-md'>
                    <div className='font-bold p-4 text-sm'>I want to create a...</div>
                    <div className='px-4 pb-3.5'>
                      <IonSelect placeholder="Select formats" disabled={formats.length === 0} className='min-h-10 field-item' label="Select desired format below" multiple={true} interface="popover" labelPlacement="stacked" fill="outline"
                        {...register("format", {
                          validate: {},
                        })}>
                          {formats.map((item, index) => (
                            <IonSelectOption key={index} value={item.format_id}>{item.format_name}</IonSelectOption>
                          ))}
                        </IonSelect>
                        { loadingFormats &&
                          <IonProgressBar className='mt-0.5' type="indeterminate"></IonProgressBar>
                        }
                        
                    </div>
                  </div>
                </IonCol>
                <IonCol size="12" size-lg="4" size-md="4" size-sm="12">
                  <div className='rounded-xl text-[#000] bg-white shadow-md'>
                    <div className='font-bold p-4 text-sm'>With the purpose...</div>
                    <div className='px-4 pb-3.5'>
                      <IonSelect placeholder="Select purpose" disabled={purposes.length === 0} className='min-h-10 field-item' label="Which product/offer do you want to report on?" interface="popover" labelPlacement="stacked" fill="outline"
                        {...register("purpose", {
                          validate: {},
                        })}>
                          {purposes.map((item, index) => (
                            <IonSelectOption key={index} value={item.purpose_id}>{item.purpose_name}</IonSelectOption>
                          ))}
                        </IonSelect>
                        { loadingPurposes &&
                          <IonProgressBar className='mt-0.5' type="indeterminate"></IonProgressBar>
                        }
                    </div>
                  </div>
                </IonCol>
                <IonCol size="12" size-lg="4" size-md="4" size-sm="12">
                  <div className='rounded-xl text-[#000] bg-white shadow-md'>
                    <div className='font-bold p-4 text-sm'>About...</div>
                    <div className='px-4 pb-3.5 custom-search relative'>
                      <p>Which product/offer do you want to report on?</p>
                      <Multiselect
                        displayValue="product_name"
                        placeholder="Select products"
                        options={products} // Options to display in the dropdown
                        selectedValues= {selectedProducts}
                        onKeyPressFn={function noRefCheck(){}}
                        onRemove={onRemove}
                        onSearch={function noRefCheck(){}}
                        onSelect={onSelect}
                        {...register("products", {
                          validate: {},
                        })}
                      />
                      { loadingProducts &&
                        <IonProgressBar className='mt-0.5' type="indeterminate"></IonProgressBar>
                      }
                    </div>
                  </div>
                </IonCol>
              </IonRow>
            </IonGrid>
            {
              segments.length !== 0 &&
              <div>
                <p className='text-center mt-2.5'>I want to create versions to the following segments</p>
                <div className='segments flex max-sm:flex-col max-md:flex-col items-center justify-center mt-2.5'>
                  {segments.map((item, index) => (
                    <IonChip key={index} onClick={() => onClickSegment(index)} className={`${item.isActive} mx-2.5 min-h-6 py-0 bg-[#f5e0ff] text-[#4a2a59]`}>{item.segment_name}</IonChip>
                  ))}
                </div>
              </div>
            }
            {loadingSegments &&
            <div className='segments flex max-sm:flex-col max-md:flex-col items-center justify-center mt-2.5'>
              <IonSkeletonText className='mx-2.5 min-h-6 py-0 bg-[#f5e0ff] rounded-xl' animated={true} style={{ width: '22%' }}></IonSkeletonText>
              <IonSkeletonText className='mx-2.5 min-h-6 py-0 bg-[#f5e0ff] rounded-xl' animated={true} style={{ width: '22%' }}></IonSkeletonText>
              <IonSkeletonText className='mx-2.5 min-h-6 py-0 bg-[#f5e0ff] rounded-xl' animated={true} style={{ width: '22%' }}></IonSkeletonText>
              <IonSkeletonText className='mx-2.5 min-h-6 py-0 bg-[#f5e0ff] rounded-xl' animated={true} style={{ width: '22%' }}></IonSkeletonText>
            </div>
            }
            
            
            
            <IonGrid className='mt-7'>
              <IonRow>
                <IonCol>
                  <IonTextarea
                    className='bottom-textarea rounded-xl'
                    aria-label="Custom textarea"
                    placeholder="Write your own promt."
                    autoGrow={true}
                    counter={true}
                    maxlength={2000}
                    {...register("question", {
                      validate: {},
                    })}
                  >
                    <IonButton onClick={() => showLoadingIndicator(true)} size="small" fill="clear" slot="end" type='submit'>
                      {loading ? <IonIcon className='text-primary animate-spin' slot="icon-only" icon={sync}></IonIcon> : <IonIcon className='text-primary' slot="icon-only" icon={send}></IonIcon>}
                    </IonButton>
                  </IonTextarea>
                </IonCol>
              </IonRow>
            </IonGrid>
            
            
            {tabs.length > 0 ?
            <IonGrid>
              <IonRow>
                <IonCol>
                  <div className="mx-2.5 mt-7">
                    <Tabs tabs={tabs} />
                    <div className="flex mt-3 items-center justify-between">
                      <div>
                        <IonIcon className='mr-2.5 cursor-pointer hover:text-primary' slot="icon-only" icon={thumbsUpOutline}></IonIcon>
                        <IonIcon className='mr-2.5 cursor-pointer hover:text-primary' slot="icon-only" icon={thumbsDownOutline}></IonIcon>
                      </div>
                      <div>
                        <IonChip className='text-sm ml-2.5 mr-0 min-h-6 py-0 bg-white text-primary border-primary border-2 font-semibold rounded-lg'>Rewrite all suggestions</IonChip>
                        <IonChip className='text-sm ml-2.5 mr-0 min-h-6 py-0 bg-white text-primary border-primary border-2 font-semibold rounded-lg'>Send to contentfull</IonChip>
                        <IonChip className='text-sm ml-2.5 mr-0 min-h-6 py-0 bg-white text-primary border-primary border-2 font-semibold rounded-lg'>Save all suggestions to word.doc</IonChip>
                        <IonChip onClick={handleReset} className='text-sm ml-2.5 mr-0 min-h-6 py-0 bg-white text-primary border-primary border-2 font-semibold rounded-lg'>Create new task</IonChip>
                      </div>
                    </div>
                  </div>
                </IonCol>
              </IonRow>
            </IonGrid>
            :
            <div className='text-center mt-6'>
              <IonButton type='submit' className='btn-primary' shape="round">
              {loading && <IonSpinner className='mr-2' name="bubbles"></IonSpinner>}
                Start the magic
              </IonButton>
            </div>
            }
            
          </form>
        </div>

        <IonFab slot="fixed" vertical="bottom" horizontal="end">
          <IonFabButton size="small">
            <IonIcon icon={information}></IonIcon>
          </IonFabButton>
          <IonFabList side="top">
            <IonFabButton title='API' id="endpoint">
              <IonIcon icon={globe}></IonIcon>
            </IonFabButton>
            <IonFabButton title='Version' id="app-version">
              <IonIcon icon={link}></IonIcon>
            </IonFabButton>
          </IonFabList>
        </IonFab>
        <IonToast className='custom-toast' icon={globe} trigger="endpoint" message={import.meta.env.VITE_API_URL} buttons={[
          {
            text: 'Close',
          },
        ]} duration={3000}></IonToast>
        <IonToast className='custom-toast' icon={link} trigger="app-version" message={`App Version: ${packageJson.version}`} buttons={[
          {
            text: 'Close',
          },
        ]} duration={3000}></IonToast>
        <IonToast
          className='custom-toast'
          isOpen={isShowError}
          message={isErrorMsg}
          duration={3000}
          onDidDismiss={() => setIsShowError(false)}
        ></IonToast>
      </IonContent>
    </IonPage>
  );
};

export default B2C;

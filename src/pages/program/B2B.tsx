import { IonButton, IonButtons, IonCheckbox, IonChip, IonCol, IonContent, IonFab, IonFabButton, IonFabList, IonFooter, IonGrid, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonModal, IonPage, IonProgressBar, IonRow, IonSkeletonText, IonSpinner, IonText, IonTextarea, IonTitle, IonToast, IonToggle, IonToolbar, ToggleCustomEvent } from '@ionic/react';
import AppHeader from '../../components/header/Header';
import { attach, closeCircle, closeCircleOutline, closeOutline, documentAttach, documentAttachOutline, globe, information, informationCircle, link } from 'ionicons/icons';
import { useEffect, useRef, useState } from 'react';
import Tabs from '../../components/tab/Tab';
import { useForm } from "react-hook-form";
import { HTTPMethod, NetworkInfo } from '../../routes/network';
import DOMPurify from 'dompurify';
import packageJson from '../../../package.json';
import Multiselect from 'multiselect-react-dropdown';
import optimusLogo from '../../theme/assets/optimus-logo.png'
import { saveAs } from 'file-saver';
import SelectDropdown from '../../components/dropdown/Dropdown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import ProductDropdown from '../../components/dropdown/productDropdown/ProductDropdown';
import { Tooltip } from 'react-tooltip';
import { i } from 'vite/dist/node/types.d-aGj9QkWt';
import template from '../../template.json'; // adjust path if needed

type Tab = {
  answer: string;
  segment_id: string;
  segment_name: string;
  outputs:[innerOutput]
  data: [innerTab]
}
interface innerTab {
  format_id: string,
  format_name: string,
  answer: string,
  input_params: string,
  outputs: [innerOutput]
}

interface innerOutput {
  answer: string,
  input_params: any
  rating: number | null
}

interface UserAddModel {
  format: string;
  purpose: string;
  products: string;
  question: string;
  contentName: string;
  createAssembly:boolean
  kb_number: string;
}

interface Segment {
  segment_name: string;
  segment_id: string;
  isActive: boolean;
}
interface Purposes {
  purpose_name: string;
  purpose_id: string;
  purpose_written_description: string;
}
interface Products {
  product_id: string;
  product_name: string;
  category: string;
}
interface Formats {
  format_name: string;
  format_id: string;
  format_written_description: string;
}
const forbiddenChars = /[!@#$%^&*(),?":{}|<>]/;
const B2B: React.FC = () => {
  /* Variables start */
  const [segments, setSegments] = useState<Segment[]>([]);
  const [purposes, setPurposes] = useState<Purposes[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Products[]>([]);
  const [products, setProducts] = useState<Products[]>([]);
  const [formats, setFormats] = useState<Formats[]>([]);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [noSegmentArray, setNoSegmentArray] = useState<[]>([]);
  const [tabArray, setTabArray] = useState<[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingSegments, setLoadingSegments] = useState<boolean>(false);
  const [loadingPurposes, setLoadingPurposes] = useState<boolean>(false);
  const [loadingFormats, setLoadingFormats] = useState<boolean>(false);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);
  const [isShowError, setIsShowError] = useState(false);
  const [isErrorMsg, setIsErrorMsg] = useState('');
  const [isErrorType, setIsErrorType] = useState('');
  const [requestData, setRequestData] = useState('');
  const [selectedFormats, setSelectedFormats] = useState<typeof formats[0][]>([]);
  const [selectedPurpose, setSelectedPurpose] = useState<typeof purposes[0][]>([]);
  const [userName, setUserName] = useState('');
  const [tigaRoles, setTigaRoles] = useState([]);
  const apiUrl = window.RUNTIME_ENV?.REACT_APP_API_URL || NetworkInfo.URL;
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isOpenEditing, setIsOpenEditing] = useState(false);
  const [selectedDiv, setSelectedDiv] = useState<number | null>(null);
  const [selfLearningData, setSelfLearningData] = useState<any>('');
  const [feedbackCopy, setFeedbackCopy] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const storedVersion = localStorage.getItem("app_version");
  const [isContentfulModal, setIsContentfulModal] = useState(false);
  const [contentfulCopy, setContentfulCopy] = useState<any[]>([]);
  const [qidHistory, setQidHistory] = useState<{ id: string; parent_id: string }[]>([]);
  const [sessionId, setSessionId] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [attachments, setAttachments] = useState<string>('');
  const [isUploadAttachement, setIsUploadAttachement] = useState(false);
  const [knowledgeBaseEnabled, setKnowledgeBaseEnabled] = useState<boolean>(false);
  const [isKnowledgeBaseModal, setIsKnowledgeBaseModal] = useState(false);
  const [isKnowledgeBaseData, setKnowledgeBaseData] = useState<any[]>([]);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [isTroubleshooting, setIsTroubleshooting] = useState(false);
  const [isCreateAssembly, setIsCreateAssembly] = useState(false);
  const [contentError, setContentError] = useState("");
  const [contentName, setContentName] = useState("");

  useEffect(() => {
    let userLocalData:any = localStorage.getItem('user');
    let userData = JSON.parse(userLocalData);
    setUserName(userData.username);
    setTigaRoles(userData.tiga_roles || []);
    console.log('userData', userData);
    
    getSegmentsData();
    getPurposesData();
    getFormatsData();
    getProductsData();


    if (storedVersion === null || storedVersion !== packageJson.version) {
      console.log('version', packageJson.version);
      console.log('storedVersion', storedVersion);
      // alert('This is an alert!');
      localStorage.setItem("app_version", packageJson.version);
      window.location.reload();
    }else {
      console.log('version', packageJson.version);
    }

  }, [setSegments, setTabs]);

  useEffect(() => {
    console.log('loading......');
    setSessionId(generateDateTimeString());
  }, []);

  const onSelect = (selectedList:any, selectedItem:any) => {
    setSelectedProducts(selectedList);
    console.log('onSelect', selectedList);
    console.log('onSelect', selectedItem);
    
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
      const urlData =apiUrl + '/resource/get?table=segments&use_case=content_creation_b2b&columns=segment_id&columns=segment_name';

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
      const urlData =apiUrl + '/resource/get?table=purposes&use_case=content_creation_b2b&columns=purpose_id&columns=purpose_name&columns=purpose_written_description';

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
      const urlData =apiUrl + '/resource/get?table=products_b2b&columns=product_id&columns=product_name&columns=category';

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
      const urlData =apiUrl + '/resource/get?table=formats&use_case=content_creation_b2b&columns=format_id&columns=format_name&columns=format_written_description';

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
  let arrayTab: any;
  let arrayNoSegment: any;

  const handleFormSubmit = (data: any) => {
    console.log('selectedPurpose', selectedPurpose);
    setQidHistory([]);
    setIsTroubleshooting(false);
    setFeedbackCopy([]);
    data.format = selectedFormats.map(format => format.format_id);
    data.purpose = selectedPurpose.length > 0 && selectedPurpose[0].purpose_id 
      ? selectedPurpose[0].purpose_id 
      : '';
    
    setRequestData(data);
    let productIds = selectedProducts.map(product => product.product_id);
    data.segment = segments.filter(segment => segment.isActive).map(segment => segment.segment_id);

    console.log('data', data);

    if (data.segment.length !== 0 && data.format !== undefined && data.format !== '') {
      console.log('>>>A');
      arrayTab  =  data.segment.map((segment: any) => ({
        segment_id: segment,
        segment_name: segments.find(s => s.segment_id === segment)?.segment_name,
        data: data.format.map((format: any) => ({
          format_id: format,
          format_name: formats.find(f => f.format_id === format)?.format_name,
          answer: '',
          outputs: []
        }))
      }));
    } else if (data.segment.length !== 0 && (data.format === undefined || data.format === '') && data.question !== '') {
      console.log('>>>B');
      arrayTab  =  data.segment.map((segment: any) => ({
        segment_id: segment,
        segment_name: segments.find(s => s.segment_id === segment)?.segment_name,
        data: [{
          format_id: 'customPrompts',
          format_name: data.question,
          answer: '',
          outputs: []
        }]
      }));
    } else if (data.segment.length === 0 && data.format !== undefined && data.format !== '' && data.format.length !== 0) {
      console.log('>>>C');
      arrayNoSegment = data.format.map((format: any) => ({
        format_id: format,
        format_name: formats.find(f => f.format_id === format)?.format_name,
        answer: '',
        outputs: []
      }));
    } else if ((data.format === undefined || data.format === '') && data.segment.length !== 0 && data.question !== '') {
      console.log('>>>3');
      data.segment.forEach((segment: any) => {
        let eachItem = {
          user: userName,
          session_id: generateDateTimeString(),
          session_family_id: sessionId,
          use_case: 'content_creation_b2b',
          product_ids: productIds,
          question: data.question,
          purpose_id: data.purpose,
          segment_id: segment,
          format_id: ''
        };
        handleApiCall(eachItem);
      });
      setTabs(arrayTab);
    } else {
      console.log('>>>4');
      if ((data.format === undefined || data.format === '' || data.format.length === 0) && data.question === '') {
        setIsShowError(true);
        setIsErrorMsg('You have to choose any format or write any prompts.');
      } else {
        let eachItem = {
          user: userName,
          session_id: generateDateTimeString(),
          session_family_id: sessionId,
          use_case: 'content_creation_b2b',
          product_ids: productIds,
          question: data.question,
          purpose_id: data.purpose,
          segment_id: '',
          format_id: ''
        };
        arrayNoSegment = [
          {
            format_id: 'customPrompts',
            format_name: data.question,
            answer: '',
            outputs: []
          }
        ];
        handleApiCall(eachItem);
        setTabs(arrayNoSegment);
      }
    }

    // Trigger API call based on the conditions
    if (data.format !== undefined && data.format !== '' && data.segment.length > 0) {
      console.log('>>>1');
      data.format.forEach((format: any) => {
        data.segment.forEach((segment: any) => {
          let eachItem = {
            user: userName,
            session_id: generateDateTimeString(),
            session_family_id: sessionId,
            use_case: 'content_creation_b2b',
            product_ids: productIds,
            question: data.question,
            purpose_id: data.purpose,
            segment_id: segment,
            format_id: format
          };
          handleApiCall(eachItem);
        });
      });
      setTabs(arrayTab);
    } else if (data.format !== undefined && data.format !== '' && data.format.length !== 0 && data.segment.length === 0) {
      console.log('>>>2');
      data.format.forEach((format: any) => {
        let eachItem = {
          user: userName,
          session_id: generateDateTimeString(),
          session_family_id: sessionId,
          use_case: 'content_creation_b2b',
          product_ids: productIds,
          question: data.question,
          purpose_id: data.purpose,
          segment_id: '',
          format_id: format
        };
        handleApiCall(eachItem);
      });
      setTabs(arrayNoSegment);
    }

    console.log('arrayTab', arrayTab);
    console.log('arrayNoSegment', arrayNoSegment);
  };


  const handleApiCall = async (data: any) => {
    console.log('data>>', data);
    setLoading(true);
    let formUrl = apiUrl + '/chat/request';
    console.log('payload', data);
    console.log('arrayTab>>>', arrayTab);
    console.log('arrayNoSegment', arrayNoSegment);
    data.attached_text = attachments;
    data.kb_pages = isKnowledgeBaseData;
    try {
      const response = await fetch(formUrl, {
        method: HTTPMethod.POST,
        headers: {
          '"removed"': `${NetworkInfo.ACCESSTOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
      });
  
      const responseData = await response.json();
      console.log('Success:', responseData);
  
      if (response.ok && !responseData.ErrorMessage) {
        
        setNoSegmentArray(arrayNoSegment);
        setTabArray(arrayTab);
        console.log('tabs>>>', tabs);
        if (responseData.responses.length === 1) {
          if (arrayTab !== undefined) {
            arrayTab = arrayTab.map((segment: { segment_id: any; segment_name: any; data: any[] }) => {
              if (segment.segment_id === responseData.responses[0].input_params.segment_id) {
                segment.data = segment.data.map((format: any) => {
                  if (format.format_id === responseData.responses[0].input_params.format_id) {
                    return {
                      ...format,
                      answer: DOMPurify.sanitize(responseData.responses[0].answer),
                      input_params: responseData.responses[0].input_params,
                      outputs: [
                        ...(format.outputs || []),
                        { 
                          answer: DOMPurify.sanitize(responseData.responses[0].answer), 
                          input_params: responseData.responses[0].input_params ,
                          rating: null,
                          timestamp: Date.now()
                        }
                      ]
                    };
                  }
                  return format;
                });
              }
              return segment;
            });
            setTabs(arrayTab);
          } else {
            arrayNoSegment = arrayNoSegment.map((format: { format_id: any; outputs?: any[] }) => {
              if (format.format_id === responseData.responses[0].input_params.format_id || format.format_id === 'customPrompts') {
                const currentOutputs = format.outputs || [];
                return {
                  ...format,
                  answer: DOMPurify.sanitize(responseData.responses[0].answer),
                  input_params: responseData.responses[0].input_params,
                  outputs: [
                    ...currentOutputs,
                    { 
                      answer: DOMPurify.sanitize(responseData.responses[0].answer), 
                      input_params: responseData.responses[0].input_params ,
                      rating: null,
                      timestamp: Date.now()
                    }
                  ]
                };
              }
              return format;
            });
            setTabs(arrayNoSegment);
          }
          setLoading(false);
          showLoadingIndicator(false);
        }else {
          setSelectedDiv(null)
          
          // setFeedbackCopy(responseData);
          setFeedbackCopy(prevArray => [...prevArray, responseData]); 
          setCurrentIndex(0);
          setIsOpenModal(true);
          setTimeout(() => console.log('feedbackCopy', feedbackCopy), 300); 
          
          return;
        }
      } else {
        setIsShowError(true);
        setIsErrorMsg(responseData.ErrorMessage || 'Something went wrong!');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
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
      createAssembly: false
    },
  });
  /* Handle form input field changes end */

  /* ---------------Reset form start--------------- */
  const handleReset = () => {
    reset();
    setSessionId(generateDateTimeString());
    const updatedSegments = segments.map(segment => ({
      ...segment,
      isActive: false
    }));
    arrayTab = [];
    arrayNoSegment = [];
    setFeedbackCopy([]);
    setKnowledgeBaseData([]);
    setSegments(updatedSegments);
    setTabs([]);
    setSelectedProducts([]);
    setSelectedFormats([]);
    setSelectedPurpose([]);
    setValue("format", '');
    setValue("purpose", '');
    setValue("products", '');
    setValue("question", '');
    handleRemoveFile();
    setQidHistory([]);
    setIsTroubleshooting(false);
  };
  /*  Reset form end */

  /* ---------------Regenarate item start--------------- */
  const regenarateItem = (data: any): void => {
    console.log('tabArray', tabArray);
    
    data.user = userName;
    arrayNoSegment = tabs;
    arrayTab = tabArray;
    handleApiCall(data);
  };
  /* Regenarate item end */

  /* ----------Save edit answer copy start---------- */
  const saveEditedAnswer = async (data: any): Promise<void> => {
    console.log('saveEditedAnswer', data);
    arrayNoSegment = tabs;
    arrayTab = tabArray;
    console.log('arrayTab>>', arrayTab);
    let formUrl = apiUrl + '/chat/save';
    try {
      const response = await fetch(formUrl, {
        method: HTTPMethod.POST,
        headers: {
          '"removed"': `${NetworkInfo.ACCESSTOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
      });
  
      const responseData = await response.json();
      console.log('Success:', responseData);
  
      if (response.ok && !responseData.ErrorMessage) {
        setNoSegmentArray(arrayNoSegment);
        setTabArray(arrayTab);
        console.log('tabs>>>', tabs);
        console.log('arrayTab>>>', arrayTab);
        console.log('arrayNoSegment>>>', arrayNoSegment);
  
        if (arrayTab !== undefined) {
          arrayTab = arrayTab.map((segment: { segment_id: any; segment_name: any; data: any[] }) => {
            if (segment.segment_id === responseData.responses[0].input_params.segment_id) {
              segment.data = segment.data.map((format: any) => {
                if (format.format_id === responseData.responses[0].input_params.format_id) {
                  let replaceOutput = format.outputs.map((output:innerOutput) => 
                    output.input_params.qid === data.qid 
                    ? { 
                        ...responseData.responses[0], 
                        timestamp: Date.now() 
                      }
                    : output
                  );
                  return {
                    ...format,
                    answer: DOMPurify.sanitize(responseData.responses[0].answer),
                    input_params: responseData.responses[0].input_params,
                    outputs: replaceOutput
                  };
                }
                return format;
              });
            }
            return segment;
          });
          setTabs(arrayTab);
        } else {
          arrayNoSegment = arrayNoSegment.map((format: { format_id: any; outputs: innerOutput[] }) => {
            if (format.format_id === responseData.responses[0].input_params.format_id || format.format_id === 'customPrompts') {
              let replaceOutput = format.outputs.map((output:innerOutput) => 
                output.input_params.qid === data.qid 
                ? { 
                    ...responseData.responses[0], 
                    timestamp: Date.now() 
                  }
                : output
              );
              return {
                ...format,
                answer: DOMPurify.sanitize(responseData.responses[0].answer),
                input_params: responseData.responses[0].input_params,
                outputs: replaceOutput
              };
            }
            return format;
          });
          setTabs(arrayNoSegment);
        }
  
        setLoading(false);
        showLoadingIndicator(false);
      } else {
        setIsShowError(true);
        setIsErrorMsg(responseData.ErrorMessage || 'Something went wrong!');
      }
      
    } catch (error: any) {
      console.error('Login failed:', error);
      if (error.response) {
        setIsShowError(true);
        setIsErrorMsg(error.response || 'Something went wrong!');
      }else {
        setIsShowError(true);
        setIsErrorMsg(error.response || 'Please generate again!');
      }
    }

  };
  /* Save edit answer copy end */

  /* ----------genarate Refine Copy start---------- */
  const genarateRefineCopy = async (data: any): Promise<void> => {
    console.log('genarateRefineCopy', data);
    arrayNoSegment = tabs;
    arrayTab = tabArray;
    console.log('arrayTab>>', arrayTab);
    let formUrl = apiUrl + '/chat/edit';
    try {
      const response = await fetch(formUrl, {
        method: HTTPMethod.POST,
        headers: {
          '"removed"': `${NetworkInfo.ACCESSTOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
      });
  
      const responseData = await response.json();
      console.log('Success:', responseData);
  
      if (response.ok && !responseData.ErrorMessage) {
        setNoSegmentArray(arrayNoSegment);
        setTabArray(arrayTab);
        console.log('tabs>>>', tabs);
  
        if (arrayTab !== undefined) {
          arrayTab = arrayTab.map((segment: { segment_id: any; segment_name: any; data: any[] }) => {
            if (segment.segment_id === responseData.responses[0].input_params.segment_id) {
              segment.data = segment.data.map((format: any) => {
                if (format.format_id === responseData.responses[0].input_params.format_id) {
                  let replaceOutput = format.outputs.map((output:innerOutput) => 
                    output.input_params.qid === data.qid ? responseData.responses[0] : output
                  );
                  return {
                    ...format,
                    answer: DOMPurify.sanitize(responseData.responses[0].answer),
                    input_params: responseData.responses[0].input_params,
                    outputs: replaceOutput
                  };
                }
                return format;
              });
            }
            return segment;
          });
          setTabs(arrayTab);
        } else {
          arrayNoSegment = arrayNoSegment.map((format: { format_id: any; outputs: innerOutput[] }) => {
            if (format.format_id === responseData.responses[0].input_params.format_id || format.format_id === 'customPrompts') {
              let replaceOutput = format.outputs.map((output:innerOutput) => 
                output.input_params.qid === data.qid ? responseData.responses[0] : output
              );
              return {
                ...format,
                answer: DOMPurify.sanitize(responseData.responses[0].answer),
                input_params: responseData.responses[0].input_params,
                outputs: replaceOutput
              };
            }
            return format;
          });
          setTabs(arrayNoSegment);
        }

        // if (responseData.responses[0].answer.includes('class="new_content"')) {
        //   console.log('Trueeeeeeeeeeeeeeeeeee');
          
        //   setTimeout(() => {
        //     let currentResponse = responseData.responses[0];
        //     currentResponse.answer = responseData.responses[0].answer.replace(/<span class="new_content">|<\/span>/g, '');
        //     if (arrayTab !== undefined) {
        //       arrayTab = arrayTab.map((segment: { segment_id: any; segment_name: any; data: any[] }) => {
        //         if (segment.segment_id === currentResponse.input_params.segment_id) {
        //           segment.data = segment.data.map((format: any) => {
        //             if (format.format_id === currentResponse.input_params.format_id) {
        //               let replaceOutput = format.outputs.map((output:innerOutput) => 
        //                 output.input_params.qid === data.qid ? currentResponse : output
        //               );
                      
        //               return {
        //                 ...format,
        //                 answer: DOMPurify.sanitize(currentResponse.answer),
        //                 input_params: currentResponse.input_params,
        //                 outputs: replaceOutput
        //               };
        //             }
        //             return format;
        //           });
        //         }
        //         return segment;
        //       });
        //       console.log('arrayTab>>>>>>>>>>>>>>>>>>>>>>', arrayTab);
        //       setTabs(arrayTab);
        //     } else {
        //       arrayNoSegment = arrayNoSegment.map((format: { format_id: any; outputs: innerOutput[] }) => {
        //         if (format.format_id === currentResponse.input_params.format_id || format.format_id === 'customPrompts') {
        //           let replaceOutput = format.outputs.map((output:innerOutput) => 
        //             output.input_params.qid === data.qid ? currentResponse : output
        //           );
                  
        //           return {
        //             ...format,
        //             answer: DOMPurify.sanitize(currentResponse.answer.replace(/<span class="new_content">|<\/span>/g, '')),
        //             input_params: currentResponse.input_params,
        //             outputs: replaceOutput
        //           };
        //         }
        //         return format;
        //       });
        //       console.log('no arrayTab>>>>>>>>>>>>>>>>>>>>>>', arrayNoSegment);
        //       setTabs(arrayNoSegment);
        //     }
        //   }, 3000);    
        // }
  
        setLoading(false);
        showLoadingIndicator(false);
      } else {
        setIsShowError(true);
        setIsErrorMsg(responseData.ErrorMessage || 'Something went wrong!');
      }
    } catch (error: any) {
      console.error('Login failed:', error);

      if (error.response) {
        setIsShowError(true);
        setIsErrorMsg(error.response || 'Something went wrong!');
      }else {
        setIsShowError(true);
        setIsErrorMsg(error.response || 'Please generate again!');
      }
    }

  };
  /* genarate Refine Copy end */

  /* send To contentful start */
  const handleContentfulChange = (e: CustomEvent) => {
    let input = (e.target as HTMLIonInputElement).value as string;
    console.log('raw input>>>>', input);
    // 1. Remove trailing spaces immediately
    if (input.endsWith(" ")) {
      input = input.trimEnd();
    }
    console.log('input>>>>', input);
    // 2. Validate forbidden characters
    if (forbiddenChars.test(input)) {
      console.log('Invalid input detected');
      setContentError("Contains forbidden characters (!@#$%^&* etc.)");
    } else {
      setContentError("");
    }

    setContentName(input);
  };

  const handleContentfulBlur = () => {
    // Trim fully when user leaves the field
    setContentName((prev) => prev.trim());
  };
  const sendTocontentful = async (data: any): Promise<void> => {
    console.log('contentfulData', data);
    console.log('B2B array from template.json:', template.B2B); // <-- log B2B array here
    const B2BFormats = template.B2B;
    const filtered = data.filter((item:any) => {
      const format = B2BFormats.find(
        (f) => f.format_id === item.input_params.format_id
      );

      // If no match found → exclude
      if (!format) return false;

      // Exclude if type_of_content is null
      if (format.type_of_content === null) return false;

      return true;
    });
    setContentfulCopy(filtered)
  }

  const handleContentfulFormSubmit = async (data:any) => {
    
    console.log('handleContentfulFormSubmit', data);
    console.log('contentfulCopy', contentfulCopy);
    let contentAction = 'NEW'

    // Build qid arrays for Generic and Personalized
    let genericQids: { id: string; parent_id: string }[] = [];
    let personalizedQids: { id: string; parent_id: string }[] = [];

    contentfulCopy.forEach((item, idx) => {
      const formatName = item.input_params.format_name || "";
      const newId = item.input_params.qid;
      const prev = qidHistory.find(q => q.id === newId);
      let parent_id = "";
      if (prev) {
        contentAction = 'UPDATE';
        parent_id = prev.parent_id;
      } else {
        const prevQidObj = qidHistory[idx];
        parent_id = prevQidObj ? prevQidObj.id : "";
      }
      const qidObj = { id: newId, parent_id };
      console.log('formatName', formatName);
      if (
        formatName === "Sms" ||
        formatName.startsWith("Email")
      ) {
        personalizedQids.push(qidObj);
      } else {
        genericQids.push(qidObj);
      }
    });

    // Final qid object
    let allQids = {
      Generic: genericQids,
      Personalized: personalizedQids
    };

    // Update the qidHistory for next time (flatten both arrays)
    setQidHistory([...genericQids, ...personalizedQids]);
    console.log('qids', allQids);
    // Determine which types to include in the array
    let types: string[] = [];
    if (genericQids.length > 0) {
      types.push("Generic");
    }
    if (personalizedQids.length > 0 && isPersonalized) {
      types.push("Personalized");
    }

    let payload = {
      contentName: contentName,
      action: contentAction,
      qid: allQids,
      typeOfContent: types,
      createAssembly: data.createAssembly,
    };
    let formUrl = apiUrl + '/contentful/push';
    try {
      const response = await fetch(formUrl, {
        method: HTTPMethod.POST,
        headers: {
          '"removed"': `${NetworkInfo.ACCESSTOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
      });
  
      const responseData = await response.json();
      console.log('Success:', responseData);
  
      if (response.ok && !responseData.ErrorMessage) {
        reset;
        setValue("contentName", '');
        setIsContentfulModal(false);
        setIsShowError(true);
        setIsErrorMsg('Contentful submited successfully!');
        setIsPersonalized(false);
        setIsTroubleshooting(false);
      } else {
        setIsShowError(true);
        setIsErrorMsg(responseData.ErrorMessage || isPersonalized ? 'No Personalized content found.' : 'No Generic content found');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      if (error.response) {
        setIsShowError(true);
        setIsErrorMsg(error.response || isPersonalized ? 'No Personalized content found.' : 'No Generic content found');
      }else {
        setIsShowError(true);
        setIsErrorMsg(error.response || isPersonalized ? 'No Personalized content found.' : 'No Generic content found');
      }
    }
  };
  /* send To contentful end */

  /* -------------handleEditingMode start------------- */
  const handleEditingMode = async (data: boolean): Promise<void> => {
    setIsOpenEditing(data);
    console.log('isOpenEditing', data);
  }
  /* handleEditingMode end */

  /* ---------------Export to doc start--------------- */
  const exportToDoc = (data:any) => {
    console.log('data', data);
    let answers: any;

    if (data[0].data) {
      answers = data.flatMap((segment: { data: any[]; }) =>
        segment.data.flatMap(item =>
            item.outputs.map((output: { answer: any; }) => output.answer  + '\n\n\n' )
        )
      );
    }else {
      answers = data.flatMap((item: { outputs: any[]; }) => item.outputs.map(output => output.answer + '\n\n\n'));
    }


    console.log('answers', answers);
    
    const blob = new Blob([answers], {
      type: 'application/msword;charset=utf-8',
    });

    const fileName = 'optimus.doc';
  
    // Save the file
    saveAs(blob, fileName);
  };
  /* Export to doc end */

  /* ---------------Self learning start--------------- */
  const submitSelfLearning = async () => {
    console.log('selfLearningData', selfLearningData);
     // Set the clicked div's ID as selected
    setIsOpenModal(false);
    setIsShowError(true);
    setIsErrorMsg('Testing submitted!');
    console.log('feedbackCopy', feedbackCopy);
    if (selectedDiv !== null && selectedDiv < feedbackCopy.length - 1) {
      // Move to the next response
      setSelectedDiv(null);
      setCurrentIndex((prev) => prev + 1);
      setTimeout(() => setIsOpenModal(true), 300); // Reopen the modal with the next response
    }
    console.log('arrayNoSegment', noSegmentArray);
    console.log('arrayTab', tabArray);

    let currentArrayTab:any = tabArray;
    let currentNoSegmentArray:any = noSegmentArray;
    if (currentArrayTab !== undefined) {
      currentArrayTab = currentArrayTab.map((segment: { segment_id: any; segment_name: any; data: any[] }) => {
        if (segment.segment_id === selfLearningData.input_params.segment_id) {
          segment.data = segment.data.map((format: any) => {
            if (format.format_id === selfLearningData.input_params.format_id) {
              return {
                ...format,
                answer: DOMPurify.sanitize(selfLearningData.answer),
                input_params: selfLearningData.input_params,
                outputs: [
                  ...(format.outputs || []),
                  { 
                    answer: DOMPurify.sanitize(selfLearningData.answer), 
                    input_params: selfLearningData.input_params ,
                    rating: null,
                    timestamp: Date.now()
                  }
                ]
              };
            }
            return format;
          });
        }
        return segment;
      });
      setTabs(currentArrayTab);
    } else {
      currentNoSegmentArray = currentNoSegmentArray.map((format: { format_id: any; outputs?: any[] }) => {
        if (format.format_id === selfLearningData.input_params.format_id || format.format_id === 'customPrompts') {
          const currentOutputs = format.outputs || [];
          return {
            ...format,
            answer: DOMPurify.sanitize(selfLearningData.answer),
            input_params: selfLearningData.input_params,
            outputs: [
              ...currentOutputs,
              { 
                answer: DOMPurify.sanitize(selfLearningData.answer), 
                input_params: selfLearningData.input_params ,
                rating: null,
                timestamp: Date.now()
              }
            ]
          };
        }
        return format;
      });
      setTabs(currentNoSegmentArray);
    }
    setLoading(false);
    showLoadingIndicator(false);

    let formUrl = apiUrl + '/self_learning/select_answer?qid='+selfLearningData.input_params.qid;
    try {
      const response = await fetch(formUrl, {
        method: HTTPMethod.PUT,
        headers: {
          '"removed"': `${NetworkInfo.ACCESSTOKEN}`,
          'Content-Type': 'application/json'
        },
      });
  
      const responseData = await response.json();
      console.log('Success:', responseData);
    } catch (error: any) {
      console.error('Login failed:', error);
    }
  };
  /* Self learning end */

  const handleClickContentful = (e: React.MouseEvent<HTMLIonChipElement>) => {
    console.log('handleClickContentful', e);
    if (!(e.target as HTMLIonChipElement).disabled) {
      setIsContentfulModal(true);
    }
    console.log('Contentful modal opened', contentfulCopy);

    const emailCount = contentfulCopy.filter(
      (item) => item.input_params.format_name && item.input_params.format_name.startsWith('Email')
    ).length;

    // Step 1: Filter only items with format_id starting with "Email"
    const emailItems = contentfulCopy.filter(item => item.input_params.format_id.startsWith("Email"));
    console.log('emailItems:', emailItems);
    // Step 2: Group by segment_id
    const grouped = emailItems.reduce((acc, item) => {
      const segmentId = item.input_params.segment_id || 'noSegment';
      if (!acc[segmentId]) {
        acc[segmentId] = [];
      }
      acc[segmentId].push(item);
      return acc;
    }, {} as Record<string, typeof contentfulCopy>);
    console.log('grouped by segment_id:', grouped);
    const keyExists = 'noSegment' in grouped;
    console.log('Key "noSegment" exists:', keyExists);
    // Step 3: Check which segment_ids have multiple entries
    const duplicates = Object.entries(grouped).filter(([_, items]: any) => items.length > 1);

    console.log('duplicates:', duplicates);

    if (!keyExists && duplicates.length > 0) {
      console.log('Multiple Email formats found:', emailCount);
      setIsShowError(true);
      setIsErrorMsg('Can only send one email format at a time.');
      setIsContentfulModal(false);
    }
     
    if (keyExists && emailCount > 1) {
      setIsShowError(true);
      setIsErrorMsg('Can only send one email format at a time.');
      setIsContentfulModal(false);
    }
    
    // Loop through the array and check format_name
    contentfulCopy .forEach((item) => {
      const format = item.input_params.format_name;
      if (format.startsWith('Sms') || format.startsWith('Email')) {
        console.log('Matches:', format);
        setIsCreateAssembly(true);
        setIsPersonalized(true);
      }
      if (format.startsWith('Trouble')) {
        setIsTroubleshooting(true);
      }
    });
  };


  /* -------------handle file upload start------------- */
  // Trigger file select dialog
  const handleIconClick = () => {
    fileInputRef.current?.click();
  };

  // Handle drag & drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      uploadFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Handle file selection from dialog
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      uploadFile(file);
    }
  };

  // Upload function - send binary
  const uploadFile = async (file: File) => {
    setIsUploadAttachement(true);
    console.log('Uploading file:', file);
    const formData = new FormData();
    formData.append('file', file);


    try {
      const response = await fetch(apiUrl+'/attachments/upload', {
        method: 'POST',
        headers: {
          '"removed"': `${NetworkInfo.ACCESSTOKEN}`,
        },
        body: formData, // sending raw binary
      });

      const responseData = await response.json();
      setIsUploadAttachement(false);
      if (response.ok) {
        console.log('File uploaded successfully:', responseData);
        setAttachments(responseData.data.attached_text);
        if (responseData.messages.length > 0) {
          console.log('File warning');
          setIsShowError(true);
          setIsErrorMsg(responseData.messages[0].text);
          setIsErrorType('warning');
        }else {
          console.log('File success');
          setIsShowError(true);
          setIsErrorMsg('File uploaded successfully!');
          setIsErrorType('success');
        }
      }else {
        console.error('File upload failed:', responseData);
        setIsShowError(true);
        setIsErrorMsg(responseData.detail);
        setIsErrorType('error');
        handleRemoveFile();
      }


      
      console.log('Upload success:', responseData);
    } catch (err) {
      console.error('Error uploading file:', err);
      setIsUploadAttachement(false);

      // setIsShowError(true);
      // setIsErrorMsg('Something went wrong! Maybe the file is too large or corrupted.');
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setAttachments('');
    fileInputRef.current!.value = ''; // Clear input value
  };

  /* Set Knowledge Base Enabled start */
  const changeKnowledgeBase = (event: ToggleCustomEvent<{ checked: boolean }>) => {
    setKnowledgeBaseEnabled(event.detail.checked);
    setKnowledgeBaseData([]);
  };
  // Knowledge base modal start
  const handleClickKnowledgeBase = (e: React.MouseEvent<HTMLIonChipElement>) => {
    if (!(e.target as HTMLIonChipElement).disabled) {
      if (isKnowledgeBaseData.length === 3) {
        setIsShowError(true);
        setIsErrorMsg('You can only add 3 Knowledge Base at a time.');
        setIsErrorType('warning');
        return;
        
      }else {
        setIsKnowledgeBaseModal(true);
      }
      
    }
    
  };
  // Knowledge base remove start
  const handleRemoveKnowledgeBase = (kb_number:string) => {
    console.log('kb_number', kb_number);
    setKnowledgeBaseData(prevArray => prevArray.filter(item => item.kb_number !== kb_number));
    setIsShowError(true);
    setIsErrorMsg('Knowledge Base removed successfully!');
    setIsErrorType('success');
  };
  // Submit Knowledge Base modal start
  const handleKnowledgeBaseForm = async (data:any) => {
    console.log('KnowledgeBase', data);
    if (
      !data.kb_number ||
      isKnowledgeBaseData.some(item => item.kb_number === data.kb_number)
    ) {
      setIsShowError(true);
      setIsErrorMsg(
      !data.kb_number
        ? 'Please enter Knowledge Base number.'
        : 'This Knowledge Base number is already added.'
      );
      setIsErrorType('error');
      return;
    }else {
      let payload = {
        kb_number: data.kb_number,
        use_case: "b2b",
        tiga_roles: tigaRoles
      };
      let formUrl = apiUrl + '/kb/fetch';
      try {
        const response = await fetch(formUrl, {
          method: HTTPMethod.POST,
          headers: {
            '"removed"': `${NetworkInfo.ACCESSTOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload),
        });
    
        const responseData = await response.json();
        console.log('Success:', responseData);
    
        if (response.ok && responseData.title) {
          reset;
          setValue("kb_number", '');
          setIsKnowledgeBaseModal(false);
          setIsShowError(true);
          setIsErrorMsg('Knowledge Base added successfully!');
          setKnowledgeBaseData(prevArray => [...prevArray, responseData]);
          setIsErrorType('success');
        } else {
          setIsShowError(true);
          setIsErrorMsg(responseData.ErrorMessage || responseData.detail || 'Something went wrong!');
          setIsErrorType('error');
        }
      } catch (error: any) {
        console.error('Login failed:', error);
        if (error.response) {
          setIsShowError(true);
          setIsErrorMsg(error.response || 'Something went wrong!');
          setIsErrorType('error');
        }
      }
    }
    
  };
  /* Set Knowledge Base Enabled end */

  return (
    <IonPage>
      <AppHeader/>
      <IonContent className='page-body'>
        <div className='max-w-[80%] m-auto relative'>
          <div className='text-center relative'>
            {tabs.length > 0 &&
              <IonChip onClick={handleReset} className='absolute left-0 top-1/2 translate-x-0 text-sm ml-2.5 mr-0 min-h-6 py-0 bg-white text-primary border-primary border-2 font-semibold rounded-lg'>Clear all</IonChip>
            }
              <img className='m-auto' src={optimusLogo} />
            <p className="text-black">AI-assistance</p>
          </div>
          <form className='w-full' onSubmit={handleSubmit(handleFormSubmit)}>
            
            <IonGrid>
              <IonRow>
                <IonCol size="6" offset="6">
                  <IonToggle
                    class='float-right text-sm'
                    enableOnOffLabels={true}
                    checked={knowledgeBaseEnabled}
                    onIonChange={(event) => changeKnowledgeBase(event)}
                  >
                    Connect to Knowledge Base
                  </IonToggle>
                </IonCol>
                <IonCol
                  size="12"
                  size-lg={knowledgeBaseEnabled ? "3" : "4"}
                  size-md={knowledgeBaseEnabled ? "3" : "4"}
                  size-sm="12"
                >
                  <div className='rounded-xl text-[#000] bg-white shadow-md'>
                    <div className='font-bold p-4 text-sm'>I want to create a...</div>
                    <div className='px-4 pb-3.5'>
                      <SelectDropdown
                        options={formats}
                        selectedOptions={selectedFormats}
                        setSelectedOptions={setSelectedFormats}
                        multiSelect={true}
                        idKey="format_id"
                        nameKey="format_name"
                        tooltipKey="format_written_description"
                        placeHolder='Select formats'
                        label='Select desired format below'
                      />
                      {loadingFormats && (
                        <IonProgressBar className='mt-0.5' type="indeterminate"></IonProgressBar>
                      )}
                    </div>
                  </div>
                </IonCol>
                <IonCol
                  size="12"
                  size-lg={knowledgeBaseEnabled ? "3" : "4"}
                  size-md={knowledgeBaseEnabled ? "3" : "4"}
                  size-sm="12"
                >
                  <div className='rounded-xl text-[#000] bg-white shadow-md'>
                    <div className='font-bold p-4 text-sm'>With the purpose...</div>
                    <div className='px-4 pb-3.5'>
                      <SelectDropdown
                        options={purposes}
                        selectedOptions={selectedPurpose}
                        setSelectedOptions={setSelectedPurpose}
                        multiSelect={false}
                        idKey="purpose_id"
                        nameKey="purpose_name"
                        tooltipKey="purpose_written_description"
                        placeHolder='Select purpose'
                        label='Select desired purpose below'
                      />
                      {loadingPurposes && (
                        <IonProgressBar className='mt-0.5' type="indeterminate"></IonProgressBar>
                      )}
                    </div>
                  </div>
                </IonCol>
                <IonCol
                  size="12"
                  size-lg={knowledgeBaseEnabled ? "3" : "4"}
                  size-md={knowledgeBaseEnabled ? "3" : "4"}
                  size-sm="12"
                >
                  <div className='rounded-xl text-[#000] bg-white shadow-md'>
                    <div className='font-bold p-4 text-sm'>About...</div>
                    <div className='px-4 pb-3.5'>
                      <ProductDropdown
                        options={products}
                        selectedOptions={selectedProducts}
                        setSelectedOptions={setSelectedProducts}
                        multiSelect={true}
                        idKey="product_id"
                        nameKey="product_name"
                        categoryKey="category"
                        tooltipKey="product_name"
                        placeHolder='Select products'
                        label='Which product/offer do you want to report on?'
                      />
                      {loadingPurposes && (
                        <IonProgressBar className='mt-0.5' type="indeterminate"></IonProgressBar>
                      )}
                    </div>
                  </div>
                </IonCol>
                {knowledgeBaseEnabled && (
                  <IonCol
                    size="12"
                    size-lg="3"
                    size-md="3"
                    size-sm="12"
                  >
                    <div className='rounded-xl text-[#000] bg-white shadow-md pb-px'>
                      <div className='font-bold p-4 text-sm'>Using information from...</div>
                      <div className='mx-4 mb-3.5 p-1.5 border border-[#ccc] rounded'>
                        {isKnowledgeBaseData.map((item, index) => (
                          <IonChip key={index} onClick={() => handleRemoveKnowledgeBase(item.kb_number)} className='py-1 px-2 text-[10px] min-h-5'>
                            <IonLabel>{item.title}</IonLabel>
                            <IonIcon icon={closeCircle}></IonIcon>
                          </IonChip>
                        ))}
                        <IonChip onClick={ handleClickKnowledgeBase } className='py-1 px-2 text-[10px] min-h-5 bg-primary'>
                          <IonLabel className='!text-white'>ADD</IonLabel>
                        </IonChip>
                      </div>
                    </div>
                  </IonCol>
                )}
              </IonRow>
            </IonGrid>
            {
              segments.length !== 0 &&
              <div>
                <p className='text-center mt-2.5 text-black'>I want to create versions for the following segments:</p>
                <div className='segments text-center mt-2.5'>
                  {segments.map((item, index) => (
                    <IonChip key={index} onClick={() => onClickSegment(index)} className={`${item.isActive} text-center mx-2.5 min-h-6 py-0 bg-[#f5e0ff] text-[#4a2a59]`}>{item.segment_name}</IonChip>
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
                  <div className='relative' onDrop={handleDrop} onDragOver={handleDragOver}>
                    <IonTextarea
                      className='bottom-textarea rounded-xl text-black'
                      aria-label="Custom textarea"
                      placeholder="Write your own prompt."
                      autoGrow={true}
                      counter={true}
                      maxlength={6000}
                      {...register("question", {
                        validate: {},
                      })}
                    >
                      
                    </IonTextarea>
                    <div className='flex items-center absolute bottom-0 left-0 z-10 w-full px-4 py-1'>
                      {isUploadAttachement &&
                        <IonSpinner name="lines-small" color="primary"></IonSpinner>
                      }
                      {isUploadAttachement === false && attachments ?
                        <IonIcon onClick={handleIconClick} data-tooltip-id="attachment" data-tooltip-content="All text in the uploaded file will be processed." className='text-[20px] cursor-pointer' icon={documentAttach}></IonIcon>
                      : (isUploadAttachement === false && !attachments) &&
                        <IonIcon onClick={handleIconClick} data-tooltip-id="attachment" data-tooltip-content="All text in the uploaded file will be processed." className='text-[20px] cursor-pointer' icon={attach}></IonIcon>
                      }
                      
                      
                      <Tooltip id="attachment" />
                      {selectedFile ? (
                        <div className='flex items-center px-4 text-[14px] cursor-pointer'>
                          <span>{selectedFile.name}</span>
                          <IonIcon onClick={handleRemoveFile} className='text-[20px] cursor-pointer' icon={closeCircleOutline}></IonIcon>
                        </div>
                      )
                      : 
                        <input
                          className='opacity-0 cursor-pointer'
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                        />
                      }
                    </div>
                  </div>
                </IonCol>
              </IonRow>
            </IonGrid>
            
            <p className='p-4 italic mt-2.5'>Disclaimer: There may be risks associated with using AI-generated content. All content produced by this tool, i.e. Optimus, is for use at the user's discretion, and <u>the user is solely responsible for reviewing and approving any text before sharing it externally.</u></p>
            
              <div className='text-center mt-6'>
                <IonButton type='submit' className='btn-primary' shape="round">
                {loading && <IonSpinner className='mr-2' name="bubbles"></IonSpinner>}
                {tabs.length === 0 && !loading ?
                  'Generate'
                : tabs.length !== 0 && loading ?
                  'Generating...'
                :
                  'Regenerate all'
                }
                </IonButton>
              </div>
                
          </form>

          {tabs.length > 0 &&
            <IonGrid>
              <IonRow>
                <IonCol>
                  <div className="mx-2.5 mt-7">
                    <Tabs tabs={tabs} regenarateItem={regenarateItem} saveEditedAnswer={saveEditedAnswer} genarateRefineCopy={genarateRefineCopy} contentfulData={sendTocontentful} isEditingMode={handleEditingMode}/>
                    <div className="text-right mt-3">
                      <IonChip onClick={() => handleFormSubmit(requestData)} className='text-sm ml-2.5 mr-0 min-h-6 py-0 bg-white text-primary border-primary border-2 font-semibold rounded-lg'>Rewrite all suggestions</IonChip>
                      <IonChip data-tooltip-id="contentful" data-tooltip-content="Save all content before sending it to Contentful." disabled={isOpenEditing || contentfulCopy.length === 0} onClick={ handleClickContentful } className='!pointer-events-auto text-sm ml-2.5 mr-0 min-h-6 py-0 bg-white text-primary border-primary border-2 font-semibold rounded-lg'>Send to contentful</IonChip>
                      <IonChip onClick={() => exportToDoc(tabs)} className='text-sm ml-2.5 mr-0 min-h-6 py-0 bg-white text-primary border-primary border-2 font-semibold rounded-lg'>Save all suggestions to word.doc</IonChip>
                      {/* <IonChip onClick={handleReset} className='text-sm ml-2.5 mr-0 min-h-6 py-0 bg-white text-primary border-primary border-2 font-semibold rounded-lg'>Create new task</IonChip> */}
                      <Tooltip className={`${!isOpenEditing ? 'hidden' : ''}`} id="contentful" />
                    </div>
                  </div>
                </IonCol>
              </IonRow>
            </IonGrid>
          }
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
          className={`custom-toast ${isErrorType}`}
          isOpen={isShowError}
          message={isErrorMsg}
          duration={5000}
          onDidDismiss={() => {setIsErrorType(''), setIsShowError(false)}}
        ></IonToast>

        {/* self learning modal start */}
        <IonModal className='self-learning-modal' isOpen={isOpenModal}  backdropDismiss={false}>
          {feedbackCopy.length !== 0 &&
            <>
              <IonHeader>
                <IonToolbar className='text-center'>
                  <IonTitle className='font-bold'>Which copy is better?</IonTitle>
                  {feedbackCopy[currentIndex].responses[0].input_params.format_name &&
                    <IonChip color="primary"><b>Format:</b> {feedbackCopy[currentIndex].responses[0].input_params.format_name}</IonChip>
                  }
                  {feedbackCopy[currentIndex].responses[0].input_params.purpose_name &&
                    <IonChip color="success"><b>Purpose:</b> {feedbackCopy[currentIndex].responses[0].input_params.purpose_name}</IonChip>
                  }
                  {feedbackCopy[currentIndex].responses[0].input_params.segment_name &&
                    <IonChip color="warning"><b>Segment:</b> {feedbackCopy[currentIndex].responses[0].input_params.segment_name}</IonChip>
                  }
                  {feedbackCopy[currentIndex].responses[0].input_params.product_names.map((item:string, index:number) => (
                    <IonChip color="secondary"><b>Product {index + 1}:</b> {item}</IonChip>
                  ))}
                </IonToolbar>
              </IonHeader>
              <div className="inner-content">
                <IonGrid className='cursor-pointer'>
                  <IonRow>
                    {feedbackCopy[currentIndex].responses.map((feedbackItem:any, tabIndex:number) => (
                      <IonCol size="6">
                        <div onClick={() =>{setSelectedDiv(tabIndex); setSelfLearningData(feedbackItem)}} className={`${selectedDiv === tabIndex ? 'border-primary border-2' : ''} hover:border-primary bg-white mb-5 tab-body rounded-md relative`}>
                          {/* <h3 className='capitalize'>{feedbackItem.input_params.format_name}</h3> */}
                          
                          <div className='shadow-md rounded-md p-2 mb-1.5 relative'>
                            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} children={feedbackItem.answer}/>
                          </div>
                        </div>
                      </IonCol>
                    ))}
                    <IonCol size="12" className="text-center">
                      <IonButton disabled={selectedDiv === null} data-tooltip-id="feedbackCopy" data-tooltip-content="Please select the copy." onClick={() => submitSelfLearning()}>Submit Copy</IonButton>
                      <Tooltip id="feedbackCopy" />
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </div>
            </>
          }
        </IonModal>
        {/* self learning modal end */}

        {/* send to contentful start */}
        <IonModal id="example-modal" isOpen={isContentfulModal} onWillDismiss={() => {setIsContentfulModal(false); setIsCreateAssembly(false); setIsTroubleshooting(false);}}>
          <IonHeader>
            <IonToolbar>
              <IonTitle className='text-sm font-bold'>Send to Contentful</IonTitle>
              <IonButtons slot="end">
                <IonButton size="small" shape="round" onClick={() => setIsContentfulModal(false)}>
                  <IonIcon slot="icon-only" icon={closeOutline}></IonIcon>
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <div className="ion-padding inner-content">
            {!isTroubleshooting &&
              <p className='text-sm text-center pb-8 tex'>Add an internal name to be added to the copies. Optimus will automatically apply the correct attributes based on the format. 
                {isPersonalized ? 
                  <IonIcon data-tooltip-id="contentfulInfo" data-tooltip-content="Example: If you enter 'Black Week 25 BB 100/100', Optimus might generate 'B2B - Xsell - Black Week 25 BB 100/100 - Seniors - SMS', depending on the format." icon={informationCircle}></IonIcon>
                : 
                  <IonIcon data-tooltip-id="contentfulInfo" data-tooltip-content="Example: If you enter 'mobilabonnemang', Optimus might generate 'B2B - Mobilabonnmemang - FAQ', depending on the format." icon={informationCircle}></IonIcon> 
                }
              </p>
            }
            {isTroubleshooting &&
              <p className='text-sm text-center pb-8 tex'>Add the specific readableID to be added to the copies. <IonIcon data-tooltip-id="contentfulInfo" data-tooltip-content="Example: 'b2x-tsf-common-installationGuideForSpecificRouter'" icon={informationCircle}></IonIcon></p>
            }
            
            <Tooltip id="contentfulInfo" />
            <form onSubmit={handleSubmit(handleContentfulFormSubmit)} className="w-full">
              <IonInput className={`mb-4 text-sm ${!contentError && 'ion-valid'} ${contentError && 'ion-invalid'}`} label={` ${isTroubleshooting ? "Readable ID" : "Internal Name"}`} labelPlacement="floating" fill="outline" placeholder={`Please add an ${isTroubleshooting ? "Readable ID" : "Internal name"}`}
                value={contentName}
                onIonInput={handleContentfulChange}
                onIonBlur={handleContentfulBlur}
                helperText={contentError}
              ></IonInput>
              <div className={`flex ${isCreateAssembly ? 'justify-between' : 'justify-end'}`}>
                {isCreateAssembly &&
                  <IonCheckbox className='text-sm' labelPlacement="end"
                    onIonChange={(event) => setValue("createAssembly", event.detail.checked)}
                  >Create an Assembly</IonCheckbox>
              }
                <IonToggle 
                  className='text-sm'
                  checked={isPersonalized}
                  onIonChange={(e) => setIsPersonalized(e.detail.checked)}
                >{isPersonalized ? 'Personalized' : 'Generic'}</IonToggle>
              </div>
              
              <div className='text-center mt-4'>
                <IonText className='block text-sm mb-4'>{`A total ${contentfulCopy.length} copies will be sent to contentful.`}</IonText>
                <IonButton size='small' type='submit' className='btn-primary' shape="round">
                  {loading && <IonSpinner className='mr-2' name="bubbles"></IonSpinner>}
                  Save
                </IonButton>
                <IonButton onClick={() => setIsContentfulModal(false)} size='small' type='reset' fill='outline' shape="round">
                  Cancel
                </IonButton>
              </div>
            </form>
          </div>
        </IonModal>
        {/* send to contentful end */}

        {/* Knowledge Base start */}
        <IonModal id="example-modal" isOpen={isKnowledgeBaseModal} onWillDismiss={() => setIsKnowledgeBaseModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle className='text-sm font-bold'>Add Knowledge Base page to Optimus</IonTitle>
              <IonButtons slot="end">
                <IonButton size="small" shape="round" onClick={() => setIsKnowledgeBaseModal(false)}>
                  <IonIcon slot="icon-only" icon={closeOutline}></IonIcon>
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <div className="ion-padding inner-content">
            
            <form onSubmit={handleSubmit(handleKnowledgeBaseForm)} className="w-full">
              <IonInput className='mb-4 text-sm' label="Page Number" labelPlacement="floating" fill="outline" placeholder="e.g. KB0123456"
                {...register("kb_number", {
                  validate: {},
                })}
                required
              ></IonInput>
              <div className='text-center mt-4'>
                <IonButton size='small' type='submit' className='btn-primary' shape="round">
                  {loading && <IonSpinner className='mr-2' name="bubbles"></IonSpinner>}
                  Add
                </IonButton>
                <IonButton onClick={() => setIsKnowledgeBaseModal(false)} size='small' type='reset' fill='outline' shape="round">
                  Cancel
                </IonButton>
              </div>
            </form>
          </div>
        </IonModal>
        {/* Knowledge Base end */}
      </IonContent>
    </IonPage>
  );
};

export default B2B;

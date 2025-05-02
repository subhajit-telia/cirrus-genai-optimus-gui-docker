import { IonButton, IonButtons, IonChip, IonCol, IonContent, IonFab, IonFabButton, IonFabList, IonFooter, IonGrid, IonHeader, IonIcon, IonInput, IonModal, IonPage, IonProgressBar, IonRow, IonSkeletonText, IonSpinner, IonTextarea, IonTitle, IonToast, IonToolbar } from '@ionic/react';
import AppHeader from '../../components/header/Header';
import { closeOutline, globe, information, link } from 'ionicons/icons';
import { useEffect, useState } from 'react';
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
  internalName: string;
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
  const [requestData, setRequestData] = useState('');
  const [selectedFormats, setSelectedFormats] = useState<typeof formats[0][]>([]);
  const [selectedPurpose, setSelectedPurpose] = useState<typeof purposes[0][]>([]);
  const [userName, setUserName] = useState('');
  const apiUrl = window.RUNTIME_ENV?.REACT_APP_API_URL || NetworkInfo.URL;
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isOpenEditing, setIsOpenEditing] = useState(false);
  const [selectedDiv, setSelectedDiv] = useState<number | null>(null);
  const [feedbackCopy, setFeedbackCopy] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const storedVersion = localStorage.getItem("app_version");
  const [isContentfulModal, setIsContentfulModal] = useState(false);
  const [contentfulCopy, setContentfulCopy] = useState<any[]>([]);

  useEffect(() => {
    let userLocalData:any = localStorage.getItem('user');
    let user_name = JSON.parse(userLocalData);
    setUserName(user_name.username);
    console.log('userData', user_name);
    
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
          session_family_id: generateDateTimeString(),
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
          session_family_id: generateDateTimeString(),
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
            session_family_id: generateDateTimeString(),
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
          session_family_id: generateDateTimeString(),
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
    setFeedbackCopy([]);
    setSegments(updatedSegments);
    setTabs([]);
    setSelectedProducts([]);
    setSelectedFormats([]);
    setSelectedPurpose([]);
    setValue("format", '');
    setValue("purpose", '');
    setValue("products", '');
    setValue("question", '');
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
  const sendTocontentful = async (data: any): Promise<void> => {
    console.log('contentfulData', data);
    setContentfulCopy(data)
  }

  const handleContentfulFormSubmit = async (data:any) => {
    
    console.log('contentfulCopy', data);
    let allQids: string[] = contentfulCopy.map(item => item.input_params.qid);
    console.log('qids', allQids);
    let payload = {
      contentName: data.internalName,
      qids: allQids
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
        setIsContentfulModal(false);
        setIsShowError(true);
        setIsErrorMsg('Contentful submited successfully!');
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
  const handleDivClick = async (selectItem:any, tabIndex:number) => {
    console.log('selectItem', selectItem);
    setSelectedDiv(tabIndex); // Set the clicked div's ID as selected
    setIsOpenModal(false);
    setIsShowError(true);
    setIsErrorMsg('Testing submitted!');
    console.log('feedbackCopy', feedbackCopy);
    if (currentIndex < feedbackCopy.length - 1) {
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
        if (segment.segment_id === selectItem.input_params.segment_id) {
          segment.data = segment.data.map((format: any) => {
            if (format.format_id === selectItem.input_params.format_id) {
              return {
                ...format,
                answer: DOMPurify.sanitize(selectItem.answer),
                input_params: selectItem.input_params,
                outputs: [
                  ...(format.outputs || []),
                  { 
                    answer: DOMPurify.sanitize(selectItem.answer), 
                    input_params: selectItem.input_params ,
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
        if (format.format_id === selectItem.input_params.format_id || format.format_id === 'customPrompts') {
          const currentOutputs = format.outputs || [];
          return {
            ...format,
            answer: DOMPurify.sanitize(selectItem.answer),
            input_params: selectItem.input_params,
            outputs: [
              ...currentOutputs,
              { 
                answer: DOMPurify.sanitize(selectItem.answer), 
                input_params: selectItem.input_params ,
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

    let formUrl = apiUrl + '/self_learning/select_answer?qid='+selectItem.input_params.qid;
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
    
  };

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
                <IonCol size="12" size-lg="4" size-md="4" size-sm="12">
                  <div className='rounded-xl text-[#000] bg-white shadow-md'>
                    <div className='font-bold p-4 text-sm'>I want to create a...</div>
                    
                    <div className='px-4 pb-3.5'>
                        <SelectDropdown
                          options={formats}
                          selectedOptions={selectedFormats}
                          setSelectedOptions={setSelectedFormats}
                          multiSelect={true} // Multi-select mode
                          idKey="format_id"
                          nameKey="format_name"
                          tooltipKey="format_written_description"
                          placeHolder='Select formats'
                          label='Select desired format below'
                        />
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
                        <SelectDropdown
                          options={purposes}
                          selectedOptions={selectedPurpose}
                          setSelectedOptions={setSelectedPurpose}
                          multiSelect={false} // Multi-select mode
                          idKey="purpose_id"
                          nameKey="purpose_name"
                          tooltipKey="purpose_written_description"
                          placeHolder='Select purpose'
                          label='Select desired purpose below'
                        />
                        { loadingPurposes &&
                          <IonProgressBar className='mt-0.5' type="indeterminate"></IonProgressBar>
                        }
                    </div>
                  </div>
                </IonCol>
                <IonCol size="12" size-lg="4" size-md="4" size-sm="12">
                  <div className='rounded-xl text-[#000] bg-white shadow-md'>
                    <div className='font-bold p-4 text-sm'>About...</div>
                    <div className='px-4 pb-3.5'>
                      <ProductDropdown
                        options={products}
                        selectedOptions={selectedProducts}
                        setSelectedOptions={setSelectedProducts}
                        multiSelect={true} // Multi-select mode
                        idKey="product_id"
                        nameKey="product_name"
                        categoryKey="category"
                        tooltipKey="product_name"
                        placeHolder='Select products'
                        label='Which product/offer do you want to report on?'
                      />
                      { loadingPurposes &&
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
                <p className='text-center mt-2.5 text-black'>I want to create versions for the following segments:</p>
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
                      <IonChip data-tooltip-id="contentful" data-tooltip-content="Save all content before sending it to Contentful." disabled={isOpenEditing} onClick={ handleClickContentful } className='!pointer-events-auto text-sm ml-2.5 mr-0 min-h-6 py-0 bg-white text-primary border-primary border-2 font-semibold rounded-lg'>Send to contentful</IonChip>
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
          className='custom-toast'
          isOpen={isShowError}
          message={isErrorMsg}
          duration={3000}
          onDidDismiss={() => setIsShowError(false)}
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
                        <div onClick={() => handleDivClick(feedbackItem, tabIndex)} className={`${selectedDiv === tabIndex ? 'border-primary' : ''} hover:border-primary bg-white mb-5 tab-body border-2 p-2 rounded-md relative`}>
                          {/* <h3 className='capitalize'>{feedbackItem.input_params.format_name}</h3> */}
                          
                          <div className='shadow-md rounded-md p-2 mb-1.5 relative'>
                            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} children={feedbackItem.answer}/>
                          </div>
                        </div>
                      </IonCol>
                    ))}
                  </IonRow>
                </IonGrid>
              </div>
            </>
          }
        </IonModal>
        {/* self learning modal end */}

        {/* send to contentful start */}
        <IonModal id="example-modal" isOpen={isContentfulModal} onWillDismiss={() => setIsContentfulModal(false)}>
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
            <p className='text-sm text-center pb-8 tex'>Send all generated copies to Contentful. Add an internal name that will be added to the copies (Optimus will automatically add format and other attributes after the internal name).</p>
            <form onSubmit={handleSubmit(handleContentfulFormSubmit)} className="w-full">
              <IonInput className='mb-4 text-sm' label="Internal Name" labelPlacement="floating" fill="outline" placeholder="Please add an Internal name"
                {...register("internalName", {
                  validate: {},
                })}
                helperText={`A total ${contentfulCopy.length} copies will be sent to contentful.`}
                required
              ></IonInput>
              <div className='text-center mt-4'>
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
      </IonContent>
    </IonPage>
  );
};

export default B2B;

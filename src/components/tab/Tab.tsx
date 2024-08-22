import { IonButton, IonIcon, IonSpinner, IonTextarea } from '@ionic/react';
import React, { useEffect, useRef, useState } from 'react';
import { chatbubblesOutline, closeOutline, copyOutline, createOutline, documentTextOutline, refreshOutline, send, thumbsDownOutline, thumbsUpOutline } from 'ionicons/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import './Tab.css';
import { saveAs } from 'file-saver';
import FeedbackAlert from '../feedback/Feedback';

interface Tab {
  answer: string;
  segment_id: string;
  segment_name: string;
  data: [innerTab]
}
interface innerTab {
  format_id: string,
  format_name: string,
  answer: string,
  input_params: any
}

interface TabsProps {
  tabs: Tab[];
  regenarateItem: (data: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, regenarateItem }) => {
  const [activeTab, setActiveTab] = useState(tabs[0].segment_id); // Set the first tab as active initially

  const changeTab = (segment_id: string) => {
    setActiveTab(segment_id);
  };

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

  const handleButtonClick = (identifier:any, tabIndex:any, itemIndex:any, data:any) => {
    console.log(tabIndex+'/'+itemIndex+'/'+data);
    if (identifier === 'regenarate') {
      data.session_id = generateDateTimeString();
      data.qid = generateDateTimeString();
      if (itemIndex !== '') {
        tabs[tabIndex].data[itemIndex].answer = '';
        regenarateItem(data); 
        console.log('tabs@@@@', tabs)
      }else {
        tabs[tabIndex].answer = '';
        regenarateItem(data);  
      }
    }else if (identifier === 'chatAnswer') {
      data.qid = generateDateTimeString();

      if (itemIndex !== '') {
        tabs[tabIndex].data[itemIndex].answer = '';
      }else {
        tabs[tabIndex].answer = '';
      }
      regenarateItem(data);  
    }
    
  };

  /* --------------Edit answer start-------------- */
  const [editVisibility, setEditVisibility] = useState(
    tabs.map(item => item.data ? item.data.map(() => false) : false)
  );

  const [editInputValues, setEditInputValues] = useState<string[][] | string[]>(
    tabs.every(item => item.data) 
      ? tabs.map(item => (item.data as { format_id: string; answer: string }[]).map(innerItem => innerItem.answer))
      : tabs.map(item => item.answer)
  );

  

  useEffect(() => {
    let copyAnswer = tabs.every(item => item.data) 
      ? tabs.map(item => (item.data as { format_id: string; answer: string }[]).map(innerItem => innerItem.answer))
      : tabs.map(item => item.answer)
    setEditInputValues(copyAnswer);
    console.log('editInputValues', editInputValues);
    console.log('tabs', tabs);

  }, [tabs]);

  const editAnswerVisibility = (tabIndex: number, itemIndex: number | null = null) => {

    console.log('h@@@',(editInputValues[tabIndex]))
    const newVisibility:any = tabs.map((item, index) => {
      if (index === tabIndex) {
        if (itemIndex !== null && Array.isArray(editVisibility[tabIndex])) {
          return (editVisibility[tabIndex] as boolean[]).map((isVisible, i) => i === itemIndex ? !isVisible : false);
        } else {
          return !editVisibility[tabIndex];
        }
      } else {
        return item.data ? item.data.map(() => false) : false;
      }
    });
    setEditVisibility(newVisibility);
  };

  const handleEditChange = (tabIndex:any, event:any, itemIndex:any) => {
    const newValues:any = [...editInputValues];
    if (itemIndex !== null && Array.isArray(newValues[tabIndex])) {
      (newValues[tabIndex] as string[])[itemIndex] = event.target.value;
    } else if (typeof newValues[tabIndex] === 'string') {
      newValues[tabIndex] = event.target.value;
    }
    setEditInputValues(newValues);
  };
  /* Edit answer end */
  

  /* -------Show hide question input start------- */
  const [inputVisibility, setInputVisibility] = useState(
    tabs.map(item => item.data ? item.data.map(() => false) : false)
  );

  const [inputValues, setInputValues] = useState(
    tabs.map(item => item.data ? item.data.map(() => '') : '')
  );

  const toggleInputVisibility = (tabIndex: number, itemIndex: number | null = null) => {
    const newVisibility:any = tabs.map((item, index) => {
      if (index === tabIndex) {
        if (itemIndex !== null && Array.isArray(inputVisibility[tabIndex])) {
          return (inputVisibility[tabIndex] as boolean[]).map((isVisible, i) => i === itemIndex ? !isVisible : false);
        } else {
          return !inputVisibility[tabIndex];
        }
      } else {
        return item.data ? item.data.map(() => false) : false;
      }
    });
    setInputVisibility(newVisibility);
  };

  const handleInputChange = (tabIndex:any, event:any, itemIndex:any) => {
    const newValues = [...inputValues];
    if (itemIndex !== null && Array.isArray(newValues[tabIndex])) {
      (newValues[tabIndex] as string[])[itemIndex] = event.target.value;
    } else if (typeof newValues[tabIndex] === 'string') {
      newValues[tabIndex] = event.target.value;
    }
    setInputValues(newValues);
  };

  const handleSubmitChatAnswer = (tabIndex:any, itemIndex:any) => {
    console.log('Value for item', inputValues[tabIndex]);

    if (itemIndex !== '') {
      let arrayItem = JSON.stringify(tabs[tabIndex].data[itemIndex]);
    
      let parseArrayItem:any =  JSON.parse(arrayItem);
      let inputParams = parseArrayItem.input_params;
      inputParams.question = inputValues[tabIndex][itemIndex];
      console.log('a', inputParams);

      handleButtonClick('chatAnswer', tabIndex, itemIndex, parseArrayItem.input_params);
    }else {
      let arrayItem = JSON.stringify(tabs[tabIndex]);
    
      let parseArrayItem:any =  JSON.parse(arrayItem);
      let inputParams = parseArrayItem.input_params;
      inputParams.question = inputValues[tabIndex];
      console.log('a', inputParams);

      handleButtonClick('chatAnswer', tabIndex, '', parseArrayItem.input_params);
    }
  };
  /* Show hide question input end */

  /* ----------Copy text to clipboard start---------- */
  const copyToClipboard = async (text:any) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.log('err', err);
    }
  };
  /* Copy text to clipboard end */

  /* ---------------Export to doc start--------------- */
  const exportToDoc = (data:any) => {
    console.log('data', data);
    const blob = new Blob([data.answer], {
      type: 'application/msword;charset=utf-8',
    });
  
    // Save the file
    saveAs(blob, data.format_name);
  };
  /* Export to doc end */

  const feedbackAlertRef = useRef<any>(null);

  const openFeedbackAlert = (qId: string, type:string) => {
    if (feedbackAlertRef.current) {
      feedbackAlertRef.current.open(qId, type);
    }
  };

  return (
    <div className="">
      {tabs[0].data ?
        <>
          <div className="flex">
            {tabs.map((tab) => (
              <button
                type='button'
                key={tab.segment_id}
                onClick={() => changeTab(tab.segment_id)}
                className={`${
                  activeTab === tab.segment_id
                    ? '!bg-white font-bold'
                    : ''
                } bg-[#eaeaea] text-black rounded-md rounded-tr-3xl rounded-br-none whitespace-nowrap py-1 px-4 border-b-2 text-md focus:outline-none`}
              >
                {tab.segment_name ?
                  <p>{tab.segment_name}</p>
                :
                  <IonSpinner name="dots"></IonSpinner>
                }
                
                
              </button>
            ))}
          </div>
          <div className="bg-white p-4 rounded-md">
            {tabs.map((tab, tabIndex) => (
              <div key={tab.segment_id} className={activeTab === tab.segment_id ? 'block' : 'hidden'} >
                {tab.data.map((tabItem, itemIndex) => (
                  <div className='mb-5 tab-body border p-4 rounded-md relative' key={tabItem.format_id}>
                    {tabItem.format_name &&
                      <h3 className='capitalize'>{tabItem.format_name}</h3>
                    }

                    {tabItem.answer ?
                      <>
                        {editVisibility[tabIndex] && Array.isArray(editVisibility[tabIndex]) && editVisibility[tabIndex][itemIndex] ? 
                          <IonTextarea
                            className='bottom-textarea rounded-xl text-black'
                            aria-label="Custom textarea"
                            placeholder="Write your question."
                            autoGrow={true}
                            counter={true}
                            maxlength={2000}
                            value={(editInputValues[tabIndex] as string[])[itemIndex]}
                            onIonInput={(event) => handleEditChange(tabIndex, event, itemIndex)}
                          >
                            <IonButton title='Copy text' onClick={() => copyToClipboard((editInputValues[tabIndex] as string[])[itemIndex])} size="small" fill="clear" slot="end" >
                              <IonIcon className='text-primary' slot="icon-only" icon={copyOutline}></IonIcon>
                            </IonButton>
                          </IonTextarea>
                          :
                          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} children={tabItem.answer}/>
                        }
                        
                        {inputVisibility[tabIndex] && Array.isArray(inputVisibility[tabIndex]) && inputVisibility[tabIndex][itemIndex] && (
                          <IonTextarea
                            className='bottom-textarea rounded-xl text-black'
                            aria-label="Custom textarea"
                            placeholder="Write your question."
                            autoGrow={true}
                            counter={true}
                            maxlength={2000}
                            value={(inputValues[tabIndex] as string[])[itemIndex]}
                            onIonInput={(event) => handleInputChange(tabIndex, event, itemIndex)}
                          >
                            <IonButton title='Regenarate' onClick={() => handleSubmitChatAnswer(tabIndex, itemIndex)} size="small" fill="clear" slot="end" >
                              <IonIcon className='text-primary' slot="icon-only" icon={send}></IonIcon>
                            </IonButton>
                          </IonTextarea>
                        )}
                        <div className='flex items-center justify-between'>
                          <div>
                            <IonIcon onClick={() => openFeedbackAlert(tabItem.input_params.session_id, 'positive')} className='mr-2.5 cursor-pointer hover:text-primary' slot="icon-only" icon={thumbsUpOutline}></IonIcon>
                            <IonIcon onClick={() => openFeedbackAlert(tabItem.input_params.session_id, 'negative')} className='mr-2.5 cursor-pointer hover:text-primary' slot="icon-only" icon={thumbsDownOutline}></IonIcon>
                          </div>
                          <div>
                            <IonButton title='Chat with answer' onClick={() => toggleInputVisibility(tabIndex, itemIndex)} className='text-xs' shape="round">
                              {inputVisibility[tabIndex] && Array.isArray(inputVisibility[tabIndex]) && inputVisibility[tabIndex][itemIndex] ? 
                                <IonIcon className='' slot="icon-only" icon={closeOutline}></IonIcon>
                                :
                                <IonIcon className='' slot="icon-only" icon={chatbubblesOutline}></IonIcon>
                              }
                            </IonButton>
                            <IonButton title='Regenarate answer' className='text-xs' onClick={() => handleButtonClick('regenarate', tabIndex, itemIndex, tabItem.input_params)} shape="round">
                              <IonIcon className='' slot="icon-only" icon={refreshOutline}></IonIcon>
                            </IonButton>
                            <IonButton title='Copy text' className='text-xs' onClick={() => copyToClipboard(tabItem.answer)} shape="round">
                              <IonIcon className='' slot="icon-only" icon={copyOutline}></IonIcon>
                            </IonButton>
                            <IonButton title='Edit answer' className='text-xs' onClick={() => editAnswerVisibility(tabIndex, itemIndex)} shape="round">
                              {editVisibility[tabIndex] && Array.isArray(editVisibility[tabIndex]) && editVisibility[tabIndex][itemIndex] ? 
                                <IonIcon className='' slot="icon-only" icon={closeOutline}></IonIcon>
                              :
                                <IonIcon className='' slot="icon-only" icon={createOutline}></IonIcon>
                              }
                            </IonButton>
                            <IonButton title='Download as .doc' className='text-xs' onClick={() => exportToDoc(tabItem)} shape="round">
                              <IonIcon className='' slot="icon-only" icon={documentTextOutline}></IonIcon>
                            </IonButton>
                          </div>
                        </div>
                        
                      </>
                    :
                      <IonSpinner name="dots"></IonSpinner>
                    }
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
        :
        <div className="bg-white p-4 rounded-md">
          {tabs.map((tabItem:any, tabIndex) => (
            <div className='mb-5 tab-body border p-4 rounded-md relative' key={tabItem.format_id}>
              {tabItem.format_name &&
                <h3 className='capitalize'>{tabItem.format_name}</h3>
              }

              {tabItem.answer ?
                <>
                  {typeof editVisibility[tabIndex] === 'boolean' && editVisibility[tabIndex] ?
                    <IonTextarea
                      className='bottom-textarea rounded-xl text-black'
                      aria-label="Custom textarea"
                      placeholder="Write your question."
                      autoGrow={true}
                      counter={true}
                      maxlength={2000}
                      value={editInputValues[tabIndex] as string}
                      onIonInput={(event) => handleEditChange(tabIndex, event, null)}
                    >
                      <IonButton title='Copy text' onClick={() => copyToClipboard(editInputValues[tabIndex] as string)} size="small" fill="clear" slot="end" >
                        <IonIcon className='text-primary' slot="icon-only" icon={copyOutline}></IonIcon>
                      </IonButton>
                    </IonTextarea>
                    
                  :
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} children={tabItem.answer}/>
                  }
                  
                  {typeof inputVisibility[tabIndex] === 'boolean' && inputVisibility[tabIndex] && (
                    <IonTextarea
                      className='bottom-textarea rounded-xl text-black'
                      aria-label="Custom textarea"
                      placeholder="Write your question."
                      autoGrow={true}
                      counter={true}
                      maxlength={2000}
                      value={inputValues[tabIndex] as string}
                      onIonInput={(event) => handleInputChange(tabIndex, event, '')}
                    >
                      <IonButton onClick={() => handleSubmitChatAnswer(tabIndex, '')} size="small" fill="clear" slot="end" >
                        <IonIcon className='text-primary' slot="icon-only" icon={send}></IonIcon>
                      </IonButton>
                    </IonTextarea>
                  )}
                  <div className='flex items-center justify-between'>
                    <div>
                      <IonIcon onClick={() => openFeedbackAlert(tabItem.input_params.session_id, 'positive')} className='mr-2.5 cursor-pointer hover:text-primary' slot="icon-only" icon={thumbsUpOutline}></IonIcon>
                      <IonIcon onClick={() => openFeedbackAlert(tabItem.input_params.session_id, 'negative')} className='mr-2.5 cursor-pointer hover:text-primary' slot="icon-only" icon={thumbsDownOutline}></IonIcon>
                    </div>
                    <div>
                      <IonButton onClick={() => toggleInputVisibility(tabIndex, null)} className='text-xs' shape="round">
                      {typeof inputVisibility[tabIndex] === 'boolean' && inputVisibility[tabIndex] ? 
                        <IonIcon className='' slot="icon-only" icon={closeOutline}></IonIcon>
                        :
                        <IonIcon className='' slot="icon-only" icon={chatbubblesOutline}></IonIcon>
                      }
                      </IonButton>
                      <IonButton className='text-xs' onClick={() => handleButtonClick('regenarate', tabIndex, '', tabItem.input_params)} shape="round">
                        <IonIcon className='' slot="icon-only" icon={refreshOutline}></IonIcon>
                      </IonButton>
                      <IonButton  className='text-xs' onClick={() => copyToClipboard(tabItem.answer)} shape="round">
                        <IonIcon className='' slot="icon-only" icon={copyOutline}></IonIcon>
                      </IonButton>
                      <IonButton  className='text-xs' onClick={() => editAnswerVisibility(tabIndex, null)} shape="round">
                        {typeof editVisibility[tabIndex] === 'boolean' && editVisibility[tabIndex] ?
                          <IonIcon className='' slot="icon-only" icon={closeOutline}></IonIcon>
                        :
                          <IonIcon className='' slot="icon-only" icon={createOutline}></IonIcon>
                        }
                      </IonButton>
                      <IonButton title='Download as .doc' className='text-xs' onClick={() => exportToDoc(tabItem)} shape="round">
                        <IonIcon className='' slot="icon-only" icon={documentTextOutline}></IonIcon>
                      </IonButton>
                    </div>
                  </div>
                </>
              :
                <IonSpinner name="dots"></IonSpinner>
              }
              
            </div>
          ))}
        </div>
      }
      <FeedbackAlert ref={feedbackAlertRef} />
    </div>
  );
};

export default Tabs;

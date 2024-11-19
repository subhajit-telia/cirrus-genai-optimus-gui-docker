import { IonButton, IonIcon, IonItem, IonLabel, IonList, IonSpinner, IonTextarea } from '@ionic/react';
import React, { useEffect, useRef, useState } from 'react';
import { chatbubblesOutline, closeOutline, copyOutline, createOutline, documentTextOutline, refreshOutline, send, thumbsDownOutline, thumbsUpOutline } from 'ionicons/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import './Tab.css';
import { saveAs } from 'file-saver';
import FeedbackAlert from '../feedback/Feedback';
import { Tooltip } from 'react-tooltip';

interface Tab {
  answer: string;
  segment_id: string;
  segment_name: string;
  outputs:[]
  data: [innerTab]
}
interface innerTab {
  format_id: string,
  format_name: string,
  answer: string,
  input_params: any
  outputs:[]
}

interface TabsProps {
  tabs: Tab[];
  regenarateItem: (data: string) => void;
}

interface Position {
  top: number;
  left: number;
}

const Tabs: React.FC<TabsProps> = ({ tabs, regenarateItem }) => {
  const [activeTab, setActiveTab] = useState(tabs[0].segment_id); // Set the first tab as active initially
  const [selectedText, setSelectedText] = useState<string>("");
  const [position, setPosition] = useState<Position | null>(null);
  const [activeBox, setActiveBox] = useState<number | null>(null);

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

  const [editVisibility, setEditVisibility] = useState({ tabIndex: null, itemIndex: null, outputIndex: null });
  const [editInputValues, setEditInputValues] = useState(
    tabs.map(item => {
      if (item.outputs) {
        return (item.outputs as { answer: string }[]).map(outputItem => outputItem.answer);
      } else if (item.data) {
        return item.data.map(innerItem => (innerItem.outputs as { answer: string }[]).map(outputItem => outputItem.answer));
      }
      return [];
    })
  );

  const editAnswerVisibility = (tabIndex:any, itemIndex:any, outputIndex:any) => {
    // Check if the currently active input is the same as the one being clicked
    if (
      editVisibility.tabIndex === tabIndex &&
      editVisibility.itemIndex === itemIndex &&
      editVisibility.outputIndex === outputIndex
    ) {
      // If it is the same, hide the input by setting editVisibility to null
      setEditVisibility({ tabIndex: null, itemIndex: null, outputIndex: null });
    } else {
      // Otherwise, set the new active input
      setEditVisibility({ tabIndex, itemIndex, outputIndex });
    }
  };

  const handleEditChange = (tabIndex:any, itemIndex:any, outputIndex:any, event:any) => {
    const newValues = [...editInputValues];
    if (Array.isArray(newValues[tabIndex])) {
      if (Array.isArray(newValues[tabIndex][itemIndex])) {
        newValues[tabIndex][itemIndex][outputIndex] = event.target.value;
      } else {
        newValues[tabIndex][outputIndex] = event.target.value;
      }
    }
    setEditInputValues(newValues);
  };
  /* Edit answer end */

  useEffect(() => {
    if (tabs[0].data && tabs.length === 1) {
      setActiveTab(tabs[0].segment_id)
    }
    
    let copyAnswer = tabs.map(item => {
      if (item.outputs) {
        return (item.outputs as { answer: string }[]).map(outputItem => outputItem.answer);
      } else if (item.data) {
        return item.data.map(innerItem => (innerItem.outputs as { answer: string }[]).map(outputItem => outputItem.answer));
      }
      return [];
    })
    setEditInputValues(copyAnswer);
    console.log('editInputValues', editInputValues);
    console.log('tabs>><<', tabs);

  }, [tabs]);

  const handleMouseUp = (
    event: React.MouseEvent,
    containerRef: HTMLDivElement,
    boxIndex: number
  ) => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();

    if (text) {
      const range = selection?.getRangeAt(0);
      const rect = range?.getBoundingClientRect();

      if (rect) {
        const containerRect = containerRef.getBoundingClientRect();

        setSelectedText(text);
        setPosition({
          top: rect.top - containerRect.top + containerRef.scrollTop,
          left: rect.left - containerRect.left + containerRef.scrollLeft,
        });
        setActiveBox(boxIndex); // Set the active box to show the popover
      }
    } else {
      setPosition(null);
      setActiveBox(null); // Reset active box when no text is selected
    }
  };
  

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
  const copyToClipboard = async (identifier:any, text:any) => {
    let content;
    if (identifier  === 'multiple') {
      content = text.map((item: { answer: any; }) => item.answer + '\n\n\n')
      console.log('content>>', content);
    }else {
      content = text;
    }
    try {
      await navigator.clipboard.writeText(content);
    } catch (err) {
      console.log('err', err);
    }
  };
  /* Copy text to clipboard end */

  /* ---------------Export to doc start--------------- */
  const exportToDoc = (identifier:any, data:any) => {
    console.log('data', data);
    let content;
    if (identifier  === 'multiple') {
      content = data.map((item: { answer: any; }) => item.answer + '\n\n\n')
      console.log('content>>', content);
    }else {
      content = data;
    }

    const blob = new Blob([content], {
      type: 'application/msword;charset=utf-8',
    });
  
    // Save the file
    saveAs(blob, 'optimus.doc');
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

                    {tabItem.outputs.length !== 0 ?
                      <>
                        {tabItem.outputs.map((outputItem:any, outputIndex) => {
                          const containerRef = React.createRef<HTMLDivElement>();
                          const boxIndex = itemIndex * 10 + outputIndex;
                          return (
                            <div ref={containerRef} onMouseUp={(e) => handleMouseUp(e, containerRef.current!, boxIndex)} key={boxIndex} className='shadow-md rounded-md p-2 mb-1.5 relative'>
                              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} children={outputItem.answer}/>

                              {/* Popover only for the active box */}
                              {position && activeBox === boxIndex && (
                                <div
                                  style={{
                                    position: "absolute",
                                    top: position.top + 20,
                                    left: position.left,
                                    zIndex: 1000,
                                  }}
                                >
                                  <div className='popover-buttons'>
                                    <IonButton data-tooltip-id='tooltip' data-tooltip-content='Refine Answer' className='text-xs' shape="round">
                                      <IonIcon slot="icon-only" icon={chatbubblesOutline}></IonIcon>
                                    </IonButton>
                                    <IonButton data-tooltip-id='tooltip' data-tooltip-content='Regenerate' className='text-xs' shape="round">
                                      <IonIcon slot="icon-only" icon={refreshOutline}></IonIcon>
                                    </IonButton>
                                  </div>
                                </div>
                              )}
                              {/* Edit answer for each output */}
                              {editVisibility.tabIndex === tabIndex && editVisibility.itemIndex === itemIndex && editVisibility.outputIndex === outputIndex && 
                                <IonTextarea
                                  className='z-0 bottom-textarea rounded-xl mt-5 mb-2.5 text-black'
                                  aria-label="Custom textarea"
                                  placeholder="Write your question."
                                  autoGrow={true}
                                  counter={true}
                                  maxlength={2000}
                                  value={editInputValues[tabIndex][itemIndex][outputIndex]}
                                  onIonInput={(event) => handleEditChange(tabIndex, itemIndex, outputIndex, event)}
                                >
                                  <IonButton data-tooltip-id='tooltip' data-tooltip-content='Copy text' onClick={() => copyToClipboard('single', editInputValues[tabIndex][itemIndex][outputIndex])} size="small" fill="clear" slot="end" >
                                    <IonIcon className='text-primary' slot="icon-only" icon={copyOutline}></IonIcon>
                                  </IonButton>
                                </IonTextarea>
                              }
                              {/* Action buttons for each output */}
                              <div className='flex items-center justify-between'>
                                <div>
                                  <IonIcon data-tooltip-id='tooltip' data-tooltip-content='Positive' onClick={() => openFeedbackAlert(outputItem.input_params.session_id, 'positive')} className='mr-2.5 cursor-pointer hover:text-primary' slot="icon-only" icon={thumbsUpOutline}></IonIcon>
                                  <IonIcon data-tooltip-id='tooltip' data-tooltip-content='Negative' onClick={() => openFeedbackAlert(outputItem.input_params.session_id, 'negative')} className='mr-2.5 cursor-pointer hover:text-primary' slot="icon-only" icon={thumbsDownOutline}></IonIcon>
                                </div>
                                <div>
                                  <IonButton fill="clear" data-tooltip-id='tooltip' data-tooltip-content='Copy text' className='text-xs' onClick={() => copyToClipboard('single', outputItem.answer)} shape="round">
                                    <IonIcon className='' slot="icon-only" icon={copyOutline}></IonIcon>
                                  </IonButton>
                                  <IonButton fill="clear" data-tooltip-id='tooltip' data-tooltip-content='Edit answer' className='text-xs' onClick={() => editAnswerVisibility(tabIndex, itemIndex, outputIndex)} shape="round">
                                    {editVisibility.tabIndex === tabIndex && editVisibility.itemIndex === itemIndex && editVisibility.outputIndex === outputIndex ? 
                                      <IonIcon className='' slot="icon-only" icon={closeOutline}></IonIcon>
                                    :
                                      <IonIcon className='' slot="icon-only" icon={createOutline}></IonIcon>
                                    }
                                  </IonButton>
                                  <IonButton fill="clear" data-tooltip-id='tooltip' data-tooltip-content='Download as .doc' className='text-xs' onClick={() => exportToDoc('single', outputItem.answer)} shape="round">
                                    <IonIcon className='' slot="icon-only" icon={documentTextOutline}></IonIcon>
                                  </IonButton>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {!tabItem.answer &&
                          <IonSpinner name="dots"></IonSpinner>
                        }
                        
                        {inputVisibility[tabIndex] && Array.isArray(inputVisibility[tabIndex]) && inputVisibility[tabIndex][itemIndex] && (
                          <IonTextarea
                            className='z-0 bottom-textarea rounded-xl mt-5 mb-2.5 text-black'
                            aria-label="Custom textarea"
                            placeholder="Write your question."
                            autoGrow={true}
                            counter={true}
                            maxlength={2000}
                            value={(inputValues[tabIndex] as string[])[itemIndex]}
                            onIonInput={(event) => handleInputChange(tabIndex, event, itemIndex)}
                          >
                            <IonButton data-tooltip-id='tooltip' data-tooltip-content='Genarate' onClick={() => handleSubmitChatAnswer(tabIndex, itemIndex)} size="small" fill="clear" slot="end" >
                              <IonIcon className='text-primary' slot="icon-only" icon={send}></IonIcon>
                            </IonButton>
                          </IonTextarea>
                        )}
                        <div className='text-right'>
                          <div>
                            <IonButton data-tooltip-id='tooltip' data-tooltip-content='Refine Answer' onClick={() => toggleInputVisibility(tabIndex, itemIndex)} className='text-xs' shape="round">
                              {inputVisibility[tabIndex] && Array.isArray(inputVisibility[tabIndex]) && inputVisibility[tabIndex][itemIndex] ? 
                                <IonIcon className='' slot="icon-only" icon={closeOutline}></IonIcon>
                                :
                                <IonIcon className='' slot="icon-only" icon={chatbubblesOutline}></IonIcon>
                              }
                            </IonButton>
                            <IonButton data-tooltip-id='tooltip' data-tooltip-content='Regenerate' className='text-xs' onClick={() => handleButtonClick('regenarate', tabIndex, itemIndex, tabItem.input_params)} shape="round">
                              <IonIcon className='' slot="icon-only" icon={refreshOutline}></IonIcon>
                            </IonButton>
                            <IonButton data-tooltip-id='tooltip' data-tooltip-content='Copy all' className='text-xs' onClick={() => copyToClipboard('multiple', tabItem.outputs)} shape="round">
                              <IonIcon className='' slot="icon-only" icon={copyOutline}></IonIcon>
                            </IonButton>
                            <IonButton data-tooltip-id='tooltip' data-tooltip-content='Download all' className='text-xs' onClick={() => exportToDoc('multiple', tabItem.outputs)} shape="round">
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
        <div className="bg-white p-4 rounded-md relative">
          {tabs.map((tabItem:any, tabIndex) => (
            <div className='mb-5 tab-body border p-4 rounded-md relative' key={tabItem.format_id}>
              {tabItem.format_name &&
                <h3 className='capitalize'>{tabItem.format_name}</h3>
              }

              {tabItem.outputs.length !== 0 ?
                <>
                  {tabItem.outputs.map((outputItem:any, outputIndex:number) => {
                    const containerRef = React.createRef<HTMLDivElement>();
                    const boxIndex = tabIndex * 10 + outputIndex;
                    return (
                      <div ref={containerRef} onMouseUp={(e) => handleMouseUp(e, containerRef.current!, boxIndex)} key={boxIndex} className='shadow-md rounded-md p-2 mb-1.5 relative'>
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} children={outputItem.answer}/>
                        {/* Popover only for the active box */}
                        {position && activeBox === boxIndex && (
                          <div
                            style={{
                              position: "absolute",
                              top: position.top + 20,
                              left: position.left,
                              zIndex: 1000,
                            }}
                          >
                            <div className='popover-buttons'>
                              <IonButton data-tooltip-id='tooltip' data-tooltip-content='Refine Answer' className='text-xs' shape="round">
                                <IonIcon slot="icon-only" icon={chatbubblesOutline}></IonIcon>
                              </IonButton>
                              <IonButton data-tooltip-id='tooltip' data-tooltip-content='Regenerate' className='text-xs' shape="round">
                                <IonIcon slot="icon-only" icon={refreshOutline}></IonIcon>
                              </IonButton>
                            </div>
                          </div>
                        )}
                        {/* Edit answer for each output */}
                        {editVisibility.tabIndex === tabIndex && editVisibility.itemIndex === null && editVisibility.outputIndex === outputIndex && (
                          <IonTextarea
                            className='z-0 bottom-textarea rounded-xl text-black'
                            aria-label="Custom textarea"
                            placeholder="Write your question."
                            autoGrow={true}
                            counter={true}
                            maxlength={2000}
                            value={editInputValues[tabIndex][outputIndex] as string}
                            onIonInput={(event) => handleEditChange(tabIndex,null,outputIndex, event)}
                          >
                            <IonButton  data-tooltip-id='tooltip' data-tooltip-content='Copy text' onClick={() => copyToClipboard('single', editInputValues[tabIndex][outputIndex] as string)} size="small" fill="clear" slot="end" >
                              <IonIcon className='text-primary' slot="icon-only" icon={copyOutline}></IonIcon>
                            </IonButton>
                          </IonTextarea>
                        )}
                        {/* Action buttons for each output */}
                        <div className='flex items-center justify-between'>
                          <div>
                            <IonIcon data-tooltip-id='tooltip' data-tooltip-content='Positive' onClick={() => openFeedbackAlert(outputItem.input_params.session_id, 'positive')} className='mr-2.5 cursor-pointer hover:text-primary' slot="icon-only" icon={thumbsUpOutline}></IonIcon>
                            <IonIcon data-tooltip-id='tooltip' data-tooltip-content='Negative' onClick={() => openFeedbackAlert(outputItem.input_params.session_id, 'negative')} className='mr-2.5 cursor-pointer hover:text-primary' slot="icon-only" icon={thumbsDownOutline}></IonIcon>
                          </div>
                          <div >
                            <IonButton data-tooltip-id='tooltip' data-tooltip-content='Copy text' fill="clear" className='text-xs' onClick={() => copyToClipboard('single', editInputValues[tabIndex][outputIndex] as string)} shape="round">
                              <IonIcon className='' slot="icon-only" icon={copyOutline}></IonIcon>
                            </IonButton>
                            <IonButton data-tooltip-id='tooltip' data-tooltip-content='Edit answer' fill="clear" className='text-xs' onClick={() => editAnswerVisibility(tabIndex, null, outputIndex)} shape="round">
                              {editVisibility.tabIndex === tabIndex && editVisibility.itemIndex === null && editVisibility.outputIndex === outputIndex ?
                                <IonIcon className='' slot="icon-only" icon={closeOutline}></IonIcon>
                              :
                                <IonIcon className='' slot="icon-only" icon={createOutline}></IonIcon>
                              }
                            </IonButton>
                            <IonButton data-tooltip-id='tooltip' data-tooltip-content='Download as .doc' fill="clear" className='text-xs' onClick={() => exportToDoc('single', outputItem.answer)} shape="round">
                              <IonIcon className='' slot="icon-only" icon={documentTextOutline}></IonIcon>
                            </IonButton>
                          </div>
                        </div>
                    </div>
                    );
                  })}
                  
                  {!tabItem.answer &&
                    <IonSpinner name="dots"></IonSpinner>
                  }
                  
                  {typeof inputVisibility[tabIndex] === 'boolean' && inputVisibility[tabIndex] && (
                    <IonTextarea
                      className='z-0 bottom-textarea rounded-xl mt-5 mb-2.5 text-black'
                      aria-label="Custom textarea"
                      placeholder="Write your question."
                      autoGrow={true}
                      counter={true}
                      maxlength={2000}
                      value={inputValues[tabIndex] as string}
                      onIonInput={(event) => handleInputChange(tabIndex, event, '')}
                    >
                      <IonButton  data-tooltip-id='tooltip' data-tooltip-content='Genarate' onClick={() => handleSubmitChatAnswer(tabIndex, '')} size="small" fill="clear" slot="end" >
                        <IonIcon className='text-primary' slot="icon-only" icon={send}></IonIcon>
                      </IonButton>
                    </IonTextarea>
                  )}
                  <div className='text-right'>
                      <IonButton data-tooltip-id='tooltip' data-tooltip-content='Refine Answer' onClick={() => toggleInputVisibility(tabIndex, null)} className='text-xs' shape="round">
                        {typeof inputVisibility[tabIndex] === 'boolean' && inputVisibility[tabIndex] ? 
                          <IonIcon slot="icon-only" icon={closeOutline}></IonIcon>
                          :
                          <IonIcon slot="icon-only" icon={chatbubblesOutline}></IonIcon>
                        }
                      </IonButton>
                      <IonButton data-tooltip-id='tooltip' data-tooltip-content='Regenerate' className='text-xs' onClick={() => handleButtonClick('regenarate', tabIndex, '', tabItem.input_params)} shape="round">
                        <IonIcon slot="icon-only" icon={refreshOutline}></IonIcon>
                      </IonButton>
                      <IonButton data-tooltip-id='tooltip' data-tooltip-content='Copy all' className='text-xs' onClick={() => copyToClipboard('multiple', tabItem.outputs)} shape="round">
                        <IonIcon slot="icon-only" icon={copyOutline}></IonIcon>
                      </IonButton>
                      
                      <IonButton data-tooltip-id='tooltip' data-tooltip-content='Download all' className='text-xs' onClick={() => exportToDoc('multiple', tabItem.outputs)} shape="round">
                        <IonIcon slot="icon-only" icon={documentTextOutline}></IonIcon>
                      </IonButton>
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
      <Tooltip id='tooltip' />
    </div>
  );
};

export default Tabs;

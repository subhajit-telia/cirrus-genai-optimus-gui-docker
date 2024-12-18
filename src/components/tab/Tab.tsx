import { IonButton, IonCol, IonGrid, IonIcon, IonItem, IonLabel, IonList, IonPopover, IonRow, IonSpinner, IonTextarea, IonToast } from '@ionic/react';
import React, { useEffect, useRef, useState } from 'react';
import { addOutline, arrowUndoOutline, chatbubbleEllipsesOutline, chatbubblesOutline, closeCircleOutline, closeOutline, copyOutline, createOutline, documentTextOutline, refreshOutline, reloadOutline, returnDownForwardOutline, saveOutline, send, star, starOutline, thumbsDownOutline, thumbsUpOutline } from 'ionicons/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import './Tab.css';
import { saveAs } from 'file-saver';
import FeedbackAlert from '../feedback/Feedback';
import { Tooltip } from 'react-tooltip';
import { AccessToken, HTTPMethod, NetworkInfo } from '../../routes/network';
import FeedbackModal from '../feedbackBox/FeedbackBox';

import {MDXEditor, MDXEditorMethods, headingsPlugin, listsPlugin, quotePlugin, thematicBreakPlugin} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import stringSimilarity from "string-similarity";

interface Tab {
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
  input_params: any
  outputs:[innerOutput]
}
interface innerOutput {
  answer: string,
  input_params: any
  rating: number | null
}

interface TabsProps {
  tabs: Tab[];
  regenarateItem: (data: string) => void;
  saveEditedAnswer: (data: string) => void;
  genarateRefineCopy: (data: string) => void;
}

interface Position {
  top: number;
  left: number;
}

interface RefineAnswer {
  itemIndex: number;
  tabIndex: number;
  outputIndex: number;
  outputItem: {}
}

interface FeedbackBox {
  qid: string,
  rating: number,
  format_rate: number,
  integrity_rate: number,
  communication_rate: number,
  comment: string
}

const Tabs: React.FC<TabsProps> = ({ tabs, regenarateItem, saveEditedAnswer, genarateRefineCopy }) => {
  const [activeTab, setActiveTab] = useState(tabs[0].segment_id); // Set the first tab as active initially
  
  const [isSaveChanges, setIsSaveChanges] = useState(false);
  const [isEditQid, setIsEditQid] = useState('');
  const [isRefineBox, setIsRefineBox] = useState(false);
  const [isRefineText, setIsRefineText] = useState('');
  const [isRefineType, setIsRefineType] = useState('');
  const [isTextIndex, setIsTextIndex] = useState<number | null>(null);


  const [isRefineDetails, setIsRefineDetails] = useState<any>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FeedbackBox | null>(null);
  const apiUrl = window.RUNTIME_ENV?.REACT_APP_API_URL || NetworkInfo.URL;
 
  // const [popoverEvent, setPopoverEvent] = useState<MouseEvent | null>(null);

  const [hoveredRating, setHoveredRating] = useState<{ qid: string; rating: number | null } | null>(null);

  const textareaRef = useRef<HTMLIonTextareaElement>(null);

  const [isShowError, setIsShowError] = useState(false);
  const [isErrorMsg, setIsErrorMsg] = useState('');

  const mdxEditorRef = React.useRef<MDXEditorMethods>(null)

  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const [selectedText, setSelectedText] = useState("");
  const [clickedText, setClickedText] = useState("");
  const [editorChangedText, setEditorChangedText] = useState('');
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [currentEditCopy, setCurrentEditCopy] = useState("");

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
      // data.session_id = generateDateTimeString();
      // data.session_family_id = generateDateTimeString();
      // data.qid = generateDateTimeString();
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
      setIsRefineBox(false);
      setIsRefineText('');
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

  /* ----------Save edit answer copy start---------- */
  const saveAnswerChange = async (value:any, qid:any) => {
    console.log('saveAnswerChange', value);
    console.log('qid', qid);
    setIsRefineBox(false);
    setIsEditQid(qid);
    setIsSaveChanges(true);
    let data:any = {
      qid: qid,
      text: value
    }
    saveEditedAnswer(data);
  }
  /* Save edit answer copy end */

  /* ----------Discard edit answer copy start---------- */
  const discardAnswerChange = async () => {
    console.log('currentEditCopy', currentEditCopy);
    console.log('isRefineDetails', isRefineDetails);

    if (isRefineDetails.itemIndex !== '' && isRefineDetails.itemIndex !== null) {
      tabs[isRefineDetails.tabIndex].data[isRefineDetails.itemIndex].outputs[isRefineDetails.outputIndex].answer = currentEditCopy;
      console.log('tabs@@@@', tabs)
    }else {
      tabs[isRefineDetails.tabIndex].outputs[isRefineDetails.outputIndex].answer = currentEditCopy;
      console.log('tabs####', tabs)
    }
    setCurrentEditCopy('');
  }
  /* Discard edit answer copy end */

  useEffect(() => {
    console.log('tabstabstabstabstabs', tabs);
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
    if (editInputValues[0].length === 0) {
      setEditVisibility({ tabIndex: null, itemIndex: null, outputIndex: null });
      setIsRefineBox(false);
    }else if (editInputValues[0][0].length === 0) {
      setEditVisibility({ tabIndex: null, itemIndex: null, outputIndex: null });
      setIsRefineBox(false);
    }
    console.log('tabs>><<', tabs);
    setIsSaveChanges(false);
    setIsEditQid('');

    // console.log('selectedText', selectedText)
  }, [tabs]);

  const onDismissEditorPopup = () => {
    setPopoverOpen(false);
    setSelectedText('');
    setClickedText('');
  };

  // Handle text selection
  const handleEditorSelection = (event: React.MouseEvent<HTMLDivElement>) => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const selected = selection.toString();

      // Get the position for the popover
      const range = selection.getRangeAt(0);
      const rects = range.getClientRects();

       // Get the start index of the selection
       const startIndex = range.startOffset;
       const endIndex = range.endOffset;

      if (rects.length > 0) {
        const rect = rects[0]; // First bounding rect
        const top = rect.top + window.scrollY - 35; // Adjust for the button (above selection)
        const left = rect.left + window.scrollX; // Adjust horizontal position
  
        setSelectedText(selection.toString());
        setPopoverPosition({ top, left });
      }

      setSelectedText(selected);
      setPopoverOpen(true);
    } else {
      setPopoverOpen(false);
    }
  };

  // Handle mouse click
  const handleEditorMouseClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const selection = window.getSelection();

    console.log('selection', selection);
    console.log('event', event);
    if (!selection || !selection.toString().trim()) {
      const range = document.caretRangeFromPoint(event.clientX, event.clientY);

      setPopoverPosition({
        top: event.clientY + window.scrollY,
        left: event.clientX + window.scrollX,
      });

      setClickedText("");
      setPopoverOpen(true);
    }

    if (selection && selection.rangeCount > 0) {
      const range2 = selection.getRangeAt(0); // Get the selected range
      const offset = range2.startOffset; // The index of the clicked text

      
      console.log('setIsTextIndex>>', offset);
      console.log('range2>>', range2);
      console.log('selection>>', selection.toString());
      const selectedLine = selection.toString()
      const selectionlines = selectedLine.split("\n").map((line:string) => line.trim());
      console.log('selectionlines', selectionlines);
      console.log('isRefineDetails', isRefineDetails);


      // Split content into lines
      const actualContent = isRefineDetails.outputItem.answer;
      const currentLine:any = range2.commonAncestorContainer;
      const lines = actualContent.split("\n").map((line:string) => line.trim());
      console.log('lines', lines);
      console.log('currentLine', currentLine);
      const normalizedClickedLine = (currentLine.innerText || currentLine.wholeText).trim();
      console.log('normalizedClickedLine', normalizedClickedLine);
      // Find the index of the clicked line in the markdown content
      // const lineIndex = lines.findIndex((line:string) => line.replace(/\*\*(.*?)\*\*/g, "$1") == normalizedClickedLine.replace(/\*\*(.*?)\*\*/g, "$1"));
      // console.log('lineIndex', lineIndex);

      let lineIndexed:number = -1;
      for (let index = 0; index < lines.length; index++) {
        const line: string = lines[index];
        
        if (line === normalizedClickedLine) {
          lineIndexed = index;
          break; // Stop the loop if an exact match is found
        } else {
          const cleanedText1 = line.replace(/\*\*(.*?)\*\*/g, "$1");
          const cleanedText2 = normalizedClickedLine.replace(/\*\*(.*?)\*\*/g, "$1");
      
          const similarityScore = stringSimilarity.compareTwoStrings(
            cleanedText1,
            cleanedText2
          );
      
          console.log("similarityScore", similarityScore);
          if (similarityScore > 0.8) {
            console.log("lineIndexed", index);
            lineIndexed = index;
            break; // Stop the loop if a similar match is found
          }else{
            const similarityScore2 = stringSimilarity.compareTwoStrings(
              line,
              selectionlines[0]
            );


            if (similarityScore2 > 0.8) {
              console.log("similarityScore2", similarityScore2);
              console.log("line", line);
              console.log("selectionlines[0]", selectionlines[0]);

              console.log("lineIndexed", index);
              lineIndexed = index;
            }

            
          }
        }
      }
      console.log('lineIndexed<<<<>>>>', lineIndexed);
      if (lineIndexed === -1) {
        console.error("Clicked line not found. Check formatting or spaces.");
        setIsShowError(true);
        setIsErrorMsg('Clicked line not found. Please select again!');
        return;
      }

      // Calculate the global index
      let cumulativeLength = 0;

      // Sum the lengths of all previous lines (including line breaks)
      for (let i = 0; i < lineIndexed; i++) {
        console.log('cumulativeLength$$>>', cumulativeLength);
        console.log('lines[i]$$>>', lines[i]);
        cumulativeLength += lines[i].length + 1; // Add 1 for '\n'
      }

      // Add the relative index (clicked position within the line)
      const globalIndex = cumulativeLength + offset;
      setIsTextIndex(globalIndex);
      console.log('globalIndex', globalIndex);
    }
  };

  const handleChangeEditor = (updatedMarkdown: string) => {
    console.log('handleChangeEditor', updatedMarkdown);
    setEditorChangedText(updatedMarkdown);
  }

  // Handle text selection and show popover
  const handleSelection = (event: React.MouseEvent) => {
    setClickedText('');
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const selectedText = selection.toString().trim();
      console.log('selectedText', selectedText);
      // Show popover at the selected text's position
      setSelectedText(selectedText);
      setPopoverPosition({
        top: event.clientY + window.scrollY - 160, // Include scrolling offset
        left: event.clientX + window.scrollX - 200,
      });
      // setPopoverEvent(event.nativeEvent);
      setPopoverOpen(true);
      console.log('clientX', event.nativeEvent.clientX, 'clientY', event.nativeEvent.clientY);
    }
  };

  // Handle word click and copy the word to clipboard
  const handleWordClick = (event: React.MouseEvent) => {
    const textareaElement = textareaRef.current?.getInputElement();
    textareaElement?.then((element) => {
      if (element) {
        const caretPosition = element.selectionStart; // Get caret position
        const word = getWordAtCaretPosition(element.value, caretPosition);
        console.log('caretPosition', caretPosition);
        setIsTextIndex(caretPosition);
        if (word) {
          navigator.clipboard.writeText(word).then(() => {
            console.log(`Copied: ${word}`);
          });
          setClickedText(word)
          setPopoverPosition({
            top: event.clientY + window.scrollY - 160, // Include scrolling offset
            left: event.clientX + window.scrollX - 200,
          });
          // setPopoverEvent(event.nativeEvent);
          setPopoverOpen(true);
          console.log('clientX', event.nativeEvent.clientX, 'clientY', event.nativeEvent.clientY);

        }
      }
    });

    // Close popover if open
    if (popoverOpen) {
      // setPopoverOpen(false);
    }
  };

  // Get the word at the caret position
  const getWordAtCaretPosition = (text: string, position: number) => {
    const leftPart = text.slice(0, position).split(/\s+/).pop();
    const rightPart = text.slice(position).split(/\s+/).shift();

    return [leftPart, rightPart].filter(Boolean).join(""); // Join left and right parts to form the word
  };

  // onDismissPopup start
  const onDismissPopup = () => {
    setPopoverOpen(false);
    setSelectedText('');
    setClickedText('')
  }
  
  /* ----------select Copy Qid start---------- */
  const selectCopyQid = async (tabIndex:number, itemIndex:any, outputIndex:number, outputItem:any) => {
    console.log(tabIndex +'/'+ itemIndex +'/'+ outputItem);
    let selectedItem:RefineAnswer = {
      tabIndex: tabIndex,
      itemIndex: itemIndex,
      outputIndex: outputIndex,
      outputItem: outputItem
    }
    console.log('selectedItem', selectedItem);
    setIsRefineDetails(selectedItem);
  }
  /* select Copy Qid end */

  /* --------refine Selected Text start-------- */
  const refineSelectedText = (_identifier:any, _text:any) => {
    console.log('_text', _text);
    setPopoverOpen(false);
    setIsRefineText(_text);
    setIsRefineType(_identifier);
    console.log('selectedText', selectedText);
    console.log('clickedText', clickedText);
    // setPosition(null);
    if (_identifier === 'refine') {
      setIsRefineBox(true);
    }else if (_identifier === 'regenarate'){
      setIsRefineBox(false);
      setIsRefineText('');
      submitRefineQuestion('','regenerate', _text)
    }else {
      // submitRefineQuestion('','insert')
      setIsRefineBox(true);
    }
    console.log('_identifier', _identifier);
  }
  /* refine Selected Text end */

  /* --------refine Selected copy start-------- */
  const submitRefineQuestion = (data:any, identifier:any, text:any) => {
    console.log('submitRefineQuestion', data);
    console.log('isRefineDetails', isRefineDetails);
    console.log('isRefineText',isRefineText);
    console.log('text>>>>>',text);
    console.log('isRefineType>>>>', isRefineType);
    let refineData:any;
    if (isRefineType === 'insert') {
      refineData = {
        qid: isRefineDetails.outputItem.input_params.qid,
        action: identifier,
        text: '',
        text_index: isTextIndex,
        question: data
      }
    }else {
      refineData = {
        qid: isRefineDetails.outputItem.input_params.qid,
        action: identifier,
        text: text,
        text_index: isTextIndex,
        question: data
      }
    }
    console.log('refineData', refineData);
    genarateRefineCopy(refineData);
    // setIsRefineBox(false);
    // setPosition(null);
    // setPopoverContent('');

    console.log('isRefineDetails', isRefineDetails);
    // editAnswerVisibility(isRefineDetails.tabIndex, isRefineDetails.itemIndex, isRefineDetails.outputIndex);

    if (isRefineDetails.itemIndex !== '' && isRefineDetails.itemIndex !== null) {
      tabs[isRefineDetails.tabIndex].data[isRefineDetails.itemIndex].answer = '';
      console.log('tabs@@@@', tabs)
    }else {
      tabs[isRefineDetails.tabIndex].answer = '';
      console.log('tabs####', tabs)
    }
  }
  /* refine Selected copy end */

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

  const openFeedbackAlert = (qId: string) => {
    if (feedbackAlertRef.current) {
      feedbackAlertRef.current.open(qId);
    }
  };

  /* ----------------star rating start---------------- */
  const handleTotalRatingClick = async (tabIndex:number, itemIndex:any, outputIndex:number, qid:string, rating: number) => {

    console.log('item', qid);
    console.log('rating', rating);

    console.log(tabIndex +'/'+ itemIndex +'/'+ outputIndex)
    let starItem:any = {
      qid: qid,
      rating: rating,
      format_rate: rating,
      integrity_rate: rating,
      communication_rate: rating,
      comment: '',
      tabIndex: tabIndex,
      itemIndex: itemIndex,
      outputIndex: outputIndex
    };

    let data:any = {
      qid: qid,
      rating: rating,
    };
    if (itemIndex !== '' && itemIndex !== null) {
      tabs[tabIndex].data[itemIndex].outputs[outputIndex].rating = rating;
      console.log('tabs@@@@', tabs)
    }else {
      tabs[tabIndex].outputs[outputIndex].rating = rating;
    }
    console.log('tabs', tabs);
    // Open the modal with the updated item
    setSelectedItem(starItem);
    setIsModalOpen(true);

    console.log('selectedItem', selectedItem);

    let formUrl = apiUrl + '/feedback/put';
    try {
      const response = await fetch(formUrl, {
        method: HTTPMethod.PUT,
        headers: {
          '"removed"': AccessToken."removed",
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
      });
  
      const responseData = await response.json();
      console.log('Success:', responseData);

      if (response.ok && !responseData.ErrorMessage) {
        setIsShowError(true);
        setIsErrorMsg('Feedback submitted!');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
    }
  };

  const handleFeedbackSave = async (updatedItem: any) => {
    console.log('updatedItem', updatedItem);
    setIsModalOpen(false);
    if (updatedItem.rating === 5) {
      openFeedbackAlert(updatedItem.qid);
    }

    if (updatedItem.itemIndex !== '' && updatedItem.itemIndex !== null) {
      tabs[updatedItem.tabIndex].data[updatedItem.itemIndex].outputs[updatedItem.outputIndex].rating = updatedItem.rating;
      console.log('tabs@@@@', tabs)
    }else {
      tabs[updatedItem.tabIndex].outputs[updatedItem.outputIndex].rating = updatedItem.rating;
    }

    let data:any = {
      qid: updatedItem.qid,
      rating: updatedItem.rating,
      format_rate: updatedItem.rating,
      integrity_rate: updatedItem.rating,
      communication_rate: updatedItem.rating,
      comment: updatedItem.comment,
    };
    
    let formUrl = apiUrl + '/feedback/put';
    try {
      const response = await fetch(formUrl, {
        method: HTTPMethod.PUT,
        headers: {
          '"removed"': AccessToken."removed",
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
      });
  
      const responseData = await response.json();
      console.log('Success:', responseData);

      if (response.ok && !responseData.ErrorMessage) {
        setIsShowError(true);
        setIsErrorMsg('Thanks for the feedback.');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
    }
  };
  /* star rating end */

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

                    {tabItem.outputs.length > 0 ?
                      <>
                        {tabItem.outputs.map((outputItem:any, outputIndex) => (
                          <div onClick={() => selectCopyQid(tabIndex, itemIndex, outputIndex, outputItem)} className='shadow-md rounded-md p-2 mb-1.5 relative' key={outputIndex}>
                            {/* Show the output copy */}
                            {editVisibility.tabIndex === tabIndex && editVisibility.itemIndex === itemIndex && editVisibility.outputIndex === outputIndex ?
                              <></>
                              :
                              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} children={outputItem.answer}/>
                              
                            }

                            {/* Edit answer for each output */}
                            {editVisibility.tabIndex === tabIndex && editVisibility.itemIndex === itemIndex && editVisibility.outputIndex === outputIndex &&
                              <>
                                {/* <IonTextarea
                                  ref={textareaRef}
                                  onMouseUp={handleSelection}
                                  onClick={handleWordClick}
                                  className='relative editing-box z-0 bottom-textarea rounded-xl mb-2.5 text-black'
                                  aria-label="Custom textarea"
                                  placeholder="Write your question."
                                  autoGrow={true}
                                  value={editInputValues[tabIndex][itemIndex][outputIndex]}
                                  onIonInput={(event) => handleEditChange(tabIndex, itemIndex, outputIndex, event)}
                                >        
                                </IonTextarea> */}
                                {editInputValues[tabIndex][itemIndex][outputIndex] &&
                                  <div ref={editorRef} onMouseUp={handleEditorSelection} onClick={handleEditorMouseClick} className='relative'>
                                    <MDXEditor 
                                      ref={mdxEditorRef}
                                      markdown={editInputValues[tabIndex][itemIndex][outputIndex]}
                                      key={editInputValues[tabIndex][itemIndex][outputIndex]}
                                      onChange={handleChangeEditor}
                                      plugins={[headingsPlugin(), listsPlugin(), quotePlugin(), thematicBreakPlugin()]}
                                    />
                                  </div>
                                }
                                

                                {/* Backdrop */}
                                {popoverOpen && (
                                  <>
                                    <div
                                      style={{
                                        position: "fixed",
                                        top: 0,
                                        left: 0,
                                        width: "100%",
                                        height: "100%",
                                        zIndex: 999,
                                      }}
                                      onClick={() => onDismissEditorPopup()} // Close popover on backdrop click
                                    ></div>

                                    {/* Custom Popover */}
                                    <div
                                      style={{
                                        position: "absolute",
                                        top: `${popoverPosition.top}px`,
                                        left: `${popoverPosition.left}px`,
                                        zIndex: 1000,
                                      }}
                                    >
                                      {selectedText !== '' ?
                                        <>
                                          <IonButton onClick={() => refineSelectedText('refine', selectedText)} data-tooltip-id='tooltip' data-tooltip-content='Refine' className='text-xs' shape="round">
                                            <IonIcon slot="icon-only" icon={chatbubblesOutline}></IonIcon>
                                          </IonButton>
                                          <IonButton onClick={() => refineSelectedText('regenarate', selectedText)} data-tooltip-id='tooltip' data-tooltip-content='Regenerate' className='text-xs' shape="round">
                                            <IonIcon slot="icon-only" icon={refreshOutline}></IonIcon>
                                          </IonButton>
                                        </>
                                      :
                                        <IonButton onClick={() => refineSelectedText('insert', clickedText)} data-tooltip-id='tooltip' data-tooltip-content='Generate More' className='text-xs' shape="round">
                                          <IonIcon slot="icon-only" icon={addOutline}></IonIcon>
                                        </IonButton>
                                      }
                                    </div>
                                  </>
                                )}
                              </>
                            }

                            {/* Action buttons for each output */}
                            <div className='flex items-center justify-between'>
                              <div>
                                {/* <IonIcon data-tooltip-id='tooltip' data-tooltip-content='Positive' onClick={() => openFeedbackAlert(outputItem.input_params.session_id, 'positive')} className='mr-2.5 cursor-pointer hover:text-primary' slot="icon-only" icon={thumbsUpOutline}></IonIcon>
                                <IonIcon data-tooltip-id='tooltip' data-tooltip-content='Negative' onClick={() => openFeedbackAlert(outputItem.input_params.session_id, 'negative')} className='mr-2.5 cursor-pointer hover:text-primary' slot="icon-only" icon={thumbsDownOutline}></IonIcon> */}
                                <div style={{ display: "flex", gap: "5px" }}>
                                  {[1, 2, 3, 4, 5].map((starValue) => (
                                    <IonIcon
                                      key={starValue}
                                      icon={
                                        starValue <=
                                        (hoveredRating && hoveredRating.qid === outputItem.input_params.qid
                                          ? hoveredRating.rating ?? 0
                                          : outputItem.rating ?? 0)
                                          ? star
                                          : starOutline
                                      }
                                      onMouseEnter={() =>
                                        setHoveredRating({ qid: outputItem.input_params.qid, rating: starValue })
                                      }
                                      onMouseLeave={() => setHoveredRating(null)}
                                      color="primary"
                                      onClick={() => handleTotalRatingClick(tabIndex, itemIndex, outputIndex, outputItem.input_params.qid, starValue)}
                                      style={{ cursor: "pointer", fontSize: "24px" }}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div>
                                <IonButton fill="clear" data-tooltip-id='tooltip' data-tooltip-content='Copy text' className='text-xs' onClick={() => copyToClipboard('single', outputItem.answer)} shape="round">
                                  <IonIcon className='' slot="icon-only" icon={copyOutline}></IonIcon>
                                </IonButton>
                                {editVisibility.tabIndex === tabIndex && editVisibility.itemIndex === itemIndex && editVisibility.outputIndex === outputIndex ? 
                                  <>
                                    <IonButton fill="clear" data-tooltip-id='tooltip' data-tooltip-content='Save answer' className='text-xs' onClick={() => {saveAnswerChange(editorChangedText || editInputValues[tabIndex][itemIndex][outputIndex], outputItem.input_params.qid); editAnswerVisibility(tabIndex, itemIndex, outputIndex)}} shape="round">
                                      <IonIcon className='' slot="icon-only" icon={saveOutline}></IonIcon>
                                    </IonButton>

                                    <IonButton fill="clear" data-tooltip-id='tooltip' data-tooltip-content='Discard' className='text-xs' onClick={() => {editAnswerVisibility(tabIndex, itemIndex, outputIndex), discardAnswerChange()}} shape="round">
                                      <IonIcon className='' slot="icon-only" icon={closeCircleOutline}></IonIcon>
                                    </IonButton>
                                  </>
                                :
                                  <IonButton fill="clear" data-tooltip-id='tooltip' data-tooltip-content='Edit answer' className='text-xs' onClick={() => {editAnswerVisibility(tabIndex, itemIndex, outputIndex), setCurrentEditCopy(outputItem.answer)}} shape="round">
                                    {isSaveChanges && outputItem.input_params.qid === isEditQid ?
                                      <IonIcon className='animate-spin' slot="icon-only" icon={refreshOutline}></IonIcon>
                                    :
                                      <IonIcon className='' slot="icon-only" icon={createOutline}></IonIcon>
                                    }
                                  </IonButton>
                                }
                                
                                <IonButton fill="clear" data-tooltip-id='tooltip' data-tooltip-content='Download as .doc' className='text-xs' onClick={() => exportToDoc('single', outputItem.answer)} shape="round">
                                  <IonIcon className='' slot="icon-only" icon={documentTextOutline}></IonIcon>
                                </IonButton>
                              </div>
                            </div>
                          </div>
                        ))}
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

                        {(isRefineBox && isRefineDetails.tabIndex === tabIndex && isRefineDetails.itemIndex === itemIndex) &&
                          <div className='mt-5 bottom-textarea rounded-xl'>
                            {isRefineType === 'refine' &&
                              <div className='showSelectedText'>
                                <div>
                                  <IonIcon icon={returnDownForwardOutline}></IonIcon>
                                </div>
                                <div className='text'>
                                  {isRefineText}
                                </div>
                              </div>
                            }
                            <IonTextarea
                              className='z-0  mb-2.5 text-black'
                              aria-label="Custom textarea"
                              placeholder="Write your question."
                              autoGrow={true}
                              counter={true}
                              maxlength={2000}
                              // value={(inputValues[tabIndex] as string[])[itemIndex]}
                              onIonInput={(event) =>  handleInputChange(tabIndex, event, itemIndex)}
                            >
                              <IonButton  data-tooltip-id='tooltip' data-tooltip-content='Genarate' onClick={() => submitRefineQuestion((inputValues[tabIndex] as string[])[itemIndex], isRefineType, isRefineText)} size="small" fill="clear" slot="end" >
                                <IonIcon className='text-primary' slot="icon-only" icon={send}></IonIcon>
                              </IonButton>
                            </IonTextarea>
                          </div>
                        }
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
                  {tabItem.outputs.map((outputItem:any, outputIndex:number) => (
                    <div onClick={() => selectCopyQid(tabIndex, null, outputIndex, outputItem)} className='shadow-md rounded-md p-2 mb-1.5 relative'>
                      {/* Show the output copy */}
                      {editVisibility.tabIndex === tabIndex && editVisibility.itemIndex === null && editVisibility.outputIndex === outputIndex ?
                        <></>
                        :
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} children={outputItem.answer}/>
                      }
                      
                      {/* Edit answer for each output */}
                      {editVisibility.tabIndex === tabIndex && editVisibility.itemIndex === null && editVisibility.outputIndex === outputIndex &&
                        <>
                          {/* <IonTextarea
                            ref={textareaRef}
                            onMouseUp={handleSelection}
                            onClick={handleWordClick}
                            className='relative editing-box z-0 bottom-textarea rounded-xl text-black'
                            aria-label="Custom textarea"
                            placeholder="Write your question."
                            autoGrow={true}
                            value={editInputValues[tabIndex][outputIndex] as string}
                            onIonInput={(event) => handleEditChange(tabIndex,null,outputIndex, event)}
                          >
                          </IonTextarea> */}
                          {editInputValues[tabIndex][outputIndex] && 
                            <div ref={editorRef} onMouseUp={handleEditorSelection} onClick={handleEditorMouseClick} className='relative'>
                              <MDXEditor 
                                ref={mdxEditorRef}
                                markdown={editInputValues[tabIndex][outputIndex] as string} 
                                key={editInputValues[tabIndex][outputIndex] as string} 
                                onChange={handleChangeEditor}
                                plugins={[headingsPlugin(), listsPlugin(), quotePlugin(), thematicBreakPlugin()]}
                              />
                            </div>
                          }
                          

                          {/* Backdrop */}
                          {popoverOpen && (
                            <>
                              <div
                                style={{
                                  position: "fixed",
                                  top: 0,
                                  left: 0,
                                  width: "100%",
                                  height: "100%",
                                  zIndex: 999,
                                }}
                                onClick={() => onDismissEditorPopup()} // Close popover on backdrop click
                              ></div>

                              {/* Custom Popover */}
                              <div
                                style={{
                                  position: "absolute",
                                  top: `${popoverPosition.top}px`,
                                  left: `${popoverPosition.left}px`,
                                  zIndex: 1000,
                                }}
                              >
                                {selectedText !== '' ?
                                  <>
                                    <IonButton onClick={() => refineSelectedText('refine', selectedText)} data-tooltip-id='tooltip' data-tooltip-content='Refine' className='text-xs' shape="round">
                                      <IonIcon slot="icon-only" icon={chatbubblesOutline}></IonIcon>
                                    </IonButton>
                                    <IonButton onClick={() => refineSelectedText('regenarate', selectedText)} data-tooltip-id='tooltip' data-tooltip-content='Regenerate' className='text-xs' shape="round">
                                      <IonIcon slot="icon-only" icon={refreshOutline}></IonIcon>
                                    </IonButton>
                                  </>
                                :
                                  <IonButton onClick={() => refineSelectedText('insert', clickedText)} data-tooltip-id='tooltip' data-tooltip-content='Generate More' className='text-xs' shape="round">
                                    <IonIcon slot="icon-only" icon={addOutline}></IonIcon>
                                  </IonButton>
                                }
                              </div>
                            </>
                          )}
                        </>
                      }
                      {/* Action buttons for each output */}
                      <div className='flex items-center justify-between'>
                        <div>
                          <div style={{ display: "flex", gap: "5px" }}>
                            {[1, 2, 3, 4, 5].map((starValue) => (
                              <IonIcon
                                key={starValue}
                                icon={
                                  starValue <=
                                  (hoveredRating && hoveredRating.qid === outputItem.input_params.qid
                                    ? hoveredRating.rating ?? 0
                                    : outputItem.rating ?? 0)
                                    ? star
                                    : starOutline
                                }
                                onMouseEnter={() =>
                                  setHoveredRating({ qid: outputItem.input_params.qid, rating: starValue })
                                }
                                onMouseLeave={() => setHoveredRating(null)}
                                color="primary"
                                onClick={() => handleTotalRatingClick(tabIndex, null, outputIndex, outputItem.input_params.qid, starValue)}
                                
                                style={{ cursor: "pointer", fontSize: "24px" }}
                              />
                            ))}
                          </div>
                        </div>
                        <div >
                          <IonButton data-tooltip-id='tooltip' data-tooltip-content='Copy text' fill="clear" className='text-xs' onClick={() => copyToClipboard('single', editInputValues[tabIndex][outputIndex] as string)} shape="round">
                            <IonIcon className='' slot="icon-only" icon={copyOutline}></IonIcon>
                          </IonButton>

                          {editVisibility.tabIndex === tabIndex && editVisibility.itemIndex === null && editVisibility.outputIndex === outputIndex ? 
                            <>
                              <IonButton fill="clear" data-tooltip-id='tooltip' data-tooltip-content='Save answer' className='text-xs' onClick={() => {saveAnswerChange(editorChangedText || editInputValues[tabIndex][outputIndex] as string, outputItem.input_params.qid); editAnswerVisibility(tabIndex, null, outputIndex)}} shape="round">
                                <IonIcon className='' slot="icon-only" icon={saveOutline}></IonIcon>
                              </IonButton>

                              <IonButton fill="clear" data-tooltip-id='tooltip' data-tooltip-content='Discard' className='text-xs' onClick={() => {editAnswerVisibility(tabIndex, null, outputIndex), discardAnswerChange()}} shape="round">
                                <IonIcon className='' slot="icon-only" icon={closeCircleOutline}></IonIcon>
                              </IonButton>
                            </>
                          :
                            <IonButton fill="clear" data-tooltip-id='tooltip' data-tooltip-content='Edit answer' className='text-xs' onClick={() => {editAnswerVisibility(tabIndex, null, outputIndex), setCurrentEditCopy(outputItem.answer)}} shape="round">
                              {isSaveChanges && outputItem.input_params.qid === isEditQid ?
                                <IonIcon className='animate-spin' slot="icon-only" icon={refreshOutline}></IonIcon>
                              :
                                <IonIcon className='' slot="icon-only" icon={createOutline}></IonIcon>
                              }
                            </IonButton>
                          }
                          <IonButton data-tooltip-id='tooltip' data-tooltip-content='Download as .doc' fill="clear" className='text-xs' onClick={() => exportToDoc('single', outputItem.answer)} shape="round">
                            <IonIcon className='' slot="icon-only" icon={documentTextOutline}></IonIcon>
                          </IonButton>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {(!tabItem.answer  || tabItem.answer === "") &&
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

                  {(isRefineBox && isRefineDetails.tabIndex === tabIndex) && 
                    <div className='mt-5 bottom-textarea rounded-xl'>
                      {isRefineType === 'refine' &&
                        <div className='showSelectedText'>
                          <div>
                            <IonIcon icon={returnDownForwardOutline}></IonIcon>
                          </div>
                          <div className='text'>
                            {isRefineText}
                          </div>
                        </div>
                      }
                      <IonTextarea
                        className='z-0  mb-2.5 text-black'
                        aria-label="Custom textarea"
                        placeholder="Write your question."
                        autoGrow={true}
                        counter={true}
                        maxlength={2000}
                        // value={inputValues[tabIndex] as string}
                        onIonInput={(event) => handleInputChange(tabIndex, event, '')}
                      >
                        <IonButton data-tooltip-id='tooltip' data-tooltip-content='Genarate' onClick={() => submitRefineQuestion(inputValues[tabIndex] as string, isRefineType, isRefineText)} size="small" fill="clear" slot="end" >
                          <IonIcon className='text-primary' slot="icon-only" icon={send}></IonIcon>
                        </IonButton>
                      </IonTextarea>
                    </div>
                  }
                  
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

      {/* toster start */}
      <IonToast
        className='custom-toast'
        isOpen={isShowError}
        message={isErrorMsg}
        duration={3000}
        onDidDismiss={() => setIsShowError(false)}
      ></IonToast>
       {/* Feedback Modal */}
       {selectedItem && (
          <FeedbackModal
            isOpen={isModalOpen}
            selectedItem={selectedItem}
            onClose={() => setIsModalOpen(false)}
            onSave={handleFeedbackSave}
          />
        )}
    </div>
  );
};

export default Tabs;

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

import {MDXEditor, MDXEditorMethods, headingsPlugin, listsPlugin, markdownShortcutPlugin, quotePlugin, thematicBreakPlugin} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import stringSimilarity from "string-similarity";
import { marked } from "marked";

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
  contentfulData: (data: string) => void;
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

const Tabs: React.FC<TabsProps> = ({ tabs, regenarateItem, saveEditedAnswer, genarateRefineCopy, contentfulData }) => {
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

  const [isShowError, setIsShowError] = useState(false);
  const [isErrorMsg, setIsErrorMsg] = useState('');

  const mdxEditorRef = React.useRef<MDXEditorMethods>(null)

  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [clickedText, setClickedText] = useState("");
  const [editorChangedText, setEditorChangedText] = useState('');
  const [currentEditCopy, setCurrentEditCopy] = useState("");
  const [currentEditingCopy, setCurrentEditingCopy] = useState("");

  const [highlightStartIndex, setHighlightStartIndex] = useState<number | null>(null);
  const [highlightEndIndex, setHighlightEndIndex] = useState<number | null>(null);

  const containerRefs = useRef<HTMLDivElement[]>([]);
  const [charMaps, setCharMaps] = useState<{ renderedIndex: number; markdownIndex: number }[][]>([]);
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
      console.log('regenarate:', data);
      data.session_id = generateDateTimeString();
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

  const [editVisibility, setEditVisibility] = useState({ tabIndex: null, itemIndex: null, outputIndex: null, isEdit: false });
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

  const handleEditingMode = (tabIndex:any, itemIndex:any, outputIndex:any, isEdit: boolean) => {
    // Check if the currently active input is the same as the one being clicked
    console.log('editVisibility', editVisibility);
    console.log('inputVisibility>>', inputVisibility);

    if (Array.isArray(inputVisibility[0])) {
      console.log('innnnnn');
      const clearedInputVisibility:any = inputVisibility.map(innerArray => {
        if (Array.isArray(innerArray)) {
          return innerArray.map(() => false); 
        }
        return []; 
      });
      setInputVisibility(clearedInputVisibility);
    }else {
      console.log('Onnnnnn');
      const clearedInputVisibility:any = inputVisibility.map(() => false);
      setInputVisibility(clearedInputVisibility);
    }
    setIsRefineBox(false);
    setIsRefineText('');
    setSelectedText(null);
    if (
      editVisibility.tabIndex === tabIndex &&
      editVisibility.itemIndex === itemIndex &&
      editVisibility.outputIndex === outputIndex
    ) {
      // If it is the same, hide the input by setting editVisibility to null
      setIsRefineBox(false);
      setIsRefineText('');
      setEditVisibility({ tabIndex: null, itemIndex: null, outputIndex: null, isEdit: false });
    } else {
      // Otherwise, set the new active input
      setEditVisibility({ tabIndex, itemIndex, outputIndex, isEdit });
    }

    console.log('editVisibility>>>>', editVisibility)
  };

  const handleEditAnswer = (tabIndex:any, itemIndex:any, outputIndex:any) => {
    // Check if the currently active input is the same as the one being clicked
    console.log('editVisibility>>>>>', editVisibility);
    setSelectedText(null);
    if (
      editVisibility.tabIndex === tabIndex &&
      editVisibility.itemIndex === itemIndex &&
      editVisibility.outputIndex === outputIndex &&
      editVisibility.isEdit === true
    ) {
      setEditVisibility({ tabIndex: tabIndex, itemIndex: itemIndex, outputIndex: outputIndex, isEdit: false });
    } else {
      // Otherwise, set the new active input
      setEditVisibility({ tabIndex: tabIndex, itemIndex: itemIndex, outputIndex: outputIndex, isEdit: true });
    }

    console.log('editVisibility>>>>', editVisibility);
    document.querySelectorAll('._contentEditable_uazmk_379').forEach(element => {
      element.setAttribute('spellcheck', 'false');
    });
  };
  /* Edit answer end */

  /* ----------Disabled key press on editing mode start---------- */
  const handleKeyPress = (event:any) => {
    // Prevent all key presses
    event.preventDefault();
  };
  /* Disabled key press on editing mode end */

  /* ----------Save edit answer copy start---------- */
  const saveAnswerChange = async (value:any, qid:any) => {
    console.log('editInputValues', editInputValues);
    console.log('value', value);
    console.log('qid', qid);
    setIsRefineBox(false);
    setIsEditQid(qid);
    setIsSaveChanges(true);
    let data:any = {
      qid: qid,
      text: value.replace(/<span class="new_content">|<\/span>/g, '').replace(/<span class="cursor">|<\/span>/g, '')
    }
    // setCurrentEditCopy('');
    saveEditedAnswer(data);
    setEditorChangedText('');
  }
  /* Save edit answer copy end */

  /* ----------Discard edit answer copy start---------- */
  const discardAnswerChange = async () => {
    console.log('currentEditCopy', currentEditCopy);
    console.log('isRefineDetails', isRefineDetails);
    if (currentEditCopy) {
      if (isRefineDetails.itemIndex !== '' && isRefineDetails.itemIndex !== null) {
        tabs[isRefineDetails.tabIndex].data[isRefineDetails.itemIndex].outputs[isRefineDetails.outputIndex].answer = currentEditCopy;
        saveAnswerChange(currentEditCopy, tabs[isRefineDetails.tabIndex].data[isRefineDetails.itemIndex].outputs[isRefineDetails.outputIndex].input_params.qid);
        console.log('tabs@@@@', tabs)
      }else {
        tabs[isRefineDetails.tabIndex].outputs[isRefineDetails.outputIndex].answer = currentEditCopy;
        saveAnswerChange(currentEditCopy, tabs[isRefineDetails.tabIndex].outputs[isRefineDetails.outputIndex].input_params.qid);
        console.log('tabs####', tabs)
      }
    }
    
    setCurrentEditCopy('');
    setCurrentEditingCopy('');
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
    console.log('editVisibility:', editVisibility);
    if (editInputValues[0].length === 0) {
      setEditVisibility({ tabIndex: null, itemIndex: null, outputIndex: null, isEdit: false });
      setIsRefineBox(false);
    }else if (editInputValues[0][0].length === 0) {
      setEditVisibility({ tabIndex: null, itemIndex: null, outputIndex: null, isEdit: false });
      setIsRefineBox(false);
    }
    console.log('tabs>><<', tabs);

    /* initialize the array for contentful start */
    const resultArray:any = [];

    // tabs.forEach((segment: Tab) => {
    //   segment.data.forEach((dataItem: innerTab) => {
    //     dataItem.outputs.forEach((output: innerOutput) => {
    //       const { rating, ...outputWithoutRating } = output;
    //       resultArray.push(outputWithoutRating);
    //     });
    //   });
    // });

    // console.log(resultArray);

    tabs.forEach((segment: any) => {
      // If 'data' exists, handle nested structure
      if (Array.isArray(segment.data)) {
        segment.data.forEach((dataItem: any) => {
          if (Array.isArray(dataItem.outputs)) {
            dataItem.outputs.forEach((output: any) => {
              const { rating, ...outputWithoutRating } = output;
              resultArray.push(outputWithoutRating);
            });
          }
        });
      }
    
      // Handle flat structure (if 'outputs' is directly under segment)
      if (Array.isArray(segment.outputs)) {
        segment.outputs.forEach((output: any) => {
          const { rating, ...outputWithoutRating } = output;
          resultArray.push(outputWithoutRating);
        });
      }
    });

    contentfulData(resultArray)
    console.log(resultArray);
    /* initialize the array for contentful end */

    setIsSaveChanges(false);
    setIsEditQid('');
    setEditorChangedText('');
    if (editInputValues[0].length !== 0 && editInputValues[0][0].length !== 0 && editVisibility.outputIndex !== null && (tabs[0].answer || tabs[0].data?.[0].answer)) {
      let currentEditAnswer;
      if (editVisibility.itemIndex !== '' && editVisibility.itemIndex !== null && editVisibility.tabIndex !== null && editVisibility.outputIndex !== null) {
        currentEditAnswer = tabs[editVisibility.tabIndex].data[editVisibility.itemIndex].outputs[editVisibility.outputIndex].answer.replace(/<span class="new_content">|<\/span>/g, '');
      }else {
        currentEditAnswer = tabs[editVisibility.tabIndex || 0].outputs[editVisibility.outputIndex || 0].answer.replace(/<span class="new_content">|<\/span>/g, '');
      }
      // console.log('currentEditAnswer', currentEditAnswer);
      setCurrentEditingCopy(currentEditAnswer);
    }

    console.log('inputVisibility>>', inputVisibility);
    
    console.log('inputValues>>', inputValues);
    
    setHighlightStartIndex(null);
    setHighlightEndIndex(null);
    setIsRefineBox(false);
    setSelectedText(null);
  }, [tabs]);

  // //////////
  const getExactIndexAndText = (
    selection: Selection,
    container: HTMLElement
  ) => {
    if (!selection || selection.rangeCount === 0) return { text: "", index: -1 };

    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(container);
    preCaretRange.setEnd(range.endContainer, range.endOffset);

    const selectedText = selection.toString();
    const calculatedIndex = preCaretRange.toString().length - selectedText.length;

    return {
      text: selectedText,
      index: calculatedIndex,
    };
  };

  // const handleMouseUp = (event: React.MouseEvent, tabIndex:number, itemIndex:any, outputIndex:number) => {
  //   const container = containerRefs.current[outputIndex];
  //   if (!container) return;

  //   const selection = window.getSelection();
  //   if (selection) {
  //     const { text, index: exactIndex } = getExactIndexAndText(selection, container);

  //     console.log('start Index', exactIndex);
  //     console.log('end Index', exactIndex + text.length);
  //     console.log('text', text);
  //     setIsRefineText(text)
  //     let fullString;
  //     if (itemIndex !== '' && itemIndex !== null) {
  //       fullString = tabs[tabIndex].data[itemIndex].outputs[outputIndex].answer.replace(/<span class="new_content">|<\/span>/g, '');
  //     }else {
  //       fullString =tabs[tabIndex].outputs[outputIndex].answer.replace(/<span class="new_content">|<\/span>/g, '');
  //     }

  //     const startIndex = fullString.indexOf(text, exactIndex);

  //     const endIndex = startIndex + text.length;
  //     console.log("Start index>>:", startIndex);
  //     console.log("End index>>:", endIndex);
  //     if (text) {
        
  //       const result:any = findMatch(fullString, text);
        

  //       if (result) {
  //         console.log("Start >>:", result.startIndex);
  //         console.log("End >>:", result.endIndex);
  //         console.log("match >>:", result.match);
  //         setSelectedText(result.match);
  //         setIsTextIndex(result.startIndex);
  //       }else {
  //         setSelectedText(text);
  //         setIsTextIndex(startIndex > 0 ? startIndex : exactIndex);
  //       }
  //     }
  //   }
  // };

  const handleMouseUp = (event: React.MouseEvent, tabIndex: number, itemIndex: any, outputIndex: number) => {
    const container = containerRefs.current[outputIndex];
    if (!container) return;

    console.log('tabs!!!!!!!!!>>>', tabs);
    console.log('tabIndex!!!!!!!!!>>>', tabIndex);
    console.log('itemIndex!!!!!!!!!>>>', itemIndex);
    console.log('outputIndex!!!!!!!!!>>>', outputIndex);
    let fullString;
    if (itemIndex !== '' && itemIndex !== null) {
      fullString = currentEditingCopy.replace(/<span class="new_content">|<\/span>/g, '').replace(/<span class="cursor">|<\/span>/g, '');
    }else {
      fullString = currentEditingCopy.replace(/<span class="new_content">|<\/span>/g, '').replace(/<span class="cursor">|<\/span>/g, '');
    }
    console.log('fullString>>>>>>>>>>>>>', fullString);

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const { text, index: exactIndex } = getExactIndexAndText(selection, container);
    const range = selection.getRangeAt(0);
    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(container);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);

    // Get start and end indexes in the rendered text
    const startIndexRendered = preSelectionRange.toString().length;
    console.log('startIndexRendered:', startIndexRendered);
    const endIndexRendered = startIndexRendered + range.toString().length;
    console.log('charMaps:', charMaps);

    console.log("charMaps[outputIndex]:", charMaps[outputIndex]);
    // Convert to markdown indexes using charMaps
    const markdownStartIndex = charMaps[0]?.find((map) => map.renderedIndex === startIndexRendered)?.markdownIndex ?? -1;
    const markdownEndIndex = charMaps[0]?.find((map) => map.renderedIndex === endIndexRendered)?.markdownIndex ?? -1;

    // Extract selected text from the original Markdown
    const selectedMarkdownText = fullString.slice(markdownStartIndex + 1, markdownEndIndex + 1);

    console.log('Start Index in Markdown:', markdownStartIndex);
    console.log('End Index in Markdown:', markdownEndIndex);
    console.log('Selected Markdown Text:', selectedMarkdownText);

    if (markdownStartIndex === markdownEndIndex) {
      setIsRefineBox(false);
      const extractedText = fullString.substring(markdownStartIndex + 2, markdownStartIndex + 31);
      setClickedText(extractedText);
      console.log('extractedText', extractedText);
      let clickedHtml;
      // Get the character at start index
      const charAfterStart = fullString[markdownStartIndex +1] || "";
      const charBeforeStart = fullString[markdownStartIndex] || "";
      console.log('charAfterStart:', charAfterStart);
      console.log('charBeforeStart:', charBeforeStart);

      console.log('before text:',`${fullString.slice(0, markdownStartIndex +1)}`);
      console.log('after text:',`${fullString.slice(markdownStartIndex + 2)}`);
      // If the character is `#` or `-`, insert a new line before it and place cursor after `#` or `-` with a space
      if (charAfterStart === "#" || charAfterStart === "-") {
        clickedHtml = `${fullString.slice(0, markdownStartIndex +1)}\n ${charAfterStart} <span class="cursor"></span>${fullString.slice(markdownStartIndex + 2)}`;
      }else if (charBeforeStart === "#" || charBeforeStart === "-") {
        if (charBeforeStart === fullString.slice(0, markdownStartIndex +1)) {
          clickedHtml = `${fullString.slice(0, markdownStartIndex +1)} <span class="cursor"></span>${fullString.slice(markdownStartIndex + 2)}`;
        }else {
          clickedHtml = `${fullString.slice(0, markdownStartIndex +1)} <span class="cursor"></span>${fullString.slice(markdownStartIndex + 2)}`;
        }
      }else {
        clickedHtml = `${fullString.slice(0, markdownStartIndex +1)}<span class="cursor"></span>${fullString.slice(markdownStartIndex +1)}`;
      }


      // console.log('clickedHtml', clickedHtml);

      if (itemIndex !== '' && itemIndex !== null) {
        tabs[tabIndex].data[itemIndex].outputs[outputIndex].answer = clickedHtml;
      }else {
        tabs[tabIndex].outputs[outputIndex].answer = clickedHtml;
      }
    }

    setIsRefineText(text);
    setSelectedText(selectedMarkdownText);
    setIsTextIndex(markdownStartIndex + 1);
    setHighlightStartIndex(markdownStartIndex + 1);
    setHighlightEndIndex(markdownEndIndex + 1);
  };

  const handleMouseClick = (event: React.MouseEvent, tabIndex:number, itemIndex:any, outputIndex:number) => {
    console.log('editInputValues 2:', editInputValues);
    const container = containerRefs.current[outputIndex];
    if (!container) return;
    
    const selection = window.getSelection();
    if (selection && selection.toString()) return; // Ignore clicks when there's a selection

    const range = document.caretRangeFromPoint(event.clientX, event.clientY);
    if (!range) return;

    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(container);
    preCaretRange.setEnd(range.startContainer, range.startOffset);

    const caretIndex = preCaretRange.toString().length;

    console.log('caretIndex>>>>>>>', caretIndex);
    console.log('charMaps>>>>>>>', charMaps);
    const markdownIndex = charMaps[outputIndex]?.find((map) => map.renderedIndex === caretIndex)?.markdownIndex ?? -1;
    const extractedText = currentEditingCopy.substring(markdownIndex + 1, markdownIndex + 30);
    console.log("Mapped index in markdown:>>>>>>>>", markdownIndex);
    console.log("Mapped extractedText:>>>>>>>>", extractedText);
    setClickedText(extractedText);
    setIsTextIndex(markdownIndex + 1);

    const textContent = container.textContent || "";
    const wordStart = textContent.lastIndexOf(" ", caretIndex - 1) + 1;
    const wordEnd = textContent.indexOf(" ", caretIndex);

    const clickedWord = textContent.slice(
      wordStart,
      wordEnd === -1 ? textContent.length : wordEnd
    );

    let fullString;
    if (itemIndex !== '' && itemIndex !== null) {
      fullString = tabs[tabIndex].data[itemIndex].outputs[outputIndex].answer.replace(/<span class="new_content">|<\/span>/g, '').replace(/<span class="cursor">|<\/span>/g, '');
    }else {
      fullString =tabs[tabIndex].outputs[outputIndex].answer.replace(/<span class="new_content">|<\/span>/g, '').replace(/<span class="cursor">|<\/span>/g, '');
    }
    const startIndex = fullString.indexOf(clickedWord, wordStart);


    const result:any = findMatch(fullString, clickedWord);

    // console.log('result>>>', result);

    // console.log('handleMouseClick startIndex', startIndex);
    // console.log('word index', Math.round(clickedWord.length/2));
    console.log('clickedWord', clickedWord);
    console.log('wordStart', wordStart);
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const parentElement = range.startContainer.parentElement;
  
      if (parentElement) {
        const textContent = parentElement.textContent || "";
        const cursorIndex = range.startOffset;
  
        // Handle multiline text with \n
        const lines = textContent.split("\n");
  
        let totalChars = 0;
        let lineIndex = 0;
  
        // Identify the current line based on the cursor index
        for (let i = 0; i < lines.length; i++) {
          if (totalChars + lines[i].length >= cursorIndex) {
            lineIndex = i;
            break;
          }
          totalChars += lines[i].length + 1; // +1 for \n
        }
  
        const relativeCursorIndex = cursorIndex - totalChars;
  
        // Get the current line's text
        const currentLine = lines[lineIndex];
  
        // Extract specific characters around the click
        const beforeText = currentLine.slice(
          Math.max(0, relativeCursorIndex - 20),
          relativeCursorIndex
        );
        const afterText = currentLine.slice(
          relativeCursorIndex,
          relativeCursorIndex + 20
        );

        console.log('long index', fullString.length);
        console.log('short index', (container.textContent || "".replace(/\n/g, ' ')).length);
        
        if (afterText.length < 20) {
          const textContent2 = container.textContent || "";
          const noNewlineContent = textContent2.replace(/\n/g, ' ');

          const firstIndex = noNewlineContent.indexOf(beforeText); // Find index of 'textB' in 'textA'
          if (firstIndex === -1) return ''; // Return empty string if 'textB' is not found
          const startPos = firstIndex + beforeText.length; // Get the index after 'textB'
          const secondAfterText = noNewlineContent.slice(startPos, startPos + 20);
          console.log('secondAfterText', secondAfterText);
          // setClickedText(secondAfterText);
        }else {
          console.log('afterText', afterText);
          if (result) {
            // setClickedText(afterText);
          }else {
            // setClickedText('');
          }
          
        }
      }
    }

    // if ((startIndex + Math.round(clickedWord.length/2)) > wordStart) {
    //   setIsTextIndex(startIndex + Math.round(clickedWord.length/2));
    // }else {
    //   setIsTextIndex(wordStart);
    // }

    console.log('index>>', startIndex + Math.round(clickedWord.length/2))
    
    setSelectedText("");
  };


  useEffect(() => {
    const processAnswer = async () => {
      const answer = currentEditingCopy.replace(/<span class="new_content">|<\/span>/g, '').replace(/<span class="cursor">|<\/span>/g, ''); // Replace this with the actual answer variable
      console.log('currentEditingCopy>>>>', answer);
  
      const tempMap: { renderedIndex: number; markdownIndex: number }[] = [];
      let mdIndex = 0; // Index in the original markdown
      let renderedIndex = 0; // Index in the rendered HTML
  
      // Convert markdown to HTML using marked (handling the promise)
      const renderedHtml = await marked(answer); // Ensure this is awaited if it's a Promise
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = renderedHtml; // Now renderedHtml is a string
  
      const renderedText = tempDiv.textContent || "";
  
      for (const char of renderedText) {
        // Map each rendered character to its original markdown index
        tempMap.push({ renderedIndex, markdownIndex: mdIndex });
  
        // Move both indexes forward
        mdIndex = answer.indexOf(char, mdIndex); // Find the next occurrence in markdown
        renderedIndex++;
      }
  
      setCharMaps([tempMap]); // Update state with the mapped results
    };
  
    processAnswer();
  }, [currentEditingCopy]);
  
  const highlightHTMLText = (html: string, start: number | null, end: number | null) => {
    if (start === null || end === null) return html;
  
    let fullString = html.replace(/<span class="new_content">|<\/span>/g, '');

    // If start and end are equal, insert a blinking cursor at that position
    if (start === end) {
      // Get the character at start index
      const charAfterStart = html[start] || "";

      // If the character is `#` or `-`, insert a new line before it and place cursor after `#` or `-` with a space
      if (charAfterStart === "#" || charAfterStart === "-") {
        return `${html.slice(0, start)}\n${charAfterStart} <span class="cursor"></span>${html.slice(start + 1)}`;
      }

      return `${html.slice(0, start)}<span class="cursor"></span>${html.slice(start)}`;
    }
  
    const preText = fullString.slice(0, start);
    const highlightedText = fullString.slice(start, end);
    const postText = fullString.slice(end);
    console.log('highlightHTMLText:', highlightedText);
    // const highlightedWithSpans = highlightedText
    //   .split("\n")
    //   .map((line) => {
    //     if (line.startsWith("#")) {
    //       return `# <span class="highlighted">${line.slice(1)}</span>`;
    //     }
    //     console.log('line:', line);
    //     return `<span class="highlighted">${line}</span>`;
    //   })
    //   .join("\n");

    const highlightedWithSpans = highlightedText
    .split("\n\n") // Split paragraphs first
    .map((paragraph) =>
      paragraph
        .split("\n") // Split single newlines within paragraphs
        .map((line) => {
          // Handle headers: keep `#` outside
          if (line.startsWith("#")) {
            const firstSpace = line.indexOf(" ");
            if (firstSpace !== -1) {
              return `# <span class="highlighted">${line.slice(firstSpace + 1)}</span>`;
            }
            return line; // If no space after `#`, return as is
          }

          if (line.startsWith("-")) {
            const firstSpace = line.indexOf(" ");
            if (firstSpace !== -1) {
              return `- <span class="highlighted">${line.slice(firstSpace + 1)}</span>`;
            }
            return line; // If no space after `#`, return as is
          }

          let insideBold = false; // Track bold state

          const formattedLine = line
            .split(/(\*\*)/) // Split but keep `**`
            .map((part) => {
              if (part === "**") {
                insideBold = !insideBold;
                return "**"; // Keep `**` outside of `<span>`
              }
              return `<span class="highlighted">${part.trim()}</span>`;
            })
            .join(""); // Maintain structure

          return formattedLine;
        })
        .join("\n") // Preserve single newlines
    )
    .join("\n\n"); // Preserve paragraph breaks
  
    console.log('highlightedWithSpans:', highlightedWithSpans);
    return `${preText}${highlightedWithSpans}${postText}`;
  };

  const findMatch = (
    original: string,
    search: string,
    threshold: number = 80
  ): { match: string; startIndex: number; endIndex: number } | null => {
    const originalWords = original.split(' ');
    const searchWords = search.split(' ');
  
    let bestMatch = null;
    let bestSimilarity = 0;
  
    for (let i = 0; i <= originalWords.length - searchWords.length; i++) {
      // Form a substring using a sliding window
      const substring = originalWords.slice(i, i + searchWords.length).join(' ');
  
      // Calculate similarity
      const similarity = stringSimilarity.compareTwoStrings(substring, search) * 100;
  
      // Update best match if similarity is above threshold
      if (similarity > threshold && similarity > bestSimilarity) {
        bestMatch = {
          match: substring,
          startIndex: original.indexOf(substring),
          endIndex: original.indexOf(substring) + substring.length - 1,
        };
        bestSimilarity = similarity;
      }
    }
  
    return bestMatch;
  };
  // /////////
  

  const handleChangeEditor = (updatedMarkdown: string) => {
    console.log('handleChangeEditor', updatedMarkdown);
    document.querySelectorAll('._contentEditable_uazmk_379').forEach(element => {
      element.setAttribute('spellcheck', 'false');
    });
    setEditorChangedText(updatedMarkdown);
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
    // setIsRefineText(_text);
    setIsRefineType(_identifier);
    console.log('selectedText', selectedText);
    console.log('clickedText', clickedText);
    if (_identifier === 'refine') {
      setIsRefineBox(prevState => !prevState);
    }else if (_identifier === 'regenarate'){
      setIsRefineBox(false);
      setIsRefineText('');
      submitRefineQuestion('','regenerate', _text)
    }else {
      // submitRefineQuestion('','insert')
      // setIsRefineBox(true);
      setIsRefineBox(prevState => !prevState);
    }
    console.log('_identifier', _identifier);
  }
  /* refine Selected Text end */

  /* --------refine Selected copy start-------- */
  const submitRefineQuestion = (data:any, identifier:any, selecteText:any) => {
    console.log('submitRefineQuestion', data);
    console.log('isRefineDetails', isRefineDetails);
    console.log('isRefineText',isRefineText);
    console.log('text>>>>>',selecteText);
    console.log('selectedText>>>>>',selectedText);
    console.log('isRefineType>>>>', isRefineType);
    let refineData:any;
    if (identifier === 'insert') {
      refineData = {
        qid: isRefineDetails.outputItem.input_params.qid,
        action: identifier,
        text: clickedText,
        text_index: isTextIndex,
        question: data
      }
    }else {
      console.log('regenarate', selecteText);
      refineData = {
        qid: isRefineDetails.outputItem.input_params.qid,
        action: identifier,
        text: selectedText,
        text_index: isTextIndex,
        question: data
      }
    }
    console.log('refineData', refineData);
    genarateRefineCopy(refineData);
    // setIsRefineBox(false);
    // setSelectedText('');

    console.log('isRefineDetails', isRefineDetails);
    // handleEditingMode(isRefineDetails.tabIndex, isRefineDetails.itemIndex, isRefineDetails.outputIndex);

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
      rate: rating,
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
        // setIsShowError(true);
        // setIsErrorMsg('Feedback submitted!');
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
      rate: updatedItem.rating,
      format_rate: updatedItem.format_rate,
      integrity_rate: updatedItem.integrity_rate,
      communication_rate: updatedItem.communication_rate,
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
                          <div onClick={() => selectCopyQid(tabIndex, itemIndex, outputIndex, outputItem)} className='shadow-md rounded-md mb-1.5 relative' key={outputIndex}>
                            {/* Show the output copy */}
                            {editVisibility.tabIndex === tabIndex && editVisibility.itemIndex === itemIndex && editVisibility.outputIndex === outputIndex ?
                              <></>
                              :
                              <ReactMarkdown className='py-2 px-6' remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} children={outputItem.answer}/>
                              
                            }

                            {/* Edit answer for each output */}
                            {editVisibility.tabIndex === tabIndex && editVisibility.itemIndex === itemIndex && editVisibility.outputIndex === outputIndex &&
                              <>
                                {editInputValues[tabIndex][itemIndex][outputIndex] &&
                                  <>
                                    <div className='relative'>
                                      {editVisibility.tabIndex === tabIndex && editVisibility.itemIndex === itemIndex && editVisibility.outputIndex === outputIndex && editVisibility.isEdit === false ?
                                        <div
                                          className='editing-area py-2 px-6'
                                          // contentEditable
                                          spellCheck="false"
                                          onKeyDown={handleKeyPress}
                                          key={outputIndex}
                                          ref={(el) => (containerRefs.current[outputIndex] = el!)}
                                          onMouseUp={(e) => handleMouseUp(e, tabIndex, itemIndex, outputIndex)}
                                          onClick={(e) => handleMouseClick(e, tabIndex, itemIndex, outputIndex)}
                                          dangerouslySetInnerHTML={{
                                            __html: marked(outputItem.answer) as string
                                          }}
                                        >
                                          {/* <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} children={outputItem.answer}/> */}
                                        </div>
                                      :
                                        <MDXEditor 
                                          className='py-2 px-6'
                                          ref={mdxEditorRef}
                                          markdown={outputItem.answer.replace(/<span class="new_content">|<\/span>/g, '').replace(/<span class="cursor">|<\/span>/g, '')}
                                          // markdown={editInputValues[tabIndex][itemIndex][outputIndex]}
                                          key={editInputValues[tabIndex][itemIndex][outputIndex]}
                                          onChange={handleChangeEditor}
                                          plugins={[headingsPlugin(), listsPlugin(), quotePlugin(), thematicBreakPlugin()]}
                                        />
                                      }
                                      <div className='editingIcons'>
                                        {editVisibility.tabIndex === tabIndex && editVisibility.itemIndex === itemIndex && editVisibility.outputIndex === outputIndex && editVisibility.isEdit === false ?
                                          <IonButton data-tooltip-id='tooltip' data-tooltip-content='Edit answer' className='text-xs' onClick={() => {handleEditAnswer(tabIndex, itemIndex, outputIndex)}} shape="round">
                                            <IonIcon slot="icon-only" icon={createOutline}></IonIcon>
                                          </IonButton>
                                        :
                                          <IonButton fill='outline' data-tooltip-id='tooltip' data-tooltip-content='Close editing' className='text-xs' onClick={() => {handleEditAnswer(tabIndex, itemIndex, outputIndex), saveAnswerChange(editorChangedText || editInputValues[tabIndex][itemIndex][outputIndex], outputItem.input_params.qid)}} shape="round">
                                            <IonIcon slot="icon-only" icon={createOutline}></IonIcon>
                                          </IonButton>
                                        }

                                        {isRefineType === 'refine' && isRefineBox ?
                                          <IonButton fill='outline' disabled={selectedText === '' || selectedText === null} onClick={() => refineSelectedText('refine', selectedText)} data-tooltip-id='tooltip' data-tooltip-content='Close Refine' className='text-xs' shape="round">
                                            <IonIcon slot="icon-only" icon={chatbubblesOutline}></IonIcon>
                                          </IonButton>
                                        :
                                          <IonButton disabled={selectedText === '' || selectedText === null} onClick={() => refineSelectedText('refine', selectedText)} data-tooltip-id='tooltip' data-tooltip-content='Refine selection' className='text-xs' shape="round">
                                            <IonIcon slot="icon-only" icon={chatbubblesOutline}></IonIcon>
                                          </IonButton>
                                        }
                                        
                                        <IonButton disabled={selectedText === '' || selectedText === null} onClick={() => refineSelectedText('regenarate', selectedText)} data-tooltip-id='tooltip' data-tooltip-content='Regenerate selection' className='text-xs' shape="round">
                                          <IonIcon slot="icon-only" icon={refreshOutline}></IonIcon>
                                        </IonButton>

                                        {isRefineType === 'insert' && isRefineBox ?
                                          <IonButton fill='outline' disabled={selectedText !== '' || selectedText === null} onClick={() => refineSelectedText('insert', clickedText)} data-tooltip-id='tooltip' data-tooltip-content='Close Insert' className='text-xs' shape="round">
                                            <IonIcon slot="icon-only" icon={addOutline}></IonIcon>
                                          </IonButton>
                                        :
                                          <IonButton disabled={selectedText !== '' || selectedText === null} onClick={() => refineSelectedText('insert', clickedText)} data-tooltip-id='tooltip' data-tooltip-content='Generate More' className='text-xs' shape="round">
                                            <IonIcon slot="icon-only" icon={addOutline}></IonIcon>
                                          </IonButton>
                                        }
                                        
                                      </div>
                                    </div>
                                  </>
                                }
                              </>
                            }

                            {/* Action buttons for each output */}
                            <div className='flex p-2 items-center justify-between'>
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
                                    <IonButton fill="clear" data-tooltip-id='tooltip' data-tooltip-content='Save answer' className='text-xs' onClick={() => {console.log('editorChangedText>>', editorChangedText); console.log('saveAnswerValue>>', editInputValues[tabIndex][itemIndex][outputIndex]), saveAnswerChange(editorChangedText || editInputValues[tabIndex][itemIndex][outputIndex], outputItem.input_params.qid); handleEditingMode(tabIndex, itemIndex, outputIndex, false)}} shape="round">
                                      <IonIcon className='' slot="icon-only" icon={saveOutline}></IonIcon>
                                    </IonButton>

                                    <IonButton fill="clear" data-tooltip-id='tooltip' data-tooltip-content='Discard' className='text-xs' onClick={() => {handleEditingMode(tabIndex, itemIndex, outputIndex, false), discardAnswerChange()}} shape="round">
                                      <IonIcon className='' slot="icon-only" icon={closeCircleOutline}></IonIcon>
                                    </IonButton>
                                  </>
                                :
                                  <IonButton fill="clear" data-tooltip-id='tooltip' data-tooltip-content='Edit answer' className='text-xs' onClick={() => {handleEditingMode(tabIndex, itemIndex, outputIndex, false), setCurrentEditCopy(outputItem.answer), setCurrentEditingCopy(outputItem.answer)}} shape="round">
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
                            maxlength={6000}
                            // value={(inputValues[tabIndex] as string[])[itemIndex]}
                            onIonInput={(event) => handleInputChange(tabIndex, event, itemIndex)}
                          >
                            <IonButton data-tooltip-id='tooltip' data-tooltip-content='Generate' onClick={() => handleSubmitChatAnswer(tabIndex, itemIndex)} size="small" fill="clear" slot="end" >
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
                              maxlength={6000}
                              // value={(inputValues[tabIndex] as string[])[itemIndex]}
                              onIonInput={(event) =>  handleInputChange(tabIndex, event, itemIndex)}
                            >
                              <IonButton  data-tooltip-id='tooltip' data-tooltip-content='Generate' onClick={() => submitRefineQuestion((inputValues[tabIndex] as string[])[itemIndex], isRefineType, isRefineText)} size="small" fill="clear" slot="end" >
                                <IonIcon className='text-primary' slot="icon-only" icon={send}></IonIcon>
                              </IonButton>
                            </IonTextarea>
                          </div>
                        }

                        {editVisibility.tabIndex === tabIndex && editVisibility.itemIndex === itemIndex ?
                          <></>
                          :
                          <div className='text-right'>
                            <div>
                              <IonButton data-tooltip-id='tooltip' data-tooltip-content='Refine copy' onClick={() => toggleInputVisibility(tabIndex, itemIndex)} className='text-xs' shape="round">
                                {inputVisibility[tabIndex] && Array.isArray(inputVisibility[tabIndex]) && inputVisibility[tabIndex][itemIndex] ? 
                                  <IonIcon className='' slot="icon-only" icon={closeOutline}></IonIcon>
                                  :
                                  <IonIcon className='' slot="icon-only" icon={chatbubblesOutline}></IonIcon>
                                }
                              </IonButton>
                              <IonButton data-tooltip-id='tooltip' data-tooltip-content='Regenerate copy' className='text-xs' onClick={() => handleButtonClick('regenarate', tabIndex, itemIndex, tabItem.input_params)} shape="round">
                                <IonIcon className='' slot="icon-only" icon={refreshOutline}></IonIcon>
                              </IonButton>
                              {/* <IonButton data-tooltip-id='tooltip' data-tooltip-content='Copy all' className='text-xs' onClick={() => copyToClipboard('multiple', tabItem.outputs)} shape="round">
                                <IonIcon className='' slot="icon-only" icon={copyOutline}></IonIcon>
                              </IonButton>
                              <IonButton data-tooltip-id='tooltip' data-tooltip-content='Download all' className='text-xs' onClick={() => exportToDoc('multiple', tabItem.outputs)} shape="round">
                                <IonIcon className='' slot="icon-only" icon={documentTextOutline}></IonIcon>
                              </IonButton> */}
                            </div>
                          </div>
                        }
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
                      <div key={boxIndex} onClick={() => selectCopyQid(tabIndex, null, outputIndex, outputItem)} className='shadow-md rounded-md mb-1.5 relative'>
                        {/* Show the output copy */}
                        {editVisibility.tabIndex === tabIndex && editVisibility.itemIndex === null && editVisibility.outputIndex === outputIndex ?
                          <></>
                          :
                          <ReactMarkdown className='py-2 px-6' remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} children={outputItem.answer}/>
                        }
                        
                        {/* Edit answer for each output */}
                        {editVisibility.tabIndex === tabIndex && editVisibility.itemIndex === null && editVisibility.outputIndex === outputIndex &&
                          <>
                            {editInputValues[tabIndex][outputIndex] && 
                              <>
                                <div className='relative'>
                                  {editVisibility.tabIndex === tabIndex && editVisibility.itemIndex === null && editVisibility.outputIndex === outputIndex && editVisibility.isEdit === false ?
                                    <div
                                      className='editing-area py-2 px-6'
                                      // contentEditable
                                      spellCheck="false"
                                      onKeyDown={handleKeyPress}
                                      key={outputIndex}
                                      ref={(el) => (containerRefs.current[outputIndex] = el!)}
                                      onMouseUp={(e) => handleMouseUp(e, tabIndex, null, outputIndex)}
                                      onClick={(e) => handleMouseClick(e, tabIndex, null, outputIndex)}
                                      dangerouslySetInnerHTML={{
                                        __html: marked(outputItem.answer) as string
                                      }}
                                    >
                                      {/* <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} children={outputItem.answer}/> */}
                                    </div>
                                  :
                                    <MDXEditor 
                                      className='py-2 px-6'
                                      ref={mdxEditorRef}
                                      markdown={outputItem.answer.replace(/<span class="new_content">|<\/span>/g, '').replace(/<span class="cursor">|<\/span>/g, '')} 
                                      // markdown={editInputValues[tabIndex][outputIndex] as string} 
                                      key={editInputValues[tabIndex][outputIndex] as string} 
                                      onChange={handleChangeEditor}
                                      plugins={[headingsPlugin(), listsPlugin(), quotePlugin(), thematicBreakPlugin(), markdownShortcutPlugin()]}
                                    />
                                  }
                                  <div className='editingIcons'>
                                    {editVisibility.tabIndex === tabIndex && editVisibility.itemIndex === null && editVisibility.outputIndex === outputIndex && editVisibility.isEdit === false ?
                                      <IonButton data-tooltip-id='tooltip' data-tooltip-content='Edit answer' className='text-xs' onClick={() => {handleEditAnswer(tabIndex, null, outputIndex)}} shape="round">
                                        <IonIcon slot="icon-only" icon={createOutline}></IonIcon>
                                      </IonButton>
                                    :
                                      <IonButton fill='outline' data-tooltip-id='tooltip' data-tooltip-content='Close editing' className='text-xs' onClick={() => {handleEditAnswer(tabIndex, null, outputIndex), saveAnswerChange(editorChangedText || editInputValues[tabIndex][outputIndex] as string, outputItem.input_params.qid)}} shape="round">
                                        <IonIcon slot="icon-only" icon={createOutline}></IonIcon>
                                      </IonButton>
                                    }
                                    {isRefineType === 'refine' && isRefineBox ?
                                      <IonButton fill='outline' disabled={selectedText === '' || selectedText === null} onClick={() => refineSelectedText('refine', selectedText)} data-tooltip-id='tooltip' data-tooltip-content='Close Refine' className='text-xs' shape="round">
                                        <IonIcon slot="icon-only" icon={chatbubblesOutline}></IonIcon>
                                      </IonButton>
                                    :
                                    <IonButton disabled={selectedText === '' || selectedText === null} onClick={() => refineSelectedText('refine', selectedText)} data-tooltip-id='tooltip' data-tooltip-content='Refine selection' className='text-xs' shape="round">
                                      <IonIcon slot="icon-only" icon={chatbubblesOutline}></IonIcon>
                                    </IonButton>
                                    }
                                    
                                    <IonButton disabled={selectedText === '' || selectedText === null} onClick={() => refineSelectedText('regenarate', selectedText)} data-tooltip-id='tooltip' data-tooltip-content='Regenerate selection' className='text-xs' shape="round">
                                      <IonIcon slot="icon-only" icon={refreshOutline}></IonIcon>
                                    </IonButton>

                                    {isRefineType === 'insert' && isRefineBox ?
                                      <IonButton fill='outline' disabled={selectedText !== '' || selectedText === null} onClick={() => refineSelectedText('insert', clickedText)} data-tooltip-id='tooltip' data-tooltip-content='Close Insert' className='text-xs' shape="round">
                                        <IonIcon slot="icon-only" icon={addOutline}></IonIcon>
                                      </IonButton>
                                    :
                                      <IonButton disabled={selectedText !== '' || selectedText === null} onClick={() => refineSelectedText('insert', clickedText)} data-tooltip-id='tooltip' data-tooltip-content='Generate More' className='text-xs' shape="round">
                                        <IonIcon slot="icon-only" icon={addOutline}></IonIcon>
                                      </IonButton>
                                    }
                                    
                                  </div>
                                </div>
                              </>
                            }
                          </>
                        }
                        
                        {/* Action buttons for each output */}
                        <div className='p-2 flex items-center justify-between'>
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
                                <IonButton fill="clear" data-tooltip-id='tooltip' data-tooltip-content='Save answer' className='text-xs' onClick={() => {saveAnswerChange(editorChangedText || editInputValues[tabIndex][outputIndex] as string, outputItem.input_params.qid); handleEditingMode(tabIndex, null, outputIndex, false)}} shape="round">
                                  <IonIcon className='' slot="icon-only" icon={saveOutline}></IonIcon>
                                </IonButton>

                                <IonButton fill="clear" data-tooltip-id='tooltip' data-tooltip-content='Discard' className='text-xs' onClick={() => {handleEditingMode(tabIndex, null, outputIndex, false), discardAnswerChange()}} shape="round">
                                  <IonIcon className='' slot="icon-only" icon={closeCircleOutline}></IonIcon>
                                </IonButton>
                              </>
                            :
                              <IonButton fill="clear" data-tooltip-id='tooltip' data-tooltip-content='Edit answer' className='text-xs' onClick={() => {handleEditingMode(tabIndex, null, outputIndex, false), setCurrentEditCopy(outputItem.answer), setCurrentEditingCopy(outputItem.answer)}} shape="round">
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
                     );
                  })}
                  
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
                      maxlength={6000}
                      value={inputValues[tabIndex] as string}
                      onIonInput={(event) => handleInputChange(tabIndex, event, '')}
                    >
                      <IonButton  data-tooltip-id='tooltip' data-tooltip-content='Generate' onClick={() => handleSubmitChatAnswer(tabIndex, '')} size="small" fill="clear" slot="end" >
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
                        maxlength={6000}
                        // value={inputValues[tabIndex] as string}
                        onIonInput={(event) => handleInputChange(tabIndex, event, '')}
                      >
                        <IonButton data-tooltip-id='tooltip' data-tooltip-content='Generate' onClick={() => submitRefineQuestion(inputValues[tabIndex] as string, isRefineType, isRefineText)} size="small" fill="clear" slot="end" >
                          <IonIcon className='text-primary' slot="icon-only" icon={send}></IonIcon>
                        </IonButton>
                      </IonTextarea>
                    </div>
                  }

                  {editVisibility.tabIndex !== tabIndex && editVisibility.itemIndex === null &&
                    <div className='text-right'>
                        <IonButton data-tooltip-id='tooltip' data-tooltip-content='Refine copy' onClick={() => toggleInputVisibility(tabIndex, null)} className='text-xs' shape="round">
                          {typeof inputVisibility[tabIndex] === 'boolean' && inputVisibility[tabIndex] ? 
                            <IonIcon slot="icon-only" icon={closeOutline}></IonIcon>
                            :
                            <IonIcon slot="icon-only" icon={chatbubblesOutline}></IonIcon>
                          }
                        </IonButton>
                        <IonButton data-tooltip-id='tooltip' data-tooltip-content='Regenerate copy' className='text-xs' onClick={() => handleButtonClick('regenarate', tabIndex, '', tabItem.input_params)} shape="round">
                          <IonIcon slot="icon-only" icon={refreshOutline}></IonIcon>
                        </IonButton>
                        {/* <IonButton data-tooltip-id='tooltip' data-tooltip-content='Copy all' className='text-xs' onClick={() => copyToClipboard('multiple', tabItem.outputs)} shape="round">
                          <IonIcon slot="icon-only" icon={copyOutline}></IonIcon>
                        </IonButton>
                        
                        <IonButton data-tooltip-id='tooltip' data-tooltip-content='Download all' className='text-xs' onClick={() => exportToDoc('multiple', tabItem.outputs)} shape="round">
                          <IonIcon slot="icon-only" icon={documentTextOutline}></IonIcon>
                        </IonButton> */}
                    </div>
                  }
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

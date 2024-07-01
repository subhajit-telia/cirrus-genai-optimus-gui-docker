import { useState, useEffect } from "react";
import React from 'react';
import send from "../../public/images/genai_send-1.svg"
//import person from "../../public/images/person.png"

interface Message {
  content: string;
  role: 'user' | 'AI' | 'assistant' | 'system';
  assistantResponse?: string;
}

export const Conversation = (props: {
  selectedTopic: string, addressBarValue: string, selectedModel: string
}) => {
    
  const [message, setMessages] = useState<Message[]>([
    /*{
      id: new Date().toISOString(),
      content: "Message from AI",
      role: "assistant",
    },
    {
      id: new Date().toISOString() + "1",
      content: "Message from User",
      role: "User",
    }*/
  ]);
  const [waitingForResponse, setWaitingForResponse] = useState<boolean>(false);
  const [userInput, setUserInput] = useState<string>("");
  const [ingestingDocuments, setIngestingDocuments] = useState<boolean>(false);
  const [useStreaming, setUseStreaming] = useState(true);
  
  useEffect(() => { 
    if (props.selectedTopic !== "") { 
      setMessages([]);
      let newMessage = "";
      let systemMessage = "";
      switch (props.selectedTopic) {
        case "ETL Sample":
          newMessage = "Hello, ask me anything about the ETL code and related data model. I will be happy to help you.";
          break;

        case "Excel Test":
          newMessage = 'Do you need help?? <br/><div class="aBox"><a href="http://google.com" target= "_blank">google</a></div> ';
          break;
    
        case "VF Product":
          newMessage = "Ciao! Come posso aiutarti?";
          break;
        case "MWC Catalogue":
          newMessage = 'Hello, how may I help you?';
          systemMessage = 'We are working on the accountId = 0018I00000lX96SQAS. The product catalogue to be used is \"MWC Catalogue\"';
          break;

/*
        case "Mobile_Swisscom":
          newMessage = 'Do you need help?? <br/><div class="aBox"><a href="http://google.com" target= "_blank">google</a></div> ';
          break;
*/          
        default:
          newMessage = "Hi! I'm your personal assistant. Is there anything I can help you with?  I am often asked about portal functionalities, provide information about your account & subscriptions. I can also do some actions for you, if you'd wish!"
          break;
      }
      setMessages([{ content: systemMessage, role: 'system'},{ content: newMessage, role: 'assistant'}]);
    } 
  }, [props.selectedTopic]);

  const sendUserMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = userInput;
    let presentationMessages: Message[] = [
      {
        //id: new Date().toISOString(),
        content: query,
        role: "user",
      },
      ...message
    ];
    setMessages(presentationMessages);
    const messages = [...presentationMessages].reverse();
    setUserInput("");
    console.log(presentationMessages);

    if (presentationMessages.length > 0) {
      setWaitingForResponse(true);
      const rawResponse = await fetch("/api/queryGPT", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          directoryName: props.selectedTopic,
          messages,
        }),
      });
      setWaitingForResponse(false);
      const response = await rawResponse.json();
      // Assuming the structure of response is as per the provided JSON
      const assistantMessageContent = response.assistantResponse[0].message.content;
      presentationMessages = [
        {
          //id: new Date().toISOString(),
          content: assistantMessageContent, // Use the extracted content here
          role: "assistant",
        },
        ...presentationMessages
      ];
      setMessages(presentationMessages);

    } else {
      console.log(presentationMessages.length);
    }
  };

  const sendUserMessageStreaming = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = userInput;
    let presentationMessages: Message[] = [
      {
        //id: new Date().toISOString(),
        content: query,
        role: "user",
      },
      ...message
    ];
    setMessages(presentationMessages);
    const messages = [...presentationMessages].reverse();
    setUserInput("");
    console.log(presentationMessages);
  
    if (presentationMessages.length > 0) {
      setWaitingForResponse(true);
      const response = await fetch("/api/queryGPT", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          directoryName: props.selectedTopic,
          messages,
          model: props.selectedModel
        }),
      });
      if (response.body !== null) {
        const reader = response.body.getReader();
        let result = '';
        let done = false;
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (result !== '') {
            presentationMessages = presentationMessages.slice(1);
          }
          result += new TextDecoder().decode(value);
          
          presentationMessages = [
            {
              //id: new Date().toISOString(),
              content: result,
              role: "assistant",
            },
            ...presentationMessages
          ];
          
          setMessages([]);
          setMessages(presentationMessages);
        }
      }
      setWaitingForResponse(false);
    } else {

      console.log(presentationMessages.length);
    }
  };
  
  const ingestDocuments = async () => {
    setIngestingDocuments(true);
    await fetch("/api/ingest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        directoryName: props.selectedTopic,
      }),
    });
    setIngestingDocuments(false);
  };
  
  function unskipNewlines(text: string): string {
    console.log(text)
    return text.replace(/\\n/g, '\n');
  }
  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    // Here you can perform any necessary logic before submitting the form
    console.log("Form submitted:", userInput);
  };
  const handleKeyDown = (e: { key?: any; preventDefault: any; }) => {
    if (e.key === 13) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  const [hideHeader, setHideHeader] = useState(true);

  const handleHideHeader = () => {
    setHideHeader(!hideHeader);
  };
  
  return (
    <div>
      <div>
        <div style={{ marginRight: 'auto' , marginLeft: '1em', color: "red" }}>
          <b>Virtual Assistant</b> 
        </div>
        <button onClick={() => handleHideHeader()} style={{ opacity: 0 }}>
          Header
        </button>
        {!hideHeader && (
          <div>
            <label className="switch"><b>Stream responses </b>
              <input type="checkbox" checked={useStreaming} onChange={() => setUseStreaming(!useStreaming)} />
              <span className="slider"></span>
            </label>
            <button onClick={() => ingestDocuments()} disabled={ingestingDocuments}>
              {ingestingDocuments ? "Ingesting..." : "Ingest Documents"}
            </button>
          </div>
        )}
        <div style={{ marginRight: '1em', marginLeft: 'auto' }}>
          <span role="img" aria-label="Close" onClick={() => setMessages([])} style={{ fontSize: '1.2em', color: 'red' }}>
            <b>X</b>
          </span>
        </div>
      </div>
      <div>
        {!message.length && (
          <div>
            Send a message to begin!
          </div>
        )}
        {waitingForResponse && (
          <div >
          </div>
        )}
        {message.filter(message => message.role !== "system").map((message) => {
          return (
            <div>
              <div>
                <div>
                  {(message.role === "AI" || message.role === "assistant") && (<img src={""} />)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <form
        onSubmit={(!useStreaming ? sendUserMessageStreaming : sendUserMessage)}
        style={{ display: "flex", alignItems: "center" }}
      >
        <input
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={handleKeyDown}
          value={userInput}
          autoComplete="off"
        />
       <button >
          <span role="img" aria-label="send">
              <img src="" alt="Send Icon" width="35"/>
          </span>
      </button>
      </form>
    </div>
  );
};
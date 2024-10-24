import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { IonAlert } from '@ionic/react';
import { AccessToken, HTTPMethod, NetworkInfo } from '../../routes/network';

const FeedbackAlert = forwardRef((_, ref) => {
  const [showAlert, setShowAlert] = useState(false);
  const [questionId, setQuestionId] = useState('');
  const [feedbackType, setFeedbackType] = useState('');
  const apiUrl = window.RUNTIME_ENV?.REACT_APP_API_URL || NetworkInfo.URL;

  useImperativeHandle(ref, () => ({
    open: (qId: string, type: string) => {
      console.log('qId', qId);
      console.log('type', type);
      setQuestionId(qId);
      setFeedbackType(type);
      setShowAlert(true);
    },
  }));

  const handleFeedbackSubmit = async (data: { comment: string }) => {
    console.log('User comment:', data.comment);

    let payLoad = {
        "qid": questionId,
        "rate": feedbackType,
        "comment": data.comment
     }
    let formUrl = apiUrl + '/feedback';
    
    try {
      const response = await fetch(formUrl, {
        method: HTTPMethod.PUT,
        headers: {
          '"removed"': AccessToken."removed",
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payLoad),
      });
      const responseData = await response.json();
      console.log("Success:", responseData);

      if (response.ok && responseData === true) {
        setShowAlert(false);
      }
      
    } catch (error: any) {
      console.error("Login failed:", error);
    }
    
  };

  return (
    <IonAlert
      isOpen={showAlert}
      onDidDismiss={() => setShowAlert(false)}
      header="Provide additional feedback"
      className = 'feedback-alert'
      inputs={[
        {
          name: 'comment',
          type: 'textarea',
          placeholder: 'Enter your feedback here...'
        },
      ]}
      buttons={[
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Submit',
          handler: handleFeedbackSubmit,
        },
      ]}
    />
  );
});

export default FeedbackAlert;

import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { IonAlert, IonToast } from '@ionic/react';
import { HTTPMethod, NetworkInfo } from '../../routes/network';

const FeedbackAlert = forwardRef((_, ref) => {
  const [showAlert, setShowAlert] = useState(false);
  const [copyVersionId, setCopyVersionId] = useState('');
  const [isShowError, setIsShowError] = useState(false);
  const [isErrorMsg, setIsErrorMsg] = useState('');
  const apiUrl = `${NetworkInfo.URL}`;

  useImperativeHandle(ref, () => ({
    open: (copyVerId: string) => {
      console.log('copyVersionId', copyVerId);
      setCopyVersionId(copyVerId);
      setShowAlert(true);
    },
  }));

  const handleFeedbackSubmit = async () => {

    let formUrl = apiUrl + '/self_learning/submit_answer?copy_version_id='+ copyVersionId;
    
    try {
      const response = await fetch(formUrl, {
        method: HTTPMethod.POST,
        headers: {
          'access_token': `${NetworkInfo.ACCESSTOKEN}`,
          'Content-Type': 'application/json'
        },
      });
      const responseData = await response.json();
      console.log("Success:", responseData);

      if (response.ok && responseData === true) {
        setIsShowError(true);
        setIsErrorMsg('Feedback submitted.');
        setShowAlert(false);
      } else {
        setIsShowError(true);
        setIsErrorMsg(responseData.detail || 'Something went wrong!');
      }

    } catch (error: any) {
      console.error("Login failed:", error);
    }

  };

  return (
    <>
      <IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        header="Submit Copy As Example?"
        message="If you edited or refined this copy, make sure it is still specific for it's original purpose and segment and can be used for different campaigns (general use)."
        className = 'feedback-alert'
        buttons={[
          {
            text: 'No',
            role: 'cancel',
          },
          {
            text: 'Yes',
            handler: handleFeedbackSubmit,
          },
        ]}
      />

      <IonToast
        className='custom-toast'
        isOpen={isShowError}
        message={isErrorMsg}
        duration={3000}
        onDidDismiss={() => setIsShowError(false)}
      ></IonToast>
    </>
  );
});

export default FeedbackAlert;

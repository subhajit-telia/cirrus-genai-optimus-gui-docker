import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonChip, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonInput, IonLoading, IonPage, IonRow, IonSelect, IonSelectOption, IonSpinner, IonTextarea, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../../components/ExploreContainer';
import './Home.css';
import AppHeader from '../../components/header/Header';
import { lockClosed, send, sync } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import Tabs from '../../components/tab/Tab';
import templateData from '../../template.json';
import { useForm } from "react-hook-form";
import AWS from 'aws-sdk';
import { HTTPMethod, NetworkInfo } from '../../routes/network';

***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
// });

// const s3 = new AWS.S3();


interface Tab {
  id: number;
  label: string;
  content: JSX.Element; // Assuming content is JSX.Element (React node)
}

interface UserAddModel {
  format: string;
  purpose: string;
  products: string;
  question: string;
}

interface Segment {
  name: string;
  isActive: boolean;
}

const Home: React.FC = () => {
  /* Variables start */
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  // const [error, setError] = useState<string | null>(null);
  

  const tabs: Tab[] = [
    {
      id: 1,
      label: 'Maximisers copy',
      content: <div>Content of Tab 1</div>,
    },
    {
      id: 2,
      label: 'Segment 2 copy',
      content: <div>Content of Tab 2</div>,
    },
    {
      id: 3,
      label: 'Segment 3 copy',
      content: <div>Content of Tab 3</div>,
    },
  ];

  useEffect(() => {

    setSegments(templateData.segmentData);
    // const params = {
    //   Bucket: 'YOUR_BUCKET_NAME',
    //   Key: 'YOUR_JSON_FILE_KEY.json',
    // };
 
    
    // s3.getObject(params, (err, data:any) => {
    //   if (err) {
    //     setError('Error fetching data from S3');
    //     console.error(err);
    //   } else {
    //     try {
    //       const jsonData = JSON.parse(data.Body.toString('utf-8'));
    //       setSegments(jsonData.segments); 
    //     } catch (parseError) {
    //       setError('Error parsing JSON data');
    //       console.error(parseError);
    //     }
    //   }
    // });
  }, [setSegments]);

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

  /* Function to show loading indicator */
  const showLoadingIndicator = (_isLoading:boolean) => {
    setLoading(_isLoading);
    
  };

  /* -----------Handle form submit start----------- */
  const handleFormSubmit = (event:any) => {
    // event.preventDefault();
    // formData.forEach(data => handleApiCall(data));

    for (const key in event) {
      if (event.hasOwnProperty(key)) {
        let eachItem = {
          [key] : event[key]
        };
        handleApiCall(eachItem)
          console.log('eachItem', eachItem);
      }
    }
  };
  const handleApiCall = async (data: any) => {
    console.log('data',data);
    setLoading(true);
    let formUrl = NetworkInfo.URL + '/api/queryGPT';
    data.segment = segments
    .filter(segment => segment.isActive)
    .map(segment => segment.name);

    let payload = {
      bucket: '',
      use_case: 'content_creation_b2c',
      chat: data
    }
    console.log('payload', payload);
    try {
      const response = await fetch(formUrl, {
        method: HTTPMethod.POST,
        headers: {
          Authorization: `Bearer`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
      });
      const responseData = await response.json();
      console.log("Success:", responseData);
      
    } catch (error: any) {
      console.error("Login failed:", error);
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



  return (
    <IonPage>
      <AppHeader/>
      <IonContent className='page-body'>
        <div className='max-w-[80%] m-auto relative'>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="w-full">
            <div className='text-center'>
              <img className='m-auto' src='src/theme/assets/optimus-logo.png' />
              <p>AI-assistance</p>
            </div>
            <IonGrid>
              <IonRow>
                <IonCol size="4">
                  <IonCard className='rounded-xl text-[#000]'>
                    <IonCardHeader>
                      <IonCardSubtitle className='font-bold'>I want to create a...</IonCardSubtitle>
                    </IonCardHeader>

                    <IonCardContent>
                      <IonSelect className='min-h-10 field-item' label="Select desired format below" multiple={true} interface="popover" labelPlacement="floating" fill="outline"
                      {...register("format", {
                        validate: {},
                      })}>
                        {templateData.formatData.map((item, index) => (
                          <IonSelectOption key={index} value={item.name}>{item.name}</IonSelectOption>
                        ))}
                      </IonSelect>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
                <IonCol size="4">
                  <IonCard className='rounded-xl text-[#000]'>
                    <IonCardHeader>
                      <IonCardSubtitle className='font-bold'>With the purpose...</IonCardSubtitle>
                    </IonCardHeader>

                    <IonCardContent>
                      <IonSelect className='min-h-10 field-item' label="Which product/offer do you want to report on?" interface="popover" labelPlacement="floating" fill="outline"
                      {...register("purpose", {
                        validate: {},
                      })}>
                        {templateData.purposeData.map((item, index) => (
                          <IonSelectOption key={index} value={item.name}>{item.name}</IonSelectOption>
                        ))}
                      </IonSelect>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
                <IonCol size="4">
                  <IonCard className='rounded-xl text-[#000]'>
                    <IonCardHeader>
                      <IonCardSubtitle className='font-bold'>About...</IonCardSubtitle>
                    </IonCardHeader>

                    <IonCardContent>
                      <IonInput className='!min-h-10 field-item' label="Which product/offer do you want to report on?" labelPlacement="floating" fill="outline" placeholder="Enter text"
                      {...register("products", {
                        validate: {},
                      })}></IonInput>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              </IonRow>
            </IonGrid>
            <p className='text-center'>I want to create versions to the following segments</p>
            <div className='segments flex items-center justify-center mt-2.5'>
              {segments.map((item, index) => (
                <IonChip key={index} onClick={() => onClickSegment(index)} className={`${item.isActive} mx-2.5 min-h-6 py-0 bg-[#f5e0ff] text-[#4a2a59]`}>{item.name}</IonChip>
              ))}
            </div>
            <div className='text-center mt-6'>
              <IonButton type='submit' className='btn-primary' shape="round">
              {loading && <IonSpinner className='mr-2' name="bubbles"></IonSpinner>}
                Start the magic
              </IonButton>
            </div>
            
            <IonGrid>
              <IonRow>
                <IonCol>
                  <div className="mx-2.5 mt-16">
                    <Tabs tabs={tabs} />
                  </div>
                </IonCol>
              </IonRow>
            </IonGrid>

            
            <div className='h-28'></div>
            <IonGrid className='fixed bottom-0 left-0 right-0 max-w-[80%] m-auto'>
              <IonRow>
                <IonCol>
                  <IonTextarea
                    className='bottom-textarea rounded-xl mx-2.5'
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
          </form>
        </div>
        <IonLoading
          className="custom-loading"
          spinner="circles" 
          trigger="open-loading"
          isOpen={loading}
          message={'Please wait...'}
        />
      </IonContent>
    </IonPage>
  );
};

export default Home;

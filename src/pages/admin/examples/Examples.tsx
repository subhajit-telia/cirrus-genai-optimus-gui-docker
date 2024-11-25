import { IonAccordion, IonAccordionGroup, IonAlert, IonButton, IonButtons, IonCard, IonCheckbox, IonCol, IonContent, IonFab, IonFabButton, IonGrid, IonHeader, IonIcon, IonInput, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonModal, IonPage, IonProgressBar, IonRow, IonSelect, IonSelectOption, IonSpinner, IonSplitPane, IonText, IonTextarea, IonTitle, IonToast, IonToolbar } from '@ionic/react';
import { useEffect, useRef, useState } from 'react';
import AppHeader from '../../../components/header/Header';
import Sidenav from '../../../components/sidenav/Sidenav';
import { add, checkmarkDoneOutline, closeOutline, createOutline, swapVerticalOutline, trashOutline } from 'ionicons/icons';
import { HTTPMethod, NetworkInfo } from '../../../routes/network';
import { useForm } from 'react-hook-form';
import SelectDropdown from '../../../components/dropdown/Dropdown';

interface ExampleAddModel {
  example: string;
  example_id: string;
  segment_id: string;
  purpose_id: string;
  format_id: string;
  user_prompt: string;
  products: string;
  status: string;
  test_results: string;
  created_at: string;
  updated_at: string;
  b2b: number | boolean;
  b2c: number | boolean;
}

interface FilterModel {
  segment_id: string | null;
  purpose_id: string | null;
  format_id: string | null;
  status: string | null;
  b2b: number | null;
  b2c: number | null;
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
interface Formats {
  format_name: string;
  format_id: string;
  format_written_description: string;
}

const Examples: React.FC = () => {
  /* Variables start */
  const [exampleList, setExampleList] = useState<ExampleAddModel[]>([]);
  const [filterExampleList, setFilterExampleList] = useState<ExampleAddModel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const modal = useRef<HTMLIonModalElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [targetIndex, setTargetIndex] = useState<any>();
  const [segments, setSegments] = useState<Segment[]>([]);
  const [purposes, setPurposes] = useState<Purposes[]>([]);
  const [formats, setFormats] = useState<Formats[]>([]);
  const [isShowError, setIsShowError] = useState(false);
  const [isErrorMsg, setIsErrorMsg] = useState('');
  const apiUrl = `${NetworkInfo.URL}`;
  const [selectedFormats, setSelectedFormats] = useState<typeof formats[0][]>([]);
  const [loadingFormats, setLoadingFormats] = useState<boolean>(false);
  const [selectedSegments, setSelectedSegments] = useState<typeof segments[0][]>([]);
  const [loadingSegments, setLoadingSegments] = useState<boolean>(false);
  const [selectedPurpose, setSelectedPurpose] = useState<typeof purposes[0][]>([]);
  const [loadingPurposes, setLoadingPurposes] = useState<boolean>(false);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const isAllSelected = selectedIds.length === exampleList.length;
  const [isAlertHeader, setIsAlertHeader] = useState('');
  const [isAlertSubHeader, setIsAlertSubHeader] = useState('');
  const [isAscending, setIsAscending] = useState(true);

  const statusNames = [
    { id: 'testing', name: 'Testing' },
    { id: 'active', name: 'Active' },
    { id: 'validated', name: 'Validated' },
    { id: 'rejected', name: 'Rejected' },
  ]

  useEffect(() => {

    getExamplesData();
    getSegmentsData();
    getPurposesData();
    getFormatsData();
  }, []);

  /* ----------Single and multi select start---------- */
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]); // Unselect all
    } else {
      setSelectedIds(exampleList.map((item) => item.example_id)); // Select all
    }
  };

  const handleSelectionChange = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };
  /* Single and multi select end */

  /* ---------change data by select checkbox start--------- */
  const handleChangeData = (_identifier:string) => {
    console.log('_identifier', _identifier);
    if (_identifier === 'approve') {
      setIsAlertHeader('Approve example!');
      setIsAlertSubHeader('Are you want to approve this examples?');

      let updatedExamples = exampleList.map((item) =>
        selectedIds.includes(item.example_id)
          ? { ...item, status: "active" }
          : item
      );

      console.log('updatedExamples', updatedExamples);
      handleAleart(true, updatedExamples);
    }else if (_identifier === 'reject') {
      setIsAlertHeader('Reject example!');
      setIsAlertSubHeader('Are you want to reject this examples?');

      let updatedExamples = exampleList.map((item) =>
        selectedIds.includes(item.example_id)
          ? { ...item, status: "rejected" }
          : item
      );

      console.log('updatedExamples', updatedExamples);
      handleAleart(true, updatedExamples);
    }else if (_identifier === 'delete') {
      setIsAlertHeader('Delete example!');
      setIsAlertSubHeader('Are you want to delete this examples?');

      let updatedExamples = exampleList.filter(
        (item) => !selectedIds.includes(item.example_id)
      );
  
      console.log("Updated Examples:", updatedExamples);
      handleAleart(true, updatedExamples);
    }
  }
  /* change data by select checkbox end */

  /* -------------------Sorting start------------------- */
  const toggleSort = () => {
    const sorted = [...exampleList].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return isAscending ? dateA - dateB : dateB - dateA;
    });
    console.log('sorted', sorted);
    setExampleList(sorted);
    setIsAscending(!isAscending); // Toggle the sorting direction
  };
  /* Sorting end */

  /* -------------get Examples data start------------- */
  const getExamplesData = async () => {
    setLoading(true);
    try {
      const urlData = apiUrl + '/resource/get?table=examples';
      setValue("purpose_id", '');
      setValue("segment_id", '');
      setValue("format_id", '');
      setSelectedFormats([])
      setSelectedSegments([])
      setSelectedPurpose([])
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
        setExampleList(responseData);
        setFilterExampleList(responseData);
        setLoading(false);
      }

    } catch (error: any) {
      console.error("catch failed:", error);
      setLoading(false);
    }
  };
  /* get examples data end */

  /* -------------get segments data start------------- */
  const getSegmentsData = async () => {
    try {
      const urlData = apiUrl + '/resource/get?table=segments&use_case=content_creation_b2c&columns=segment_id&columns=segment_name';

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
      }

    } catch (error: any) {
      console.error("catch failed:", error);
    }
  };
  /* get segments data end */

  /* -------------get purposes data start------------- */
  const getPurposesData = async () => {
    try {
      const urlData = apiUrl + '/resource/get?table=purposes&use_case=content_creation_b2c&columns=purpose_id&columns=purpose_name';

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
      }
    } catch (error: any) {
      console.error("catch failed:", error);
    }
  };
  /* get purposes data end */

  /* -------------get formats data start------------- */
  const getFormatsData = async () => {
    try {
      const urlData = apiUrl + '/resource/get?table=formats&use_case=content_creation_b2c&columns=format_id&columns=format_name';

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
      }
    } catch (error: any) {
      console.error("catch failed:", error);
    }
  };
  /* get formats data end */

  /* modal functions start */

  const onModalDismiss = () => {
    setIsOpenModal(false);
    setIsEdit(false);
    setValue("example", '');
    setValue("example_id", '');
    setValue("segment_id", '');
    setValue("purpose_id", '');
    setValue("format_id", '');
    setValue("user_prompt", '');
    setValue("b2b", false);
    setValue("b2c", false);
  }

  const handleAleart = (_indicator: boolean, _value: any) => {
    if (_indicator === true) {
      setIsOpen(true);
      setTargetIndex(_value);
    } else if (_indicator === false) {

      console.log('targetIndex', targetIndex);
      setIsOpen(false);
      handleExamplesUpdate(targetIndex);
    }

  }

  /* modal functions end */

  /* handle edit start */
  const handleEdit = (_value: any, _index: number) => {
    console.log('_value', _value);
    setValue("example", _value.example);
    setValue("example_id", _value.example_id);
    setValue("segment_id", _value.segment_id);
    setValue("purpose_id", _value.purpose_id);
    setValue("format_id", _value.format_id);
    setValue("user_prompt", _value.user_prompt);

    if (_value.b2b === 1) {
      setValue("b2b", true);
    } else {
      setValue("b2b", false);
    }
    if (_value.b2c === 1) {
      setValue("b2c", true);
    } else {
      setValue("b2c", false);
    }

    setIsOpenModal(true);
    setIsEdit(true);
    setTargetIndex(_index);
  }
  /* handle edit end */

  /* check password hashed or not start */
  const isBcryptHash = (password: any) => {
    return typeof password === 'string' && password.length === 60 && (password.startsWith('$2a$') || password.startsWith('$2b$') || password.startsWith('$2y$'));
  };
  /* check password hashed or not end */

  /* -----------Filter form submit start----------- */
  const filterFormSubmit = async (data: any) => {
    data.format_id = selectedFormats.length > 0 ? selectedFormats[0].format_id : null;
    data.purpose_id = selectedPurpose.length > 0 ? selectedPurpose[0].purpose_id : null;
    data.segment_id = selectedSegments.length > 0 ? selectedSegments[0].segment_id : null;
    console.log('data', data);
    console.log('selectedFormats', selectedFormats);
    console.log('selectedSegments', selectedSegments);
    console.log('selectedPurpose', selectedPurpose);

    const filteredData = exampleList.filter((item) => {
      return (
        (data.b2b === null || item.b2b === data.b2b) &&
        (data.b2c === null || item.b2c === data.b2c) &&
        (data.status === null || item.status === data.status) &&
        (data.format_id === null || item.format_id === data.format_id) &&
        (data.segment_id === null || item.segment_id === data.segment_id) &&
        (data.purpose_id === null || item.purpose_id === data.purpose_id)
      );
    });

    console.log("Filtered Data:", filteredData);
    setExampleList(filteredData);
  }
  /* Filter form submit end */

  /* -----------Handle form submit start----------- */
  const handleFormSubmit = async (data: any) => {
    console.log('handleFormSubmit', data);
    let payLoad: any = {};
    payLoad.example = data.example;
    payLoad.format_id = data.format_id;
    payLoad.products = data.products;
    payLoad.purpose_id = data.purpose_id;
    payLoad.segment_id = data.segment_id;
    payLoad.user_prompt = data.user_prompt;
    payLoad.example_id = data.example_id;

    if (data.b2b === true) {
      payLoad.b2b = 1;
    } else {
      payLoad.b2b = 0;
    }

    if (data.b2c === true) {
      payLoad.b2c = 1;
    } else {
      payLoad.b2c = 0;
    }



    let prevExampleList = exampleList;
    let index: any = targetIndex;

    console.log('finalData', payLoad);
    if (isEdit === true) {
      prevExampleList.splice(index, 1, payLoad);
    } else {
      payLoad.example_id = `ex${exampleList.length}`;
      prevExampleList = [...exampleList, payLoad];
    }


    console.log('prevList', prevExampleList);

    handleExamplesUpdate(prevExampleList);
  }
  const handleExamplesUpdate = async (allExample: ExampleAddModel[]) => {
    setLoading(true);
    let formUrl = apiUrl + '/resource/put';
    console.log('payload', allExample);

    let updatedExamples = allExample;

    let finalPayload = {
      table: "examples",
      json_obj: updatedExamples
    }

    try {
      const response = await fetch(formUrl, {
        method: HTTPMethod.PUT,
        headers: {
          '"removed"': `${NetworkInfo.ACCESSTOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(finalPayload),
      });
      const responseData = await response.json();
      console.log("Success:", responseData);

      if (response.ok) {

        if (responseData.ErrorMessage) {
          console.error("Error response:", responseData);
          setIsShowError(true);
          setIsErrorMsg(responseData.ErrorMessage);
          setLoading(false);

        } else {
          setIsShowError(true);
          setIsErrorMsg(responseData);
          reset();
          setLoading(false);
          setIsEdit(false);
          setTargetIndex(-1);
          getExamplesData();
          onModalDismiss();
        }
      }

    } catch (error: any) {
      console.error("Login failed:", error);
      setLoading(false);
    }
  };
  /* Handle form submit end */

  /* ------Handle form input field changes start------ */
  const {
    register: register,
    handleSubmit: handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ExampleAddModel>({
    defaultValues: {
      b2b: false,
      b2c: false,
    },
  });
  const {
    register: filter,
    handleSubmit: handleFilterSubmit,
    reset,
  } = useForm<FilterModel>({
    defaultValues: {
      b2b: null,
      b2c: null,
      status: null,
      format_id: null,
      segment_id: null,
      purpose_id: null,
    },
  });
  const isB2b = watch('b2b');
  const isB2c = watch('b2c');
  /* Handle form input field changes end */

  return (
    <>
      <IonSplitPane contentId="main">
        <Sidenav />
        <IonPage id="main">

          <AppHeader />

          <IonContent className='page-body'>
            {loading &&
              <IonProgressBar type="indeterminate"></IonProgressBar>
            }
            <div className='rounded bg-white shadow-md m-3'>
              <form onSubmit={handleFilterSubmit(filterFormSubmit)} className="w-full">
                <IonGrid>
                  <IonRow className='items-center'>
                    <IonCol size='4'>
                      <div>
                        <SelectDropdown
                          options={formats}
                          selectedOptions={selectedFormats}
                          setSelectedOptions={setSelectedFormats}
                          multiSelect={false} // Multi-select mode
                          idKey="format_id"
                          nameKey="format_name"
                          tooltipKey="format_written_description"
                          placeHolder='Select formats'
                          label='Select format below'
                        />
                        { loadingFormats &&
                          <IonProgressBar className='mt-0.5' type="indeterminate"></IonProgressBar>
                        }
                      </div>
                    </IonCol>
                    <IonCol size='4'>
                      <div>
                        <SelectDropdown
                          options={segments}
                          selectedOptions={selectedSegments}
                          setSelectedOptions={setSelectedSegments}
                          multiSelect={false} // Multi-select mode
                          idKey="segment_id"
                          nameKey="segment_name"
                          tooltipKey="segment_name"
                          placeHolder='Select Segments'
                          label='Select segments below'
                        />
                        { loadingSegments &&
                          <IonProgressBar className='mt-0.5' type="indeterminate"></IonProgressBar>
                        }
                      </div>
                    </IonCol>
                    <IonCol size='4'>
                      <div>
                        <SelectDropdown
                          options={purposes}
                          selectedOptions={selectedPurpose}
                          setSelectedOptions={setSelectedPurpose}
                          multiSelect={false} // Multi-select mode
                          idKey="purpose_id"
                          nameKey="purpose_name"
                          tooltipKey="purpose_written_description"
                          placeHolder='Select purpose'
                          label='Select purpose below'
                        />
                        { loadingPurposes &&
                          <IonProgressBar className='mt-0.5' type="indeterminate"></IonProgressBar>
                        }
                      </div>
                    </IonCol>
                    <IonCol size='3'>
                      <IonSelect placeholder="Select Status" className='min-h-10 field-item text-sm' label="Select status below" interface="popover" labelPlacement="stacked" fill="outline"
                        {...filter("status", {
                          validate: {},
                        })}>
                        {statusNames.map((item, index) => (
                          <IonSelectOption key={index} value={item.id}>{item.name}</IonSelectOption>
                        ))}
                      </IonSelect>
                    </IonCol>
                    {/* <IonCol size='4'>
                      <div className='flex justify-between text-sm'>
                        <IonCheckbox
                          {...register("b2b", {
                            validate: {},
                          })}
                          checked={isB2b as boolean}
                          onIonChange={(event: any) => {
                            console.log('event', event.detail.checked);
                            setValue("b2b", event.detail.checked);
                          }}
                          labelPlacement="start">B2B</IonCheckbox>

                        <IonCheckbox
                          {...register("b2c", {
                            validate: {},
                          })}
                          checked={isB2c as boolean}
                          onIonChange={(event: any) => {
                            console.log('event', event.detail.checked);
                            setValue("b2c", event.detail.checked);
                          }}
                          labelPlacement="start">B2C</IonCheckbox>
                      </div>
                    </IonCol> */}
                    <IonCol size='3'>
                      <IonSelect
                        placeholder="Select B2B" className='min-h-10 field-item text-sm' label="Select B2B below" interface="popover" labelPlacement="stacked" fill="outline"
                        {...filter("b2b", {
                          validate: {},
                        })}>
                        <IonSelectOption value={1}>Yes</IonSelectOption>
                        <IonSelectOption value={0}>No</IonSelectOption>
                      </IonSelect>
                    </IonCol>
                    <IonCol size='3'>
                      <IonSelect
                        placeholder="Select B2C" className='min-h-10 field-item text-sm' label="Select B2C below" interface="popover" labelPlacement="stacked" fill="outline"
                        {...filter("b2c", {
                          validate: {},
                        })}>
                        <IonSelectOption value={1}>Yes</IonSelectOption>
                        <IonSelectOption value={0}>No</IonSelectOption>
                      </IonSelect>
                    </IonCol>
                    <IonCol size='3' className='text-right'>
                      <IonButton type='submit' size='small' className='btn-primary text-xs' shape="round">
                        Filter
                      </IonButton>
                      <IonButton onClick={() => { reset(); getExamplesData() }} className='text-xs' size='small' type='reset' fill='outline' shape="round">
                        Cancel
                      </IonButton>
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </form>
            </div>

            <div className='rounded bg-white shadow-md mx-3 p-3 flex items-center justify-between'>
              <div>
                <IonCheckbox 
                  checked={isAllSelected}
                  onIonChange={handleSelectAll} 
                  labelPlacement="end">
                    Select All
                </IonCheckbox>
              </div>
              <div>
                <IonButton onClick={() => toggleSort()} size='small' shape="round">
                  <IonIcon  className={isAscending ? "rotate" : "rotate-reverse"} slot="icon-only" icon={swapVerticalOutline}></IonIcon>
                </IonButton>
                <IonButton disabled={selectedIds.length === 0} onClick={() => handleChangeData('approve')} size='small' color="success" className='btn-primary text-xs' shape="round">
                  <IonIcon slot="start" icon={checkmarkDoneOutline}></IonIcon>
                  Approve
                </IonButton>
                <IonButton disabled={selectedIds.length === 0} onClick={() => handleChangeData('reject')} size='small' color="warning" className='btn-primary text-xs' shape="round">
                  <IonIcon slot="start" icon={closeOutline}></IonIcon>
                  Reject
                </IonButton>
                <IonButton disabled={selectedIds.length === 0} onClick={() => handleChangeData('delete')} size='small' color="danger" className='btn-primary text-xs' shape="round">
                  <IonIcon slot="start" icon={trashOutline}></IonIcon>
                  Delete
                </IonButton>
              </div>
            </div>
            <IonList className='bg-transparent'>
              {exampleList.map((item, index) => (
                <IonCard key={index}>
                  <IonItem>
                    <IonLabel>
                      <p><b>Example Id:</b> {item.example_id}</p>
                      <p><b>Segment Id:</b> {item.segment_id}</p>
                      <p><b>Purpose Id:</b> {item.purpose_id}</p>
                      <p><b>Format Id:</b> {item.format_id}</p>
                      <p>
                        <b>B2B:</b> {item.b2b === 1 ? 'Yes' : item.b2b === 0 ? 'No' : 'invalid value'} | <b>B2C:</b> {item.b2c === 1 ? 'Yes' : item.b2c === 0 ? 'No' : 'invalid value'}
                      </p>
                      <p className='capitalize'><b>Status:</b> {item.status}</p>
                      <p><b>Products:</b> {item.products}</p>
                      <p><b>Test Result:</b> {item.test_results}</p>
                      <p><b>User Prompt:</b> {item.user_prompt}</p>
                      <p><b>Example:</b> {item.example}</p>
                    </IonLabel>
                    <IonButton id="open-modal" onClick={() => handleEdit(item, index)} slot="end" size="small" color="warning">
                      <IonIcon icon={createOutline}></IonIcon>
                    </IonButton>
                    {/* <IonButton onClick={() => handleDeleteAleart(true, index)} color="danger" slot="end" size="small">
                      <IonIcon icon={trashOutline}></IonIcon>
                    </IonButton> */}
                    <IonCheckbox
                      slot="start"
                      checked={selectedIds.includes(item.example_id)}
                      onIonChange={() => handleSelectionChange(item.example_id)}>
                    </IonCheckbox>
                  </IonItem>
                </IonCard>
              ))}
            </IonList>

            {exampleList.length === 0 &&
              <IonText className='text-center block'>No data found!</IonText>
            }

            {/* modal start */}
            <IonModal id="example-modal" isOpen={isOpenModal} onWillDismiss={() => onModalDismiss()}>
              <IonHeader>
                <IonToolbar>
                  <IonTitle className='text-sm font-bold'>Examples Add & Edit</IonTitle>
                  <IonButtons slot="end">
                    <IonButton size="small" shape="round" onClick={() => onModalDismiss()}>
                      <IonIcon slot="icon-only" icon={closeOutline}></IonIcon>
                    </IonButton>
                  </IonButtons>
                </IonToolbar>
              </IonHeader>
              <div className="ion-padding inner-content">
                <form onSubmit={handleSubmit(handleFormSubmit)} className="w-full">
                  <IonSelect placeholder="Select formats" disabled={formats.length === 0} className='min-h-10 field-item mb-4 text-sm' label="Select desired format below" interface="popover" labelPlacement="stacked" fill="outline"
                    {...register("format_id", {
                      validate: {},
                    })}>
                    {formats.map((item, index) => (
                      <IonSelectOption key={index} value={item.format_id}>{item.format_name}</IonSelectOption>
                    ))}
                  </IonSelect>

                  <IonSelect placeholder="Select purpose" disabled={purposes.length === 0} className='min-h-10 field-item mb-4 text-sm' label="Which product/offer do you want to report on?" interface="popover" labelPlacement="stacked" fill="outline"
                    {...register("purpose_id", {
                      validate: {},
                    })}>
                    {purposes.map((item, index) => (
                      <IonSelectOption key={index} value={item.purpose_id}>{item.purpose_name}</IonSelectOption>
                    ))}
                  </IonSelect>

                  <IonSelect placeholder="Select Segment" disabled={segments.length === 0} className='min-h-10 field-item mb-4 text-sm' label="Which product/offer do you want to report on?" interface="popover" labelPlacement="stacked" fill="outline"
                    {...register("segment_id", {
                      validate: {},
                    })}>
                    {segments.map((item, index) => (
                      <IonSelectOption key={index} value={item.segment_id}>{item.segment_name}</IonSelectOption>
                    ))}
                  </IonSelect>


                  <IonInput className='mb-4 text-sm' label="Product Name" labelPlacement="floating" fill="outline" placeholder="Enter Product Name"
                    {...register("products", {
                      validate: {},
                    })}
                  ></IonInput>

                  <IonTextarea
                    className='mb-4 text-sm'
                    label="User Prompt"
                    labelPlacement="floating"
                    fill="outline"
                    placeholder="Enter User Prompt"
                    autoGrow={true}
                    {...register("user_prompt", {
                      validate: {},
                    })}
                  ></IonTextarea>

                  <IonTextarea
                    className='mb-4 text-sm'
                    label="Example"
                    labelPlacement="floating"
                    fill="outline"
                    placeholder="Enter Example"
                    autoGrow={true}
                    {...register("example", {
                      validate: {},
                    })}
                  ></IonTextarea>

                  <div className='flex justify-between mb-4 text-sm'>
                    <IonCheckbox
                      {...register("b2b", {
                        validate: {},
                      })}
                      checked={isB2b as boolean}
                      onIonChange={(event: any) => {
                        console.log('event', event.detail.checked);
                        setValue("b2b", event.detail.checked);
                      }}
                      labelPlacement="start">B2B</IonCheckbox>

                    <IonCheckbox
                      {...register("b2c", {
                        validate: {},
                      })}
                      checked={isB2c as boolean}
                      onIonChange={(event: any) => {
                        console.log('event', event.detail.checked);
                        setValue("b2c", event.detail.checked);
                      }}
                      labelPlacement="start">B2C</IonCheckbox>
                  </div>

                  <div className='text-center'>
                    <IonButton size='small' type='submit' className='btn-primary' shape="round">
                      {loading && <IonSpinner className='mr-2' name="bubbles"></IonSpinner>}
                      Save
                    </IonButton>
                    <IonButton onClick={() => onModalDismiss()} size='small' type='reset' fill='outline' shape="round">
                      Cancel
                    </IonButton>
                  </div>
                </form>
              </div>
            </IonModal>
            {/* modal end */}

            {/* aleart start */}
            <IonAlert
              isOpen={isOpen}
              header={isAlertHeader}
              subHeader={isAlertSubHeader}
              trigger="present-alert"
              buttons={[
                {
                  text: 'No',
                  role: 'cancel',
                  handler: () => {
                    setIsOpen(false)
                    console.log('Alert canceled');
                  },
                },
                {
                  text: 'Yes',
                  role: 'confirm',
                  handler: () => {
                    handleAleart(false, 0);
                    console.log('Alert confirmed');
                  },
                },
              ]}
              onDidDismiss={({ detail }) => console.log(`Dismissed with role: ${detail.role}`)}
            ></IonAlert>
            {/* aleart end */}

            <IonFab slot="fixed" vertical="bottom" horizontal="end">
              <IonFabButton size="small" onClick={() => setIsOpenModal(true)}>
                <IonIcon icon={add}></IonIcon>
              </IonFabButton>
            </IonFab>
            <IonToast
              className='custom-toast'
              isOpen={isShowError}
              message={isErrorMsg}
              duration={3000}
              onDidDismiss={() => setIsShowError(false)}
            ></IonToast>
          </IonContent>
        </IonPage>
      </IonSplitPane>
    </>
  );
};

export default Examples;

import { IonAccordion, IonAccordionGroup, IonAlert, IonButton, IonButtons, IonCard, IonCheckbox, IonChip, IonCol, IonContent, IonFab, IonFabButton, IonGrid, IonHeader, IonIcon, IonInput, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonModal, IonPage, IonPopover, IonProgressBar, IonRow, IonSelect, IonSelectOption, IonSpinner, IonSplitPane, IonText, IonTextarea, IonTitle, IonToast, IonToolbar } from '@ionic/react';
import { useEffect, useRef, useState } from 'react';
import AppHeader from '../../../components/header/Header';
import Sidenav from '../../../components/sidenav/Sidenav';
import { add, checkmarkDoneOutline, closeOutline, createOutline, informationCircleOutline, informationOutline, speedometerOutline, swapVerticalOutline, trashOutline } from 'ionicons/icons';
import { HTTPMethod, NetworkInfo } from '../../../routes/network';
import { useForm } from 'react-hook-form';
import SelectDropdown from '../../../components/dropdown/Dropdown';
import { Tooltip } from 'react-tooltip';

interface ExampleAddModel {
  example: string;
  example_id: string;
  segment_id: string;
  purpose_id: string;
  format_id: string;
  user_prompt: string;
  products: string;
  status: string;
  test_results: number[] | null;
  created_at: string;
  updated_at: string;
  b2b: number | boolean;
  b2c: number | boolean;
  example_type: string;
}

interface FilterModel {
  segment_id: string | null;
  purpose_id: string | null;
  format_id: string | null;
  status: string | null;
  businessType: number | null;
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
  b2b: number;
  b2c: number;
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
  const [sortField, setSortField] = useState<"created_at" | "updated_at">("created_at");

  const statusNames = [
    { id: 'active', name: 'Active' },
    { id: 'validated', name: 'Validated' },
    { id: 'testing', name: 'Testing' },
    { id: 'discarded', name: 'Discarded' },
  ]

  const businessType = [
    { id: 1, name: 'B2B' },
    { id: 2, name: 'B2C' },
    { id: 3, name: 'B2X' },
  ]

  const exampleType = [
    { id: 1, name: "AI generated" },
    { id: 2, name: "Admin submission" }
  ]

  const statusColors: Record<string, string> = {
    testing: "primary",
    validated: "warning",
    active: "success",
    discarded: "danger",
  };

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
    if (_identifier === 'active') {
      setIsAlertHeader('Approve examples!');
      setIsAlertSubHeader('Do you want to approve this example/these examples?');

      let updatedExamples = filterExampleList.map((item) =>
        selectedIds.includes(item.example_id)
          ? { ...item, status: "active", updated_at: getCurrentTimestamp()  }
          : item
      );

      console.log('updatedExamples', updatedExamples);
      handleAleart(true, updatedExamples);
    }else if (_identifier === 'discarded') {
      setIsAlertHeader('Reject examples!');
      setIsAlertSubHeader('Do you want to reject this example/these examples?');

      let updatedExamples = filterExampleList.map((item) =>
        selectedIds.includes(item.example_id)
          ? { ...item, status: "discarded", updated_at: getCurrentTimestamp() }
          : item
      );

      console.log('updatedExamples', updatedExamples);
      handleAleart(true, updatedExamples);
    }else if (_identifier === 'delete') {
      setIsAlertHeader('Delete examples!');
      setIsAlertSubHeader('Do you want to delete this example/these examples?');

      let updatedExamples = filterExampleList.filter(
        (item) => !selectedIds.includes(item.example_id)
      );
  
      console.log("Updated Examples:", updatedExamples);
      handleAleart(true, updatedExamples);
    }
  }
  /* change data by select checkbox end */

  /* -------------------Sorting start------------------- */
  const parseDate = (dateString: string): Date => {
    const [day, month, year, time] = dateString.split(/[/ ]/);
    return new Date(`${year}-${month}-${day}T${time}`);
  };
  const toggleSort = () => {
    const sorted = [...exampleList].sort((a, b) => {
      const dateA = parseDate(a[sortField]).getTime();
      const dateB = parseDate(b[sortField]).getTime();
      return isAscending ? dateA - dateB : dateB - dateA;
    });
    console.log('sorted', sorted);
    setExampleList(sorted);
    setIsAscending(!isAscending); // Toggle the sorting direction
    console.log('toggleSort:', filterExampleList);
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
      const urlData = apiUrl + '/resource/get?table=formats&columns=format_id&columns=format_name&columns=b2b&columns=b2c';

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
    setValue("example_type", _value.example_type);
    setValue("segment_id", _value.segment_id);
    setValue("purpose_id", _value.purpose_id);
    setValue("format_id", _value.format_id);
    setValue("user_prompt", _value.user_prompt);
    setValue("status", _value.status);
    setValue("test_results", _value.test_results);
    setValue("products", _value.products);
    setValue("created_at", _value.created_at);
    setValue("status", _value.status); 

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
    console.log('toggleSort:', filterExampleList);
  }
  /* handle edit end */

  /* check password hashed or not start */
  const isBcryptHash = (password: any) => {
    return typeof password === 'string' && password.length === 60 && (password.startsWith('$2a$') || password.startsWith('$2b$') || password.startsWith('$2y$'));
  };
  /* check password hashed or not end */

  /* -----------Filter form submit start----------- */
  const filterFormSubmit = async (data: any) => {
    // data.format_id = selectedFormats.length > 0 ? selectedFormats[0].format_id : null;
    data.purpose_id = selectedPurpose.length > 0 ? selectedPurpose[0].purpose_id : null;
    data.segment_id = selectedSegments.length > 0 ? selectedSegments[0].segment_id : null;
    
    if (data.businessType === 1) {
      data.b2b = 1;
      data.b2c = 0;
    }else if (data.businessType === 2) {
      data.b2b = 0;
      data.b2c = 1;
    }else if (data.businessType === 3) {
      data.b2b = 1;
      data.b2c = 1;
    }else {
      data.b2b = null;
      data.b2c = null;
    }
    console.log('data', data);
    console.log('selectedFormats', selectedFormats);
    console.log('selectedSegments', selectedSegments);
    console.log('selectedPurpose', selectedPurpose);

    const filteredData = filterExampleList.filter((item) => {
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

  /* ---------------Time stamp start--------------- */
  const getCurrentTimestamp = (): string => {
    const now = new Date();

    const padZero = (num: number) => num.toString().padStart(2, "0");

    const day = padZero(now.getDate());
    const month = padZero(now.getMonth() + 1); // Months are 0-based
    const year = now.getFullYear();

    const hours = padZero(now.getHours());
    const minutes = padZero(now.getMinutes());
    const seconds = padZero(now.getSeconds());

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};
  /* Time stamp end */

  /* -----------Handle form submit start----------- */
  const handleFormSubmit = async (data: any) => {
    console.log('handleFormSubmit', data);

    let payLoad: any = {};
    payLoad.example = data.example;
    payLoad.example_type = data.example_type;
    payLoad.format_id = data.format_id;
    payLoad.products = data.products;
    payLoad.purpose_id = data.purpose_id;
    payLoad.segment_id = data.segment_id;
    payLoad.user_prompt = data.user_prompt;
    payLoad.example_id = data.example_id;
    payLoad.test_results = data.test_results;
    payLoad.status = data.status;
    payLoad.created_at = data.created_at ? data.created_at : getCurrentTimestamp();
    payLoad.updated_at = getCurrentTimestamp();

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



    let prevExampleList = filterExampleList;
    let index: any = getExampleIdIndices(filterExampleList, payLoad.example_id);

    console.log('finalData', payLoad);
    console.log('targetIndex', index[0]);
    console.log('index@@', );
    if (isEdit === true) {
      console.log('edit')
      prevExampleList.splice(index[0], 1, payLoad);
    } else {
      console.log('no edit')
      payLoad.example_id = `ex${generateDateTimeString()}`;
      prevExampleList = [...filterExampleList, payLoad];
    }


    console.log('prevList', prevExampleList);

    handleExamplesUpdate(prevExampleList);
  }

  const getExampleIdIndices = (arr: ExampleAddModel[], id: string): number[] => {
    return arr
      .map((item, index) => item.example_id === id ? index : -1)  // Return index if id matches
      .filter(index => index !== -1);  // Remove -1 values (no match)
  };

  const getDuplicateExampleIds = (arr: ExampleAddModel[]): string[] => {
    const exampleIds = arr.map(item => item.example_id);
    const duplicates: string[] = [];
    const seen: Set<string> = new Set();

    exampleIds.forEach(id => {
      if (seen.has(id) && !duplicates.includes(id)) {
        duplicates.push(id); // Add duplicate only once
      } else {
        seen.add(id);
      }
    });

    return duplicates;
  };

  const handleExamplesUpdate = async (allExample: ExampleAddModel[]) => {
    setLoading(true);
    let formUrl = apiUrl + '/resource/put';
    console.log('payload', allExample);

    let updatedExamples = allExample;

    console.log('Duplicates>>>>', getDuplicateExampleIds(allExample));

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
      businessType: null,
      status: null,
      format_id: null,
      segment_id: null,
      purpose_id: null,
    },
  });
  const isB2b = watch('b2b');
  const isB2c = watch('b2c');
  /* Handle form input field changes end */

  const getLabel = (b2b: number, b2c: number): string => {
    if (b2b === 1 && b2c === 0) return "B2B";
    if (b2b === 0 && b2c === 1) return "B2C";
    if (b2b === 1 && b2c === 1) return "B2X";
    return "";
  };

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
                      {/* <div>
                        <SelectDropdown
                          options={formats}
                          selectedOptions={selectedFormats}
                          setSelectedOptions={setSelectedFormats}
                          multiSelect={false} // Multi-select mode
                          idKey="format_id"
                          nameKey="format_name"
                          tooltipKey="format_id"
                          placeHolder='Select formats'
                          label='Select format'
                        />
                        { loadingFormats &&
                          <IonProgressBar className='mt-0.5' type="indeterminate"></IonProgressBar>
                        }
                      </div> */}
                      <IonSelect placeholder="Select formats" className='min-h-10 field-item text-sm' label="Select formats" interface="popover" labelPlacement="stacked" fill="outline"
                        {...filter("format_id", {
                          validate: {},
                        })}>
                        {formats.map((item, index) => (
                          <IonSelectOption key={index} value={item.format_id}>{item.format_name} ({getLabel(item.b2b, item.b2c)})</IonSelectOption>
                        ))}
                      </IonSelect>
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
                          label='Select segments'
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
                          label='Select purpose'
                        />
                        { loadingPurposes &&
                          <IonProgressBar className='mt-0.5' type="indeterminate"></IonProgressBar>
                        }
                      </div>
                    </IonCol>
                    <IonCol size='4'>
                      <IonSelect placeholder="Select Status" className='min-h-10 field-item text-sm' label="Select status" interface="popover" labelPlacement="stacked" fill="outline"
                        {...filter("status", {
                          validate: {},
                        })}>
                        {statusNames.map((item, index) => (
                          <IonSelectOption key={index} value={item.id}>{item.name}</IonSelectOption>
                        ))}
                      </IonSelect>
                    </IonCol>
                    <IonCol size='4'>
                      <IonSelect placeholder="Select Business Type" className='min-h-10 field-item text-sm' label="Select Business Type" interface="popover" labelPlacement="stacked" fill="outline"
                        {...filter("businessType", {
                          validate: {},
                        })}>
                        {businessType.map((item, index) => (
                          <IonSelectOption key={index} value={item.id}>{item.name}</IonSelectOption>
                        ))}
                      </IonSelect>
                    </IonCol>
                    {/* <IonCol size='3'>
                      <IonSelect
                        placeholder="Select B2B" className='min-h-10 field-item text-sm' label="Select B2B" interface="popover" labelPlacement="stacked" fill="outline"
                        {...filter("b2b", {
                          validate: {},
                        })}>
                        <IonSelectOption value={1}>Yes</IonSelectOption>
                        <IonSelectOption value={0}>No</IonSelectOption>
                      </IonSelect>
                    </IonCol>
                    <IonCol size='3'>
                      <IonSelect
                        placeholder="Select B2C" className='min-h-10 field-item text-sm' label="Select B2C" interface="popover" labelPlacement="stacked" fill="outline"
                        {...filter("b2c", {
                          validate: {},
                        })}>
                        <IonSelectOption value={1}>Yes</IonSelectOption>
                        <IonSelectOption value={0}>No</IonSelectOption>
                      </IonSelect>
                    </IonCol> */}
                    <IonCol size='3' className='text-right'>
                      <IonButton type='submit' size='small' className='btn-primary text-xs' shape="round">
                        Filter
                      </IonButton>
                      <IonButton onClick={() => { reset(); getExamplesData() }} className='text-xs' size='small' type='reset' fill='outline' shape="round">
                        Reset
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
              <div className='flex items-center'>
                <IonSelect
                  value={sortField}
                  onIonChange={(e) => setSortField(e.detail.value)}
                  placeholder="Select Sort Field"
                  className='min-h-10 w-36 mr-2 field-item text-sm' label="Select Sort Field" interface="popover" labelPlacement="stacked" fill="outline"
                >
                  <IonSelectOption value="created_at">Created Date</IonSelectOption>
                  <IonSelectOption value="updated_at">Updated Date</IonSelectOption>
                </IonSelect>
                <IonButton data-tooltip-id='tooltip' data-tooltip-content={isAscending ? " Ascending" : " Descending"} onClick={() => toggleSort()} size='small' shape="round">
                  <IonIcon slot="icon-only" className={isAscending ? "rotate" : "rotate-reverse"} icon={swapVerticalOutline}></IonIcon>
                </IonButton>
                <Tooltip id='tooltip' />
                <IonButton disabled={selectedIds.length === 0} onClick={() => handleChangeData('active')} size='small' color="success" className='btn-primary text-xs' shape="round">
                  <IonIcon slot="start" icon={checkmarkDoneOutline}></IonIcon>
                  Activate
                </IonButton>
                <IonButton disabled={selectedIds.length === 0} onClick={() => handleChangeData('discarded')} size='small' color="warning" className='btn-primary text-xs' shape="round">
                  <IonIcon slot="start" icon={closeOutline}></IonIcon>
                  Discard
                </IonButton>
                <IonButton disabled={selectedIds.length === 0} onClick={() => handleChangeData('delete')} size='small' color="danger" className='btn-primary text-xs' shape="round">
                  <IonIcon slot="start" icon={trashOutline}></IonIcon>
                  Delete
                </IonButton>
              </div>
            </div>
            <IonList className='bg-transparent'>
              {exampleList.map((item, index) => {
                const total = item.test_results?.length || 0; // Total tests
                const passed = item.test_results?.filter((val) => val === 1).length || 0; // Passed tests
                const failed = total - passed; // Failed tests

                return(
                  <IonCard key={index}>
                    <IonItem>
                      <IonLabel>
                        <IonRow>
                          <IonCol size='4'><p className=''><b>Example Id:</b> {item.example_id}</p></IonCol>
                          <IonCol size='4'><p><b>Segment Id:</b> {item.segment_id}</p></IonCol>
                          <IonCol size='4'><p><b>Purpose Id:</b> {item.purpose_id}</p></IonCol>
                          <IonCol size='4'><p><b>Format Id:</b> {item.format_id}</p></IonCol>
                          <IonCol size='4'>
                            <p>
                              <b>B2B:</b> {item.b2b === 1 ? 'Yes' : item.b2b === 0 ? 'No' : 'invalid value'} | <b>B2C:</b> {item.b2c === 1 ? 'Yes' : item.b2c === 0 ? 'No' : 'invalid value'}
                            </p>
                          </IonCol>
                          <IonCol size='4'><p><b>Products:</b> {item.products}</p></IonCol>
                          <IonCol size='12'><p><b>Example Type:</b> {item.example_type}</p></IonCol>
                          <IonCol size='12'><p><b>User Prompt:</b> {item.user_prompt}</p></IonCol>
                          <IonCol size='12'><p><b>Example:</b> {item.example}</p></IonCol>
                          <IonCol size='4'><p className='italic'><b>Created at:</b> {item.created_at}</p></IonCol>
                          <IonCol size='4'></IonCol>
                          <IonCol size='4'><p className='italic'><b>Updated at:</b> {item.updated_at}</p></IonCol>
                        </IonRow>
                      </IonLabel>
                      <IonButton id="open-modal" onClick={() => handleEdit(item, index)} slot="end" size="small" color="warning">
                        <IonIcon icon={createOutline}></IonIcon>
                      </IonButton>
                      <div className='absolute top-0 right-0 flex flex-col'>
                        <IonChip className='capitalize h-7 min-h-7 font-bold flex items-center justify-center' color={statusColors[item.status] || "primary"}>
                          <IonLabel>{item.status}</IonLabel>
                        </IonChip>
                        <IonChip className='h-7 min-h-7'>
                          <IonIcon id={`hover-trigger${index}`} color="primary" icon={informationCircleOutline}></IonIcon>
                          <IonLabel className='font-bold'>
                            {item.test_results ? (
                              <>
                                <span className="result-count text-[#2DD55B]">
                                    {passed}
                                </span>{" "}
                                |{" "}
                                <span
                                    className="result-count text-[#C5000F]">
                                    {failed}
                                </span>
                              </>
                            ) : (
                                "No test results available"
                            )}
                          </IonLabel>
                          <IonPopover trigger={`hover-trigger${index}`} triggerAction="hover">
                            <IonContent class="ion-padding">
                              The number of times the output generated using this example was rated as <br/>“<span className='text-[#2DD55B]'>better</span> | <span className='text-[#C5000F]'>worse</span>” than the output generated without.
                            </IonContent>
                          </IonPopover>
                        </IonChip>
                      </div>
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
                )
              })}
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
                      <IonSelectOption key={index} value={item.format_id}>{item.format_name} ({getLabel(item.b2b, item.b2c)})</IonSelectOption>
                    ))}
                  </IonSelect>

                  <IonSelect placeholder="Select purpose" disabled={purposes.length === 0} className='min-h-10 field-item mb-4 text-sm' label="Select desired purpose below" interface="popover" labelPlacement="stacked" fill="outline"
                    {...register("purpose_id", {
                      validate: {},
                    })}>
                    {purposes.map((item, index) => (
                      <IonSelectOption key={index} value={item.purpose_id}>{item.purpose_name}</IonSelectOption>
                    ))}
                  </IonSelect>

                  <IonSelect placeholder="Select Segment" disabled={segments.length === 0} className='min-h-10 field-item mb-4 text-sm' label="Select desired segment below" interface="popover" labelPlacement="stacked" fill="outline"
                    {...register("segment_id", {
                      validate: {},
                    })}>
                    {segments.map((item, index) => (
                      <IonSelectOption key={index} value={item.segment_id}>{item.segment_name}</IonSelectOption>
                    ))}
                  </IonSelect>

                  <IonSelect placeholder="Select Example Type" className='min-h-10 field-item mb-4 text-sm' label="Select desired example type below" interface="popover" labelPlacement="stacked" fill="outline"
                    {...register("example_type", {
                      validate: {},
                    })}>
                    {exampleType.map((item, index) => (
                      <IonSelectOption key={index} value={item.name}>{item.name}</IonSelectOption>
                    ))}
                  </IonSelect>

                  <IonSelect placeholder="Select Status" className='min-h-10 field-item mb-4 text-sm' label="Select desired status below" interface="popover" labelPlacement="stacked" fill="outline"
                    {...register("status", {
                      validate: {},
                    })}>
                    {statusNames.map((item, index) => (
                      <IonSelectOption key={index} value={item.id}>{item.name}</IonSelectOption>
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
              <IonFabButton size="small" onClick={() => {setIsOpenModal(true), setValue("example_type", 'Admin submission')}}>
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

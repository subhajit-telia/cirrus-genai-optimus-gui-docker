import { IonAlert, IonButton, IonButtons, IonCard, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInput, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonModal, IonPage, IonProgressBar, IonSegment, IonSegmentButton, IonSpinner, IonSplitPane, IonText, IonTitle, IonToast, IonToolbar } from '@ionic/react';
import { useEffect, useRef, useState } from 'react';
import AppHeader from '../../../components/header/Header';
import Sidenav from '../../../components/sidenav/Sidenav';
import { add, closeOutline, createOutline, information, listCircle, trashOutline } from 'ionicons/icons';
import templateData from '../../../template.json';
import { HTTPMethod, NetworkInfo } from '../../../routes/network';
import { OverlayEventDetail } from '@ionic/core/components';
import { useForm } from 'react-hook-form';

interface UserAddModel {
  username: string;
  password: string;
  newPassword: string;
  role: string;
  hashed: number;
}

const Users: React.FC = () => {
  /* Variables start */
  const [userList, setUserList] = useState<UserAddModel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const modal = useRef<HTMLIonModalElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [targetIndex, setTargetIndex] = useState<number>();
  const [isShowError, setIsShowError] = useState(false);
  const [isErrorMsg, setIsErrorMsg] = useState('');

  useEffect(() => {

    getUsersData();
  }, []);

  /* -------------get users data start------------- */
  const getUsersData = async () => {
    setLoading(true);
    try {
      const urlData = NetworkInfo.URL + '/resource/get?table=users';

      const response = await fetch(urlData);
      const responseData = await response.json();
      console.log("Success:", responseData);

      if (response.ok) {
        setUserList(responseData);
        setLoading(false);
      }
      
    } catch (error: any) {
      console.error("catch failed:", error);
      setLoading(false);
    }
  };
  /* get users data end */

  /* modal functions start */

  const onModalDismiss = () => {
    setIsOpenModal(false);
    setIsEdit(false);
    setValue("username", '');
    setValue("password", '');
  }

  const handleDeleteAleart = (_indicator:boolean, _value:number) => {
    if (_indicator === true) {
      setIsOpen(true);
      setTargetIndex(_value);
    }else if (_indicator === false) {
      let updatedUsers = userList;

      let delIndex:any = targetIndex;
      updatedUsers.splice(delIndex, 1);

      console.log('updatedUsers', updatedUsers);
      setIsOpen(false);
      handleUsersUpdate(updatedUsers);
    }

  }
  
  /* modal functions end */

  /* handle edit start */
  const handleEdit = (_value:any, _index:number) => {
    console.log('_value', _value);
    setValue("username", _value.username);
    setValue("password", _value.password);
    setValue("role", 'admin');
    setIsOpenModal(true);
    setIsEdit(true);
    setTargetIndex(_index);
  }
  /* handle edit end */
  
  /* check password hashed or not start */
  const isBcryptHash = (password:any) => {
    return typeof password === 'string' && password.length === 60 && (password.startsWith('$2a$') || password.startsWith('$2b$') || password.startsWith('$2y$'));
  };
  /* check password hashed or not end */

  /* -----------Handle form submit start----------- */
  const handleFormSubmit = async (data: any) => {
    console.log('data', data);
    if (data.newPassword) {
      data.password = data.newPassword;
    }
    let formData:any = {
      username: data.username,
      role: data.role,
      password: data.password,
    };

    let prevUserList = userList;
    let index:any = targetIndex;
    if (isEdit === true) {
      prevUserList.splice(index, 1, formData);
    }else {
      prevUserList = [...userList, formData];
    }

    
    console.log('prevList', prevUserList);

    handleUsersUpdate(prevUserList);
  }
  const handleUsersUpdate = async (allUser: UserAddModel[]) => {
    setLoading(true);
    let formUrl = NetworkInfo.URL + '/login/put';
    console.log('payload', allUser);

    let updatedUsers = allUser.map(user => {
      return {
        ...user,
        hashed: isBcryptHash(user.password) ? 1 : 0
      };
    });

    let finalPayload = {
      json_obj: updatedUsers
    }
    
    try {
      const response = await fetch(formUrl, {
        method: HTTPMethod.PUT,
        headers: {
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
          
        }else {
          setIsShowError(true);
          setIsErrorMsg(responseData);
          reset();
          setLoading(false);
          setIsEdit(false);
          setTargetIndex(-1);
          getUsersData();
          onModalDismiss();
        }
      }
      
    } catch (error: any) {
      console.error("Login failed:", error);
      setLoading(false);
      setIsShowError(true);
      setIsErrorMsg(error.message || "Request failed");
      getUsersData();
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
      role: 'user'
    },
  });
  /* Handle form input field changes end */

  return (
    <>
    <IonSplitPane contentId="main">
    <Sidenav/>
    <IonPage id="main">
      
      <AppHeader/>
      
      <IonContent className='page-body'>
        {loading && 
        <IonProgressBar type="indeterminate"></IonProgressBar>
        }
        
          <IonList className='bg-transparent'>
            {userList.map((item, index) => (
              <IonCard key={index}>
                <IonItemSliding>
                  <IonItem button={true}>
                    <IonLabel>
                      <p className='font-bold'>Username: {item.username}</p>
                      <p>Role: {item.role}</p>
                    </IonLabel>
                    <IonButton id="open-modal" onClick={() => handleEdit(item, index)} slot="end" size="small" color="warning">
                      <IonIcon icon={createOutline}></IonIcon>
                    </IonButton>
                    <IonButton onClick={() => handleDeleteAleart(true, index)} color="danger" slot="end" size="small">
                      <IonIcon icon={trashOutline}></IonIcon>
                    </IonButton>
                  </IonItem>
                  <IonItemOptions>
                    <IonItemOption id="open-modal" onClick={() => handleEdit(item, index)} color="warning">Edit</IonItemOption>
                    <IonItemOption onClick={() => handleDeleteAleart(true, index)} color="danger">Delete</IonItemOption>
                  </IonItemOptions>
                </IonItemSliding>
              </IonCard>
            ))}
          </IonList>

          {/* modal start */}
          <IonModal id="example-modal" isOpen={isOpenModal} onWillDismiss={() => onModalDismiss()}>
            <IonHeader>
              <IonToolbar>
                <IonTitle className='text-sm font-bold'>User Add & Edit</IonTitle>
                <IonButtons slot="end">
                  <IonButton size="small" shape="round" onClick={() => onModalDismiss()}>
                    <IonIcon slot="icon-only" icon={closeOutline}></IonIcon>
                  </IonButton>
                </IonButtons>
              </IonToolbar>
            </IonHeader>
            <div className="ion-padding">
              <form onSubmit={handleSubmit(handleFormSubmit)} className="w-full">
                <IonSegment className='m-auto mb-4 border w-36 h-7 bg-white rounded-[50px]' 
                  {...register("role", {
                    required: "false",
                  })}
                  onIonChange={(event: any) => {
                    console.log('event', event.target.value);
                    setValue("role", event.target.value as string);
                  }}>
                  <IonSegmentButton className='w-20 min-w-0 h-7 min-h-6 ' value="user">
                      <IonLabel className='m-0 text-xs'>User</IonLabel>
                  </IonSegmentButton>
                  <IonSegmentButton className='w-20 min-w-0 h-7 min-h-6 ' value="admin">
                      <IonLabel className='m-0 text-xs'>Admin</IonLabel>
                  </IonSegmentButton>
                </IonSegment>
                <IonInput className='mb-4 text-sm' label="Username" labelPlacement="floating" fill="outline" placeholder="Enter Username"
                  {...register("username", {
                    validate: {},
                  })}
                ></IonInput>
                {isEdit === true ?
                  <>
                    <IonInput className='text-sm' label="New Password" labelPlacement="floating" fill="outline" placeholder="Enter Password"
                      {...register("newPassword", {
                        validate: {},
                      })}
                    ></IonInput>
                    <input type='hidden' 
                      {...register("password", {
                        validate: {},
                      })}
                    />
                  </>
                :
                  <IonInput className='text-sm' label="Password" labelPlacement="floating" fill="outline" placeholder="Enter Password"
                    {...register("password", {
                      validate: {},
                    })}
                  ></IonInput>
                
                }
                <div className='text-center mt-4'>
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
            header="Delete user!"
            subHeader="Are you want to delete this user?"
            trigger="present-alert"
            buttons={[
              {
                text: 'Cancel',
                role: 'cancel',
                handler: () => {
                  setIsOpen(false)
                  console.log('Alert canceled');
                },
              },
              {
                text: 'Delete',
                role: 'confirm',
                handler: () => {
                  handleDeleteAleart(false, 0);
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

export default Users;

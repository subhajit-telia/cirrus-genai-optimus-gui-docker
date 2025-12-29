import {
  IonMenu,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonMenuToggle,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonHeader,
  IonToolbar,
} from "@ionic/react";
import { useContext, useState } from "react";
import { useHistory, useLocation } from "react-router";
import teliaOptimus from '../../theme/assets/telia-optimus.png'

const FULL_MENU_DATA = Array.from({ length: 100 }, (_, i) => `Item ${i + 1}`);
const PAGE_SIZE = 20;

const HistoryBar: React.FC = () => {
  const history = useHistory();
  const location = useLocation();

  const [menuItems, setMenuItems] = useState(
    FULL_MENU_DATA.slice(0, PAGE_SIZE)
  );

  const handleClick = (item: string) => {
  };

  const loadMore = (ev: CustomEvent<void>) => {
    setTimeout(() => {
      const nextItems = FULL_MENU_DATA.slice(
        menuItems.length,
        menuItems.length + PAGE_SIZE
      );

      setMenuItems((prev) => [...prev, ...nextItems]);
      (ev.target as HTMLIonInfiniteScrollElement).complete();
    }, 500);
  };

  return (
    <IonMenu className='md:max-w-48' contentId="main" type="overlay">
      
      <IonContent>
        <IonHeader className="ion-no-border px-5 sticky top-0 bg-white z-10">
          <IonToolbar>
            <img src={teliaOptimus} />
          </IonToolbar>
        </IonHeader>
        <IonList>
          {menuItems.map((item) => {

            return (
              <IonMenuToggle key={item} autoHide={false}>
                <IonItem
                  button
                  onClick={() => handleClick(item)}
                >
                  <IonLabel>{item}</IonLabel>
                </IonItem>
              </IonMenuToggle>
            );
          })}
        </IonList>

        <IonInfiniteScroll onIonInfinite={loadMore}>
          <IonInfiniteScrollContent loadingText="Loading more..." />
        </IonInfiniteScroll>
      </IonContent>
    </IonMenu>
  );
};

export default HistoryBar;

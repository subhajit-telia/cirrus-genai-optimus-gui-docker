import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */

import Home from './pages/home/Home';

setupIonicReact();
import './theme/variables.css';
import { Conversation } from './pages/Conversation';
import Login from './pages/auth/login';
import Channels from './pages/admin/channels/Channels';
import Prompts from './pages/admin/prompts/Prompts';
import Purpose from './pages/admin/purpose/Purpose';
import Segments from './pages/admin/segments/Segments';
import Users from './pages/admin/users/Users';
const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        <Route exact path="/home">
          <Home />
        </Route>
        <Route exact path="/login">
          <Login />
        </Route>
        <Route exact path="/channels">
          <Channels />
        </Route>
        <Route exact path="/prompts">
          <Prompts />
        </Route>
        <Route exact path="/purpose">
          <Purpose />
        </Route>
        <Route exact path="/segments">
          <Segments />
        </Route>
        <Route exact path="/users">
          <Users />
        </Route>
        <Route exact path="/conversation">
          <Conversation selectedTopic=""  addressBarValue=""   selectedModel="" />
        </Route>
        <Route exact path="/">
          <Redirect to="/home" />
        </Route>
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;

import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
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


setupIonicReact();
import './theme/variables.css';
import Login from './pages/auth/login';
import Formats from './pages/admin/formats/Formats';
import Prompts from './pages/admin/prompts/Prompts';
import Purpose from './pages/admin/purpose/Purpose';
import Segments from './pages/admin/segments/Segments';
import Users from './pages/admin/users/Users';
import {AuthProvider}  from './config/AuthContext';
import AuthGuard from './config/AuthGuard';
import B2C from './pages/program/B2C';


const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        <AuthProvider>
          <Router>
            <Switch>
              <AuthGuard path="/b2c" component={B2C} role="user"/>
              <AuthGuard path="/users" component={Users} />
              
              <Route exact path="/login">
                <Login />
              </Route>
              <Route exact path="/formats">
                <Formats />
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
              <Route path="/" component={Login} />
            </Switch>
          </Router>
        </AuthProvider>
        
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;

import { Suspense, lazy } from 'react';
import { Route, Switch } from 'react-router-dom';
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
// import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */


setupIonicReact();
import './theme/variables.css';
import {AuthProvider}  from './config/AuthContext';
import AuthGuard from './config/AuthGuard';
import packageJson from '../package.json';

const Login = lazy(() => import('./pages/auth/login'));
const Formats = lazy(() => import('./pages/admin/formats/Formats'));
const Prompts = lazy(() => import('./pages/admin/prompts/Prompts'));
const Purpose = lazy(() => import('./pages/admin/purpose/Purpose'));
const Segments = lazy(() => import('./pages/admin/segments/Segments'));
const B2C = lazy(() => import('./pages/program/B2C'));
const B2B = lazy(() => import('./pages/program/B2B'));
const Examples = lazy(() => import('./pages/admin/examples/Examples'));
const Config = lazy(() => import('./pages/admin/configuration/Config'));
const storedVersion = localStorage.getItem("app_version");

if (storedVersion === null || storedVersion !== packageJson.version) {
  console.log('version', packageJson.version);
  console.log('storedVersion', storedVersion);
  // alert('This is an alert!');
  localStorage.setItem("app_version", packageJson.version);
  window.location.reload();
}else {
  console.log('version', packageJson.version);
}

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet id="main">
        <AuthProvider>
          <Suspense fallback={<div>Loading...</div>}>
              <Switch>
                <AuthGuard path="/b2c" component={B2C}/>
                <AuthGuard path="/b2b" component={B2B}/>
                <AuthGuard path="/formats" component={Formats} role="admin"/>
                <AuthGuard path="/prompts" component={Prompts} role="admin"/>
                <AuthGuard path="/purpose" component={Purpose} role="admin"/>
                <AuthGuard path="/segments" component={Segments} role="admin"/>
                <AuthGuard path="/examples" component={Examples} role="admin"/>
                <AuthGuard path="/config" component={Config} role="admin"/>
                
                <Route exact path="/login">
                  <Login />
                </Route>
                <Route path="/" component={Login} />
              </Switch>
          </Suspense>
        </AuthProvider>
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;

import React, { useState, useEffect } from 'react';
import { Route, Switch, Redirect } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import { Routes } from "../routes";

// pages
import Presentation from "./Presentation";
import Upgrade from "./Upgrade";
import DashboardOverview from "./dashboard/DashboardOverview";
import Transactions from "./Transactions";
import Settings from "./Settings";
import BootstrapTables from "./tables/BootstrapTables";
import Signin from "./examples/Signin";
import Signup from "./examples/Signup";
import ForgotPassword from "./examples/ForgotPassword";
import ResetPassword from "./examples/ResetPassword";
import Lock from "./examples/Lock";
import NotFoundPage from "./examples/NotFound";
import ServerError from "./examples/ServerError";
import UserManagement from './admin/UserManagement';
import RoleManagement from './admin/RoleManagement';
import TeamManagement from './admin/TeamManagement';
import GameManagement from './admin/GameManagement';
import EventManagement from './admin/EventManagement';
import LandingManagement from './admin/LandingManagement';
import DomainRedirectManagement from './admin/DomainRedirectManagement';



// documentation pages
import DocsOverview from "./documentation/DocsOverview";
import DocsDownload from "./documentation/DocsDownload";
import DocsQuickStart from "./documentation/DocsQuickStart";
import DocsLicense from "./documentation/DocsLicense";
import DocsFolderStructure from "./documentation/DocsFolderStructure";
import DocsBuild from "./documentation/DocsBuild";
import DocsChangelog from "./documentation/DocsChangelog";

// components
import Preloader from "../components/Preloader";

import Accordion from "./components/Accordion";
import Alerts from "./components/Alerts";
import Badges from "./components/Badges";
import Breadcrumbs from "./components/Breadcrumbs";
import Buttons from "./components/Buttons";
import Forms from "./components/Forms";
import Modals from "./components/Modals";
import Navs from "./components/Navs";
import Navbars from "./components/Navbars";
import Pagination from "./components/Pagination";
import Popovers from "./components/Popovers";
import Progress from "./components/Progress";
import Tables from "./components/Tables";
import Tabs from "./components/Tabs";
import Tooltips from "./components/Tooltips";
import Toasts from "./components/Toasts";
import Profile from "./Profile";

const RouteWithLoader = ({ component: Component, ...rest }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Route {...rest} render={props => ( <> <Preloader show={loaded ? false : true} /> <Component {...props} /> </> ) } />
  );
};


export default () => (
  <AuthProvider>
    <Switch>
       <RouteWithLoader exact path={Routes.Presentation.path} component={Presentation} />
      <RouteWithLoader exact path={Routes.Signin.path} component={Signin} />
      <RouteWithLoader exact path={Routes.Signup.path} component={Signup} />
      <RouteWithLoader exact path={Routes.ForgotPassword.path} component={ForgotPassword} />
      <RouteWithLoader exact path={Routes.ResetPassword.path} component={ResetPassword} />
      <RouteWithLoader exact path={Routes.Lock.path} component={Lock} />
      <RouteWithLoader exact path={Routes.NotFound.path} component={NotFoundPage} />
      <RouteWithLoader exact path={Routes.ServerError.path} component={ServerError} />

      {/* pages - protected routes */}
      <ProtectedRoute exact path={Routes.DashboardOverview.path} component={DashboardOverview} />
      <ProtectedRoute exact path={Routes.Profile.path} component={Profile} />
      <ProtectedRoute exact path={Routes.Upgrade.path} component={Upgrade} />
      <ProtectedRoute exact path={Routes.Transactions.path} component={Transactions} />
      <ProtectedRoute exact path={Routes.Settings.path} component={Settings} />
      <ProtectedRoute exact path={Routes.BootstrapTables.path} component={BootstrapTables} />
      <ProtectedRoute  exact path={Routes.Admin.Users.path} component={UserManagement}requiredPermission="view users"/>
      <ProtectedRoute exact path={Routes.Admin.Roles.path} component={RoleManagement} requiredRole="super-admin"/>
      <ProtectedRoute exact path={Routes.Admin.Teams.path} component={TeamManagement} requiredRole="super-admin" />
      <ProtectedRoute exact path={Routes.Admin.Games.path} component={GameManagement} requiredRole="super-admin" />
      <ProtectedRoute exact path={Routes.Admin.Events.path} component={EventManagement} requiredRole="super-admin" />
      <ProtectedRoute exact path={Routes.Admin.Landings.path} component={LandingManagement} requiredRole="super-admin" />
      <ProtectedRoute exact path={Routes.Admin.DomainRedirects.path} component={DomainRedirectManagement} requiredRole="super-admin" />


      {/* components - protected routes */}
      <ProtectedRoute exact path={Routes.Accordions.path} component={Accordion} />
      <ProtectedRoute exact path={Routes.Alerts.path} component={Alerts} />
      <ProtectedRoute exact path={Routes.Badges.path} component={Badges} />
      <ProtectedRoute exact path={Routes.Breadcrumbs.path} component={Breadcrumbs} />
      <ProtectedRoute exact path={Routes.Buttons.path} component={Buttons} />
      <ProtectedRoute exact path={Routes.Forms.path} component={Forms} />
      <ProtectedRoute exact path={Routes.Modals.path} component={Modals} />
      <ProtectedRoute exact path={Routes.Navs.path} component={Navs} />
      <ProtectedRoute exact path={Routes.Navbars.path} component={Navbars} />
      <ProtectedRoute exact path={Routes.Pagination.path} component={Pagination} />
      <ProtectedRoute exact path={Routes.Popovers.path} component={Popovers} />
      <ProtectedRoute exact path={Routes.Progress.path} component={Progress} />
      <ProtectedRoute exact path={Routes.Tables.path} component={Tables} />
      <ProtectedRoute exact path={Routes.Tabs.path} component={Tabs} />
      <ProtectedRoute exact path={Routes.Tooltips.path} component={Tooltips} />
      <ProtectedRoute exact path={Routes.Toasts.path} component={Toasts} />

      {/* documentation - protected routes */}
      <ProtectedRoute exact path={Routes.DocsOverview.path} component={DocsOverview} />
      <ProtectedRoute exact path={Routes.DocsDownload.path} component={DocsDownload} />
      <ProtectedRoute exact path={Routes.DocsQuickStart.path} component={DocsQuickStart} />
      <ProtectedRoute exact path={Routes.DocsLicense.path} component={DocsLicense} />
      <ProtectedRoute exact path={Routes.DocsFolderStructure.path} component={DocsFolderStructure} />
      <ProtectedRoute exact path={Routes.DocsBuild.path} component={DocsBuild} />
      <ProtectedRoute exact path={Routes.DocsChangelog.path} component={DocsChangelog} />

      <Redirect to={Routes.NotFound.path} />
    </Switch>
  </AuthProvider>
);
import React, { useState, useEffect } from 'react';
import { Route, Switch, Redirect,useLocation, useHistory } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import { Routes } from "../routes";

// pages
import Presentation from "./Presentation";
import DashboardOverview from "./dashboard/DashboardOverview";

import NotFoundPage from "./examples/NotFound";
import UserManagement from './admin/UserManagement';
import RoleManagement from './admin/RoleManagement';
import TeamManagement from './admin/TeamManagement';
import GameManagement from './admin/GameManagement';
import EventManagement from './admin/EventManagement';
import LandingManagement from './admin/LandingManagement';
import DomainRedirectManagement from './admin/DomainRedirectManagement';
import SettingsManagement from './admin/SettingsManagement';
import AffiliateManagement from './admin/AffiliateManagement';
import MakePayment from './admin/MakePayment';
import PaymentHistory from './admin/PaymentHistory';

import AffiliatePaymentHistory from './affiliate/AffiliatePaymentHistory';
import MyAccounts from './affiliate/MyAccounts';

// components
import Preloader from "../components/Preloader";

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

export default () => {
  const location = useLocation();
  const history = useHistory();
  const token = localStorage.getItem('access_token');
  const user = localStorage.getItem('user');
  
  useEffect(() => {
    // If on root path and user is logged in, redirect to dashboard
    if ((location.pathname === '/' || location.pathname === '') && token && user) {
      history.replace('/dashboard/overview');
    }
  }, [location, history, token, user]);
  
  return (
  <AuthProvider>
    <Switch>
       <RouteWithLoader exact path={Routes.Presentation.path} component={Presentation} />
      <RouteWithLoader exact path={Routes.NotFound.path} component={NotFoundPage} />

      {/* pages - protected routes */}
      <ProtectedRoute exact path={Routes.DashboardOverview.path} component={DashboardOverview} />
      <ProtectedRoute exact path={Routes.Profile.path} component={Profile} />
      <ProtectedRoute  exact path={Routes.Admin.Users.path} component={UserManagement} requiredPermission="view users"/>
      <ProtectedRoute exact path={Routes.Admin.Roles.path} component={RoleManagement} requiredRole="super-admin"/>
      <ProtectedRoute exact path={Routes.Admin.Teams.path} component={TeamManagement} requiredRole="super-admin" />
      <ProtectedRoute exact path={Routes.Admin.Games.path} component={GameManagement} requiredRole="super-admin" />
      <ProtectedRoute exact path={Routes.Admin.Events.path} component={EventManagement} requiredRole="super-admin" />
      <ProtectedRoute exact path={Routes.Admin.Landings.path} component={LandingManagement} requiredRole="super-admin" />
      <ProtectedRoute exact path={Routes.Admin.DomainRedirects.path} component={DomainRedirectManagement} requiredRole="super-admin" />
      <ProtectedRoute exact path={Routes.Admin.Settings.path} component={SettingsManagement} requiredRole="super-admin" />
      <ProtectedRoute exact path={Routes.Admin.Affiliates.path} component={AffiliateManagement} requiredRole="super-admin" />
      <ProtectedRoute exact path={Routes.Admin.MakePayment.path} component={MakePayment} requiredRole="super-admin" />
      <ProtectedRoute exact path={Routes.Admin.PaymentHistory.path} component={PaymentHistory} requiredRole="super-admin" />
      <ProtectedRoute exact path={Routes.Affiliate.MyPayments.path} component={AffiliatePaymentHistory} requiredRole="affiliate" />
      <ProtectedRoute exact path={Routes.Affiliate.MyAccounts.path} component={MyAccounts} requiredRole="affiliate" />

      <Redirect to={Routes.NotFound.path} />
    </Switch>
  </AuthProvider>

)};
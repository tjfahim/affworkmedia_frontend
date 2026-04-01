import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from './context/AuthContext'; 

import { ToastProvider } from './context/ToastContext';

// core styles
import "./scss/volt.scss";

// vendor styles
import "react-datetime/css/react-datetime.css";

import HomePage from "./pages/HomePage";
import ScrollToTop from "./components/ScrollToTop";

ReactDOM.render(
  <BrowserRouter>
  <AuthProvider>  
      <ToastProvider>

    <ScrollToTop />
    <HomePage />
        </ToastProvider>
  </AuthProvider>

  </BrowserRouter>,
  document.getElementById("root")
);
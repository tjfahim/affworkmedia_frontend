import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faUser, faAngleLeft, faSignInAlt, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { Modal, Tab, Tabs, Form, Button, Card, Alert } from '@themesberg/react-bootstrap';
import { useAuth } from "../../context/AuthContext";

// Move SignInForm outside the main component
const SignInForm = ({ loginForm, setLoginForm, handleLoginSubmit, loading, error, setAuthTab, handleShowForgotPassword }) => (
  <Form onSubmit={handleLoginSubmit} className="mt-3">
    {error && <Alert variant="danger">{error}</Alert>}
    
    <Form.Group className="mb-3" controlId="formBasicEmail">
      <Form.Label className="text-small">Email address</Form.Label>
      <div className="input-group">
        <span className="input-group-text bg-light">
          <FontAwesomeIcon icon={faEnvelope} className="text-gray" />
        </span>
        <Form.Control 
          type="email" 
          placeholder="Enter email"
          value={loginForm.email}
          onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
          required
        />
      </div>
    </Form.Group>

    <Form.Group className="mb-3" controlId="formBasicPassword">
      <Form.Label className="text-small">Password</Form.Label>
      <div className="input-group">
        <span className="input-group-text bg-light">
          <FontAwesomeIcon icon={faLock} className="text-gray" />
        </span>
        <Form.Control 
          type="password" 
          placeholder="Password"
          value={loginForm.password}
          onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
          required
        />
      </div>
    </Form.Group>

    <div className="d-flex justify-content-between align-items-center mb-4">
      <Card.Link 
        href="#" 
        onClick={(e) => {
          e.preventDefault();
          handleShowForgotPassword();
        }} 
        className="text-primary small"
      >
        Forgot password?
      </Card.Link>
    </div>

    <Button variant="primary" type="submit" className="w-100" disabled={loading}>
      {loading ? 'Signing in...' : (
        <>
          <FontAwesomeIcon icon={faSignInAlt} className="me-2" /> Sign In
        </>
      )}
    </Button>

    <p className="text-center mt-3 mb-0 text-gray small">
      Don't have an account?{' '}
      <Card.Link href="#" onClick={(e) => {
        e.preventDefault();
        setAuthTab("signup");
      }} className="text-primary">
        Sign Up
      </Card.Link>
    </p>
  </Form>
);

// Move SignUpForm outside the main component
const SignUpForm = ({ registerForm, setRegisterForm, handleRegisterSubmit, loading, error, setAuthTab }) => (
  <Form onSubmit={handleRegisterSubmit} className="mt-3">
    {error && <Alert variant="danger">{error}</Alert>}
    
    <div className="row">
      <div className="col-md-6">
        <Form.Group className="mb-3" controlId="formBasicFirstName">
          <Form.Label className="text-small">First Name</Form.Label>
          <div className="input-group">
            <span className="input-group-text bg-light">
              <FontAwesomeIcon icon={faUser} className="text-gray" />
            </span>
            <Form.Control 
              type="text" 
              placeholder="First name"
              value={registerForm.first_name}
              onChange={(e) => setRegisterForm({...registerForm, first_name: e.target.value})}
              required
            />
          </div>
        </Form.Group>
      </div>
      <div className="col-md-6">
        <Form.Group className="mb-3" controlId="formBasicLastName">
          <Form.Label className="text-small">Last Name</Form.Label>
          <div className="input-group">
            <span className="input-group-text bg-light">
              <FontAwesomeIcon icon={faUser} className="text-gray" />
            </span>
            <Form.Control 
              type="text" 
              placeholder="Last name"
              value={registerForm.last_name}
              onChange={(e) => setRegisterForm({...registerForm, last_name: e.target.value})}
              required
            />
          </div>
        </Form.Group>
      </div>
    </div>

    <Form.Group className="mb-3" controlId="formBasicEmail2">
      <Form.Label className="text-small">Email address</Form.Label>
      <div className="input-group">
        <span className="input-group-text bg-light">
          <FontAwesomeIcon icon={faEnvelope} className="text-gray" />
        </span>
        <Form.Control 
          type="email" 
          placeholder="Enter email"
          value={registerForm.email}
          onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
          required
        />
      </div>
    </Form.Group>

    <Form.Group className="mb-3" controlId="formBasicPassword2">
      <Form.Label className="text-small">Password</Form.Label>
      <div className="input-group">
        <span className="input-group-text bg-light">
          <FontAwesomeIcon icon={faLock} className="text-gray" />
        </span>
        <Form.Control 
          type="password" 
          placeholder="Create password (min. 8 characters)"
          value={registerForm.password}
          onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
          required
          minLength="8"
        />
      </div>
    </Form.Group>

    <Form.Group className="mb-4" controlId="formBasicConfirmPassword">
      <Form.Label className="text-small">Confirm Password</Form.Label>
      <div className="input-group">
        <span className="input-group-text bg-light">
          <FontAwesomeIcon icon={faLock} className="text-gray" />
        </span>
        <Form.Control 
          type="password" 
          placeholder="Confirm password"
          value={registerForm.password_confirmation}
          onChange={(e) => setRegisterForm({...registerForm, password_confirmation: e.target.value})}
          required
        />
      </div>
    </Form.Group>

    <Form.Check 
      type="checkbox" 
      label="I agree to the Terms and Conditions" 
      className="mb-4"
      checked={registerForm.agreeTerms}
      onChange={(e) => setRegisterForm({...registerForm, agreeTerms: e.target.checked})}
      required
    />

    <Button variant="primary" type="submit" className="w-100" disabled={loading}>
      {loading ? 'Creating account...' : (
        <>
          <FontAwesomeIcon icon={faUserPlus} className="me-2" /> Sign Up
        </>
      )}
    </Button>

    <p className="text-center mt-3 mb-0 text-gray small">
      Already have an account?{' '}
      <Card.Link href="#" onClick={(e) => {
        e.preventDefault();
        setAuthTab("signin");
      }} className="text-primary">
        Sign In
      </Card.Link>
    </p>
  </Form>
);

// Forgot Password Form Component (keep as is, but also move outside)
const ForgotPasswordForm = ({ handleBackToSignIn }) => (
  <>
    <div className="mb-3">
      <Card.Link 
        href="#" 
        onClick={(e) => {
          e.preventDefault();
          handleBackToSignIn();
        }} 
        className="text-gray-700 d-inline-flex align-items-center"
      >
        <FontAwesomeIcon icon={faAngleLeft} className="me-2" /> Back to sign in
      </Card.Link>
    </div>
    
    <h3 className="h5 mb-3">Forgot your password?</h3>
    <p className="text-gray small mb-4">Don't fret! Just type in your email and we will send you a code to reset your password!</p>
    
    <Form>
      <Form.Group className="mb-4" controlId="forgotEmail">
        <Form.Label className="text-small">Your Email</Form.Label>
        <div className="input-group">
          <span className="input-group-text bg-light">
            <FontAwesomeIcon icon={faEnvelope} className="text-gray" />
          </span>
          <Form.Control type="email" placeholder="john@company.com" />
        </div>
      </Form.Group>

      <Button variant="primary" className="w-100">
        Recover password
      </Button>

      <p className="text-center mt-4 mb-0 text-gray small">
        Remember your password?{' '}
        <Card.Link href="#" onClick={(e) => {
          e.preventDefault();
          handleBackToSignIn();
        }} className="text-primary">
          Sign In
        </Card.Link>
      </p>
    </Form>
  </>
);

export const AuthModal = ({ show, onHide, initialTab = "signin" }) => {
  const [authTab, setAuthTab] = useState(initialTab);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { login, register, loading, error } = useAuth();

  // Form states
  const [loginForm, setLoginForm] = useState({ email: '', password: '', remember: false });
  const [registerForm, setRegisterForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirmation: '',
    agreeTerms: false
  });

  useEffect(() => {
    if (show) {
      setAuthTab(initialTab);
      setShowForgotPassword(false);
      // Reset forms
      setLoginForm({ email: '', password: '', remember: false });
      setRegisterForm({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: '',
        agreeTerms: false
      });
    }
  }, [show, initialTab]);

  const handleShowForgotPassword = () => {
    setShowForgotPassword(true);
  };

  const handleBackToSignIn = () => {
    setShowForgotPassword(false);
    setAuthTab("signin");
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const result = await login(loginForm.email, loginForm.password);
    if (result.success) {
      onHide();
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    if (!registerForm.agreeTerms) {
      alert('Please agree to the Terms and Conditions');
      return;
    }

    if (registerForm.password !== registerForm.password_confirmation) {
      alert('Passwords do not match');
      return;
    }

    const result = await register({
      first_name: registerForm.first_name,
      last_name: registerForm.last_name,
      email: registerForm.email,
      password: registerForm.password,
      password_confirmation: registerForm.password_confirmation,
      role: 'affiliate'
    });

    if (result.success) {
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="md">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="h5">
          {showForgotPassword ? "Reset Password" : (authTab === "signin" ? "Welcome Back!" : "Create Account")}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4 pb-4">
        {showForgotPassword ? (
          <ForgotPasswordForm handleBackToSignIn={handleBackToSignIn} />
        ) : (
          <Tabs activeKey={authTab} onSelect={(k) => setAuthTab(k)} className="mb-4 nav-justified">
            <Tab eventKey="signin" title="Sign In" tabClassName="fw-bold">
              <SignInForm 
                loginForm={loginForm}
                setLoginForm={setLoginForm}
                handleLoginSubmit={handleLoginSubmit}
                loading={loading}
                error={error}
                setAuthTab={setAuthTab}
                handleShowForgotPassword={handleShowForgotPassword}
              />
            </Tab>
            
            <Tab eventKey="signup" title="Sign Up" tabClassName="fw-bold">
              <SignUpForm 
                registerForm={registerForm}
                setRegisterForm={setRegisterForm}
                handleRegisterSubmit={handleRegisterSubmit}
                loading={loading}
                error={error}
                setAuthTab={setAuthTab}
              />
            </Tab>
          </Tabs>
        )}
      </Modal.Body>
    </Modal>
  );
};
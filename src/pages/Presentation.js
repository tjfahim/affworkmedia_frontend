import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt, faUsers, faChartLine, faBullseye, faGlobe, faHandshake, faUserPlus, faSignInAlt, faEnvelope, faLock, faUser } from "@fortawesome/free-solid-svg-icons";
import { faBootstrap, faReact, faSass } from "@fortawesome/free-brands-svg-icons";
import { Col, Row, Card, Image, Button, Container, Tooltip, OverlayTrigger, Form, Navbar, Nav, Modal, Tab, Tabs } from '@themesberg/react-bootstrap';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import { Routes } from "../routes";
import ThemesbergLogo from "../assets/img/themesberg-logo.svg";
import ReactHero from "../assets/img/technologies/react-hero-logo.svg";

export default () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState("signin");

  const handleShowAuth = (tab) => {
    setAuthTab(tab);
    setShowAuthModal(true);
  };

  const StatCard = (props) => {
    const { value, label, icon } = props;

    return (
      <Col xs={6} lg={3} className="mb-4">
        <Card className="bg-white shadow-soft text-primary rounded border-0">
          <div className="px-3 px-lg-4 py-4 text-center">
            <span className="icon icon-lg mb-3 text-secondary">
              <FontAwesomeIcon icon={icon} />
            </span>
            <h2 className="fw-bold text-primary mb-2">{value}</h2>
            <p className="text-gray mb-0">{label}</p>
          </div>
        </Card>
      </Col>
    );
  };

  const FeatureCard = (props) => {
    const { title, description, icon } = props;

    return (
      <Col md={4} className="mb-4">
        <Card className="bg-white shadow-soft border-light h-100">
          <div className="p-4">
            <div className="icon icon-shape icon-md bg-primary text-white rounded-circle mb-4">
              <FontAwesomeIcon icon={icon} />
            </div>
            <h5 className="fw-bold">{title}</h5>
            <p className="text-gray mb-0">{description}</p>
          </div>
        </Card>
      </Col>
    );
  };

  // Authentication Modal Component
  const AuthModal = () => (
    <Modal show={showAuthModal} onHide={() => setShowAuthModal(false)} centered size="md">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="h5">
          {authTab === "signin" ? "Welcome Back!" : "Create Account"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4 pb-4">
        <Tabs activeKey={authTab} onSelect={(k) => setAuthTab(k)} className="mb-4 nav-justified">
          <Tab eventKey="signin" title="Sign In" tabClassName="fw-bold">
            <Form className="mt-3">
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label className="text-small">Email address</Form.Label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <FontAwesomeIcon icon={faEnvelope} className="text-gray" />
                  </span>
                  <Form.Control type="email" placeholder="Enter email" />
                </div>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label className="text-small">Password</Form.Label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <FontAwesomeIcon icon={faLock} className="text-gray" />
                  </span>
                  <Form.Control type="password" placeholder="Password" />
                </div>
              </Form.Group>

              <div className="d-flex justify-content-between align-items-center mb-4">
                <Form.Check type="checkbox" label="Remember me" />
                <Card.Link href="#" className="text-primary small">Forgot password?</Card.Link>
              </div>

              <Button variant="primary" className="w-100" as={Link} to={Routes.Signin.path}>
                <FontAwesomeIcon icon={faSignInAlt} className="me-2" /> Sign In
              </Button>

              <p className="text-center mt-3 mb-0 text-gray small">
                Don't have an account?{' '}
                <Card.Link href="#" onClick={() => setAuthTab("signup")} className="text-primary">
                  Sign Up
                </Card.Link>
              </p>
            </Form>
          </Tab>
          
          <Tab eventKey="signup" title="Sign Up" tabClassName="fw-bold">
            <Form className="mt-3">
              <Form.Group className="mb-3" controlId="formBasicName">
                <Form.Label className="text-small">Full Name</Form.Label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <FontAwesomeIcon icon={faUser} className="text-gray" />
                  </span>
                  <Form.Control type="text" placeholder="Enter full name" />
                </div>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicEmail2">
                <Form.Label className="text-small">Email address</Form.Label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <FontAwesomeIcon icon={faEnvelope} className="text-gray" />
                  </span>
                  <Form.Control type="email" placeholder="Enter email" />
                </div>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword2">
                <Form.Label className="text-small">Password</Form.Label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <FontAwesomeIcon icon={faLock} className="text-gray" />
                  </span>
                  <Form.Control type="password" placeholder="Create password" />
                </div>
              </Form.Group>

              <Form.Group className="mb-4" controlId="formBasicConfirmPassword">
                <Form.Label className="text-small">Confirm Password</Form.Label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <FontAwesomeIcon icon={faLock} className="text-gray" />
                  </span>
                  <Form.Control type="password" placeholder="Confirm password" />
                </div>
              </Form.Group>

              <Form.Check 
                type="checkbox" 
                label="I agree to the Terms and Conditions" 
                className="mb-4"
              />

              <Button variant="primary" className="w-100" as={Link} to={Routes.Signup.path}>
                <FontAwesomeIcon icon={faUserPlus} className="me-2" /> Sign Up
              </Button>

              <p className="text-center mt-3 mb-0 text-gray small">
                Already have an account?{' '}
                <Card.Link href="#" onClick={() => setAuthTab("signin")} className="text-primary">
                  Sign In
                </Card.Link>
              </p>
            </Form>
          </Tab>
        </Tabs>
      </Modal.Body>
    </Modal>
  );

  return (
    <>
      {/* Auth Modal */}
      <AuthModal />

      {/* Navigation */}
      <Navbar variant="dark" expand="lg" bg="dark" className="navbar-transparent navbar-theme-primary sticky-top">
        <Container className="position-relative justify-content-between px-3">
          <Navbar.Brand as={HashLink} to="#home" className="me-lg-3 d-flex align-items-center">
            <span className="ms-2 brand-text fw-bold text-white">Aff Work Media</span>
          </Navbar.Brand>

          <div className="d-flex align-items-center">
            <Navbar.Collapse id="navbar-default-primary">
              <Nav className="navbar-nav-hover align-items-lg-center">
                <Nav.Link as={HashLink} to="#features">Features</Nav.Link>
                <Nav.Link as={HashLink} to="#stats">Stats</Nav.Link>
                <Nav.Link as={HashLink} to="#global">Global</Nav.Link>
              </Nav>
            </Navbar.Collapse>
            <Button 
              variant="outline-white" 
              className="ms-2"
              onClick={() => handleShowAuth("signin")}
            >
              <FontAwesomeIcon icon={faSignInAlt} className="me-1" /> Sign In
            </Button>
            <Button 
              variant="secondary" 
              className="ms-2 text-dark"
              onClick={() => handleShowAuth("signup")}
            >
              <FontAwesomeIcon icon={faUserPlus} className="me-1" /> Sign Up
            </Button>
          </div>
        </Container>
      </Navbar>

      {/* Hero Section */}
      <section className="section-header overflow-hidden pt-5 pt-lg-6 pb-9 pb-lg-12 bg-primary text-white" id="home">
        <Container>
          <Row>
            <Col xs={12} className="text-center">
              <h1 className="fw-bolder text-secondary mb-4">Aff Work Media</h1>
              <p className="text-white fw-light mb-5 h5">Digital solution for Freelancers</p>
              <p className="text-muted mb-5 lead">
                We can help you to Send, Receive, Exchange, Shopping payment, or accept online payment 
                easily on your personal account.
              </p>
              <div className="d-flex align-items-center justify-content-center">
                <Button 
                  variant="secondary" 
                  className="text-dark me-3"
                  onClick={() => handleShowAuth("signup")}
                >
                  Get Started <FontAwesomeIcon icon={faExternalLinkAlt} className="d-none d-sm-inline ms-1" />
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Why Choose Us Section */}
      <div className="section pt-0">
        <Container className="mt-n10 mt-lg-n12 z-2">
          <Row className="justify-content-center text-center mb-5">
            <Col lg={8}>
              <h2 className="fw-bold mb-3">Why Aff Work Media?</h2>
              <p className="lead text-gray">
                affworkmedia shaped the CPA industry developing new technologies and better solutions. 
                Offering the best platform and tools for CPA affiliates.
              </p>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Stats Section */}
      <section className="section section-md bg-soft" id="stats">
        <Container>
          <Row className="justify-content-center text-center mb-5">
            <Col lg={8}>
              <h2 className="fw-bold mb-3">Last Month on Aff Work Media</h2>
            </Col>
          </Row>
          
          <Row className="justify-content-center">
            <StatCard value="250" label="Team" icon={faUsers} />
            <StatCard value="3,000" label="Offers" icon={faBullseye} />
            <StatCard value="5,000 M" label="Hits" icon={faChartLine} />
            <StatCard value="10,000 K" label="Qualified leads" icon={faHandshake} />
          </Row>
        </Container>
      </section>

      {/* Global Network Section */}
      <section className="section section-md" id="global">
        <Container>
          <Row className="justify-content-between align-items-center">
            <Col lg={5} className="mb-5 mb-lg-0">
              <h2 className="fw-bold mb-4">Global Next Gen Affiliate Network</h2>
              <p className="mb-4 lead">
                With offices and experienced teams in several strategic cities as well as business 
                relationships all around the world.
              </p>
              <p className="text-gray mb-4">
                affworkmedia empowers Advertisers and Publishers to effectively develop their business 
                worldwide. We provide them with all the needed capabilities, resources and tools to 
                evolve, and this, by collaborating with one single and effective self-serve platform 
                focused on performance.
              </p>
              <Button 
                variant="primary" 
                onClick={() => handleShowAuth("signup")}
              >
                Join Our Network <FontAwesomeIcon icon={faExternalLinkAlt} className="ms-1" />
              </Button>
            </Col>
            <Col lg={6}>
              <Card className="border-0 shadow-soft">
                <Card.Body className="p-4">
                  <div className="icon icon-shape icon-lg bg-primary text-white rounded-circle mb-4 mx-auto">
                    <FontAwesomeIcon icon={faGlobe} />
                  </div>
                  <h5 className="text-center">Global Presence</h5>
                  <p className="text-gray text-center mb-0">
                    Strategic locations worldwide to serve you better
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="section section-md bg-soft" id="features">
        <Container>
          <Row className="justify-content-center text-center mb-5">
            <Col lg={8}>
              <h2 className="fw-bold mb-3">Powerful Features for Affiliates</h2>
              <p className="lead text-gray">
                Everything you need to succeed in the affiliate marketing industry
              </p>
            </Col>
          </Row>
          
          <Row>
            <FeatureCard 
              icon={faChartLine}
              title="Real-time Analytics"
              description="Track your performance with detailed real-time analytics and reporting tools."
            />
            <FeatureCard 
              icon={faHandshake}
              title="Smart Matching"
              description="Get matched with the best offers for your audience and maximize conversions."
            />
            <FeatureCard 
              icon={faGlobe}
              title="Global Payments"
              description="Receive payments easily in your local currency with multiple payout options."
            />
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="section section-md bg-primary text-white">
        <Container className="text-center">
          <h2 className="fw-bold mb-4">Ready to Grow Your Affiliate Business?</h2>
          <p className="lead mb-5">
            Join thousands of successful affiliates on the Aff Work Media platform
          </p>
          <Button 
            variant="secondary" 
            size="lg" 
            className="text-dark"
            onClick={() => handleShowAuth("signup")}
          >
            <FontAwesomeIcon icon={faUserPlus} className="me-2" /> Create Free Account
          </Button>
        </Container>
      </section>

      {/* Footer */}
      <footer className="footer py-6 bg-dark text-white">
        <Container>
          <Row>
            <Col md={4}>
              <Navbar.Brand as={HashLink} to="#home" className="me-lg-3 mb-3 d-flex align-items-center">
                <span className="brand-text fw-bold">Aff Work Media</span>
              </Navbar.Brand>
              <p>Digital solution for Freelancers. Empowering affiliates worldwide with cutting-edge technology and tools.</p>
            </Col>
            <Col xs={6} md={2} className="mb-5 mb-lg-0">
              <span className="h5">Company</span>
              <ul className="links-vertical mt-2">
                <li><Card.Link href="#">About Us</Card.Link></li>
                <li><Card.Link href="#">Careers</Card.Link></li>
                <li><Card.Link href="#">Blog</Card.Link></li>
                <li><Card.Link href="#">Contact</Card.Link></li>
              </ul>
            </Col>
            <Col xs={6} md={2} className="mb-5 mb-lg-0">
              <span className="h5">Resources</span>
              <ul className="links-vertical mt-2">
                <li><Card.Link href="#">Documentation</Card.Link></li>
                <li><Card.Link href="#">API</Card.Link></li>
                <li><Card.Link href="#">Support</Card.Link></li>
                <li><Card.Link href="#">FAQs</Card.Link></li>
              </ul>
            </Col>
            <Col xs={12} md={4} className="mb-5 mb-lg-0">
              <span className="h5 mb-3 d-block">Stay Updated</span>
              <form action="#">
                <div className="form-row mb-2">
                  <div className="col-12">
                    <input type="email" className="form-control mb-2" placeholder="Enter your email" required />
                  </div>
                  <div className="col-12">
                    <Button type="submit" variant="secondary" className="text-dark w-100">
                      Subscribe
                    </Button>
                  </div>
                </div>
              </form>
              <p className="text-muted font-small m-0">Get the latest news and updates</p>
            </Col>
          </Row>
          <hr className="bg-gray my-5" />
          <Row>
            <Col className="text-center">
              <p className="font-small mb-0">
                Copyright © {new Date().getFullYear()} Aff Work Media. All rights reserved.
              </p>
            </Col>
          </Row>
        </Container>
      </footer>
    </>
  );
};
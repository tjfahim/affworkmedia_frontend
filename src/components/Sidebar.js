// components/Sidebar.js (Fixed version)
import React, { useState } from "react";
import SimpleBar from 'simplebar-react';
import { useLocation } from "react-router-dom";
import { CSSTransition } from 'react-transition-group';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartPie, faCog, faHandHoldingUsd, faSignOutAlt, faTimes, 
  faUsers,faUserTie,faCalendarAlt, faUserCog,faLandmark,faGlobe, faUserTag, faUserPlus
} from "@fortawesome/free-solid-svg-icons";
import { Nav, Badge, Image, Button, Navbar } from '@themesberg/react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";

import { Routes } from "../routes";
import ReactHero from "../assets/img/technologies/react-hero-logo.svg";
import ProfilePicture from "../assets/img/team/icon-7797704_640.png";

export default (props = {}) => {
  const location = useLocation();
  const { pathname } = location;
  const [show, setShow] = useState(false);
  const { user, hasPermission, hasRole, logout } = useAuth();

  const showClass = show ? "show" : "";

  const onCollapse = () => setShow(!show);

  const NavItem = (props) => {
    const { title, link, external, target, icon, image, badgeText, badgeBg = "secondary", badgeColor = "primary" } = props;
    const classNames = badgeText ? "d-flex justify-content-start align-items-center justify-content-between" : "";
    const navItemClassName = link === pathname ? "active" : "";
    const linkProps = external ? { href: link } : { as: Link, to: link };

    return (
      <Nav.Item className={navItemClassName} onClick={() => setShow(false)}>
        <Nav.Link {...linkProps} target={target} className={classNames}>
          <span>
            {icon ? <span className="sidebar-icon"><FontAwesomeIcon icon={icon} /> </span> : null}
            {image ? <Image src={image} width={20} height={20} className="sidebar-icon svg-icon" /> : null}
            <span className="sidebar-text">{title}</span>
          </span>
          {badgeText ? (
            <Badge pill bg={badgeBg} text={badgeColor} className="badge-md notification-count ms-2">{badgeText}</Badge>
          ) : null}
        </Nav.Link>
      </Nav.Item>
    );
  };


  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <>
      <Navbar expand={false} collapseOnSelect variant="dark" className="navbar-theme-primary px-4 d-md-none">
        <Navbar.Brand className="me-lg-5" as={Link} to={Routes.DashboardOverview.path}>
          <Image src={ReactHero} className="navbar-brand-light" />
        </Navbar.Brand>
        <Navbar.Toggle as={Button} aria-controls="main-navbar" onClick={onCollapse}>
          <span className="navbar-toggler-icon" />
        </Navbar.Toggle>
      </Navbar>
      
      <CSSTransition timeout={300} in={show} classNames="sidebar-transition">
        <SimpleBar className={`collapse ${showClass} sidebar d-md-block bg-primary text-white`}>
          <div className="sidebar-inner px-4 pt-3">
            <div className="user-card d-flex d-md-none align-items-center justify-content-between justify-content-md-center pb-4">
              <div className="d-flex align-items-center">
                <div className="user-avatar lg-avatar me-4">
                  <Image src={ProfilePicture} className="card-img-top rounded-circle border-white" />
                </div>
                <div className="d-block">
                  <h6>Hi, {user?.first_name || user?.name || 'User'}</h6>
                  <Button variant="secondary" size="xs" onClick={handleLogout} className="text-dark">
                    <FontAwesomeIcon icon={faSignOutAlt} className="me-2" /> Sign Out
                  </Button>
                </div>
              </div>
              <Nav.Link className="collapse-close d-md-none" onClick={onCollapse}>
                <FontAwesomeIcon icon={faTimes} />
              </Nav.Link>
            </div>
            
            <Nav className="flex-column pt-3 pt-md-0">
              <NavItem title="Dashboard" link={Routes.DashboardOverview.path} icon={faChartPie} />
              
              {(hasPermission('view users')) && (
                <>
                  <NavItem title="All Users" link="/admin/users" icon={faUserTag} />
                  
                  {hasRole('super-admin') && (
                    <>
                      <NavItem title="Roles" link="/admin/roles" icon={faUserCog} />
                      <NavItem title="Teams" link="/admin/teams" icon={faUsers} />
                      <NavItem title="Games" link="/admin/games" icon={faUserTie} />
                      <NavItem title="Events" link="/admin/events" icon={faCalendarAlt} />
                      <NavItem title="Landings" link="/admin/landings" icon={faLandmark} />
                      <NavItem title="Domain Redirects" link="/admin/domain-redirects" icon={faGlobe} />
                      <NavItem title="Affiliates" link="/admin/affiliates" icon={faUserPlus} />

                      <NavItem title="Make Payment" link="/admin/make-payment" icon={faHandHoldingUsd} />
                      <NavItem title="Payment History" link="/admin/payment-history" icon={faHandHoldingUsd} />
                      <NavItem title="Settings" link="/admin/settings" icon={faCog} />

                    </>
                  )}
                </>
              )}

              {hasRole('affiliate') && (
                    <>
                        <NavItem
                            title="My Payments"
                            link={Routes.Affiliate.MyPayments.path}
                            icon={faHandHoldingUsd}
                        />
                        <NavItem
                            title="My Accounts"
                            link={Routes.Affiliate.MyAccounts.path}
                            icon={faUserCog}
                        />
                    </>
                )}
            </Nav>
          </div>
        </SimpleBar>
      </CSSTransition>
    </>
  );
};
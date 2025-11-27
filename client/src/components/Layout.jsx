import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { STRINGS } from '../constants/strings';

const Layout = ({ children }) => {
  const { currentUser } = useAuth();

  return (
    <div className="app-layout">
      <header className="retro-header">
        <Link to="/" className="logo" style={{ textDecoration: 'none' }}>{STRINGS.APP_NAME}</Link>
        <nav>
          {/* <Link to="/ui-components" className="nav-link">Design System</Link> */}
          {currentUser && <Link to="/dashboard" className="nav-link">{STRINGS.NAVIGATION.DASHBOARD}</Link>}
          {currentUser ? (
            <Link to="/profile" className="nav-link">{STRINGS.NAVIGATION.PROFILE}</Link>
          ) : (
            <Link to="/login" className="nav-link">{STRINGS.NAVIGATION.LOGIN}</Link>
          )}
        </nav>
      </header>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;

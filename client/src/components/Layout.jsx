import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout = ({ children }) => {
  const { currentUser } = useAuth();

  return (
    <div className="app-layout">
      <header className="retro-header">
        <Link to="/" className="logo" style={{ textDecoration: 'none' }}>LinguaLearn</Link>
        <nav>
          {/* <Link to="/ui-components" className="nav-link">Design System</Link> */}
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          {currentUser ? (
            <Link to="/profile" className="nav-link">Profile</Link>
          ) : (
            <Link to="/login" className="nav-link">Login</Link>
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

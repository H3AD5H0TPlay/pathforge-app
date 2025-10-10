import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Navigation.css';

const Navigation = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <h1>PathForge</h1>
        <span className="nav-subtitle">Job Application Tracker</span>
      </div>
      
      <div className="nav-user">
        <div className="user-info">
          <span className="user-icon">👤</span>
          <span className="user-name">{user?.name || 'User'}</span>
        </div>
        
        <button 
          onClick={handleLogout}
          className="logout-btn"
          title="Logout"
        >
          <span className="logout-icon">🚪</span>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
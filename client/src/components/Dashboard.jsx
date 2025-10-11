import React, { useEffect } from 'react';
import Navigation from './Navigation';
import Board from './Board';
import { performanceLogger, routeLogger } from '../utils/logger';
import './Dashboard.css';

const Dashboard = () => {
  // Log page load
  useEffect(() => {
    const startTime = performance.now();
    performanceLogger.pageLoadStart('Dashboard');
    routeLogger.publicRouteAccess('/dashboard');
    
    return () => {
      const loadTime = performance.now() - startTime;
      performanceLogger.pageLoadComplete('Dashboard', loadTime);
    };
  }, []);

  return (
    <div className="dashboard">
      <Navigation />
      <main className="dashboard-main">
        <Board />
      </main>
    </div>
  );
};

export default Dashboard;
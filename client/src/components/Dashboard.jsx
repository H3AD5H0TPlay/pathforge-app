import React from 'react';
import Navigation from './Navigation';
import Board from './Board';
import './Dashboard.css';

const Dashboard = () => {
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
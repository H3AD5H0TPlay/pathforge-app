import React from 'react';

const TestBoard = () => {
  return (
    <div style={{ 
      width: '100%', 
      height: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white'
    }}>
      <h1>PathForge Test</h1>
      <p>If you can see this, React is working!</p>
      <div style={{ marginTop: '20px' }}>
        <button onClick={() => alert('Button works!')}>
          Test Button
        </button>
      </div>
    </div>
  );
};

export default TestBoard;
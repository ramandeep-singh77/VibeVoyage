import { useState } from 'react';

const Minimal = () => {
  const [count, setCount] = useState(0);
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      background: '#f5f5f5'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        <h1 style={{ color: '#22c55e', marginBottom: '20px' }}>
          🎉 React App is Working!
        </h1>
        
        <p style={{ color: '#666', marginBottom: '20px' }}>
          ✅ React components loading<br/>
          ✅ State management working<br/>
          ✅ Event handlers working<br/>
          ✅ Vercel deployment successful
        </p>

        <div style={{ marginBottom: '20px' }}>
          <button 
            onClick={() => setCount(count + 1)}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              margin: '5px'
            }}
          >
            Count: {count}
          </button>
        </div>

        <div style={{ fontSize: '12px', color: '#999' }}>
          <div>Environment: {import.meta.env.MODE}</div>
          <div>API URL: {import.meta.env.VITE_API_URL || 'Not set'}</div>
          <div>Timestamp: {new Date().toISOString()}</div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <button 
            onClick={() => window.location.href = '/'}
            style={{
              background: '#10b981',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              margin: '5px'
            }}
          >
            Go to Main App
          </button>
          
          <button 
            onClick={() => window.location.href = '/test'}
            style={{
              background: '#f59e0b',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              margin: '5px'
            }}
          >
            Go to Test Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default Minimal;
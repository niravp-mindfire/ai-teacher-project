import React from 'react';
import ReactDOM from 'react-dom/client';  // Notice the import from 'react-dom/client'
import App from './App';

// Create a root for concurrent rendering
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);

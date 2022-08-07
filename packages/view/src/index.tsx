import React from 'react';
import * as ReactDOM from 'react-dom';
import './index.css';
import App from './App';

declare global {
  interface Window {
    acquireVsCodeApi(): any;
  }
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

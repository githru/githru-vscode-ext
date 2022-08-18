import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

declare global {
  interface Window {
    acquireVsCodeApi(): any;
  }
}

const container = document.getElementById("root") as HTMLElement;

ReactDOM.createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

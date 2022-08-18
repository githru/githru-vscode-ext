import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

declare global {
  interface Window {
    acquireVsCodeApi(): unknown;
  }
}

const container = document.getElementById("root") as HTMLElement;

ReactDOM.createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

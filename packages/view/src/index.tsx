import React from "react";
import ReactDOM from "react-dom/client";

import type { ClusterNode } from "types";

import App from "./App";
import "styles/app.scss";

declare global {
  interface Window {
    acquireVsCodeApi(): unknown;
    githruData: ClusterNode[];
    isProduction: boolean;
  }
}

const container = document.getElementById("root") as HTMLElement;

ReactDOM.createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

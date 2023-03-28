import React from "react";
import ReactDOM from "react-dom/client";

import { GlobalDataProvider } from "hooks";

import App from "./App";

import "styles/app.scss";

const container = document.getElementById("root") as HTMLElement;
console.log("isProduction = ", window.isProduction);

ReactDOM.createRoot(container).render(
  <React.StrictMode>
    <GlobalDataProvider>
      <App />
    </GlobalDataProvider>
  </React.StrictMode>
);

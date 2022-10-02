import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "styles/app.scss";
import { GlobalDataProvider } from "./hooks/useGlobalData";

const container = document.getElementById("root") as HTMLElement;

ReactDOM.createRoot(container).render(
  <React.StrictMode>
    <GlobalDataProvider>
      <App />
    </GlobalDataProvider>
  </React.StrictMode>
);

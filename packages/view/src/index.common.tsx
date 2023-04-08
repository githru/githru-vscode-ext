import React from "react";
import ReactDOM from "react-dom/client";

import { GlobalDataProvider } from "hooks";

import App from "./App";

export const initRender = () => {
  const rootContainer = document.getElementById("root") as HTMLElement;

  ReactDOM.createRoot(rootContainer).render(
    <React.StrictMode>
      <GlobalDataProvider>
        <App />
      </GlobalDataProvider>
    </React.StrictMode>
  );
};

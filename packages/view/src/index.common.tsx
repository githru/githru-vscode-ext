import ReactDOM from "react-dom/client";

import { GlobalDataProvider } from "hooks";

import "./App.scss";
import App from "./App";

export const initRender = () => {
  const rootContainer = document.getElementById("root") as HTMLElement;

  // TODO - StrictMode disabled temporarily to review performance of visualization.
  ReactDOM.createRoot(rootContainer).render(
    // <React.StrictMode>
    <GlobalDataProvider>
      <App />
    </GlobalDataProvider>
    // </React.StrictMode>
  );
};

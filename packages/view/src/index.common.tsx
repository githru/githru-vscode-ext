import ReactDOM from "react-dom/client";

import "./App.scss";
import { GlobalDataProvider } from "./context/GlobalDataProvider";
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

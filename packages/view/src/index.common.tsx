import ReactDOM from "react-dom/client";

import "./App.scss";

import App from "./App";

export const initRender = () => {
  const rootContainer = document.getElementById("root") as HTMLElement;

  // TODO - StrictMode disabled temporarily to review performance of visualization.
  ReactDOM.createRoot(rootContainer).render(
    // <React.StrictMode>
    <App />
    // </React.StrictMode>
  );
};

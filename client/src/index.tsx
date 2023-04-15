import ReactDOM from "react-dom/client";
import "./index.css";
import { App } from "./App";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  // Strict mode commented out to prevent double rendering of components during development (save API calls)
  // <React.StrictMode>
  <App />
  // </React.StrictMode>
);

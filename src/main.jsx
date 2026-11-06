import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles/base.css";
import "./styles/home.css";
import "./styles/quote.css";
import "./styles/results.css";
import "./styles/next.css";

createRoot(document.getElementById("root")).render(<StrictMode><App /></StrictMode>);

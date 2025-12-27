import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./index.css";
import { ThemeProvider } from "./shared/contexts/ThemeContext";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);

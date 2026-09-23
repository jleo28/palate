import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ProfileProvider } from "./context/ProfileContext";
import { DemoProvider } from "./context/DemoContext";
import "./styles/global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ProfileProvider>
        <DemoProvider>
          <App />
        </DemoProvider>
      </ProfileProvider>
    </BrowserRouter>
  </StrictMode>
);

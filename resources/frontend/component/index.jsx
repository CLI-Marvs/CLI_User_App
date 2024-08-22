import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ContextProvider } from "../context/contextprovider";


const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
     <ContextProvider>
        <App />
      </ContextProvider>
    </React.StrictMode>,
  );
}

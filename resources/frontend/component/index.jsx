import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ContextProvider } from "../context/contextprovider";
import PriceBasicDetailsFormDataProvider from "../context/PriceBasicDetail/PriceBasicContext";
import FloorPremiumFormDataProvider from "../context/FloorPremium/FloorPremiumContext";
const rootElement = document.getElementById("root");

if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <ContextProvider>
                <PriceBasicDetailsFormDataProvider>
                    <FloorPremiumFormDataProvider>
                        <App />
                    </FloorPremiumFormDataProvider>
                </PriceBasicDetailsFormDataProvider>
            </ContextProvider>
        </React.StrictMode>
    );
}

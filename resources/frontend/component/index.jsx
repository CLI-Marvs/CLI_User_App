import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ContextProvider } from "../context/contextprovider";
import PriceListSettingFormDataProvider from "../context/BasicPricing/PriceListSettingsContext";
import FloorPremiumFormDataProvider from "../context/FloorPremium/FloorPremiumContext";
const rootElement = document.getElementById("root");

if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <ContextProvider>
                <PriceListSettingFormDataProvider>
                    <FloorPremiumFormDataProvider>
                        <App />
                    </FloorPremiumFormDataProvider>
                </PriceListSettingFormDataProvider>
            </ContextProvider>
        </React.StrictMode>
    );
}

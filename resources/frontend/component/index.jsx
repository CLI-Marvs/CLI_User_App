import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ContextProvider } from "../context/contextprovider";
import PriceBasicDetailsFormDataProvider from "../context/PriceBasicDetail/PriceBasicContext";
import FloorPremiumFormDataProvider from "../context/FloorPremium/FloorPremiumContext";
import { ToastContainer } from "react-toastify";

import PaymentSchemeFormDataProvider from "../context/PaymentScheme/PaymentSchemeContext";
const rootElement = document.getElementById("root");

if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <ContextProvider>
                <ToastContainer />
                <App />
                {/* <PriceBasicDetailsFormDataProvider>
                    <FloorPremiumFormDataProvider>
                        <PaymentSchemeFormDataProvider>
                            <App />
                        </PaymentSchemeFormDataProvider>
                    </FloorPremiumFormDataProvider>
                </PriceBasicDetailsFormDataProvider> */}
            </ContextProvider>
        </React.StrictMode>
    );
}

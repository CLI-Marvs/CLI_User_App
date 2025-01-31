import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ContextProvider } from "../context/contextprovider";
import { ToastContainer } from "react-toastify";
const rootElement = document.getElementById("root");
import { PropertyPricingProvider } from '@/context/PropertyPricing/PropertyPricingContext';

if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <ContextProvider>
                <PropertyPricingProvider>
                    <ToastContainer />
                    <App />
                </PropertyPricingProvider>
            </ContextProvider>
        </React.StrictMode>

    );
}

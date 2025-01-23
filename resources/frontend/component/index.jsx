import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ContextProvider } from "../context/contextprovider";
import { ToastContainer } from "react-toastify";
import { RoleManagementProvider } from '@/context/RoleManagement/RoleManagementContext';
import { PropertyPricingProvider } from '@/context/PropertyPricing/PropertyPricingContext';

const rootElement = document.getElementById("root");

if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <ContextProvider>
                <PropertyPricingProvider>
                    <RoleManagementProvider>
                        <ToastContainer />
                        <App />
                    </RoleManagementProvider>
                </PropertyPricingProvider>
            </ContextProvider>
        </React.StrictMode>
    );
}

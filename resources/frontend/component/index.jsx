import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ContextProvider } from "../context/contextprovider";
import { ToastContainer } from "react-toastify";
import { RoleManagementProvider } from "@/context/RoleManagement/RoleManagementContext";
import { PropertyPricingProvider } from "@/context/PropertyPricing/PropertyPricingContext";
import { TransactionProvider } from "@/context/Transaction/TransactionContext";

const rootElement = document.getElementById("root");

if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <ContextProvider>
                <PropertyPricingProvider>
                    <RoleManagementProvider>
                        <TransactionProvider>
                            <ToastContainer />
                            <App />
                        </TransactionProvider>
                    </RoleManagementProvider>
                </PropertyPricingProvider>
            </ContextProvider>
        </React.StrictMode>
    );
}

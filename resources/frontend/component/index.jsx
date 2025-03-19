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
            <ContextProvider>
                <PropertyPricingProvider>
                    <RoleManagementProvider>
                        <TransactionProvider>
                            <ToastContainer
                                position="top-right"
                                style={{ zIndex: 9999, position: "fixed" }}
                                // containerStyle={{
                                //     zIndex: "10000  !important",
                                // }}
                                // toastOptions={{
                                //     className: "react-hot-toast",
                                //     style: {
                                //         zIndex: "10000  !important",
                                //     },
                                // }}
                            />
                            <App />
                        </TransactionProvider>
                    </RoleManagementProvider>
                </PropertyPricingProvider>
            </ContextProvider>
    );
}

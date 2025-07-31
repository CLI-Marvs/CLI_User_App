import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ContextProvider } from "../context/contextprovider";
import { DocumentManagementProvider } from "../context/DocumentManagement/DocumentManagementContext";
import { ToastContainer } from "react-toastify";
import { SurveyProvider } from "../context/Survey/SurveyContext";
import { RoleManagementProvider } from "@/context/RoleManagement/RoleManagementContext";
import { PropertyPricingProvider } from "@/context/PropertyPricing/PropertyPricingContext";
import { TransactionProvider } from "@/context/Transaction/TransactionContext";
import { WalkinSelectionProvider } from "@/context/InquiryManagement/WalkinSelectionContext";
import { WalkinReportFilterProvider } from "@/context/InquiryManagement/WalkinReportFilterProvider";

import ErrorBoundary from "@/component/ErrorElement/ErrorBoundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const rootElement = document.getElementById("root");
const queryClient = new QueryClient();

if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        /*  <React.StrictMode> */
        <QueryClientProvider client={queryClient}>
            <DocumentManagementProvider>
            <ContextProvider>
                <WalkinSelectionProvider>
                    <WalkinReportFilterProvider>
                        <SurveyProvider>
                            <PropertyPricingProvider>
                                <RoleManagementProvider>
                                    <TransactionProvider>
                                        <ToastContainer
                                            position="top-right"
                                            style={{
                                                zIndex: 9999,
                                                position: "fixed",
                                            }}
                                        />
                                        <ErrorBoundary>
                                            <App />
                                        </ErrorBoundary>
                                    </TransactionProvider>
                                </RoleManagementProvider>
                            </PropertyPricingProvider>
                        </SurveyProvider>
                    </WalkinReportFilterProvider>
                </WalkinSelectionProvider>
            </ContextProvider>
            </DocumentManagementProvider>
        </QueryClientProvider>
        /*   </React.StrictMode> */
    );
}

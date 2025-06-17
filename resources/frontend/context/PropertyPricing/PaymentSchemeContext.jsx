import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
} from "react";
import { paymentSchemeService } from "@/component/servicesApi/apiCalls/propertyPricing/paymentScheme/paymentSchemeService";
import usePaginatedFetch from "@/component/layout/propertyandpricingpage/hooks/usePaginatedFetch";

const PaymentSchemeContext = createContext();

export const PaymentSchemeProvider = ({ children }) => {
    // const [paymentScheme, setPaymentScheme] = useState(null);
    // const [isFetchingPaymentScheme, setIsFetchingPaymentScheme] =
    //     useState(false);
    // const [error, setError] = useState(null);
    const {
        data,
        isLoading,
        error,
        pageState,
        setPageState,
        fetchData,
        setAppliedFilters,
        isFirstLoad,
        applySearch,
        refreshPage,
    } = usePaginatedFetch(paymentSchemeService.getPaymentSchemes, {});

    const value = {
        data,
        isLoading,
        error,
        fetchData,
        pageState,
        setPageState,
        setAppliedFilters,
        isFirstLoad,
        applySearch,
        refreshPage,
    };

    return (
        <PaymentSchemeContext.Provider value={value}>
            {children}
        </PaymentSchemeContext.Provider>
    );
};

export const usePaymentScheme = () => {
    const context = useContext(PaymentSchemeContext);
    if (!context) {
        throw new Error(
            "usePaymentScheme must be used within a PaymentSchemeProvider"
        );
    }
    return context;
};

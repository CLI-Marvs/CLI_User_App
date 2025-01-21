import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { paymentSchemeService } from "@/component/servicesApi/apiCalls/propertyPricing/paymentScheme/paymentSchemeService";

const PaymentSchemeContext = createContext();

export const PaymentSchemeProvider = ({ children }) => {
    const [paymentScheme, setPaymentScheme] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // This function does the actual database fetch
    const fetchPaymentSchemes = useCallback(async (forceFetch = false) => {
        if (paymentScheme && !forceFetch) {
            return paymentScheme;
        }

        setIsLoading(true);
        try {
            const response = await paymentSchemeService.getPaymentSchemes();
            setPaymentScheme(response.data);
            setError(null);
            return response.data;
        } catch (error) {
            setError(error.message);
            console.error("Error fetching payment scheme list:", error);
        } finally {
            setIsLoading(false);
        }
    }, [paymentScheme]);


    const value = {
        paymentScheme,
        isLoading,
        error,
        fetchPaymentSchemes
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
        throw new Error('usePaymentScheme must be used within a PaymentSchemeProvider');
    }
    return context;
};
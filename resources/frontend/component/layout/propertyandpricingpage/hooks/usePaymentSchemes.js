import { paymentSchemeService } from "@/component/servicesApi/apiCalls/propertyPricing/paymentScheme/paymentSchemeService";
import React, { useEffect, useState } from "react";

 
export const usePaymentSchemes = () => {
    const [paymentSchemes, setPaymentSchemes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPaymentSchemes = async () => {
        try {
            const response = await paymentSchemeService.getPaymentSchemes();
            setPaymentSchemes(response.data);
            setIsLoading(false);
        } catch (error) {
            setError(error);
            setIsLoading(false);
        }
    };
    useEffect(() => {
        fetchPaymentSchemes();
    }, []);

    return { paymentSchemes, fetchPaymentSchemes };
};

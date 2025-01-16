import { createContext, useContext, useState } from 'react';

const BasicPricingContext = createContext();

export default function BasicPricingProvider({ children }) {
    const [pricingData, setPricingData] = useState({
        priceListSettings: {
            basePrice: "",
            transferCharge: 8 || "",
            effectiveBalconyBase: 50 || "",
            vat: 12 || "",
            vatableLessPrice: 3600000 || "",
            reservationFee: "",
        },
        floorPremiums: {},
        additionalPremiums: {},
        priceVersions: {},
        paymentSchemes: {},
        reviewsAndApproval: {}
    });
 
    const updatePricingSection = (section, newData) => {
        setPricingData(prev => ({
            ...prev,
            [section]: { ...prev[section], ...newData }
        }));
    };

    return (
        <BasicPricingContext.Provider value={{ pricingData, updatePricingSection }}>
            {children}
        </BasicPricingContext.Provider>
    );
};

export const usePricing = () => {
    const context = useContext(BasicPricingContext);
    if (!context) {
        throw new Error('usePricing must be used within a PricingProvider');
    }
    return context;
};
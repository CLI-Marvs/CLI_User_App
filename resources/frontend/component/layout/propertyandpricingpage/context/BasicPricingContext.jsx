import { createContext, useContext, useState } from "react";

const BasicPricingContext = createContext();
export const priceListInitialState = {
    base_price: "",
    transfer_charge: 8 || "",
    effective_balcony_base: 50 || "",
    vat: 12 || "",
    vatable_less_price: 3600000 || "",
    reservation_fee: "",
};

export const priceVersionInitialState = [
    {
        id: 0,
        priority_number: 1,
        name: "",
        percent_increase: 0,
        no_of_allowed_buyers: 0,
        status: "Active",
        expiry_date: "N/A",
        payment_scheme: [],
    },
];

const initialState = () => ({
    priceListSettings: priceListInitialState,
    floorPremiums: {},
    additionalPremiums: [],
    selectedAdditionalPremiums: [],
    priceVersions: priceVersionInitialState,
    reviewsAndApproval: {},
    computedListPrice: [],
    reviewedByEmployees: [],
    approvedByEmployees: [],
});

export const BasicPricingProvider = ({ children }) => {
    const [pricingData, setPricingData] = useState(initialState());

    const updatePricingSection = (section, newData) => {
        setPricingData((prev) => ({
            ...prev,
            [section]: { ...prev[section], ...newData },
        }));
    };

    //Reset the all state
    const resetPricingData = () => {
        setPricingData(initialState());
    };

    return (
        <BasicPricingContext.Provider
            value={{
                pricingData,
                updatePricingSection,
                resetPricingData,
                setPricingData,
            }}
        >
            {children}
        </BasicPricingContext.Provider>
    );
};

export const usePricing = () => {
    const context = useContext(BasicPricingContext);
    if (!context) {
        throw new Error("usePricing must be used within a PricingProvider");
    }
    return context;
};

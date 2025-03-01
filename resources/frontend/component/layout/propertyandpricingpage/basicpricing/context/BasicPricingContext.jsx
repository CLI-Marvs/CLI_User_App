import { createContext, useContext, useState } from "react";
import moment from "moment";
const BasicPricingContext = createContext();

// const additionalPremiums = [
//     {
//         viewName: "Sea View",
//         premiumCost: 0,
//         excludedUnitIds: [],
//     },
//     {
//         viewName: "Mountain View",
//         premiumCost: 0,
//         excludedUnitIds: [],
//     },
//     {
//         viewName: "City View",
//         premiumCost: 0,
//         excludedUnitIds: [],
//     },
//     {
//         viewName: "Amenity View",
//         premiumCost: 0,
//         excludedUnitIds: [],
//     },
// ];
const initialState = () => ({
    priceListSettings: {
        base_price: "",
        transfer_charge: 8 || "",
        effective_balcony_base: 50 || "",
        vat: 12 || "",
        vatable_less_price: 3600000 || "",
        reservation_fee: "",
    },
    floorPremiums: {},
    additionalPremiums: [],
    selectedAdditionalPremiums: [],
    priceVersions: [
        {
            id: 0,
            priority_number: 1,
            name: "",
            percent_increase: "",
            no_of_allowed_buyers: "",
            status: "Active",
            expiry_date: "N/A",
            payment_scheme: [],
        },
    ],
    reviewsAndApproval: {},
    computedListPrice: [],
    reviewedByEmployees: [],
    approvedByEmployees: [],
});
export default function BasicPricingProvider({ children }) {
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
}

export const usePricing = () => {
    const context = useContext(BasicPricingContext);
    if (!context) {
        throw new Error("usePricing must be used within a PricingProvider");
    }
    return context;
};

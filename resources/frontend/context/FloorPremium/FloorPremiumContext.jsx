import React, { createContext, useState, useContext } from "react";
export const FloorPremiumFormDataContext = createContext();
 
const formDataState = {
    floor: [
        {
            premiumCost: "",
            luckyNumber: "",
        },
    ],
};
const FloorPremiumFormDataProvider = ({ children }) => {
    const [floorPremiumFormData, setFloorPremiumFormData] =
        useState(formDataState);

    return (
        <FloorPremiumFormDataContext.Provider
            value={{
                floorPremiumFormData,
                setFloorPremiumFormData,
                formDataState,
            }}
        >
            {children}
        </FloorPremiumFormDataContext.Provider>
    );
};
export default FloorPremiumFormDataProvider;
export const useFloorPremiumStateContext = () =>
    useContext(FloorPremiumFormDataContext);

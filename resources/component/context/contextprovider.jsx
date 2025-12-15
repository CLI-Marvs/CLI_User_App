import React, { createContext, useContext, useMemo, useState } from "react";

// ... other imports

const StateContext = createContext();

export const ContextProvider = ({ children }) => {
    // ... other state and logic

    // Example: masterList state (replace with your actual state logic)
    const [masterList, setMasterList] = useState([]);

    // Memoized Set for contract numbers
    const masterListContracts = useMemo(
        () => new Set(masterList.map((item) => item.contractno)),
        [masterList]
    );

    // Function to check if contract number is in master list
    const isInMasterList = (contractno) => masterListContracts.has(contractno);

    // ... other context values

    return (
        <StateContext.Provider
            value={{
                // ...other values,
                isInMasterList,
                masterList, // if you need to expose this
                // ...other values
            }}
        >
            {children}
        </StateContext.Provider>
    );
};

export const useStateContext = () => useContext(StateContext);

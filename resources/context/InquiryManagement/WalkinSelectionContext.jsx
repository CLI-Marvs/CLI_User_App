import React, { createContext, useContext, useState } from "react";

const WalkinSelectionContext = createContext();

export const WalkinSelectionProvider = ({ children }) => {
    const [selectedBranch, setSelectedBranch] = useState({
        id: "",
        name: "",
        slug: "",
    });
    const [desks, setDesks] = useState([]);
    const [selectedDesk, setSelectedDesk] = useState({ id: "", name: "" });

    return (
        <WalkinSelectionContext.Provider
            value={{
                selectedBranch,
                setSelectedBranch,
                desks,
                setDesks,
                selectedDesk,
                setSelectedDesk,
            }}
        >
            {children}
        </WalkinSelectionContext.Provider>
    );
};

export const useWalkinSelection = () => useContext(WalkinSelectionContext);

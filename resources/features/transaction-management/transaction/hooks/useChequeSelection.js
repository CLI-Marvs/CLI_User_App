import { useState, useEffect } from "react";

export const useChequeSelection = (checkDates, confirmedChecks) => {
    const [selectedChecks, setSelectedChecks] = useState([]);
    const [allSelected, setAllSelected] = useState(false);

    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedChecks([]);
        } else {
            const unconfirmedIndices = checkDates
                .map((_, index) => index)
                .filter((index) => !confirmedChecks.includes(index));
            setSelectedChecks(unconfirmedIndices);
        }
        setAllSelected(!allSelected);
    };

    const updateSelection = (index, checked) => {
        const updated = checked
            ? [...selectedChecks, index]
            : selectedChecks.filter((item) => item !== index);
        setSelectedChecks(updated);
        
        const unconfirmedIndices = checkDates
            .map((_, idx) => idx)
            .filter((idx) => !confirmedChecks.includes(idx));
        setAllSelected(unconfirmedIndices.every((idx) => updated.includes(idx)));
    };

    useEffect(() => {
        setSelectedChecks([]);
        setAllSelected(false);
    }, [checkDates]);

    return {
        selectedChecks,
        setSelectedChecks,
        allSelected,
        toggleSelectAll,
        updateSelection,
    };
};
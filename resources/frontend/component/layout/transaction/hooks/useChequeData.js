import { useState } from "react";

export const useChequeData = () => {
    const [data, setData] = useState({
        payTo: "",
        amount: "",
        total_purchased_amount: "",
        date: "",
        totalChecks: 0,
        totalMonths: "",
        startDate: "",
        checkBaseNo: "",
        checkNos: [],
        contract_number: "",
        payor_name: "",
        bank_name: "",
        entity_id: "",
    });

    const formatWithCommas = (whole, decimal) => {
        const formattedWhole = whole ? Number(whole).toLocaleString() : "";
        return decimal !== undefined
            ? `${formattedWhole}.${decimal}`
            : formattedWhole;
    };

    const handleCheck = (field, value, index = null) => {
        let updatedData = { ...data };
        let cleanedValue = value.replace(/[^0-9.]/g, "");

        const totalAmount = parseFloat(
            field === "total_purchased_amount"
                ? cleanedValue
                : (data.total_purchased_amount || "0").replace(/,/g, "")
        );

        let months;

        if (field === "contract_number") {
            updatedData.contract_number = value.replace(/\D/g, "").slice(0, 13);
        }
        else if (field === "total_purchased_amount" || field === "amount") {
            if (cleanedValue === ".") {
                updatedData[field] = "0.";
            } else {
                let [whole, decimal] = cleanedValue.split(".");
                whole = whole?.slice(0, 7).replace(/^0+(?=\d)/, ""); 
                updatedData[field] = formatWithCommas(whole, decimal);
            }
        }
        else {
            updatedData[field] = cleanedValue;
        }

        if (field === "checkBaseNo") {
            updatedData.checkBaseNo = value;
            updatedData.checkNos = [];
        }

        if (field === "checkNos" && index !== null) {
            const checkNosCopy = [...(data.checkNos || [])];
            checkNosCopy[index] = value;
            updatedData.checkNos = checkNosCopy;
        }

        if (field === "totalMonths") {
            const limitedValue = value.replace(/\D/g, "").slice(0, 3);
            updatedData.totalChecks = limitedValue;
            updatedData.totalMonths = limitedValue;
            // Use the limited value for calculation
            months = parseInt(limitedValue);
        } else {
            months = parseInt(data.totalMonths);
        }

        if (!isNaN(totalAmount) && months && field !== "amount") {
            const monthly = totalAmount / months;
            let [whole, decimal] = monthly.toFixed(2).split(".");
            updatedData.amount = formatWithCommas(whole, decimal);
        }

        setData(updatedData);
    };

    return { data, setData, handleCheck };
};
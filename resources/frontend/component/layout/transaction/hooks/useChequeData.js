import { useState } from "react";

export const useChequeData = () => {
    const [data, setData] = useState({
        payTo: "",
        amount: "",
        total_purchased_amount: "",
        date: "",
        totalChecks: 0,
        totalMonths: 0,
        startDate: "",
        checkBaseNo: "",
        checkNos: [],
        contract_number: "",
        payor_name: "",
        bank_name: "",
    });

    const handleCheck = (field, value, index = null) => {
        let cleanedValue = value.replace(/[^0-9.]/g, "");
        const floatValue = parseFloat(cleanedValue);
        const totalAmount = parseFloat(
            field === "total_purchased_amount"
                ? cleanedValue
                : (data.total_purchased_amount || "0").replace(/,/g, "")
        );
        const months = parseInt(
            field === "totalMonths" ? cleanedValue : data.totalMonths
        );
        let updatedData = { ...data };
        
        const formatNumber = (val) =>
            isNaN(val)
                ? ""
                : new Intl.NumberFormat("en-PH", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                  }).format(val);

        if (field === "total_purchased_amount") {
            updatedData.total_purchased_amount = formatNumber(floatValue);
        } else if (field === "amount") {
            updatedData.amount = formatNumber(floatValue);
        } else {
            updatedData[field] = cleanedValue;
        }

        if (field === "checkBaseNo") {
            updatedData = {
                ...updatedData,
                checkBaseNo: value,
                checkNos: [],
            };
        }

        if (field === "checkNos" && index !== null) {
            const checkNosCopy = [...(data.checkNos || [])];
            checkNosCopy[index] = value;
            updatedData.checkNos = checkNosCopy;
        }

        if (field === "totalMonths") {
            updatedData.totalChecks = cleanedValue;
        }

        if (!isNaN(totalAmount) && months) {
            const monthly = totalAmount / months;
            updatedData.amount = formatNumber(monthly);
        }

        setData(updatedData);
    };

    return { data, setData, handleCheck };
};
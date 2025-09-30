   export const formatAmount = (amountStr, mode = "currency") => {
        if (!amountStr || isNaN(parseFloat(amountStr))) return "";
        const cleanedValue = amountStr.replace(/[^0-9.]/g, "");
        const num = parseFloat(cleanedValue);

        if (mode === "plain") {
            return new Intl.NumberFormat("en-PH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(num);
        }

        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
        }).format(num);
    };
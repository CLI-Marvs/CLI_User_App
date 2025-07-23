// src/utils/formatUtil.js

export const safeParseFloat = (value) => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
};

export const formatCurrency = (value) => {
    if (!value && value !== 0) return "₱0.00";

    const num = safeParseFloat(value);
    return "Php " + num.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

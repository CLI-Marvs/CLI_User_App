import { numberToWords } from "@/features/transaction-management/transaction/utils/formatNumberToWords";

export const convertAmountToWords = (amountStr) => {
    if (!amountStr) return "";
    const cleanedStr = amountStr.replace(/[^0-9.]/g, "");
    const numAmount = parseFloat(cleanedStr);
    if (isNaN(numAmount)) return "";
    const pesos = Math.floor(numAmount);
    const centavos = Math.round((numAmount - pesos) * 100);
    let result = numberToWords(pesos) + " Peso";
    if (pesos !== 1) result += "s";
    if (centavos > 0) {
        result += " and " + numberToWords(centavos) + " Centavo";
        if (centavos !== 1) result += "s";
    }
    return result;
};

export const getValidMonth = (date, count) => {
    const defaultDay = date.getDate();
    const newDate = new Date(date);
    newDate.setDate(1);
    newDate.setMonth(newDate.getMonth() + count);
    const lastDay = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate();
    newDate.setDate(Math.min(defaultDay, lastDay));
    return newDate;
};

export const generateMonthlyDates = (start, count) => {
    const result = [];
    const baseDate = new Date(start);
    for (let i = 0; i < count; i++) {
        const nextDate = getValidMonth(baseDate, i);
        result.push(nextDate);
    }
    return result;
};
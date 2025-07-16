import React, { useEffect, useMemo, useState } from "react";
import ChequeSettings from "./ChequeSettings";
import { showToast } from "@/util/toastUtil";
import { useSaveChecks } from "../hooks/useTransactionQueries";
import Spinner from "@/util/Spinner";

const ChequeStream = () => {
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

    const [selectedChecks, setSelectedChecks] = useState([]);
    const [allSelected, setAllSelected] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isConfirmAll, setIsConfirmAll] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [confirmIndex, setConfirmIndex] = useState(null);
    const [confirmedChecks, setConfirmedChecks] = useState([]);
    const [reprintMode, setReprintMode] = useState(false);
    const [reprintIndex, setReprintIndex] = useState(null);

    const { mutateAsync: storePrintedCheck, isPending: isSavePending } =
        useSaveChecks();

    const numberToWords = (num) => {
        if (num === 0) return "Zero";

        const ones = [
            "",
            "One",
            "Two",
            "Three",
            "Four",
            "Five",
            "Six",
            "Seven",
            "Eight",
            "Nine",
        ];
        const teens = [
            "Ten",
            "Eleven",
            "Twelve",
            "Thirteen",
            "Fourteen",
            "Fifteen",
            "Sixteen",
            "Seventeen",
            "Eighteen",
            "Nineteen",
        ];
        const tens = [
            "",
            "",
            "Twenty",
            "Thirty",
            "Forty",
            "Fifty",
            "Sixty",
            "Seventy",
            "Eighty",
            "Ninety",
        ];
        const thousands = ["", "Thousand", "Million", "Billion"];

        const convertHundreds = (n) => {
            let result = "";

            if (n >= 100) {
                const hundreds = Math.floor(n / 100);
                result += ones[hundreds] + " Hundred";
                n %= 100;
                if (n > 0) result += " ";
            }

            if (n >= 20) {
                result += tens[Math.floor(n / 10)];
                n %= 10;
                if (n > 0) result += "-" + ones[n];
            } else if (n >= 10) {
                result += teens[n - 10];
            } else if (n > 0) {
                result += ones[n];
            }

            return result;
        };

        const convertGroup = (n) => {
            if (n === 0) return "";
            return convertHundreds(n);
        };

        let result = "";
        let groupIndex = 0;

        while (num > 0) {
            const group = num % 1000;
            if (group !== 0) {
                let groupText = convertGroup(group);
                if (groupIndex > 0) {
                    groupText += " " + thousands[groupIndex];
                }
                result = groupText + (result ? " " + result : "");
            }
            num = Math.floor(num / 1000);
            groupIndex++;
        }

        return result;
    };

    const convertAmountToWords = (amountStr) => {
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

    const formatAmount = (amountStr, mode = "currency") => {
        if (!amountStr || isNaN(parseFloat(amountStr))) return "";
        const cleanedValue = amountStr.replace(/[^0-9.]/g, "");
        const num = parseFloat(cleanedValue);

        if (mode === "plain") {
            const hasDecimal = num % 1 !== 0;

            return new Intl.NumberFormat("en-PH", {
                minimumFractionDigits: hasDecimal ? 0 : 2,
                maximumFractionDigits: 2,
            }).format(num);
        }

        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
        }).format(num);
    };

    const formatDate = (dateStr, mode = "text") => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;

        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const year = date.getFullYear();
        const spaceYear = String(year).split("").join("\u200A");

        if (mode === "boxes") return `${month} ${day} ${year}`;
        if (mode === "spaced")
            return `${month}\u00A0\u00A0${day}\u00A0\u00A0${spaceYear}`;
        return `${month}/${day}/${year}`;
    };

    const handlePrintSelected = () => {
        if (selectedChecks.length === 0) {
            showToast("Please select at least one check to print.", "info");
            return;
        }

        resetReprintMode();
        setTimeout(() => {
            window.print();
        }, 100);
    };

    const resetReprintMode = () => {
        setReprintMode(false);
        setReprintIndex(null);
    };

    const handleReprint = (index) => {
        setReprintMode(true);
        setReprintIndex(index);

        setTimeout(() => {
            window.print();
        }, 100);
    };

    console.log("reprintMode", reprintMode);
    console.log("reprintIndex", reprintIndex);

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

    const generateMonthlyDates = (start, count) => {
        const result = [];
        const baseDate = new Date(start);
        for (let i = 0; i < count; i++) {
            const nextDate = new Date(baseDate);
            nextDate.setMonth(baseDate.getMonth() + i);
            result.push(nextDate);
        }
        return result;
    };

    const getCheckNos = (index) => {
        const override = data.checkNos?.[index];
        if (override && override.trim() !== "") return override;

        if (data.checkBaseNo) {
            const padded = String(index + 1).padStart(3, "0");
            return `${data.checkBaseNo}${padded}`;
        }
        return "";
    };

    const confirmCheck = async (index) => {
        setConfirmIndex(index);
        const cleaned = (data.amount || "0").replace(/,/g, "");
        const payload = {
            check_no: getCheckNos(index),
            check_date: checkDates[index]?.toISOString().split("T")[0],
            amount: parseFloat(cleaned),
            payTo: data.payTo,
            payor_name: data.payor_name,
            contract_number: data.contract_number,
            bank_name: data.bank_name,
            status: "active",
        };

        const response = await storePrintedCheck(payload);

        setSelectedChecks(selectedChecks.filter((item) => item !== index));
        setConfirmedChecks((prev) => [...prev, index]);
    };

    const confirmAll = async () => {
        const unconfirmedChecks = selectedChecks.filter(
            (index) => !confirmedChecks.includes(index)
        );

        if (unconfirmedChecks.length === 0) {
            showToast("Please select at least one check to confirm.", "info");
            return;
        }

        const checksArray = unconfirmedChecks.map((index) => {
            const cleaned = (data.amount || "0").replace(/,/g, "");
            return {
                check_no: getCheckNos(index),
                check_date: checkDates[index]?.toISOString().split("T")[0],
                amount: parseFloat(cleaned),
                payTo: data.payTo,
                payor_name: data.payor_name,
                contract_number: data.contract_number,
                bank_name: data.bank_name,
                status: "active",
            };
        });

        try {
            setIsConfirmAll(true);
            const response = await storePrintedCheck({ checks: checksArray });
            if (response.status !== 200) {
                return showToast(
                    "Something went wrong while confirming checks.",
                    "error"
                );
            } else {
                showToast("Checks confirmed successfully.", "success");
                setConfirmedChecks((prev) => [...prev, ...unconfirmedChecks]);
                setSelectedChecks([]);
                setAllSelected(false);
            }
        } catch (error) {
            setIsConfirmAll(false);
            showToast("Something went wrong while confirming checks.", "error");
        } finally {
            setIsConfirmAll(false);
        }
    };

    const checkDates = useMemo(() => {
        if (!data.startDate || data.totalChecks <= 0) return [];
        return generateMonthlyDates(data.startDate, data.totalChecks);
    }, [data.startDate, data.totalChecks]);

    const endDate =
        checkDates.length > 0
            ? checkDates[checkDates.length - 1].toISOString().split("T")[0]
            : "";

    const totalPages = Math.ceil(checkDates.length / rowsPerPage);
    const paginatedCheckDates = checkDates.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const printableChecks = selectedChecks
        .filter((index) => !confirmedChecks.includes(index))
        .sort((a, b) => a - b);

    useEffect(() => {
        setCurrentPage(1);
    }, [checkDates]);

    return (
        <div className="min-h-screen bg-gray-100 p-8 print:p-0 print:bg-white">
            <ChequeSettings
                handleCheck={handleCheck}
                data={data}
                setData={setData}
                endDate={endDate}
                setIsError={setIsError}
            />
            <div
                className="relative bg-white print:shadow-none p-5 print-container"
                style={{
                    position: "relative",
                }}
            >
                {checkDates.map((dateObj, index) => {
                    const isSelected = selectedChecks.includes(index);
                    const shouldPrint = reprintMode
                        ? index === reprintIndex
                        : isSelected && !confirmedChecks.includes(index);
                    const printPosition = reprintMode
                        ? 0
                        : printableChecks.indexOf(index);
                    const isFirstPrintableCheck = printPosition === 0;
                    return (
                        <div
                            key={index}
                            className={`relative bg-white print:shadow-none ${
                                shouldPrint ? "print:block" : "print:hidden"
                            } hidden break-after-page`}
                            style={{
                                margin: "0 auto",
                                position: "relative",
                                marginTop: isFirstPrintableCheck
                                    ? "0in"
                                    : "0.2in",
                            }}
                        >
                            <div
                                className="absolute"
                                style={{
                                    top: "-0.1in",
                                    left: "4.8in",
                                    width: "35%",
                                    textAlign: "right",
                                    fontFamily: "monospace",
                                    letterSpacing: "5.5px",
                                }}
                            >
                                <span style={{ fontSize: "18px" }}>
                                    {formatDate(
                                        dateObj.toISOString(),
                                        "spaced"
                                    )}
                                </span>
                            </div>

                            {data.payTo.length > 43 ? (
                                <>
                                    <div
                                        className="absolute"
                                        style={{
                                            top: "0.4in",
                                            left: "-1.7in",
                                            width: "100%",
                                            zIndex: 50,
                                        }}
                                    >
                                        <span style={{ fontSize: "18px" }}>
                                            {data.payTo
                                                .slice(0, 43)
                                                .toUpperCase()}
                                        </span>
                                    </div>

                                    <div
                                        className="absolute"
                                        style={{
                                            top: "0.5in",
                                            left: "-1.8in",
                                            width: "100%",
                                            zIndex: 50,
                                        }}
                                    >
                                        <span style={{ fontSize: "18px" }}>
                                            {data.payTo.slice(43).toUpperCase()}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <div
                                    className="absolute"
                                    style={{
                                        top: "0.4in",
                                        left: "-1.7in",
                                        width: "100%",
                                        zIndex: 50,
                                    }}
                                >
                                    <span style={{ fontSize: "18px" }}>
                                        {data.payTo.toUpperCase()}
                                    </span>
                                </div>
                            )}

                            <div
                                className="absolute"
                                style={{
                                    top: "0.3in",
                                    right: "1.6in",
                                    width: "100%",
                                    textAlign: "right",
                                }}
                            >
                                <span style={{ fontSize: "18px" }}>
                                    {formatAmount(data.amount, "plain")}
                                </span>
                            </div>

                            <div
                                className="absolute"
                                style={{
                                    top: "0.8in",
                                    left: "-2.1in",
                                    width: "100%",
                                    zIndex: 50,
                                }}
                            >
                                <span style={{ fontSize: "18px" }}>
                                    {convertAmountToWords(
                                        data.amount
                                    ).toUpperCase()}
                                </span>
                            </div>
                        </div>
                    );
                })}

                {checkDates.length > 0 && isError && (
                    <div className="print:hidden my-8 montserrat-regular">
                        <h2 className="text-lg font-bold text-center text-custom-solidgreen">
                            CHECK PREVIEW ({checkDates.length} checks)
                        </h2>
                        <p className="text-sm text-red-600 print:hidden text-center mb-4">
                            ⚠️ Tip: For a clean print, please uncheck "Headers
                            and Footers" in your browser's print settings.
                        </p>

                        <div className="flex gap-3 mb-3">
                            <button
                                className="h-[38px] w-auto px-10 gradient-btn5 text-white text-sm montserrat-semibold rounded-[10px] shadow-card"
                                onClick={() => {
                                    if (allSelected) {
                                        setSelectedChecks([]);
                                    } else {
                                        setSelectedChecks(
                                            checkDates.map((_, index) => index)
                                        );
                                    }
                                    setAllSelected(!allSelected);
                                }}
                            >
                                {allSelected ? "Unselect All" : "Select All"}
                            </button>

                            <button
                                className="h-[38px] w-auto px-10 gradient-btn5 text-white text-sm montserrat-semibold rounded-[10px] shadow-card"
                                onClick={handlePrintSelected}
                            >
                                {allSelected
                                    ? "Print All"
                                    : selectedChecks.length > 0
                                    ? "Print Selected"
                                    : "Print"}
                            </button>
                            <button
                                className="h-[38px] w-auto px-10 gradient-btn5 text-white text-sm montserrat-semibold rounded-[10px] shadow-card"
                                onClick={confirmAll}
                            >
                                {isConfirmAll ? <Spinner /> : "Confirm All"}
                            </button>
                        </div>
                        <div className="flex gap-3 items-center my-4 px-4 print:hidden">
                            <div className="flex items-center gap-2">
                                <label className="text-sm">
                                    Rows per page:
                                </label>
                                <select
                                    value={rowsPerPage}
                                    onChange={(e) => {
                                        setRowsPerPage(
                                            parseInt(e.target.value)
                                        );
                                        setCurrentPage(1);
                                    }}
                                    className="border px-2 py-1 rounded"
                                >
                                    {[2, 4, 6, 8, 10, 20, 50, 100].map(
                                        (num) => (
                                            <option key={num} value={num}>
                                                {num}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() =>
                                        setCurrentPage(currentPage - 1)
                                    }
                                    className="px-2 py-1 border rounded disabled:opacity-50"
                                >
                                    Prev
                                </button>
                                <span className="text-sm">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() =>
                                        setCurrentPage(currentPage + 1)
                                    }
                                    className="px-2 py-1 border rounded disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 px-6">
                            {paginatedCheckDates.map((dateObj, idx) => {
                                const index =
                                    (currentPage - 1) * rowsPerPage + idx;
                                return (
                                    <div
                                        className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden"
                                        key={index}
                                    >
                                        <div className="absolute top-4 left-4 z-10">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    onChange={(e) => {
                                                        const updated = e.target
                                                            .checked
                                                            ? [
                                                                  ...selectedChecks,
                                                                  index,
                                                              ]
                                                            : selectedChecks.filter(
                                                                  (item) =>
                                                                      item !==
                                                                      index
                                                              );
                                                        setSelectedChecks(
                                                            updated
                                                        );
                                                        setAllSelected(
                                                            updated.length ===
                                                                checkDates.length
                                                        );
                                                    }}
                                                    checked={
                                                        selectedChecks.includes(
                                                            index
                                                        ) ||
                                                        confirmedChecks.includes(
                                                            index
                                                        )
                                                    }
                                                    disabled={confirmedChecks.includes(
                                                        index
                                                    )}
                                                    className="sr-only"
                                                />
                                                <div
                                                    className={`w-6 h-6 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
                                                        selectedChecks.includes(
                                                            index
                                                        ) ||
                                                        confirmedChecks.includes(
                                                            index
                                                        )
                                                            ? "bg-custom-solidgreen border-custom-solidgreen"
                                                            : "bg-white border-gray-300 hover:border-custom-lightgreen"
                                                    } ${
                                                        confirmedChecks.includes(
                                                            index
                                                        )
                                                            ? "opacity-50"
                                                            : ""
                                                    }`}
                                                >
                                                    {(selectedChecks.includes(
                                                        index
                                                    ) ||
                                                        confirmedChecks.includes(
                                                            index
                                                        )) && (
                                                        <svg
                                                            className="w-4 h-4 text-white"
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    )}
                                                </div>
                                            </label>
                                        </div>

                                        {/* Card Content */}
                                        <div className="p-6 pt-12">
                                            {/* Check Number */}
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-medium text-gray-600">
                                                        Check No.
                                                    </span>
                                                    <input
                                                        type="text"
                                                        value={getCheckNos(
                                                            index
                                                        )}
                                                        onChange={(e) =>
                                                            handleCheck(
                                                                "checkNos",
                                                                e.target.value,
                                                                index
                                                            )
                                                        }
                                                        className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-custom-lightgreen focus:border-custom-lightgreen outline-none transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                                                        placeholder="Enter check number"
                                                    />
                                                </div>
                                            </div>

                                            {/* Date Display */}
                                            <div className="flex items-center justify-end gap-2 mb-4">
                                                <span className="text-sm font-medium text-gray-600">
                                                    Date:
                                                </span>
                                                <div className="flex gap-[2px]">
                                                    {formatDate(
                                                        dateObj.toISOString(),
                                                        "boxes"
                                                    )
                                                        .split("")
                                                        .map((char, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="w-[16px] h-[18px] border border-gray-400 text-center font-mono text-xs leading-[18px] bg-white"
                                                            >
                                                                {char.trim() !==
                                                                ""
                                                                    ? char
                                                                    : "\u00A0"}
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>

                                            {/* Payment Details */}
                                            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                                <div className="flex justify-between items-start gap-4 mb-4">
                                                    <div className="flex-1">
                                                        <span className="text-sm font-medium text-gray-600 block mb-2">
                                                            Pay to (Beneficiary
                                                            Name):
                                                        </span>
                                                        <span className="font-semibold text-gray-900 break-words">
                                                            {data.payTo.toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-2xl font-bold text-custom-solidgreen font-mono">
                                                            {formatAmount(
                                                                data.amount
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="text-sm font-medium text-gray-700 bg-white p-3 rounded-lg border border-gray-200">
                                                    {convertAmountToWords(
                                                        data.amount
                                                    ).toUpperCase()}
                                                </div>
                                            </div>

                                            {/* Payment Confirmation */}
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-gray-600">
                                                    Payment Confirmation:
                                                </span>
                                                <div className="flex gap-2">
                                                    {confirmedChecks.includes(
                                                        index
                                                    ) ? (
                                                        <span className="inline-flex items-center gap-2 bg-custom-lightestgreen text-custom-solidgreen text-sm font-semibold px-4 py-2 rounded-xl border border-custom-lightgreen">
                                                            <svg
                                                                className="w-4 h-4"
                                                                fill="currentColor"
                                                                viewBox="0 0 20 20"
                                                            >
                                                                <path
                                                                    fillRule="evenodd"
                                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                    clipRule="evenodd"
                                                                />
                                                            </svg>
                                                            Confirmed
                                                        </span>
                                                    ) : (
                                                        <>
                                                            <button
                                                                className="inline-flex items-center gap-2 bg-gradient-to-r from-custom-lightgreen to-custom-solidgreen hover:from-custom-solidgreen hover:to-custom-lightgreen text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                                                onClick={() =>
                                                                    confirmCheck(
                                                                        index
                                                                    )
                                                                }
                                                                disabled={
                                                                    isSavePending
                                                                }
                                                            >
                                                                {confirmIndex ===
                                                                    index &&
                                                                isSavePending ? (
                                                                    <Spinner />
                                                                ) : (
                                                                    <>
                                                                        <svg
                                                                            className="w-4 h-4"
                                                                            fill="currentColor"
                                                                            viewBox="0 0 20 20"
                                                                        >
                                                                            <path
                                                                                fillRule="evenodd"
                                                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                                clipRule="evenodd"
                                                                            />
                                                                        </svg>
                                                                        Confirm
                                                                    </>
                                                                )}
                                                            </button>
                                                            <button
                                                                className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                                                onClick={() =>
                                                                    handleReprint(
                                                                        index
                                                                    )
                                                                }
                                                            >
                                                                <svg
                                                                    className="w-4 h-4"
                                                                    fill="currentColor"
                                                                    viewBox="0 0 20 20"
                                                                >
                                                                    <path
                                                                        fillRule="evenodd"
                                                                        d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z"
                                                                        clipRule="evenodd"
                                                                    />
                                                                </svg>
                                                                Reprint
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChequeStream;

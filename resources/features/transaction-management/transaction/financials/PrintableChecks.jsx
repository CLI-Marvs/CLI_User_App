import React from "react";
import { formatDate } from "@/component/layout/transaction/utils/formatDate";
import { formatAmount } from "@/component/layout/transaction/utils/formatAmount";
import { convertAmountToWords } from "../utils/chequeUtils";

const PrintableChecks = ({
    checkDates,
    data,
    selectedChecks,
    confirmedChecks,
    reprintMode,
    reprintIndex
}) => {
    const printableChecks = selectedChecks
        .filter((index) => !confirmedChecks.includes(index))
        .sort((a, b) => a - b);

    return (
        <>
            {checkDates.map((dateObj, index) => {
                const isSelected = selectedChecks.includes(index);
                const shouldPrint = reprintMode
                    ? index === reprintIndex
                    : isSelected && !confirmedChecks.includes(index);
                const printPosition = reprintMode ? 0 : printableChecks.indexOf(index);
                const isFirstPrintableCheck = printPosition === 0;
                const isBreakPage = selectedChecks.length > 1;
                return (
                    <div
                        key={index}
                        className={`relative bg-white print:shadow-none ${shouldPrint ? "print:block" : "print:hidden"
                            } hidden ${isBreakPage ? "break-after-page" : ""}`}
                        style={{
                            margin: "0 auto",
                            position: "relative",
                            marginTop: isFirstPrintableCheck ? "0in" : "0.2in",
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
                                {formatDate(dateObj.toISOString(), "spaced")}
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
                                        {data.payTo.slice(0, 43).toUpperCase()}
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
                                {convertAmountToWords(data.amount).toUpperCase()}
                            </span>
                        </div>
                    </div>
                );
            })}
        </>
    );
};

export default PrintableChecks;
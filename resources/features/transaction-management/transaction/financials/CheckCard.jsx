import React from "react";
import Spinner from "@/util/Spinner";
import { formatDate } from "@/component/layout/transaction/utils/formatDate";
import { formatAmount } from "@/component/layout/transaction/utils/formatAmount";
import { convertAmountToWords } from "../utils/chequeUtils";

const CheckCard = ({
    checkInfo,
    data,
    selectedChecks,
    confirmIndex,
    isSavePending,
    getCheckNos,
    onSelectionChange,
    onCheckNumberChange,
    onConfirm,
    onReprint
}) => {
    const { date: dateObj, originalIndex: index } = checkInfo;

    return (
        <div className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden">
            <div className="absolute top-4 left-4 z-10">
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        onChange={(e) => onSelectionChange(index, e.target.checked)}
                        checked={selectedChecks.includes(index)}
                        className="sr-only"
                    />
                    <div
                        className={`w-6 h-6 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${selectedChecks.includes(index)
                                ? "bg-custom-solidgreen border-custom-solidgreen"
                                : "bg-white border-gray-300 hover:border-custom-lightgreen"
                            }`}
                    >
                        {selectedChecks.includes(index) && (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
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

            <div className="p-6 pt-12">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-600">Check No.</span>
                        <input
                            type="text"
                            value={getCheckNos(index)}
                            onChange={(e) => onCheckNumberChange(index, e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-custom-lightgreen focus:border-custom-lightgreen outline-none transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                            placeholder="Enter check number"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2 mb-4">
                    <span className="text-sm font-medium text-gray-600">Date:</span>
                    <div className="flex gap-[2px]">
                        {formatDate(dateObj.toISOString(), "boxes")
                            .split("")
                            .map((char, idx) => (
                                <div
                                    key={idx}
                                    className="w-[16px] h-[18px] border border-gray-400 text-center font-mono text-xs leading-[18px] bg-white"
                                >
                                    {char.trim() !== "" ? char : "\u00A0"}
                                </div>
                            ))}
                    </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <div className="flex justify-between items-start gap-4 mb-4">
                        <div className="flex-1">
                            <span className="text-sm font-medium text-gray-600 block mb-2">
                                Pay to (Beneficiary Name):
                            </span>
                            <span className="font-semibold text-gray-900 break-words">
                                {data.payTo.toUpperCase()}
                            </span>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-custom-solidgreen font-mono">
                                {formatAmount(data.amount)}
                            </div>
                        </div>
                    </div>
                    <div className="text-sm font-medium text-gray-700 bg-white p-3 rounded-lg border border-gray-200">
                        {convertAmountToWords(data.amount).toUpperCase()}
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Print Confirmation:</span>
                    <div className="flex gap-2">
                        <button
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-custom-lightgreen to-custom-solidgreen hover:from-custom-solidgreen hover:to-custom-lightgreen text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            onClick={() => onConfirm(index)}
                            disabled={isSavePending}
                        >
                            {confirmIndex === index && isSavePending ? (
                                <Spinner />
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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
                            onClick={() => onReprint(index)}
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    fillRule="evenodd"
                                    d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            Reprint
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckCard;
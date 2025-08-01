import React from "react";
import Spinner from "@/util/Spinner";

const CheckPreviewHeader = ({ 
    unconfirmedCount, 
    allSelected, 
    onToggleSelectAll, 
    onPrintSelected, 
    onConfirmAll, 
    isConfirmAll 
}) => {
    return (
        <div className="print:hidden my-8 montserrat-regular">
            <h2 className="text-lg font-bold text-center text-custom-solidgreen">
                CHECK PREVIEW ({unconfirmedCount} {unconfirmedCount === 1 || unconfirmedCount === 0 ? 'Total Check' : 'Total Checks'})
            </h2>
            <p className="text-sm text-red-600 print:hidden text-center mb-4">
                ⚠️ Tip: For a clean print, please uncheck "Headers and Footers" in your browser's print settings.
            </p>
            <div className="flex gap-3 mb-3">
                <button
                    className="h-[38px] w-auto px-10 gradient-btn5 text-white text-sm montserrat-semibold rounded-[10px] shadow-card"
                    onClick={onToggleSelectAll}
                >
                    {allSelected ? "Unselect All" : "Select All"}
                </button>
                <button
                    className="h-[38px] w-auto px-10 gradient-btn5 text-white text-sm montserrat-semibold rounded-[10px] shadow-card"
                    onClick={onPrintSelected}
                >
                    Print Selected
                </button>
                <button
                    className="h-[38px] w-auto px-10 gradient-btn5 text-white text-sm montserrat-semibold rounded-[10px] shadow-card"
                    onClick={onConfirmAll}
                >
                    {isConfirmAll ? <Spinner /> : "Confirm All"}
                </button>
            </div>
        </div>
    );
};

export default CheckPreviewHeader;
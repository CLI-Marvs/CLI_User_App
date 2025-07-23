import React from "react";
import exportIcon from "../../../../../public/Images/export-icon.png";

const Export = ({ isExporting, exportToExcel }) => {
    return (
        <div
            className="flex items-center gap-2 h-[39px] w-[87px] rounded-md border-1 border-custom-solidgreen px-2 cursor-pointer text-custom-solidgreen"
            onClick={!isExporting ? exportToExcel : undefined}
        >
            {isExporting ? (
                <svg
                    className="animate-spin h-4 w-4 text-custom-solidgreen"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                </svg>
            ) : (
                <>
                    <img src={exportIcon} alt="export-icon" />
                    <span className="text-sm">Export</span>
                </>
            )}
        </div>
    );
};

export default Export;

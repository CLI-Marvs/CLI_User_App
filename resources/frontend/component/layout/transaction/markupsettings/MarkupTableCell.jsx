import React, { useRef, useState } from "react";
import { IoMdCreate } from "react-icons/io";

const MarkupTableCell = ({
    type,
    row,
    setSelectedData,
    settingsRef,
    setType,
}) => {
    const handleEdit = (rowData) => {
        setSelectedData(rowData);
        setType("update");
        if (settingsRef.current) {
            settingsRef.current.showModal();
        }
    };

    return (
        <>
            {type === "actions" ? (
                <div
                    className="flex gap-2 justify-center items-center"
                    onClick={() => handleEdit(row)}
                >
                    <IoMdCreate
                        className="text-custom-lightgreen hover:text-custom-lightgreen cursor-pointer text-center"
                        size={18}
                    />
                </div>
            ) : (
                <div className="flex flex-col w-auto">
                    <span className="montserrat-medium text-[13px]">
                        {row[type]}
                        {type === "pti_bank_rate_percent_local" ||
                        type === "pti_bank_rate_percent_international"
                            ? "%"
                            : ""}
                    </span>
                </div>
            )}
        </>
    );
};

export default MarkupTableCell;

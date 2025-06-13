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
    if (type === "actions") {
        return (
            <div
                className="flex gap-2 justify-center items-center"
                onClick={() => handleEdit(row)}
            >
                <IoMdCreate
                    className="text-custom-lightgreen hover:text-custom-lightgreen cursor-pointer text-center"
                    size={18}
                />
            </div>
        );
    }

    if (type === "payment_method") {
        return (
            <div className="flex flex-col w-auto">
                <span className="text-[13px]">{row[type] ?? "-"}</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-auto montserrat-regular">
            <span className="text-[13px]">
                Local: {row?.markup_details.local[type] ?? "-"}
            </span>
            <span className="text-[13px]">
                International: {row?.markup_details.international[type] ?? ""}
            </span>
        </div>
    );
};

export default MarkupTableCell;

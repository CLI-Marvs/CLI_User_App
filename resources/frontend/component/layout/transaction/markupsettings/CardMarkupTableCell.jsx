import React, { useRef, useState } from "react";
import { IoMdCreate } from "react-icons/io";

const CardMarkupTableCell = ({ type, row, setSelectedData, settingsRef }) => {
    const handleEdit = (rowData) => {
        setSelectedData(rowData);
        if (settingsRef.current) {
            settingsRef.current.showModal();
        }
    };

    const baseCellClass = "flex flex-col montserrat-regular text-[13px]";

    if (type === "actions") {
        return (
            <div className="flex gap-2 justify-center items-center">
                <button
                    onClick={() => handleEdit(row)}
                    className="text-custom-lightgreen hover:text-custom-lightgreen cursor-pointer"
                    title="Edit"
                    aria-label="Edit"
                >
                    <IoMdCreate size={18} />
                </button>
            </div>
        );
    }

    const renderCellContent = () => {
        switch (type) {
            case "payment_method":
                return (
                    <div className={baseCellClass}>
                        <span>{row.payment_method}</span>
                    </div>
                );
            case "mdr":
                return (
                    <div className={baseCellClass}>
                        <span>{row.mdr}</span>
                    </div>
                );
            case "cli_rate":
                return (
                    <div className={baseCellClass}>
                        <span>{row.cli_rate}</span>
                    </div>
                );
            case "withholding_tax":
                return (
                    <div className={baseCellClass}>
                        <span>{row.withholding_tax}</span>
                    </div>
                );
            case "gateway_rate":
                return (
                    <div className={baseCellClass}>
                        <span>{row.gateway_rate}</span>
                    </div>
                );
            default:
                return null;
        }
    };

    return renderCellContent();
};

export default CardMarkupTableCell;

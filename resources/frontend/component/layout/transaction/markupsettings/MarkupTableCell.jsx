import React, { useRef, useState } from "react";
import { IoMdCreate } from "react-icons/io";
import MarkupSettingModal from "@/component/layout/transaction/markupsettings/MarkupSettingModal";

const fields = [
    { name: "payment_method", label: "Payment Method" },
    { name: "pti_bank_rate_percent", label: "Bank Rate Percentage" },
    { name: "pti_bank_fixed_amount", label: "Bank Fixed Amount" },
    { name: "cli_markup", label: "CLI Markup" },
];

const MarkupTableCell = ({ type, row }) => {
    const settingsRef = useRef(null);
    const [selectedData, setSelectedData] = useState(null);

    const handleEdit = (rowData) => {
        setSelectedData(rowData);
        if (settingsRef.current) {
            settingsRef.current.showModal();
        }
    };

    switch (type) {
        case "payment_method":
        case "pti_bank_rate_percent":
        case "pti_bank_fixed_amount":
        case "cli_markup":
            return (
                <div className="flex flex-col w-auto">
                    <span className="montserrat-medium text-[13px]">
                        {row[type]}
                    </span>
                </div>
            );

        case "actions":
            return (
                <div
                    className="flex gap-2 justify-center items-center"
                    onClick={() => handleEdit(row)}
                >
                    <IoMdCreate
                        className="text-custom-lightgreen hover:text-custom-lightgreen cursor-pointer text-center"
                        size={18}
                    />
                    <MarkupSettingModal
                        settingsRef={settingsRef}
                        fields={fields}
                        type="update"
                        selectedData={selectedData}
                    />
                </div>
            );

        default:
            return <span>{row[type]}</span>;
    }
};

export default MarkupTableCell;

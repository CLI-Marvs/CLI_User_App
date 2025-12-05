import { formatCurrency } from "@/util/formatCurrency";
import moment from "moment";
import React from "react";
import { IoMdCreate } from "react-icons/io";
import { MdDelete } from "react-icons/md";

const CheckTableCell = ({
    type,
    row,
    setSelectedData,
    settingsRef,
    setShowAlert,
    setDataToDelete,
}) => {
    const handleEdit = (rowData) => {
        setSelectedData(rowData);
        if (settingsRef.current) {
            settingsRef.current.showModal();
        }
    };
    const handleDelete = (id) => {
        setDataToDelete(id);
        setShowAlert(true);
    };

    if (type === "bank_name") {
        return (
            <span className="montserrat-regular text-[13px] break-all">
                {row.check_stream_bank.bank_name}
            </span>
        );
    }

    if (type === "beneficiary_name") {
        return (
            <span className="montserrat-regular text-[13px] break-all">
                {row.check_entities.entity_name}
            </span>
        );
    }

    if (type === "check_date") {
        const formatDate = row.check_date
            ? (() => {
                const [year, month, day] = row.check_date.split("-");
                return `${month}/${day}/${year}`;
            })()
            : "";

        return (
            <span className="montserrat-regular text-[13px] break-all">
                {formatDate}
            </span>
        );
    }
    if (type === "created_at") {
        return (
            <span className="montserrat-regular text-[13px] break-all">
                {moment(row.created_at).format("MM/DD/YYYY")}
            </span>
        );
    }
    if (type === "check_amount") {
        return (
            <span className="montserrat-regular text-[13px] break-all">
                {formatCurrency(row.check_amount)}
            </span>
        );
    }

    if (type === "actions") {
        return (
            <div className="flex gap-2 justify-center items-center">
                <IoMdCreate
                    className="text-custom-lightgreen hover:text-custom-lightgreen cursor-pointer text-center"
                    size={18}
                    onClick={() => handleEdit(row)}
                />
                <MdDelete
                    className="w-6 h-6 text-red-500"
                    onClick={() => handleDelete(row.id)}
                />
            </div>
        );
    }

    return (
        <span className="montserrat-regular text-[13px] break-all">
            {row[type]}
        </span>
    );
};

export default CheckTableCell;

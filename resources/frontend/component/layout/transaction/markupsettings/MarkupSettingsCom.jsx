import { Card } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import GlobalTable from "../GlobalTable";
import { MdCalendarToday } from "react-icons/md";
import TransactionSearchBar from "@/component/layout/transaction/TransactionSearchBar";
import usePagination from "@/hooks/usePagination";
import { useTransactionContext } from "@/context/Transaction/TransactionContext";
import Pagination from "@/component/Pagination";
import MarkupTableCell from "@/component/layout/transaction/markupsettings/MarkupTableCell";
import { settings } from "@/component/servicesApi/apiCalls/markupSettings/settings";
import MarkupSettingModal from "@/component/layout/transaction/markupsettings/MarkupSettingModal";
import CustomToolTip from "@/component/CustomToolTip";
import { IoMdAdd } from "react-icons/io";

const MarkupSettingsCom = () => {
    const fields = [
        { name: "payment_method", label: "Payment Method" },
        { name: "pti_bank_rate_percent", label: "Bank Rate Percentage" },
        { name: "pti_bank_fixed_amount", label: "Bank Fixed Amount" },
        { name: "cli_markup", label: "CLI Markup" },
    ];

    const settingsRef = useRef(null);
    const columns = [
        {
            header: "Payment Method",
            accessor: "payment_method",
            render: (row) => (
                <MarkupTableCell type="payment_method" row={row} />
            ),
        },
        {
            header: "Bank Rate Percentage",
            accessor: "pti_bank_rate_percent",
            render: (row) => (
                <MarkupTableCell type="pti_bank_rate_percent" row={row} />
            ),
        },
        {
            header: "Bank Fixed Amount",
            accessor: "pti_bank_fixed_amount",
            render: (row) => (
                <MarkupTableCell type="pti_bank_fixed_amount" row={row} />
            ),
        },
        {
            header: "CLI Markup",
            accessor: "cli_markup",
            render: (row) => <MarkupTableCell type="cli_markup" row={row} />,
        },
        {
            header: "Actions",
            accessor: "actions",
            render: (row) => <MarkupTableCell type="actions" row={row} />,
        },
    ];
    const [searchValues, setSearchValues] = useState({});
    const { markupSettings, setMarkupSettings } = useTransactionContext();
    const { handlePageClick, setFilters } = usePagination(
        settings.retrieveSettings,
        markupSettings,
        setMarkupSettings
    );

    const handleSearchValue = (e) => {
        const { name, value } = e.target;
        setSearchValues((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const onSubmit = () => {
        setFilters(searchValues);
        setSearchValues({});
    };
    const handleOpenModal = () => {
        if (settingsRef.current) {
            settingsRef.current.showModal();
        }
    };


    return (
        <>
            <div className="overflow-y-hidden px-3 flex flex-col space-y-2 max-w-auto">
                <div className="flex items-center ">
                <TransactionSearchBar
                    fields={fields}
                    searchValues={searchValues}
                    setSearchValues={setSearchValues}
                    onChangeSearch={handleSearchValue}
                    onSubmit={onSubmit}
                    setFilters={setFilters}
                />

                <CustomToolTip text="Add" position="top z-50">
                    <button className="flex items-center gap-1 px-3 py-1 bg-custom-lightgreen text-white rounded hover:bg-custom-lightgreen" onClick={handleOpenModal}>
                        <IoMdAdd size={18} />
                    </button>
                </CustomToolTip>
                </div>

                <GlobalTable
                    columns={columns}
                    data={markupSettings.data}
                    loading={markupSettings.loading}
                />
                <div className="flex justify-end mt-4">
                    <div className="flex w-full justify-end mt-3 mb-10">
                        <Pagination
                            currentPage={markupSettings.currentPage}
                            totalPages={markupSettings.totalPages}
                            onPageChange={(page) => handlePageClick(page)}
                        />
                    </div>
                </div>
            </div>
            <MarkupSettingModal settingsRef={settingsRef} fields={fields} type="store" />
        </>
    );
};

export default MarkupSettingsCom;

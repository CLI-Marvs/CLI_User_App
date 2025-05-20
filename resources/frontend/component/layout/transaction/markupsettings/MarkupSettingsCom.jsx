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
import CardMarkupFee from "./CardMarkupFee";

const MarkupSettingsCom = () => {
    const SEARCH_FIELDS = [{ name: "payment_method", label: "Payment Method" }];

    const INPUT_SEARCH = [
        { name: "pti_bank_rate_percent", label: "Percentage Rate" },
        { name: "pti_bank_fixed_amount", label: "Fix Amount Rate" },
        { name: "cli_markup", label: "CLI Markup(Fix Amount)" },
        { name: "payment_method", label: "Payment Method" },
    ];

    const [selectedData, setSelectedData] = useState(null);
    const [type, setType] = useState("");
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
            header: "Percentage Rate",
            accessor: "pti_bank_rate_percent",
            render: (row) => (
                <MarkupTableCell type="pti_bank_rate_percent" row={row} />
            ),
        },
        {
            header: "Fix Amount Rate",
            accessor: "pti_bank_fixed_amount",
            render: (row) => (
                <MarkupTableCell type="pti_bank_fixed_amount" row={row} />
            ),
        },
        {
            header: "CLI Markup(Fix Amount)",
            accessor: "cli_markup",
            render: (row) => <MarkupTableCell type="cli_markup" row={row} />,
        },
        {
            header: "Actions",
            accessor: "actions",
            render: (row) => (
                <MarkupTableCell
                    type="actions"
                    row={row}
                    setSelectedData={setSelectedData}
                    setType={setType}
                    settingsRef={settingsRef}
                />
            ),
        },
    ];
    const [searchValues, setSearchValues] = useState({});
    const { markupSettings, setMarkupSettings } = useTransactionContext();
    const { handlePageClick, setFilters, getData } = usePagination(
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
        setType("store");
        setSelectedData(null);
        if (settingsRef.current) {
            settingsRef.current.showModal();
        }
    };

    return (
        <>
            <div className="overflow-y-hidden px-3 flex flex-col space-y-2 w-full">
                <div className="flex items-center ">
                    <TransactionSearchBar
                        fields={SEARCH_FIELDS}
                        searchValues={searchValues}
                        setSearchValues={setSearchValues}
                        onChangeSearch={handleSearchValue}
                        onSubmit={onSubmit}
                        setFilters={setFilters}
                    />

                    <CustomToolTip text="Add" position="top z-50">
                        <button
                            className="flex items-center gap-1 px-3 py-1 bg-custom-lightgreen text-white rounded hover:bg-custom-lightgreen"
                            onClick={handleOpenModal}
                        >
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
                <CardMarkupFee/>

            </div>
            <MarkupSettingModal
                settingsRef={settingsRef}
                fields={INPUT_SEARCH}
                type={type}
                refetchData={getData}
                selectedData={selectedData}
            />

        </>
    );
};

export default MarkupSettingsCom;

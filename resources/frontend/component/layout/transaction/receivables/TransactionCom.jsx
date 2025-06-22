import React, { use, useEffect, useMemo, useState } from "react";
import GlobalTable from "../GlobalTable";
import TransactionTableCell from "./TransactionTableCell";
import { useTransactionContext } from "@/context/Transaction/TransactionContext";
import { transaction } from "@/component/servicesApi/apiCalls/transactions";
import TransactionSearchBar from "@/component/layout/transaction/TransactionSearchBar";
import Pagination from "@/component/Pagination";
import usePagination from "@/hooks/usePagination";
import { usePropertyFormatter } from "@/component/layout/transaction/hooks/usePropertyFormatter";
import SimpleViewCell from "./SimpleViewCell";
import exportIcon from "../../../../../../public/Images/export-icon.png";
import {
    columnNameToFieldKey,
    P_METHOD,
    transactionOptions,
} from "@/constant/data/transaction";
import moment from "moment";
import {
    useSubFeatureId,
    useColumns,
    useTransactionsExport,
} from "../hooks/useTransactionQueries";
import useRouteSections from "@/hooks/useRouteSections";
import ColumnModal from "../component/ColumnModal";

const TransactionCom = () => {
    const { subSection } = useRouteSections();
    const { data: subFeature } = useSubFeatureId(subSection);
    const { data: views, isSuccess } = useColumns(subFeature?.id);
    const { mutateAsync: exportTransactions, isPending: isExporting } =
        useTransactionsExport();

    const { formattedPropertyNames } = usePropertyFormatter();
    const [searchValues, setSearchValues] = useState({});
    const {
        transactions,
        setTransactions,
        banks,
        setBanks,
        enabled,
        setEnabled,
        defaultColumns,
    } = useTransactionContext();
    const { handlePageClick, setFilters } = usePagination(
        transaction.transactionList,
        transactions,
        setTransactions
    );

    //*Simple view Cell
    const generateDynamicColumns = (defs) => {
        if (!defs) return [];

        return defs
            .map(({ column_name: label }) => {
                const accessor = columnNameToFieldKey[label];
                if (!accessor) {
                    console.warn(`No field mapping found for column: ${label}`);
                    return null;
                }

                return {
                    header: label,
                    accessor,
                    render: (row) => (
                        <SimpleViewCell type={accessor} row={row} />
                    ),
                };
            })
            .filter(Boolean);
    };

    const dynamicColumns = generateDynamicColumns(defaultColumns);

    const baseColumns = [
        {
            header: "Date & Time",
            accessor: "transaction_date",
            render: (row) => (
                <TransactionTableCell type="transaction_date" row={row} />
            ),
        },
        {
            header: "Details",
            accessor: "details",
            render: (row) => <TransactionTableCell type="details" row={row} />,
        },
        {
            header: "Amount",
            accessor: "amount",
            render: (row) => <TransactionTableCell type="amount" row={row} />,
        },

        {
            header: "Status",
            accessor: "transaction_status",
            render: (row) => (
                <TransactionTableCell type="transaction_status" row={row} />
            ),
        },
        {
            header: "Trace IDs",
            accessor: "transaction",
            render: (row) => (
                <TransactionTableCell type="transaction" row={row} />
            ),
        },
        {
            header: "Collection Receipt",
            accessor: "collection_receipt_link",
            render: (row) => (
                <TransactionTableCell
                    type="collection_receipt_link"
                    row={row}
                />
            ),
        },
        {
            header: "Destination Bank",
            accessor: "destination_bank",
            render: (row) => (
                <TransactionTableCell type="destination_bank" row={row} />
            ),
        },
    ];

    const fields = [
        { name: "email", label: "Email" },
        {
            name: "property_name",
            label: "Project Name",
            type: "select",
            options: [
                { label: "Select Project", value: "" },
                ...formattedPropertyNames.map((item) => ({
                    label: item,
                    value: item,
                })),
            ],
        },
        {
            name: "transaction_type",
            label: "Transaction Type",
            type: "select",
            options: [
                { label: "Select Transaction Type", value: "" },
                ...transactionOptions.map((item) => ({
                    label: item,
                    value: item,
                })),
            ],
        },
        { name: "transaction_number", label: "Transaction Number" },
        {
            name: "payment_option",
            label: "Payment Method",
            type: "select",
            options: [
                { label: "Select Payment Method", value: "" },
                ...P_METHOD.map((item) => ({
                    label: item,
                    value: item,
                })),
            ],
        },
        { name: "reference_number", label: "Contract Number" },
        {
            name: "destination_bank",
            label: "Bank",
            type: "select",
            options: [
                { label: "Select Bank", value: "" },
                ...banks.map((item) => ({
                    label: item,
                    value: item,
                })),
            ],
        },
        {
            name: "status",
            label: "Status",
            type: "select",
            options: [
                { label: "Select Status", value: "" },
                { label: "Cleared", value: "Cleared" },
                { label: "Posted", value: "Posted" },
                { label: "Floating", value: "Floating" },
                { label: "Succeed", value: "Succeed" },
                { label: "Failed", value: "Failed" },
            ],
        },
        { name: "date_range", type: "date_range", label: "Date" },
    ];

    const columns = isSuccess
        ? dynamicColumns.length > 0
            ? dynamicColumns
            : baseColumns
        : [];

    const isDynamicColumnsLoading = !isSuccess;

    const exportToExcel = async () => {
        try {
            const payload = {
                columns: dynamicColumns.map((col) =>
                    col.accessor === "property_name" ? "id" : col.accessor
                ),

                filter: transactions?.filters,
            };
            console.log("payload", payload);
            const response = await exportTransactions({data: payload});

            if (response.status !== 200) throw new Error("Export failed");

            const blob = response.data;
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "transactions.xlsx");
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Error exporting file:", error);
        }
    };

    const retrieveBanks = async () => {
        try {
            const response = await transaction.retrieveBanks();
            setBanks(response);
        } catch (error) {
            console.log("error", error);
        }
    };

    useEffect(() => {
        retrieveBanks();
    }, []);

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
        setTransactions((prev) => ({
            ...prev,
            loading: true,
        }));
    };

    const removeFilter = (key) => {
        const newFilters = { ...transactions?.filters };

        delete newFilters[key];

        if (key === "start_date") {
            delete newFilters["end_date"];
        }

        setTransactions((prev) => ({
            ...prev,
            filters: newFilters,
        }));
    };

    const formatFiltersLabel = (key, value, filters) => {
        if (key === "start_date") {
            const start = moment(value).format("MMMM D, YYYY");
            const end = filters.end_date
                ? moment(filters.end_date).format("MMMM D, YYYY")
                : "";
            return `Date Range: From ${start} to ${end}`;
        }

        const formattedKey = key
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

        const displayKey =
            formattedKey === "Payment Option" ? "Payment Method" : formattedKey;

        if (value === "Paymaya" || value === "GCash") {
            return `${displayKey}: Ewallet (${value})`;
        }

        return `${displayKey}: ${value}`;
    };

    return (
        <>
            <div className="space-y-2 w-full">
                <div className="flex items-center gap-4 mb-3">
                    <TransactionSearchBar
                        fields={fields}
                        searchValues={searchValues}
                        setSearchValues={setSearchValues}
                        onChangeSearch={handleSearchValue}
                        onSubmit={onSubmit}
                        setFilters={setFilters}
                    />
                    {/* <div className="flex items-center gap-2">
                        <ToggleSwitch
                            enabled={enabled}
                            setEnabled={setEnabled}
                        />
                        <span className="text-base">Simple View</span>
                    </div> */}
                    <ColumnModal subFeatureId={subFeature?.id} views={views} />
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
                </div>
                <div className="flex flex-wrap px-2 gap-2">
                    {transactions?.filters &&
                        Object.entries(transactions?.filters)
                            .filter(([key]) => key !== "end_date")
                            .map(([key, value]) => (
                                <div
                                    className="flex items-center gap-2 text-white px-2 bg-custom-solidgreen w-auto h-[24px] rounded-[10px] text-sm"
                                    key={key}
                                >
                                    <span>
                                        {formatFiltersLabel(
                                            key,
                                            value,
                                            transactions.filters
                                        )}
                                    </span>
                                    <button onClick={() => removeFilter(key)}>
                                        X
                                    </button>
                                </div>
                            ))}
                </div>
                <GlobalTable
                    columns={columns}
                    data={transactions.data}
                    loading={transactions.loading}
                    columnsLoading={isDynamicColumnsLoading}
                />
                <div className="flex justify-end mt-4">
                    <div className="flex w-full justify-end mt-3 mb-10">
                        <Pagination
                            currentPage={transactions.currentPage}
                            totalPages={transactions.totalPages}
                            onPageChange={(page) => handlePageClick(page)}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};
/* const ToggleSwitch = ({ enabled, setEnabled }) => {
    return (
        <div className="flex items-center">
            <button
                type="button"
                onClick={() => setEnabled(!enabled)}
                className={`relative inline-flex h-[31px] w-[51px] items-center rounded-[100px] transition-colors duration-300 focus:outline-none ${
                    enabled ? "bg-[#348017]" : "bg-gray-300"
                }`}
            >
                <span
                    className={`inline-block h-[27px] w-[27px] transform rounded-[100px] bg-white transition-transform duration-300 ${
                        enabled ? "translate-x-5" : "translate-x-1"
                    }`}
                />
            </button>
        </div>
    );
}; */

export default TransactionCom;

import React, { useEffect, useState } from "react";
import GlobalTable from "../GlobalTable";
import TransactionTableCell from "./TransactionTableCell";
import { useTransactionContext } from "@/context/Transaction/TransactionContext";
import { transaction } from "@/component/servicesApi/apiCalls/transactions";
import ReactPaginate from "react-paginate";
import {
    MdKeyboardArrowLeft,
    MdKeyboardArrowRight,
    MdRefresh,
} from "react-icons/md";
import TransactionSearchBar from "@/component/layout/transaction/TransactionSearchBar";
import Pagination from "@/component/Pagination";
import usePagination from "@/hooks/usePagination";
import CustomToolTip from "@/component/CustomToolTip";
import { usePropertyFormatter } from "@/component/layout/transaction/hooks/usePropertyFormatter";

const TransactionCom = () => {
    const columns = [
        {
            header: "Date & Time",
            accessor: "transaction_date",
            render: (row) => (
                <TransactionTableCell type="transaction_date" row={row} />
            ),
        },
        {
            header: "Transactions",
            accessor: "transaction",
            render: (row) => (
                <TransactionTableCell type="transaction" row={row} />
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
            header: "Payment Method",
            accessor: "payment_method",
            render: (row) => (
                <TransactionTableCell type="payment_method" row={row} />
            ),
        },
        {
            header: "Status",
            accessor: "transaction_status",
            render: (row) => (
                <TransactionTableCell type="transaction_status" row={row} />
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
    const { formattedPropertyNames } = usePropertyFormatter();
    const [searchValues, setSearchValues] = useState({});
    const { transactions, setTransactions } = useTransactionContext();
    const { handlePageClick, setFilters } = usePagination(
        transaction.transactionList,
        transactions,
        setTransactions
    );

    const fields = [
        { name: "email", label: "Email" },
        {
            name: "destination_bank",
            label: "Bank",
            type: "select",
            options: [
                { label: "Select Bank", value: "" },
                { label: "BDO", value: "BDO" },
                { label: "BPI", value: "BPI" },
                { label: "LANDBANK", value: "LANDBANK" },
            ],
        },
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
        { name: "invoice_number", label: "Invoice Number" },
        { name: "transaction_number", label: "Transaction Number" },
        { name: "reference_number", label: "Reference Number" },
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

    return (
        <>
            <div className="overflow-y-hidden px-3 space-y-2">
                <TransactionSearchBar
                    fields={fields}
                    searchValues={searchValues}
                    setSearchValues={setSearchValues}
                    onChangeSearch={handleSearchValue}
                    onSubmit={onSubmit}
                    setFilters={setFilters}
                />
                <GlobalTable
                    columns={columns}
                    data={transactions.data}
                    loading={transactions.loading}
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

export default TransactionCom;

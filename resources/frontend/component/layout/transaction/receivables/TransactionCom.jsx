import React, { useEffect, useState } from "react";
import GlobalTable from "../GlobalTable";
import TransactionTableCell from "./TransactionTableCell";
import { useTransactionContext } from "@/context/Transaction/TransactionContext";
import { transaction } from "@/component/servicesApi/apiCalls/transactions";
import TransactionSearchBar from "@/component/layout/transaction/TransactionSearchBar";
import Pagination from "@/component/Pagination";
import usePagination from "@/hooks/usePagination";
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
    const { formattedPropertyNames } = usePropertyFormatter();
    const [searchValues, setSearchValues] = useState({});
    const { transactions, setTransactions, banks, setBanks } =
        useTransactionContext();
    const { handlePageClick, setFilters } = usePagination(
        transaction.transactionList,
        transactions,
        setTransactions
    );

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

    const fields = [
        { name: "email", label: "Email" },
        {
            name: "destination_bank",
            label: "Bank",
            type: "select",
            options: [
                { label: "Select Banks", value: "" },
                ...banks.map((item) => ({
                    label: item,
                    value: item,
                })),
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
            <div className="overflow-y-hidden space-y-2 w-full">
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

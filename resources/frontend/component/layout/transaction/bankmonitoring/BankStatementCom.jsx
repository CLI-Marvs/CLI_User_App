import React, { useEffect, useRef, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import GlobalTable from "@/component/layout/transaction/GlobalTable";
import BankTableCell from "./BankTableCell";
import TransactionSearchBar from "@/component/layout/transaction/TransactionSearchBar";
import { useTransactionContext } from "@/context/Transaction/TransactionContext";
import usePagination from "@/hooks/usePagination";
import { transaction } from "@/component/servicesApi/apiCalls/transactions";
import Pagination from "@/component/Pagination";

const BankStatementCom = () => {
    const { bankStatementsList, setBankStatementsList } =
        useTransactionContext();

    const { handlePageClick, setFilters } = usePagination(
        transaction.bankStatementsList,
        bankStatementsList,
        setBankStatementsList
    );

    const columns = [
        {
            header: "Date & Time",
            accessor: "transaction_date",
            render: (row) => (
                <BankTableCell type="transaction_date" row={row} />
            ),
        },
        {
            header: "Transaction",
            accessor: "transaction",
            render: (row) => (
                <BankTableCell type="transaction" row={row} />
            ),
        },

        {
            header: "Details",
            accessor: "details",
            render: (row) => <BankTableCell type="details" row={row} />,
        },
        {
            header: "Amount",
            accessor: "amount",
            render: (row) => <BankTableCell type="amount" row={row} />,
        },
        {
            header: "Payment Method",
            accessor: "payment_method",
            render: (row) => (
                <BankTableCell type="payment_method" row={row} />
            ),
        },
        {
            header: "Status",
            accessor: "transaction_status",
            render: (row) => (
                <BankTableCell type="transaction_status" row={row} />
            ),
        },
        {
            header: "Destination Bank",
            accessor: "destination_bank",
            render: (row) => (
                <BankTableCell type="destination_bank" row={row} />
            ),
        },
    ];
    const fields = [
        {
            name: "bank_name",
            label: "Bank",
            type: "select",
            options: [
                { label: "Select Bank", value: "" },
                { label: "BDO", value: "BDO" },
                { label: "BPI", value: "BPI" },
                { label: "LANDBANK", value: "LANDBANK" },
            ],
        },
        { name: "transaction_number", label: "Transaction Number" },
        { name: "document_number", label: "Document Number" },

        { name: "transaction_code", label: "Transaction Code" },
        { name: "reference_number", label: "Reference Number" },
        {
            name: "status_of_posting",
            label: "Status",
            type: "select",
            options: [
                { label: "Select Status", value: "" },
                { label: "Cleared", value: "Cleared" },
                { label: "Posted", value: "Posted" },
                { label: "Floating", value: "Floating" },
            ],
        },
        { name: "date_range", type: "date_range", label: "Date" },
    ];

    const [searchValues, setSearchValues] = useState({});

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

    /*  const handleSubmitSap = async () => {
        try {
            for (const item of matchesData) {
                let soapBody = `
                    <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
                    <soap:Header/>
                    <soap:Body>
                       <urn:ZdataWarehousePosted>
                          <LtZcol>
                             <item>
                                <Id>${item.ID}</Id>
                                <Bukrs>${item.BUKRS}</Bukrs>
                                <Recnnr>${item.RECNNR}</Recnnr>
                                <Vbewa>${item.VBEWA}</Vbewa>
                                <Belnr>${item.BELNR}</Belnr>
                                <Amt>${item.AMT}</Amt>
                                <Payd>${item.PAYD}</Payd>
                                <InvId>${item.INVID}</InvId>
                             </item>
                          </LtZcol>
                       </urn:ZdataWarehousePosted>
                    </soap:Body>
                    </soap:Envelope>`;

                const response = await apiServiceSap.post(
                    "post-data-sap",
                    soapBody
                );
            }

            if (modalRef.current) {
                modalRef.current.close();
            }
            toast.success("All Data Posted Successfully!");
        } catch (error) {
            console.error(
                "Error:",
                error.response ? error.response.data : error.message
            );
            toast.error("Sometine went wrong. Please refresh the page");
        }
    }; */

    return (
        <>
            <div className="overflow-y-hidden px-3">
                <div className="px-2">
                    <TransactionSearchBar
                        fields={fields}
                        searchValues={searchValues}
                        setSearchValues={setSearchValues}
                        onChangeSearch={handleSearchValue}
                        onSubmit={onSubmit}
                    />
                </div>
                <GlobalTable columns={columns} data={bankStatementsList.data} loading={bankStatementsList.loading} />
                <div className="flex justify-end mt-4">
                    <div className="flex w-full justify-end mt-3 mb-10">
                        <Pagination
                            currentPage={bankStatementsList.currentPage}
                            totalPages={bankStatementsList.totalPages}
                            onPageChange={(page) => handlePageClick(page)}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default BankStatementCom;

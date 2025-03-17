import React, { useEffect } from "react";
import GlobalTable from "../GlobalTable";
import TransactionTableCell from "./TransactionTableCell";
import { useTransactionContext } from "@/context/Transaction/TransactionContext";
import { transaction } from "@/component/servicesApi/apiCalls/transactions";
import ReactPaginate from "react-paginate";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import TransactionSearchBar from "@/component/layout/transaction/TransactionSearchBar";

const TransactionCom = () => {
    const fields = [
        { name: "transaction_customer_name", label: "Name" },
        { name: "transaction_email", label: "Email" },
        { 
            name: "transaction_bank", 
            label: "Bank",
            type: "select",
            options: [
                { label: "Select Bank", value: "" }, 
                { label: "BDO", value: "bdo" },
                { label: "BPI", value: "bpi" },
                { label: "LANDBANK", value: "landbank" },
            ]
        }, 
        { 
            name: "project_name", 
            label: "Project Name",
            type: "select",
            options: [
                { label: "Select Project", value: "" }, 
                { label: "Casa Mira", value: "Casa Mira" },
                { label: "38th Park", value: "38th Park" },
            ]
        }, 
        { name: "transaction_invoice_number", label: "Invoice Number" },
        { name: "transaction_document_number", label: "Document Number" },
        { name: "transaction_reference_number", label: "Reference Number" },
        { 
            name: "transaction_status", 
            label: "Status",
            type: "select",
            options: [
                { label: "Select Status", value: "" },
                { label: "Not Posted", value: "not_posted" },
                { label: "Posted", value: "posted" },
                { label: "Floating", value: "floating" },
            ]
        } 
    ];

    const columns = [
        {
            header: "Date & Time",
            accessor: "transaction_date",
            render: (row) => (
                <TransactionTableCell type="transaction_date" row={row} />
            ),
        },
        {
            header: "Transaction",
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
            header: "Receipt",
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
    
    const {
        transactionList,
        setTransactionList,
        currentPageTransaction,
        setCurrentPageTransaction,
        totalPageTransaction,
        setTotalPageTransaction,
    } = useTransactionContext();

    const getTransactionList = async () => {
        const response = await transaction.transactionList(
            currentPageTransaction
        );
        setTransactionList(response.data.data);
        setTotalPageTransaction(response.data.last_page);
    };

    const handlePageClick = (data) => {
        setCurrentPageTransaction(data.selected);
    };

    useEffect(() => {
        getTransactionList();
    }, [currentPageTransaction]);

    /*  const data = [
        {
            transaction_id: "TXN123456",
            payment_method: "Credit Card",
            transaction_type: "Online Payment",
            transaction_reference_number: "REF987654",
            project_name: "Greenwood Residences",
            amount: 15000.75,
            email: "customer@example.com",
            remarks: "Payment for reservation",
            payment_option: "Full Payment",
            aggregator: "PayPal",
            destination_bank: "ABC Bank",
            settlement_bank: "XYZ Bank",
            transaction_date: "2024-03-08",
            transaction_time: "14:30:00",
            collection_receipt_link: "https://example.com/receipt/123456",
            transaction_invoice_number: "INV-20240308-001",
            document_number: "DOC-987654",
            transaction_status: "Completed",
        },
        {
            transaction_id: "TXN789012",
            payment_method: "Debit",
            transaction_type: "Direct Deposit",
            transaction_reference_number: "REF654321",
            project_name: "Sunrise Villas",
            amount: 25000.0,
            email: "buyer@example.com",
            remarks: "Down payment",
            payment_option: "Partial Payment",
            aggregator: "Stripe",
            destination_bank: "DEF Bank",
            settlement_bank: "LMN Bank",
            transaction_date: "2024-03-07",
            transaction_time: "10:15:00",
            collection_receipt_link: "https://example.com/receipt/789012",
            transaction_invoice_number: "INV-20240307-002",
            document_number: "DOC-654321",
            transaction_status: "Pending",
        },
    ]; */

 

    return (
        <>
            <div className="overflow-y-hidden px-3 space-y-2">
                <div className="px-2">
                    <TransactionSearchBar fields={fields}/>
                </div>
                <GlobalTable columns={columns} data={transactionList} />
                <div className="flex justify-end mt-4">
                    <div className="flex w-full justify-end mt-3 mb-10">
                        <ReactPaginate
                            previousLabel={
                                <MdKeyboardArrowLeft className="text-[#404B52]" />
                            }
                            nextLabel={
                                <MdKeyboardArrowRight className="text-[#404B52]" />
                            }
                            breakLabel={"..."}
                            pageCount={totalPageTransaction}
                            marginPagesDisplayed={2}
                            pageRangeDisplayed={1}
                            onPageChange={handlePageClick}
                            containerClassName={"flex gap-2"}
                            previousClassName="border border-[#EEEEEE] text-custom-bluegreen font-semibold w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:text-white hover:bg-custom-lightgreen hover:text-white"
                            nextClassName="border border-[#EEEEEE] text-custom-bluegreen font-semibold w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:text-white hover:bg-custom-lightgreen hover:text-white"
                            pageClassName="border border-[#EEEEEE] text-black w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:bg-custom-lightgreen text-[12px]"
                            activeClassName="w-[26px] h-[24px] border border-[#EEEEEE] bg-custom-lightgreen text-[#404B52] rounded-[4px] text-white text-[12px]"
                            pageLinkClassName="w-full h-full flex justify-center items-center"
                            activeLinkClassName="w-full h-full flex justify-center items-center"
                            disabledLinkClassName={
                                "text-gray-300 cursor-not-allowed"
                            }
                            forcePage={currentPageTransaction}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default TransactionCom;

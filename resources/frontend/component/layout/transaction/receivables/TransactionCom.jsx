import React, { useEffect, useState } from "react";
import GlobalTable from "../GlobalTable";
import TransactionTableCell from "./TransactionTableCell";
import { useTransactionContext } from "@/context/Transaction/TransactionContext";
import { transaction } from "@/component/servicesApi/apiCalls/transactions";
import ReactPaginate from "react-paginate";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import TransactionSearchBar from "@/component/layout/transaction/TransactionSearchBar";
import { useStateContext } from "@/context/contextprovider";
import { toLowerCaseText } from "../../propertyandpricingpage/utils/formatToLowerCase";

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
        dataToSubmit,
        setDataToSubmit
        
    } = useTransactionContext();

    const {propertyNamesList} = useStateContext();
    const [searchValues, setSearchValues] = useState({});

    const fields = [
        { name: "customer_name", label: "Name" },
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
                ...propertyNamesList.map((item) => {
                    return {label: toLowerCaseText(item), value: item};
                })
            ],
        },
        { name: "invoice_number", label: "Invoice Number" },
        { name: "document_number", label: "Document Number" },
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
        setDataToSubmit(searchValues);
        setSearchValues({});
    }; 

    const getTransactionList = async () => {
        const response = await transaction.transactionList(
            currentPageTransaction,
            dataToSubmit
        );
        setTransactionList(response.data.data);
        setTotalPageTransaction(response.data.last_page);
    };

    const handlePageClick = (data) => {
        setCurrentPageTransaction(data.selected);
    };

    useEffect(() => {
        getTransactionList();
    }, [currentPageTransaction, dataToSubmit]);


    return (
        <>
            <div className="overflow-y-hidden px-3 space-y-2">
                <div className="px-2">
                    <TransactionSearchBar
                        fields={fields}
                        searchValues={searchValues}
                        setSearchValues={setSearchValues}
                        onChangeSearch={handleSearchValue}
                        onSubmit={onSubmit}
                    />
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

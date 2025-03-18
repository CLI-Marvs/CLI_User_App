import { Card } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import ReactPaginate from "react-paginate";
import { IoIosSend, IoMdArrowDropdown, IoMdTrash } from "react-icons/io";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { useStateContext } from "../../../../context/contextprovider";
import apiService from "../../../servicesApi/apiService";
import CircularProgress from "@mui/material/CircularProgress";
import { set } from "lodash";
import DataMatchTable from "../DataMatchTable";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiServiceSap from "../../../servicesApi/apiServiceSap";
import { data } from "autoprefixer";
import GlobalTable from "@/component/layout/transaction/GlobalTable";
import BankTableCell from "./BankTableCell";
import TransactionSearchBar from "@/component/layout/transaction/TransactionSearchBar";



const BankStatementCom = () => {
    const data = [
        {
            bank_name: "Bank of America",
            transaction_details: "Deposit",
            credit: "$1,000",
            debit: "$0",
            running_balance: "$5,000",
            status: "Posted",
            account_number: "123456789",
            transaction_number: "123456789",
            reference_number: "123456789",
            transact_date: "2025-01-31",
            transaction_code: "123456789",
        },
        {
            bank_name: "Chase Bank",
            transaction_details: "Withdrawal",
            credit: "$0",
            debit: "$500",
            running_balance: "$4,500",
            status: "Pending",
            account_number: "123456789",
            transaction_number: "123456789",
            reference_number: "123456789",
            transact_date: "2025-01-31",
            transaction_code: "123456789",
        },
    ];
    const fields = [
        { 
            name: "bank_name", 
            label: "Bank",
            type: "select",
            options: [
                { label: "Select Bank", value: "" }, 
                { label: "BDO", value: "bdo" },
                { label: "BPI", value: "bpi" },
                { label: "LANDBANK", value: "landbank" },
            ]
        }, 
        { name: "bank_transaction_number", label: "Transaction Number" },
        { name: "bank_document_number", label: "Document Number" },
        { name: "bank_transaction_code", label: "Transaction Code" },
        { name: "bank_reference_number", label: "Reference Number" },
        { 
            name: "bank_status", 
            label: "Status",
            type: "select",
            options: [
                { label: "Select Status", value: "" },
                { label: "Not Posted", value: "not_posted" },
                { label: "Posted", value: "posted" },
                { label: "Floating", value: "floating" },
            ]
        }, 
        { name: "bank_start_date", type: "date", label: "Date"} 
    ];
    
    
    const columns = [
        {
            header: "Bank",
            accessor: "bank_name",
            render: (row) => {
                return <BankTableCell type="bank_name" row={row} />;
            },
        },
        {
            header: "Transaction Details",
            accessor: "transaction_details",
            render: (row) => {
                return <BankTableCell type="transaction_details" row={row} />;
            },
        },
        {
            header: "Credit",
            accessor: "credit",
            render: (row) => {
                return <BankTableCell type="credit" row={row} />;
            },
        },
        {
            header: "Debit",
            accessor: "debit",
            render: (row) => {
                return <BankTableCell type="debit" row={row} />;
            },
        },
        {
            header: "Running Balance",
            accessor: "running_balance",
            render: (row) => {
                return <BankTableCell type="running_balance" row={row} />;
            },
        },
        {
            header: "Status",
            accessor: "status",
            render: (row) => {
                return <BankTableCell type="status" row={row} />;
            },
        },
    ];


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
                    <TransactionSearchBar fields={fields} />
                </div>
                <GlobalTable columns={columns} data={data} />
            </div>
        </>
    );
};

export default BankStatementCom;

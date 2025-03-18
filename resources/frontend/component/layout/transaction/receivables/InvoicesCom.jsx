import { Card } from "@mui/material";
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import ReactPaginate from "react-paginate";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import "./loader.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiServiceSap from "../../../servicesApi/apiServiceSap";
import DateLogo from "../../../../../../public/Images/Date_range.svg";
import apiService from "../../../servicesApi/apiService";
import moment from "moment";
import { useStateContext } from "@/context/contextprovider";
import GlobalTable from "../GlobalTable";
import InvoicesTableCell from "./InvoicesTableCell";
import { MdCalendarToday } from "react-icons/md";
import TransactionSearchBar from "@/component/layout/transaction/TransactionSearchBar";

const InvoicesCom = () => {
    const data = [
        {
            customer_name: "Mr. Ira Klark T. Fischer",
            contract_number: "10000023345",
            invoice_number: "10000023345",
            invoice_status: "Paid",
            invoice_amount: 10000,
            invoice_details: "Payment for the month",
            invoice_due_date: "2025-01-31",
            invoice_link: "https://www.google.com",
        },

        {
            customer_name: "Mr. Ira Klark T. Fischer",
            contract_number: "10000023345",
            invoice_number: "10000023345",
            invoice_status: "Unpaid",
            invoice_amount: 10000,
            invoice_details: "Payment for the month",
            invoice_due_date: "2025-01-31",
            invoice_link: "https://www.google.com",
        },
    ];

    const fields = [
        { name: "name", label: "Name" },
        { name: "contract_number", label: "Contract Number" },
        { name: "invoice_number", label: "Invoice Number" },
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
    ];

    const columns = [
        {
            header: "Customer Name",
            accessor: "customer_name",
            render: (row) => (
                <InvoicesTableCell type="customer_name" row={row} />
            ),
        },

        {
            header: "Invoice Details",
            accessor: "invoice_details", // Note: There's a typo in `data`, should be `invoice_description`
            render: (row) => (
                <InvoicesTableCell type="invoice_details" row={row} />
            ),
        },
        {
            header: "Status",
            accessor: "invoice_status",
            render: (row) => (
                <InvoicesTableCell type="invoice_status" row={row} />
            ),
        },
        {
            header: "Invoice Link",
            accessor: "invoice_link",
            render: (row) => (
                <InvoicesTableCell type="invoice_link" row={row} />
            ),
        },
    ];
    const [searchValues, setSearchValues] = useState({});


   /*  const sendSoapRequest = async () => {
        setSapLoader(true);
        const soapBody = `
      <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
      <soap:Header/>
      <soap:Body>
          <urn:ZdataWarehouse>
              <Yearmon>${sapDate}</Yearmon>
          </urn:ZdataWarehouse>
       </soap:Body>
      </soap:Envelope>
      `;

        try {
            const response = await apiServiceSap.post("proxy-sap", soapBody);
            getInvoices();
            setSapLoader(false);
            toast.success("Data retrieved from SAP successfully!");
        } catch (error) {
            console.error(
                "Error:",
                error.response ? error.response.data : error.message
            );
            setSapLoader(false);
        }
    }; */


    return (
        <>
            <div className="overflow-y-hidden px-3 flex flex-col space-y-2">
                <div className="px-2">
                    <TransactionSearchBar fields={fields} searchValues={searchValues} setSearchValues={setSearchValues}/>
                </div>
                <div className="flex gap-[15px] flex-wrap mb-[16px] px-2">
                    <div className="relative flex border w-max border-custom-lightgreen rounded-[5px] shrink-0 z-10">
                        <span className="border-white text-white bg-custom-lightgreen text-sm flex items-center w-max px-[15px] pl-3 py-1 shrink-0 cursor-default">
                            From
                        </span>
                        <div className="relative flex items-center bg-white">
                            <DatePicker
                                className="outline-none w-[126px] h-full text-sm px-2 cursor-pointer"
                                calendarClassName="custom-calendar"
                            />
                        </div>
                        <span className="absolute inset-y-0 right-0 flex items-center text-white pr-3 pl-3 bg-custom-lightgreen pointer-events-none">
                            <MdCalendarToday />
                        </span>
                        <span className="text-white bg-custom-lightgreen text-sm flex items-center w-max px-[15px] pl-3 py-1 shrink-0 cursor-default">
                            To
                        </span>
                        <div className="relative flex items-center bg-white">
                            <DatePicker
                                /*   selected={endDateValue} */
                                className="outline-none w-[156px] h-full text-sm px-2 cursor-pointer"
                                calendarClassName="custom-calendar"
                            />
                        </div>
                        <span className="absolute inset-y-0 right-0 flex items-center text-white pr-3 pl-3 bg-custom-lightgreen pointer-events-none cursor-pointer">
                            <MdCalendarToday />
                        </span>
                    </div>
                    <div className="flex items-center justify-center">
                        <button className="px-4 w-[153px] h-[37px] text-white font-semibold rounded-md bg-gradient-to-r from-[#348017] to-[#175D5F] hover:opacity-90 transition duration-300">
                            Sap Sync
                        </button>
                    </div>
                </div>
                <GlobalTable columns={columns} data={data} />
            </div>
        </>
    );
};

export default InvoicesCom;

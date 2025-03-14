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

const InvoicesCom = () => {
    const {
        invoices,
        setInvoicesPageCount,
        currentPageInvoices,
        invoicesPageCount,
        setCurrentPageInvoices,
        getInvoices,
        setFilterDueDate,
        filterDueDate,
        userAccessData,
    } = useStateContext();

    const [startDate, setStartDate] = useState(null);
    const [sapDate, setSapDate] = useState(null);
    const [sapLoader, setSapLoader] = useState(false);
    const [isDate, setIsDate] = useState(null);
    const [hasPermission, setHasPermission] = useState(false);
    const [canWrite, setCanWrite] = useState(false);
    const handlePageChange = (data) => {
        const selectedPage = data.selected + 1;
        setCurrentPageInvoices(selectedPage);
    };

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

    useEffect(() => {
        if (userAccessData) {
            const transactionPermissions =
                userAccessData?.employeePermissions?.find(
                    (perm) => perm.name === "Transaction Management"
                ) ||
                userAccessData?.departmentPermissions?.find(
                    (perm) => perm.name === "Transaction Management"
                );
            setCanWrite(transactionPermissions?.pivot?.can_write);
        }
    }, [userAccessData]);
    const handleDateChange = (date) => {
        if (date) {
            const year = date.getFullYear(); // Get the full year (e.g., 2024)
            const month = ("0" + (date.getMonth() + 1)).slice(-2); // Get month (0-11), add 1, and pad with 0 for single digits

            const formattedDate = `${year}${month}`; // Combine year and month as '202410'
            setStartDate(date); // This will return '202410' for Oct 2024
            setSapDate(formattedDate);
        }
    };

    const handleFilterDueDate = (date) => {
        const formattedDate = moment(date).format("YYYY-MM-DD");
        setFilterDueDate(formattedDate);
        setIsDate(date);
    };

    const sendSoapRequest = async () => {
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
    };

    const capitalizeFirstLetter = (name) => {
        if (name) {
            return name
                .split(" ")
                .map(
                    (word) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase()
                )
                .join(" ");
        }
    };

    useEffect(() => {
        getInvoices();
    }, []);

    return (
        <>
            {/* {sapLoader && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex flex-col items-center justify-center z-50">
                    <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16 mb-4"></div>
                    <p className="text-white text-lg">
                        Please wait, Retrieving data from SAP...
                    </p>
                </div>
            )} */}

            {/*  <div className="px-4">
                <ToastContainer position="top-center" />
                <div className="flex justify-between mb-4 gap-5">
                    <div className="flex gap-5">
                        <div className="relative border border-gray-500 z-40">
                            <DatePicker
                                selected={startDate}
                                onChange={handleDateChange}
                                className=" outline-none w-[176px] text-sm"
                                calendarClassName="custom-calendar"
                            />

                            <img
                                alt="date"
                                src={DateLogo}
                                className="absolute top-[45%] right-0 transform -translate-y-1/2 text-custom-bluegreen size-6  pointer-events-none"
                            />
                        </div>
                        {canWrite && (
                            <button
                                className="h-[38px] w-[121px] gradient-btn5 text-white  text-xs rounded-[10px]"
                                onClick={sendSoapRequest}
                            >
                                {" "}
                                SAP Sync
                            </button>
                        )}
                    </div>
                </div>
                <table className="min-w-full bg-white border border-gray-500 border-collapse">
                    <thead>
                        <tr>
                            <th className=" px-4 border border-gray-500">
                                Contract No.
                            </th>
                            <th className=" px-4 border border-gray-500">
                                Invoice Number
                            </th>
                            <th className=" px-4 border border-gray-500">
                                Customer Name
                            </th>
                            <th className=" px-4 border border-gray-500">
                                Status
                            </th>
                            <th className=" px-4 border border-gray-500">
                                Invoice Amount
                            </th>
                            <th className=" px-4 border border-gray-500">
                                Invoice Description
                            </th>

                            <th className=" px-4 border border-gray-500">
                                Invoice Due Date
                            </th>
                            <th className=" px-4 border border-gray-500">
                                Invoice Link
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.length > 0 ? (
                            invoices.map((item, index) => (
                                <tr key={index}>
                                    <td className=" px-4 border border-gray-500">
                                        {item.contract_number}
                                    </td>
                                    <td className=" px-4 border border-gray-500">
                                        {item.document_number}
                                    </td>
                                    <td className=" px-4 border border-gray-500">
                                        {capitalizeFirstLetter(
                                            item.customer_name
                                        )}
                                    </td>
                                    <td className=" px-4 border border-gray-500">
                                        {item.invoice_status}
                                    </td>
                                    <td className=" px-4 border border-gray-500">
                                        {item.invoice_amount ? (
                                            new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 2 }).format(item.invoice_amount)
                                        ) : null}
                                    </td>
                                    <td className=" px-4 border border-gray-500">
                                        {item.description}
                                    </td>
                                    <td className=" px-4 border border-gray-500">
                                        {item.due_date}
                                    </td>
                                    <td className="px-4 border border-gray-500">
                                        {item.invoice_link ? (
                                            <a
                                                href={
                                                    item.invoice_link
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="cursor-pointer underline"
                                            >
                                                View Document
                                            </a>
                                        ) : null}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <>
                                <tr>
                                    <td
                                        className="text-md px-4 py-2 text-center"
                                        colSpan={8}
                                    >
                                        No data to show
                                    </td>
                                </tr>
                            </>
                        )}


                    </tbody>
                </table>
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
                            pageCount={invoicesPageCount}
                            marginPagesDisplayed={2}
                            pageRangeDisplayed={1}
                            onPageChange={handlePageChange}
                            containerClassName={"flex gap-2"}
                            previousClassName="border border-[#EEEEEE] text-custom-bluegreen font-semibold w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:text-white hover:bg-custom-lightgreen hover:text-white"
                            nextClassName="border border-[#EEEEEE] text-custom-bluegreen font-semibold w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:text-white hover:bg-custom-lightgreen hover:text-white"
                            pageClassName=" border border-[#EEEEEE] bg- text-black w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:bg-custom-lightgreen text-[12px]"
                            activeClassName="w-[26px] h-[24px] border border-[#EEEEEE] bg-custom-lightgreen text-[#404B52] rounded-[4px] text-white text-[12px]"
                            pageLinkClassName="w-full h-full flex justify-center items-center"
                            activeLinkClassName="w-full h-full flex justify-center items-center"
                            disabledLinkClassName={
                                "text-gray-300 cursor-not-allowed"
                            }
                        />
                    </div>
                </div>
            </div> */}

            <div className="overflow-y-hidden px-3 mt-3">
                <div className="flex gap-[15px] flex-wrap px-3 mb-[21px]">
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

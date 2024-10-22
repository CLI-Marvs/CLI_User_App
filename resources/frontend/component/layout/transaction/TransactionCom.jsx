import { Card } from "@mui/material";
import React, { useState } from "react";
import { useStateContext } from "../../../context/contextprovider";
import DatePicker from "react-datepicker";
import DateLogo from "../../../../../public/Images/Date_range.svg";
import ReactPaginate from "react-paginate";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";

const TransactionCom = () => {
    const {
        invoices,
        setInvoicesPageCount,
        currentPageInvoices,
        invoicesPageCount,
        setCurrentPageInvoices,
        getInvoices
    } = useStateContext();

    const [startDate, setStartDate] = useState(null);
    const [sapDate, setSapDate] = useState(null);
    const handlePageChange = (data) => {
        const selectedPage = data.selected + 1;
        setCurrentPageInvoices(selectedPage);
    };

    const handleDateChange = (date) => {
        const year = date.getFullYear(); // Get the full year (e.g., 2024)
        const month = ("0" + (date.getMonth() + 1)).slice(-2); // Get month (0-11), add 1, and pad with 0 for single digits

        const formattedDate = `${year}${month}`; // Combine year and month as '202410'
        setStartDate(date); // This will return '202410' for Oct 2024
        setSapDate(formattedDate)

    };

    console.log("startDate", sapDate);

    const sendSoapRequest = async () => {
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

        const username = "KBELMONTE";
        const password = "1234567890!Ab!";
        const authHeader = "Basic " + btoa(`${username}:${password}`);

        const config = {
            headers: {
                "Content-Type": "application/soap+xml",
                Authorization: authHeader,
            },
        };

        try {
            const response = await axios.post(
                "https://admin-dev.cebulandmasters.com/api/proxy-sap",
                soapBody,
                config
            );
            console.log("Response:", response.data);
            getInvoices();
        } catch (error) {
            console.error(
                "Error:",
                error.response ? error.response.data : error.message
            );
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

    return (
        <div className="px-4">
            {/* Table */}
            <div className="flex mb-4 gap-5">
                <div className="relative border border-gray-500">
                    <DatePicker
                        selected={startDate}
                        onChange={handleDateChange}
                        className=" outline-none w-[176px] text-sm"
                        calendarClassName="custom-calendar"
                    />

                    <img
                        src={DateLogo}
                        alt="date"
                        className="absolute top-[45%] right-0 transform -translate-y-1/2 text-custom-bluegreen size-6  pointer-events-none"
                    />
                </div>
                <button
                    /* onClick={sendSoapRequest} */
                    className="h-[38px] w-[121px] gradient-btn5 text-white  text-xs rounded-[10px]"
                    onClick={sendSoapRequest}
                >
                    {" "}
                    SAP Sync
                </button>
            </div>
            <table className="min-w-full bg-white border border-gray-500 border-collapse">
                <thead>
                    <tr>
                        <th className=" px-4 border border-gray-500">
                            Contract No.
                        </th>
                        <th className=" px-4 border border-gray-500">
                            Customer Name
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
                    </tr>
                </thead>
                <tbody>
                    {invoices.length > 0 &&
                        invoices.map((item, key) => (
                            <tr key={key}>
                                <td className=" px-4 border border-gray-500">
                                    {item.contract_number}
                                </td>
                                <td className=" px-4 border border-gray-500">
                                    {capitalizeFirstLetter(item.customer_name)}
                                </td>
                                <td className=" px-4 border border-gray-500">
                                    {item.invoice_amount}
                                </td>
                                <td className=" px-4 border border-gray-500">
                                    {item.description}
                                </td>
                                <td className=" px-4 border border-gray-500">
                                    {item.due_date}
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>

            {/* Pagination */}
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
                        /*       forcePage={currentPageInvoices} */
                    />
                </div>
            </div>
        </div>
    );
};

export default TransactionCom;

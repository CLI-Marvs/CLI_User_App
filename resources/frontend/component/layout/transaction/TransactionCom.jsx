import { Card } from "@mui/material";
import React, { useState } from "react";
import { useStateContext } from "../../../context/contextprovider";


const TransactionCom = () => {
   const {invoices} = useStateContext();
    const sampleData = [
        { id: 1, name: "John Doe", email: "john@example.com" },
        { id: 2, name: "Jane Smith", email: "jane@example.com" },
        { id: 3, name: "Alice Johnson", email: "alice@example.com" },
        { id: 4, name: "Bob Brown", email: "bob@example.com" },
        { id: 5, name: "Charlie Davis", email: "charlie@example.com" },
    ];

    const [filterText, setFilterText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;

    const filteredData = sampleData.filter((item) =>
        item.name.toLowerCase().includes(filterText.toLowerCase())
    );

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const sendSoapRequest = async () => {
        const soapBody = `
      <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
      <soap:Header/>
      <soap:Body>
          <urn:ZdataWarehouse>
              <Yearmon>202410</Yearmon>
          </urn:ZdataWarehouse>
       </soap:Body>
      </soap:Envelope>
      `;

        const username = "KBELMONTE";
        const password = "1234567890!Ab";
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
        } catch (error) {
            console.error(
                "Error:",
                error.response ? error.response.data : error.message
            );
        }
    };

    return (
        <div className="flex-grow">
            <Card className="h-full p-10">
                <button onClick={sendSoapRequest}>testUpload</button>
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Filter by name"
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        className="p-2 border border-gray-500 rounded-lg w-full"
                    />
                </div>

                {/* Table */}
                <table className="min-w-full bg-white border border-gray-500 border-collapse">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border border-gray-500">
                                Contract No
                            </th>
                            <th className="py-2 px-4 border border-gray-500">
                                Customer Name
                            </th>
                            <th className="py-2 px-4 border border-gray-500">
                                Invoice Amount
                            </th>
                            <th className="py-2 px-4 border border-gray-500">
                                Invoice Description
                            </th>
                            <th className="py-2 px-4 border border-gray-500">
                                Invoice Due Date
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.map((item) => (
                            <tr key={item.id}>
                                <td className="py-2 px-4 border border-gray-500">
                                    {item.contract_number}
                                </td>
                                <td className="py-2 px-4 border border-gray-500">
                                    {item.customer_name}
                                </td>
                                <td className="py-2 px-4 border border-gray-500">
                                    {item.invoice_amount}
                                </td>
                                <td className="py-2 px-4 border border-gray-500">
                                    {item.description}
                                </td>
                                <td className="py-2 px-4 border border-gray-500">
                                    {item.due_date}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="flex justify-end items-center mt-4">
                    <button
                        className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>
                    <div>
                        Page {currentPage} of {totalPages}
                    </div>
                    <button
                        className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            </Card>
        </div>
    );
};

export default TransactionCom;

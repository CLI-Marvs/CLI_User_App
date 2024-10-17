import { Card } from "@mui/material";
import React, { useState } from "react";

const BankStatementCom = () => {
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
    return (
        <div className="flex-grow">
            <Card className="h-full p-10">
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
                                ID
                            </th>
                            <th className="py-2 px-4 border border-gray-500">
                                Namess
                            </th>
                            <th className="py-2 px-4 border border-gray-500">
                                Email
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((item) => (
                            <tr key={item.id}>
                                <td className="py-2 px-4 border border-gray-500">
                                    {item.id}
                                </td>
                                <td className="py-2 px-4 border border-gray-500">
                                    {item.name}
                                </td>
                                <td className="py-2 px-4 border border-gray-500">
                                    {item.email}
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

export default BankStatementCom;

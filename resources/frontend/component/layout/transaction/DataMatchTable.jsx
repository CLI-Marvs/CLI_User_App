import React from "react";

const DataMatchTable = ({ matchesData }) => {
    return (
        <table className="min-w-full bg-white border border-gray-500 border-collapse">
            <thead>
                <tr>
                    <th className=" px-4 border border-gray-500">Date</th>
                    <th className=" px-4 border border-gray-500">Bank</th>
                    <th className=" px-4 border border-gray-500">
                        Payment Channel
                    </th>
                    <th className=" px-4 border border-gray-500">
                        Transact By
                    </th>
                    <th className=" px-4 border border-gray-500">
                        Contract No/ Reference No.
                    </th>
                    <th className=" px-4 border border-gray-500">Status</th>
                    <th className=" px-4 border border-gray-500">
                        Invoice Link
                    </th>
                    <th className=" px-4 border border-gray-500">
                        Receipt Link
                    </th>
                </tr>
            </thead>
            <tbody>
                {transactions.length > 0 &&
                    transactions.map((item, index) => (
                        <tr key={index}>
                            <td className=" px-4 border border-gray-500">
                                {item.transaction_date}
                            </td>
                            <td className=" px-4 border border-gray-500">
                                {item.bank_name}
                            </td>
                            <td className=" px-4 border border-gray-500">
                                {item.payment_channel}
                            </td>
                            <td className=" px-4 border border-gray-500">
                                {item.transact_by}
                            </td>
                            <td className=" px-4 border border-gray-500">
                                {item.reference_number}
                            </td>
                            <td className=" px-4 border border-gray-500">
                                {item.status === "not_posted"
                                    ? "Not Posted"
                                    : "Posted"}
                            </td>
                            <td className=" px-4 border border-gray-500">
                                {item.invoice_link}
                            </td>
                            <td className=" px-4 border border-gray-500">
                                {item.receipt_link}
                            </td>
                        </tr>
                    ))}
            </tbody>
        </table>
    );
};

export default DataMatchTable;

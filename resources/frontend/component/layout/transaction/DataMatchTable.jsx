import React from "react";

const DataMatchTable = ({ matchesData }) => {

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
        <table className="min-w-full bg-white border border-gray-500 border-collapse">
            <thead>
                <tr>
                    <th className=" px-4 border border-gray-500">
                        Contract Number{" "}
                    </th>
                    <th className=" px-4 border border-gray-500">
                        Customer Name{" "}
                    </th>
                    <th className=" px-4 border border-gray-500">
                        Invoice Amount
                    </th>
                </tr>
            </thead>
            <tbody>
                {matchesData.length > 0 &&
                    matchesData.map((item, index) => (
                        <tr key={index}>
                            <td className=" px-4 border border-gray-500">
                                {item.RECNNR}
                            </td>
                            <td className=" px-4 border border-gray-500">
                                {capitalizeFirstLetter(item.D_NAME1)}
                            </td>
                            <td className=" px-4 border border-gray-500">
                                {item.AMT}
                            </td>
                        </tr>
                    ))}
            </tbody>
        </table>
    );
};

export default DataMatchTable;

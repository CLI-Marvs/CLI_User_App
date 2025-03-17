import React from "react";

const GlobalTable = ({ columns, data }) => {
    return (
        <div className="overflow-x-auto px-2">
            <table className="border-separate border-spacing-y-2 w-full min-w-max">
                <thead>
                    <tr className="text-white bg-custom-lightgreen">
                        {columns.map((col, index) => (
                            <th
                                key={index}
                                className="border-r-[1px] border-[#B9B7B7] px-[10px] py-[16px] text-sm shadow-custom12 font-semibold text-center"
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.length > 0 ? (
                        <>
                            {data.map((row, rowIndex) => (
                                <tr
                                    key={rowIndex}
                                    className="border-r-[1px] border-opacity-10 border-[#B9B7B7] shadow-custom11"
                                >
                                    {columns.map((col, colIndex) => (
                                        <td
                                            className="px-3 py-3 cursor-pointer w-[208px] text-xs border-r-[1px] border-opacity-50 border-[#B9B7B7] relative"
                                            key={colIndex}
                                        >
                                            {col.render
                                                ? col.render(row)
                                                : row[col.accessor]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </>
                    ) : (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="text-center py-4 text-gray-500"
                            >
                                No data to show.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default GlobalTable;

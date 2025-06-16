import React from "react";

const CustomTableHeader = ({ columns, className = "" }) => {
    return (
        <thead>
            <tr className={`${className}`}>
                {columns.map((col, index) => (
                    <th
                        key={index}
                        className={`text-start shrink-0 pl-1 ${col.width}   `}
                    >
                        {col.label}
                    </th>
                ))}
            </tr>
        </thead>
    );
};

export default CustomTableHeader;

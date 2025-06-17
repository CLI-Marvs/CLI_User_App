import React from "react";

const CustomTableHeader = ({
    columns,
    className = "",
    textAlign = "text-start",
}) => {
    return (
        <thead>
            <tr className={`${className}`}>
                {columns.map((col, index) => (
                    <th
                        key={index}
                        className={`${textAlign} shrink-0 pl-1 ${col.width}   `}
                    >
                        {col.label}
                    </th>
                ))}
            </tr>
        </thead>
    );
};

export default CustomTableHeader;

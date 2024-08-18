import React, { useState } from 'react';
import { TiPin } from "react-icons/ti";

const TicketTable = () => {
    const [checkedRows, setCheckedRows] = useState([]); // Track checked rows

    const handleCheckboxChange = (index) => {
        setCheckedRows(prevCheckedRows => 
            prevCheckedRows.includes(index)
                ? prevCheckedRows.filter(rowIndex => rowIndex !== index)
                : [...prevCheckedRows, index]
        );
    };

    const data = [
        {
            id: 1,
            user: 'Mister Admin',
            property: 'Casa Mira',
            code: 'CM0000002',
            message: 'Hello Sir Admin, I have an issue regarding my bank account',
            date: 'July 24'
        },
        // Add more data as needed
    ];

    return (
        <table className='flex flex-col gap-1 w-full'>
            <tbody>
                {data.map((row, index) => (
                    <tr
                        key={row.id}
                        className={`flex items-center h-7 cursor-pointer mb-1
                            ${checkedRows.includes(index) ? 'bg-custom-lightgreen' : 'bg-white'}
                            hover:shadow-custom
                        `}
                    >
                        <td className='w-10 flex justify-center'>
                            <input
                                type="checkbox"
                                checked={checkedRows.includes(index)}
                                onChange={() => handleCheckboxChange(index)}
                                className="cursor-pointer"
                            />
                        </td>
                        <td className='w-14 flex justify-center text-xl'>
                            <TiPin />
                        </td>
                        <td className="w-40 font-semibold text-custom-bluegreen">
                            <p>{row.user}</p>
                        </td>
                        <td className="flex flex-1 gap-1 text-custom-bluegreen">
                            <div className="font-semibold whitespace-nowrap">
                                <span>{row.property}</span><span> (Property) </span><span> - </span><span>{row.code}</span>
                            </div>
                            <div className="flex-1 flex items-center w-10 pr-12">
                                <p className="text-sm-light truncate text-gray-400">
                                    {row.message}
                                </p>
                            </div>
                        </td>
                        <td className='w-28 flex justify-end px-3 text-custom-bluegreen font-semibold'>
                            {row.date}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default TicketTable;

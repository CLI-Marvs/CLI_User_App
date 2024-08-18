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

    return (
        <>
            <table className='flex flex-col gap-1 w-full mt-1'>
                <tbody>
                    {[...Array(10)].map((_, index) => (
                        <tr
                            key={index}
                            className={`flex items-center h-7 cursor-pointer mb-1
                                ${checkedRows.includes(index) ? 'bg-custom-lightestgreen' : 'bg-white'} 
                                ${!checkedRows.includes(index) ? 'hover:shadow-custom' : ''}`}
                        >
                           {/*  <td className="w-12 flex justify-center">
                                <input
                                    type="checkbox"
                                    checked={checkedRows.includes(index)}
                                    onChange={() => handleCheckboxChange(index)}
                                />
                            </td> */}
                            <td className='w-14 flex justify-center text-xl'>
                                <TiPin />
                            </td>
                            <td className="w-40 font-semibold text-custom-bluegreen">
                                <p>Mister Admin</p>
                            </td>
                            <td className="flex flex-1 gap-1 text-custom-bluegreen">
                                <div className="font-semibold whitespace-nowrap">
                                    <span>Casa Mira</span><span> (Property) </span><span> - </span><span>CM0000002</span>
                                </div>
                                <div className="flex-1 flex items-center w-10 pr-12">
                                    <p className="text-sm-light truncate text-gray-400">
                                        Hello Sir Admin, I have an issue regarding my bank account
                                    </p>
                                </div>
                            </td>
                            <td className='w-28 flex justify-end px-3 text-custom-bluegreen font-semibold'>
                                July 24
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
};

export default TicketTable;

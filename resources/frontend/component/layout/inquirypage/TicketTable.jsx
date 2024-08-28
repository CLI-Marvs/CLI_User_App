import React, { useEffect, useState } from "react";
import { TiPin, TiPinOutline } from "react-icons/ti";
import { Link, useNavigate } from "react-router-dom";
import { useStateContext } from "../../../context/contextprovider";

const TicketTable = ({ setConcernData }) => {
    const [checkedRows, setCheckedRows] = useState([]); // Track checked rows
    const {getMessages, getAllConcerns} = useStateContext();
    const handleCheckboxChange = (index) => {
        setCheckedRows((prevCheckedRows) =>
            prevCheckedRows.includes(index)
                ? prevCheckedRows.filter((rowIndex) => rowIndex !== index)
                : [...prevCheckedRows, index]
        );
    };

    const navigate = useNavigate();

    const [isPinned, setIsPinned] = useState(false);

    const [data, setData] = useState([
        {
            id: 1,
            firstname: "Kent",
            lastname: "Armelia",
            property: "Casa Mira",
            type: "Transaction",
            code: "CM0000002",
            message:
                "Hello Sir Admin, I have an issue regarding my bank account",
            action: "Inquiry Feedback Received",
            date: "July 25",
            isPinned: false,
        },
        {
            id: 2,
            firstname: "Tanjiro",
            lastname: "Kamado",
            property: "38 Park Ave.",
            type: "Property",
            code: "38P000031",
            message:
                "Hello Sir Admin, I have an issue regarding my bank account",
            action: 'Assigned to "Name | Dept"',
            date: "11:41 AM",
            isPinned: false,
        },
    ]);

    const togglePin = (index) => {
        const updatedData = data.map((row, i) =>
            i === index ? { ...row, isPinned: !row.isPinned } : row
        );
        setData(updatedData);
    };

    const navigateToThread = (items) => {
        getMessages(items.ticket_id);
        const encodedTicketId = encodeURIComponent(items.ticket_id);
        navigate(`/inquirymanagement/thread/${encodedTicketId}`, {
            state: { item: items },
        });
    };
    
    return (
        <table className="flex flex-col gap-1 w-full">
            <tbody>
                {setConcernData &&
                    setConcernData.map((row, index) => (
                        <tr
                            key={row.id}
                            onClick={() => navigateToThread(row)}
                            className={`flex items-center h-7 cursor-pointer mb-1 bg-white
                           /*  
                            hover:shadow-custom
                        `}
                        >
                            {/*  <td className='w-10 flex justify-center'>
                            <input
                                type="checkbox"
                                checked={checkedRows.includes(index)}
                                onChange={() => handleCheckboxChange(index)}
                                className="cursor-pointer"
                            />
                        </td> */}
                            <td className="w-14 flex justify-center text-xl text-custom-solidgreen">
                                <button onClick={() => togglePin(index)}>
                                    {row.isPinned ? (
                                        <TiPin />
                                    ) : (
                                        <TiPinOutline />
                                    )}
                                </button>
                            </td>
                            <td className="w-40 font-semibold text-custom-bluegreen">
                                <p>{row.buyer_name}</p>
                            </td>
                            <td className="flex flex-1 gap-1 text-custom-bluegreen">
                                <div className="font-semibold whitespace-nowrap">
                                    <span>{row.property}</span>
                                    <span> (Transaction) </span>
                                    <span> - </span>
                                    <span>{row.ticket_id}</span>
                                </div>
                                <div className="flex items-center w-48 mr-4">
                                    <p className="text-sm-light truncate text-gray-400">
                                        {row.details_message}
                                    </p>
                                </div>
                            </td>
                            <td className="w-56 flex items-center text-custom-lightgreen">
                                <p className="truncate">{row.action}</p>
                            </td>
                            <td className="w-28 flex justify-end px-3 text-custom-bluegreen font-semibold">
                                {row.date}
                            </td>
                        </tr>
                    ))}
            </tbody>
        </table>
    );
};

export default TicketTable;

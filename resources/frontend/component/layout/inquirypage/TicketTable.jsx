import React, { useEffect, useState } from "react";
import { TiPin, TiPinOutline } from "react-icons/ti";
import { Link, useNavigate } from "react-router-dom";
import { useStateContext } from "../../../context/contextprovider";
import moment from "moment";

const TicketTable = ({ concernData }) => {
    const [checkedRows, setCheckedRows] = useState([]); 
    const {getMessages, getAllConcerns, user} = useStateContext();
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
        getAllConcerns();
        const encodedTicketId = encodeURIComponent(items.ticket_id);
        navigate(`/inquirymanagement/thread/${encodedTicketId}`/* , {
            state: { item: items },
        } */);
    };

    const formatTime = (createdAt) => {
        const date = new Date(createdAt);
        const now = new Date();
      
        const isToday = date.toDateString() === now.toDateString();
        
        if (isToday) {
          let hours = date.getHours();
          const minutes = date.getMinutes();
          const ampm = hours >= 12 ? 'pm' : 'am';
          
          hours = hours % 12;
          hours = hours ? hours : 12; 
          
          const formattedTime = `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
          return formattedTime;
        } else {
          const options = { month: 'long', day: 'numeric' };
          return date.toLocaleDateString(undefined, options);
        }
      };
    return (
        <table className="flex flex-col gap-1 w-full">
            <tbody>
                {concernData && 
                    concernData.map((row, index) => (
                        <tr
                            key={row.id}
                            onClick={() => navigateToThread(row)}
                            className={`flex items-center h-7 cursor-pointer mb-1 text-sm bg-white
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
                            <td className="w-[60px] shrink-0 flex justify-center text-xl text-custom-solidgreen">
                                <button onClick={() => togglePin(index)}>
                                    {row.isPinned ? (
                                        <TiPin />
                                    ) : (
                                        <TiPinOutline />
                                    )}
                                </button>
                            </td>
                            <td className="shrink-0 font-semibold text-custom-bluegreen">
                                <p className="w-[130px] pr-2 truncate">{(() => {
                                    const nameParts = row.buyer_name.split(" ");
                                    const lastName = nameParts.pop();
                                    const firstName = nameParts.join(" ");
                                    return `${lastName}, ${firstName}`;
                                    })()}W
                                </p>
                            </td>
                            <td className="flex flex-1 gap-1 truncate">
                                <p className="font-semibold text-custom-bluegreen truncate">
                                    <span className="flex-1 truncate">{row.property}</span> 
                                    <span className="text-gray-500 truncate">
                                        ({row.details_concern || "Transaction"})
                                    </span>
                                    <span className="text-gray-500"> - </span>
                                    <span className="text-gray-500 truncate">{row.ticket_id}</span>
                                </p>
                                <p className="flex-1 truncate overflow-hidden whitespace-nowrap text-sm text-gray-400">
                                    {row.details_message}
                                </p>
                            </td>
                            <td className="w-[210px] flex items-center text-custom-lightgreen">
                                <p className="truncate">{row.message_log}</p>
                            </td>
                            <td className="w-[110px] flex justify-end pr-3 text-custom-bluegreen font-semibold">
                              {formatTime(row.created_at)}
                            </td>
                        </tr>
                    ))}
            </tbody>
        </table>
    );
};

export default TicketTable;

import React, { useEffect, useState } from "react";
import { TiPin, TiPinOutline } from "react-icons/ti";
import { Link, useNavigate } from "react-router-dom";
import { useStateContext } from "../../../context/contextprovider";
import moment from "moment";
import apiService from "../../servicesApi/apiService";

const TicketTable = ({ concernData }) => {
    const [checkedRows, setCheckedRows] = useState([]);
    const {
        getMessages,
        getAllConcerns,
        user,
        setData,
        getInquiryLogs,
        getConcernMessages,
    } = useStateContext();
    const handleCheckboxChange = (index) => {
        setCheckedRows((prevCheckedRows) =>
            prevCheckedRows.includes(index)
                ? prevCheckedRows.filter((rowIndex) => rowIndex !== index)
                : [...prevCheckedRows, index]
        );
    };

    const navigate = useNavigate();

    const [isPinned, setIsPinned] = useState(false);

    const togglePin = async (index, row) => {
        const concernId = row.id;
        try {
            await apiService.post(`pin-concern/${concernId}`);
            getAllConcerns();
        } catch (error) {
            console.log("error", error);
        }
    };

    const navigateToThread = (items) => {
        getMessages(items.ticket_id);
        getAllConcerns();
        getInquiryLogs(items.ticket_id);
        getConcernMessages();
        const encodedTicketId = encodeURIComponent(items.ticket_id);
        navigate(
            `/inquirymanagement/thread/${encodedTicketId}` /* , {
            state: { item: items },
        } */
        );
    };

    const formatTime = (createdAt) => {
        const date = new Date(createdAt);
        const now = new Date();

        const isToday = date.toDateString() === now.toDateString();

        if (isToday) {
            let hours = date.getHours();
            const minutes = date.getMinutes();
            const ampm = hours >= 12 ? "pm" : "am";

            hours = hours % 12;
            hours = hours ? hours : 12;

            const formattedTime = `${hours}:${
                minutes < 10 ? "0" + minutes : minutes
            } ${ampm}`;
            return formattedTime;
        } else {
            const options = { month: "long", day: "numeric" };
            return date.toLocaleDateString(undefined, options);
        }
    };

    useEffect(() => {
        getAllConcerns();
    }, []);
    return (
        <table className="flex flex-col gap-1 w-full">
            <tbody>
                {concernData &&
                    concernData.map((row, index) => (
                        <tr
                            key={row.id}
                            onClick={() => navigateToThread(row)}
                            className={`flex items-center h-7 cursor-pointer mb-1 text-sm 
                            hover:shadow-custom
                            ${
                                row.status === "Resolved"
                                    ? row.ispinned === 1
                                        ? "bg-custom-lightestgreen"
                                        : "bg-custom-grayF1"
                                    : row.ispinned === 1
                                    ? "bg-custom-lightestgreen"
                                    : "bg-white"
                            }`}
                        >
                            {/*  <td className='w-10 flex justify-center'>
                            <input
                                type="checkbox"
                                checked={checkedRows.includes(index)}
                                onChange={() => handleCheckboxChange(index)}
                                className="cursor-pointer"
                            />
                        </td> */}
                            <td
                                className={`w-[60px] shrink-0 flex justify-center text-xl  ${
                                    row.status === "Resolved"
                                        ? "text-gray-500"
                                        : "text-custom-bluegreen"
                                }`}
                            >
                                <button
                                    className="hover:shadow-custom5 hover:rounded-full text-custom-solidgreen"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        togglePin(index, row);
                                    }}
                                >
                                    {row.ispinned === 1 ? (
                                        <TiPin />
                                    ) : (
                                        <TiPinOutline />
                                    )}
                                </button>
                            </td>
                            <td
                                className={`shrink-0 
                                ${
                                    row.status === "Resolved"
                                        ? "text-black font-normal"
                                        : "text-custom-bluegreen font-semibold"
                                }
                                `}
                            >
                                <p className={`w-[130px] pr-2  truncate `}>
                                    {(() => {
                                        const nameParts =
                                            row.buyer_name.split(" ");
                                        // Check if the middle name exists in the full name and remove it if it does
                                        if (row.buyer_middlename) {
                                            const middleName =
                                                row.buyer_middlename.toLowerCase();
                                            const middleNameIndex =
                                                nameParts.findIndex(
                                                    (part) =>
                                                        part.toLowerCase() ===
                                                        middleName
                                                );
                                            if (middleNameIndex !== -1) {
                                                nameParts.splice(
                                                    middleNameIndex,
                                                    1
                                                ); // Remove the middle name from the array
                                            }
                                        }

                                        const lastName = nameParts.pop();
                                        const firstName = nameParts.join(" ");
                                        const middleInitial =
                                            row.buyer_middlename
                                                ? `${row.buyer_middlename
                                                      .charAt(0)
                                                      .toUpperCase()}.`
                                                : "";

                                        // Helper function to capitalize the first letter of a string
                                        const capitalize = (name) =>
                                            name.charAt(0).toUpperCase() +
                                            name.slice(1).toLowerCase();
                                        return `${capitalize(
                                            lastName
                                        )}, ${capitalize(firstName)}${
                                            middleInitial
                                                ? `, ${middleInitial}`
                                                : ""
                                        }`;

                                        // return `${capitalize(
                                        //     lastName
                                        // )}, ${capitalize(
                                        //     firstName
                                        // )}, ${middleInitial} `;
                                    })()}
                                </p>
                            </td>
                            <td className="flex flex-1 gap-1 truncate">
                                <p
                                    className={`truncate
                                    ${
                                        row.status === "Resolved"
                                            ? "text-black font-normal"
                                            : "text-custom-bluegreen font-semibold"
                                    }
                                    `}
                                >
                                    <span className="flex-1 truncate">
                                        {row.property}
                                    </span>
                                    <span className="truncate">
                                        ({row.details_concern || "Transaction"})
                                    </span>
                                    <span className=""> - </span>
                                    <span className="truncate">
                                        {row.ticket_id}
                                    </span>
                                </p>
                                <p className="flex-1 truncate overflow-hidden text-sm text-gray-400">
                                    {row.details_message.replace(
                                        /<br\s*\/?>/gi,
                                        " "
                                    )}
                                </p>
                            </td>
                            <td
                                className={`w-[210px] flex items-center  ${
                                    row.status === "Resolved"
                                        ? "text-gray-500"
                                        : "text-custom-lightgreen"
                                }`}
                            >
                                <p className="truncate">{row.message_log}</p>
                            </td>
                            <td
                                className={`w-[110px] flex justify-end pr-3 ${
                                    row.status === "Resolved"
                                        ? "text-black"
                                        : "text-custom-bluegreen"
                                } font-semibold`}
                            >
                                {formatTime(row.created_at)}
                            </td>
                        </tr>
                    ))}
            </tbody>
        </table>
    );
};

export default TicketTable;

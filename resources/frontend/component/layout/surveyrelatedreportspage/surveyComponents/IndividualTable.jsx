import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
    TooltipArrow,
} from "@/components/ui/tooltip"
import { MdOutlineChevronLeft, MdOutlineChevronRight, MdFullscreen, MdFullscreenExit } from "react-icons/md";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import IndividualResponseModal from './IndividualResponseModal';
import { LuCalendar } from 'react-icons/lu';
import { IoMdClose } from 'react-icons/io';

const IndividualTable = ({ surveyResponses, localSearchTerm, currentPage, setCurrentPage, itemsPerPage, localDateFilter, handleFilterClear }) => {
    const modalRef = useRef(null);
    const navigate = useNavigate();
    const [selectedResponse, setSelectedResponse] = useState(null);
    const [sortOrder, setSortOrder] = useState('desc');
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        if (selectedResponse && modalRef.current) {
            modalRef.current.showModal();
        }
    }, [selectedResponse]);

    if (
        !surveyResponses ||
        !Array.isArray(surveyResponses.data) ||
        surveyResponses.data.length === 0
    ) {
        return (
            <div className="p-6 text-center text-gray-500">
                No survey responses available.
            </div>
        );
    }

    const { headers, data } = surveyResponses;
  
    const filteredData =
        data?.filter((item) => {
            const localTerm = localSearchTerm?.toLowerCase() || "";

            const matchesLocal =
                localTerm === "" ||
                item.email?.toLowerCase().includes(localTerm) ||
                item.ticket_id?.toString().toLowerCase().includes(localTerm) ||
                Object.values(item).some(
                    (val) => typeof val === "string" && val.toLowerCase().includes(localTerm)
                );

           
            return matchesLocal;
        }) || [];

    
    if (filteredData.length === 0) {
        return (
            <div className="p-6 text-center text-gray-500">
                No results match your search.
            </div>
        );
    }

    
    const sortedData = [...filteredData].sort((a, b) => {
        const dateA = new Date(a.timestamp);
        const dateB = new Date(b.timestamp);

        if (sortOrder === 'asc') {
            return dateA - dateB;
        } else {
            return dateB - dateA;
        }
    });

    
    const filteredHeaders = headers.filter(
        (h) => h.toLowerCase() !== "status"
    );

    const satisfactionColors = {
        "Very Dissatisfied": "bg-red-500",
        "Dissatisfied": "bg-red-500",
        "Neutral": "bg-[#FFC107]",
        "Satisfied": "bg-[#2196F3]",
        "Very Satisfied": "bg-[#4CAF50]",
    };

    const numberColor = (value) => {
        const num = parseInt(value);
        if (num >= 9) return "bg-[#4CAF50]"; 
        if (num >= 7) return "bg-[#2196F3]"; 
        if (num >= 5) return "bg-[#FFC107]"; 
        if (num >= 1) return "bg-red-500";  
        return "";
    };

    const allQuestions = filteredHeaders.filter(
        (key) =>
            !["timestamp", "email", "ticket_id", "survey_owner"].includes(key)
    );

    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = sortedData.slice(startIndex, endIndex);

    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    
    const toggleSortOrder = () => {
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        setCurrentPage(1); 
    };



    const handleOpenModal = (response) => {
        setSelectedResponse(response);
    };

    const handleCloseModal = () => {
        setSelectedResponse(null);
        modalRef.current?.close();
    };


    return (
        <>
            <div className={`${isExpanded ? 'fixed inset-0 z-50 bg-white flex flex-col' : 'relative'}`}>
                <div className={`flex justify-between p-2 mb-2 ${isExpanded ? 'border-b bg-gray-50' : ''}`}>
                    <div>
                        {localDateFilter && (
                            <div className="flex gap-2 items-center">
                                <p className="text-sm text-[#9A9A9A]">Active filters:</p>
                                <div className="border-[.6px] border-[#008DEF33] p-[6px] px-[14px] rounded-[4px] bg-[#F5F9F3] text-custom-solidgreen text-sm font-medium">
                                    <div className="flex gap-2 items-center">
                                        <div>
                                            <LuCalendar className="size-[16px]" />
                                        </div>
                                        <div>
                                            {(() => {
                                                const start = new Date(localDateFilter.startDate);
                                                const end = new Date(localDateFilter.endDate);

                                                const formatDate = (date) =>
                                                    date.toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    });

                                                return start.getTime() === end.getTime()
                                                    ? formatDate(start)
                                                    : `${formatDate(start)} - ${formatDate(end)}`;
                                            })()}
                                        </div>
                                        <button onClick={handleFilterClear}>
                                            <IoMdClose />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-gray-100 transition-colors shadow-sm"
                        title={isExpanded ? "Exit fullscreen" : "Expand fullscreen"}
                    >
                        {isExpanded ? (
                            <>
                                <MdFullscreenExit className="text-lg" />
                                <span className="text-sm font-medium">Exit Fullscreen</span>
                            </>
                        ) : (
                            <>
                                <MdFullscreen className="text-lg" />
                                <span className="text-sm font-medium">Expand</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Table Container */}
                <div className={`${isExpanded ? 'flex-1 overflow-auto px-4' : 'overflow-auto'}`}>
                    <TooltipProvider delayDuration={0}>
                        <div className="relative">
                            <div className="overflow-x-auto border">
                                <table className="w-full border-collapse text-sm text-left">
                                    <thead className="bg-custom-lightestgreen h-[40px]">
                                        <tr>
                                            <th className="px-2 pr-6 py-2 montserrat-bold w-[140px]">
                                                <button
                                                    onClick={toggleSortOrder}
                                                    className="flex items-center gap-2 hover:text-gray-700 transition-colors"
                                                >
                                                    <span>Timestamp</span>
                                                    {sortOrder === 'desc' ? (
                                                        <FaChevronDown className="text-xs" />
                                                    ) : (
                                                        <FaChevronUp className="text-xs" />
                                                    )}
                                                </button>
                                            </th>
                                            <th className="px-2 py-2 montserrat-bold w-[200px]">Email Address</th>
                                            <th className="px-2 py-2 montserrat-bold w-[120px]">Ticket ID</th>
                                            <th className="px-2 py-2 montserrat-bold w-[180px]">
                                                <p className="min-w-[130px]">Survey Owner</p>
                                            </th>

                                            {/* Table Headers */}
                                            {(() => {
                                                const reasonIndex = allQuestions.findIndex(
                                                    (q) =>
                                                        q.trim().toLowerCase() ===
                                                        "please provide the reason/s for your rating:"
                                                );

                                                const sortedQuestions =
                                                    reasonIndex !== -1
                                                        ? [
                                                            ...allQuestions.filter(
                                                                (_, index) => index !== reasonIndex
                                                            ),
                                                            allQuestions[reasonIndex],
                                                        ]
                                                        : allQuestions;

                                                return sortedQuestions.map((question, index) => {
                                                    const isReason =
                                                        question.trim().toLowerCase() ===
                                                        "please provide the reason/s for your rating:";
                                                    const isNumericHeader =
                                                        /scale\s*of\s*1\s*-\s*10/i.test(
                                                            question.replace(/\n|↵/g, " ")
                                                        );

                                                    return (
                                                        <th
                                                            key={index}
                                                            className={`px-4 py-2 montserrat-bold ${isReason
                                                                ? "w-[300px]"
                                                                : "w-[180px]"
                                                                }`}
                                                        >
                                                            <Tooltip>
                                                                <TooltipTrigger>
                                                                    <p
                                                                        className={`w-[120px] ${isNumericHeader
                                                                            ? "text-center"
                                                                            : "text-left"
                                                                            }`}
                                                                    >
                                                                        {isReason
                                                                            ? "Reason"
                                                                            : `Question ${index + 1}`}
                                                                    </p>
                                                                </TooltipTrigger>
                                                                <TooltipContent className="bg-white text-black shadow-md max-w-[300px]">
                                                                    <p>{question}</p>
                                                                    <TooltipArrow className="fill-white drop-shadow-md" />
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </th>
                                                    );
                                                });
                                            })()}
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-custom-lightestgreen">
                                        {currentData.map((response, rowIndex) => (
                                            <tr
                                                key={rowIndex}
                                                onClick={() => handleOpenModal(response)}
                                                className="hover:bg-[#F5F9F3] h-[71px] cursor-pointer"
                                            >
                                                <td className="px-2 py-2 w-[160px]">
                                                    <div>
                                                        {new Date(response.timestamp).toLocaleDateString("en-US", {
                                                            month: "short",
                                                            day: "numeric",
                                                            year: "numeric",
                                                        })}
                                                    </div>
                                                    <div className="text-xs text-[#9A9A9A]">
                                                        {new Date(response.timestamp).toLocaleTimeString("en-US", {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </div>
                                                </td>

                                                <td className="px-2 py-2 w-[200px]">{response.email}</td>
                                                <td className="px-2 py-2 w-[120px]">
                                                    <button
                                                        onClick={() => navigate(`/inquirymanagement/thread/Ticket%23${response.ticket_id}`, {
                                                            state: {
                                                                source: 'survey',
                                                            }
                                                        })}
                                                        className="hover:text-blue-800 hover:underline cursor-pointer"
                                                    >
                                                        Ticket#{response.ticket_id}
                                                    </button>
                                                </td>
                                                <td className="px-2 py-2 w-[150px]">{response.survey_owner}</td>

                                                {/* Question answers */}
                                                {(() => {
                                                    const reasonIndex = allQuestions.findIndex(
                                                        (q) =>
                                                            q.trim().toLowerCase() ===
                                                            "please provide the reason/s for your rating:"
                                                    );

                                                    const sortedQuestions =
                                                        reasonIndex !== -1
                                                            ? [
                                                                ...allQuestions.filter(
                                                                    (_, index) => index !== reasonIndex
                                                                ),
                                                                allQuestions[reasonIndex],
                                                            ]
                                                            : allQuestions;

                                                    return sortedQuestions.map((question, i) => {
                                                        const answer = response[question];
                                                        const color =
                                                            satisfactionColors[answer] ||
                                                            numberColor(answer);

                                                        const isNumeric = !isNaN(parseFloat(answer));
                                                        const isReason =
                                                            question.trim().toLowerCase() ===
                                                            "please provide the reason/s for your rating:";

                                                        return (
                                                            <td
                                                                key={i}
                                                                className={`px-2 py-2 ${isReason
                                                                    ? "w-[300px]"
                                                                    : "w-[180px]"
                                                                    }`}
                                                            >
                                                                <div
                                                                    className={`flex items-center h-full px-2 ${isNumeric
                                                                        ? "justify-center"
                                                                        : "justify-start"
                                                                        }`}
                                                                >
                                                                    {color && !isReason ? (
                                                                        <span
                                                                            className={`${color} text-white font-medium px-3 py-[2px] rounded-[4px] inline-block truncate max-w-[400px]`}
                                                                        >
                                                                            {answer}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="truncate block max-w-[400px] text-gray-700">
                                                                            {answer || ""}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        );
                                                    });
                                                })()}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </TooltipProvider>
                </div>

                {/* Pagination Footer */}
                <div className={`p-4 flex justify-between items-center text-sm text-gray-700 ${isExpanded ? 'border-t bg-gray-50' : ''}`}>
                    <div>
                        <span className="text-[#9A9A9A]">Page</span> {currentPage}{" "}
                        <span className="text-[#9A9A9A]">of</span> {totalPages}
                    </div>

                    <div className="flex gap-3 items-center">
                        <button
                            onClick={handlePrev}
                            disabled={currentPage === 1}
                            className={`flex items-center gap-1 px-3 py-1 border-[.6px] rounded-[4px] font-medium ${currentPage === 1
                                ? "text-gray-400 border-[#F4F4F4] cursor-not-allowed"
                                : "hover:bg-gray-100"
                                }`}
                        >
                            <MdOutlineChevronLeft /> Previous
                        </button>

                        <button
                            onClick={handleNext}
                            disabled={currentPage === totalPages}
                            className={`flex items-center gap-1 px-3 py-1 border-[.6px] rounded-[4px] font-medium ${currentPage === totalPages
                                ? "text-gray-400 border-[#F4F4F4] cursor-not-allowed"
                                : "hover:bg-gray-100"
                                }`}
                        >
                            Next <MdOutlineChevronRight />
                        </button>
                    </div>
                </div>
            </div>
            <div>
                <IndividualResponseModal modalRef={modalRef} selectedResponse={selectedResponse} handleCloseModal={handleCloseModal} />
            </div>
        </>
    );
};

export default IndividualTable;
import React, { useState } from 'react'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
    TooltipArrow,
} from "@/components/ui/tooltip"
import { MdOutlineChevronLeft, MdOutlineChevronRight } from "react-icons/md";

const IndividualTable = ({ surveyResponses }) => {


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

    // Extract and clean up data
    const { headers, data } = surveyResponses;

    // Remove "status" from headers
    const filteredHeaders = headers.filter(
        (h) => h.toLowerCase() !== "status"
    );

    // Define color maps
    const satisfactionColors = {
        "Very Dissatisfied": "bg-red-500",
        "Dissatisfied": "bg-red-500",
        "Neutral": "bg-[#FFC107]",
        "Satisfied": "bg-[#2196F3]",
        "Very Satisfied": "bg-[#4CAF50]",
    };

    const numberColor = (value) => {
        const num = parseInt(value);
        if (num >= 9) return "bg-[#4CAF50]"; // 9–10
        if (num >= 7) return "bg-[#2196F3]"; // 7–8
        if (num >= 5) return "bg-[#FFC107]"; // 5–6
        if (num >= 3) return "bg-red-500"; // 3–4
        if (num >= 1) return "bg-red-500"; // 1–2
        return "";
    };

    // Identify which keys are questions
    const allQuestions = filteredHeaders.filter(
        (key) =>
            !["timestamp", "email", "ticket_id", "survey_owner"].includes(
                key
            )
    );

    const itemsPerPage = 10;
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(data.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = data.slice(startIndex, endIndex);

    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    return (
        <>
            <div className="overflow-auto">
                <TooltipProvider delayDuration={0}>
                    <div className="relative">
                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                            <table className="w-full border-collapse text-sm text-left">
                                <thead className="bg-custom-lightestgreen h-[40px]">
                                    <tr>
                                        <th className="px-2 py-2 montserrat-bold w-[120px]">
                                            Timestamp
                                        </th>
                                        <th className="px-2 py-2 montserrat-bold w-[200px]">
                                            Email Address
                                        </th>
                                        <th className="px-2 py-2 montserrat-bold w-[120px]">
                                            Ticket ID
                                        </th>
                                        <th className="px-2 py-2 montserrat-bold w-[180px]">
                                            <p className='min-w-[130px]'>Survey Owner</p>
                                        </th>

                                        {/* Table Headers */}
                                        {(() => {
                                            const reasonIndex = allQuestions.findIndex(
                                                (q) =>
                                                    q
                                                        .trim()
                                                        .toLowerCase() ===
                                                    "please provide the reason/s for your rating:"
                                            );

                                            const sortedQuestions =
                                                reasonIndex !== -1
                                                    ? [
                                                        ...allQuestions.filter(
                                                            (_, index) =>
                                                                index !==
                                                                reasonIndex
                                                        ),
                                                        allQuestions[
                                                        reasonIndex
                                                        ],
                                                    ]
                                                    : allQuestions;

                                            return sortedQuestions.map(
                                                (question, index) => {
                                                    const isReason =
                                                        question
                                                            .trim()
                                                            .toLowerCase() ===
                                                        "please provide the reason/s for your rating:";
                                                    const isNumericHeader =
                                                        /scale\s*of\s*1\s*-\s*10/i.test(
                                                            question.replace(
                                                                /\n|↵/g,
                                                                " "
                                                            )
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
                                                                            : `Question ${index +
                                                                            1
                                                                            }`}
                                                                    </p>
                                                                </TooltipTrigger>
                                                                <TooltipContent className="bg-white text-black shadow-md max-w-[300px]">
                                                                    <p>
                                                                        {
                                                                            question
                                                                        }
                                                                    </p>
                                                                    <TooltipArrow className="fill-white drop-shadow-md" />
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </th>
                                                    );
                                                }
                                            );
                                        })()}
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-custom-lightestgreen">
                                    {currentData.map((response, rowIndex) => (
                                        <tr
                                            key={rowIndex}
                                            className="hover:bg-[#F5F9F3] h-[71px]"
                                        >
                                            <td className="px-2 py-2 w-[150px]">
                                                <div>
                                                    {new Date(
                                                        response.timestamp
                                                    ).toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            month: "short",
                                                            day: "numeric",
                                                            year: "numeric",
                                                        }
                                                    )}
                                                </div>
                                                <div className="text-xs text-[#9A9A9A]">
                                                    {new Date(
                                                        response.timestamp
                                                    ).toLocaleTimeString(
                                                        "en-US",
                                                        {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        }
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-2 py-2 w-[200px]">
                                                {response.email}
                                            </td>

                                            <td className="px-2 py-2 w-[120px]">
                                                Ticket#{response.ticket_id}
                                            </td>

                                            <td className="px-2 py-2 w-[150px]">
                                                {response.survey_owner}
                                            </td>

                                            {/* Question answers */}
                                            {(() => {
                                                const reasonIndex =
                                                    allQuestions.findIndex(
                                                        (q) =>
                                                            q
                                                                .trim()
                                                                .toLowerCase() ===
                                                            "please provide the reason/s for your rating:"
                                                    );

                                                const sortedQuestions =
                                                    reasonIndex !== -1
                                                        ? [
                                                            ...allQuestions.filter(
                                                                (_, index) =>
                                                                    index !==
                                                                    reasonIndex
                                                            ),
                                                            allQuestions[
                                                            reasonIndex
                                                            ],
                                                        ]
                                                        : allQuestions;

                                                return sortedQuestions.map(
                                                    (question, i) => {
                                                        const answer =
                                                            response[question];
                                                        const color =
                                                            satisfactionColors[
                                                            answer
                                                            ] ||
                                                            numberColor(answer);

                                                        const isNumeric =
                                                            !isNaN(
                                                                parseFloat(
                                                                    answer
                                                                )
                                                            );
                                                        const isReason =
                                                            question
                                                                .trim()
                                                                .toLowerCase() ===
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
                                                                    {color &&
                                                                        !isReason ? (
                                                                        <span
                                                                            className={`${color} text-white font-medium px-3 py-[2px] rounded-[4px] inline-block truncate max-w-[400px]`}
                                                                        >
                                                                            {
                                                                                answer
                                                                            }
                                                                        </span>
                                                                    ) : (
                                                                        <span className="truncate block max-w-[400px] text-gray-700">
                                                                            {answer ||
                                                                                ""}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        );
                                                    }
                                                );
                                            })()}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </TooltipProvider>
            </div>

            {/* PAGINATION FOOTER */}
            <div className="p-4 flex justify-between items-center text-sm text-gray-700">
                <div>
                   <span className=" text-[#9A9A9A]">Page</span> {currentPage} <span className=" text-[#9A9A9A]">of</span>  {totalPages}
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
                                : "hover:bg-gray-100 "
                            }`}
                    >
                        Next <MdOutlineChevronRight />
                    </button>
                </div>
            </div>
        </>
    );
}


export default IndividualTable;

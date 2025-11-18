import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import { MdOutlineChevronLeft, MdOutlineChevronRight } from "react-icons/md";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

import emoji1 from "../../../../../../public/Images/emoji1.png";
import emoji2 from "../../../../../../public/Images/emoji2.png";
import emoji3 from "../../../../../../public/Images/emoji3.png";
import emoji4 from "../../../../../../public/Images/emoji4.png";
import emoji5 from "../../../../../../public/Images/emoji5.png";
import { LuCalendar } from "react-icons/lu";
import { IoMdClose } from "react-icons/io";

const emojiMap = {
    5: emoji1,
    4: emoji2,
    3: emoji3,
    2: emoji4,
    1: emoji5,
};

const labels = {
    5: "Excellent",
    4: "Good",
    3: "Neutral",
    2: "Poor",
    1: "Very Poor",
};

// --- helper function ---
function getRatingCounts(data) {
    const counts = {};
    for (let i = 1; i <= 5; i++) {
        counts[i] = data.filter((item) => item.rating === i).length;
    }
    return counts;
}

const SummaryRatingDetails = ({
    surveyRatings,
    searchTerm,
    localSearchTerm,
    currentPage,
    setCurrentPage,
    selectedRating,
    setSelectedRating,
    itemsPerPage,
    localDateFilter,
    handleFilterClear
}) => {
    const navigate = useNavigate();
    const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

    // ✅ ensure data is an array
    const ratingDetails = Array.isArray(surveyRatings?.data)
        ? surveyRatings.data
        : [];

    // ✅ 1️⃣ Apply global search filter
    const globalFilteredData = useMemo(() => {
        if (!searchTerm) return ratingDetails;
        const term = searchTerm.toLowerCase();
        return ratingDetails.filter(
            (item) =>
                item.email.toLowerCase().includes(term) ||
                item.ticket_id?.toString().includes(term) ||
                labels[item.rating]?.toLowerCase().includes(term)
        );
    }, [searchTerm, ratingDetails]);

    // ✅ 2️⃣ Apply rating filter
    const ratingFilteredData = useMemo(() => {
        if (selectedRating) {
            return globalFilteredData.filter((item) => item.rating === selectedRating);
        }
        return globalFilteredData;
    }, [globalFilteredData, selectedRating]);

    // ✅ 3️⃣ Apply *local filter* (specific to this table)
    const fullyFilteredData = useMemo(() => {
        if (!localSearchTerm) return ratingFilteredData;
        const localTerm = localSearchTerm.toLowerCase();
        return ratingFilteredData.filter(
            (item) =>
                item.email.toLowerCase().includes(localTerm) ||
                item.ticket_id?.toString().includes(localTerm) ||
                labels[item.rating]?.toLowerCase().includes(localTerm)
        );
    }, [ratingFilteredData, localSearchTerm]);

    // ✅ 4️⃣ Apply sorting by date
    const sortedData = useMemo(() => {
        return [...fullyFilteredData].sort((a, b) => {
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);

            if (sortOrder === 'asc') {
                return dateA - dateB; // Oldest first
            } else {
                return dateB - dateA; // Newest first
            }
        });
    }, [fullyFilteredData, sortOrder]);

    // ✅ Get counts & pagination based on sorted data
    const ratingCounts = useMemo(() => getRatingCounts(globalFilteredData), [globalFilteredData]);
    const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentRatingDetails = sortedData.slice(startIndex, endIndex);

    const handlePrev = () => currentPage > 1 && setCurrentPage((p) => p - 1);
    const handleNext = () => currentPage < totalPages && setCurrentPage((p) => p + 1);

    // ✅ Toggle sort order
    const toggleSortOrder = () => {
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        setCurrentPage(1); // Reset to first page when sorting
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedRating, searchTerm, localSearchTerm]);



    return (
        <div className="w-full">
            <div className="mb-4">
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

            {/* ✅ Filter bar */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
                {/* All */}
                <button
                    onClick={() => setSelectedRating(null)}
                    className={`px-3 py-2 border-[.5px] rounded-[4px] flex items-center gap-1 text-sm ${selectedRating === null
                        ? "bg-custom-solidgreen text-white border-custom-lightgreen"
                        : "bg-white text-black border-gray-300"
                        }`}
                >
                    <span>All</span>
                    <span className={`${selectedRating === null ? "" : "text-[#9A9A9A]"}`}>
                        ({globalFilteredData.length})
                    </span>
                </button>

                {/* Rating buttons */}
                {Object.entries(emojiMap)
                    .sort((a, b) => b[0] - a[0])
                    .map(([rating, imageUrl]) => (
                        <button
                            key={rating}
                            onClick={() => setSelectedRating(Number(rating))}
                            className={`px-3 py-2 border-[.5px] rounded-[4px] flex items-center gap-1 text-sm ${selectedRating === Number(rating)
                                ? "bg-custom-solidgreen text-white border-custom-lightgreen"
                                : "bg-white text-black border-gray-300"
                                }`}
                        >
                            <img src={imageUrl} alt={`Rating ${rating}`} className="w-5 h-5" />
                            <span className="font-medium">{labels[rating]}</span>
                            <span
                                className={`${selectedRating === Number(rating) ? "" : "text-[#9A9A9A]"
                                    }`}
                            >
                                ({ratingCounts[rating]})
                            </span>
                        </button>
                    ))}
            </div>

            {/* ✅ Table */}
            <div className="h-full flex flex-col">
                <div className="border">
                    <table className="w-full border-collapse text-sm text-left">
                        <thead className="bg-custom-lightestgreen h-[40px]">
                            <tr>
                                <th className="px-2 py-2 montserrat-bold w-[200px]">
                                    <button
                                        onClick={toggleSortOrder}
                                        className="flex items-center gap-2 hover:text-gray-700 transition-colors"
                                    >
                                        <span>Date</span>
                                        {sortOrder === 'desc' ? (
                                            <FaChevronDown className="text-xs" />
                                        ) : (
                                            <FaChevronUp className="text-xs" />
                                        )}
                                    </button>
                                </th>
                                <th className="px-2 py-2 montserrat-bold w-[150px]">Rate</th>
                                <th className="px-2 py-2 montserrat-bold">Email</th>
                                <th className="px-2 py-2 montserrat-bold">Ticket ID</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-custom-lightestgreen">
                            {currentRatingDetails.length > 0 ? (
                                currentRatingDetails.map((item, index) => (
                                    <tr key={index} className="hover:bg-[#F5F9F3] h-[71px]">
                                        <td className="px-2 py-1">
                                            {new Date(item.created_at).toLocaleDateString("en-US")}
                                        </td>
                                        <td className="px-2 py-1">
                                            {emojiMap[item.rating] && (
                                                <div className="flex items-center gap-2">
                                                    <img
                                                        src={emojiMap[item.rating]}
                                                        alt={`Rating ${item.rating}`}
                                                        className="w-6 h-6 mb-1"
                                                    />
                                                    <span className="text-sm">{labels[item.rating]}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-2 py-1">{item.email}</td>
                                        <td className="px-2 py-1">
                                            <button
                                                onClick={() => navigate(`/inquirymanagement/thread/Ticket%23${item.ticket_id}`, {
                                                    state: {
                                                        source: 'survey',
                                                    }
                                                })}
                                                className="hover:text-blue-800 hover:underline cursor-pointer"
                                            >
                                                Ticket#{item.ticket_id}
                                            </button>
                                        </td>
                                        {/* <button
                                                                            onClick={() => navigate(`/inquirymanagement/thread/Ticket%23${response.ticket_id}`, {
                                                                                state: {
                                                                                    source: 'survey',
                                                                                }
                                                                            })}
                                                                            className="hover:text-blue-800 hover:underline cursor-pointer"
                                                                        >
                                                                            Ticket#{response.ticket_id}
                                                                        </button> */}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center py-6 text-gray-500">
                                        No rating details available.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ✅ Pagination */}
                <div className="p-4 flex justify-between items-center text-sm text-gray-700">
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
        </div>
    );
};

export default SummaryRatingDetails;
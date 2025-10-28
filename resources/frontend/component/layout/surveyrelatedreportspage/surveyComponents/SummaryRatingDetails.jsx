import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight, MdOutlineChevronLeft, MdOutlineChevronRight } from 'react-icons/md';
import ReactPaginate from 'react-paginate';
import { useSurvey } from '@/context/Survey/SurveyContext';

import emoji1 from "../../../../../../public/Images/emoji1.png";
import emoji2 from "../../../../../../public/Images/emoji2.png";
import emoji3 from "../../../../../../public/Images/emoji3.png";
import emoji4 from "../../../../../../public/Images/emoji4.png";
import emoji5 from "../../../../../../public/Images/emoji5.png";

// --- emoji and label maps ---
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

// --- helper function outside component ---
function getRatingCounts(ratingDetails) {
    const counts = {};
    for (let i = 1; i <= 5; i++) {
        counts[i] = ratingDetails.filter(item => item.rating === i).length;
    }
    return counts;
}

const SummaryRatingDetails = () => {
    const { id } = useParams();
    const { fetchSurveyRatingDetails, ratingDetails = [] } = useSurvey();

    const [surveyId, setSurveyId] = useState(id || null);
    const [selectedRating, setSelectedRating] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Fetch rating details
    useEffect(() => {
        if (surveyId) {
            fetchSurveyRatingDetails(surveyId);
        }
    }, [surveyId]);

    // Filter logic
    const filteredRatingDetails = selectedRating
        ? ratingDetails.filter((item) => item.rating === selectedRating)
        : ratingDetails;

    // Get rating counts
    const ratingCounts = getRatingCounts(ratingDetails);

    // Pagination logic
    const totalPages = Math.ceil(filteredRatingDetails.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentRatingDetails = filteredRatingDetails.slice(startIndex, endIndex);

    // Pagination handlers
    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };


    return (
        <div className="w-full">
            {/* Filter section */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
                {/* All button */}
                <button
                    onClick={() => setSelectedRating(null)}
                    className={`px-3 py-2 border-[.5px] rounded-[4px] flex items-center gap-1 text-sm
                        ${selectedRating === null
                            ? "bg-custom-solidgreen text-white border-custom-lightgreen"
                            : "bg-white text-black border-gray-300"
                        }`}
                >
                    <span className=''>
                        All
                    </span>
                    <span className={` ${selectedRating === null
                        ? ""
                        : "text-[#9A9A9A]"
                        }`}>
                        ({ratingDetails.length})
                    </span>
                </button>

                {/* Rating buttons */}
                {Object.entries(emojiMap)
                    .sort((a, b) => b[0] - a[0])
                    .map(([rating, imageUrl]) => (
                        <button
                            key={rating}
                            onClick={() => setSelectedRating(Number(rating))}
                            className={`px-3 py-2 border-[.5px] rounded-[4px] flex items-center gap-1 text-sm
                                ${selectedRating === Number(rating)
                                    ? "bg-custom-solidgreen text-white border-custom-lightgreen"
                                    : "bg-white text-black border-gray-300"
                                }`}
                        >
                            <img
                                src={imageUrl}
                                alt={`Rating ${rating}`}
                                className="w-5 h-5"
                            />
                            <span className="flex items-center  font-medium">
                                {labels[rating]}
                            </span>
                            <span className={` ${selectedRating === Number(rating)
                                ? ""
                                : "text-[#9A9A9A]"
                                }`}>
                                ({ratingCounts[rating]})
                            </span>
                        </button>
                    ))}
            </div>

            {/* Table section */}
            <div className="h-full flex flex-col">
                <div className=" border">
                    <table className="w-full border-collapse text-sm text-left">
                        <thead className="bg-custom-lightestgreen h-[40px]">
                            <tr>
                                <th className="px-2 py-2 montserrat-bold w-[200px] ">Date</th>
                                <th className="px-2 py-2 montserrat-bold w-[150px] ">Rate</th>
                                <th className="px-2 py-2 montserrat-bold ">Email</th>
                                <th className="px-2 py-2 montserrat-bold ">Ticket ID</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-custom-lightestgreen">
                            {currentRatingDetails.length > 0 ? (
                                currentRatingDetails.map((item, index) => (
                                    <tr key={index} className="hover:bg-[#F5F9F3] h-[71px]">
                                        <td className="px-2 py-1 ">
                                            {new Date(item.created_at).toLocaleDateString("en-US")}
                                        </td>
                                        <td className="px-2 py-1 ">
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
                                        <td className="px-2 py-1 ">{item.email}</td>
                                        <td className="px-2 py-1 ">Ticket#{item.ticket_id}</td>
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

                {/* Pagination section */}
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

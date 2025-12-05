import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';
import ReactPaginate from 'react-paginate';
import { useSurvey } from '@/context/Survey/SurveyContext';

import emoji1 from "@/assets/images/emoji1.png";
import emoji2 from "@/assets/images/emoji2.png";
import emoji3 from "@/assets/images/emoji3.png";
import emoji4 from "@/assets/images/emoji4.png";
import emoji5 from "@/assets/images/emoji5.png";

const emojiMap = {
    5: emoji1,
    4: emoji2,
    3: emoji3,
    2: emoji4,
    1: emoji5,
};

const SummaryRatingDetails = () => {
    const { id } = useParams();
    const { fetchSurveyRatingDetails, ratingDetails = [] } = useSurvey();

    const [surveyId, setSurveyId] = useState(id || null);
    const [selectedRating, setSelectedRating] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 8;

    // Fetch rating details
    useEffect(() => {
        if (surveyId) {
            fetchSurveyRatingDetails(surveyId);
        }
    }, [surveyId]);

    // Reset pagination when filter changes
    useEffect(() => {
        setCurrentPage(0);
    }, [selectedRating]);

    // Filter logic
    const filteredRatingDetails = selectedRating
        ? ratingDetails.filter((item) => item.rating === selectedRating)
        : ratingDetails;

    // Pagination logic
    const pageCount = Math.ceil(filteredRatingDetails.length / itemsPerPage);
    const startIndex = currentPage * itemsPerPage;
    const currentRatingDetails = filteredRatingDetails.slice(startIndex, startIndex + itemsPerPage);

    const handlePageClick = (event) => {
        setCurrentPage(event.selected);
    };

    return (
        <div className="w-full ">
            {/* Filter section */}
            <div className="mb-4 flex items-center gap-2">
                <span className="font-semibold">Filter by:</span>
                {Object.entries(emojiMap)
                    .sort((a, b) => b[0] - a[0])
                    .map(([rating, imageUrl]) => (
                        <button
                            key={rating}
                            onClick={() => setSelectedRating(Number(rating))}
                            className={`px-3 py-1 border rounded ${selectedRating === Number(rating)
                                ? "bg-custom-lightgreen text-white"
                                : "bg-white text-black"
                                }`}
                        >
                            <img
                                src={imageUrl}
                                alt={`Rating ${rating}`}
                                className="w-6 h-6 inline-block"
                            />
                        </button>
                    ))}
                <button
                    onClick={() => setSelectedRating(null)}
                    className="px-3 py-1 border rounded bg-gray-200 text-black"
                >
                    All
                </button>
            </div>
            {/* Table section */}
            <div className="h-full flex flex-col">
                <div className='h-[300px]'>
                    <table className="w-full">
                        <thead>
                            <tr>
                                <th className="border-2 px-2 py-1 w-[200px] text-center">Date</th>
                                <th className="border-2 px-2 py-1 w-[150px] text-center">Rate</th>
                                <th className="border-2 px-2 py-1 text-center">Email</th>
                                <th className="border-2 px-2 py-1 text-center">Ticket ID</th>

                            </tr>
                        </thead>
                        <tbody>
                            {currentRatingDetails.map((item, index) => (
                                <tr key={index}>
                                    <td className="border-2 px-2 py-1 text-center">
                                        {new Date(item.created_at).toLocaleDateString('en-US')}
                                    </td>
                                    <td className="border-2 px-2 py-1 text-center">
                                        {emojiMap[item.rating] && (
                                            <img
                                                src={emojiMap[item.rating]}
                                                alt={`Rating ${item.rating}`}
                                                className="w-6 h-6 mx-auto"
                                            />
                                        )}
                                    </td>
                                    <td className="border-2 px-2 py-1 text-center">{item.email}</td>
                                    <td className="border-2 px-2 py-1 text-center">{item.ticket_id}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className='flex justify-end'>
                    {/* Pagination section */}
                    <div className="w-full flex justify-end">
                        <ReactPaginate
                            previousLabel={<MdKeyboardArrowLeft className="text-[#404B52]" />}
                            nextLabel={<MdKeyboardArrowRight className="text-[#404B52]" />}
                            breakLabel="..."
                            pageCount={pageCount}
                            marginPagesDisplayed={2}
                            pageRangeDisplayed={1}
                            onPageChange={handlePageClick}
                            forcePage={currentPage}
                            containerClassName="flex gap-2 mt-4"
                            previousClassName="border border-[#EEEEEE] text-custom-bluegreen font-semibold w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:text-white hover:bg-custom-lightgreen"
                            nextClassName="border border-[#EEEEEE] text-custom-bluegreen font-semibold w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:text-white hover:bg-custom-lightgreen"
                            pageClassName="border border-[#EEEEEE] text-black w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:bg-custom-lightgreen text-[12px]"
                            activeClassName="w-[26px] h-[24px] border border-[#EEEEEE] bg-custom-lightgreen text-white rounded-[4px] text-[12px]"
                            pageLinkClassName="w-full h-full flex justify-center items-center"
                            activeLinkClassName="w-full h-full flex justify-center items-center"
                            disabledLinkClassName="text-gray-300 cursor-not-allowed"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SummaryRatingDetails;

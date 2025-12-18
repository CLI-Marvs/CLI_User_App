import React, { useState, useRef, useMemo, useEffect } from 'react'
import SummaryRatingDetails from './SummaryRatingDetails'
import { Select } from '@mui/material'
import { HiMiniMagnifyingGlass } from 'react-icons/hi2';
import { LuCalendar, LuTrendingUp } from 'react-icons/lu';
import DateRangeFilter from './DateRangeFilter';
import { useSurvey } from '@/context/Survey/SurveyContext';
import { FaRegStar } from 'react-icons/fa';
import { RiErrorWarningLine } from 'react-icons/ri';
import * as XLSX from 'xlsx';
import { MdOutlineFileDownload } from 'react-icons/md';

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 25, 50];
const DEFAULT_ITEMS_PER_PAGE = 25;

const EmojiResponsesTab = ({ surveyRatings, setSurveyRatings, surveyId, dateFilter }) => {

    const modalRef = useRef(null);



    const {
        fetchSurveyRatingDetails,
        fetchSurveysRatings,
        averageRating,
        setAverageRating,
        highLowCount,
        setHighLowCount,
        fetchHighLowCount,
        emojiDateFilter,
        setEmojiDateFilter,
    } = useSurvey();

    const [localSearchTerm, setLocalSearchTermValue] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRating, setSelectedRating] = useState(null);
    const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);

    const openModal = () => {
        modalRef.current.showModal();
    };

    const fetchSurveyRatings = async (filter = null) => {
        const surveyRatings = await fetchSurveyRatingDetails(surveyId, filter);
        setSurveyRatings(surveyRatings);
    };

    const fetchAverageRating = async (filter = null) => {
        const averageRating = await fetchSurveysRatings(surveyId, filter);
        setAverageRating(averageRating);
    };

    const fetchHighLowCounts = async (filter = null) => {
        const highLowCount = await fetchHighLowCount(surveyId, filter);
        setHighLowCount(highLowCount);
    };

    const handleDateFilterApply = (filterPayload) => {
        setEmojiDateFilter(filterPayload);
    };

    const handleFilterClear = () => {
        setEmojiDateFilter(null);
        fetchSurveyRatings(null);
        fetchAverageRating(null);
        fetchHighLowCounts(null);
    };

    const activeFilters = useMemo(() => {
        const filters = {};

        if (emojiDateFilter?.startDate && emojiDateFilter?.endDate) {
            filters.startDate = emojiDateFilter.startDate;
            filters.endDate = emojiDateFilter.endDate;
        }

        return Object.keys(filters).length > 0 ? filters : null;
    }, [emojiDateFilter]);

    useEffect(() => {
        fetchSurveyRatings(activeFilters);
        fetchAverageRating(activeFilters);
        fetchHighLowCounts(activeFilters);
    }, [activeFilters]);

    const exportToExcel = () => {

        const workbook = XLSX.utils.book_new();

        const worksheet = XLSX.utils.json_to_sheet(surveyRatings.data);

        const sheetName = surveyRatings.survey_title.substring(0, 31);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

        const today = new Date();
        const currentDate = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}-${today.getFullYear()}`;
        const fileName = `${surveyRatings.survey_title}_(survey ratings)_${currentDate}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    };


    // ✅ Calculate filtered data count (matching SummaryRatingDetails logic)
    const getFilteredCount = () => {
        const ratingDetails = Array.isArray(surveyRatings?.data) ? surveyRatings.data : [];

        if (ratingDetails.length === 0) return 0;

        // Apply global search filter
        let filtered = ratingDetails;

        // Apply rating filter
        if (selectedRating) {
            filtered = filtered.filter((item) => item.rating === selectedRating);
        }

        // Apply local search filter
        if (localSearchTerm) {
            const localTerm = localSearchTerm.toLowerCase();
            const labels = {
                1: 'Very Dissatisfied',
                2: 'Dissatisfied',
                3: 'Neutral',
                4: 'Satisfied',
                5: 'Very Satisfied'
            };
            filtered = filtered.filter(
                (item) =>
                    item.email?.toLowerCase().includes(localTerm) ||
                    item.ticket_id?.toString().includes(localTerm) ||
                    labels[item.rating]?.toLowerCase().includes(localTerm)
            );
            setCurrentPage(1);
        }

        return filtered.length;
    };

    const filteredCount = getFilteredCount();

    const startItem = filteredCount > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0;
    const endItem = Math.min(currentPage * itemsPerPage, filteredCount);

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    return (
        <div>
            <div className='p-[20px] flex flex-col gap-4 bg-white'>
                <div className='flex justify-between '>
                    <div className='flex flex-col gap-[4px]'>
                        <div>
                            <p className='montserrat-medium text-[24px]'>Response Overview</p>
                        </div>
                        <div>
                            <p className='text-sm text-[#9A9A9A]'>
                                {filteredCount} {filteredCount === 1 ? 'response' : 'responses'}
                                {filteredCount > 0 && ` • Showing ${startItem} - ${endItem}`}
                            </p>
                        </div>
                    </div>
                    <div className='flex gap-2 items-center'>
                        <div>
                            <button
                                onClick={exportToExcel}
                                className='flex justify-center px-[10px] py-[6px] items-center gap-[8px] bg-custom-solidgreen text-white  rounded-[4px]'
                            >
                                <span><MdOutlineFileDownload className='size-[23px]' /></span>
                                <span className='font-medium text-sm'>Export Excel</span>
                            </button>
                        </div>
                        <select
                            className='w-[120px] h-[36px] border-[.6px] border-[#F4F4F4] rounded-[4px] cursor-pointer'
                            value={itemsPerPage}
                            onChange={handleItemsPerPageChange}
                        >
                            {ITEMS_PER_PAGE_OPTIONS.map(option => (
                                <option key={option} value={option}>
                                    {option} per page
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className='flex gap-2 '>
                    <div className='w-full flex items-center gap-2 border px-[12px] border-[#F4F4F4]'>
                        <HiMiniMagnifyingGlass className='size-[16px]' />
                        <input
                            placeholder='Search email, ticket, or feedback...'
                            type="text"
                            className='w-full h-[32px] outline-none text-black'
                            value={localSearchTerm}
                            onChange={(e) => setLocalSearchTermValue(e.target.value)}
                        />
                    </div>
                    <div className="flex-shrink-0">
                        <button
                            onClick={openModal}
                            className="flex justify-start px-3 items-center gap-2 min-w-[140px] border-[.6px] border-[#F4F4F4] h-[36px] rounded-[4px] text-sm text-[#9A9A9A]"
                        >
                            <LuCalendar />
                            <span>Date Range</span>
                        </button>
                    </div>
                </div>
            </div>
            {/* ======================================================KPI Widgets================================================================================= */}
            <div className="flex gap-6">


                {/* ======================================================average rating================================================================================= */}
                <div className="flex-1 h-[179px] rounded-[10px] border border-[#F4F4F4] p-[24px] bg-white">
                    <div className='flex flex-col justify-between h-full'>
                        <div className='flex justify-between'>
                            <div className='flex flex-col gap-3'>
                                <div>
                                    <p className='text-[#9A9A9A] text-sm'>Average Rating</p>
                                </div>
                                <div>
                                    <p className='montserrat-regular text-[36px] text-[#323232]'>{averageRating?.average_rating}/5</p>
                                </div>
                            </div>
                            <div>
                                <div className='w-[40px] h-[40px] rounded-[8px] p-[10px] bg-custom-lightestgreen justify-center items-center'>
                                    <div className='flex justify-center h-full w-full items-center text-[#348017]'>
                                        <LuTrendingUp className='size-[20px]' />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-[7.2px] h-[30px] border-t border-[#F4F4F4] items-center text-[14px]">
                            <p className=" text-[#9A9A9A]">Out of 5 stars</p>
                        </div>
                    </div>
                </div>

                {/* ======================================================5-star rating================================================================================= */}
                <div className="flex-1 h-[179px] rounded-[10px] border border-[#F4F4F4] p-[24px] bg-white">
                    <div className='flex flex-col justify-between h-full'>
                        <div className='flex justify-between'>
                            <div className='flex flex-col gap-3'>
                                <div>
                                    <p className='text-[#9A9A9A] text-sm'>5-Star Rating</p>
                                </div>
                                <div>
                                    <p className='montserrat-regular text-[36px] text-[#323232]'>{highLowCount?.highest_rated_count}</p>
                                </div>
                            </div>
                            <div>
                                <div className='w-[40px] h-[40px] rounded-[8px] p-[10px] bg-custom-lightestgreen justify-center items-center'>
                                    <div className='flex justify-center h-full w-full items-center text-[#348017]'>
                                        <FaRegStar className='size-[20px]' />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-[7.2px] h-[30px] border-t border-[#F4F4F4] items-center text-[14px]">
                            <p className=" text-[#9A9A9A]">Highest rating responses</p>
                        </div>
                    </div>
                </div>

                {/*============================================================1 tar rating============================================================================ */}
                <div className="flex-1 h-[179px] rounded-[10px] border border-[#F4F4F4] p-[24px] bg-white">
                    <div className='flex flex-col justify-between h-full'>
                        <div className='flex justify-between'>
                            <div className='flex flex-col gap-3'>
                                <div>
                                    <p className='text-[#9A9A9A] text-sm'>1-Star Rating</p>
                                </div>
                                <div>
                                    <p className='montserrat-regular text-[36px] text-[#323232]'>{highLowCount?.lowest_rated_count}</p>
                                </div>
                            </div>
                            <div>
                                <div className='w-[40px] h-[40px] rounded-[8px] p-[10px] bg-custom-lightestgreen justify-center items-center'>
                                    <div className='flex justify-center h-full w-full items-center text-[#348017]'>
                                        <RiErrorWarningLine className='size-[32px]' />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-[7.2px] h-[30px] border-t border-[#F4F4F4] items-center text-[14px]">
                            <p className=" text-[#9A9A9A]">Lowest rating responses</p>
                        </div>
                    </div>
                </div>
            </div>
            {/* ======================================================================================================================================= */}
            <div>
                <SummaryRatingDetails
                    surveyRatings={surveyRatings}
                    localSearchTerm={localSearchTerm}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    selectedRating={selectedRating}
                    setSelectedRating={setSelectedRating}
                    itemsPerPage={itemsPerPage}
                    localDateFilter={emojiDateFilter}
                    handleFilterClear={handleFilterClear}
                />
            </div>
            <div>
                <DateRangeFilter
                    modalRef={modalRef}
                    onApplyFilter={handleDateFilterApply}
                />
            </div>
        </div>
    )
}

export default EmojiResponsesTab
import React, { useState, useRef } from 'react'
import SummaryRatingDetails from './SummaryRatingDetails'
import { Select } from '@mui/material'
import { HiMiniMagnifyingGlass } from 'react-icons/hi2';
import { LuCalendar } from 'react-icons/lu';
import DateRangeFilter from './DateRangeFilter';
import { useSurvey } from '@/context/Survey/SurveyContext';


const ITEMS_PER_PAGE_OPTIONS = [5, 10, 25, 50];
const DEFAULT_ITEMS_PER_PAGE = 5;

const EmojiResponsesTab = ({ surveyRatings, setSurveyRatings, searchTerm, surveyId, dateFilter }) => {

    const modalRef = useRef(null);
    const [localDateFilter, setLocalDateFilter] = useState(null);

    const {
        fetchSurveyRatingDetails,
    } = useSurvey();

    const [localSearchTerm, setLocalSearchTermValue] = useState("");

    const [currentPage, setCurrentPage] = useState(1); // ✅ Lift state up
    const [selectedRating, setSelectedRating] = useState(null); // ✅ Lift state up
    const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);

    const openModal = () => {
        modalRef.current.showModal();
    };

    const fetchSurveyRatings = async (filter = null) => {
        const surveyRatings = await fetchSurveyRatingDetails(surveyId, filter);
        setSurveyRatings(surveyRatings);
    };


    const handleDateFilterApply = (filterPayload) => {
          setLocalDateFilter(filterPayload);
          if (filterPayload.startDate == null && filterPayload.endDate == null) {
              fetchSurveyRatings(dateFilter);
          } else {
              fetchSurveyRatings(filterPayload);
          }
    };

    const handleFilterClear = () => {
        setLocalDateFilter(null);
        fetchSurveyRatings(dateFilter);
    };


    // ✅ Calculate filtered data count (matching SummaryRatingDetails logic)
    const getFilteredCount = () => {
        const ratingDetails = Array.isArray(surveyRatings?.data) ? surveyRatings.data : [];

        if (ratingDetails.length === 0) return 0;

        // Apply global search filter
        let filtered = ratingDetails;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const labels = {
                1: 'Very Dissatisfied',
                2: 'Dissatisfied',
                3: 'Neutral',
                4: 'Satisfied',
                5: 'Very Satisfied'
            };
            filtered = filtered.filter(
                (item) =>
                    item.email?.toLowerCase().includes(term) ||
                    item.ticket_id?.toString().includes(term) ||
                    labels[item.rating]?.toLowerCase().includes(term)
            );
        }

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
        }

        return filtered.length;
    };

    const filteredCount = getFilteredCount();

    // ✅ Calculate pagination display based on current page

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
                            <button className='bg-custom-lightgreen text-white w-[122px] h-[35px]'>Export Excel</button>
                        </div>
                        <select
                            className='w-[120px] h-[36px] border-[.6px] border-[#F4F4F4] rounded-[4px]'
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
            <div>
                <SummaryRatingDetails
                    surveyRatings={surveyRatings}
                    searchTerm={searchTerm}
                    localSearchTerm={localSearchTerm}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    selectedRating={selectedRating}
                    setSelectedRating={setSelectedRating}
                    itemsPerPage={itemsPerPage}
                    localDateFilter={localDateFilter}
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
import React, { useState } from 'react'
import SummaryRatingDetails from './SummaryRatingDetails'
import { Select } from '@mui/material'
import { HiMiniMagnifyingGlass } from 'react-icons/hi2';

const EmojiResponsesTab = ({ surveyRatings, searchTerm }) => {

    const [localSearchTerm, setLocalSearchTermValue] = useState("");

    const [currentPage, setCurrentPage] = useState(1); // ✅ Lift state up
    const [selectedRating, setSelectedRating] = useState(null); // ✅ Lift state up

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
    const itemsPerPage = 8;
    const startItem = filteredCount > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0;
    const endItem = Math.min(currentPage * itemsPerPage, filteredCount);

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
                            <button className='bg-custom-lightgreen text-white w-[122px] h-[35px]'>Export PDF</button>
                        </div>
                        <div>
                            <Select className=' w-[120px] h-[36px]'>
                                <option value="">1 per page</option>
                                <option value="1">5 per page</option>
                                <option value="2">51 per page</option>
                            </Select>
                        </div>
                    </div>
                </div>
                <div className='flex gap-2'>
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
                    <button className='border w-[180px] h-[36px] rounded-[10px]'>date range</button>
                    <Select className='w-[120px] h-[36px]'>
                        <option value="">1 per page</option>
                        <option value="1">5 per page</option>
                        <option value="2">51 per page</option>
                    </Select>
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
                />
            </div>
        </div>
    )
}

export default EmojiResponsesTab
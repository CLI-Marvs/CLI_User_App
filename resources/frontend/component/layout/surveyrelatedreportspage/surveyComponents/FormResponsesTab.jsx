import React, { useState, useMemo } from 'react'
import IndividualTable from './IndividualTable'
import { Select } from '@mui/material'
import { HiMiniMagnifyingGlass } from 'react-icons/hi2'

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50];
const DEFAULT_ITEMS_PER_PAGE = 10;


const FormResponsesTab = ({ surveyResponses, searchTerm }) => {

    const [localSearchTerm, setLocalSearchTermValue] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);

    const filteredCount = useMemo(() => {
        if (!surveyResponses?.data || !Array.isArray(surveyResponses.data)) {
            return 0;
        }

        const filtered = surveyResponses.data.filter((item) => {
            const globalTerm = searchTerm?.toLowerCase() || "";
            const localTerm = localSearchTerm?.toLowerCase() || "";

            const matchesGlobal =
                globalTerm === "" ||
                item.email?.toLowerCase().includes(globalTerm) ||
                item.ticket_id?.toString().toLowerCase().includes(globalTerm) ||
                Object.values(item).some(
                    (val) => typeof val === "string" && val.toLowerCase().includes(globalTerm)
                );

            const matchesLocal =
                localTerm === "" ||
                item.email?.toLowerCase().includes(localTerm) ||
                item.ticket_id?.toString().toLowerCase().includes(localTerm) ||
                Object.values(item).some(
                    (val) => typeof val === "string" && val.toLowerCase().includes(localTerm)
                );

            return matchesGlobal && matchesLocal;
        });

        return filtered.length;
    }, [surveyResponses?.data, searchTerm, localSearchTerm]);

    // Calculate pagination display (assuming 10 items per page, matching IndividualTable)

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
                        <p className='text-sm text-[#9A9A9A]'>
                            {filteredCount} {filteredCount === 1 ? 'response' : 'responses'}
                            {filteredCount > 0 && ` • Showing ${startItem} - ${endItem}`}
                        </p>
                    </div>
                    <div className='flex gap-2 items-center'>
                        <div>
                            <button className='bg-custom-lightgreen text-white w-[122px] h-[35px]'>Export Excel</button>
                        </div>
                        <div>
                            <select
                                className='w-[120px] h-[36px]'
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
                <IndividualTable
                    surveyResponses={surveyResponses}
                    searchTerm={searchTerm}
                    localSearchTerm={localSearchTerm}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                />
            </div>
        </div>
    )
}

export default FormResponsesTab
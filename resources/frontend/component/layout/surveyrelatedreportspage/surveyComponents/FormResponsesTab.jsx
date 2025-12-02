import React, { useState, useMemo, useRef, useEffect } from 'react'
import IndividualTable from './IndividualTable'
import { Select } from '@mui/material'
import { HiMiniMagnifyingGlass } from 'react-icons/hi2'
import { LuCalendar } from 'react-icons/lu';
import { useSurvey } from '@/context/Survey/SurveyContext';
import DateRangeFilter from './DateRangeFilter';
import { filter } from 'lodash';
import * as XLSX from 'xlsx';
import { MdOutlineFileDownload } from 'react-icons/md';


const ITEMS_PER_PAGE_OPTIONS = [5, 10, 25, 50];
const DEFAULT_ITEMS_PER_PAGE = 5;


const FormResponsesTab = ({ surveyResponses, setSurveyResponses, surveyId, dateFilter, satisfactionSurvey }) => {

    const modalRef = useRef(null);

    const [localSearchTerm, setLocalSearchTermValue] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);
   

   
    
    const exportToExcel = () => {

        const workbook = XLSX.utils.book_new();

        const filteredData = surveyResponses.data.map(row => {
            const { rating, status, ...rest } = row;
            return rest;
        });

        const worksheet = XLSX.utils.json_to_sheet(filteredData);

        const sheetName = surveyResponses.survey_title.substring(0, 31);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

        const today = new Date();
        const currentDate = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}-${today.getFullYear()}`;
        const fileName = `${surveyResponses.survey_title}_(form responses)_${currentDate}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    };

    const {
        fetchSurveyResponses,
        localSatisfaction,
        setLocalSatisfaction,
        localDateFilter,
        setLocalDateFilter,
        setSatisfactionFilteredSurvey,
        satisfactionFilteredSurvey
    } = useSurvey();

    const fetchSurveyResponse = async (filter = null) => {
        const totalRespondents = await fetchSurveyResponses(surveyId, filter);
        setSurveyResponses(totalRespondents);
    };

    const activeFilters = useMemo(() => {
        const filters = {};

        if (localDateFilter?.startDate && localDateFilter?.endDate) {
            filters.startDate = localDateFilter.startDate;
            filters.endDate = localDateFilter.endDate;
        }

        return Object.keys(filters).length > 0 ? filters : null;
    }, [localDateFilter]);

    useEffect(() => {

        if (localSatisfaction !== "All satisfaction") {
            setSurveyResponses(satisfactionFilteredSurvey);
        } else {
            fetchSurveyResponse(surveyResponses);
        }

    }, [activeFilters]);

    const openModal = (response) => {
        if (modalRef.current) {
            modalRef.current.showModal();
        }
    };

    const handleFilterClear = () => {
        setLocalDateFilter(null);
        fetchSurveyResponse(dateFilter);
    };


    const filteredCount = useMemo(() => {
        if (!surveyResponses?.data || !Array.isArray(surveyResponses.data)) {
            return 0;
        }

        const filtered = surveyResponses.data.filter((item) => {
            const localTerm = localSearchTerm?.toLowerCase() || "";

            const matchesLocal =
                localTerm === "" ||
                item.email?.toLowerCase().includes(localTerm) ||
                item.ticket_id?.toString().toLowerCase().includes(localTerm) ||
                Object.values(item).some(
                    (val) => typeof val === "string" && val.toLowerCase().includes(localTerm)
                );

            return matchesLocal;
        });

        return filtered.length;
    }, [surveyResponses?.data, localSearchTerm]);

    // Calculate pagination display (assuming 10 items per page, matching IndividualTable)

    const startItem = filteredCount > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0;
    const endItem = Math.min(currentPage * itemsPerPage, filteredCount);

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const handleDateFilterApply = (filterPayload) => {
        setLocalDateFilter(filterPayload);
        fetchSurveyResponse(filterPayload);
    };

    const convertRatingToSatisfaction = (rating) => {
        const numRating = parseInt(rating);
        if (numRating >= 9) return "Very Satisfied";
        if (numRating >= 7) return "Satisfied";
        if (numRating >= 5) return "Neutral";
        if (numRating >= 3) return "Dissatisfied";
        return "Very Dissatisfied";
    };

    const handleSatisfaction = (e) => {
        const selectedValue = e.target.value;
        setLocalSatisfaction(selectedValue);
        setCurrentPage(1);
        if (!surveyResponses || !surveyResponses.data) {
            console.log('Survey responses not loaded yet');
            return;
        }

        if (selectedValue === "All satisfaction") {
            setSurveyResponses(satisfactionSurvey);
            return;
        }

        const filteredArray = satisfactionSurvey.data.filter(response => {
            return Object.entries(response).some(([key, value]) => {
                if (['timestamp', 'email', 'ticket_id', 'rating', 'status', 'survey_owner'].includes(key)) {
                    return false;
                }

                if (value && !isNaN(value) && value >= 1 && value <= 10) {
                    return convertRatingToSatisfaction(value).toLowerCase() === selectedValue.toLowerCase();
                }

                if (value && typeof value === 'string') {
                    return value.toLowerCase() === selectedValue.toLowerCase();

                }

                return false;
            });
        });

        /*  return Object.entries(response).some(([key, value]) => {
               
                 if (['timestamp', 'email', 'ticket_id', 'rating', 'status', 'survey_owner'].includes(key)) {
                     return false;
                 }
 
                 console.log(`Key: ${key}, Value: ${value}, Type: ${typeof value}`);
 
                
                 if (value && !isNaN(value) && value >= 1 && value <= 10) {
                     const satisfaction = convertRatingToSatisfaction(value);
                     console.log(`Rating ${value} converted to: ${satisfaction}, Looking for: ${selectedValue}`);
                     return satisfaction.toLowerCase() === selectedValue.toLowerCase();
                 }
 
                 
                 if (value && typeof value === 'string') {
                     const match = value.toLowerCase() === selectedValue.toLowerCase();
                     console.log(`Comparing "${value}" with "${selectedValue}": ${match}`);
                     return match;
                 }
 
                 return false;
             });
  */

        const filteredData = {
            data: filteredArray,
            headers: surveyResponses.headers,
            survey_title: surveyResponses.survey_title
        };
        setSatisfactionFilteredSurvey(filteredData);
        setSurveyResponses(filteredData);
    };

    const handleClearSatisfaction = () => {
        setLocalSatisfaction("All satisfaction");
        setSurveyResponses(satisfactionSurvey);
        fetchSurveyResponse(dateFilter);
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
                            <button
                                onClick={exportToExcel}
                                className='flex justify-center px-[10px] py-[6px] items-center gap-[8px] bg-custom-solidgreen text-white  rounded-[4px]'
                            >
                                <span><MdOutlineFileDownload className='size-[23px]' /></span>
                                <span className='font-medium text-sm'>Export Excel</span>
                            </button>
                        </div>
                        <div>
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
                    <div className="flex-shrink-0">
                        <button
                            onClick={openModal}
                            className="flex justify-start px-3 items-center gap-2 min-w-[140px] border-[.6px] border-[#F4F4F4] h-[36px] rounded-[4px] text-sm text-[#9A9A9A]"
                        >
                            <LuCalendar />
                            <span>Date Range</span>
                        </button>
                    </div>

                    <div className="flex items-center min-w-[140px] h-[36px] rounded-[4px] border-[.6px] border-[#F4F4F4] text-black px-[12px] flex-shrink-0">
                        <select
                            name="localSatisfaction"
                            value={localSatisfaction}
                            onChange={handleSatisfaction}
                            className="outline-none text-sm px-[8px] w-full cursor-pointer"
                            selected={localSatisfaction}
                        >
                            <option value="All satisfaction">All satisfaction</option>
                            <option value="Very satisfied">Very satisfied</option>
                            <option value="Satisfied">Satisfied</option>
                            <option value="Neutral">Neutral</option>
                            <option value="Dissatisfied">Dissatisfied</option>
                            <option value="Very dissatisfied">Very dissatisfied</option>
                        </select>
                    </div>
                    {localSatisfaction !== "All satisfaction" && (
                        <div
                            onClick={handleClearSatisfaction}
                            className="flex-shrink-0 flex items-center cursor-pointer text-[#9A9A9A]">
                            X Clear
                        </div>
                    )}
                </div>
            </div>
            <div>
                <IndividualTable
                    surveyResponses={surveyResponses}
                    localSearchTerm={localSearchTerm}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
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

export default FormResponsesTab
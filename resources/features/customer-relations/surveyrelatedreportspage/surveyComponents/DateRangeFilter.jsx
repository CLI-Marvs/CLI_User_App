import React, { useState } from 'react'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/component/ui/tabs";

import { Calendar } from "@/component/ui/calendar"
import { LuCalendar, LuCalendarDays } from "react-icons/lu";
import { select } from '@material-tailwind/react';




const quarters = [
    { label: 'Q1', months: 'Jan - Mar' },
    { label: 'Q2', months: 'Apr - Jun' },
    { label: 'Q3', months: 'Jul - Sep' },
    { label: 'Q4', months: 'Oct - Dec' }
];


const DateRangeFilter = ({ modalRef, closeModal, onApplyFilter }) => {

    const [selectedYear, setSelectedYear] = useState(null);

    const [allyears, setAllyears] = useState(null);

    const [quarterYear, setQuarterYear] = useState(null);
    const [selectedQuarter, setSelectedQuarter] = useState(null);

    const [calendarDate, setCalendarDate] = useState(undefined);



    const currentYear = new Date().getFullYear();
    const minYear = 2023;

    // Generate array of years from currentYear down to 2023
    const years = Array.from({ length: currentYear - minYear + 1 }, (_, i) => currentYear - i);

    // Handler for Recent Years selection
    const handleRecentYearSelect = (year) => {
        setSelectedYear(year);

        setAllyears(null);
        setQuarterYear(null);
        setSelectedQuarter(null);
        setCalendarDate(undefined);
    };

    // Handler for All Years selection
    const handleAllYearsSelect = (year) => {
        setAllyears(year);

        setSelectedYear(null);
        setQuarterYear(null);
        setSelectedQuarter(null);
        setCalendarDate(undefined);
    };

    // Handler for Quarter Year selection
    const handleQuarterYearSelect = (year) => {
        setQuarterYear(year);
        // If no quarter is selected, default to Q1
        if (!selectedQuarter) {
            setSelectedQuarter('Q1');
        }
        // Clear other selections
        setSelectedYear(null);
        setAllyears(null);
        setCalendarDate(undefined);
    };

    // Handler for Quarter selection
    const handleQuarterSelect = (quarter) => {
        setSelectedQuarter(quarter);
        // If no quarter year is selected, default to current year
        if (!quarterYear) {
            setQuarterYear(new Date().getFullYear().toString());
        }
        // Clear other selections
        setSelectedYear(null);
        setAllyears(null);
        setCalendarDate(undefined);
    };

    // Handler for Calendar date selection
    const handleCalendarSelect = (date) => {
        setCalendarDate(date);

        setSelectedYear(null);
        setAllyears(null);
        setQuarterYear(null);
        setSelectedQuarter(null);
    };

    // Handler for Clear button
    const handleClear = () => {
        setSelectedYear(null);
        setAllyears(null);
        setQuarterYear(null);
        setSelectedQuarter(null);
        setCalendarDate(undefined);
    };

    const handleApplyFilter = () => {

        let payload = {
            startDate: null,
            endDate: null
        };

        // Recent Years filter
        if (selectedYear) {
            payload.startDate = `${selectedYear}-01-01`;
            payload.endDate = `${selectedYear}-12-31`;
        }
        // All Years filter
        else if (allyears) {
            payload.startDate = `${allyears}-01-01`;
            payload.endDate = `${allyears}-12-31`;
        }
        // Quarters filter
        else if (quarterYear && selectedQuarter) {

            // Determine quarter date ranges
            const quarterRanges = {
                'Q1': { start: '01-01', end: '03-31' },
                'Q2': { start: '04-01', end: '06-30' },
                'Q3': { start: '07-01', end: '09-30' },
                'Q4': { start: '10-01', end: '12-31' }
            };

            const range = quarterRanges[selectedQuarter];
            payload.startDate = `${quarterYear}-${range.start}`;
            payload.endDate = `${quarterYear}-${range.end}`;
        }
        // Custom Calendar filter
        else if (calendarDate?.from) {
            payload.startDate = calendarDate.from.toLocaleDateString('en-CA');


            if (calendarDate.to) {
                payload.endDate = calendarDate.to.toLocaleDateString('en-CA');
            } else {
                payload.endDate = calendarDate.from.toLocaleDateString('en-CA');
            }
        } else {
            
            handleClear();
            if (modalRef.current) {
                modalRef.current.close();
            }
            return; 
        }

        if (onApplyFilter && (payload.startDate && payload.endDate)) {
            onApplyFilter(payload);
        }
        
        handleClear();
        if (modalRef.current) {
            modalRef.current.close();
        }
    };

    const handleCancel = () => {

        setSelectedYear(null);
        setAllyears(null);
        setQuarterYear(null);
        setSelectedQuarter(null);
        setCalendarDate(undefined);


        if (modalRef.current) {
            modalRef.current.close();
        }
    };

    return (
        <dialog
            ref={modalRef}
            className="rounded-[10px] p-6 w-[512px] bg-white shadow-lg"
        >

            <form method="dialog" className='absolute top-2 right-3'>
                <button className=" flex justify-center w-10 h-10 items-center  text-custom-bluegreen ">✕</button>
            </form>
            <div className='felx flex-col gap-2 mb-[16px]'>
                <h2 className="text-[30px] montserrat-semibold">Select Date Range</h2>
                <p className='text-sm text-[#9A9A9A]'>Select a time period or select custom dates to filter responses</p>
            </div>
            <Tabs defaultValue="quick">
                <TabsList className="w-[462px] rounded-[10px] p-1 mb-6">
                    <TabsTrigger
                        className="w-full h-[29px] text-black rounded-[6px] flex gap-2"
                        value="quick"
                    >
                        <LuCalendar className='size-[16px]' />Quick Select</TabsTrigger>
                    <TabsTrigger
                        className="w-full h-[29px] text-black rounded-[6px] flex gap-2"
                        value="custom"
                    >
                        <LuCalendarDays className='size-[16px]' />Custom
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="quick">
                    <div className='flex flex-col gap-[20px]'>
                        <div className='flex flex-col gap-3'>
                            <div>
                                <p className='text-sm font-semibold'>Recent Years</p>
                            </div>
                            <div className='flex gap-2'>
                                {[0, 1, 2].map((offset) => {
                                    const year = new Date().getFullYear() - offset;
                                    const isSelected = year === selectedYear;

                                    return (
                                        <div
                                            key={year}
                                            onClick={() => handleRecentYearSelect(year)}
                                            className={`flex flex-col justify-center items-center w-[143px] h-[72px] rounded-[4px] border-[.6px] border-[#F4F4F4] text-center cursor-pointer transition-colors ${isSelected ? 'bg-custom-solidgreen' : ''
                                                }`}
                                        >
                                            <p className={`font-semibold ${isSelected ? 'text-white' : ''}`}>
                                                {year}
                                            </p>
                                            <p className={`text-sm ${isSelected ? 'text-white' : 'text-[#9A9A9A]'}`}>
                                                Full Year
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className='flex flex-col gap-3 mt-[20px]'>
                            <div>
                                <p className='text-sm font-semibold'>All Years</p>
                            </div>
                            <div>
                                <div className='flex gap-2 h-[36px] w-[446px] outline-none border-[.6px] border-[#f4F4F4] px-2 items-center text-[#9A9A9A]'>
                                    <LuCalendar className='size-[16px]' />
                                    <select
                                        name="year"
                                        id="year"
                                        value={allyears || ""}
                                        onChange={(e) => handleAllYearsSelect(e.target.value)}
                                        className='w-full outline-none text-black'
                                    >
                                        <option value="" disabled>Select a year</option>
                                        {years.map((year) => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className='w-[446px] flex justify-between'>
                            <p className='text-sm font-semibold'>Quarters</p>
                            <select
                                name="quarteryr"
                                id="quarteryr"
                                value={quarterYear || ""}
                                onChange={(e) => handleQuarterYearSelect(e.target.value)}
                                className='w-[140px] h-[36px] px-3 border-[.6px] border-[#f4F4F4] outline-none rounded-[4px] '
                            >
                                <option value="" disabled>Select a year</option>
                                {years.map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className='flex gap-2'>
                            {quarters.map((quarter, index) => {
                                const isSelected = selectedQuarter === quarter.label;

                                return (
                                    <button
                                        key={quarter.label}
                                        onClick={() => handleQuarterSelect(quarter.label)}
                                        type="button"
                                        className={`flex flex-col gap-1 justify-center items-center w-[105px] h-[72px] rounded-[4px] border-[.6px] border-[#F4F4F4] text-center cursor-pointer transition-colors ${isSelected ? 'bg-custom-solidgreen' : ''
                                            }`}
                                    >
                                        <p className={`font-semibold ${isSelected ? 'text-white' : ''}`}>
                                            {quarter.label}
                                        </p>
                                        <p className={`text-sm ${isSelected ? 'text-white' : 'text-[#9A9A9A]'}`}>
                                            {quarter.months}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </TabsContent>
                <TabsContent className="flex flex-col gap-6" value="custom">
                    <div className='flex justify-center'>
                        <Calendar
                            mode="range"
                            selected={calendarDate}
                            onSelect={handleCalendarSelect}
                            captionLayout="dropdown"
                            className="rounded-md outline-none "
                            classNames={{

                            }}
                        />
                    </div>
                    <div className='flex flex-col w-full items-center gap-2'>
                        <div className=''>
                            <p className='text-sm text-[#9A9A9A]'>Selected Range</p>
                        </div>
                        <div className='text-[16px] text-[#323232] font-medium'>
                            {calendarDate?.from ? (
                                calendarDate.to ? (
                                    `${calendarDate.from.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${calendarDate.to.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                                ) : (
                                    calendarDate.from.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                )
                            ) : (
                                'No date selected'
                            )}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
            <div className='mt-[40px] w-full flex justify-end gap-2 text-sm'>
                <button
                    type="button"
                    onClick={handleClear}
                    className='px-4 py-2  h-[36px] rounded-[4px] border-[.6px] border-[#F4F4F4] flex items-center'>
                    Clear
                </button>
                <button
                    onClick={handleCancel}
                    type="button"
                    className='px-4 py-2  h-[36px] rounded-[4px] border-[.6px] border-[#F4F4F4] flex items-center'>
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleApplyFilter}
                    className='px-4 py-2  h-[36px] rounded-[4px] border-[.6px] border-[#F4F4F4] bg-custom-solidgreen text-white flex items-center'>
                    Apply Filter
                </button>
            </div>
        </dialog>
    )
}

export default DateRangeFilter
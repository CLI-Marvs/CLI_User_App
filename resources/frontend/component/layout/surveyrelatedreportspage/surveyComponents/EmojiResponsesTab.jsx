import React, { useState } from 'react'
import SummaryRatingDetails from './SummaryRatingDetails'
import { Select } from '@mui/material'
import { HiMiniMagnifyingGlass } from 'react-icons/hi2';

const EmojiResponsesTab = ({ surveyRatings, searchTerm }) => {

    const [localSearchTerm, setLocalSearchTermValue] = useState("");

    return (
        <div>
            <div className='p-[20px] flex flex-col gap-4 bg-white'>
                <div className='flex justify-between '>
                    <div className='flex flex-col gap-[4px]'>
                        <div>
                            <p className='montserrat-medium text-[24px]'>Response Overview</p>
                        </div>
                        <div>
                            <p className='text-sm'>111 responses . Showing 1 -51</p>
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
                <SummaryRatingDetails surveyRatings={surveyRatings} searchTerm={searchTerm} localSearchTerm={localSearchTerm} />
            </div>
        </div>
    )
}

export default EmojiResponsesTab
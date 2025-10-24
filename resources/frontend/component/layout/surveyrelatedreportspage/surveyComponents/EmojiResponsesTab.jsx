import React from 'react'
import SummaryRatingDetails from './SummaryRatingDetails'

const EmojiResponsesTab = () => {
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
                    <input type="text" className='w-full border' />
                    <button className='border w-[180px] h-[36px] rounded-[10px]'>date range</button>
                    <Select className='w-[120px] h-[36px]'>
                        <option value="">1 per page</option>
                        <option value="1">5 per page</option>
                        <option value="2">51 per page</option>
                    </Select>
                </div>
            </div>
            <div>
               <SummaryRatingDetails />
            </div>
        </div>
    )
}

export default EmojiResponsesTab
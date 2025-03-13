import React from 'react'
import { FaTrash } from "react-icons/fa";

export const SurveyList = () => {
    return (
        <div>
            <div
                className='flex flex-col items-center w-[321.21px] h-[227px] border-1 rounded-[10px] border-[#E2E2E2] bg-[#DEEDD9] hover:border-black cursor-pointer'>
                <div className='w-[128px] h-[160px]'>

                </div>
                <div className='w-full h-[66px] flex justify-between items-center py-[10px] px-[20px] bg-white rounded-b-[10px]'>
                    <div className="w-[240px] leading-[24px]">
                        <p className="montserrat-medium text-[20px] text-[#494747] truncate overflow-hidden whitespace-nowrap">
                            CSAT Survey Reservations
                        </p>
                        <p className='text-sm text-[#696969]'>Edited <span>11:04 AM</span></p>
                    </div>
                    <div className='flex justify-center items-center size-[16px]'>
                        <FaTrash className='text-[#696969]' />
                    </div>
                </div>
            </div>
        </div>
    )
}

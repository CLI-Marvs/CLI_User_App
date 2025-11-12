import React from 'react'
import { FaRegClock } from "react-icons/fa6";
import { MdOutlineNumbers } from "react-icons/md";
import { FiUserCheck } from "react-icons/fi";
import { MdOutlineEmail } from "react-icons/md";
const IndividualResponseModal = ({ modalRef, selectedResponse }) => {


    const formatTimestamp = (timestamp) => {
        if (!timestamp) return { date: 'N/A', time: 'N/A' };

        const date = new Date(timestamp);

        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const formattedTime = date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });

        return { date: formattedDate, time: formattedTime };
    };


    const { date, time } = formatTimestamp(selectedResponse?.timestamp);

    return (
        <dialog
            id="individualResponse"
            ref={modalRef}
            className="modal w-[1024px] px-[20px] py-[40px] rounded-[8px] shadow-custom5 backdrop:bg-black/50 "
        >
            <div className='flex flex-col gap-[12px]'>
                <form method="dialog" className="flex justify-end -mr-1">
                    <button className="absolute justify-center w-10 h-10 items-center rounded-full bg-custom-grayFA text-custom-bluegreen hover:bg-custombg" >
                        ✕
                    </button>
                </form>
                <div className="  flex flex-col ">
                    <div>
                        <p className='montserrat-semibold text-[30px]'>Response Details</p>
                    </div>
                    <div className='mb-[6px] text-sm text-[#9A9A9A]'>
                        Complete survey response information
                    </div>
                </div>
                <div className='flex flex-wrap gap-4 w-full text-sm'>
                    <div className='flex-1  p-4 text-sm border-[.6px] border-[#F4F4F4] rounded-[8px] bg-[#F6F6F630]'>
                        <div className='flex gap-[12px]'>
                            <div className='flex w-[32px] h-[32px] justify-center items-center bg-[#F6F6F6] rounded-[4px]'>
                                <FaRegClock className='size-4 text-custom-solidgreen' />
                            </div>
                            <div className='flex flex-col gap-[6px]'>
                                <div className='text-[#9A9A9A]'>
                                    Timestamp
                                </div>
                                <div className='flex gap-[8px] whitespace-nowrap'>
                                    <span>{date}</span>
                                    <span className='text-[#9A9A9A]'>{time}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='flex-1  p-4 text-sm border-[.6px] border-[#F4F4F4] rounded-[8px] bg-[#F6F6F630]'>
                        <div className='flex gap-[12px]'>
                            <div className='flex w-[32px] h-[32px] justify-center items-center bg-[#F6F6F6] rounded-[4px]'>
                                <MdOutlineNumbers className='size-4 text-custom-solidgreen' />
                            </div>
                            <div className='flex flex-col gap-[6px]'>
                                <div className='text-[#9A9A9A]'>
                                    Ticket ID 
                                </div>
                                <div className='flex gap-[8px] whitespace-nowrap'>
                                    <span>Ticket#{selectedResponse?.ticket_id}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='flex-1  p-4 text-sm border-[.6px] border-[#F4F4F4] rounded-[8px] bg-[#F6F6F630]'>
                        <div className='flex gap-[12px]'>
                            <div className='flex w-[32px] h-[32px] justify-center items-center bg-[#F6F6F6] rounded-[4px]'>
                                <FiUserCheck className='size-4 text-custom-solidgreen' />
                            </div>
                            <div className='flex flex-col gap-[6px]'>
                                <div className='text-[#9A9A9A]'>
                                    Survey Owner
                                </div>
                                <div className='flex gap-[8px] whitespace-nowrap'>
                                    <span>{selectedResponse?.survey_owner}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='flex-1  p-4 text-sm border-[.6px] border-[#F4F4F4] rounded-[8px] bg-[#F6F6F630]'>
                        <div className='flex gap-[12px]'>
                            <div className='flex w-[32px] h-[32px] justify-center items-center bg-[#F6F6F6] rounded-[4px]'>
                                <MdOutlineEmail className='size-4 text-custom-solidgreen' />
                            </div>
                            <div className='flex flex-col gap-[6px]'>
                                <div className='text-[#9A9A9A]'>
                                    Email Address
                                </div>
                                <div className='flex gap-[8px] whitespace-nowrap'>
                                    <span>{selectedResponse?.email}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <div className='flex justify-between items-center'>
                        <p className='montserrat-semibold text-[20px]'>Response</p>
                    </div>
                </div>
                <div>
                    <div className='flex justify-between h-[46.67px] rounded-[8px] w-full border-[.6px] border-[#F4F4F4] px-[12.67px] py-[12.83px] bg-[#F6F6F630]'>
                        <div>
                            Overall Rating
                        </div>
                        <div>
                            <div>
                                logo
                            </div>
                        </div>
                    </div>
                </div>
                <div className='flex flex-col gap-2'>
                    <div className='flex justify-between min-h-[46.67px] w-full border-[.6px] border-[#F4F4F4] px-[12.67px] py-[12px] '>
                        <div>
                            Question 1
                        </div>
                        <div>
                            <div>
                                answer
                            </div>
                        </div>
                    </div>
                    <div className='flex flex-col gap-[12px] w-full border-[.6px] border-[#F4F4F4] px-[12.67px] py-[12px] '>
                        <div>
                            rating
                        </div>
                        <div>
                            <div className='rounded-[8px] w-full border-[.6px] border-[#F4F4F4] px-[12.67px] py-[12.83px]'>
                                comment
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </dialog>
    )
}

export default IndividualResponseModal
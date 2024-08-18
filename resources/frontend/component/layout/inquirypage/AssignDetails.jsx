import React from 'react'

const AssignDetails = () => {
    return (
        <>
            <div className='flex h-12 w-full gap-5 items-center mt-1 mb-5'>
                <div className='flex w-36 flex-col text-custom-gray71 '>
                    <p className='flex justify-end text-sm'>July 25, 2024</p>
                    <p className='flex justify-end text-sm'>11:19:31 AM ○</p>
                </div>
                <div className='flex-1'>
                    <div className='truncate w-44'>
                        <p className='text-xs text-custom-gray truncate'>Ticket inquired by client</p>
                    </div>
                    <p className='text-xs text-custom-gray space-x-1'>
                        (
                        <span>Kent A.</span>
                        <span>|</span>
                        <span> Kentj@gmail.com</span>
                        )
                    </p>
                </div>
            </div>

        </>
    )
}

export default AssignDetails
import React from 'react'
import TicketTable from './TicketTable'

const InquiryList = () => {
  return (
    <>
    <div className='h-screen max-w-full bg-custombg'>
        <div className='h-14 bg-custombg '>
            <div className='relative flex justify-start gap-3'>
                <div className='relative w-1/2'>
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="size-4 absolute left-3 top-3 text-gray-500"
                    >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                    />
                    </svg>
                    <input
                    type="text"
                    className='h-10 w-full rounded-lg pl-9 pr-6 text-sm'
                    placeholder='Search Reservation'
                    />
                    <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        strokeWidth={1.5} 
                        stroke="currentColor" 
                        className="size-4 absolute right-3 top-3 text-custom-bluegreen">
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5" />
                    </svg>
                </div>
                <div>
                    <button className='flex justify-center items-center h-10 px-3 rounded-xl gradient-btn2 text-white'><span className='flex pr-1 text-xl'>+</span> Concern</button>
                </div>
            </div>
        </div>
        <div className='max-w-5xl'>
            <div className='flex items-center h-12 px-6 gap-2 bg-white rounded-t-lg'>
                    <div className='flex items-center bg-custom-lightgreen h-6 px-3 rounded-3xl '><p className='text-sm text-white montserrat-semibold'>All</p></div>
                    <div className='flex items-center border-custom-lightgreen gradient-border text-custom-solidgreen border h-6 px-3 rounded-3xl '><p className='text-sm montserrat-semibold'>Resolve</p></div>
                    <div className='flex items-center border-custom-lightgreen border text-custom-solidgreen h-6 px-3 rounded-3xl '><p className='text-sm montserrat-semibold'>Unresolve</p></div>
                    
            </div>
            <TicketTable/>
            <div className='flex justify-end items-center h-12 px-6 gap-2 bg-white rounded-b-lg'>
                <p className='text-sm text-gray-400'>Last account activity: 0 minutes</p>
            </div>
        </div>
    </div>
    {/* <div className=''>
        <ConcernFormModal modalRef={modalRef}/>
    </div> */}
        
</>
  )
}

export default InquiryList
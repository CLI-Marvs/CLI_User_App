import React from 'react'
import AssignDetails from './AssignDetails'

const AssignSidePanel = () => {
    return (
        <>
            <div className='w-full '>
                <div className="flex items-center border rounded-md overflow-hidden">
                    <span className=" text-custom-bluegreen font-semibold bg-custombg w-32 flex pl-3 py-2">Assign to</span>
                    <input name='name' type="text" className="w-full px-2 focus:outline-none" placeholder="Input Email or Name" />
                </div>
                <div className='flex w-full justify-center items-center p-4'>
                    <button className='h-9 gradient-btn2 px-16 text-white rounded-lg'>
                        Assign
                    </button>
                </div>
                <div className='border border-t-1 border-custom-lightestgreen'></div>
                <div className='flex h-12 w-full gap-5 items-center mt-1'>
                    <div className='flex w-36 justify-end'>
                        <p className='text-xl text-custom-bluegreen montserrat-semibold'>(21 days ago)</p>
                    </div>
                    <div className='flex-1'>
                        <p className='text-base montserrat-medium text-custom-solidgreen'>July 25, 2024</p>
                    </div>
                </div>
                <div className="h-full flex flex-col">
                    <div className="h-90 overflow-y-auto">
                        <AssignDetails />
                        <AssignDetails /> 
                        <AssignDetails />  
                        <AssignDetails />  
                        <AssignDetails />  
                        <AssignDetails />  
  
                    </div>
                    <div className="border border-t-1 border-custom-lightestgreen flex-shrink-0"></div>
                </div>
            </div>
        </>
    )
}

export default AssignSidePanel
import React from 'react'

const Sept_30_25 = () => {
    return (
        <div className='flex gap-[24px] w-[1033px] min-h-[100px] p-[30px] '>
            <div className='flex w-[150px] shrink-0'>
                <p className='text-[#717171]'>September 30, 2025</p>
            </div>
            <div className='flex flex-col gap-[24px]'>
                <div className='w-full flex flex-col gap-[12px]'>
                    <div>
                        <p className='text-[#2A2A2A]'>Feature Updates:</p>
                    </div>
                    <div className='flex flex-col text-[#717171] '>
                        <div className="font-semibold text-[#2A2A2A]">
                            Built-in Customer Survey
                        </div>
                        <div className='flex'>
                            <div className='flex w-[30px] shrink-0 justify-center'>
                                •
                            </div>
                            <div>
                                Can create and add surveys.
                            </div>
                        </div>
                        <div className='flex'>
                            <div className='flex w-[30px] shrink-0 justify-center'>
                                •
                            </div>
                            <div>
                                Can assign surveys to tickets and specify the type of survey per inquiry type.
                            </div>
                        </div>
                        <div className='flex'>
                            <div className='flex w-[30px] shrink-0 justify-center'>
                                •
                            </div>
                            <div>
                                Can view survey data and reports.
                            </div>
                        </div>
                    </div>
                    <div className='flex flex-col text-[#717171] '>
                        <div className=" text-[#2A2A2A]">
                            Digitized Walk-in experience functionality
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Sept_30_25
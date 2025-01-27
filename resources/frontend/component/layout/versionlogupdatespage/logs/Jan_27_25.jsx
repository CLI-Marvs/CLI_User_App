import React from 'react'

const Jan_27_25 = () => {
    return (
        <div className='flex gap-[24px] w-[1033px] min-h-[100px] p-[30px] '>
            <div className='flex w-[150px] shrink-0'>
                <p className='text-[#717171]'>January 27, 2025</p>
            </div>
            <div className='flex flex-col gap-[24px]'>
                <div className='w-full flex flex-col gap-[12px]'>
                    <div>
                        <p className='text-[#2A2A2A]'>Feature Updates:</p>
                    </div>
                    <div className='flex flex-col text-[#717171] '>
                        <div className='flex'>
                            <div className='flex w-[30px] shrink-0 justify-center'>
                                •
                            </div>
                            <div>
                                Separate email notifications for survey links.
                            </div>
                        </div>
                        <div className='flex'>
                            <div className='flex w-[30px] shrink-0 justify-center'>
                                •
                            </div>
                            <div>
                                Additional parameters for survey links (email, ticket ID)
                            </div>
                        </div>
                        <div className='flex'>
                            <div className='flex w-[30px] shrink-0 justify-center'>
                                •
                            </div>
                            <div>
                                Report new filter implementation.
                            </div>
                        </div>
                        <div className='flex'>
                            <div className='flex w-[30px] shrink-0 justify-center'>
                                •
                            </div>
                            <div>
                                Report interface improvements, including visible data counts/numbers with clickable links (this allows us to verify if the numbers in the report are correct).
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Jan_27_25

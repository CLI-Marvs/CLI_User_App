import React from 'react'
import Sho from '../../../../../public/Images/rodfil.png'

const AdminMessages = () => {
  return (
    <div className='w-full'>
        <div className='flex justify-end w-full mt-10 gap-2 '>
            
            <div className='flex flex-col'>
                <p className='font-bold text-custom-bluegreen'>CLI Support</p>
                <p className='font-semibold text-custom-gray81'>Alice Smith</p>
            </div>
            <div className='h-12 w-12'>
                <img className='rounded-full' src={Sho} alt="" />
            </div>
        </div>
        <div className='w-full mt-2 mb-5 pr-12'>
            <div className=' w-full h-auto gradient-background2 rounded-b-lg rounded-l-lg px-8 py-3'>
                <div>
                    <p>I found the issue regarding your bank account and it seems that it’s functioning very well now. Use it when you pay bills on your property.</p>
                </div>
                {/*  <div className='mt-4'>
                    <button className='flex items-center justify-start bg-customnavbar h-12 px-24 pl-4 text-black gap-2 rounded-lg'>
                        <img src={FolderFile} alt="download btn" />
                        Document.pdf
                    </button>
                </div> */}
            </div>
            <div className='w-full flex justify-start'>
                <p className='flex text-custom-gray81 text-sm space-x-1'>
                    <span>just now</span>
                    {/* <span>Jul 17, 2024,</span>
                    <span>11:19 AM</span>
                    <span>(7 days ago)</span> */}
                </p>
            </div>
        </div>
    </div>
  )
}

export default AdminMessages
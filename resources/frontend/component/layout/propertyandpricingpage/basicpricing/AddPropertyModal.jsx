import React from 'react'

const AddPropertyModal = ({ modalRef }) => {
    return (
        <dialog className="modal w-[475px] h-[330px] rounded-lg" ref={modalRef}>
            <div className=' px-14 mb-5 rounded-lg'>
                <div className=''>
                    <form method="dialog" className="pt-3 flex justify-end -mr-[50px]">
                        <button className="flex justify-center w-10 h-10 items-center rounded-full bg-custombg3 text-custom-bluegreen hover:bg-custombg">
                            ✕
                        </button>
                    </form>
                </div>
                <div className='pt-5 flex justify-start items-center mb-5'>
                    <p className='montserrat-bold'>Add Property Details</p>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center border rounded-md overflow-hidden">
                        <span className="text-custom-gray81 bg-custombg flex w-3/4 pl-3 py-1">Property Name</span>
                        <input name='propertyName' type="text" className="w-full px-4 focus:outline-none" placeholder="" />
                    </div>
                    <div className="flex items-center border rounded-md overflow-hidden">
                        <span className="text-custom-gray81 bg-custombg flex items-center w-3/4 -mr-3 pl-3 py-1">Type</span>
                        <div className="relative w-full">
                            <select name="concern" className="appearance-none w-full px-4 py-1 bg-white text-gray-400 focus:outline-none border-0">
                                <option value="">Select Type</option>
                                <option value="concern1">Type 1</option>
                                <option value="concern2">Type 2</option>
                                <option value="concern3">Type 3</option>
                            </select>
                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 bg-custombg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-custom-gray81" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center border rounded-md overflow-hidden">
                        <span className="text-custom-gray81 bg-custombg flex w-3/4 pl-3 py-1">Tower/Phase</span>
                        <input name='tower' type="text" className="w-full px-4 focus:outline-none" placeholder="" />
                    </div>
                    <div className='flex justify-center my-3'>
                        <button className='w-[173px] h-[37px] text-white montserrat-semibold text-sm gradient-btn rounded-[10px]'>Create Pricing Draft</button>
                    </div>
                </div>
            </div>
        </dialog>
    )
}

export default AddPropertyModal
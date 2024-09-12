import React from 'react'
import { IoMdArrowDown, IoMdArrowDropdown } from 'react-icons/io'


const AddPropertyModal = ({ modalRef }) => {
    return (
        <dialog className="modal w-[475px] h-[330px] rounded-lg backdrop:bg-black/50" ref={modalRef}>
            <div className=' px-14 mb-5 rounded-lg'>
                <div className=''>
                    <form method="dialog" className="pt-2 flex justify-end -mr-[50px]">
                        <button className="flex justify-center w-10 h-10 items-center rounded-full  text-custom-bluegreen hover:bg-custombg">
                            ✕
                        </button>
                    </form>
                </div>
                <div className='pt-5 flex justify-start items-center mb-5'>
                    <p className='montserrat-bold'>Add Property Details</p>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center border border-custom-grayF1 rounded-md overflow-hidden">
                        <span className="text-custom-gray81 bg-custom-grayFA flex w-3/4 pl-3 py-1">Property Name</span>
                        <input name='propertyName' type="text" className="w-full px-4 focus:outline-none" placeholder="" />
                    </div>
                    <div className="flex items-center border border-custom-grayF1 rounded-md overflow-hidden">
                        <span className="text-custom-gray81 bg-custom-grayFA flex items-center w-3/4 -mr-3 pl-3 py-1">Type</span>
                        <div className="relative w-full">
                            <select name="type" className="appearance-none w-full px-4 py-1 bg-white focus:outline-none border-0">
                                <option value="">Select Type</option>
                                <option value="concern1">Type 1</option>
                                <option value="concern2">Type 2</option>
                                <option value="concern3">Type 3</option>
                            </select>
                            <span className="absolute inset-y-0 right-0 text-custom-gray81 flex items-center pr-3 pl-3 bg-custom-grayFA pointer-events-none">
                                <IoMdArrowDropdown/>
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center border border-custom-grayF1 rounded-md overflow-hidden">
                        <span className="text-custom-gray81 bg-custom-grayFA flex w-3/4 pl-3 py-1">Tower/Phase</span>
                        <input name='tower' type="text" className="w-full px-4 focus:outline-none" placeholder="" />
                    </div>
                    <div className='flex justify-center my-3'>
                        <button className='w-[173px] h-[37px] text-white montserrat-semibold text-sm gradient-btn rounded-[10px] hover:shadow-custom4'>Create Pricing Draft</button>
                    </div>
                </div>
            </div>
        </dialog>
    )
}

export default AddPropertyModal
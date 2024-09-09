import React,{useRef} from 'react'
import { IoMdArrowDropdown } from "react-icons/io";
const UploadUnitDetailsModal = ({ modalRef, fileName }) => {

    
  return (

    
    <dialog className="modal w-[474px] rounded-lg backdrop:bg-black/50" ref={modalRef}>
            <div className=' px-14 mb-5 rounded-[10px]'>
                <div className=''>
                    <form method="dialog" className="pt-3 flex justify-end -mr-[50px]">
                        <button className="flex justify-center w-10 h-10 items-center rounded-full bg-custombg3 text-custom-bluegreen hover:bg-custombg">
                            ✕
                        </button>
                    </form>
                </div>
                <div className='flex justify-between items-center bg-custom-grayFA h-[54px] px-[15px] mb-3'>
                    <div>
                        <p className='underline text-blue-500 cursor-pointer'>{fileName}</p>
                    </div>
                    <div>
                        <label className='flex justify-center items-center w-[64px] h-[24px] bg-white text-xs border text-[#067AC5] border-[#067AC5] rounded-[5px] hover:shadow-custom4'>
                            Replace
                            <input type="file" className='hidden' />
                        </label>                    
                    </div>
                </div>
                <div className='flex justify-start items-center h-40px my-6'>
                    <p className='montserrat-bold'>Confirm Columns</p>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center border rounded-md overflow-hidden">
                        <span className="text-custom-gray81 bg-custombg flex items-center w-[450px] h-[31px] -mr-3 pl-3 text-sm">Floor</span>
                        <div  className="relative w-full">
                            <select name="floor" id='floor-select' className="appearance-none w-full px-4 h-[31px] bg-white  focus:outline-none border-0">
                                <option value="column1">Column 1</option>
                            </select>
                            <span  className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 bg-custombg">
                                <IoMdArrowDropdown className='text-custom-gray81' />
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center border rounded-md overflow-hidden">
                        <span className="text-custom-gray81 bg-custombg flex items-center w-[450px] h-[31px] -mr-3 pl-3 text-sm">Room Number</span>
                        <div  className="relative w-full">
                            <select name="roomNumber" className="appearance-none w-full px-4 h-[31px] bg-white  focus:outline-none border-0">
                                <option value="column2">Column 2</option>
                            </select>
                            <span  className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 bg-custombg">
                                <IoMdArrowDropdown className='text-custom-gray81' />
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center border rounded-md overflow-hidden">
                        <span className="text-custom-gray81 bg-custombg flex items-center w-[450px] h-[31px] -mr-3 pl-3 text-sm">Unit</span>
                        <div  className="relative w-full">
                            <select name="unit" className="appearance-none w-full px-4 h-[31px] bg-white  focus:outline-none border-0">
                                <option value="column3">Column 3</option>
                            </select>
                            <span  className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 bg-custombg">
                                <IoMdArrowDropdown className='text-custom-gray81' />
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center border rounded-md overflow-hidden">
                        <span className="text-custom-gray81 bg-custombg flex items-center w-[450px] h-[31px] -mr-3 pl-3 text-sm">Type</span>
                        <div  className="relative w-full">
                            <select name="type" className="appearance-none w-full px-4 h-[31px] bg-white  focus:outline-none border-0">
                                <option value="column4">Column 4</option>
                            </select>
                            <span  className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 bg-custombg">
                                <IoMdArrowDropdown className='text-custom-gray81' />
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center border rounded-md overflow-hidden">
                        <span className="text-custom-gray81 bg-custombg flex items-center w-[450px] h-[31px] -mr-3 pl-3 text-sm">Floor Area</span>
                        <div  className="relative w-full">
                            <select name="floorArea" className="appearance-none w-full px-4 h-[31px] bg-white  focus:outline-none border-0">
                                <option value="column5">Column 5</option>
                            </select>
                            <span  className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 bg-custombg">
                                <IoMdArrowDropdown className='text-custom-gray81' />
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center border rounded-md overflow-hidden">
                        <span className="text-custom-gray81 bg-custombg flex items-center w-[450px] h-[31px] -mr-3 pl-3 text-sm">Balcony Area</span>
                        <div  className="relative w-full">
                            <select name="balconyArea" className="appearance-none w-full px-4 h-[31px] bg-white  focus:outline-none border-0">
                                <option value="column6">Column 6</option>
                            </select>
                            <span  className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 bg-custombg">
                                <IoMdArrowDropdown className='text-custom-gray81' />
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center border rounded-md overflow-hidden">
                        <span className="text-custom-gray81 bg-custombg flex items-center w-[450px] h-[31px] -mr-3 pl-3 text-sm">Garden Area</span>
                        <div  className="relative w-full">
                            <select name="gardenArea" className="appearance-none w-full px-4 h-[31px] bg-white  focus:outline-none border-0">
                                <option value="column7">Column 7</option>
                            </select>
                            <span  className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 bg-custombg">
                                <IoMdArrowDropdown className='text-custom-gray81' />
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center border rounded-md overflow-hidden">
                        <span className="text-custom-gray81 bg-custombg flex items-center w-[450px] h-[31px] -mr-3 pl-3 text-sm">Total Area</span>
                        <div  className="relative w-full">
                            <select name="totalArea" className="appearance-none w-full px-4 h-[31px] bg-white  focus:outline-none border-0">
                                <option value="column8">Column 8</option>
                            </select>
                            <span  className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 bg-custombg">
                                <IoMdArrowDropdown className='text-custom-gray81' />
                            </span>
                        </div>
                    </div>
                </div>
                <div className='flex justify-center mt-4 mb-8'>
                    <button className='w-[177px] h-[37px] text-white montserrat-semibold text-sm gradient-btn2 rounded-[10px]'>Confirm and Upload</button>
                </div>
            </div>
        </dialog>
  )
}

export default UploadUnitDetailsModal
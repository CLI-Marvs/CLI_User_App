import React from 'react'
import { FaRegTrashAlt } from 'react-icons/fa'
import { IoMdArrowDropdown } from 'react-icons/io'
import { MdFormatListBulletedAdd } from 'react-icons/md'

const AddPriceVersionModal = ({ modalRef }) => {
    return (
        <dialog className="modal w-[672px] rounded-[10px] bg-custom-grayFA backdrop:bg-black/50" ref={modalRef}>
            <div className=' px-[50px] mb-5 rounded-lg'>
                <div className=''>
                    <form method="dialog" className="pt-3 flex justify-end -mr-[40px]">
                        <button className="flex justify-center w-10 h-10 items-center rounded-full bg-custombg3 text-custom-bluegreen hover:bg-custombg">
                            ✕
                        </button>
                    </form>
                </div>
                <div className='pt-5 flex justify-start items-center mb-5'>
                    <p className='montserrat-bold'>Add Property Details</p>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center w-[375px] border rounded-md overflow-hidden">
                        <span className="text-custom-gray81 bg-custombg flex items-center w-full -mr-3 pl-3 py-1 text-sm">Property</span>
                        <div className="relative w-full">
                            <select name="property" className="appearance-none w-[144px] px-4 py-1 bg-white focus:outline-none border-0">
                                <option value="">Select Property</option>
                                <option value="concern1">Type 1</option>
                                <option value="concern2">Type 2</option>
                                <option value="concern3">Type 3</option>
                            </select>
                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 bg-custombg text-custom-gray81 pointer-events-none">
                               <IoMdArrowDropdown/>
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center h-[31px] w-[380px] border rounded-md text-sm overflow-hidden">
                        <span className="text-custom-gray81  bg-custombg flex w-full pl-3 py-1">Tower/Phase</span>
                        <input name='propertyName' type="text" className="w-[200px] px-4 focus:outline-none" placeholder="" />
                    </div>
                    <table className=''>
                        <thead>
                            <tr className='h-[83px] flex gap-[30px] items-center text-custom-grayA5 montserrat-semibold text-sm'>
                                <th className='rounded-tl-[10px] pl-[10px] w-[150px] text-left'>Version</th>
                                <th className='w-[100px] text-left pl-[10px] pr-10 leading-[18px]'>Percent Increase</th>
                                <th className='w-[100px] text-left pl-[10px] pr-10 leading-[18px]'>No. of allowed buyers</th>
                                <th className='w-[100px] text-left pl-[10px]'>Expiry Date</th>
                                <th className='rounded-tr-[10px] w-[62px]'></th>
                            </tr>
                        </thead>
                        <div className='shadow-custom5 rounded-[10px] overflow-hidden w-[572px]'>
                        <tbody className='' >
                            <tr className='h-[66px] text-sm border-separate bg-white'>
                                <td className='px-[10px]'>
                                    <input type="text" value="version 1" className='pl-3 w-[140px] border border-custom-grayF1 rounded-[5px]' />
                                </td>
                                <td className='px-[10px]'>
                                    <input type="text" value="0" className='pl-3 w-[100px] border border-custom-grayF1 rounded-[5px]' />
                                </td>
                                <td className='px-[10px]'>
                                    <input type="text" value="100" className='pl-3 w-[100px] border border-custom-grayF1 rounded-[5px]' />
                                </td>
                                <td className='px-[10px]'>
                                    <input type="date" className='pl-3 w-[120px] border border-custom-grayF1 rounded-[5px]' />
                                </td>
                                <td><FaRegTrashAlt className='size-5 text-custom-gray81 hover:text-red-500' /></td>
                            </tr>
                            <tr className='h-[66px] text-sm'>
                                <td className='px-[10px]'>
                                    <input type="text" value="version 1" className='pl-3 w-[140px] border border-custom-grayF1 rounded-[5px]' />
                                </td>
                                <td className='px-[10px]'>
                                    <input type="text" value="0" className='pl-3 w-[100px] border border-custom-grayF1 rounded-[5px]' />
                                </td>
                                <td className='px-[10px]'>
                                    <input type="text" value="100" className='pl-3 w-[100px] border border-custom-grayF1 rounded-[5px]' />
                                </td>
                                <td className='px-[10px]'>
                                    <input type="date" className='pl-3 w-[120px] border border-custom-grayF1 rounded-[5px]' />
                                </td>
                                <td className='w-full'><FaRegTrashAlt className='size-5 text-custom-gray81 hover:text-red-500' /></td>
                            </tr>
                            <tr className=' bg-white '>
                                <td colSpan="5" className=''>
                                    <div className='flex justify-center'>
                                        <button className='h-[24px] w-[235px] my-[15px] flex gap-[10px] justify-center items-center text-sm'>
                                            <span>Add</span><span><MdFormatListBulletedAdd className='h-[24px] w-[24px] text-[#5F6368]'/></span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                        </div>
                    </table>
                    <div className='flex justify-center my-3'>
                        <button className='w-[129px] h-[37px] text-white montserrat-semibold text-sm gradient-btn2 rounded-[10px] hover:shadow-custom4'>Save Versions</button>
                    </div>
                </div>
            </div>
        </dialog>
    )
}

export default AddPriceVersionModal
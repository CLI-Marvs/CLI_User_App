import React, { useState } from 'react'
import { FaRegTrashAlt } from 'react-icons/fa';
import { IoIosArrowDown } from "react-icons/io";


const PriceVersions = () => {

    const [accordionOpen, setAccordionOpen] = useState(false);

    return (
        <>
            <div className={`transition-all duration-2000 ease-in-out
      ${accordionOpen ? 'h-[74px] mx-5 bg-white shadow-custom5 rounded-[10px]' : 'h-[72px]  gradient-btn3 rounded-[10px] p-[1px]'} `}>
                <button onClick={() => setAccordionOpen(!accordionOpen)} className={`
            ${accordionOpen ? 'flex justify-between items-center h-full w-full bg-white rounded-[9px] px-[15px]' : 'flex justify-between items-center h-full w-full bg-custom-grayFA rounded-[9px] px-[15px]'} `}>
                    <span className={` text-custom-solidgreen ${accordionOpen ? 'text-[20px] montserrat-semibold' : 'text-[18px] montserrat-regular'}`}>Price Versions</span>
                    <span className={`flex justify-center items-center h-[40px] w-[40px] rounded-full  transform transition-transform duration-300 ease-in-out ${accordionOpen ? 'rotate-180 bg-[#F3F7F2] text-custom-solidgreen' : 'rotate-0 gradient-btn2 text-white'}`}><IoIosArrowDown className=' text-[18px]' /></span>
                </button>
            </div>
            <div className={`mx-5 rounded-[10px] shadow-custom5 grid overflow-hidden transition-all duration-300 ease-in-out
            ${accordionOpen ? 'mt-2 mb-4 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}
            `}>
                <div className=' overflow-hidden'>
                <div className='w-full p-5 h-[370px]'>
                        <div className='flex justify-center w-full '>
                            <div className='w-[662px]'>
                                <table>
                                    <thead>
                                        <tr className='h-[83px] bg-custom-grayFA text-custom-grayA5 montserrat-semibold text-sm'>
                                            <th className='rounded-tl-[10px] pl-[10px] w-[150px] text-left'>Version</th>
                                            <th className='w-[150px] text-left pr-10 leading-[18px]'>Percent Increase</th>
                                            <th className='w-[150px] text-left pr-16 leading-[18px]'>No. of allowed buyers</th>
                                            <th className='w-[150px] text-left'>Expiry Date</th>
                                            <th className='rounded-tr-[10px] w-[62px]'></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className='h-[46px] bg-white'>
                                            <td className='px-[10px]'>
                                                <input type="text" className='w-[150px]' />
                                                </td>
                                            <td className='px-[10px]'>
                                                <input type="text" className='w-[100px]'/>
                                            </td>
                                            <td className='px-[10px]'>
                                                <input type="text" className='w-[100px]'/>
                                             </td>
                                            <td className='px-[10px]'>
                                                <input type="date" className='w-[100px]'/>
                                            </td>
                                            <td><FaRegTrashAlt className='size-5 text-custom-gray81 hover:text-red-500'/></td>
                                        </tr>
                                        <tr className='h-[46px] bg-custom-grayFA'>
                                            <td className='px-[10px]'>
                                                <input type="text" className='w-[150px]' />
                                                </td>
                                            <td className='px-[10px]'>
                                                <input type="text" className='w-[100px]'/>
                                            </td>
                                            <td className='px-[10px]'>
                                                <input type="text" className='w-[100px]'/>
                                             </td>
                                            <td className='px-[10px] text-sm'>
                                                <input type="date" className='w-[100px]'/>
                                            </td>
                                            <td><FaRegTrashAlt className='size-5 text-custom-gray81 hover:text-red-500'/></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                       
                    </div>
                </div>
            </div>
        </>

    )
}

export default PriceVersions
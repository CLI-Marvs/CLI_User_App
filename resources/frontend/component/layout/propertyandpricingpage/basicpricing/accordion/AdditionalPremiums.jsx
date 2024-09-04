import React, { useState, useRef } from 'react'
import { IoIosArrowDown } from "react-icons/io";
import { FaRegTrashAlt } from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";
import AdditionalPremiumAssignModal from '../modals/AdditionalPremiumAssignModal';


const AdditionalPremiums = () => {

    const [accordionOpen, setAccordionOpen] = useState(false);

    const modalRef = useRef(null);

    const handleOpenModal = () => {
        if (modalRef.current) {
            modalRef.current.showModal();
        }
    };
    return (
        <>
            <div className={` transition-all duration-2000 ease-in-out
      ${accordionOpen ? 'h-[74px] mx-5 bg-white shadow-custom5 rounded-[10px]' : 'h-[72px] gradient-btn3 rounded-[10px] p-[1px]'} `}>
                <button onClick={() => setAccordionOpen(!accordionOpen)} className={`
            ${accordionOpen ? 'flex justify-between items-center h-full w-full bg-white rounded-[9px] px-[15px]' : 'flex justify-between items-center h-full w-full bg-custom-grayFA rounded-[9px] px-[15px]'} `}>
                    <span className={` text-custom-solidgreen ${accordionOpen ? 'text-[20px] montserrat-semibold' : 'text-[18px] montserrat-regular'}`}>Additional Premiums</span>
                    <span className={`flex justify-center items-center h-[40px] w-[40px] rounded-full  transform transition-transform duration-300 ease-in-out ${accordionOpen ? 'rotate-180 bg-[#F3F7F2] text-custom-solidgreen' : 'rotate-0 gradient-btn2 text-white'}`}><IoIosArrowDown className=' text-[18px]' /></span>
                </button>
            </div>
            <div className={`mx-5 rounded-[10px] shadow-custom5 grid overflow-hidden transition-all duration-300 ease-in-out
            ${accordionOpen ? 'mt-2 mb-4 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}
            `}>
                <div className=' overflow-hidden'>
                <div className='w-full p-5'>
                        <div className='flex justify-center w-full h-[31px] gap-3 mb-4'>
                            <div className="flex items-center border border-custom-grayF1 rounded-[5px] overflow-hidden w-[375px] text-sm">
                                <span className="text-custom-gray81 bg-custom-grayFA flex items-center w-[100%] font-semibold -mr-3 pl-3 py-1">Additional Premium</span>
                                <div className="relative w-full">
                                    <select name="transferCharge" className="appearance-none w-full px-4 py-1 bg-white focus:outline-none border-0">
                                        <option value="others">Others</option>
                                    </select>
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 bg-custom-grayFA">
                                    <IoMdArrowDropdown className='text-custom-gray81' />
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center border border-custom-grayF1 rounded-[5px] overflow-hidden w-[204px] text-sm">
                                <span className="text-custom-gray81 bg-custom-grayFA font-semibold flex w-[250px] pl-3 py-1">Cost (Sq.m)</span>
                                <input name='basePrice' type="text" className="w-full px-4 focus:outline-none" placeholder="" />
                            </div>
                            <div>
                                <button className='w-[60px] h-[31px] rounded-[7px] gradient-btn2 p-[4px]  text-custom-solidgreen hover:shadow-custom4'>
                                    <div className='flex justify-center items-center  bg-white montserrat-bold h-full w-full rounded-[4px] p-[4px] text-sm'>
                                        ADD
                                    </div>
                                </button>
                            </div>
                        </div>
                        <div className='flex justify-center w-full mb-4'>
                            <div className='flex justify-center w-[662px]'>
                                <table>
                                    <thead>
                                        <tr className='h-[49px] bg-custom-grayFA text-custom-gray81 montserrat-semibold text-sm'>
                                            <th className='rounded-tl-[10px] pl-[10px] w-[300px] text-left'>Additional Premium</th>
                                            <th className='w-[150px] text-left'>Premium Cost</th>
                                            <th className='rounded-tr-[10px] w-[62px]'></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className='h-[46px] bg-white text-sm'>
                                            <td className='text-custom-gray81 pl-3'>Sea View</td>
                                            <td>
                                                <div className='bg-white h-[29px] w-[120px] border border-[#D9D9D9] rounded-[5px] px-2'>
                                                    <p>1,200.00</p>
                                                </div>
                                            </td>
                                            <td><FaRegTrashAlt className='size-5 text-custom-gray81 hover:text-red-500'/></td>
                                        </tr>
                                        <tr className='h-[46px] bg-custom-grayFA text-sm'>
                                            <td className='text-custom-gray81 pl-3'>Mountain View</td>
                                            <td>
                                                <div className='bg-white h-[29px] w-[120px] border border-[#D9D9D9] rounded-[5px] px-2'>
                                                    <p>1,000.00</p>
                                                </div>
                                            </td>
                                            <td><FaRegTrashAlt className='size-5 text-custom-gray81 hover:text-red-500'/></td>
                                        </tr>
                                        <tr className='h-[46px] bg-white text-sm'>
                                            <td className='text-custom-gray81 pl-3'>City View</td>
                                            <td>
                                                <div className='bg-white h-[29px] w-[120px] border border-[#D9D9D9] rounded-[5px] px-2'>
                                                    <p>900.00</p>
                                                </div>
                                            </td>
                                            <td><FaRegTrashAlt className='size-5 text-custom-gray81 hover:text-red-500'/></td>
                                        </tr>
                                        <tr className='h-[46px] bg-custom-grayFA text-sm'>
                                            <td className='text-custom-gray81 pl-3'>Animity View</td>
                                            <td>
                                                <div className='bg-white h-[29px] w-[120px] border border-[#D9D9D9] rounded-[5px] px-2'>
                                                    <p>800.00</p>
                                                </div>
                                            </td>
                                            <td><FaRegTrashAlt className='size-5 text-custom-gray81 hover:text-red-500'/></td>
                                        </tr>
                                        <tr className='h-[46px] bg-white text-sm'>
                                            <td className='text-custom-gray81 pl-3 pr-3'>
                                                <div className='h-[29px] w-[300px]'>
                                                    <input type="text" className='h-[29px] w-[282px] pl-2 pr-3 rounded-[5px] border border-[#D9D9D9]' />
                                                </div></td>
                                            <td>
                                                <div className='bg-white h-[29px] w-[120px] border border-[#D9D9D9] rounded-[5px] px-2'>
                                                    <p>700.00</p>
                                                </div>
                                            </td>
                                            <td><FaRegTrashAlt className='size-5 text-custom-gray81 hover:text-red-500'/></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className='flex justify-center'>
                                <button onClick={handleOpenModal} className='w-[137px] h-[37px] rounded-[7px] gradient-btn2 p-[4px]  text-custom-solidgreen hover:shadow-custom4 text-sm'>
                                    <div className='flex justify-center items-center  bg-white montserrat-semibold h-full w-full rounded-[4px] p-[4px] text-sm'>
                                       Assign to units
                                    </div>
                                </button>
                        </div>
                    </div>
                </div>
                <div>
                    <AdditionalPremiumAssignModal modalRef={modalRef} />
                </div>
            </div>
        </>

    )
}

export default AdditionalPremiums
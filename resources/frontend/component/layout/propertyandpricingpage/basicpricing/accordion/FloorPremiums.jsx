import React, { useState } from 'react'
import { IoIosArrowDown } from "react-icons/io";


const FloorPremiums = () => {

    const [accordionOpen, setAccordionOpen] = useState(false);

    return (
        <>
            <div className={`transition-all duration-2000 ease-in-out
      ${accordionOpen ? 'h-[74px] mx-5 bg-white shadow-custom5 rounded-[10px]' : 'h-[72px] gradient-btn3 rounded-[10px] p-[1px]'} `}>
                <button onClick={() => setAccordionOpen(!accordionOpen)} className={`
            ${accordionOpen ? 'flex justify-between items-center h-full w-full bg-white rounded-[9px] px-[15px]' : 'flex justify-between items-center h-full w-full bg-custom-grayFA rounded-[9px] px-[15px]'} `}>
                    <span className={` text-custom-solidgreen ${accordionOpen ? 'text-[20px] montserrat-semibold' : 'text-[18px] montserrat-regular'}`}>Floor Premiums</span>
                    <span className={`flex justify-center items-center h-[40px] w-[40px] rounded-full  transform transition-transform duration-300 ease-in-out ${accordionOpen ? 'rotate-180 bg-[#F3F7F2] text-custom-solidgreen' : 'rotate-0 gradient-btn2 text-white'}`}><IoIosArrowDown className=' text-[18px]' /></span>
                </button>
            </div>
            <div className={`mx-5 rounded-[10px] shadow-custom5 grid overflow-hidden transition-all duration-300 ease-in-out
            ${accordionOpen ? 'mt-2 mb-4 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}
            `}>
                <div className=' overflow-hidden'>
                    blank page
                </div>
            </div>
        </>

    )
}

export default FloorPremiums
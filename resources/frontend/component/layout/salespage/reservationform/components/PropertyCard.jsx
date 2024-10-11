import React from 'react'
import SamplePic from '../../../../../../../public/Images/PcBldg.jpeg'
const PropertyCard = () => {
    return (
        <div
            className="w-[234px] min-h-[332px] max-w-md bg-white border-[0.5px] border-[#33691E] rounded-[10px] overflow-hidden flex flex-col"
        >
            <img
                className="w-full h-[165px] object-cover object-center"
                src={SamplePic}
                alt="Card image"
            />
            <div className="flex flex-col justify-center items-center pt-[20px] pb-[13px] px-[13px] ">
                <div className='flex flex-col items-center w-[208px] gap-[6px]'>
                    <div className=" flex w-[175px] items-center text-sm text-custom-lightgreen">
                        &#8369;30,000,000 - 50,000,000
                    </div>
                    <div className="w-[175px] text-black montserrat-regular text-[13px] ">
                        38 Park Avenue
                    </div>
                    <div className="w-[175px] text-custom-gray81 text-xs ">
                        J.M. Del Mar St., Cebu I.T. Park, Apas, Cebu City
                    </div>
                </div>
            </div>
            <div className='flex-grow'></div>
            <div className="relative mb-[15px]">
                <hr className="border-t-[1px] mx-[13px]" />
                <div className="flex justify-center items-center mt-[13px] ">
                    <button className="w-[56px] h-[31px] bg-custom-solidgreen rounded-[4px] text-white hover:shadow-custom4">
                        View
                    </button>
                </div>
            </div>
        </div>
    )
}

export default PropertyCard
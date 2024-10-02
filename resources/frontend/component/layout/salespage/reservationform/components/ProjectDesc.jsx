import React, { useEffect } from 'react'
import PcBldg from '../../../../../../../public/Images/PcBldg.jpeg'
import Bed from '../../../../../../../public/Images/Bed.svg'
import Bath from '../../../../../../../public/Images/Bathtub.svg'
import Square from '../../../../../../../public/Images/Square.svg'
import Pool from '../../../../../../../public/Images/swimming.svg'
import Lounges from '../../../../../../../public/Images/lounge.svg'
import KidsRoom from '../../../../../../../public/Images/kidsroom.svg'
import Garden from '../../../../../../../public/Images/garden.svg'
import TownHall from '../../../../../../../public/Images/townhall.svg'
import Retail from '../../../../../../../public/Images/Retailspaces.svg'
import Sofa from '../../../../../../../public/Images/sofa.svg'


const ProjectDesc = () => {
  
  return (
    <div>
         <div className='flex px-12 py-2 max-w-full'>
                    <img className='h-[275px] w-[310px] rounded-[10px]' src={PcBldg} alt="pc building" />
                    <div className='flex flex-col w-full px-4'>
                        <div className='flex justify-between'>
                            <div className='w-[484px]'>
                                <p className='text-[36px] montserrat-bold text-custom-lightgreen'>Upper Penthouse 37B</p>
                                <p className='text-[26px] montserrat-semibold my-1'>&#8369;49,000,000.00</p>
                            </div>
                            <div>
                                <button className='gradient-btn2 w-[191px] h-[37px] rounded-[10px] text-sm text-white montserrat-medium hover:shadow-custom4'>
                                    Change Selections
                                </button>
                            </div>
                        </div>
                        <div className=" flex gap-[27px]">
                            <div className="flex jusitfy-center items-center gap-[7px]">
                                <img
                                    className="size-[14px]"
                                    src={Bed}
                                    alt="Bed Logo"
                                />
                                <p className="text-[12px] font-medium">3</p>
                            </div>
                            <div className="flex jusitfy-center items-center gap-[7px]">
                                <img
                                    className="h-[14px]"
                                    src={Bath}
                                    alt="Bath Logo"
                                />
                                <p className="text-[12px] font-medium">2</p>
                            </div>
                            <div className="flex jusitfy-center items-center gap-[7px]">
                                <img
                                    className="h-[14px]"
                                    src={Square}
                                    alt="Square Meter Logo"
                                />
                                <p className="text-[12px] font-medium">
                                    160.52 m<sup>2</sup>
                                </p>
                            </div>
                        </div>
                        <p className="flex items-center font-medium text-[12px] h-[37px]">
                            Amenities & Facilities
                        </p>
                        <div className="flex items-center gap-[20px]">
                            <div className="flex flex-col justify-center items-center w-[79px] h-[63px]">
                                <img
                                    className="size-[21px]"
                                    src={Pool}
                                    alt="Swimming Pool Logo"
                                />
                                <p className="flex flex-col justify-center items-center text-xs font-semibold w-full leading-none">
                                    <span>Swimming</span>
                                    <span>Pool</span>
                                </p>
                            </div>
                            <div className="flex flex-col justify-center items-center w-[81px] h-[52px]">
                                <img
                                    className="size-[21px]"
                                    src={Lounges}
                                    alt="lounges logo"
                                />
                                <p className="flex flex-col justify-center items-center text-xs font-semibold w-full leading-none">
                                    <span>Recreational</span>
                                    <span>Lounge</span>
                                </p>
                            </div>
                            <div className="flex flex-col justify-center items-center w-[38px] h-[63px]">
                                <img
                                    className="size-[21px] "
                                    src={KidsRoom}
                                    alt="kids Room"
                                />
                                <p className="flex flex-col justify-center items-center text-xs font-semibold w-full leading-none">
                                    <span>Kid's</span>
                                    <span>Zone</span>
                                </p>
                            </div>
                            <div className="flex flex-col justify-center items-center w-[57px] h-[63px]  ">
                                <img
                                    className="size-[21px]"
                                    src={Garden}
                                    alt="Garden"
                                />
                                <p className="flex flex-col justify-center items-center text-xs font-semibold w-full leading-none">
                                    <span>Garden</span>
                                    <span>Atrium</span>
                                </p>
                            </div>
                            <div className="flex flex-col justify-center items-center w-[79px] h-[63px]  ">
                                <img
                                    className="size-[21px] "
                                    src={TownHall}
                                    alt="Townhall"
                                />
                                <p className="flex flex-col justify-center items-center text-xs font-semibold w-full leading-none">
                                    <span>Functional</span>
                                    <span>Hall</span>
                                </p>
                            </div>
                            <div className="flex flex-col justify-center items-center w-[51px] h-[63px]">
                                <img
                                    className="size-[21px] "
                                    src={Retail}
                                    alt="Retail"
                                />
                                <p className="flex flex-col justify-center items-center text-xs font-semibold w-full leading-none">
                                    <span>Retail</span>
                                    <span>Spaces</span>
                                </p>
                            </div>
                            <div className="flex flex-col justify-center items-center w-[57px] h-[63px] ">
                                <img
                                    className="size-[21px] "
                                    src={Sofa}
                                    alt="Sofa"
                                />
                                <p className="flex flex-col justify-center items-center text-xs font-semibold w-full leading-none">
                                    <span>Lounge</span>
                                    <span>Areas</span>
                                </p>
                            </div>
                        </div>
                        <div className='flex items-center my-1 gap-3'>
                            <p className='text-sm2 text-gray-600 w-48 poppins-medium'>J.M. Del Mar St., Cebu I.T. Park, Apas, Cebu City</p>
                        </div>
                    </div>
                    <div>

                    </div>
               </div>
    </div>
  )
}

export default ProjectDesc
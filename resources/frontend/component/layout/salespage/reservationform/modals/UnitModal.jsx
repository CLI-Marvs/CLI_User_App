import React, {useRef} from 'react'
import PcBldg from "../../../../../../../public/Images/PcBldg.jpeg";
import Bed from "../../../../../../../public/Images/Bed.svg";
import Bath from "../../../../../../../public/Images/Bathtub.svg";
import Square from "../../../../../../../public/Images/Square.svg";
import Pool from "../../../../../../../public/Images/swimming.svg";
import Lounges from "../../../../../../../public/Images/lounge.svg";
import KidsRoom from "../../../../../../../public/Images/kidsroom.svg";
import Garden from "../../../../../../../public/Images/garden.svg";
import TownHall from "../../../../../../../public/Images/townhall.svg";
import Retail from "../../../../../../../public/Images/Retailspaces.svg";
import Sofa from "../../../../../../../public/Images/sofa.svg";
import FloorPlan from "../../../../../../../public/Images/floor-plan.png";
import ParkingUnitModal from './ParkingUnitModal';

const UnitModal = ({ modalRef }) => {

    const modalRef2 = useRef(null);

  const handleOpenModal2 = () => {
    console.log(modalRef2.current)
      if (modalRef2.current) {
          modalRef2.current.showModal();
      }
  };
    return (
        <dialog className="modal custom-modal bg-[#FFFDF1] backdrop:bg-black/50" ref={modalRef}>
            <div className="w-[1400px] bg-[#FFFDF1] ">
                <div className="mt-[49px] flex items-center border-t border-b border-custom-solidgreen h-[89px] justify-between bg-white ">
                    <div className="flex items-center h-10 px-24">
                        <p className="font-semibold text-[21px]">
                            You are now viewing a unit of
                        </p>
                        <p>&nbsp;&nbsp;</p>
                        <p className="montserrat-light text-[31px]">
                            38 Park Avenue
                        </p>
                    </div>
                    <div className="flex gap-[22px] mr-[168px]">
                        <button
                            /* onClick={handleReserveClick} */
                            className="flex justify-center items-center text-white bg-custom-solidgreen text-[22px] font-bold h-[51px] w-[156px]  rounded-[10px] hover:shadow-custom4"
                        >
                            Select
                        </button>
                        <form method="dialog">
                            
                            <button className="flex justify-center items-center text-[22px] font-semibold text-custom-solidgreen border border-custom-solidgreen h-[51px] w-[156px] hover:shadow-custom4 rounded-[10px]">
                                Close
                            </button>
                        </form>
                    </div>
                </div>
                <div className="divider divider-primary m-0"></div>
                <div className="flex px-28 py-10 max-w-full">
                    <img
                        className="h-[408px] w-[461px] rounded-[15px]"
                        src={PcBldg}
                        alt="pc building"
                    />
                    <div className="flex flex-col w-full px-4">
                        <p className="text-[55px] montserrat-bold text-custom-lightgreen">
                            Upper Penthouse 37B
                        </p>
                        <p className="text-[41px] montserrat-semibold my-2">
                            &#8369;49,000,000.00
                        </p>
                        <div className=" flex gap-[40px]">
                            <div className="flex jusitfy-center items-center gap-[10px]">
                                <img
                                    className="size-[20px]"
                                    src={Bed}
                                    alt="Bed Logo"
                                />
                                <p className="text-[18px] font-medium">3</p>
                            </div>
                            <div className="flex jusitfy-center items-center gap-[10px]">
                                <img
                                    className="h-[20px]"
                                    src={Bath}
                                    alt="Bath Logo"
                                />
                                <p className="text-[18px] font-medium">2</p>
                            </div>
                            <div className="flex jusitfy-center items-center gap-[10px]">
                                <img
                                    className="h-[20px]"
                                    src={Square}
                                    alt="Square Meter Logo"
                                />
                                <p className="text[18px] font-medium">
                                    160.52 m<sup>2</sup>
                                </p>
                            </div>
                        </div>
                        <p className="flex items-center font-medium text-[18px] h-[55px]">
                            Amenities & Facilities
                        </p>
                        <div className="flex items-center px-3 gap-[30px]">
                            <div className="w-[79px] h-[63px]  gap-2">
                                <img
                                    className="h-[32px] w-full"
                                    src={Pool}
                                    alt="Swimming Pool Logo"
                                />
                                <p className="flex flex-col justify-center items-center text-xs font-semibold w-full leading-none">
                                    <span>Swimming</span>
                                    <span>Pool</span>
                                </p>
                            </div>
                            <div className="w-[89px] h-[63px]  gap-2">
                                <img
                                    className="h-[32px] w-full"
                                    src={Lounges}
                                    alt="lounges logo"
                                />
                                <p className="flex flex-col justify-center items-center text-xs font-semibold w-full leading-none">
                                    <span>Recreational</span>
                                    <span>Lounge</span>
                                </p>
                            </div>
                            <div className="w-[43px] h-[63px]  gap-2">
                                <img
                                    className="h-[32px] w-full"
                                    src={KidsRoom}
                                    alt="kids Room"
                                />
                                <p className="flex flex-col justify-center items-center text-xs font-semibold w-full leading-none">
                                    <span>Kid's</span>
                                    <span>Zone</span>
                                </p>
                            </div>
                            <div className="w-[57px] h-[63px]  gap-2">
                                <img
                                    className="h-[32px] w-full"
                                    src={Garden}
                                    alt="Garden"
                                />
                                <p className="flex flex-col justify-center items-center text-xs font-semibold w-full leading-none">
                                    <span>Garden</span>
                                    <span>Atrium</span>
                                </p>
                            </div>
                            <div className="w-[79px] h-[63px]  gap-2">
                                <img
                                    className="h-[32px] w-full"
                                    src={TownHall}
                                    alt="Townhall"
                                />
                                <p className="flex flex-col justify-center items-center text-xs font-semibold w-full leading-none">
                                    <span>Functional</span>
                                    <span>Hall</span>
                                </p>
                            </div>
                            <div className="w-[51px] h-[63px]  gap-2">
                                <img
                                    className="h-[32px] w-full"
                                    src={Retail}
                                    alt="Retail"
                                />
                                <p className="flex flex-col justify-center items-center text-xs font-semibold w-full leading-none">
                                    <span>Retail</span>
                                    <span>Spaces</span>
                                </p>
                            </div>
                            <div className="w-[57px] h-[63px]  gap-2">
                                <img
                                    className="h-[32px] w-full"
                                    src={Sofa}
                                    alt="Sofa"
                                />
                                <p className="flex flex-col justify-center items-center text-xs font-semibold w-full leading-none">
                                    <span>Lounge</span>
                                    <span>Areas</span>
                                </p>
                            </div>
                        </div>
                        <div className="flex mt-[16px]">
                            <div className='flex justify-center items-center gap-[6px] w-[179px] h-[48px]'>
                                <input type="radio" className='size-[19px]'/> 
                                <p className='text-[#1A73E8] font-semibold'>Include Parking?</p>
                            </div>
                            <button onClick={handleOpenModal2} className='underline w-[191px] h-[43px] montserrat-medium text-white text-sm rounded-[13px] hover:shadow-custom4 bg-custom-lightgreen'>
                                Available Parking Units
                            </button>
                           
                        </div>
                    </div>
                </div>
                <div className="flex justify-center items-center bg-white">
                    <img
                        className=" rounded-xl"
                        src={FloorPlan}
                        alt="pc building"
                    />
                </div>
                <div>
                    <ParkingUnitModal modalRef={modalRef2} />
                </div>
            </div>


        </dialog>
    )
}

export default UnitModal
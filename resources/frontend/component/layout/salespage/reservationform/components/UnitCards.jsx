import React, {useRef} from 'react'
import SamplePic from '../../../../../../../public/Images/PcBldg.jpeg'
import Bed from '../../../../../../../public/Images/Bed.svg'
import Bathtub from '../../../../../../../public/Images/Bathtub.svg'
import Square from '../../../../../../../public/Images/Square.svg'
import UnitModal from '../modals/UnitModal'

const UnitCards = () => {

    const modalRef = useRef(null);

    const handleOpenModal = () => {
        if (modalRef.current) {
            modalRef.current.showModal();
        }
    };


  return (
    <>
        <div
            className="w-[228px] min-h-[332px] max-w-md bg-white border-[0.5px] border-[#33691E] rounded-[10px] overflow-hidden flex flex-col"
        >
            <img
                className="w-full h-[165px] object-cover object-center"
                src={SamplePic}
                alt="Card image"
            />
            <div className="flex flex-col justify-center items-center pt-[20px] pb-[13px] px-[28px] ">
                <div className='flex flex-col items-center w-[208px] gap-[6px]'>
                    <div className=" flex w-[175px] items-center text-sm text-custom-lightgreen font-semibold">
                        &#8369;132,500
                    </div>
                    <div className="w-[175px] text-black montserrat-regular text-[13px] ">
                        38 Park Suite deluxe
                    </div>
                    <div className="w-[175px] text-custom-gray81 text-xs ">
                        with complimentary beverages and own safe for valuables
                    </div>
                </div>
            </div>
            <div className='flex-grow'></div>
            <div className='flex justify-center'>
                <div className='flex justify-between items-center w-[162px] h-[29px] border-t-1 border-b-1 border-black text-xs'>
                    <div className='flex gap-[9px]'>
                        <img src={Bed} alt="bed" />3
                    </div>
                    <div className='flex gap-[9px]'>
                        <img src={Bathtub} alt="bathtub" />2
                    </div>
                    <div className='flex gap-[9px]'>
                        <img src={Square} alt="square meter" /> <span>43 m<sup className="text-[inherit] align-super">2</sup></span>
                    </div>
                </div>
            </div>
            <div className="relative flex justify-center mb-[15px]">
                <div className="flex justify-between items-center mt-[10px] w-[150px] h-[30px] text-xs">
                    <button onClick={handleOpenModal} className="w-[74px] h-[30px] border border-custom-solidgreen rounded-[4px] text-custom-solidgreen hover:shadow-custom4">
                        View
                    </button>
                    <button className="w-[62px] h-[30px] bg-custom-solidgreen rounded-[4px] text-white te hover:shadow-custom4">
                        Select
                    </button>
                </div>
            </div>
            <div>
                <UnitModal modalRef={modalRef}/>
            </div>
        </div>
       
    </>
   
  )
}

export default UnitCards
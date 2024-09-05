import React from 'react'

const FloorPremiumAddUnitModal = ({modalRef}) => {
  return (
    <dialog className="modal w-[474px] rounded-lg" ref={modalRef}>
    <div className=' px-14 mb-5 rounded-[10px]'>
        <div className=''>
            <form method="dialog" className="pt-3 flex justify-end -mr-[50px]">
                <button className="flex justify-center w-10 h-10 items-center rounded-full bg-custombg3 text-custom-bluegreen hover:bg-custombg">
                    ✕
                </button>
            </form>
        </div>
        <div className='flex justify-start items-center h-40px my-6'>
            <p className='montserrat-bold'>Add Unit</p>
        </div>
        <div className="flex flex-col gap-2">
            <div className="flex items-center border rounded-md overflow-hidden h-[31px]">
                <span className="text-custom-gray81 bg-custom-grayFA flex w-[180%] pl-3 py-1 border border-custom-grayF1 font-semibold">Floor</span>
                <input name='floor' type="text" className="w-full px-4 focus:outline-none" placeholder="" />
            </div>
            <div className="flex items-center border rounded-md overflow-hidden h-[31px]">
                <span className="text-custom-gray81 bg-custom-grayFA flex w-[180%] pl-3 py-1 border border-custom-grayF1 font-semibold">Room Number</span>
                <input name='roomNumber' type="text" className="w-full px-4 focus:outline-none" placeholder="" />
            </div>
            <div className="flex items-center border rounded-md overflow-hidden h-[31px]">
                <span className="text-custom-gray81 bg-custom-grayFA flex w-[180%] pl-3 py-1 border border-custom-grayF1 font-semibold">Unit</span>
                <input name='unit' type="text" className="w-full px-4 focus:outline-none" placeholder="" />
            </div>
            <div className="flex items-center border rounded-md overflow-hidden h-[31px]">
                <span className="text-custom-gray81 bg-custom-grayFA flex w-[180%] pl-3 py-1 border border-custom-grayF1 font-semibold">Type</span>
                <input name='type' type="text" className="w-full px-4 focus:outline-none" placeholder="" />
            </div>
            <div className="flex items-center border rounded-md overflow-hidden h-[31px]">
                <span className="text-custom-gray81 bg-custom-grayFA flex w-[180%] pl-3 py-1 border border-custom-grayF1 font-semibold">Floor Area</span>
                <input name='floorArea' type="text" className="w-full px-4 focus:outline-none" placeholder="" />
            </div>
            <div className="flex items-center border rounded-md overflow-hidden h-[31px]">
                <span className="text-custom-gray81 bg-custom-grayFA flex w-[180%] pl-3 py-1 border border-custom-grayF1 font-semibold">Balcony Area</span>
                <input name='balconyArea' type="text" className="w-full px-4 focus:outline-none" placeholder="" />
            </div>
            <div className="flex items-center border rounded-md overflow-hidden h-[31px]">
                <span className="text-custom-gray81 bg-custom-grayFA flex w-[180%] pl-3 py-1 border border-custom-grayF1 font-semibold">Garden Area</span>
                <input name='gardenArea' type="text" className="w-full px-4 focus:outline-none" placeholder="" />
            </div>
            <div className="flex items-center border rounded-md overflow-hidden h-[31px]">
                <span className="text-custom-gray81 bg-custom-grayFA flex w-[180%] pl-3 py-1 border border-custom-grayF1 font-semibold">Total Area</span>
                <input name='totalArea' type="text" className="w-full px-4 focus:outline-none" placeholder="" />
            </div>
        </div>
        <div className='flex justify-center mt-4 mb-8'>
            <button className='w-[95px] h-[37px] text-white montserrat-semibold text-sm gradient-btn2 rounded-[10px]'>Add Unit</button>
        </div>
    </div>
</dialog>
)
}

export default FloorPremiumAddUnitModal
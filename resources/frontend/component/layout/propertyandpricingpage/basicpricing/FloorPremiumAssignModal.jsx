import React from 'react'

const FloorPremiumAssignModal = (modalRef) => {
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
        
        <div className='flex justify-center mt-4 mb-8'>
            <button className='w-[95px] h-[37px] text-white montserrat-semibold text-sm gradient-btn2 rounded-[10px]'>Add Unit</button>
        </div>
    </div>
</dialog>
  )
}

export default FloorPremiumAssignModal
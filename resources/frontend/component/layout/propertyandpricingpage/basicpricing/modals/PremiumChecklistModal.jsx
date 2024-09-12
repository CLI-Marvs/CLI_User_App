import React from 'react'

const PremiumChecklistModal = ({modalRef2}) => {
  return (
    <dialog className="modal w-[385px] rounded-lg bg-white backdrop:bg-black/50" ref={modalRef2}>
    <div className=' px-[50px] mb-5 rounded-[10px]'>
        <div className=''>
            <form method="dialog" className="pt-2 flex justify-end -mr-[45px]">
                <button className="flex justify-center w-10 h-10 items-center rounded-full  text-custom-bluegreen hover:bg-custombg">
                    ✕
                </button>
            </form>
        </div>
        <div className='flex justify-start gap-[10px] mb-[10px]'>
            <p className='font-semibold text-sm text-custom-gray81'>Add premum to unit</p>
            <p className='font-semibold'>38P109</p>
        </div>
        <div className='flex flex-col gap-[10px]'>
            <div className='h-[56px] w-full bg-custom-grayFA rounded-[10px] p-[10px] flex items-center gap-[15px]'>
                <input type="checkbox" className="h-[16px] w-[16px] ml-[16px] rounded-[2px] appearance-none border border-gray-400 checked:bg-transparent flex items-center justify-center checked:before:bg-black checked:before:w-[12px] checked:before:h-[12px] checked:before:block checked:before:content-['']" />
                <p>Sea View</p>
            </div>
            <div className='h-[56px] w-full bg-custom-grayFA rounded-[10px] p-[10px] flex items-center gap-[15px]'>
                <input type="checkbox" className="h-[16px] w-[16px] ml-[16px] rounded-[2px] appearance-none border border-gray-400 checked:bg-transparent flex items-center justify-center checked:before:bg-black checked:before:w-[12px] checked:before:h-[12px] checked:before:block checked:before:content-['']" />
                <p>Mountain View</p>
            </div>
            <div className='h-[56px] w-full bg-custom-grayFA rounded-[10px] p-[10px] flex items-center gap-[15px]'>
                <input type="checkbox" className="h-[16px] w-[16px] ml-[16px] rounded-[2px] appearance-none border border-gray-400 checked:bg-transparent flex items-center justify-center checked:before:bg-black checked:before:w-[12px] checked:before:h-[12px] checked:before:block checked:before:content-['']" />
                <p>City View</p>
            </div>
            <div className='h-[56px] w-full bg-custom-grayFA rounded-[10px] p-[10px] flex items-center gap-[15px]'>
                <input type="checkbox" className="h-[16px] w-[16px] ml-[16px] rounded-[2px] appearance-none border border-gray-400 checked:bg-transparent flex items-center justify-center checked:before:bg-black checked:before:w-[12px] checked:before:h-[12px] checked:before:block checked:before:content-['']" />
                <p>Lucky Unit Number</p>
            </div>
            <div className='h-[56px] w-full bg-custom-grayFA rounded-[10px] p-[10px] flex items-center gap-[15px]'>
                <input type="checkbox" className="h-[16px] w-[16px] ml-[16px] rounded-[2px] appearance-none border border-gray-400 checked:bg-transparent flex items-center justify-center checked:before:bg-black checked:before:w-[12px] checked:before:h-[12px] checked:before:block checked:before:content-['']" />
                <p>Corner unit with extra window</p>
            </div>
            
        </div>
        <div className='flex justify-start mt-4 mb-8'>
            <button className='w-[151px] h-[37px] text-white montserrat-semibold text-sm gradient-btn5 rounded-[10px] hover:shadow-custom4'>Apply Premiums</button>
        </div>
    </div>
</dialog>
  )
}

export default PremiumChecklistModal
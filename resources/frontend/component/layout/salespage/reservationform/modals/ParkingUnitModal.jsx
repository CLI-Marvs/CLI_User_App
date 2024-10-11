import React from 'react'

const ParkingUnitModal = ({ modalRef }) => {
  return (
    <dialog className="modal rounded-[20px] backdrop:bg-black/50" ref={modalRef}>
      <div className=' w-[1117px] p-[60px] bg-white relative'>
        <div className='flex flex-col '>
          <form method="dialog" className='absolute top-2 right-3'>
            <button className=" flex justify-center w-10 h-10 items-center rounded-full  text-custom-bluegreen hover:bg-custombg">✕</button>
          </form>
        </div>
        <div>
          <div className='flex flex-col gap-[10px] w-full h-[100px]  justify-center'>
            <p className='montserrat-regular text-[32px] text-custom-lightgreen'>Available Parking Units</p>
            <p className='montserrat-regular text-sm text-custom-bluegreen'>legend</p>
          </div>
          <div className='flex h-[60px] w-full justify-center'>
            <div className='flex w-[256px] h-[40px] px-[15px] py-[13px] bg-[#509ED1] rounded-l-[10px]'>
              <input type="checkbox" />
              <p className='w-full flex justify-center text-white text-[10px]'>93 - SOLD</p>
            </div>
            <div className='flex w-[256px] h-[40px] px-[15px] py-[13px] bg-[#1A73EB]'>
              <input type="checkbox" />
              <p className='w-full flex justify-center text-white text-[10px]'>20 - AVAILABLE</p>
            </div>
            <div className='flex w-[256px] h-[40px] px-[15px] py-[13px] bg-[#4ACA4F]'>
              <input type="checkbox" />
              <p className='w-full flex justify-center text-white text-[10px]'>12 - RESERVED</p>
            </div>
            <div className='flex w-[256px] h-[40px] px-[15px] py-[13px] bg-[#FF3B30] rounded-r-[10px]'>
              <input type="checkbox" />
              <p className='w-full flex justify-center text-white text-[10px]'>0 - BLOCKED</p>
            </div>
          </div>
          <div className='flex justify-center'>
            <div className='flex flex-col '>
              <div className='flex'>
                <div className='flex justify-center items-center font-bold text-white text-[10px] w-[102px] h-[48px] bg-[#404B52] rounded-tl-[10px] border border-[#B9B9B9]'>
                  FLOOR
                </div>
                <div className='flex justify-center items-center font-bold text-white text-[10px] w-[102px] h-[48px] bg-[#404B52] border border-[#B9B9B9]'>
                  1
                </div>
                <div className='flex justify-center items-center font-bold text-white text-[10px] w-[102px] h-[48px] bg-[#404B52] border border-[#B9B9B9]'>
                  2
                </div>
                <div className='flex justify-center items-center font-bold text-white text-[10px] w-[102px] h-[48px] bg-[#404B52] border border-[#B9B9B9]'>
                  3
                </div>
                <div className='flex justify-center items-center font-bold text-white text-[10px] w-[102px] h-[48px] bg-[#404B52] border border-[#B9B9B9]'>
                  4
                </div>
                <div className='flex justify-center items-center font-bold text-white text-[10px] w-[102px] h-[48px] bg-[#404B52] border border-[#B9B9B9]'>
                  5
                </div>
                <div className='flex justify-center items-center font-bold text-white text-[10px] w-[102px] h-[48px] bg-[#404B52] border border-[#B9B9B9]'>
                  6
                </div>
                <div className='flex justify-center items-center font-bold text-white text-[10px] w-[102px] h-[48px] bg-[#404B52] border border-[#B9B9B9]'>
                  7
                </div>
                <div className='flex justify-center items-center font-bold text-white text-[10px] w-[102px] h-[48px] bg-[#404B52] border border-[#B9B9B9]'>
                  8
                </div>
                <div className='flex justify-center items-center font-bold text-white text-[10px] w-[102px] h-[48px] bg-[#404B52] border border-[#B9B9B9] rounded-tr-[10px]'>
                  9
                </div>
              </div>
              <div className='flex '>
                <div className='flex justify-center items-center font-bold text-white text-[10px] w-[102px] h-[48px] bg-[#404B52] border border-[#B9B9B9]'>
                  1st
                </div>
                <div className='flex justify-center items-center font-bold text-white text-[11px] w-[102px] h-[48px] bg-[#509ED1] border border-[#B9B9B9]'>
                  T101.001
                </div>
                <div className='flex justify-center items-center font-bold text-white text-[11px] w-[102px] h-[48px] bg-[#1A73E8] border border-[#B9B9B9]'>
                  T102.001
                </div>
                <div className='flex justify-center items-center font-bold text-white text-[11px] w-[102px] h-[48px] bg-[#4ACA4F] border border-[#B9B9B9]'>
                  T103.001
                </div>
                <div className='flex justify-center items-center font-bold text-white text-[11px] w-[102px] h-[48px] bg-[#FF3B30] border border-[#B9B9B9]'>
                  T104.001
                </div>
              </div>
            </div>
          </div>
          <div className='flex w-full justify-end'>
            <button className='w-[191px] h-[37px] flex justify-center items-center gradient-btn2 text-sm text-white montserrat-medium rounded-[10px]'>
              Confirm
            </button>
          </div>
        </div>
      </div>
    </dialog>
  )
}

export default ParkingUnitModal
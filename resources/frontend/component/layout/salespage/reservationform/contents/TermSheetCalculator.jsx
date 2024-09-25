import React from 'react'

const TermSheetCalculator = () => {
  return (
    <div className=" max-w-screen-xl h-full px-[45px]">
      <div className="flex flex-col mt-[40px] w-[1000px]">
        <div className="flex  justify-center items-center w-full h-[55px] text-[20px] bg-custom-grayFA text-custom-bluegreen font-semibold rounded-[10px]">
          Bank Loan Calculator
        </div>
        <div className="flex flex-col w-full bg-custom-grayFA rounded-[10px] gap-[15px] mt-[15px] p-[30px] montserrat-medium">
          <div className='flex h-[34px] items-center'>
            <div className='w-[451px]'>
              <p className='montserrat-medium'>Select your payment scheme</p>
            </div>
            <div className='w-[474px]'>
              <p className='montserrat-medium'>REVIEW</p>
            </div>
          </div>
          <div className='flex '>
            <div className='flex flex-col gap-[15px] w-[451px]'>
              <div>
                <button className='w-[367px] p-[10px] flex items-center gap-[6px] bg-custom-lightestgreen rounded-[10px] hover:shadow-custom4'>
                  <p className='w-[112px] flex justify-center font-semibold text-sm'>OPTION 1:</p>
                  <p className='w-[229px] flex justify-center text-xs'>SPOT CASH W/ 10% DISCOUNT; TRANSFER CHARGES DUE ON TURN OVER OF UNIT</p>
                </button>
              </div>
              <div>
                <button className='w-[367px] p-[10px] flex items-center gap-[6px]  rounded-[10px] shadow-custom4'>
                  <p className='w-[112px] flex justify-center font-semibold text-sm'>OPTION 2:</p>
                  <p className='w-[229px] flex justify-center text-xs'>SPOT 10% DOWN PAYMENT WITH 10% DISCOUNT FROM DP; 90% BALANCE THRU BANCK FINANCING; TRANSFER CHARGES DUE ON TURN OVER OF UNIT</p>
                </button>
              </div>
              <div>
                <button className='w-[367px] p-[10px] flex items-center gap-[6px]  rounded-[10px] shadow-custom4'>
                  <p className='w-[112px] flex justify-center font-semibold text-sm'>OPTION 3:</p>
                  <p className='w-[229px] flex justify-center text-xs'>10% DOWN PAYMENT SPREAD TO 48 MONTHS; 90% BALANCE THRU BANK FINANCING; TRANSFER CHARGES DUE ON TURN OVER OF UNIT</p>
                </button>
              </div>
            </div>
            <div className='w-[474px]'>
              <div className='w-[422px] bg-custom-lightestgreen h-auto p-[10px] rounded-[10px]'>
                <iframe src="" frameborder="0" className='w-full h-auto bg-white'></iframe> {/*bg-white sample as image */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TermSheetCalculator
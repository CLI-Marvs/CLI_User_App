import React from 'react'
import { FaCircleCheck } from "react-icons/fa6";
const AlertMessage = () => {
    return (
        <div className="fixed inset-0 w flex justify-center items-center">
          <div className="flex flex-col gap-[26px] justify-center items-center bg-white py-[50px] px-[39px] rounded-[10px] shadow-custom5 w-[1031px] ">
            <h2 className=" font-semibold mb-2"><FaCircleCheck className='size-[37px] text-custom-solidgreen' /></h2>
            <p className="montserrat-medium text-[32px]">Your documents are submitted for verification</p>
            <div className="h-[55px]">
              <button
                className="w-[104px] h-[39px] rounded-[10px] gradient-btn2  p-[1px]"
              >
                <p className='h-full w-full bg-white rounded-[9px] flex justify-center items-center text-sm montserrat-semibold text-custom-solidgreen hover:shadow-custom4'>
                    Close
                </p>
               
              </button>
            </div>
          </div>
        </div>
      );
}

export default AlertMessage
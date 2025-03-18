import React from 'react'
import { IoCaretBackOutline } from "react-icons/io5";
import AskCli from '../../../../../public/Images/AskCLI_BGFAQs.webp'
import AskCliLogo from '../../../../../public/Images/AskCli_Logo3.png'
const SurveyReview = ({ modalRef, handleCloseModal }) => {
    return (
        <dialog
            id="Assign"
            className="modal fixed inset-0 w-screen h-screen rounded-none backdrop:bg-[#E0FFE6]"
            ref={modalRef}
        >
            <div
                className="absolute left-[47px] top-[42px] "
            >
                <button
                    className="flex justify-center items-center border-[0.5px] border-[#A5A5A5] w-[75px] h-[42px] rounded-[10px] bg-white text-sm text-[#696969] shadow-custom4 hover:shadow-custom5 gap-[7px]"
                    onClick={handleCloseModal}
                >
                    <IoCaretBackOutline /> Back
                </button>
            </div>
            <div className="flex w-full h-full justify-center px-[150px] bg-[#E0FFE6]">
                <div className="flex w-full max-w-[1165px]  justify-center">
                    <div className="flex flex-col w-full">
                        <p className="mb-[31px] font-bold text-[36px]">Preview</p>
                        <div className="flex flex-col gap-[40px] w-full max-w-[1165px] min-h-[300px] bg-white rounded-[10px] overflow-hidden">
                            <div className='relative'>
                                <img src={AskCli} alt="AskCLI" className="w-full h-[259px] object-cover object-top" />
                                <img src={AskCliLogo} alt="AskCLI Logo"
                                    className="absolute w-[300px] h-[140px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            </div>
                            <div className='w-full h-auto '>
                                <div className='max-w-[740px] min-h-[300px] bg-white rounded-[10px] overflow-hidden'>
                                    <div>
                                        
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </dialog>
    )
}

export default SurveyReview
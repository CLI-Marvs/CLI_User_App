import React, { useRef, useEffect } from 'react'
import { IoCaretBackOutline } from "react-icons/io5";
import AskCli from '../../../../../public/Images/AskCLI_BGFAQs.webp'
import AskCliLogo from '../../../../../public/Images/AskCli_Logo3.png'
import SurveyBg from '../../../../../public/Images/surveyBg.jpg'
import { use } from 'react';
const SurveyReview = ({ modalRef, handleCloseModal, surveyData }) => {


    const handleInput = (e) => {
        e.target.style.height = "auto";
        e.target.style.height = e.target.scrollHeight + "px";
    };


    return (
        <dialog
            id="Assign"
            className="modal fixed inset-0 w-screen min-h-screen h-auto rounded-none backdrop:bg-[#E0FFE6] overflow-auto"
            ref={modalRef}
        >
            <div
                className="absolute left-[47px] top-[32px] "
            >
                <button
                    className="flex justify-center items-center border-[0.5px] border-[#A5A5A5] w-[75px] h-[42px] rounded-[10px] bg-white text-sm text-[#696969] shadow-custom4 hover:shadow-custom5 gap-[7px]"
                    onClick={handleCloseModal}
                >
                    <IoCaretBackOutline /> Back
                </button>
            </div>
            <div className="flex w-full h-auto  justify-center px-[150px] bg-[#E0FFE6]">
                <div className="flex w-full max-w-[1165px] justify-center mt-[20px]">
                    <div className="flex flex-col w-full">
                        <p className="mb-[31px] font-bold text-[36px]">Preview</p>
                        <div className="flex flex-col  w-full max-w-[1165px] overflow-hidden bg-white rounded-[10px]">
                            <div className='relative'>
                                <img src={AskCli} alt="AskCLI" className="w-full h-[259px] object-cover object-top" />
                                <img src={AskCliLogo} alt="AskCLI Logo"
                                    className="absolute w-[300px] h-[140px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            </div>
                            <div className="w-full h-auto  relative">
                                <div className="flex flex-col items-center"
                                    style={{
                                        backgroundImage: `url(${SurveyBg})`,
                                        backgroundColor: 'rgba(255, 255, 255, .89)', // white with 60% opacity
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'bottom',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundBlendMode: 'overlay' // or 'lighten', 'screen', 'multiply'
                                    }}
                                >
                                    <div className='mt-[40px]'></div>
                                    <div className='w-[740px] mb-[21.8px]'>
                                        <p className='text-[36px] montserrat-semibold'>{surveyData?.title}</p>
                                        <div className='text-[18px]'>
                                            {surveyData?.description?.split("\n").map((line, index) => (
                                                <p key={index}>{line}</p>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="w-[740px] bg-[#EAF6E6] p-[10px] rounded-[10px] overflow-hidden flex flex-col gap-[10px]">

                                        {surveyData.dataQASet.map((item, index) => (
                                            <div key={item.id} className="flex flex-col gap-[16px] bg-white w-[718px] rounded-[10px] pt-[18px] pb-[22px] px-[16px]">
                                                <div>
                                                    {/* Question Section */}
                                                    <div className="w-full p-[10.9px] border-b-[0.5px] border-[#3A3A3A]">
                                                        <p className="montserrat-medium text-[18px]">
                                                            {item.question || "Untitled Question"}
                                                        </p>
                                                    </div>

                                                    {/* Options Section (for multiple choice) */}
                                                    {item.inputType === "multiple-choice" && (
                                                        <div className="flex flex-col gap-[10.9px] mt-[10px]">
                                                            {item.option.map((opt) => (
                                                                <label key={opt.id} className="flex items-center px-[10.9px] gap-[10.9px]">
                                                                    <input
                                                                        type="radio"
                                                                        name={`question-${item.id}`}
                                                                        value={opt.text}
                                                                        className="w-[16px] h-[16px] appearance-none border-[9px] border-custom-solidgreen bg-white rounded-full flex items-center justify-center relative
                                                                                    before:content-[''] before:w-[14px] before:h-[14px] before:bg-white before:rounded-full before:absolute
                                                                                    after:content-[''] after:w-[10px] after:h-[10px] after:bg-custom-solidgreen after:rounded-full after:absolute after:scale-0 checked:after:scale-100 transition-all"
                                                                    />
                                                                    <p className="montserrat-light">{opt.text || "Option"}</p>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {item.inputType === "checkboxes" && (
                                                        <div className="flex flex-col gap-[10.9px] mt-[10px]">
                                                            {item.option.map((opt) => (
                                                                <label key={opt.id} className="flex items-center px-[10.9px] gap-[10.9px]">
                                                                    <input
                                                                        type="checkbox"
                                                                        name={`question-${item.id}-${opt.id}`}
                                                                        value={opt.text}
                                                                        className="h-[17px] w-[18px] rounded-[2px] border border-gray-400 accent-custom-lightgreen"
                                                                    />

                                                                    <p className="montserrat-light">{opt.text || "Option"}</p>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {item.inputType === "textbox" && (
                                                        <div className="flex flex-col gap-[10.9px] mt-[20px]">
                                                            <textarea
                                                                className="w-full border-b-2 min-h-[12px] resize-none overflow-hidden leading-tight text-[16px] montserrat-medium p-[8px]"
                                                                rows="1"
                                                                placeholder="Your answer"
                                                                value={item.option[0]?.text}
                                                                onInput={(e) => {
                                                                    e.target.style.height = "auto";
                                                                    e.target.style.height = e.target.scrollHeight + "px";
                                                                }}
                                                            />
                                                        </div>
                                                    )}


                                                    {/* Required Message */}
                                                    {item.required && (
                                                        <div className="w-full flex justify-end mt-[8px]">
                                                            <p className="text-[#EB4444] montserrat-light text-xs">Required</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {/* Declaration and Concent */}

                                        <div className='flex flex-col gap-[16px] bg-white w-[718px]  rounded-[10px] pt-[18px] pb-[22px] px-[16px] border-2'>
                                            <div className='w-full p-[10.9px] border-b-[0.5px] border-[#3A3A3A]'>
                                                <p className='montserrat-medium text-[18px]'>{surveyData?.consentTitle}</p>
                                            </div>
                                            <div className='flex px-[10.9px] gap-[10.9px] items-center'>
                                                <div>
                                                    <input
                                                        type="checkbox"
                                                        className="h-[22px] w-[22px] rounded-[2px] border border-gray-400 checked:bg-transparent flex items-center justify-center accent-custom-lightgreen" value="checkbox"
                                                    />
                                                </div>
                                                <div>
                                                    <p className='montserrat-light'>{surveyData?.consentDescription}</p>
                                                </div>
                                            </div>
                                            <div className='w-full flex justify-end'>
                                                <p className='text-[#EB4444] montserrat-light text-xs'>Required</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='w-[740px] h-[40px] flex justify-end my-[21px] pb-[62px]'>
                                        <button className='w-[128px] h-[39px] font-semibold text-[17px] montserrat-medium text-white rounded-[6px] bg-[#A5A5A5] '> Submit</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='w-full h-[40px]'>

                        </div>
                    </div>
                </div>
            </div>
        </dialog>
    )
}

export default SurveyReview
import React, { useState } from 'react'
import { IoMdAddCircleOutline } from "react-icons/io";
import { TiEqualsOutline } from "react-icons/ti";
import { MdOutlineTextFields } from "react-icons/md";
import { IoEyeOutline } from "react-icons/io5";
import { FaTrash } from "react-icons/fa";
import { RxDragHandleDots2 } from "react-icons/rx";
import { SurveyAddQuestion } from './SurveyAddQuestion';



export const SurveySection = () => {



    const [title, setTitle] = useState("Untitled Form");

    const handleInput = (e) => {
        const value = e.target.value;
        setTitle(value);

        // Auto-expand height
        e.target.style.height = "auto";
        e.target.style.height = e.target.scrollHeight + "px";
    };

    return (
        <div>
            <div className='flex flex-col gap-[15px]'>
                <div>
                    <textarea
                        className="text-[32px] w-full h-auto min-h-[50px] resize-none overflow-hidden px-[3px]"
                        rows="1"
                        value={title}
                        onInput={handleInput}
                        onFocus={(e) => title === "Untitled Form" && setTitle("")} // Clear when focused
                        onBlur={(e) => title === "" && setTitle("Untitled Form")} // Reset when empty
                    />
                </div>
                <div>
                    <textarea
                        className="w-full min-h-[16px] max-h-[200px] resize-none overflow-hidden leading-tight text-[16px] p-[6px]"
                        rows="1"
                        placeholder="Description"
                        onInput={(e) => {
                            e.target.style.height = "auto"; // Reset height to min
                            e.target.style.height = `${e.target.scrollHeight}px`; // Expand dynamically
                        }}
                    />
                </div>
            </div>
            <div className='w-full border-b-1 border-custom-grayA5 my-[20px]'></div>

            <div className='flex gap-[17.25px] mb-[15px]'>
                <button className='w-[163px] h-[56px] border-[0.5px] border-custom-grayA5 rounded-[10px] p-[10px] flex justify-center items-center gap-[7px]'>
                    <IoMdAddCircleOutline className='size-[32px]' />
                    <p className='text-[#3A3A3A] text-[16px]'>Add Question</p>
                </button>
                <button className='w-[122px] h-[56px] border-[0.5px] border-custom-grayA5 rounded-[10px] p-[10px] flex justify-center items-center gap-[7px]'>
                    <IoEyeOutline className='size-[32px]' />
                    <p className='text-[#3A3A3A] text-[16px]'>Preview</p>
                </button>
                {/*  <button className='w-[151px] h-[56px] border-[0.5px] border-custom-grayA5 rounded-[10px] p-[10px] flex justify-center items-center gap-[7px]'>
                    <TiEqualsOutline className='size-[32px]' />
                    <p className='text-[#3A3A3A] text-[16px]'>Add Section</p>
                </button>
                <button className='w-[126px] h-[56px] border-[0.5px] border-custom-grayA5 rounded-[10px] p-[10px] flex justify-center items-center gap-[7px]'>
                    <MdOutlineTextFields className='size-[32px]' />
                    <p className='text-[#3A3A3A] text-[16px]'>Add Title</p>
                </button> */}

                {/* <button className='w-[56px] h-[56px] border-[0.5px] border-custom-grayA5 rounded-[10px] p-[10px] flex justify-center items-center gap-[7px]'>
                    <FaTrash className='size-[24px]' />
                </button> */}
            </div>

            <div className={`w-full rounded-[10px] bg-custom-lightestgreen p-[10px] flex flex-col gap-[10px]`}>
                <SurveyAddQuestion  />
            </div>
        </div>
    )
}

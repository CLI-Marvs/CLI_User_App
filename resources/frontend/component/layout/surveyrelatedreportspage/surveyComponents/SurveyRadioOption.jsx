import React, { useState } from 'react'
import { RxCross2 } from "react-icons/rx";

export const SurveyRadioOption = () => {
    return (
        <div>
            <div className="flex items-center gap-2">
                <input
                    disabled={true}
                    type="radio"
                    name="question-type"
                    value="multiple-choice"
                    id="multiple-choice"
                    className="w-[17px] h-[16px] appearance-none border-[1px] border-custom-solidgreen bg-white rounded-full flex items-center justify-center relative
                  before:content-[''] before:w-[14px] before:h-[14px] before:bg-white before:rounded-full before:absolute
                  after:content-[''] after:w-[10px] after:h-[10px] after:bg-custom-solidgreen after:rounded-full after:absolute after:scale-0 checked:after:scale-100 transition-all"
                />
                <div className='flex justify-center w-full'>
                    <textarea
                        className="w-full h-full resize-none overflow-hidden leading-tight text-[16px] p-[6px]"
                        rows="1"
                        placeholder="Option"
                        onInput={(e) => {
                            e.target.style.height = "auto"; // Reset height to min
                            e.target.style.height = `${e.target.scrollHeight}px`; // Expand dynamically
                        }}
                    />
                </div>
                <button><RxCross2 className='size-[24px]' /></button>
            </div>
        </div>
    )
}

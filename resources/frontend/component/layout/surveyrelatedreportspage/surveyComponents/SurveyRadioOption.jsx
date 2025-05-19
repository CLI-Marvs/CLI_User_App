import React, { useState, useRef, useEffect } from 'react'
import { RxCross2 } from "react-icons/rx";

export const SurveyRadioOption = ({ option, onDelete, onUpdate, optionIndex }) => {
    const textareaRef = useRef(null);
    
    const adjustHeight = (element) => {
        element.style.height = "auto"; 
        element.style.height = `${element.scrollHeight}px`; 
    };

    useEffect(() => {
        if (textareaRef.current) {
          adjustHeight(textareaRef.current);
        }
      }, [option.text]);


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
                        value={option.text}
                        onChange={(e) => {
                            onUpdate(option.id, e.target.value); 
                            adjustHeight(e.target);  
                        }}
                        ref={textareaRef}
                    />
                </div>
                {optionIndex !== 0 ?  (
                    <button onClick={onDelete}>
                        <RxCross2 className="size-[24px] hover:text-red-500" />
                    </button>
                ) : (
                   <div className='size-[24px]'></div>
                )
                }
            </div>
        </div>
    )
}

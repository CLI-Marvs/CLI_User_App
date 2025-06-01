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
        <div className='w-full'>
            <div className="flex items-center gap-2">
                
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

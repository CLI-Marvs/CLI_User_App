import React, { useState, useRef, useEffect } from 'react'
import { IoMdRadioButtonOn } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { MdContentCopy } from "react-icons/md";
import { FaRegTrashAlt } from "react-icons/fa";
import { SurveyRadioOption } from './SurveyRadioOption';
import { add } from 'lodash';

const adjustHeight = (element) => {
    element.style.height = "auto"; 
    element.style.height = `${element.scrollHeight}px`; 
};

export const SurveyAddQuestion = ({ data, sectionIndex, questionIndex, onDelete, addOption, deleteOption, updateQuestionText, updateOptionText, updateIsRequired }) => {


    const questionTextareaRef = useRef(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
      if (questionTextareaRef.current) {
        adjustHeight(questionTextareaRef.current);
      }
    }, [data.question]);

    useEffect(() => {
        function handleClickOutside(event) {
          if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsOpen(false);
          }
        }
    
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
      }, []);

    const [selectedOption, setSelectedOption] = useState("Multiple choice");
    const [isOpen, setIsOpen] = useState(false);

    const options = [
        { value: "multiple-choice", label: "Multiple choice", icon: <IoMdRadioButtonOn /> },
    ];

    return (
        <div>
            <div className='relative flex flex-col w-full bg-white rounded-[10px] gap-[15px] p-[15px]'>
                <div className='flex flex-col'>
                    <textarea
                        className="w-full min-h-[12px] max-h-[200px] resize-none overflow-hidden leading-tight text-[16px] montserrat-medium p-[8px]"
                        rows="1"
                        placeholder="Question"
                        value={data.question}
                        onChange={(e) => {
                            updateQuestionText(sectionIndex, questionIndex, e.target.value);
                            adjustHeight(e.target);
                        }}
                        ref={questionTextareaRef}
                    />
                    <div className='flex w-full border-b border-custom-grayA5'></div>
                </div>
                <div ref={dropdownRef}  className="relative w-[238px] z-20">
                    {/* Selected Option */}
                    <div
                        className="flex items-center justify-between w-full h-[35px] border-[0.5px] px-[10px] rounded-[6px] cursor-pointer bg-white"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <span className="flex items-center gap-2">
                            {options.find((option) => option.label === selectedOption)?.icon}
                            {selectedOption}
                        </span>
                        <span>▼</span>
                    </div>

                    {/* Dropdown Options */}
                    {isOpen && (
                        <ul className="absolute w-full bg-white border-[0.5px] rounded-[6px] mt-1 shadow-lg">
                            {options.map((option) => (
                                <li
                                    key={option.value}
                                    className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100"
                                    onClick={() => {
                                        setSelectedOption(option.label);
                                        setIsOpen(false);
                                    }}
                                >
                                    {option.icon}
                                    {option.label}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className='flex flex-col gap-[16px] z-10'>
                    {data?.option?.map((item, optionIndex) => (
                        <SurveyRadioOption
                            key={optionIndex}
                            option={item}
                            optionIndex={optionIndex}
                            onDelete={() => deleteOption(sectionIndex, questionIndex, item.id)}
                            onUpdate={(optionId, newText) =>
                                updateOptionText(sectionIndex, questionIndex, optionId, newText)
                            }
                        />
                    ))}
                    <div className="flex items-center gap-2">
                        <button onClick={addOption} className='montserrat-light text-sm text-custom-lightgreen underline cursor-pointer hover:text-custom-solidgreen'>
                            Add option
                        </button>
                    </div>
                </div>
                <div className='border-b-[0.5px] w-full border-custom-grayA5'></div>
                <div className='w-full h-[25px] flex justify-end items-center px-[20px] gap-[14px]'>
                    <div className='flex gap-[10px]'>
                        <FaRegTrashAlt
                            className='size-[20px] cursor-pointer text-red-500 hover:text-red-600'
                            onClick={onDelete}
                        />
                    </div>
                    <div className='border-r-[0.5px] border-custom-grayA5 h-full '></div>
                    <div className='flex gap-[10px]'>
                        <p>Required</p>
                        <div className="flex w-full">
                            <label htmlFor={`toggle-${sectionIndex}-${questionIndex}`} className="flex items-center cursor-pointer">
                                <div className="relative">
                                    <input
                                        id={`toggle-${sectionIndex}-${questionIndex}`}
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={data.required}
                                        onChange={() => {
                                            updateIsRequired(sectionIndex, questionIndex, !data.required);
                                          }}
                                    />
                                    <div className="w-10 h-4 bg-gray-400 rounded-full shadow-inner peer-checked:bg-custom-lightestgreen transition"></div>
                                    <div className="dot absolute w-6 h-6 bg-white border-[1px] rounded-full shadow -left-1 -top-1 transition peer-checked:translate-x-6 peer-checked:bg-custom-solidgreen"></div>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

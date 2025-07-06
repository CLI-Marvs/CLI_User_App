import React, { useState, useRef, useEffect } from 'react'
import { IoMdRadioButtonOn } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { MdContentCopy } from "react-icons/md";
import { FaRegTrashAlt } from "react-icons/fa";
import { IoIosCheckboxOutline } from "react-icons/io";
import { MdOutlineShortText } from "react-icons/md";
import { GrTextAlignFull } from "react-icons/gr";
import { SurveyRadioOption } from './SurveyRadioOption';
import { add } from 'lodash';
import SurveyDeleteModal from './SurveyDeleteModal';


const adjustHeight = (element) => {
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
};

export const SurveyAddQuestion = (
    {
        data,
        sectionIndex,
        questionIndex,
        onDelete,
        addOption,
        deleteOption,
        updateQuestionText,
        updateOptionText,
        updateIsRequired,
        updateInputType,
        resetOption,


    }) => {

    const modalRef = useRef(null);

    const questionTextareaRef = useRef(null);
    const dropdownRef = useRef(null);

    const handleDeleteModal = () => { 
        if (modalRef.current) {
            modalRef.current.showModal();
        }
    };

    const handleDelete = () => {
        onDelete(); 
    };

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

    const [isOpen, setIsOpen] = useState(false);

    const options = [
        { value: "multiple-choice", label: "Multiple choice", icon: <IoMdRadioButtonOn /> },
        { value: "checkboxes", label: "Checkboxes", icon: <IoIosCheckboxOutline /> },
        { value: "textbox", label: "Short answer", icon: <MdOutlineShortText /> },
    ];

    return (
        <div className='relative'>
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
                        maxLength={255}
                    />
                    <div className='flex w-full border-b border-custom-grayA5'></div>
                </div>
                <div ref={dropdownRef} className="relative w-[238px] z-20">
                    {/* Selected Option */}
                    <div
                        className="flex items-center justify-between w-full h-[35px] border-[0.5px] px-[10px] rounded-[6px] cursor-pointer bg-white"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <span className="flex items-center gap-2">
                            {options.find((option) => option.value === data.inputType)?.icon}
                            {options.find((option) => option.value === data.inputType)?.label}
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
                                        updateInputType(sectionIndex, questionIndex, option.value);

                                        if (option.value === "textbox") {
                                            resetOption(sectionIndex, questionIndex);
                                        } else {
                                            if (!data.option || data.option.length === 0) {
                                                addOption(sectionIndex, questionIndex);
                                            }
                                        }

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
                <div className='flex flex-col z-10'>
                    <div className='flex flex-col gap-2 '>
                        {data?.option?.map((item, optionIndex) => (
                            <>
                                <div key={item.id} className='flex gap-[8px] items-center'>
                                    {data.inputType === "multiple-choice" && (
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
                                    )}
                                    {data.inputType === "checkboxes" && (
                                        <input
                                            type="checkbox"
                                            className="h-[17px] w-[17px] rounded-[2px] border border-gray-400 accent-custom-lightgreen"
                                            value="checkbox"
                                            disabled={true}
                                        />
                                    )}

                                    {data.inputType === "multiple-choice" || data.inputType === "checkboxes" ? (
                                        <SurveyRadioOption
                                            key={optionIndex}
                                            option={item}
                                            optionIndex={optionIndex}
                                            onDelete={() => deleteOption(sectionIndex, questionIndex, item.id)}
                                            onUpdate={(optionId, newText) =>
                                                updateOptionText(sectionIndex, questionIndex, optionId, newText)
                                            }
                                        />
                                    ) : (
                                        <></>
                                    )}

                                </div>
                            </>
                        ))}
                    </div>
                    {data.inputType === "textbox" && (
                        <div>
                            <div className="flex flex-col gap-[10.9px]">
                                <textarea
                                    className="w-full border-b-2 min-h-[12px] resize-none overflow-hidden leading-tight text-[16px] montserrat-medium p-[8px]"
                                    rows="1"
                                    placeholder="Answer text"
                                    disabled={true}

                                />
                            </div>
                        </div>
                    )}

                    {data.inputType != "textbox" && (
                        <div className="flex items-center gap-2 mt-[16px]">
                            <button onClick={addOption} className='montserrat-light text-sm text-custom-lightgreen underline cursor-pointer hover:text-custom-solidgreen'>
                                Add option
                            </button>
                        </div>
                    )}
                </div>
                {/*  <div className='flex flex-col gap-[16px] z-10'>
                   <SurveyCheckboxOption />
                    <div className="flex items-center gap-2">
                        <button onClick={addOption} className='montserrat-light text-sm text-custom-lightgreen underline cursor-pointer hover:text-custom-solidgreen'>
                            Add option
                        </button>
                    </div>
                </div> */}
                <div className='border-b-[0.5px] w-full border-custom-grayA5'></div>
                <div className='w-full h-[25px] flex justify-end items-center px-[20px] gap-[14px]'>
                    <div className='flex gap-[10px]'>
                        <FaRegTrashAlt
                            className='size-[20px] cursor-pointer text-red-500 hover:text-red-600'
                            onClick={handleDeleteModal}
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
            <div>
                <SurveyDeleteModal modalRef={modalRef} handleDelete={handleDelete} />
            </div>
        </div>
    )
}

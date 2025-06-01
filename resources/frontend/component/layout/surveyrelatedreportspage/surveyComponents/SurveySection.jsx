import React, { useState, useRef, useEffect } from 'react'
import { IoMdAddCircleOutline } from "react-icons/io";
import { TiEqualsOutline } from "react-icons/ti";
import { MdOutlineTextFields } from "react-icons/md";
import { IoEyeOutline } from "react-icons/io5";
import { FaTrash } from "react-icons/fa";
import { RxDragHandleDots2 } from "react-icons/rx";
import { SurveyAddQuestion } from './SurveyAddQuestion';
import SurveyReview from '../SurveyReview';


const adjustHeight = (element) => {
    element.style.height = "auto"; 
    element.style.height = `${element.scrollHeight}px`; 
};

export const SurveySection = (
    {
        data,
        sectionIndex,
        addQuestion,
        deleteQuestion,
        addOption,
        deleteOption,
        updateQuestionText,
        updateOptionText,
        updateIsRequired,
        updateTitle,
        updateDescription,
        updateConsent,
        updateConsentDescription,
        updateInputType,
        resetOption,

    }) => {

    const modalRef = useRef(null);
    const titleRef = useRef(null);
    const descriptionRef = useRef(null);
    const consentRef = useRef(null);

    useEffect(() => {
    if (titleRef.current) adjustHeight(titleRef.current);
    if (descriptionRef.current) adjustHeight(descriptionRef.current);
    if (consentRef.current) adjustHeight(consentRef.current);
    }, [data.title, data.description, data.consentDescription]);

    const handleOpenReview = () => {
        if (modalRef.current) {
            modalRef.current.showModal();
        }

    };

    const handleCloseModal = () => {
        if (modalRef.current) {
            modalRef.current.close();
        }
    };

    const handleInput = (e) => {
        // Auto-expand height
        e.target.style.height = "auto";
        e.target.style.height = e.target.scrollHeight + "px";
    };

    

    return (
        <>
            <div>
                <div className='flex flex-col gap-[15px]'>
                    <div>
                        <textarea
                            className="text-[32px] w-full h-auto min-h-[50px] resize-none overflow-hidden px-[3px]"
                            rows="1"
                            value={data.title}
                            onInput={handleInput}
                            maxLength={100}
                            onFocus={(e) => {
                                if (data.title === "Untitled Form") updateTitle("", sectionIndex);
                            }}
                            onBlur={(e) => {
                                if (!e.target.value) updateTitle("Untitled Form", sectionIndex);
                            }}
                            onChange={(e) => updateTitle(e.target.value, sectionIndex)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") e.preventDefault(); 
                            }}
                            ref={titleRef}
                        />
                    </div>
                    <div>
                        <textarea
                            className="w-full min-h-[16px] resize-none overflow-y-auto leading-tight text-[16px] p-[6px]"
                            rows="1"
                            value={data.description}
                            maxLength={1000}
                            placeholder="Description"
                            onInput={(e) => {
                                e.target.style.height = "auto"; 
                                e.target.style.height = `${e.target.scrollHeight}px`; 
                            }}
                            onChange={(e) => updateDescription(e.target.value, sectionIndex)}
                            ref={descriptionRef}
                        />
                    </div>
                </div>
                <div className='w-full border-b-1 border-custom-grayA5 my-[20px]'></div>

                <div className='flex gap-[17.25px] mb-[15px]'>
                    <button onClick={() => addQuestion(sectionIndex)} className='w-[163px] h-[56px] border-[0.5px] border-custom-grayA5 rounded-[10px] p-[10px] flex justify-center items-center gap-[7px] hover:shadow-custom'>
                        <IoMdAddCircleOutline className='size-[32px]' />
                        <p className='text-[#3A3A3A] text-[16px]'>Add Question</p>
                    </button>
                    <button onClick={handleOpenReview} className='w-[122px] h-[56px] border-[0.5px] border-custom-grayA5 rounded-[10px] p-[10px] flex justify-center items-center gap-[7px] hover:shadow-custom'>
                        <IoEyeOutline className='size-[32px]' />
                        <p className='text-[#3A3A3A] text-[16px]'>Preview</p>
                    </button>
                </div>

                <div
                    className={`w-full rounded-[10px] bg-custom-lightestgreen p-[10px] flex flex-col gap-[10px] ${data?.dataQASet?.length === 0 && "hidden"
                        }`}
                >
                    {data?.dataQASet?.map((item, questionIndex) => (
                        <SurveyAddQuestion
                            key={item.id}
                            data={item}
                            sectionIndex={sectionIndex}
                            questionIndex={questionIndex}
                            onDelete={() => deleteQuestion(sectionIndex, questionIndex)}
                            addOption={() => addOption(sectionIndex, questionIndex)}
                            deleteOption={deleteOption}
                            updateQuestionText={updateQuestionText}
                            updateOptionText={updateOptionText}
                            updateIsRequired={updateIsRequired}
                            updateInputType={updateInputType}
                            resetOption={resetOption}
                        />
                    ))}
                </div>
                <div className='w-full border-b-1 border-custom-grayA5 my-[20px]' />
                <div className='w-full rounded-[10px] bg-custom-lightestgreen p-[10px] flex flex-col'>
                    <div className="flex flex-col gap-4 bg-white w-full rounded-[10px] pt-[18px] pb-[22px] px-[16px] border-2">
                        {/* Consent Title */}
                        <div className="w-full  border-b border-[#3A3A3A]">
                            <textarea
                                className="montserrat-medium text-[18px] w-full h-auto resize-none overflow-hidden px-[3px]"
                                rows="1"
                                value={data.consentTitle}
                                onChange={(e) => updateConsent(e.target.value, sectionIndex)}
                                maxLength={100}
                                onFocus={(e) => {
                                    if (data.consentTitle === "Declaration and Consent") {
                                        updateConsent("consentTitle", "", sectionIndex);
                                      }
                                }}
                                onBlur={(e) => {
                                    if (!e.target.value) updateConsent("Declaration and Consent", sectionIndex);
                                }}
                                onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
                            />
                        </div>

                        {/* Consent Checkbox and Description */}
                        <div className="flex items-center gap-3 px-[10.9px]">
                            <input
                                type="checkbox"
                                className="h-[22px] w-[22px] rounded-[2px] border border-gray-400 accent-custom-lightgreen"
                                value="checkbox"
                                disabled={true}
                            />
                             <textarea
                                className="w-full min-h-[72px] resize-none overflow-y-auto leading-tight text-[16px] p-[6px]"
                                rows="1"
                                value={data.consentDescription}
                                maxLength={1000}
                                placeholder="Consent Description"
                                onInput={(e) => adjustHeight(e.target)}
                                onChange={(e) => updateConsentDescription(e.target.value, sectionIndex)}
                                ref={consentRef}
                            />
                        </div>
                        {/* Required Message */}
                        <div className="w-full flex justify-end">
                            <p className="text-[#EB4444] montserrat-light text-xs">Required</p>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <SurveyReview modalRef={modalRef} handleCloseModal={handleCloseModal} surveyData={data} />
            </div>
        </>

    )
}

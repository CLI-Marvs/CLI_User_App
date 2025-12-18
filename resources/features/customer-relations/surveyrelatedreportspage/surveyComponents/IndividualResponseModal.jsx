import React from 'react'
import { useNavigate } from 'react-router-dom';
import { FaRegClock } from "react-icons/fa6";
import { MdOutlineNumbers } from "react-icons/md";
import { FiUserCheck } from "react-icons/fi";
import { MdOutlineEmail } from "react-icons/md";

import emoji1 from "@/assets/images/emoji1.png";
import emoji2 from "@/assets/images/emoji2.png";
import emoji3 from "@/assets/images/emoji3.png";
import emoji4 from "@/assets/images/emoji4.png";
import emoji5 from "@/assets/images/emoji5.png";


const Emojis = {
    5: emoji1,
    4: emoji2,
    3: emoji3,
    2: emoji4,
    1: emoji5,
};

const IndividualResponseModal = ({ modalRef, selectedResponse, handleCloseModal }) => {

    const navigate = useNavigate();

    const handleBackdropClick = (e) => {
        const dialogDimensions = modalRef.current.getBoundingClientRect();
        if (
            e.clientX < dialogDimensions.left ||
            e.clientX > dialogDimensions.right ||
            e.clientY < dialogDimensions.top ||
            e.clientY > dialogDimensions.bottom
        ) {
            handleCloseModal();
        }
    };


    if (!selectedResponse || typeof selectedResponse !== 'object') {
        return null; // or return a loading state: <div>Loading...</div>
    }

    const excludeFields = ['email', 'status', 'survey_owner', 'ticket_id', 'timestamp', 'rating'];

    const satisfactionColors = {
        "Very Dissatisfied": "bg-red-500",
        "Dissatisfied": "bg-red-500",
        "Neutral": "bg-[#FFC107]",
        "Satisfied": "bg-[#2196F3]",
        "Very Satisfied": "bg-[#4CAF50]",
    };

    const numberColor = (value) => {
        const num = parseInt(value);
        if (num >= 9) return "bg-[#4CAF50]"; // 9–10
        if (num >= 7) return "bg-[#2196F3]"; // 7–8
        if (num >= 5) return "bg-[#FFC107]"; // 5–6
        if (num >= 1) return "bg-red-500";   // 1–4
        return "";
    };

    const getScaleLabel = (score) => {
        const num = parseInt(score);
        if (num >= 9) return 'Very satisfied';
        if (num >= 7) return 'Satisfied';
        if (num >= 5) return 'Neutral';
        if (num >= 3) return 'Dissatisfied';
        return 'Very Dissatisfied';
    };

    // Check if answer is a satisfaction rating
    const isSatisfactionAnswer = (answer) => {
        const satisfactionTerms = ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'];
        return satisfactionTerms.includes(answer);
    };

    // Check if answer is a scale (numeric)
    // Check if answer is a scale (numeric)
    const isScaleAnswer = (answer) => {
        // Convert to string and check if it's a valid number
        if (answer === null || answer === undefined) return false;
        const num = parseInt(answer);
        return !isNaN(num) && String(answer).trim() === String(num);
    };

    // Get all question entries
    const allQuestionEntries = Object.entries(selectedResponse).filter(
        ([key]) => !excludeFields.includes(key)
    );

    // Separate the "reason" question from others
    const reasonQuestionKey = 'Please provide the reason/s for your rating:';
    const reasonEntry = allQuestionEntries.find(([question]) =>
        question.includes(reasonQuestionKey) || question.trim() === reasonQuestionKey
    );

    const otherEntries = allQuestionEntries.filter(([question]) =>
        !question.includes(reasonQuestionKey) && question.trim() !== reasonQuestionKey
    );

    const renderQuestion = ([question, answer], index) => {
        // Handle satisfaction or scale answers (single line format)
        if (isSatisfactionAnswer(answer) || isScaleAnswer(answer)) {
            const displayAnswer = isScaleAnswer(answer) ? getScaleLabel(answer) : answer;

            let bgColor = '';
            if (isScaleAnswer(answer)) {
                bgColor = numberColor(answer);
            } else if (isSatisfactionAnswer(answer)) {
                bgColor = satisfactionColors[answer] || '';
            }

            return (
                <div
                    key={index}
                    className='flex justify-between min-h-[46.67px] w-full border-[.6px] border-[#F4F4F4] px-[12.67px] py-[12px]'
                >
                    <div className='w-[700px]'>{question}</div>
                    <div>
                        <div className={`text-white font-medium px-3 py-[2px] rounded-[4px] inline-block truncate ${bgColor} ${bgColor ? 'text-white' : ''}`}>
                            {displayAnswer}
                        </div>
                    </div>
                </div>
            );
        }

        // Handle other answers (multi-line format)
        return (
            <div
                key={index}
                className='flex flex-col gap-[12px] w-full border-[.6px] border-[#F4F4F4] px-[12.67px] py-[12px]'
            >
                <div>{question}</div>
                <div>
                    <div className='rounded-[8px] w-full border-[.6px] border-[#F4F4F4] px-[12.67px] py-[12.83px]'>
                        {answer}
                    </div>
                </div>
            </div>
        );
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return { date: 'N/A', time: 'N/A' };

        const date = new Date(timestamp);

        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const formattedTime = date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });

        return { date: formattedDate, time: formattedTime };
    };


    const { date, time } = formatTimestamp(selectedResponse?.timestamp);

    return (
        <dialog
            id="individualResponse"
            ref={modalRef}
            onClick={handleBackdropClick}
            className="modal w-[1024px] px-[20px] py-[40px] rounded-[8px] shadow-custom5 backdrop:bg-black/50 "
        >
            <div className='flex flex-col gap-[12px]'>
                <form method="dialog" className="flex justify-end -mr-1">
                    <button
                        onClick={handleCloseModal}
                        className="absolute justify-center w-10 h-10 items-center rounded-full bg-custom-grayFA text-custom-bluegreen hover:bg-custombg" >
                        ✕
                    </button>
                </form>
                <div className="flex flex-col">
                    <div>
                        <p className='montserrat-semibold text-[30px]'>Response Details</p>
                    </div>
                    <div className='mb-[6px] text-sm text-[#9A9A9A]'>
                        Complete survey response information
                    </div>
                </div>
                <div className='flex flex-wrap gap-4 w-full text-sm'>
                    <div className='flex-1  p-4 text-sm border-[.6px] border-[#F4F4F4] rounded-[8px] bg-[#F6F6F630]'>
                        <div className='flex gap-[12px]'>
                            <div className='flex w-[32px] h-[32px] justify-center items-center bg-[#F6F6F6] rounded-[4px]'>
                                <FaRegClock className='size-4 text-custom-solidgreen' />
                            </div>
                            <div className='flex flex-col gap-[6px]'>
                                <div className='text-[#9A9A9A]'>
                                    Timestamp
                                </div>
                                <div className='flex gap-[8px] whitespace-nowrap'>
                                    <span>{date}</span>
                                    <span className='text-[#9A9A9A]'>{time}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate(`/inquirymanagement/thread/Ticket%23${selectedResponse?.ticket_id}`, {
                            state: {
                                source: 'survey',
                            }
                        })}
                        className='flex-1  p-4 text-sm border-[.6px] border-[#F4F4F4] rounded-[8px] hover:border-[1px] hover:border-black bg-[#F6F6F630]'>
                        <div className='flex gap-[12px]'>
                            <div className='flex w-[32px] h-[32px] justify-center items-center bg-[#F6F6F6] rounded-[4px]'>
                                <MdOutlineNumbers className='size-4 text-custom-solidgreen' />
                            </div>
                            <div
                                className='flex flex-col gap-[6px]'>
                                <div className='text-[#9A9A9A]'>
                                    Ticket ID
                                </div>
                                <div className='flex gap-[8px] whitespace-nowrap'>
                                    <span>Ticket#{selectedResponse?.ticket_id}</span>
                                </div>
                            </div>
                        </div>
                    </button>

                    <div className='flex-1  p-4 text-sm border-[.6px] border-[#F4F4F4] rounded-[8px] bg-[#F6F6F630]'>
                        <div className='flex gap-[12px]'>
                            <div className='flex w-[32px] h-[32px] justify-center items-center bg-[#F6F6F6] rounded-[4px]'>
                                <FiUserCheck className='size-4 text-custom-solidgreen' />
                            </div>
                            <div className='flex flex-col gap-[6px]'>
                                <div className='text-[#9A9A9A]'>
                                    Survey Owner
                                </div>
                                <div className='flex gap-[8px] whitespace-nowrap'>
                                    <span>{selectedResponse?.survey_owner}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='flex-1  p-4 text-sm border-[.6px] border-[#F4F4F4] rounded-[8px] bg-[#F6F6F630]'>
                        <div className='flex gap-[12px]'>
                            <div className='flex w-[32px] h-[32px] justify-center items-center bg-[#F6F6F6] rounded-[4px]'>
                                <MdOutlineEmail className='size-4 text-custom-solidgreen' />
                            </div>
                            <div className='flex flex-col gap-[6px]'>
                                <div className='text-[#9A9A9A]'>
                                    Email Address
                                </div>
                                <div className='flex gap-[8px] whitespace-nowrap'>
                                    <span>{selectedResponse?.email}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <div className='flex justify-between items-center'>
                        <p className='montserrat-semibold text-[20px]'>Response</p>
                    </div>
                </div>
                <div>
                    {selectedResponse?.rating && (
                        <div className='flex justify-between items-center  rounded-[8px] w-full border-[.6px] border-[#F4F4F4] px-[12.67px] py-[12.83px] bg-[#F6F6F630]'>
                            <div>
                                Overall Rating
                            </div>
                            <div className='flex items-center gap-[20px]'>
                                <div>
                                    <img src={Emojis[selectedResponse?.rating]} alt={`Rating ${selectedResponse?.rating}`} className="w-6 h-6 mb-1" />
                                </div>
                                <div>
                                    <p>or</p>
                                </div>
                                <div className='justify-center text-white font-medium px-2 py-[2px] rounded-[4px] inline-block truncate bg-[#008DEF] text-sm'>
                                    <p>
                                        {selectedResponse?.rating} / 5
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className='flex flex-col gap-2'>
                    {otherEntries.map((entry, index) => renderQuestion(entry, index))}
                    {reasonEntry && renderQuestion(reasonEntry, 'reason')}
                </div>
            </div>
        </dialog>
    )
}

export default IndividualResponseModal
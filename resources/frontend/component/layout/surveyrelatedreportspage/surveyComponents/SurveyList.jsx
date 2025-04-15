import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { FaTrash } from "react-icons/fa";
import apiService from '../../../servicesApi/apiService';
import ListImage from './ListImage';

export const SurveyList = ({ data, handleDelete }) => {

    const [showConfirm, setShowConfirm] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const navigate = useNavigate();

    const handleClick = (event) => {
        // Ensure the click is only triggered when not clicking the delete button
        if (event.target.closest(".delete-button")) return;
        navigate(`/inquirymanagement/settings/surveysettings/surveyform/${data.id}`);
    };

    

   

    return (
        <div>
            <div
                className='flex flex-col items-center w-[321.21px] h-[227px] border-1 rounded-[10px] border-[#E2E2E2] bg-[#DEEDD9] hover:border-black cursor-pointer'
                onClick={handleClick}
            >
                <div className='w-full h-full overflow-hidden'>
                    <div className='bg-white'>
                        <ListImage />
                    </div>
                </div>


                <div className='w-full h-[66px] flex justify-between items-center py-[10px] px-[20px] bg-white rounded-b-[10px] relative'>
                    <div className="w-[240px] leading-[24px]">
                        <p className="montserrat-medium text-[20px] text-[#494747] truncate overflow-hidden whitespace-nowrap">
                            {data.survey_title}
                        </p>
                        <p className='text-sm text-[#696969]'>
                            Edited <span>{new Date(data.updated_at).toLocaleTimeString()}</span>
                        </p>
                    </div>


                    <div className="delete-button pointer-events-auto">
                        <button
                            className="flex justify-center items-center size-[16px] text-[#696969] hover:text-red-500"
                            onClick={(e) => {
                                e.stopPropagation(); 
                                handleDelete(data.id);
                            }}
                        >
                            <FaTrash />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

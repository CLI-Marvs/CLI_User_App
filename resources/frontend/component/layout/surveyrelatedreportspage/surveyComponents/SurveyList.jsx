import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { FaTrash } from "react-icons/fa";
import apiService from '../../../servicesApi/apiService';
import ListImage from './ListImage';
import { HiDotsVertical } from "react-icons/hi";
import SurveyEditModal from './SurveyEditModal';
import SurveyDeleteModal from './SurveyDeleteModal';

export const SurveyList = ({ data, handleDelete, handleUpdateTitle }) => {

    const modalRef = useRef(null);
    const modalRef2 = useRef(null);
    const menuRef = useRef(null);

    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);
    const closeMenu = () => setIsOpen(false);

    const [showConfirm, setShowConfirm] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const navigate = useNavigate();

    const handleClick = (event) => {
        // Ensure the click is only triggered when not clicking the delete button
        if (event.target.closest(".delete-button")) return;
        navigate(`/inquirymanagement/settings/surveysettings/surveyform/${data.id}`);
    };

    function getFormattedEditedTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();

        const isToday =
            date.getDate() === now.getDate() &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear();

        const time = date.toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        }).toLowerCase();

        if (isToday) {
            return `Edited today at ${time}`;
        } else {
            const formattedDate = date.toLocaleDateString('en-US'); 
            return `Last edited ${formattedDate} | ${time}`;
        }
    }

    const openModal = () => {
        if (modalRef.current) {
            modalRef.current.showModal();
        }
    };

    const closeModal = () => {
        if (modalRef.current) {
            modalRef.current.close();
        }
    };
    
    const openModal2 = () => {
        if (modalRef2.current) {
            modalRef2.current.showModal();
        }
    };

    const closeModal2 = () => {
        if (modalRef2.current) {
            modalRef2.current.close();
        }
    };

     const handleDeletebtn = () => {
        handleDelete(data.id);
        closeModal2();
    };


    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                closeMenu();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    return (
        <div>
            <div
                className='flex flex-col items-center w-[321.21px] h-[227px] border-1 rounded-[10px] border-[#E2E2E2] bg-[#DEEDD9] hover:border-black cursor-pointer'
                onClick={handleClick}
            >
                <div className='w-full h-full rounded-t-[10px] overflow-hidden'>
                    <div className='bg-white'>
                        <ListImage />
                    </div>
                </div>


                <div className='w-full h-[66px] flex justify-between items-center py-[10px] px-[15px] bg-white rounded-b-[10px] relative'>
                    <div className="w-[240px] leading-[24px]">
                        <p className="montserrat-medium text-[20px] text-[#494747] truncate overflow-hidden whitespace-nowrap">
                            {data.survey_title}
                        </p>
                        <p className='text-sm text-[#696969]'>
                            {getFormattedEditedTime(data.updated_at)}
                        </p>
                    </div>
                    <div className="relative delete-button pointer-events-auto">
                        <button
                            onClick={toggleMenu}
                            className="flex justify-center items-center size-[30px] text-[#696969] rounded-full hover:bg-gray-200"
                        >
                            <HiDotsVertical className="w-[20px] h-[20px]" />
                        </button>

                        {isOpen && (
                            <div ref={menuRef} className="absolute right-0 mt-2 w-32 bg-white border rounded shadow z-10">
                                <button
                                    onClick={openModal}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    Rename
                                </button>
                                <button
                                    onClick={openModal2}
                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div>
                <SurveyEditModal modalRef={modalRef} surveyData={data} handleCloseModal={closeModal} handleUpdateTitle={handleUpdateTitle} />
            </div>
            <div>
                <SurveyDeleteModal modalRef={modalRef2} handleDelete={handleDeletebtn} />
            </div>
        </div>
    );
}
/* onClick={(e) => {
    e.stopPropagation(); 
    handleDelete(data.id);
}} */
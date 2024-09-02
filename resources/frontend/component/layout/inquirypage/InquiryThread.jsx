import React, { useEffect, useRef, useState } from "react";
import Backbtn from "../../../../../public/Images/Expand_up.svg";
import { LuTrash2 } from "react-icons/lu";
import UserMessages from "./UserMessages";
import AdminMessages from "./AdminMessages";
import Sho from "../../../../../public/Images/rodfil.png";
import Kent from "../../../../../public/Images/kent.png";
import FolderFile from "../../../../../public/Images/folder_file.svg";
import { BsPaperclip } from "react-icons/bs";
import { IoIosSend } from "react-icons/io";
import AssignSidePanel from "./AssignSidePanel";
import ResolveModal from "./ResolveModal";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useStateContext } from "../../../context/contextprovider";
import apiService from "../../servicesApi/apiService";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import DateLogo from '../../../../../public/Images/Date_range.svg'



const InquiryThread = () => {

    const [startDate, setStartDate] = useState(new Date());
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const filterBoxRef = useRef(null);

    const toggleFilterBox = () => {
        setIsFilterVisible((prev) => !prev);
    };

    const handleClickOutside = (event) => {
        if (filterBoxRef.current && !filterBoxRef.current.contains(event.target)) {
            setIsFilterVisible(false);
        }
    };


    const handleKeyDown = (event) => {
        if (event.key === 'Escape') {
            setIsFilterVisible(false);
        }
    };
    const {
        messages,
        setTicketId,
        getMessages,
        user,
        getInquiryLogs,
        getAllConcerns,
        data
    } = useStateContext();
    const [chatMessage, setChatMessage] = useState("");
    const modalRef = useRef(null);
    const navigate = useNavigate();
  /*   const location = useLocation();
    const { item } = location?.state || {}; */
    const params = useParams();
    const ticketId = decodeURIComponent(params.id);

    const conversationMessages = messages[ticketId] || [];

    const dataConcern = data?.find((items) => items.ticket_id === ticketId) || {};
    
    const handleOpenModal = () => {
        if (modalRef.current) {
            modalRef.current.showModal();
        }
    };


    const handleBack = () => {
        navigate("/inquirymanagement/inquirylist");
    };

    const messageId = dataConcern?.message_id || null; // Safely access message_id
    console.log("messageID", messageId);
    const submitMessage = async () => {
        try {
            const response = await apiService.post("send-message", {
                admin_email: user?.employee_email,
                ticket_id: ticketId,
                details_message: chatMessage,
                admin_name: user?.firstname + " " + user?.lastname,
                message_id: messageId,
                admin_id: user?.id,
                buyer_email: dataConcern.buyer_email,
            });

            getMessages(ticketId);
            setChatMessage("");
            getInquiryLogs(ticketId);
        } catch (error) {
            console.log("error sending messaing", error);
        }
    };

    useEffect(() => {
        setTicketId(ticketId);
    }, [ticketId, setTicketId]);


    useEffect(() => {
        if (isFilterVisible) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isFilterVisible]);
    return (
        <>
            <div className="h-screen bg-custom-grayFA p-3 overflow-x-auto overflow-y-hidden">
                <div className="bg-custom-grayFA mb-3">
                    <div className="relative flex justify-start gap-3">
                        <div className="relative w-[604px]">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="size-4 absolute left-3 top-3 text-gray-500"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                                />
                            </svg>
                            <input
                                type="text"
                                className="h-10 w-full rounded-lg pl-9 pr-6 text-sm"
                                placeholder="Search"
                            />
                            <svg
                                onClick={toggleFilterBox}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="size-4 absolute right-3 top-3 text-custom-bluegreen hover:bg-gray-200"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5"
                                />
                            </svg>
                        </div>
                        {isFilterVisible && (
                        <div
                            ref={filterBoxRef}
                            className="absolute left-0 mt-12 p-8 bg-white border border-gray-300 shadow-lg rounded-lg z-10 w-[604px]"
                        >
                            <div className="flex flex-col gap-2">
                                <div className='flex'>
                                    <label className='flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]'> Name</label>
                                    <input type="text" className='w-full  border-b-1 outline-none' />
                                </div>
                                <div className='flex'>
                                    <label className='flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]'> Category</label>
                                    <input type="text" className='w-full  border-b-1 outline-none' />
                                </div>
                                <div className='flex'>
                                    <label className='flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]'> Email</label>
                                    <input type="text" className='w-full  border-b-1 outline-none' />
                                </div>
                                <div className='flex'>
                                    <label className='flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]'> Ticket</label>
                                    <input type="text" className='w-full  border-b-1 outline-none' />
                                </div>
                                <div className='flex gap-3'>
                                    <label className='flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]'>Date</label>
                                    <div className="relative">
                                        <DatePicker
                                            selected={startDate}
                                            onChange={(date) => setStartDate(date)}
                                            className=" border-b-1 outline-none w-[176px]"
                                            calendarClassName="custom-calendar"
                                        />

                                        <img src={DateLogo} alt="date" className='absolute top-[45%] right-0 transform -translate-y-1/2 text-custom-bluegreen size-6' />

                                    </div>
                                    <label className='flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]'> Status</label>
                                    <select className='w-full border-b-1 outline-none'>
                                        <option value="">Select Status</option>
                                        <option value="draft">Draft</option>
                                        <option value="ongoing">On-going approval</option>
                                        <option value="approvenotlive">Approved not Live</option>
                                        <option value="approveandlive">Approve and Live</option>
                                    </select>
                                </div>
                                <div className="mt-5 flex gap-5">
                                    <input type="checkbox" /><label className='flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]'> Has Attachments</label>
                                </div>
                                <div className='mt-3 flex justify-end'>
                                    <button className='h-[37px] w-[88px] gradient-btn rounded-[10px] text-white text-sm'>Search</button>
                                </div>
                            </div>
                        </div>
                        )}
                    </div>
                </div>
                <div className="flex min-w-[107%] bg-custom-grayFA gap-3 h-full pb-24">
                    <div className="p-7 w-[728px] shrink-0 bg-white rounded-lg flex flex-col h-full">
                        <div className="flex items-center gap-3">
                            <img
                                src={Backbtn}
                                alt="back button"
                                onClick={handleBack}
                                className="hover:bg-gray-100 rounded-full"
                            />
                            <p className="text-sm montserrat-semibold text-custom-gray81 space-x-1">
                                {dataConcern.ticket_id}
                                <span> |</span>
                                <span>Transaction</span>
                                <span>|</span>
                                {dataConcern && <span>{dataConcern.property}</span>}
                                <span>|</span>
                                <span>T207.012</span>
                            </p>
                            <div>
                                <LuTrash2 className="text-custom-bluegreen hover:text-red-500" />
                            </div>
                            {dataConcern && dataConcern.status === "Resolved" ? (
                                <>
                                    <span className="text-blue-500 cursor-pointer hover:underline font-semibold text-sm">
                                        Resolved
                                    </span>
                                </>
                            ) : (
                                <button
                                    onClick={handleOpenModal}
                                    className="text-blue-500 cursor-pointer hover:underline font-semibold text-sm"
                                >
                                    Mark as resolve
                                </button>
                            )}
                        </div>
                        <div className="flex-grow  overflow-y-auto">
                            <div className="">
                                {conversationMessages.length > 0 &&
                                    conversationMessages.map((item, index) =>
                                        item.buyer_email ? (
                                            <UserMessages
                                                items={item}
                                                key={index}
                                            />
                                        ) : (
                                            <AdminMessages
                                                items={item}
                                                key={index}
                                            />
                                        )
                                    )}
                            </div>
                        </div>
                        <div className="mt-2 mb-3 relative">
                            <input
                                name="chat"
                                type="text"
                                placeholder="Reply..."
                                value={chatMessage}
                                onChange={(e) => setChatMessage(e.target.value)}
                                className="h-12 w-full pl-2 pr-14 border border-custom-solidgreen rounded-[10px] text-sm focus:outline-none"
                            />
                            <div className="absolute inset-y-0 right-[85px] flex items-center">
                                <button type="button">
                                    <BsPaperclip className="h-5 w-5 text-custom-solidgreen hover:text-gray-700" />
                                </button>
                            </div>
                            <div className="absolute inset-y-0 right-4 flex items-center">
                                <button
                                    type="button"
                                    onClick={submitMessage}
                                    className="flex h-7 px-2 rounded-lg font-semibold text-white text-sm items-center gradient-background3 hover:shadow-custom4"
                                >
                                    Send
                                    <IoIosSend className="h-3 w-3 text-white" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="p-[16px] w-[436px] max-h-[620px] bg-white rounded-lg">
                        <AssignSidePanel ticketId={ticketId} />
                    </div>
                </div>
            </div>
            <div>
                <ResolveModal modalRef={modalRef} ticketId={ticketId} />
            </div>
        </>
    );
};

export default InquiryThread;

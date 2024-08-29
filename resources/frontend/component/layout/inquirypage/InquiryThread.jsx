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
const InquiryThread = () => {
    const { messages, setTicketId, getMessages, user, getInquiryLogs } = useStateContext();
    const [chatMessage, setChatMessage] = useState("");
    const [messageId, setMessageId] = useState(null);
    const modalRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { item } = location?.state || {};
    const params = useParams();
    const ticketId = decodeURIComponent(params.id);

    const conversationMessages = messages[ticketId] || [];

    const handleOpenModal = () => {
        if (modalRef.current) {
            modalRef.current.showModal();
        }
    };

    const handleBack = () => {
        navigate("/inquirymanagement/inquirylist");
    };


    console.log("message_idsss", messageId);
    const submitMessage = async () => {
        try {
            const response = await apiService.post("send-message", {
                admin_email: user?.employee_email,
                ticket_id: encodedTicketId,
                details_message: chatMessage,
                admin_name: user?.firstname + ' ' + user?.lastname,
                message_id: messageId,
                buyer_email: item.buyer_email
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

    const getSpecificMessageId = async() => {
        try {
            const encodedTicketId = encodeURIComponent(ticketId);

            const response = await apiService.get(`get-messageId/${encodedTicketId}`);
            setMessageId(response.data);
        } catch (error) {
            console.log("error retrieving message id", error);
        }
    };
    useEffect(() => {
        getSpecificMessageId();
    }, []);
    return (
        <>
            <div className="h-screen bg-custombg p-3 overflow-x-auto overflow-y-hidden">
                <div className="max-w-full bg-custombg">
                    <div className="h-14 bg-custombg -mt-3">
                        <div className="relative flex justify-start gap-3">
                            <div className="relative w-1/2">
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
                                    placeholder="Search Concern"
                                />
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="size-4 absolute right-3 top-3 text-custom-bluegreen"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex bg-custombg gap-3 max-w-6xl h-full pb-24">
                    <div className="p-7 max-w-3xl shrink-0 bg-white rounded-lg flex flex-col h-full">
                        <div className="flex items-center gap-3">
                            <img
                                src={Backbtn}
                                alt="back button"
                                onClick={handleBack}
                            />
                            <p className="text-sm montserrat-semibold text-custom-gray81 space-x-1">
                                {item.ticket_id}
                                <span> |</span>
                                <span>Transaction</span>
                                <span>|</span>
                                {item && (
                                      <span>{item.property}</span>
                                )}
                                <span>|</span>
                                <span>T207.012</span>
                            </p>
                            <div>
                                <LuTrash2 />
                            </div>
                            <button
                                onClick={handleOpenModal}
                                className="text-blue-500 cursor-pointer hover:underline font-semibold text-sm"
                            >
                                Mark as resolve
                            </button>
                        </div>
                        <div className="flex-grow overflow-y-auto">
                            <div className="h-full">
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
                                className="h-12 w-full pl-2 pr-14 gradient-border rounded-full text-sm focus:outline-none"
                            />
                            <div className="absolute inset-y-0 right-24 flex items-center">
                                <button type="button">
                                    <BsPaperclip className="h-5 w-5 text-custom-solidgreen hover:text-gray-700" />
                                </button>
                            </div>
                            <div className="absolute inset-y-0 right-4 flex items-center">
                                <button
                                    type="button"
                                    onClick={submitMessage}
                                    className="flex h-7 px-2 rounded-lg font-semibold text-white text-sm items-center gradient-background3"
                                >
                                    Send
                                    <IoIosSend className="h-3 w-3 text-white" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="p-7 min-w-[436px] max-h-[620px] bg-white rounded-lg">
                        <AssignSidePanel ticketId={ticketId}/>
                    </div>
                </div>
            </div>
            <div>
                <ResolveModal modalRef={modalRef} />
            </div>
        </>
    );
};

export default InquiryThread;

import React, { useEffect, useRef, useState } from "react";
import Backbtn from "../../../../../public/Images/Expand_up.svg";
import { FaTrash } from "react-icons/fa";
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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DateLogo from "../../../../../public/Images/Date_range.svg";
import CircularProgress from "@mui/material/CircularProgress";
import { AiFillInfoCircle } from "react-icons/ai";
import { IoIosCheckmarkCircle } from "react-icons/io";

import AddInfoModal from "./AddInfoModal";

const InquiryThread = () => {
    const [attachedFiles, setAttachedFiles] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const filterBoxRef = useRef(null);
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [email, setEmail] = useState("");
    const [ticket, setTicket] = useState("");
    const [status, setStatus] = useState("");
    const [hasAttachments, setHasAttachments] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const {
        messages,
        setTicketId,
        getMessages,
        user,
        getInquiryLogs,
        getAllConcerns,
        setSearchFilter,
        data,
        setMessages,
    } = useStateContext();
    const [chatMessage, setChatMessage] = useState("");
    const modalRef = useRef(null);
    const resolveModalRef = useRef(null);
    const navigate = useNavigate();
    /*   const location = useLocation();
    const { item } = location?.state || {}; */
    const params = useParams();
    const ticketId = decodeURIComponent(params.id);
    const [isResolved, setIsResolved] = useState(false);

    const handleDateChange = (date) => {
        setStartDate(date);
    };

    const handleStatus = (e) => {
        setStatus(e.target.value);
    };

    const dataConcern =
        data?.find((items) => items.ticket_id === ticketId) || {};
    const toggleFilterBox = () => {
        setIsFilterVisible((prev) => !prev);
    };

    const handleFileAttach = (event) => {
        const files = Array.from(event.target.files);
        setAttachedFiles((prevFiles) => [...prevFiles, ...files]);
    };

    const removeFile = (fileNameToDelete) => {
        setAttachedFiles((prevFiles) =>
            prevFiles.filter((file) => file.name !== fileNameToDelete)
        );
    };
    const handleClickOutside = (event) => {
        if (
            filterBoxRef.current &&
            !filterBoxRef.current.contains(event.target)
        ) {
            setIsFilterVisible(false);
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === "Escape") {
            setIsFilterVisible(false);
        }
    };
    const handleOpenModal = () => {
        if (modalRef.current) {
            modalRef.current.showModal();
        }
    };

    const handleOpenResolveModal = () => {
        if (resolveModalRef.current) {
            resolveModalRef.current.showModal();
        }
    };

    const handleConfirmation = () => {
        if (chatMessage.trim()) {
            setIsConfirmModalOpen(true); // open confirmation modal
        }
    };

    const handleBack = () => {
        navigate("/inquirymanagement/inquirylist");
    };

    const handleCheckboxChange = () => {
        setHasAttachments(!hasAttachments);
    };

    const messageId = dataConcern?.message_id || null;

    const handleSearch = () => {
        setSearchFilter({
            name,
            category,
            email,
            ticket,
            startDate,
            status,
            hasAttachments,
        });
        setIsFilterVisible(false);
        /*  setCurrentPage(0); */
        setName("");
        setCategory("");
        setEmail("");
        setTicket("");
        setStatus("");
        setHasAttachments(false);
        navigate("/inquirymanagement/inquirylist");
    };

    const handleDeleteInquiry = async () => {
        await apiService.post("delete-concerns", { ticketId });
        navigate("/inquirymanagement/inquirylist");
        getAllConcerns();
    };
    const submitMessage = async () => {
        setLoading(true);
        setIsConfirmModalOpen(false);
        const formData = new FormData();

        if (attachedFiles && attachedFiles.length > 0) {
            attachedFiles.forEach((file) => {
                formData.append("files[]", file);
            });
        }
        formData.append("admin_email", user?.employee_email || "");
        formData.append("ticket_id", ticketId || "");
        formData.append("details_message", chatMessage || "");
        formData.append(
            "admin_name",
            `${user?.firstname || ""} ${user?.lastname || ""}`
        );
        formData.append("message_id", messageId || "");
        formData.append("admin_id", user?.id || "");
        formData.append("buyer_email", dataConcern.buyer_email || "");
        formData.append("admin_profile_picture", user?.profile_picture || "");
        formData.append("department", user?.department || "");

        try {
            const response = await apiService.post("send-message", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            callBackHandler();
            setAttachedFiles([]);
        } catch (error) {
            console.log("error sending message", error);
        } finally {
            setLoading(false);
        }
    };

    const callBackHandler = () => {
        getMessages(ticketId);
        setChatMessage("");
        getInquiryLogs(ticketId);
        getAllConcerns();
    };
    useEffect(() => {
        setTicketId(ticketId);
    }, [ticketId, setTicketId]);

    useEffect(() => {
        if (isFilterVisible) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("keydown", handleKeyDown);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isFilterVisible]);

    const adminMessageChannelFunc = (channel) => {
        channel.listen("AdminMessage", (event) => {
            setMessages((prevMessages) => {
                const messagesForTicket = prevMessages[ticketId] || [];
                if (messagesForTicket.find((msg) => msg.id === event.data.id)) {
                    return prevMessages;
                }

                const newMessage = event.data;

                return {
                    ...prevMessages,
                    [ticketId]: [...messagesForTicket, newMessage],
                };
            });
        });
    };

    const combineThreadMessages = messages[ticketId]
        ? messages[ticketId]
              .flat()
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        : [];
    useEffect(() => {
        let adminMessageChannel;
        let newTicketId;
        if (ticketId) {
            newTicketId = ticketId.replace("#", "");
            adminMessageChannel = window.Echo.channel(
                `adminmessage.${newTicketId}`
            );
            adminMessageChannelFunc(adminMessageChannel);
        }
        return () => {
            if (adminMessageChannel) {
                adminMessageChannel.stopListening("AdminMessage");
                window.Echo.leaveChannel(`adminmessage.${newTicketId}`);
            }
        };
    }, [ticketId]);

    return (
        <>
            <div className="flex h-full bg-custom-grayFA overflow-x-auto">
                <div className="bg-custom-grayFA w-[601px] px-[20px] pb-[103px] ">
                    {" "}
                    {/* boxdevref */}
                    <div className="relative flex justify-start gap-3 mb-[12px] mt-[2px]">
                        <div className="relative w-full ">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="size-4 absolute left-3 top-4 text-gray-500"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                                />
                            </svg>
                            <input
                                readOnly={true}
                                onClick={toggleFilterBox}
                                type="text"
                                className="h-[47px] w-full rounded-lg pl-9 pr-6 text-sm bg-custom-grayF1 outline-none"
                                placeholder="Search"
                            />
                            <svg
                                onClick={toggleFilterBox}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="size-[24px] absolute right-3 top-3 text-custom-bluegreen hover:bg-gray-200 cursor-pointer"
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
                                className="absolute left-0 mt-12 p-8 bg-white border border-gray-300 shadow-lg rounded-lg z-10 w-[560px]"
                            >
                                <div className="flex flex-col gap-2">
                                    <div className="flex">
                                        <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]">
                                            {" "}
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full  border-b-1 outline-none"
                                            value={name}
                                            onChange={(e) =>
                                                setName(e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="flex">
                                        <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]">
                                            {" "}
                                            Category
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full  border-b-1 outline-none"
                                            value={category}
                                            onChange={(e) =>
                                                setCategory(e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="flex">
                                        <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]">
                                            {" "}
                                            Email
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full  border-b-1 outline-none"
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="flex">
                                        <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]">
                                            {" "}
                                            Ticket
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full  border-b-1 outline-none"
                                            value={ticket}
                                            onChange={(e) =>
                                                setTicket(e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[244px]">
                                            Date
                                        </label>
                                        <div className="relative">
                                            <DatePicker
                                                selected={startDate}
                                                onChange={handleDateChange}
                                                className=" border-b-1 outline-none w-[176px]"
                                                calendarClassName="custom-calendar"
                                            />

                                            <img
                                                src={DateLogo}
                                                alt="date"
                                                className="absolute top-[45%] right-0 transform -translate-y-1/2 text-custom-bluegreen size-6"
                                            />
                                        </div>
                                        <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]">
                                            {" "}
                                            Status
                                        </label>
                                        <select
                                            className="w-full border-b-1 outline-none"
                                            onChange={handleStatus}
                                            value={status}
                                        >
                                            <option value="">
                                                Select Status
                                            </option>
                                            <option value="Inquiry Feedback Received">
                                                Inquiry Feedback Received
                                            </option>
                                            <option value="Replied By">
                                                Replied By
                                            </option>
                                            <option value="Assign To">
                                                Assign To
                                            </option>
                                            <option value="Mark as resolved">
                                                Mark as resolve
                                            </option>
                                        </select>
                                    </div>
                                    <div className="mt-5 flex gap-5">
                                        <input
                                            type="checkbox"
                                            checked={hasAttachments}
                                            onChange={handleCheckboxChange}
                                        />
                                        <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]">
                                            {" "}
                                            Has Attachments
                                        </label>
                                    </div>
                                    <div className="mt-3 flex justify-end">
                                        <button
                                            className="h-[37px] w-[88px] gradient-btn rounded-[10px] text-white text-sm"
                                            onClick={handleSearch}
                                        >
                                            Search
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="p-[16px] shrink-0 bg-white rounded-lg flex flex-col flex-grow min-h-screen">
                        {" "}
                        {/* boxdevref */}
                        <div className="flex items-center gap-[9px] px-[10px]">
                            <img
                                src={Backbtn}
                                alt="back button"
                                onClick={handleBack}
                                className="hover:bg-gray-100 rounded-full cursor-pointer"
                            />
                            <div className="flex-1 flex flex-wrap">
                                <p className="space-x-1 text-custom-bluegreen">
                                    {dataConcern.property}{" "}
                                    ({dataConcern.details_concern}) <span>-</span>{" "}
                                    {dataConcern.ticket_id}
                                </p>
                            </div>
                            {/*   {dataConcern.created_by &&
                                dataConcern.created_by === user?.id && (
                                    <div className="flex justify-center w-[20px] shrink-0">
                                        <LuTrash2
                                            className="text-custom-bluegreen hover:text-red-500 cursor-pointer"
                                            onClick={handleDeleteInquiry}
                                        />
                                    </div>
                                )} */}
                            <div className="flex justify-end shrink-0">
                                <button
                                    onClick={handleOpenModal}
                                    className="w-[85px] h-[29px] rounded-[10px] gradient-btn5 montserrat-medium text-sm text-white hover:shadow-custom4"
                                >
                                    Add Info
                                </button>
                            </div>
                        </div>
                        <div className="p-[10px]">
                            <div className="relative">
                                {" "}
                                {/* boxref */}
                                {/* Container for chat input and attached files */}
                                <div className="gradient-btn2 rounded-[12px] p-[2px] relative">
                                    <div className="bg-white p-[10px] pr-0 rounded-[10px]">
                                        {/* Display attached files inside the same container */}
                                        {attachedFiles.length > 0 && (
                                            <div className="mb-2 ">
                                                {attachedFiles.map(
                                                    (file, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center justify-between mb-2 p-2 border bg-white rounded"
                                                        >
                                                            <span className="text-sm text-gray-700">
                                                                {file.name}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    removeFile(
                                                                        file.name
                                                                    )
                                                                }
                                                                className="text-red-500"
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        )}

                                        {/* Input field */}
                                        <div className="h-[101px] w-[668]  ">
                                            <textarea
                                                placeholder="Reply..."
                                                onChange={(e) =>
                                                    setChatMessage(e.target.value)
                                                }
                                                value={chatMessage}
                                                id="chat"
                                                name="chat"
                                                rows="4"
                                                draggable="false"
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter" && !e.shiftKey) {
                                                        e.preventDefault(); // Prevents creating a new line
                                                        handleConfirmation(); // Call your send message function
                                                    }
                                                }}
                                                className="h-full w-full pl-2 pr-[123px] border-none  text-sm focus:outline-none"
                                            ></textarea>

                                            {/* File attachment button */}
                                            <div className=" absolute bottom-2 right-[115px] items-center hidden">
                                                <input
                                                    type="file"
                                                    id="fileInput"
                                                    multiple
                                                    style={{ display: "none" }}
                                                    onChange={handleFileAttach}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        document
                                                            .getElementById(
                                                                "fileInput"
                                                            )
                                                            .click()
                                                    }
                                                >
                                                    <BsPaperclip className="h-5 w-5 text-custom-solidgreen hover:text-gray-700" />
                                                </button>
                                            </div>
                                            {/* Send button */}
                                            <div className="absolute bottom-2 right-4 flex items-center">
                                                <button
                                                    type="button"
                                                    onClick={handleConfirmation}
                                                    disabled={
                                                        !chatMessage.trim() ||
                                                        loading
                                                    }
                                                    className={`flex w-[82px] h-[28px] rounded-[5px] text-white text-xs justify-center items-center 
                                                        ${loading || !chatMessage.trim() 
                                                            ? 'bg-gray-400 cursor-not-allowed' 
                                                            : 'gradient-background3 hover:shadow-custom4'} 
                                                    `}
                                                >
                                                    {loading ? (
                                                        <CircularProgress className="spinnerSize" />
                                                    ) : (
                                                        <>Send Reply</>
                                                    )}
                                                </button>
                                            </div>
                                            {isConfirmModalOpen && (
                                                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                                                    <div className="bg-white p-[20px] rounded-[10px] shadow-custom5 w-[467px] h-[228]">
                                                        <div className="flex justify-center items-center mt-[14px] ">
                                                            <AiFillInfoCircle className="size-[37px] text-[#5B9BD5]" />
                                                        </div>
                                                        <div className="flex justify-center mt-[30px]">
                                                            <p className="montserrat-medium text-[20px]">
                                                                Are you sure about
                                                                sending this reply?
                                                            </p>
                                                        </div>
                                                        <div className="flex flex-col justify-center items-center text-[12px] text-[#B54D4D] px-[20px]">
                                                            <p>
                                                                This message will be sent to
                                                            </p>
                                                            <span className="font-semibold text-[13px]">
                                                                    {dataConcern.buyer_name}
                                                                    {" "}({dataConcern.buyer_email})
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-center mt-[26px] space-x-[19px]">
                                                            <button
                                                                onClick={() =>
                                                                    setIsConfirmModalOpen(
                                                                        false
                                                                    )
                                                                }
                                                                className="gradient-btn5 p-[1px] w-[92px] h-[35px] rounded-[10px]"
                                                            >
                                                                <div className="w-full h-full rounded-[9px] bg-white flex justify-center items-center montserrat-semibold text-sm">
                                                                    <p className="text-base font-bold bg-gradient-to-r from-custom-bluegreen via-custom-solidgreen to-custom-solidgreen bg-clip-text text-transparent">
                                                                        Cancel
                                                                    </p>
                                                                </div>
                                                            </button>
                                                            <button
                                                                onClick={
                                                                    submitMessage
                                                                }
                                                                className="gradient-btn5 w-[100px] h-[35px] rounded-[10px] text-sm text-white montserrat-semibold"
                                                            >
                                                                Confirm
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-[11px] text-[#B54D4D]">
                                    <p>
                                        Note: This message will be sent to{" "}
                                        <span className="font-semibold">
                                            {dataConcern.buyer_name}
                                        </span>
                                        . Please use the comment section for CLI
                                        internal communication.
                                    </p>
                                </div>
                            </div>
                            <div className="border my-2 border-t-1 border-custom-lightestgreen"></div>
                            <div className="w-full flex justify-end gap-[13px]">
                                {dataConcern.created_by &&
                                    dataConcern.created_by === user?.id && (
                                        <FaTrash
                                            className="text-[#EB4444] hover:text-red-600 cursor-pointer"
                                            onClick={handleDeleteInquiry}
                                        />
                                    )}
                                {dataConcern.status === "Resolved" ? (
                                    <div className="flex justify-start items-center w-[122px] font-semibold text-[13px] text-custom-lightgreen space-x-1">
                                        <p>Ticket Resolved</p>
                                        <IoIosCheckmarkCircle className="size-[18px] text-custom-lightgreen" />
                                    </div>
                                ) : (
                                    <div
                                        onClick={handleOpenResolveModal}
                                        className="flex justify-start w-[122px] font-semibold text-[13px] text-[#1A73E8] underline cursor-pointer"
                                    >
                                        Mark as resolved
                                    </div>
                                )}
                            </div>
                            <div className="flex-grow overflow-y-auto max-h-[calc(100vh-400px)]">
                                <div className="">
                                    {combineThreadMessages.length > 0 &&
                                        combineThreadMessages.map((item, index) =>
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
                            {/* <div className="mt-2 mb-3 relative">
                                {attachedFiles.length > 0 && (
                                    <div className="mb-2 absolute">
                                        {attachedFiles.map((file, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between mb-2 p-2 border rounded"
                                            >
                                                <span className="text-sm text-gray-700">
                                                    {file.name}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeFile(file.name)
                                                    }
                                                    className="text-red-500"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <input
                                    name="chat"
                                    type="text"
                                    placeholder="Reply..."
                                    value={chatMessage}
                                    onChange={(e) => setChatMessage(e.target.value)}
                                    className="h-12 w-full pl-2 pr-14 border border-custom-solidgreen rounded-[10px] text-sm focus:outline-none"
                                />
                                <div className="absolute inset-y-0 right-[85px] flex items-center">
                                    <input
                                        type="file"
                                        id="fileInput"
                                        multiple
                                        style={{ display: "none" }}
                                        onChange={handleFileAttach}
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            document
                                                .getElementById("fileInput")
                                                .click()
                                        }
                                    >
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
                            </div> */}
                        </div>
                        </div>
                        
                </div>
                <div className="flex w-[623px] bg-custom-grayFA gap-3 pb-24">
                    <div className="w-[623px]">
                        {" "}
                        {/* boxref */}
                        <AssignSidePanel ticketId={ticketId} />
                    </div>
                </div>
            </div>
            <div>
                <AddInfoModal modalRef={modalRef} dataConcern={dataConcern} />
            </div>
            <div>
                <ResolveModal
                    modalRef={resolveModalRef}
                    ticketId={ticketId}
                    dataRef={dataConcern}
                />
            </div>
        </>
    );
};

export default InquiryThread;

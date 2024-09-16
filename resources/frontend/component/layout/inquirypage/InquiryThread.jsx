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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DateLogo from "../../../../../public/Images/Date_range.svg";
import CircularProgress from "@mui/material/CircularProgress";

const InquiryThread = () => {
    const [attachedFiles, setAttachedFiles] = useState([]);
    const [startDate, setStartDate] = useState(new Date());
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const filterBoxRef = useRef(null);

    const {
        messages,
        setTicketId,
        getMessages,
        user,
        getInquiryLogs,
        getAllConcerns,
        data,
    } = useStateContext();
    const [chatMessage, setChatMessage] = useState("");
    const modalRef = useRef(null);
    const navigate = useNavigate();
    /*   const location = useLocation();
    const { item } = location?.state || {}; */
    const params = useParams();
    const ticketId = decodeURIComponent(params.id);

    const conversationMessages = messages[ticketId] || [];

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

    const handleBack = () => {
        navigate("/inquirymanagement/inquirylist");
    };

    const messageId = dataConcern?.message_id || null;

    // const submitMessage = async () => {
    //     try {
    //         const response = await apiService.post("send-message", {
    //             admin_email: user?.employee_email,
    //             ticket_id: ticketId,
    //             details_message: chatMessage,
    //             admin_name: user?.firstname + " " + user?.lastname,
    //             message_id: messageId,
    //             admin_id: user?.id,
    //             buyer_email: dataConcern.buyer_email,
    //         });

    //         callBackHandler();
    //     } catch (error) {
    //         console.log("error sending messaing", error);
    //     }
    // };

    const submitMessage = async () => {
        setLoading(true);
        const formData = new FormData();

        if (attachedFiles && attachedFiles.length > 0) {
            attachedFiles.forEach((file) => {
                formData.append("files[]", file);
            });
        }
        // Append other fields to FormData
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

    return (
        <>
            <div className="h-screen bg-custom-grayFA p-3 overflow-x-auto overflow-y-hidden">
                <div className="bg-custom-grayFA mb-3">
                    {" "}
                    {/* boxdevref */}
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
                                readOnly={true}
                                onClick={toggleFilterBox}
                                type="text"
                                className="h-[47px] w-full rounded-lg pl-9 pr-6 text-sm"
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
                                className="absolute left-0 mt-12 p-8 bg-white border border-gray-300 shadow-lg rounded-lg z-10 w-[604px]"
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
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]">
                                            Date
                                        </label>
                                        <div className="relative">
                                            <DatePicker
                                                selected={startDate}
                                                onChange={(date) =>
                                                    setStartDate(date)
                                                }
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
                                        <select className="w-full border-b-1 outline-none">
                                            <option value="">
                                                Select Status
                                            </option>
                                            <option value="draft">Draft</option>
                                            <option value="ongoing">
                                                On-going approval
                                            </option>
                                            <option value="approvenotlive">
                                                Approved not Live
                                            </option>
                                            <option value="approveandlive">
                                                Approve and Live
                                            </option>
                                        </select>
                                    </div>
                                    <div className="mt-5 flex gap-5">
                                        <input type="checkbox" />
                                        <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]">
                                            {" "}
                                            Has Attachments
                                        </label>
                                    </div>
                                    <div className="mt-3 flex justify-end">
                                        <button className="h-[37px] w-[88px] gradient-btn rounded-[10px] text-white text-sm">
                                            Search
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex min-w-[107%] bg-custom-grayFA gap-3 h-full pb-24">
                    <div className="p-7 w-[728px] shrink-0 bg-white rounded-lg flex flex-col h-full">
                        {" "}
                        {/* boxdevref */}
                        <div className="flex items-center gap-3">
                            <img
                                src={Backbtn}
                                alt="back button"
                                onClick={handleBack}
                                className="hover:bg-gray-100 rounded-full cursor-pointer"
                            />
                            <div className="flex-1 flex flex-wrap">
                                <p className="space-x-1 text-sm montserrat-semibold text-custom-gray81">
                                    {dataConcern.ticket_id}
                                    <span> |</span>
                                    <span>{dataConcern.details_concern}</span>
                                    <span>|</span>
                                    {dataConcern && (
                                        <span>{dataConcern.property}</span>
                                    )}
                                    <span>|</span>
                                    <span>{dataConcern.unit_number}</span>
                                </p>
                            </div>
                            <div className="flex justify-center w-[20px] shrink-0">
                                <LuTrash2 className="text-custom-bluegreen hover:text-red-500 cursor-pointer" />
                            </div>
                            <div className="flex justify-end shrink-0">
                                {dataConcern &&
                                dataConcern.status === "Resolved" ? (
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
                        </div>
                        <div className="flex-grow  overflow-y-auto">
                            <div className="">
                                {conversationMessages.length > 0 &&
                                    conversationMessages.map((item, index) => {
                                        const buyerName = item.buyer_name;
                                        return item.buyer_email ? (
                                            <UserMessages
                                                items={item}
                                                key={index}
                                                buyerName={buyerName}
                                            />
                                        ) : (
                                            <AdminMessages
                                                items={item}
                                                key={index}
                                            />
                                        );
                                    })}
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
                        <div className="mt-2 mb-3 relative">
                            {" "}
                            {/* boxref */}
                            {/* Container for chat input and attached files */}
                            <div className="gradient-btn2 rounded-[12px] p-[4px] relative">
                                <div className="bg-white p-[4px] rounded-[10px]">
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
                                    <div className="h-[61px] w-[668]  rounded-[14px] p-[4px] ">
                                        <input
                                            name="chat"
                                            type="text"
                                            placeholder="Reply..."
                                            value={chatMessage}
                                            onChange={(e) =>
                                                setChatMessage(e.target.value)
                                            }
                                            className="h-full w-full pl-2 pr-14 border-none rounded-[10px] text-sm focus:outline-none"
                                        />

                                        {/* File attachment button */}
                                        <div className="absolute bottom-7 right-[85px] flex items-center">
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
                                        <div className="absolute bottom-6 right-4 flex items-center">
                                            <button
                                                type="button"
                                                onClick={submitMessage}
                                                disabled={
                                                    !chatMessage.trim() ||
                                                    loading
                                                }
                                                className={`flex w-[68px] h-[31px] rounded-lg font-semibold text-white text-sm justify-center items-center gradient-background3 hover:shadow-custom4 ${
                                                    loading
                                                        ? "cursor-not-allowed"
                                                        : ""
                                                }`}
                                            >
                                                {loading ? (
                                                    <CircularProgress className="spinnerSize" />
                                                ) : (
                                                    <>
                                                        Send
                                                        <IoIosSend className="h-3 w-3 text-white" />
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="p-[16px] w-[436px] max-h-[620px] bg-white rounded-lg">
                        {" "}
                        {/* boxref */}
                        <AssignSidePanel ticketId={ticketId} />
                    </div>
                </div>
            </div>
            <div>
                <ResolveModal
                    modalRef={modalRef}
                    ticketId={ticketId}
                    dataRef={dataConcern}
                />
            </div>
        </>
    );
};

export default InquiryThread;

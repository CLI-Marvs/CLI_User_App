import React, { useEffect, useRef, useState } from "react";
import Backbtn from "../../../../../public/Images/Expand_up.svg";
import { FaTrash } from "react-icons/fa";
import UserMessages from "./UserMessages";
import AdminMessages from "./AdminMessages";
import Sho from "../../../../../public/Images/rodfil.png";
import Kent from "../../../../../public/Images/kent.png";
import FolderFile from "../../../../../public/Images/folder_file.svg";
import { BsPaperclip } from "react-icons/bs";
import { IoIosArrowDown, IoIosSend } from "react-icons/io";
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
import { toast, ToastContainer, Bounce } from "react-toastify";
import Alert from "../../../component/Alert";
import AddInfoModal from "./AddInfoModal";
import { VALID_FILE_EXTENSIONS } from "../../../constant/data/validFile";

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
    const [selectedProperty, setSelectedProperty] = useState("");
    const [fileName, setFileName] = useState("");
    const [hasAttachments, setHasAttachments] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const { propertyNamesList } = useStateContext();
    /*   const [dataConcern, setDataConcern] = useState({}); */
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
    const location = useLocation();
    const { itemsData } = location?.state || {};
    const params = useParams();
    const ticketId = decodeURIComponent(params.id);
    const [isResolved, setIsResolved] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [dataConcern, setDataConcern] = useState(itemsData || {});
    const [emailMessageID, setEmailMessageID] = useState(null);
    const handleDateChange = (date) => {
        setStartDate(date);
    };

    const handleSelectProperty = (e) => {
        setSelectedProperty(e.target.value);
    };

    /* const handleUpdate = (newData) => {
        setDataConcern((prevData) => ({
            ...prevData,
            ...newData,
        }));
    }; */
    const handleUpdate = (newData) => {
        setDataConcern((prevData) => ({
            ...prevData,
            ...newData,
            message_id: emailMessageID || prevData.message_id, // Use the latest message ID if available
        }));
    };

    /*   console.log("data", data); */
    console.log("updatedConcern", dataConcern);

    /*  const dataConcern = data?.find((item) => item.ticket_id === ticketId) || {}; */

    /*  console.log("dataConcern", data); */
    /*  console.log("data", data);

    console.log("dataConcern", dataConcern);
    console.log("ticketId", ticketId); */

    const toggleFilterBox = () => {
        setIsFilterVisible((prev) => !prev);
    };

    const handleFileAttach = (event) => {
        const files = Array.from(event.target.files);
        setAttachedFiles((prevFiles) => [...prevFiles, ...files]);
    };

    const formatFunc = (name) => {
        return name
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const formattedPropertyNames = [
        "N/A",
        ...(Array.isArray(propertyNamesList) && propertyNamesList.length > 0
            ? propertyNamesList
                  .filter((item) => !item.toLowerCase().includes("phase"))
                  .map((item) => formatFunc(item))
                  .sort((a, b) => {
                      if (a === "N/A") return -1;
                      if (b === "N/A") return 1;
                      return a.localeCompare(b);
                  })
            : []),
    ];

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

    const handleDelete = () => {
        setShowAlert(true);
    };
    const handleConfirm = () => {
        // console.log("it runs")
        handleDeleteInquiry();
        setShowAlert(false);
    };

    const handleCancel = () => {
        console.log("Cancelled");
        setShowAlert(false);
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
            selectedProperty,
            hasAttachments,
        });
        setIsFilterVisible(false);
        /*  setCurrentPage(0); */
        setSelectedProperty("");
        setName("");
        setCategory("");
        setEmail("");
        setTicket("");
        setHasAttachments(false);
        navigate("/inquirymanagement/inquirylist");
    };

    const formatChatMessage = (message) => {
        if (message) {
            return message.split("\n").map((item, index) => (
                <span key={index}>
                    {item}
                    <br />
                </span>
            ));
        }
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
            const invalidExtensions = []; // To collect invalid file extensions
            const oversizedFiles = []; // To collect oversized file names

            attachedFiles.forEach((file) => {
                const extension = file.name.split(".").pop(); // Get file extension
                const isFileValid = VALID_FILE_EXTENSIONS.includes(extension); // Check if extension is valid
                const isFileSizeValid = file.size <= 100 * 1024 * 1024; // Check if size is within 100 MB

                // Collect invalid extensions and oversized files
                if (!isFileValid) invalidExtensions.push(extension);
                if (!isFileSizeValid) oversizedFiles.push(file.name);
            });

            // Show toast for invalid extensions if any are found
            if (invalidExtensions.length > 0) {
                toast.warning(
                    `.${invalidExtensions.join(
                        ", ."
                    )} file type(s) are not allowed.`,
                    {
                        position: "top-right",
                        autoClose: 1500,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                        transition: Bounce,
                    }
                );
                setLoading(false);
                return;
            }

            // Show toast for oversized files if any are found
            if (oversizedFiles.length > 0) {
                toast.warning(` File is too large. Maximum size is 100MB.`, {
                    position: "top-right",
                    autoClose: 1500,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                    transition: Bounce 
                });
                setLoading(false);
                return;
            }

            // If all files are valid, proceed with further processing
            setLoading(true);
        }

        if (attachedFiles && attachedFiles.length > 0) {
            attachedFiles.forEach((file) => {
                formData.append("files[]", file);
            });
        }

        const formattedMessage = chatMessage.replace(/\n/g, "<br>");
        formData.append("admin_email", user?.employee_email || "");
        formData.append("ticket_id", ticketId || "");
        formData.append("details_message", formattedMessage || "");
        formData.append(
            "admin_name",
            `${user?.firstname || ""} ${user?.lastname || ""}`
        );
        formData.append("message_id", messageId || "");
        formData.append("admin_id", user?.id || "");
        formData.append("buyer_email", dataConcern.buyer_email || "");
        formData.append("buyer_lastname", dataConcern.buyer_lastname || "");
        formData.append("admin_profile_picture", user?.profile_picture || "");
        formData.append("department", user?.department || "");

        try {
            const response = await apiService.post("send-message", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            console.log("triger here");

            callBackHandler();
            setAttachedFiles([]);
            setLoading(false);
            callBackHandler();
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

    const messageIdChannelFunc = (channel) => {
        channel.listen("MessageID", (event) => {
            console.log("message id event", event.data);
            setEmailMessageID(event.data.message_id);
        });
    };

    const combineThreadMessages = messages[ticketId]
        ? messages[ticketId]
              .flat()
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        : [];
    // useEffect(() => {
    //     let adminMessageChannel;
    //     let newTicketId;
    //     let messageIdChannel;
    //     if (ticketId) {
    //         newTicketId = ticketId.replace("#", "");
    //         adminMessageChannel = window.Echo.channel(
    //             `adminmessage.${newTicketId}`
    //         );
    //         messageIdChannel = window.Echo.channel(
    //             `messageidref.${newTicketId}`
    //         );
    //         messageIdChannelFunc(messageIdChannel);
    //         adminMessageChannelFunc(adminMessageChannel);
    //     }
    //     return () => {
    //         if (adminMessageChannel) {
    //             adminMessageChannel.stopListening("AdminMessage");
    //             window.Echo.leaveChannel(`adminmessage.${newTicketId}`);

    //             adminMessageChannel.stopListening("MessageID");
    //             window.Echo.leaveChannel(`messageidref.${newTicketId}`);
    //         }
    //     };
    // }, [ticketId]);

    useEffect(() => {
        let adminMessageChannel;
        let messageIdChannel;
        let newTicketId;

        // Function to initialize channels when Echo is ready
        const initChannels = () => {
            if (ticketId && window.Echo) {
                newTicketId = ticketId.replace("#", "");
                adminMessageChannel = window.Echo.channel(
                    `adminmessage.${newTicketId}`
                );
                messageIdChannel = window.Echo.channel(
                    `messageidref.${newTicketId}`
                );
                messageIdChannelFunc(messageIdChannel);
                adminMessageChannelFunc(adminMessageChannel);
            }
        };

        // Periodically check if window.Echo is initialized
        const checkBrowserReady = setInterval(() => {
            if (window.Echo) {
                initChannels();
                clearInterval(checkBrowserReady); // Stop checking once Echo is ready
            }
        }, 100); // Check every 100ms if Echo is initialized

        return () => {
            clearInterval(checkBrowserReady); // Clear interval if component unmounts

            if (adminMessageChannel) {
                adminMessageChannel.stopListening("AdminMessage");
                window.Echo.leaveChannel(`adminmessage.${newTicketId}`);
            }
            if (messageIdChannel) {
                messageIdChannel.stopListening("MessageID");
                window.Echo.leaveChannel(`messageidref.${newTicketId}`);
            }
        };
    }, [ticketId]);

    const capitalizeWords = (name) => {
        if (name) {
            return name
                .split(" ")
                .map(
                    (word) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase()
                )
                .join(" ");
        }
    };

    return (
        <>
            <div className="flex h-full bg-custom-grayFA">
                <ToastContainer />

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
                                className="h-[47px] w-full rounded-[10px] pl-9 pr-6 text-sm bg-custom-grayF1 outline-none"
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
                                            className="w-full  border-b-1 outline-none text-sm px-[8px]"
                                            value={name}
                                            onChange={(e) =>
                                                setName(e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="flex relative">
                                        <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]">
                                            {" "}
                                            Category
                                        </label>
                                        <select
                                            className="w-full border-b-1 outline-none appearance-none text-sm px-[8px]"
                                            value={category}
                                            onChange={(e) =>
                                                setCategory(e.target.value)
                                            }
                                        >
                                            <option value="">
                                                Select Category
                                            </option>
                                            <option value="Reservation Documents">
                                                Reservation Documents
                                            </option>
                                            <option value="Payment Issues">
                                                Payment Issues
                                            </option>
                                            <option value="SOA/ Billing Statement/ Buyer's Ledger">
                                                SOA/ Billing Statement/ Buyer's
                                                Ledger
                                            </option>
                                            <option value="Turn Over Status">
                                                Turn Over Status
                                            </option>
                                            <option value="Unit Status">
                                                Unit Status
                                            </option>
                                            <option value="Loan Application">
                                                Loan Application
                                            </option>
                                            <option value="Title and Other Registration Documents">
                                                Title and Other Registration
                                                Documents
                                            </option>
                                            <option value="Commissions">
                                                Commissions
                                            </option>
                                            <option value="Other Concerns">
                                                Other Concerns
                                            </option>
                                        </select>
                                        <span className="absolute inset-y-0 right-0 flex items-center  pl-3 pointer-events-none">
                                            <IoIosArrowDown />
                                        </span>
                                    </div>
                                    <div className="flex">
                                        <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]">
                                            {" "}
                                            Email
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full  border-b-1 outline-none text-sm px-[8px]"
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
                                            className="w-full  border-b-1 outline-none text-sm px-[8px]"
                                            value={ticket}
                                            onChange={(e) =>
                                                setTicket(e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex">
                                            <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[93px]">
                                                Date
                                            </label>
                                            <div className="relative">
                                                <DatePicker
                                                    selected={startDate}
                                                    onChange={handleDateChange}
                                                    className="border-b-1 outline-none w-[146px] text-sm px-[8px]"
                                                    calendarClassName="custom-calendar"
                                                />

                                                <img
                                                    src={DateLogo}
                                                    alt="date"
                                                    className="absolute top-[45%] right-0 transform -translate-y-1/2 text-custom-bluegreen size-6 cursor-pointer pointer-events-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex relative">
                                            <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[65px]">
                                                {" "}
                                                Property
                                            </label>
                                            <select
                                                className="w-[179px] border-b-1 outline-none appearance-none text-sm px-[8px]"
                                                onChange={handleSelectProperty}
                                                value={selectedProperty}
                                            >
                                                <option value="">
                                                    Select Property
                                                </option>
                                                {formattedPropertyNames.map(
                                                    (item, index) => {
                                                        return (
                                                            <option
                                                                key={index}
                                                                value={item}
                                                            >
                                                                {item}
                                                            </option>
                                                        );
                                                    }
                                                )}
                                            </select>
                                            <span className="absolute inset-y-0 right-0 flex items-center  pl-3 pointer-events-none">
                                                <IoIosArrowDown />
                                            </span>
                                        </div>
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
                    <div className="p-[16px] shrink-0 bg-white rounded-[10px] shadow-custom7 flex flex-col flex-grow min-h-screen">
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
                                    {dataConcern.property} (
                                    {dataConcern.details_concern ??
                                        dataConcern.email_subject}
                                    ) <span>-</span> {dataConcern.ticket_id}
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
                                    className="w-[85px] h-[29px] rounded-[10px] gradient-btn5 font-light text-sm text-white hover:shadow-custom4"
                                >
                                    More Info
                                </button>
                            </div>
                        </div>
                        <div className="p-[10px]">
                            <div className="relative">
                                {" "}
                                {/* boxref */}
                                {/* Container for chat input and attached files */}
                                <div className="gradient-btn2 rounded-[12px] p-[2px] relative">
                                    <div className="bg-white p-[10px] rounded-[10px]">
                                        {/* Display attached files inside the same container */}
                                        {attachedFiles.length > 0 && (
                                            <div className="mb-2 ">
                                                {attachedFiles.map(
                                                    (file, index) => {
                                                        const fileName =
                                                            file.name;

                                                        const fileExtension =
                                                            fileName.slice(
                                                                fileName.lastIndexOf(
                                                                    "."
                                                                )
                                                            );
                                                        const baseName =
                                                            fileName.slice(
                                                                0,
                                                                fileName.lastIndexOf(
                                                                    "."
                                                                )
                                                            );
                                                        const truncatedName =
                                                            baseName.length > 30
                                                                ? baseName.slice(
                                                                      0,
                                                                      30
                                                                  ) + "..."
                                                                : baseName;
                                                        return (
                                                            <div
                                                                key={index}
                                                                className="flex items-center justify-between mb-2 p-2 border bg-white rounded "
                                                            >
                                                                <span className="text-sm text-gray-700">
                                                                    {/* {file.name} */}
                                                                    {truncatedName +
                                                                        fileExtension}
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
                                                        );
                                                    }
                                                )}
                                            </div>
                                        )}

                                        {/* Input field */}
                                        <div className="h-[101px] w-[668]  ">
                                            <textarea
                                                placeholder="Reply..."
                                                onChange={(e) =>
                                                    setChatMessage(
                                                        e.target.value
                                                    )
                                                }
                                                value={chatMessage}
                                                id="chat"
                                                name="chat"
                                                rows="4"
                                                draggable="false"
                                                className="h-full w-full pl-2 pr-[123px] border-none  text-sm focus:outline-none"
                                            ></textarea>

                                            {/* File attachment button */}
                                            <div className=" absolute bottom-[6px] right-[108px] items-center">
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
                                                        ${
                                                            loading ||
                                                            !chatMessage.trim()
                                                                ? "bg-gray-400 cursor-not-allowed"
                                                                : "gradient-background3 hover:shadow-custom4"
                                                        } 
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
                                                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-auto">
                                                    <div className="bg-white p-[20px] rounded-[10px] shadow-custom5 w-[784px] min-h-[442px]">
                                                        <div className="p-[10px] flex flex-col gap-[26px]">
                                                            <div className="flex justify-center items-center">
                                                                <AiFillInfoCircle className="size-[37px] text-[#5B9BD5]" />
                                                            </div>
                                                            <div className="flex items-center justify-between  px-[25px] h-[50px] rounded-[4px] bg-custom-lightestgreen">
                                                                <p className="montserrat-medium text-[20px]">
                                                                    Are you sure
                                                                    about
                                                                    sending this
                                                                    message?
                                                                </p>
                                                                <div>
                                                                    <div className="flex justify-center space-x-[10px]">
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
                                                            <div className="flex items-center h-[22px] text-custom-solidgreen font-semibold">
                                                                PREVIEW
                                                            </div>
                                                            <div className="flex items-center h-[22px] text-custom-solidgreen font-semibold">
                                                                <span className="mr-1">
                                                                    TO:
                                                                </span>
                                                                <span className="text-sm">
                                                                    {
                                                                        dataConcern.buyer_email
                                                                    }
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center h-[19px] text-sm">
                                                                Hi Mr./Ms.{" "}
                                                                {capitalizeWords(
                                                                    dataConcern.buyer_lastname
                                                                )}
                                                                ,
                                                            </div>
                                                            <div className="w-full p-[10px] border-[2px] rounded-[5px] border-custom-grayF1 text-sm text-custom-gray81">
                                                                {formatChatMessage(
                                                                    chatMessage
                                                                )}
                                                            </div>
                                                            <div className="text-sm">
                                                                <p>
                                                                    Sincerely,
                                                                </p>
                                                                <br />
                                                                <p>
                                                                    {
                                                                        user?.firstname
                                                                    }{" "}
                                                                    {
                                                                        user?.lastname
                                                                    }
                                                                </p>
                                                                <p>
                                                                    CLI -{" "}
                                                                    {
                                                                        user?.department
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {attachedFiles.length >
                                                            0 && (
                                                            <div className="mb-2 ">
                                                                {attachedFiles.map(
                                                                    (
                                                                        file,
                                                                        index
                                                                    ) => {
                                                                        const fileName =
                                                                            file.name;
                                                                        const fileExtension =
                                                                            fileName.slice(
                                                                                fileName.lastIndexOf(
                                                                                    "."
                                                                                )
                                                                            );
                                                                        const baseName =
                                                                            fileName.slice(
                                                                                0,
                                                                                fileName.lastIndexOf(
                                                                                    "."
                                                                                )
                                                                            );
                                                                        const truncatedName =
                                                                            baseName.length >
                                                                            30
                                                                                ? baseName.slice(
                                                                                      0,
                                                                                      30
                                                                                  ) +
                                                                                  "..."
                                                                                : baseName;
                                                                        return (
                                                                            <div
                                                                                key={
                                                                                    index
                                                                                }
                                                                                className="flex items-center justify-between mb-2 p-2 border bg-white rounded"
                                                                            >
                                                                                <span className="text-sm text-gray-700">
                                                                                    {truncatedName +
                                                                                        fileExtension}
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
                                                                        );
                                                                    }
                                                                )}
                                                            </div>
                                                        )}
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
                                            {capitalizeWords(
                                                `${dataConcern.buyer_firstname} ${dataConcern.buyer_middlename} ${dataConcern.buyer_lastname}`
                                            )}{" "}
                                            {capitalizeWords(
                                                dataConcern.suffix_name
                                            )}
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
                                            onClick={handleDelete}
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
                            <div className="">
                                <div className="">
                                    {combineThreadMessages.length > 0 &&
                                        combineThreadMessages.map(
                                            (item, index) =>
                                                item.buyer_email ? (
                                                    <UserMessages
                                                        dataConcern={
                                                            dataConcern
                                                        }
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
                <AddInfoModal
                    modalRef={modalRef}
                    dataConcern={dataConcern}
                    onupdate={handleUpdate}
                />
            </div>
            <div>
                <ResolveModal
                    modalRef={resolveModalRef}
                    ticketId={ticketId}
                    dataRef={dataConcern}
                />
            </div>
            <div>
                <Alert
                    title="Are you sure you want to delete?"
                    show={showAlert}
                    onCancel={handleCancel}
                    onConfirm={handleConfirm}
                />
            </div>
        </>
    );
};

export default InquiryThread;

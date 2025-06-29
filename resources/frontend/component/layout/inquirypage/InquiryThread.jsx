import React, { useEffect, useRef, useState } from "react";
import Backbtn from "../../../../../public/Images/Expand_up.svg";
import { FaTrash } from "react-icons/fa";
import UserMessages from "./UserMessages";
import AdminMessages from "./AdminMessages";
import { BsPaperclip, BsDownload } from "react-icons/bs";
import { IoIosArrowDown } from "react-icons/io";
import AssignSidePanel from "./AssignSidePanel";
import ResolveModal from "./ResolveModal";
import CloseModal from "./CloseModal";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useStateContext } from "../../../context/contextprovider";
import apiService from "../../servicesApi/apiService";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DateLogo from "../../../../../public/Images/Date_range.svg";
import CircularProgress from "@mui/material/CircularProgress";
import { AiFillInfoCircle } from "react-icons/ai";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { toast } from "react-toastify";
import { showToast } from "../../../util/toastUtil";
import Alert from "../../Alert";
import AddInfoModal from "./AddInfoModal";
import { VALID_FILE_EXTENSIONS } from "../../../constant/data/validFile";
import InquiryFormModal from "./InquiryFormModal";
import ThreadInquiryFormModal from "./ThreadInquiryFormModal";
import { ALLOWED_EMPLOYEES_CRS } from "../../../constant/data/allowedEmployeesCRS";
import { ALLOWED_DEPARTMENT } from "../../../constant/data/allowedDepartment";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

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
    const [departments, setDepartments] = useState("");
    const [type, setType] = useState("");
    const [channels, setChannels] = useState("");
    const [selectedProperty, setSelectedProperty] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [fileName, setFileName] = useState("");
    const [hasAttachments, setHasAttachments] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const { propertyNamesList } = useStateContext();
    const [endDate, setEndDate] = useState(null);

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
        dataCount,
        fullYear,
        allEmployees,
        setMessages,
        setIsUserTypeChange,
        isUserTypeChange,
    } = useStateContext();
    const [chatMessage, setChatMessage] = useState("");
    const userLoggedInEmail = user?.employee_email;
    const userLoggedInDepartment = user?.department; //Holds the user's department
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const modalRef = useRef(null);
    const modalRef2 = useRef(null);
    const resolveModalRef = useRef(null);
    const closeModalRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { itemsData } = location?.state || {};
    const params = useParams();
    const ticketId = decodeURIComponent(params.id);
    const [dataConcern, setDataConcern] = useState(itemsData || {});
    const [emailMessageID, setEmailMessageID] = useState(null);
    const handleDateChange = (date) => {
        setStartDate(date);
    };

    // Function to normalize names
    //const normalizeEmail = (email) => email.trim().toLowerCase();

    const handleSelectProperty = (e) => {
        setSelectedProperty(e.target.value);
    };

    const handleUpdate = (newData) => {
        setDataConcern((prevData) => ({
            ...prevData,
            ...newData,
        }));
    };

    useEffect(() => {
        const storedData = JSON.parse(localStorage.getItem("dataConcern"));
        const updatedData = JSON.parse(localStorage.getItem("updatedData"));

        if (storedData) {
            setDataConcern(storedData);
        }

        if (updatedData) {
            setDataConcern(updatedData);
        }
    }, []);

    const monthNames = {
        "01": "January",
        "02": "February",
        "03": "March",
        "04": "April",
        "05": "May",
        "06": "June",
        "07": "July",
        "08": "August",
        "09": "September",
        10: "October",
        11: "November",
        12: "December",
    };

    /*  const dataConcern = data?.find((item) => item.ticket_id === ticketId) || {}; */

    const toggleFilterBox = () => {
        setIsFilterVisible((prev) => !prev);
    };

    const handleFileAttach = (event) => {
        const files = Array.from(event.target.files);
        setAttachedFiles((prevFiles) => [...prevFiles, ...files]);
        event.target.value = "";
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
                  .map((item) => {
                      let formattedItem = formatFunc(item);

                      // Capitalize each word in the string
                      formattedItem = formattedItem
                          .split(" ")
                          .map((word) => {
                              // Check for specific words that need to be fully capitalized
                              if (/^(Sjmv|Lpu|Cdo|Dgt)$/i.test(word)) {
                                  return word.toUpperCase();
                              }
                              // Capitalize the first letter of all other words
                              return (
                                  word.charAt(0).toUpperCase() +
                                  word.slice(1).toLowerCase()
                              );
                          })
                          .join(" ");

                      // Replace specific names if needed
                      if (formattedItem === "Casamira South") {
                          formattedItem = "Casa Mira South";
                      }

                      return formattedItem;
                  })
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
        setIsUserTypeChange(false);
        if (modalRef.current) {
            modalRef.current.showModal();
        }
    };

    const handleOpenAddInfoModal = () => {
        if (modalRef2.current) {
            modalRef2.current.showModal();
        }
    };

    const handleOpenResolveModal = () => {
        if (resolveModalRef.current) {
            resolveModalRef.current.showModal();
        }
    };
    const handleOpenCloseModal = () => {
        if (closeModalRef.current) {
            closeModalRef.current.showModal();
        }
    };
    const handleConfirmation = () => {
        if (chatMessage.trim()) {
            setIsConfirmModalOpen(true); // open confirmation modal
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    const handleCheckboxChange = () => {
        setHasAttachments(!hasAttachments);
    };

    const messageId = dataConcern?.message_id || null;

    const handleSearch = async () => {
        try {
            setSearchFilter({
                name,
                category,
                type,
                status,
                email,
                channels,
                ticket,
                startDate,
                selectedProperty,
                hasAttachments,
                selectedMonth,
                selectedYear,
                departments,
            });
            setIsSearchLoading(true);
            await getAllConcerns();
            setIsFilterVisible(false);
            /*  setCurrentPage(0); */
            setSelectedProperty("");
            setName("");
            setCategory("");
            setEmail("");
            setTicket("");
            setHasAttachments(false);
            navigate("/inquirymanagement/inquirylist");
        } catch (error) {
            console.log(error);
        } finally {
            setIsSearchLoading(false);
        }
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
                showToast(
                    `.${invalidExtensions.join(
                        ", ."
                    )} file type(s) are not allowed.`,
                    "warning"
                );

                setLoading(false);
                return;
            }

            // Show toast for oversized files if any are found
            if (oversizedFiles.length > 0) {
                showToast(
                    "File is too large. Maximum size is 100MB.",
                    "warning"
                );
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

            setAttachedFiles([]);
            setLoading(false);
            callBackHandler();
        } catch (error) {
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
        getAllConcerns();
    }, []);

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

    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0); // Scrolls to the top
    }, [pathname]);

    const messageIdChannelFunc = (channel) => {
        channel.listen("MessageID", (event) => {
            setEmailMessageID(event.data.message_id);
            /*  setDataConcern((prevDataConcern) => ({
                 ...prevDataConcern,
                 message_id: event.data.message_id,
             })); */
        });
    };

    useEffect(() => {
        if (emailMessageID) {
            setDataConcern((prevData) => ({
                ...prevData,
                message_id: emailMessageID,
            }));
        }
    }, [emailMessageID]);

    const combineThreadMessages = messages[ticketId]
        ? messages[ticketId]
              .flat()
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        : [];
    const getLatestMessageFromBuyer = combineThreadMessages.find(
        (item) => item.buyer_email
    );

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

    /* const capitalizeWords = (name) => {
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
    }; */

    return (
        <>
            <div className="flex h-full bg-custom-grayFA">
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
                                            value={name}
                                            onChange={(e) =>
                                                setName(e.target.value)
                                            }
                                            className="w-full  border-b-1 outline-none text-sm px-[8px]"
                                        />
                                    </div>
                                    <div className="flex relative">
                                        <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]">
                                            {" "}
                                            Category
                                        </label>

                                        <div className="flex bg-red-900 justify-start w-full relative">
                                            <label
                                                htmlFor=""
                                                className="w-full border-b-2"
                                            >
                                                {""}
                                            </label>
                                            <select
                                                className="w-full border-b-1 outline-none appearance-none text-sm absolute px-[8px]"
                                                value={category}
                                                onChange={(e) =>
                                                    setCategory(e.target.value)
                                                }
                                            >
                                                <option value=" ">
                                                    Select Category
                                                </option>
                                                <option value="Reservation Documents">
                                                    Reservation Documents
                                                </option>
                                                <option value="Payment Issues">
                                                    Payment Issues
                                                </option>
                                                <option value="SOA/ Buyer's Ledger">
                                                    SOA/ Buyer's Ledger
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
                                        </div>

                                        <span className="absolute inset-y-0 right-0 flex items-center  pl-3 pointer-events-none">
                                            <IoIosArrowDown />
                                        </span>
                                    </div>
                                    <div className="flex relative">
                                        <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]">
                                            {" "}
                                            Type
                                        </label>
                                        <div className="flex bg-red-900 justify-start w-full relative">
                                            <label
                                                htmlFor=""
                                                className="w-full border-b-2"
                                            >
                                                {""}
                                            </label>
                                            <select
                                                className="w-full border-b-1 outline-none appearance-none text-sm absolute px-[8px]"
                                                value={type}
                                                onChange={(e) =>
                                                    setType(e.target.value)
                                                }
                                            >
                                                <option value="">
                                                    Select Type
                                                </option>
                                                <option value="Complaint">
                                                    Complaint
                                                </option>
                                                <option value="Request">
                                                    Request
                                                </option>
                                                <option value="Inquiry">
                                                    Inquiry
                                                </option>
                                                <option value="Suggestion or Recommendation">
                                                    Suggestion or Recommendation
                                                </option>
                                                <option value="No Type">
                                                    No Type
                                                </option>
                                            </select>
                                        </div>

                                        <span className="absolute inset-y-0 right-0 flex items-center  pl-3 pointer-events-none">
                                            <IoIosArrowDown />
                                        </span>
                                    </div>
                                    <div className="flex relative">
                                        <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]">
                                            {" "}
                                            Status
                                        </label>
                                        <div className="flex bg-red-900 justify-start w-full relative">
                                            <label
                                                htmlFor=""
                                                className="w-full border-b-2"
                                            >
                                                {""}
                                            </label>
                                            <select
                                                className="w-full border-b-1 outline-none appearance-none text-sm absolute px-[8px]"
                                                value={status}
                                                onChange={(e) =>
                                                    setStatus(e.target.value)
                                                }
                                            >
                                                <option value=" ">
                                                    Select Status
                                                </option>
                                                <option value="Resolved">
                                                    Resolved
                                                </option>
                                                <option value="unresolved">
                                                    Unresolved
                                                </option>
                                                <option value="Closed">
                                                    Closed
                                                </option>
                                            </select>
                                        </div>

                                        <span className="absolute inset-y-0 right-0 flex items-center  pl-3 pointer-events-none">
                                            <IoIosArrowDown />
                                        </span>
                                    </div>

                                    <div className="flex relative">
                                        <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]">
                                            {" "}
                                            Channel
                                        </label>
                                        <div className="flex bg-red-900 justify-start w-full relative">
                                            <label
                                                htmlFor=""
                                                className="w-full border-b-2"
                                            >
                                                {""}
                                            </label>
                                            <select
                                                className="w-full border-b-1 outline-none appearance-none text-sm absolute px-[8px]"
                                                value={channels}
                                                onChange={(e) =>
                                                    setChannels(e.target.value)
                                                }
                                            >
                                                <option value="">
                                                    {" "}
                                                    Select Channel
                                                </option>
                                                <option value="Email">
                                                    Email
                                                </option>
                                                <option value="Call">
                                                    Call
                                                </option>
                                                <option value="Walk in">
                                                    Walk-in
                                                </option>
                                                <option value="Website">
                                                    Website
                                                </option>
                                                <option value="Social media">
                                                    Social Media
                                                </option>
                                                <option value="Branch Tablet">
                                                    Branch Table
                                                </option>
                                                <option value="Internal Endorsement">
                                                    Internal Endorsement
                                                </option>
                                                <option value="No Channel">
                                                    No Channel
                                                </option>
                                            </select>
                                        </div>

                                        <span className="absolute inset-y-0 right-0 flex items-center  pl-3 pointer-events-none">
                                            <IoIosArrowDown />
                                        </span>
                                    </div>
                                    <div className="flex relative">
                                        <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]">
                                            {" "}
                                            Department
                                        </label>
                                        <div className="flex bg-red-900 justify-start w-full relative">
                                            <label
                                                htmlFor=""
                                                className="w-full border-b-2"
                                            >
                                                {""}
                                            </label>
                                            <select
                                                className="w-full border-b-1 outline-none appearance-none text-sm absolute px-[8px]"
                                                value={departments}
                                                onChange={(e) =>
                                                    setDepartments(
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                <option value="">
                                                    {" "}
                                                    Select Department
                                                </option>
                                                {[
                                                    ...new Set(
                                                        allEmployees
                                                            .map(
                                                                (item) =>
                                                                    item.department
                                                            )
                                                            .filter(
                                                                (department) =>
                                                                    department !==
                                                                        null &&
                                                                    department !==
                                                                        undefined &&
                                                                    department !==
                                                                        "NULL"
                                                            )
                                                    ),
                                                ]
                                                    .sort((a, b) =>
                                                        a.localeCompare(b)
                                                    )
                                                    .map(
                                                        (department, index) => (
                                                            <option
                                                                key={index}
                                                                value={
                                                                    department
                                                                }
                                                            >
                                                                {department}
                                                            </option>
                                                        )
                                                    )}
                                                <option value="Unassigned">
                                                    {" "}
                                                    Unassigned
                                                </option>
                                            </select>
                                        </div>
                                        <span className="absolute inset-y-0 right-0 flex items-center  pl-3 pointer-events-none">
                                            <IoIosArrowDown />
                                        </span>
                                    </div>
                                    <div className="flex relative">
                                        <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]">
                                            {" "}
                                            Property
                                        </label>
                                        <div className="fle justify-start w-full relative">
                                            <label
                                                htmlFor=""
                                                className="w-full border-b-2"
                                            >
                                                {""}
                                            </label>
                                            <select
                                                className="w-full border-b-1 outline-none appearance-none text-sm px-[8px]"
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
                                        </div>
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
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                            className="w-full  border-b-1 outline-none text-sm px-[8px]"
                                        />
                                    </div>
                                    <div className="flex">
                                        <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]">
                                            {" "}
                                            Ticket
                                        </label>
                                        <input
                                            type="text"
                                            value={ticket}
                                            onChange={(e) =>
                                                setTicket(e.target.value)
                                            }
                                            className="w-full  border-b-1 outline-none text-sm px-[8px]"
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex">
                                            <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[94px]">
                                                Date
                                            </label>
                                            <div className="flex gap-[15px]">
                                                <div className="flex">
                                                    <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-max pr-[10px]">
                                                        From
                                                    </label>
                                                    <div className="relative">
                                                        <DatePicker
                                                            selected={startDate}
                                                            onChange={(
                                                                date
                                                            ) => {
                                                                setStartDate(
                                                                    date
                                                                );
                                                                setSelectedYear(
                                                                    ""
                                                                );
                                                                setSelectedMonth(
                                                                    ""
                                                                );
                                                            }}
                                                            onFocus={() => {
                                                                setSelectedYear(
                                                                    ""
                                                                );
                                                                setSelectedMonth(
                                                                    ""
                                                                );
                                                            }}
                                                            className="border-b-1 outline-none w-[180px] text-sm px-[8px]"
                                                            calendarClassName="custom-calendar"
                                                        />

                                                        <img
                                                            src={DateLogo}
                                                            alt="date"
                                                            className="absolute top-[45%] right-0 transform -translate-y-1/2 text-custom-bluegreen size-6 cursor-pointer pointer-events-none"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex">
                                                    <label className="flex justify-end items-end text-custom-bluegreen text-[12px] w-max px-[10px]">
                                                        To
                                                    </label>
                                                    <div className="relative">
                                                        <DatePicker
                                                            selected={endDate}
                                                            onChange={(
                                                                date
                                                            ) => {
                                                                setEndDate(
                                                                    date
                                                                );
                                                                setSelectedYear(
                                                                    ""
                                                                );
                                                                setSelectedMonth(
                                                                    ""
                                                                );
                                                            }}
                                                            onFocus={() => {
                                                                setSelectedYear(
                                                                    ""
                                                                );
                                                                setSelectedMonth(
                                                                    ""
                                                                );
                                                            }}
                                                            className="border-b-1 outline-none w-full text-sm px-[8px]"
                                                            calendarClassName="custom-calendar"
                                                            minDate={startDate}
                                                        />

                                                        <img
                                                            src={DateLogo}
                                                            alt="date"
                                                            className="absolute top-[45%] right-0 transform -translate-y-1/2 text-custom-bluegreen size-6 cursor-pointer pointer-events-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex">
                                            <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[94px]">
                                                Year
                                            </label>
                                            <div className="relative w-[146px]">
                                                <select
                                                    className="w-full border-b-1 outline-none appearance-none text-sm absolute px-[8px]"
                                                    value={selectedYear}
                                                    onChange={(e) => {
                                                        setSelectedYear(
                                                            e.target.value
                                                        );
                                                        setStartDate(null);
                                                        setEndDate(null);
                                                    }}
                                                >
                                                    <option value="">
                                                        {" "}
                                                        Select Year
                                                    </option>
                                                    {fullYear &&
                                                        fullYear.map(
                                                            (item, index) => (
                                                                <option
                                                                    key={index}
                                                                    value={
                                                                        item.year
                                                                    }
                                                                >
                                                                    {" "}
                                                                    {item.year}
                                                                </option>
                                                            )
                                                        )}
                                                </select>
                                                <span className="absolute inset-y-0 right-0 flex items-center  pl-3 pointer-events-none">
                                                    <IoIosArrowDown />
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex relative ">
                                            <label className="flex justify-start items-end text-custom-bluegreen text-[12px] px-[15px]">
                                                {" "}
                                                Month
                                            </label>
                                            <select
                                                className="w-[220px] border-b-1 outline-none appearance-none text-sm px-[8px]"
                                                onChange={(e) => {
                                                    setSelectedMonth(
                                                        e.target.value
                                                    );
                                                    setStartDate(null);
                                                    setEndDate(null);
                                                }}
                                                value={selectedMonth}
                                            >
                                                <option value="">
                                                    {" "}
                                                    Select Month
                                                </option>
                                                {Object.entries(monthNames)
                                                    .sort(
                                                        ([keyA], [keyB]) =>
                                                            keyA - keyB
                                                    )
                                                    .map(([key, name]) => (
                                                        <option
                                                            key={key}
                                                            value={key}
                                                        >
                                                            {name}
                                                        </option>
                                                    ))}
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
                                    {dataConcern?.property} (
                                    {dataConcern?.details_concern ??
                                        dataConcern?.email_subject}
                                    ) <span>-</span> {dataConcern?.ticket_id}
                                </p>
                            </div>
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
                            {/* Container for chat input and attached files */}
                            {/* IF userLoggedInDepartment is in  ALLOWED_DEPARTMENTS then render/show the textarea for reply */}
                            {dataConcern?.status === "unresolved" &&
                                ALLOWED_DEPARTMENT.includes(
                                    userLoggedInDepartment
                                ) && (
                                    <div className="relative">
                                        <div className="gradient-btn2 rounded-[12px] p-[2px] relative ">
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
                                                                        className="flex items-center justify-between mb-2 p-2 border bg-white rounded "
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
                                                            style={{
                                                                display: "none",
                                                            }}
                                                            onChange={
                                                                handleFileAttach
                                                            }
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
                                                            onClick={
                                                                handleConfirmation
                                                            }
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
                                                                            Are
                                                                            you
                                                                            sure
                                                                            about
                                                                            sending
                                                                            this
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

                                                                    <div className="w-full p-[10px] border-[2px] rounded-[5px] border-custom-grayF1 text-sm text-custom-gray81">
                                                                        <div>
                                                                            {formatChatMessage(
                                                                                chatMessage
                                                                            )}
                                                                        </div>
                                                                        <div className="mt-[26px]">
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
                                                                                CLI
                                                                                -{" "}
                                                                                {
                                                                                    user?.department
                                                                                }
                                                                            </p>
                                                                        </div>
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
                                                Note: This message will be sent
                                                to{" "}
                                                <span className="font-semibold">
                                                    {
                                                        /* capitalizeWords() */
                                                        `${
                                                            dataConcern?.buyer_firstname ||
                                                            ""
                                                        } ${
                                                            dataConcern?.buyer_middlename ||
                                                            ""
                                                        } ${
                                                            dataConcern?.buyer_lastname ||
                                                            ""
                                                        }`
                                                    }{" "}
                                                    {
                                                        /* capitalizeWords() */
                                                        dataConcern?.suffix_name
                                                    }
                                                </span>
                                                . Please use the comment section
                                                for CLI internal communication.
                                            </p>
                                        </div>
                                    </div>
                                )}

                            {/*Render if the logged in user department is not CRS or other critical departments*/}
                            {!ALLOWED_DEPARTMENT.includes(
                                userLoggedInDepartment
                            ) && (
                                <div className="relative py-2">
                                    <div className="text-[11px] text-[#B54D4D]">
                                        <p>
                                            <span className="font-semibold">
                                                Note: Only CRS, Turnovers,
                                                Accounts Management, Sales, and
                                                Registration & Documentation
                                                teams can reply directly to
                                                inquiries, use the comment
                                                section for internal
                                                communication.
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="border my-2 border-t-1 border-custom-lightestgreen"></div>
                            <div className="w-full flex justify-end gap-[13px] items-center">
                                {(dataConcern?.status === "Resolved" ||
                                    dataConcern?.status === "Closed") && (
                                    <span
                                        className="w-auto font-semibold text-[13px] text-[#1A73E8] underline cursor-pointer"
                                        onClick={handleOpenAddInfoModal}
                                    >
                                        Create new ticket
                                    </span>
                                )}

                                {dataConcern?.status === "Resolved" ? (
                                    <div className="flex justify-start items-center w-[122px] font-semibold text-[13px] text-custom-lightgreen space-x-1">
                                        <p>Ticket Resolved</p>
                                        <IoIosCheckmarkCircle className="size-[18px] text-custom-lightgreen" />
                                    </div>
                                ) : (
                                    ALLOWED_EMPLOYEES_CRS.includes(
                                        userLoggedInEmail
                                    ) &&
                                    dataConcern?.status !== "Closed" && (
                                        <div
                                            onClick={handleOpenResolveModal}
                                            className="flex justify-start w-auto font-semibold text-[13px] text-[#1A73E8] underline cursor-pointer"
                                        >
                                            Mark as resolved
                                        </div>
                                    )
                                )}

                                {dataConcern?.status === "Closed" ? (
                                    <div className="flex justify-start items-center w-[122px] font-semibold text-[13px] text-red-500 space-x-1">
                                        <p>Ticket Closed</p>
                                        {/* This message will be shown to all users */}
                                    </div>
                                ) : (
                                    dataConcern?.status !== "Closed" &&
                                    dataConcern?.status !== "Resolved" &&
                                    ALLOWED_EMPLOYEES_CRS.includes(
                                        userLoggedInEmail
                                    ) && (
                                        <div
                                            onClick={handleOpenCloseModal}
                                            className="flex justify-start w-auto font-semibold text-[13px] text-[#1A73E8] underline cursor-pointer"
                                        >
                                            Mark as closed
                                        </div>
                                    )
                                )}
                            </div>
                            <div className="">
                                <div className="">
                                    {combineThreadMessages.length > 0 ? (
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
                                        )
                                    ) : (
                                        <div className="flex flex-col gap-[20px] py-[20px] px-[30px]">
                                            {[...Array(5)].map((_, idx) => (
                                                <div
                                                    className="flex flex-col gap-[10px]"
                                                    key={idx}
                                                >
                                                    <Skeleton
                                                        height={20}
                                                        width="80%"
                                                    />
                                                    <Skeleton
                                                        height={20}
                                                        width="80%"
                                                    />
                                                    <Skeleton
                                                        height={50}
                                                        width="100%"
                                                    />
                                                </div>
                                            ))}
                                        </div>
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
                    onupdate={handleUpdate}
                />
            </div>

            <div>
                <CloseModal
                    modalRef={closeModalRef}
                    ticketId={ticketId}
                    dataRef={dataConcern}
                    onupdate={handleUpdate}
                />
            </div>

            <div>
                <ThreadInquiryFormModal
                    modalRef={modalRef2}
                    messageRef={getLatestMessageFromBuyer}
                    dataConcern={dataConcern}
                />
            </div>
        </>
    );
};

export default InquiryThread;

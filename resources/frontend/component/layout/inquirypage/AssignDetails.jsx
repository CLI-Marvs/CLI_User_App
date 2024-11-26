import React, { useEffect, useState, useRef } from "react";
import { useStateContext } from "../../../context/contextprovider";
import apiService from "../../servicesApi/apiService";
import moment from "moment";
import { BsPaperclip } from "react-icons/bs";
import FolderFile from "../../../../../public/Images/folder_file.svg";
import FolderFile2 from "../../../../../public/Images/Folder_file_light.svg";
import { VALID_FILE_EXTENSIONS } from "../../../constant/data/validFile";
import { toast } from "react-toastify";
import { showToast } from "../../../util/toastUtil";
import CircularProgress from "@mui/material/CircularProgress";

import { FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";
const AssignDetails = ({ logMessages, ticketId }) => {
    const {
        user,
        getConcernMessages,
        setConcernMessages,
        concernMessages,
        setLogs,
        logs,
        assigneesPersonnel,
        getInquiryLogs
    } = useStateContext();

    const [message, setMessage] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [attachedFiles, setAttachedFiles] = useState([]);
    const [loading, setLoading] = useState(false);


    const handleSendMessage = async () => {
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
                showToast(`.${invalidExtensions.join(
                    ", ."
                )} file type(s) are not allowed.`, "warning");
                setLoading(false);
                return;
            }

            // Show toast for oversized files if any are found
            if (oversizedFiles.length > 0) {
                showToast("File is too large. Maximum size is 100MB.", "warning");

                setLoading(false);
                return;
            }

            // If all files are valid, proceed with further processing
            setLoading(true);
        }
        console.log('atachedFiles', attachedFiles);


        if (attachedFiles && attachedFiles.length > 0) {
            attachedFiles.forEach((file) => {
                formData.append("files[]", file);
                formData.append("ftest", 'test');
            });
        }
        formData.append("sender_id", user?.id);
        formData.append("ticketId", ticketId);
        formData.append("message", message);
        formData.append("assignees", JSON.stringify(assigneesPersonnel[ticketId] || []));
        formData.append("admin_name", `${user?.firstname} ${user?.lastname}`);
        console.log('formData', formData);


        if (message.trim()) {
            try {
                // const response = await apiService.post("conversation", {
                //     sender_id: user?.id,
                //     ticketId: ticketId,
                //     message,
                //     assignees: assigneesPersonnel[ticketId],
                //     admin_name: `${user?.firstname} ${user?.lastname}`,
                //     formData
                // });

                // const response = await apiService.post("conversation", {
                //     formData,
                //     headers: {
                //         "Content-Type": "multipart/form-data",
                //     },
                // });

                const response = await apiService.post("conversation", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
                console.log("Response:", response);
                setMessage("");
                getConcernMessages();
                setAttachedFiles([]);

            } catch (error) {
                console.error("Failed to send message:", error);
            }
            finally {
                setLoading(false);
            }
        }

    };

    // console.log("assignpersonales", assigneesPersonnel[ticketId]);

    useEffect(() => {
        getInquiryLogs(ticketId)
    }, [ticketId]);

    const concernChannelFunc = (channel) => {
        channel.listen("ConcernMessages", (event) => {
            console.log("event", event);
            setConcernMessages((prevMessages) => {
                const messagesForTicket = prevMessages[ticketId] || [];
                if (
                    messagesForTicket.find(
                        (msg) => msg.id === event.data.message.id
                    )
                ) {
                    return prevMessages;
                }

                const newMessage = {
                    id: event.data.message.id,
                    message: event.data.message.message,
                    sender_id: event.data.message.sender_id,
                    firstname: event.data.firstname,
                    lastname: event.data.lastname,
                    ticketId: event.data.ticketId,
                    created_at: event.data.message.created_at,
                    attachment: event.data.message.attachment
                };

                return {
                    ...prevMessages,
                    [ticketId]: [...messagesForTicket, newMessage],
                };
            });
        });
    };

    /**
     * Select and attach files to the comment
     */

    const handleFileAttachChange = (event) => {
        const files = Array.from(event.target.files);
        setAttachedFiles((prevFiles) => {
            const prevFileNames = prevFiles.map((file) => file.name);

            // Add only unique files
            const uniqueFiles = files.filter(
                (file) => !prevFileNames.includes(file.name)
            );

            return [...prevFiles, ...uniqueFiles];
        });
        // Reset the input value so the same file can be selected again
        event.target.value = "";
    }

    /**
     * Remove a file from the comment
     * @param {string} fileNameToDelete - The name of the file to be removed
     */
    const removeFile = (fileNameToDelete) => {
        if (fileNameToDelete) {
            console.log("fileNameToDelete", fileNameToDelete);
            setAttachedFiles((prevFiles) =>
                prevFiles.filter((file) => file.name !== fileNameToDelete)
            );
        }
    };

    const adminReplyChannelFunc = (channel) => {
        channel.listen("AdminReplyLogs", (event) => {
            console.log("event reply logs data", event.data);
            setLogs((prevLogs) => {
                const prevLogsReply = prevLogs[ticketId] || [];
                if (prevLogsReply.find((log) => log.id === event.data.logId)) {
                    return prevLogs;
                }
                const newLog = event.data;
                return {
                    ...prevLogs,
                    [ticketId]: [...prevLogsReply, newLog],
                };
            });
        });
    };

    /*   useEffect(() => {
          let concernChannel;
          let adminReplyChannel;
          let newTicketId;
          if (ticketId) {
              newTicketId = ticketId.replace("#", "");
              concernChannel = window.Echo.channel(`concerns.${newTicketId}`);
              adminReplyChannel = window.Echo.channel(
                  `adminreply.${newTicketId}`
              );
              concernChannelFunc(concernChannel);
              adminReplyChannelFunc(adminReplyChannel);
          }
  
          return () => {
              if (concernChannel) {
                  concernChannel.stopListening("ConcernMessages");
                  window.Echo.leaveChannel(`concerns.${newTicketId}`);
              }
              if (adminReplyChannel) {
                  adminReplyChannel.stopListening("AdminReplyLogs");
                  window.Echo.leaveChannel(`adminreply.${newTicketId}`);
              }
          };
      }, [ticketId]); */

    useEffect(() => {
        let concernChannel;
        let adminReplyChannel;
        let newTicketId;

        // Function to ensure window.Echo is loaded before subscribing
        const initChannels = () => {
            if (ticketId && window.Echo) {
                newTicketId = ticketId.replace("#", "");
                concernChannel = window.Echo.channel(`concerns.${newTicketId}`);
                adminReplyChannel = window.Echo.channel(
                    `adminreply.${newTicketId}`
                );
                concernChannelFunc(concernChannel);
                adminReplyChannelFunc(adminReplyChannel);
            }
        };

        // Wait until the browser (Echo) is ready
        const checkBrowserReady = setInterval(() => {
            if (window.Echo) {
                initChannels();
                clearInterval(checkBrowserReady); // Stop checking once Echo is ready
            }
        }, 100); // Check every 100ms if Echo is initialized

        return () => {
            clearInterval(checkBrowserReady); // Clear interval if component unmounts

            if (concernChannel) {
                concernChannel.stopListening("ConcernMessages");
                window.Echo.leaveChannel(`concerns.${newTicketId}`);
            }
            if (adminReplyChannel) {
                adminReplyChannel.stopListening("AdminReplyLogs");
                window.Echo.leaveChannel(`adminreply.${newTicketId}`);
            }
        };
    }, [ticketId]);

    const dropdownRef = useRef(null);

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const sortedConcernMessages = concernMessages[ticketId]
        ? concernMessages[ticketId]
            .flat()
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        : [];

    const sortedLogs = logs[ticketId] || [];

    const combinedMessages = [
        ...sortedConcernMessages.map((message) => ({
            ...message,
            type: "concern",
        })),
        ...sortedLogs.map((logReply) => ({
            ...logReply,
            type: "log",
            created_at: logReply.created_at,
        })),

    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

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

    const renderDetails = (actionType, details, inquiry_createdAt) => {

        switch (actionType) {
            case "admin_reply":
                return (
                    <>
                        {/* CLI REPLY*/}
                        <div>
                            <div className="flex gap-1 items-center ">
                                <span className="flex mb-1 text-[25px] text-custom-blue">
                                    ⚬
                                </span>
                                <p className="montserrat-medium text-sm text-custom-blue">
                                    {moment(inquiry_createdAt).format(
                                        "MMMM D, YYYY"
                                    )}
                                </p>
                                <span className="montserrat-medium  text-custom-gray81">
                                    {moment(inquiry_createdAt).format(
                                        "hh:mm A"
                                    )}
                                </span>
                            </div>
                            <div>
                                <p className="montserrat-medium text-sm text-custom-solidgreen">
                                    CLI Reply
                                </p>
                            </div>
                            <div>
                                <p className="text-[#A5A5A5]">
                                    by {details.admin_name}
                                </p>
                            </div>
                            <div>
                                <p className="text-[#A5A5A5]">
                                    {details.department === "Customer Relations - Services"
                                        ? "Customer Relations - Services"
                                        : details.department}
                                </p>
                            </div>
                        </div>
                    </>
                );
            case "assign_to":
                return (
                    <>
                        <div>
                            <div className="flex gap-1 items-center ">
                                <span className="flex mb-1 text-[25px] text-custom-blue ">
                                    ⚬
                                </span>
                                <p className="montserrat-medium text-sm text-custom-blue ">
                                    {moment(inquiry_createdAt).format(
                                        "MMMM D, YYYY"
                                    )}
                                </p>
                                <span className="montserrat-medium text-custom-gray81">
                                    {moment(inquiry_createdAt).format(
                                        "hh:mm A"
                                    )}
                                </span>
                            </div>
                            <div>
                                <p className="text-custom-solidgreen">
                                    Added assignee:{" "}
                                    {capitalizeWords(
                                        details.assign_to_name.join(", ")
                                    )}
                                </p>
                            </div>
                            <div>
                                <p className="text-[#A5A5A5] mb-1">
                                    by: {details.assign_by}
                                </p>
                            </div>
                        </div>
                    </>
                );
            case "remove_to":
                return (
                    <>
                        {/* remove assignee */}
                        <div>
                            <div className="flex gap-1 items-center  ">
                                <span className="flex mb-1 text-[25px] text-custom-blue ">
                                    ⚬
                                </span>
                                <p className="montserrat-medium text-sm text-custom-blue ">
                                    {moment(inquiry_createdAt).format(
                                        "MMMM D, YYYY"
                                    )}
                                </p>
                                <span className="montserrat-medium text-custom-gray81">
                                    {moment(inquiry_createdAt).format(
                                        "hh:mm A"
                                    )}
                                </span>
                            </div>
                            <div>
                                <p className="text-custom-solidgreen mb-1">
                                    Removed assignee:{" "}
                                    {capitalizeWords(
                                        details.remove_to_name
                                    )}
                                </p>
                            </div>
                            <div>
                                <p className="text-[#A5A5A5] mb-1">
                                    by: {details.remove_by}
                                </p>
                            </div>
                        </div>
                    </>
                );
            case "inquiry_status":
                return (
                    <>
                        <div>
                            <div className="flex gap-1 items-center ">
                                <span className="flex mb-1 text-[25px] text-custom-blue ">
                                    ⚬
                                </span>
                                <p className="montserrat-medium text-sm text-custom-blue ">
                                    {moment(inquiry_createdAt).format(
                                        "MMMM D, YYYY"
                                    )}
                                </p>
                                <span className="montserrat-medium text-custom-gray81">
                                    {moment(inquiry_createdAt).format(
                                        "hh:mm A"
                                    )}
                                </span>
                            </div>
                            {details.remarks && (
                                <div className="w-full h-auto min-h-[39px] border-[2px] border-custom-grayF1 bg-white p-[10px] rounded-[10px] mb-[10px]">
                                    <p className="text-sm break-words whitespace-pre-wrap">{details.remarks}</p>
                                </div>
                            )}
                            {/* <div className="w-full h-auto min-h-[39px] border-[2px] border-custom-grayF1 bg-white p-[10px] rounded-[10px] mb-[10px]">
                                <p className="text-sm break-words whitespace-pre-wrap">{details.remarks}</p>
                            </div> */}
                            <div>
                                {details?.message_tag === 'Marked as resolved by' ? (
                                    <p className="text-custom-solidgreen mb-1">
                                        Ticket Resolved!
                                    </p>
                                ) : (
                                    <p className="text-custom-solidgreen mb-1">
                                        Ticket Closed!
                                    </p>
                                )}

                            </div>
                            <div>
                                <p className="text-[#A5A5A5] mb-1">
                                    by: {details.resolve_by}
                                </p>
                            </div>
                        </div>
                    </>
                );
            case "requestor_reply":
                return (
                    <>
                        {/* FOLLOW UP REPLY*/}

                        <div className="flex gap-1 items-center ">
                            <span className="flex mb-1 text-[25px] text-custom-blue">
                                ⚬
                            </span>
                            <p className="montserrat-medium text-sm text-custom-blue">
                                {moment(inquiry_createdAt).format(
                                    "MMMM D, YYYY"
                                )}
                            </p>
                            <span className="montserrat-medium  text-custom-gray81">
                                {moment(inquiry_createdAt).format("hh:mm A")}
                            </span>
                        </div>
                        <div>
                            <p className="montserrat-medium text-sm text-custom-solidgreen">
                                Follow up reply
                            </p>
                        </div>
                        <div>
                            <p className="text-[#A5A5A5]">
                                by {capitalizeWords(details.buyer_name)}
                            </p>
                        </div>
                    </>
                );
            case "update_info":
                return (
                    // <div></div>
                    <div className="flex flex-col  ">
                        <div className="flex gap-1 items-center  ">
                            <span className="flex mb-1 text-[25px] text-custom-blue ">
                                ⚬
                            </span>
                            <p className="montserrat-medium text-sm text-custom-blue ">
                                {moment(inquiry_createdAt).format(
                                    "MMMM D, YYYY"
                                )}
                            </p>
                            <span className="montserrat-medium text-custom-gray81">
                                {moment(inquiry_createdAt).format(
                                    "hh:mm A"
                                )}
                            </span>
                        </div>
                        <div>
                            <p className="text-custom-solidgreen ">
                                Updated Info
                            </p>
                            <p className="text-[#A5A5A5]">
                                by: {details.updated_by}
                            </p>
                        </div>
                        <div className="mt-[20px]">
                            <div className="w-full min-h-[39px] border-[2px] border-custom-grayF1 flex flex-col gap-[10px] bg-white p-[10px] rounded-[5px]">

                                {/* First name */}
                                {(details.buyer_old_data.buyer_firstname !== details.buyer_updated_data.buyer_firstname) && (
                                    <p className="text-sm text-custom-bluegreen">
                                        First Name:
                                        {details.buyer_old_data.buyer_firstname && details.buyer_old_data.buyer_firstname !== details.buyer_updated_data.buyer_firstname ? (
                                            <>
                                                <span className="text-custom-grayA5">{" "}From{" "}{"{"}</span>
                                                <span className="text-red-500">
                                                    {" "}{details.buyer_old_data.buyer_firstname}{" "}
                                                </span>
                                                <span className="text-custom-grayA5">{"}"}{" "}To{" "}{"{"}</span>
                                                <span className="text-black">
                                                    {" "}{details.buyer_updated_data.buyer_firstname}{" "}
                                                </span>
                                                <span className="text-custom-grayA5">{"}"}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-custom-grayA5">{details.buyer_old_data.buyer_firstname ? " " : " Added "}</span>
                                                <span className="text-black">
                                                    {" "}{details.buyer_updated_data.buyer_firstname}{" "}
                                                </span>
                                            </>
                                        )}
                                    </p>
                                )}

                                {/* Middle name */}
                                {(details.buyer_old_data.buyer_middlename !== details.buyer_updated_data.buyer_middlename) && (
                                    <p className="text-sm text-custom-bluegreen">
                                        Middle Name:
                                        {details.buyer_old_data.buyer_middlename && details.buyer_old_data.buyer_middlename !== details.buyer_updated_data.buyer_middlename ? (
                                            <>
                                                <span className="text-custom-grayA5">{" "}From{" "}{"{"}</span>
                                                <span className="text-red-500">
                                                    {" "}{details.buyer_old_data.buyer_middlename}{" "}
                                                </span>
                                                <span className="text-custom-grayA5">{"}"}{" "}To{" "}{"{"}</span>
                                                <span className="text-black">
                                                    {" "}{details.buyer_updated_data.buyer_middlename}{" "}
                                                </span>
                                                <span className="text-custom-grayA5">{"}"}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-custom-grayA5">{details.buyer_old_data.buyer_middlename ? " " : " Added "}</span>
                                                <span className="text-black">
                                                    {" "}{details.buyer_updated_data.buyer_middlename}{" "}
                                                </span>
                                            </>
                                        )}
                                    </p>
                                )}

                                {/* Last name */}
                                {(details.buyer_old_data.buyer_lastname !== details.buyer_updated_data.buyer_lastname) && (
                                    <p className="text-sm text-custom-bluegreen">
                                        Last Name:
                                        {details.buyer_old_data.buyer_lastname && details.buyer_old_data.buyer_lastname !== details.buyer_updated_data.buyer_lastname ? (
                                            <>
                                                <span className="text-custom-grayA5">{" "}From{" "}{"{"}</span>
                                                <span className="text-red-500">
                                                    {" "}{details.buyer_old_data.buyer_lastname}{" "}
                                                </span>
                                                <span className="text-custom-grayA5">{"}"}{" "}To{" "}{"{"}</span>
                                                <span className="text-black">
                                                    {" "}{details.buyer_updated_data.buyer_lastname}{" "}
                                                </span>
                                                <span className="text-custom-grayA5">{"}"}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-custom-grayA5">{details.buyer_old_data.buyer_lastname ? " " : " Added "}</span>
                                                <span className="text-black">
                                                    {" "}{details.buyer_updated_data.buyer_lastname}{" "}
                                                </span>
                                            </>
                                        )}
                                    </p>
                                )}

                                {/* Suffix name */}
                                {(details.buyer_old_data.suffix !== details.buyer_updated_data.suffix) && (
                                    <p className="text-sm text-custom-bluegreen">
                                        Suffix Name:
                                        {details.buyer_old_data.suffix && details.buyer_old_data.suffix !== details.buyer_updated_data.suffix ? (
                                            <>
                                                <span className="text-custom-grayA5">{" "}From{" "}{"{"}</span>
                                                <span className="text-red-500">
                                                    {" "}{details.buyer_old_data.suffix}{" "}
                                                </span>
                                                <span className="text-custom-grayA5">{"}"}{" "}To{" "}{"{"}</span>
                                                <span className="text-black">
                                                    {" "}{details.buyer_updated_data.suffix}{" "}
                                                </span>
                                                <span className="text-custom-grayA5">{"}"}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-custom-grayA5">{details.buyer_old_data.suffix ? " " : " Added "}</span>
                                                <span className="text-black">
                                                    {" "}{details.buyer_updated_data.suffix}{" "}
                                                </span>
                                            </>
                                        )}
                                    </p>
                                )}


                                {/* Email */}
                                {(details.buyer_old_data.buyer_email !== details.buyer_updated_data.buyer_email) && (
                                    <p className="text-sm text-custom-bluegreen">
                                        Email:
                                        {details.buyer_old_data.buyer_email &&
                                            details.buyer_old_data.buyer_email !== details.buyer_updated_data.buyer_email ? (
                                            <>
                                                <span className="text-custom-grayA5">{" "}From{" "}{"{"}</span>
                                                <span className="text-red-500">
                                                    {" "}{details.buyer_old_data.buyer_email}{" "}
                                                </span>
                                                <span className="text-custom-grayA5">{"}"}{" "}To{" "}{"{"}</span>
                                                <span className="text-black">
                                                    {" "}{details.buyer_updated_data.buyer_email}{" "}
                                                </span>
                                                <span className="text-custom-grayA5">{"}"}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-custom-grayA5">
                                                    {details.buyer_old_data.buyer_email ? " " : " Added "}
                                                </span>
                                                <span className="text-black">
                                                    {" "}{details.buyer_updated_data.buyer_email}{" "}
                                                </span>
                                            </>
                                        )}
                                    </p>
                                )}

                                {/* Mobile number */}
                                {(details.buyer_old_data.mobile_number !== details.buyer_updated_data.mobile_number) && (
                                    <p className="text-sm text-custom-bluegreen">
                                        Mobile No.:
                                        {details.buyer_old_data.mobile_number &&
                                            details.buyer_old_data.mobile_number !== details.buyer_updated_data.mobile_number ? (
                                            <>
                                                <span className="text-custom-grayA5">{" "}From{" "}{"{"}</span>
                                                <span className="text-red-500">
                                                    {" "}{details.buyer_old_data.mobile_number}{" "}
                                                </span>
                                                <span className="text-custom-grayA5">{"}"}{" "}To{" "}{"{"}</span>
                                                <span className="text-black">
                                                    {" "}{details.buyer_updated_data.mobile_number}{" "}
                                                </span>
                                                <span className="text-custom-grayA5">{"}"}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-custom-grayA5">
                                                    {details.buyer_old_data.mobile_number ? " " : " Added "}
                                                </span>
                                                <span className="text-black">
                                                    {" "}{details.buyer_updated_data.mobile_number}{" "}
                                                </span>
                                            </>
                                        )}
                                    </p>
                                )}

                                {/*User type*/}
                                {(details.buyer_old_data.user_type !== details.buyer_updated_data.user_type) && (
                                    <p className="text-sm text-custom-bluegreen">
                                        User Type:
                                        {details.buyer_old_data.user_type &&
                                            details.buyer_old_data.user_type !== details.buyer_updated_data.user_type ? (
                                            <>
                                                <span className="text-custom-grayA5">{" "}From{" "}{"{"}</span>
                                                <span className="text-red-500">
                                                    {" "}{details.buyer_old_data.user_type}{" "}
                                                </span>
                                                <span className="text-custom-grayA5">{"}"}{" "}To{" "}{"{"}</span>
                                                <span className="text-black">
                                                    {" "}{details.buyer_updated_data.user_type === "Others" ? details.buyer_updated_data.other_user_type : details.buyer_updated_data.user_type}{" "}
                                                </span>
                                                <span className="text-custom-grayA5">{"}"}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-custom-grayA5">
                                                    {details.buyer_old_data.user_type ? " " : " Added "}
                                                </span>
                                                <span className="text-black">
                                                    {" "}{details.buyer_updated_data.user_type === "Others" ? details.buyer_updated_data.other_user_type : details.buyer_updated_data.user_type}{" "}
                                                </span>
                                            </>
                                        )}
                                    </p>
                                )}

                                {/* Communication type */}
                                {(details.buyer_old_data.communication_type !== details.buyer_updated_data.communication_type) && (
                                    <p className="text-sm text-custom-bluegreen">
                                        Type:
                                        {details.buyer_old_data.communication_type &&
                                            details.buyer_old_data.communication_type !== details.buyer_updated_data.communication_type ? (
                                            <>
                                                <span className="text-custom-grayA5">{" "}From{" "}{"{"}</span>
                                                <span className="text-red-500">
                                                    {" "}{details.buyer_old_data.communication_type}{" "}
                                                </span>
                                                <span className="text-custom-grayA5">{"}"}{" "}To{" "}{"{"}</span>
                                                <span className="text-black">
                                                    {" "}{details.buyer_updated_data.communication_type}{" "}
                                                </span>
                                                <span className="text-custom-grayA5">{"}"}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-custom-grayA5">
                                                    {details.buyer_old_data.communication_type ? " " : " Added "}
                                                </span>
                                                <span className="text-black">
                                                    {" "}{details.buyer_updated_data.communication_type}{" "}
                                                </span>
                                            </>
                                        )}
                                    </p>
                                )}

                                {/* Channels */}
                                {(details.buyer_old_data.channels !== details.buyer_updated_data.channels) && (
                                    <p className="text-sm text-custom-bluegreen">
                                        Channels:
                                        {details.buyer_old_data.channels && details.buyer_old_data.channels !== details.buyer_updated_data.channels ? (
                                            <>
                                                <span className="text-custom-grayA5">{" "}From{" "}{"{"}</span>
                                                <span className="text-red-500">
                                                    {" "}{details.buyer_old_data.channels}{" "}
                                                </span>
                                                <span className="text-custom-grayA5">{" "}To{" "}{"{"}</span>
                                                <span className="text-black">
                                                    {" "}{details.buyer_updated_data.channels}{" "}
                                                </span>
                                                <span className="text-custom-grayA5">{" "}{"}"}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-custom-grayA5">{details.buyer_old_data.channels ? " " : " Added "}</span>
                                                <span className="text-black">
                                                    {" "}{details.buyer_updated_data.channels}{" "}
                                                </span>
                                            </>
                                        )}
                                    </p>
                                )}

                                {/* Concern regarding */}
                                {(details.buyer_old_data.details_concern !== details.buyer_updated_data.details_concern) && (
                                    <p className="text-sm text-custom-bluegreen">
                                        Concern Regarding:
                                        {details.buyer_old_data.details_concern && details.buyer_old_data.details_concern !== details.buyer_updated_data.details_concern ? (
                                            <>
                                                <span className="text-custom-grayA5">{" "}From{" "}{"{"}</span>
                                                <span className="text-red-500">
                                                    {" "}{details.buyer_old_data.details_concern}{" "}
                                                </span>
                                                <span className="text-custom-grayA5">{"}"}{" "}To{" "}{"{"}</span>
                                                <span className="text-black">
                                                    {" "}{details.buyer_updated_data.details_concern}{" "}
                                                </span>
                                                <span className="text-custom-grayA5">{"}"}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-custom-grayA5">{details.buyer_old_data.details_concern ? " " : " Added "}</span>
                                                <span className="text-black">
                                                    {" "}{details.buyer_updated_data.details_concern}{" "}
                                                </span>
                                            </>
                                        )}
                                    </p>
                                )}


                                {/* Contract number */}
                                {(details.buyer_old_data.contract_number !== details.buyer_updated_data.contract_number) && (
                                    <p className="text-sm text-custom-bluegreen">
                                        Contract No:
                                        {details.buyer_old_data.contract_number && details.buyer_old_data.contract_number !== details.buyer_updated_data.contract_number ? (
                                            <>
                                                <span className="text-custom-grayA5">{" "}From{" "}{"{"}</span>
                                                <span className="text-red-500">
                                                    {" "}{details.buyer_old_data.contract_number}{" "}
                                                </span>
                                                <span className="text-custom-grayA5">{"}"}{" "}To{" "}{"{"}</span>
                                                <span className="text-black">
                                                    {" "}{details.buyer_updated_data.contract_number}{" "}
                                                </span>
                                                <span className="text-custom-grayA5">{"}"}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-custom-grayA5">{details.buyer_old_data.contract_number ? " " : " Added "}</span>
                                                <span className="text-black">
                                                    {" "}{details.buyer_updated_data.contract_number}{" "}
                                                </span>
                                            </>
                                        )}
                                    </p>
                                )}

                                {/* Property */}
                                {(details.buyer_old_data.property !== details.buyer_updated_data.property) && (
                                    <p className="text-sm text-custom-bluegreen">
                                        Property:
                                        {details.buyer_old_data.property && details.buyer_old_data.property !== details.buyer_updated_data.property ? (
                                            <>
                                                <span className="text-custom-grayA5">{" "}From{" "}{"{"}</span>
                                                <span className="text-red-500">
                                                    {" "}{details.buyer_old_data.property}{" "}
                                                </span>
                                                <span className="text-custom-grayA5">{"}"}{" "}To{" "}{"{"}</span>
                                                <span className="text-black">
                                                    {" "}{details.buyer_updated_data.property}{" "}
                                                </span>
                                                <span className="text-custom-grayA5">{"}"}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-custom-grayA5">{details.buyer_old_data.property ? " " : " Added "}</span>
                                                <span className="text-black">
                                                    {" "}{details.buyer_updated_data.property}{" "}
                                                </span>
                                            </>
                                        )}
                                    </p>
                                )}

                                {/*Unit/Lot */}
                                {(details.buyer_old_data.unit_number !== details.buyer_updated_data.unit_number) && (
                                    <p className="text-sm text-custom-bluegreen">
                                        Unit No:
                                        {details.buyer_old_data.unit_number && details.buyer_old_data.unit_number !== details.buyer_updated_data.unit_number ? (
                                            <>
                                                <span className="text-custom-grayA5">{" "}From{" "}{"{"}</span>
                                                <span className="text-red-500">
                                                    {" "}{details.buyer_old_data.unit_number}{" "}
                                                </span>
                                                <span className="text-custom-grayA5">{"}"}{" "}To{" "}{"{"}</span>
                                                <span className="text-black">
                                                    {" "}{details.buyer_updated_data.unit_number}{" "}
                                                </span>
                                                <span className="text-custom-grayA5">{"}"}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-custom-grayA5">{details.buyer_old_data.unit_number ? " " : " Added "}</span>
                                                <span className="text-black">
                                                    {" "}{details.buyer_updated_data.unit_number}{" "}
                                                </span>
                                            </>
                                        )}
                                    </p>
                                )}

                                {/* Remarks */}
                                {(details.buyer_old_data.admin_remarks !== details.buyer_updated_data.admin_remarks) && (
                                    <p className="text-sm text-custom-bluegreen">
                                        Remarks:
                                        {details.buyer_old_data.admin_remarks && details.buyer_old_data.admin_remarks !== details.buyer_updated_data.admin_remarks ? (
                                            <>
                                                <span className="text-custom-grayA5">{" "}From{" "}{"{"}</span>
                                                <span className="text-red-500">
                                                    {" "}{details.buyer_old_data.admin_remarks}{" "}
                                                </span>
                                                <span className="text-custom-grayA5">{"}"}{" "}To{" "}{"{"}</span>
                                                <span className="text-black">
                                                    {" "}{details.buyer_updated_data.admin_remarks}{" "}
                                                </span>
                                                <span className="text-custom-grayA5">{"}"}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-custom-grayA5">{details.buyer_old_data.admin_remarks ? " " : " Added "}</span>
                                                <span className="text-black">
                                                    {" "}{details.buyer_updated_data.admin_remarks}{" "}
                                                </span>
                                            </>
                                        )}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )
            default:
                return <p>Unknown log type</p>;
        }
    };

    return (
        <>

            <div className="px-[20px] mt-[16px]">
                <div className="flex h-[49px] w-full gradient-btn2 p-[2px] rounded-[10px] items-center justify-center  ">
                    <div className="relative gap-[10px] w-full h-full flex items-center bg-white rounded-[8px] p-[10px] ">
                        <input
                            type="text"
                            className="w-full outline-none"
                            onChange={(e) => setMessage(e.target.value)}
                            maxLength={255}
                            value={message}
                        />
                        <div
                            className="relative w-auto flex gap-[10px]"
                            ref={dropdownRef}
                        >
                            <div className="flex items-center">
                                <input
                                    type="file"
                                    id="commentFileInput"
                                    multiple
                                    style={{ display: "none" }}
                                    onChange={handleFileAttachChange}
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        document
                                            .getElementById("commentFileInput")
                                            .click()
                                    }
                                >
                                    <BsPaperclip className="h-5 w-5 text-custom-solidgreen hover:text-gray-700" />
                                </button>
                            </div>

                            <button
                                onClick={() =>
                                    attachedFiles?.length > 0 &&
                                    setIsOpen(!isOpen)
                                }
                                className=" flex justify-center items-center rounded-full bg-custom-bluegreen size-[24px]"
                            >
                                <p className="text-sm text-white">
                                    {attachedFiles && attachedFiles.length}
                                </p>
                            </button>
                            {isOpen && attachedFiles?.length > 0 && (
                                <div className="absolute right-0 top-full mt-2 w-[331px] h-auto p-[30px] bg-white text-xs rounded-[10px] shadow-custom4 z-10">
                                    {attachedFiles &&
                                        attachedFiles.map((item, index) => {
                                            const fileName = item?.name;
                                            if (!fileName) {
                                                // If fileName is undefined or null, return a fallback UI or nothing
                                                return null;
                                            }
                                            const fileType = fileName
                                                .split(".")
                                                .pop(); // Get the file extension
                                            const baseName = fileName.substring(
                                                0,
                                                fileName.lastIndexOf(".")
                                            );
                                            const truncatedName =
                                                baseName.length > 15
                                                    ? `${baseName.slice(
                                                        0,
                                                        15
                                                    )}...`
                                                    : baseName;
                                            return (
                                                <div
                                                    className="flex flex-col gap-[6px]"
                                                    key={index}
                                                >
                                                    <div className="flex items-center gap-[6px]">
                                                        <button className="flex items-center gap-2 w-full h-[38px] px-[10px] py-[6px] bg-custom-grayF1 rounded-[4px]">
                                                            <img
                                                                src={FolderFile}
                                                                alt="folder"
                                                            />
                                                            <p>
                                                                {truncatedName}.
                                                                {fileType}
                                                            </p>
                                                        </button>
                                                        <button
                                                            className="flex justify-center items-centersize-[24px]"
                                                            onClick={() =>
                                                                removeFile(
                                                                    item.name
                                                                )
                                                            }
                                                        >
                                                            <FaTrash className="text-[#EB4444] hover:text-red-600 cursor-pointer text-[20px]" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            )}
                        </div>

                        <button
                            disabled={loading}
                            className={`shrink-0 w-[76px] h-[28px] rounded-[10px] text-xs text-white 
                            ${!message.trim()
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "gradient-btn2"
                                }  
                             ${loading ? "cursor-not-allowed" : ""}`}
                            onClick={handleSendMessage}
                        >
                            {/* Comment */}
                            {loading ? (
                                <CircularProgress className="spinnerSize " />
                            ) : (
                                <>
                                    Comment

                                </>
                            )}
                        </button>
                    </div>
                </div>
                <div className="flex justify-end">
                    <p className="text-sm my-1 text-custom-gray81">
                        {message.length}/255 characters
                    </p>
                </div>
            </div>
            <div className="border border-t-1 border-custom-lightestgreen"></div>
            <div className="w-full  mt-[12px] flex flex-col">
                {combinedMessages && combinedMessages.length > 0 ? (
                    combinedMessages.map((item, index) => {
                        const attachments = item.attachment
                            ? JSON.parse(item.attachment)
                            : [];
                        // console.log("attachments", attachments);
                        const alternatingBackground =
                            index % 2 === 0 ? "bg-white" : "bg-custom-grayF1";
                        if (item.type === "concern") {
                            const formattedDate = moment(
                                item.created_at
                            ).format("MMMM D, YYYY");
                            const formattedTime = moment(
                                item.created_at
                            ).format("hh:mm A");

                            return (
                                <div
                                    className={`flex flex-col gap-[20px] py-[20px] px-[30px] ${alternatingBackground}`}
                                    key={index}
                                >
                                    <div className="flex gap-[10px] text-sm montserrat-medium items-center">
                                        <div className="flex gap-1 items-center">
                                            <span className="flex mb-1 text-[25px] text-custom-blue ">
                                                ⚬
                                            </span>
                                            <p className="montserrat-medium text-sm text-custom-blue">
                                                {formattedDate}
                                            </p>
                                            <span className="montserrat-medium text-custom-gray81">
                                                {formattedTime}
                                            </span>
                                            <span className="text-custom-bluegreen">
                                                |
                                            </span>
                                            <p className="montserrat-bold text-custom-bluegreen">
                                                {item.firstname} {item.lastname}
                                            </p>
                                        </div>
                                    </div>
                                    <div className=" w-full min-h-[39px] border-[2px] border-custom-grayF1 bg-white p-[10px] rounded-[10px]">
                                        <p className="text-sm break-words whitespace-pre-wrap">
                                            {item.message}
                                        </p>
                                    </div>

                                    {attachments &&
                                        attachments.map((attachment, index) => {
                                            const fileName =
                                                attachment?.original_file_name;
                                            if (!fileName) {
                                                // If fileName is undefined or null, return a fallback UI or nothing
                                                return null;
                                            }
                                            const fileType = fileName
                                                .split(".")
                                                .pop(); // Get the file extension
                                            const baseName = fileName.substring(
                                                0,
                                                fileName.lastIndexOf(".")
                                            );

                                            // Truncate the base name to 15 characters
                                            const truncatedName =
                                                baseName.length > 15
                                                    ? `${baseName.slice(
                                                        0,
                                                        15
                                                    )}...`
                                                    : baseName;

                                            return (
                                                <div
                                                    className="flex flex-col gap-[5px]"
                                                    key={index}
                                                >
                                                    <Link
                                                        to={`/file-viewer/attachment/${item.id}`}
                                                        onClick={(e) => {
                                                            e.preventDefault(); // Prevent immediate navigation
                                                            localStorage.setItem(
                                                                "fileUrlPath",
                                                                JSON.stringify(
                                                                    attachment.url
                                                                )
                                                            );
                                                            window.open(
                                                                `/file-viewer/attachment/${item.id}`,
                                                                "_blank"
                                                            );
                                                        }}
                                                    >
                                                        <button className="w-[218px] h-[42px] rounded-[7px] gradient-btn2 px-[20px] py-[8px] flex items-center justify-start text-white gap-2">
                                                            <img
                                                                src={
                                                                    FolderFile2
                                                                }
                                                                alt="View Attachment"
                                                            />
                                                            <span className="text-xs">
                                                                {truncatedName}.
                                                                {fileType}
                                                            </span>
                                                        </button>
                                                    </Link>
                                                </div>
                                            );
                                        })}
                                </div>
                            );
                        } else if (item.type === "log") {
                            let logData = {};
                            if (item.admin_reply) {
                                logData = JSON.parse(item.admin_reply);
                            } else if (item.requestor_reply) {
                                logData = JSON.parse(item.requestor_reply);
                            } else if (item.assign_to) {
                                logData = JSON.parse(item.assign_to);
                            } else if (item.inquiry_status) {
                                logData = JSON.parse(item.inquiry_status);
                            } else if (item.removed_assignee) {
                                logData = JSON.parse(item.removed_assignee);
                            } else if (item.edited_by) {
                                logData = JSON.parse(item.edited_by);
                            }

                            const logType = logData.log_type || "unknown";
                            const details = logData.details || {};

                            if (logType !== "unknown") {
                                return (
                                    <>
                                        <div
                                            className={`flex flex-col gap-[10px] py-[20px] px-[30px] ${alternatingBackground}`}
                                            key={index}
                                        >
                                            {renderDetails(
                                                logType,
                                                details,
                                                item.created_at
                                            )}
                                        </div>
                                    </>
                                );
                            }
                        }
                        return null;
                    })
                ) : (
                    <div></div>
                )}
            </div>
        </>
    );
};

export default AssignDetails;

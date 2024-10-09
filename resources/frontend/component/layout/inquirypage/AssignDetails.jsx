import React, { useEffect, useState } from "react";
import { useStateContext } from "../../../context/contextprovider";
import apiService from "../../servicesApi/apiService";
import moment from "moment";

const AssignDetails = ({ logMessages, ticketId }) => {
    const {
        user,
        getConcernMessages,
        setConcernMessages,
        concernMessages,
        setLogs,
        logs,
    } = useStateContext();
    const [message, setMessage] = useState("");

    const handleSendMessage = async () => {
        if (message.trim()) {
            try {
                const response = await apiService.post("conversation", {
                    sender_id: user?.id,
                    ticketId: ticketId,
                    message,
                });

                setMessage("");
                getConcernMessages();
            } catch (error) {
                console.error("Failed to send message:", error);
            }
        }
    };

    const concernChannelFunc = (channel) => {
        channel.listen("ConcernMessages", (event) => {
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
                };

                return {
                    ...prevMessages,
                    [ticketId]: [...messagesForTicket, newMessage],
                };
            });
        });
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

    useEffect(() => {
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
    }, [ticketId]);

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
        return name
            .split(" ")
            .map(
                (word) =>
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            )
            .join(" ");
    };

    const renderDetails = (actionType, details, inquiry_createdAt) => {
        switch (actionType) {
            case "admin_reply":
                return (
                    <>
                        {/* CLI REPLY*/}
                        <div className="flex flex-col text-sm montserrat-medium mb-[20px]">
                            <div className="flex gap-1 items-center mb-[20px]">
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
                                <div className="border-b flex-grow border-custom-bluegreen pl-[10px]"></div>
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
                                    {details.department === "CRS"
                                        ? "Customer Relations Services"
                                        : details.department}
                                </p>
                            </div>
                        </div>

                     
                      
                    </>
                   
                );
            case "assign_to":
                return (
                    <>
                        <div className="flex flex-col text-sm montserrat-medium">
                            <div className="flex gap-1 items-center mb-[20px]">
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
                                <div className="border-b flex-grow border-custom-bluegreen"></div>
                            </div>
                            <div>
                                <p className="text-custom-solidgreen mb-1">
                                    Added assignee:{" "}
                                    {details.assign_to_name.join(", ")}
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
                case "inquiry_status":
                    return (
                        <>
                          <div className="flex flex-col text-sm montserrat-medium">
                            <div className="flex gap-1 items-center mb-[20px]">
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
                                <div className="border-b flex-grow border-custom-bluegreen"></div>
                            </div>
                            <div>
                                <p className="text-custom-solidgreen mb-1">
                                    Ticket Resolved!
                                </p>
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

                        <div className="flex flex-col text-sm montserrat-medium mb-[20px]">
                            <div className="flex gap-1 items-center mb-[20px]">
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
                                <div className="border-b flex-grow border-custom-bluegreen pl-[10px]"></div>
                            </div>
                            <div>
                                <p className="montserrat-medium text-sm text-custom-solidgreen">
                                    Follow up reply
                                </p>
                            </div>
                            <div>
                                <p className="text-[#A5A5A5]">
                                    by {details.buyer_name}
                                </p>
                            </div>
                        </div>
                        </>
                    )
            default:
                return <p>Unknown log type</p>;
        }
    };

    return (
        <>
            <div className="flex h-[49px] w-full gradient-btn2 p-[2px] rounded-[10px] items-center justify-center my-[16px]">
                <div className="w-full h-full flex items-center bg-white rounded-[8px] p-[10px]">
                    <input
                        type="text"
                        className="w-full outline-none"
                        onChange={(e) => setMessage(e.target.value)}
                        value={message}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault(); // Prevent default behavior (like submitting a form)
                                handleSendMessage(); // Call the send message function
                            }
                        }}
                    />
                    <button
                        className={`w-[76px] h-[28px] rounded-[10px] text-xs text-white 
                            ${!message.trim() 
                                ? 'bg-gray-400 cursor-not-allowed' // Gray out when input is empty
                                : 'gradient-btn2'} 
                            `}
                        onClick={handleSendMessage}
                        
                    >
                        Comment
                    </button>
                </div>
            </div>
            <div className="border border-t-1 border-custom-lightestgreen"></div>

            <div className="w-full p-[10px] mt-[12px] flex flex-col gap-[10px]">
                {combinedMessages && combinedMessages.length > 0 ? (
                    combinedMessages.map((item, index) => {
                        if (item.type === "concern") {
                            const formattedDate = moment(
                                item.created_at
                            ).format("MMMM D, YYYY");
                            const formattedTime = moment(
                                item.created_at
                            ).format("hh:mm A");

                            return (
                                <div
                                    className="flex flex-col gap-[10px] mb-[20px]"
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
                                        <div className="border-b flex-grow border-custom-bluegreen"></div>
                                    </div>
                                    <div className="w-full min-h-[39px] border-[2px] border-custom-grayF1 p-[10px] rounded-[10px]">
                                        <p className="text-sm">
                                            {item.message}
                                        </p>
                                    </div>
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
                            }

                            const logType = logData.log_type || "unknown";
                            const details = logData.details || {};

                            if (logType !== "unknown") {
                                return (
                                    <>
                                        {renderDetails(
                                            logType,
                                            details,
                                            item.created_at
                                        )}
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

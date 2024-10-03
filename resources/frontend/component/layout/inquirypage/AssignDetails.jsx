import React, { useEffect, useState } from "react";
import { useStateContext } from "../../../context/contextprovider";
import apiService from "../../servicesApi/apiService";

const AssignDetails = ({ logMessages, ticketId }) => {
    const { user, getConcernMessages, setConcernMessages, concernMessages } = useStateContext();
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
    useEffect(() => {
        let channel; 
        let newTicketId;
        if (ticketId) {
            newTicketId = ticketId.replace('#', '');
            channel = window.Echo.channel(`concerns.${newTicketId}`);
            console.log("Channel created:", channel);
    
            channel.listen("ConcernMessages", (event) => {
                console.log("event", event);
                setConcernMessages((prevMessages) => {
                    console.log("prevMessages", prevMessages);

                    const messagesForTicket = prevMessages[ticketId] || [];
                    if (messagesForTicket.find((msg) => msg.id === event.data.message.id)) {
                        return prevMessages;
                    }
                  /*   return [
                        ...prevMessages,
                        {
                            id: event.data.message.id,
                            message: event.data.message.message,
                            sender_id: event.data.message.sender_id,
                            firstname: event.data.firstname,
                            lastname: event.data.lastname,
                            concernId: event.data.concernId,
                            created_at: event.data.message.created_at,
                        },
                    ]; */

    //                 const newMessage = {
    //                     id: event.data.message.id,
    //                     message: event.data.message.message,
    //                     sender_id: event.data.message.sender_id,
    //                     firstname: event.data.firstname,
    //                     lastname: event.data.lastname,
    //                     ticketId: event.data.ticketId,
    //                     created_at: event.data.message.created_at,
    //                 };

                    return {
                        ...prevMessages,
                        [ticketId]: [...messagesForTicket, newMessage].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)),
                    };
                });
            });
        }
    
        return () => {
            if (channel) {
                channel.stopListening("ConcernMessages"); 
                window.Echo.leaveChannel(`concerns.${newTicketId}`); 
            }
        };
    }, [ticketId]);

    return (
        <>
       {concernMessages[ticketId] && concernMessages[ticketId].length > 0 ? (
            concernMessages[ticketId].map((item, index) => (
                <div key={index}>{item.message}</div> 
            ))
        ) : (
            <div>No messages available.</div> 
        )}
            <div className="flex h-[49px] w-full gradient-btn2 p-[2px] rounded-[10px] items-center justify-center my-[16px]">
                <div className="w-full h-full flex items-center bg-white rounded-[8px] p-[10px]">
                    <input type="text" className="w-full outline-none" onChange={(e) => setMessage(e.target.value)} value={message} />
                    <button className="w-[76px] h-[28px] gradient-btn2 rounded-[10px] text-xs text-white" onClick={handleSendMessage}>
                        Comment
                    </button>
                </div>
            </div>
            <div className="border border-t-1 border-custom-lightestgreen"></div>

            <div className="w-full p-[10px] mt-[12px] flex flex-col gap-[10px]">
                <div className="flex flex-col gap-[10px]">
                    <div className="flex gap-[10px] text-sm montserrat-medium items-center">
                        <div className="flex gap-1 items-center">
                            <span className="flex mb-1 text-[25px] text-custom-gray81">⚬</span>
                            <p className="montserrat-medium text-sm text-custom-gray81">
                                September 10, 2024
                            </p>
                            <span className="montserrat-medium text-custom-blue">09:15 AM</span>
                            <span className="text-custom-bluegreen">|</span>
                            <p className="montserrat-bold text-custom-bluegreen">Jannet Doe</p>
                        </div>
                        <div className="border-b flex-grow"></div>
                    </div>
                    <div className="w-full min-h-[39px] border-[2px] border-custom-grayF1 p-[10px] rounded-[10px]">
                        <p className="text-sm">
                            Hi Jack, I added you in this inquiry, maybe you can
                            provide info.
                        </p>
                    </div>
                </div>
                <div className="flex flex-col gap-[10px]">
                    <div className="flex gap-[10px] text-sm montserrat-medium items-center">
                        <div className="flex gap-1 items-center">
                            <span className="flex mb-1 text-[25px] text-custom-gray81">⚬</span>
                            <p className="montserrat-medium text-sm text-custom-gray81">
                                September 10, 2024
                            </p>
                            <span className="montserrat-medium text-custom-blue">09:00 AM</span>
                            <span className="text-custom-bluegreen">|</span>
                            <p className="montserrat-bold text-custom-bluegreen">Jannet Doe</p>
                        </div>
                        <div className="border-b flex-grow"></div>
                    </div>
                    <div className="w-full">
                        <p className="montserrat-medium text-sm text-custom-solidgreen">
                            Added assignee: Jack Doe
                        </p>
                    </div>
                </div>
                <div className="flex flex-col text-sm montserrat-medium">
                    <div className="flex gap-1 items-center">
                            <span className="flex mb-1 text-[25px] text-custom-gray81">⚬</span>
                            <p className="montserrat-medium text-sm text-custom-gray81">
                                September 6, 2024
                            </p>
                            <span className="montserrat-medium text-custom-blue">10:00 AM</span>
                            <span className="text-custom-lightgreen">|</span>
                            <p className="montserrat-medium text-sm text-custom-lightgreen">Follow up reply</p>
                        </div>
                    <div>
                        <p className="text-custom-solidgreen">by Jack Doe</p>
                    </div>
                    <div>
                        <p className="text-custom-solidgreen">
                            Customer Relations Services
                        </p>
                    </div>
                </div>
                <div className="flex flex-col text-sm montserrat-medium">
                    <div className="flex gap-1 items-center">
                            <span className="flex mb-1 text-[25px] text-custom-gray81">⚬</span>
                            <p className="montserrat-medium text-sm text-custom-gray81">
                                September 6, 2024
                            </p>
                            <span className="montserrat-medium text-custom-blue">08:00 AM</span>
                            <span className="text-custom-lightgreen">|</span>
                            <p className="montserrat-medium text-sm text-custom-lightgreen">CLI Reply</p>
                        </div>
                    <div>
                        <p className="text-custom-solidgreen">by Jannet Doe</p>
                    </div>
                    <div>
                        <p className="text-custom-solidgreen">
                            Customer Relations Services
                        </p>
                    </div>
                </div>
                <div className="flex flex-col text-sm montserrat-medium">
                    <div className="flex gap-1 items-center">
                            <span className="flex mb-1 text-[25px] text-custom-gray81">⚬</span>
                            <p className="montserrat-medium text-sm text-custom-gray81">
                                September 6, 2024
                            </p>
                            <span className="montserrat-medium text-custom-blue">08:00 AM</span>
                            <span className="text-custom-lightgreen">|</span>
                            <p className="montserrat-medium text-sm text-custom-lightgreen">CLI Reply</p>
                        </div>
                    <div>
                        <p className="text-custom-solidgreen">by Jannet Doe</p>
                    </div>
                    <div>
                        <p className="text-custom-solidgreen">
                            Customer Relations Services
                        </p>
                    </div>
                </div>
                <div className="flex flex-col text-sm montserrat-medium">
                    <div className="flex gap-1 items-center">
                            <span className="flex mb-1 text-[25px] text-custom-gray81">⚬</span>
                            <p className="montserrat-medium text-sm text-custom-gray81">
                                September 6, 2024
                            </p>
                            <span className="montserrat-medium text-custom-blue">08:00 AM</span>
                            <span className="text-custom-lightgreen">|</span>
                            <p className="montserrat-medium text-sm text-custom-lightgreen">CLI Reply</p>
                        </div>
                    <div>
                        <p className="text-custom-solidgreen">by Jannet Doe</p>
                    </div>
                    <div>
                        <p className="text-custom-solidgreen">
                            Customer Relations Services
                        </p>
                    </div>
                </div>
                <div className="flex flex-col text-sm montserrat-medium">
                    <div className="flex gap-1 items-center">
                            <span className="flex mb-1 text-[25px] text-custom-gray81">⚬</span>
                            <p className="montserrat-medium text-sm text-custom-gray81">
                                September 6, 2024
                            </p>
                            <span className="montserrat-medium text-custom-blue">08:00 AM</span>
                            <span className="text-custom-lightgreen">|</span>
                            <p className="montserrat-medium text-sm text-custom-lightgreen">CLI Reply</p>
                        </div>
                    <div>
                        <p className="text-custom-solidgreen">by Jannet Doe</p>
                    </div>
                    <div>
                        <p className="text-custom-solidgreen">
                            Customer Relations Services
                        </p>
                    </div>
                </div>

                <div className="flex flex-col text-sm montserrat-medium">
                    <div className="flex gap-1 items-center">
                            <span className="flex mb-1 text-[25px] text-custom-gray81">⚬</span>
                            <p className="montserrat-medium text-sm text-custom-gray81">
                                September 6, 2024
                            </p>
                            <span className="montserrat-medium text-custom-blue">08:00 AM</span>
                            <span className="text-custom-lightgreen">|</span>
                            <p className="montserrat-medium text-sm text-custom-lightgreen">CLI Reply</p>
                        </div>
                    <div>
                        <p className="text-custom-solidgreen">by Jannet Doe</p>
                    </div>
                    <div>
                        <p className="text-custom-solidgreen">
                            Customer Relations Services
                        </p>
                    </div>
                </div>
                <div className="flex flex-col text-sm montserrat-medium">
                    <div className="flex gap-1 items-center">
                            <span className="flex mb-1 text-[25px] text-custom-gray81">⚬</span>
                            <p className="montserrat-medium text-sm text-custom-gray81">
                                September 6, 2024
                            </p>
                            <span className="montserrat-medium text-custom-blue">08:00 AM</span>
                            <span className="text-custom-lightgreen">|</span>
                            <p className="montserrat-medium text-sm text-custom-lightgreen">CLI Reply</p>
                        </div>
                    <div>
                        <p className="text-custom-solidgreen">by Jannet Doe</p>
                    </div>
                    <div>
                        <p className="text-custom-solidgreen">
                            Customer Relations Services
                        </p>
                    </div>
                </div>
                <div className="flex flex-col text-sm montserrat-medium">
                    <div className="flex gap-1 items-center">
                            <span className="flex mb-1 text-[25px] text-custom-gray81">⚬</span>
                            <p className="montserrat-medium text-sm text-custom-gray81">
                                September 6, 2024
                            </p>
                            <span className="montserrat-medium text-custom-blue">08:00 AM</span>
                            <span className="text-custom-lightgreen">|</span>
                            <p className="montserrat-medium text-sm text-custom-lightgreen">CLI Reply</p>
                        </div>
                    <div>
                        <p className="text-custom-solidgreen">by Jannet Doe</p>
                    </div>
                    <div>
                        <p className="text-custom-solidgreen">
                            Customer Relations Services
                        </p>
                    </div>
                </div>
                <div className="flex flex-col text-sm montserrat-medium">
                    <div className="flex gap-1 items-center">
                            <span className="flex mb-1 text-[25px] text-custom-gray81">⚬</span>
                            <p className="montserrat-medium text-sm text-custom-gray81">
                                September 6, 2024
                            </p>
                            <span className="montserrat-medium text-custom-blue">08:00 AM</span>
                            <span className="text-custom-lightgreen">|</span>
                            <p className="montserrat-medium text-sm text-custom-lightgreen">CLI Reply</p>
                        </div>
                    <div>
                        <p className="text-custom-solidgreen">by Jannet Doe</p>
                    </div>
                    <div>
                        <p className="text-custom-solidgreen">
                            Customer Relations Services
                        </p>
                    </div>
                </div>
                <div className="flex flex-col text-sm montserrat-medium">
                    <div className="flex gap-1 items-center">
                            <span className="flex mb-1 text-[25px] text-custom-gray81">⚬</span>
                            <p className="montserrat-medium text-sm text-custom-gray81">
                                September 6, 2024
                            </p>
                            <span className="montserrat-medium text-custom-blue">08:00 AM</span>
                            <span className="text-custom-lightgreen">|</span>
                            <p className="montserrat-medium text-sm text-custom-lightgreen">CLI Reply</p>
                        </div>
                    <div>
                        <p className="text-custom-solidgreen">by Jannet Doe</p>
                    </div>
                    <div>
                        <p className="text-custom-solidgreen">
                            Customer Relations Services
                        </p>
                    </div>
                </div>
                <div className="flex flex-col text-sm montserrat-medium">
                    <div className="flex gap-1 items-center">
                            <span className="flex mb-1 text-[25px] text-custom-gray81">⚬</span>
                            <p className="montserrat-medium text-sm text-custom-gray81">
                                September 6, 2024
                            </p>
                            <span className="montserrat-medium text-custom-blue">08:00 AM</span>
                            <span className="text-custom-lightgreen">|</span>
                            <p className="montserrat-medium text-sm text-custom-lightgreen">CLI Reply</p>
                        </div>
                    <div>
                        <p className="text-custom-solidgreen">by Jannet Doe</p>
                    </div>
                    <div>
                        <p className="text-custom-solidgreen">
                            Customer Relations Services
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AssignDetails;

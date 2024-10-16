import React, { useEffect, useRef, useState } from "react";
import ConcernSelector from "./ConcernSelector";
import { useStateContext } from "../../../context/contextprovider";
import Messages from "./Messages";
import apiService from "../../servicesApi/apiService";
import Message from "./Messages";

const MainComponent = () => {
    // const {
    //     data,
    //     user,
    //     concernId,
    //     setConcernId,
    //     concernMessages,
    //     getConcernMessages,
    //     setConcernMessages,
    // } = useStateContext();
    // const [concernIdList, setConcernIdList] = useState([]);
    // const [message, setMessage] = useState("");

    // const messagesEndRef = useRef(null)

    // useEffect(() => {
    //     const concernIds = data.map((item) => item.id);
    //     setConcernIdList(concernIds);
    // }, [data]);

    // const handleSendMessage = async () => {
    //     if (message.trim()) {
    //         try {
    //             const response = await apiService.post("conversation", {
    //                 sender_id: user?.id,
    //                 concern_id: concernId,
    //                 message,
    //             });

    //             setMessage("");
    //             getConcernMessages();

    //         } catch (error) {
    //             console.error("Failed to send message:", error);
    //         }
    //     }
    // };
    // useEffect(() => {
    //     let channel; 
    
    //     if (concernId) {
    //         channel = window.Echo.channel(`concerns.${concernId}`);
    //         console.log("Channel created:", channel);
    
    //         channel.listen("SampleEvent", (event) => {
    //             console.log("event", event);
    //             setConcernMessages((prevMessages) => {
    //                 if (prevMessages.find((msg) => msg.id === event.data.message.id)) {
    //                     return prevMessages;
    //                 }
    //               /*   return [
    //                     ...prevMessages,
    //                     {
    //                         id: event.data.message.id,
    //                         message: event.data.message.message,
    //                         sender_id: event.data.message.sender_id,
    //                         firstname: event.data.firstname,
    //                         lastname: event.data.lastname,
    //                         concernId: event.data.concernId,
    //                         created_at: event.data.message.created_at,
    //                     },
    //                 ]; */

    //                 const newMessage = {
    //                     id: event.data.message.id,
    //                     message: event.data.message.message,
    //                     sender_id: event.data.message.sender_id,
    //                     firstname: event.data.firstname,
    //                     lastname: event.data.lastname,
    //                     concernId: event.data.concernId,
    //                     created_at: event.data.message.created_at,
    //                 };

    //                 return [...prevMessages, newMessage].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    //             });
    //         });
    //     }
    
    //     return () => {
    //         if (channel) {
    //             channel.stopListening("SampleEvent"); 
    //             window.Echo.leaveChannel(`concerns.${concernId}`); 
    //         }
    //     };
    // }, [concernId]);

    // useEffect(() => {
    //     if (messagesEndRef.current) {
    //         messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    //     }
    // }, [concernMessages]);
    
    // console.log("concernMessages", concernMessages);

    return (
        <div></div>
        // <div className="h-screen flex flex-col bg-gray-50">
        //     <div className="p-4 bg-white shadow-md">
        //         <ConcernSelector
        //             concernIdList={concernIdList}
        //             concernId={concernId}
        //             setConcernId={setConcernId}
        //         />
        //     </div>

        //     {concernId ? (
        //         <div className="flex-1 overflow-y-auto p-5 space-y-4">
        //             {concernMessages.length ? (
        //                 concernMessages.map((msg, index) => (
        //                     <Message
        //                         key={index}
        //                         message={msg.message}
        //                         sender={`${msg.firstname} ${msg.lastname}`}
        //                         timestamp={msg.created_at}
        //                         isOwnMessage={msg.sender_id === user?.id}
        //                     />
        //                 ))
        //             ) : (
        //                 <p className="text-center text-gray-500">
        //                     No messages yet for this group.
        //                 </p>
        //             )}
        //         </div>
        //     ) : (
        //         <p className="text-center text-gray-500 mt-10">
        //             Please select a group to start chatting.
        //         </p>
        //     )}

        //     {concernId && (
        //         <div className="p-4 bg-white shadow-md flex space-x-3">
        //             <input
        //                 type="text"
        //                 className="w-full p-3 rounded-lg border border-gray-300 focus:ring focus:ring-blue-400"
        //                 placeholder={`Send a message to ${concernId}...`}
        //                 onChange={(e) => setMessage(e.target.value)}
        //                 value={message}
        //             />
        //             <button
        //                 className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        //                 onClick={handleSendMessage}
        //             >
        //                 Send
        //             </button>
        //         </div>
        //     )}
        // </div>
    );
};

export default MainComponent;

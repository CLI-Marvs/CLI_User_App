import React, { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { useStateContext } from "../../../context/contextprovider";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import apiService from "../../servicesApi/apiService";

const Notification = () => {
    const {
        notifications,
        notifPageCount,
        notifCurrentPage,
        setNotifCurrentPage,
        getMessages,
        getAllConcerns,
        getNotifications,
        setNotifStatus
    } = useStateContext();
    const [activeButton, setActiveButton] = useState("All");

    const handleClick = (button) => {
        setNotifStatus(button);
        setNotifCurrentPage(0);
        setActiveButton((prev) => (prev === button ? null : button));
        
    };

    const navigate = useNavigate();
    const handlePageClick = (data) => {
        const selectedPage = data.selected;
        setNotifCurrentPage(selectedPage);
    };


   /*  const handleRefresh = () => {
        setNotifStatus("");
        getNotifications();
    }; */
    const buttonLabels = ["All", "Unread", "Read"];

    const navigateToThread = (items) => {
        const ticketId = items.ticket_id;
        const encodedTicketId = encodeURIComponent(ticketId);
        getNotifications();
        getMessages(ticketId);
        getAllConcerns();
        navigate(`/inquirymanagement/thread/${encodedTicketId}`);
        updateIsReadStatus(items.ticket_id);
    };

    const updateIsReadStatus = (ticketId) => {
        try {
            const response = apiService.post('isread', {
                ticketId: ticketId
            })
            console.log("updated successfully");
        } catch (error) {
            console.log("error updating status", error);
        }
    };

    useEffect(() => {
        getNotifications();
    }, []);
    return (
        <div className="h-screen bg-custom-grayFA">
            <div className="bg-custom-grayFA px-5">
                <div className="h-[63px] bg-white rounded-t-[10px] px-4 flex justify-start items-center gap-4">
                    <div>
                        <p className="montserrat-medium text-custom-bluegreen">
                            Notifications
                        </p>
                    </div>
                    <div className="flex space-x-2">
                        {buttonLabels.map((label) => (
                            <button
                                key={label}
                                onClick={() => handleClick(label)}
                                className={`flex items-center border montserrat-semibold border-custom-lightgreen h-[24px] px-3 rounded-[50px] text-[13px] ${
                                    activeButton === label
                                        ? "bg-custom-lightgreen text-white"
                                        : "text-custom-lightgreen"
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                       {/*  <span onClick={handleRefresh}>Refresh</span> */}
                    </div>
                </div>
                <div>
                    <table className="flex flex-col gap-1 w-full ">
                        <tbody>
                            {/* UNREAD */}
                            {notifications.length > 0 &&
                                notifications.map((item, index) => (
                                    <tr
                                        onClick={() => navigateToThread(item)}
                                        className={`flex items-center h-[47px] cursor-pointer my-1 ${item.isRead ? 'bg-custom-grayF1' : 'bg-white'} hover:shadow-custom4`}
                                        key={index}
                                    >
                                        <td className="w-[228px] shrink-0 h-full px-4">
                                            <div className="h-full flex flex-col justify-center">
                                                <p className="montserrat-medium text-[13px] text-custom-bluegreen">
                                                    {item.buyer_name}
                                                </p>
                                                <p className="text-xs text-custom-grayA5">
                                                    {item.user_type}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="w-[375px] h-full px-2 shrink-0">
                                            <div className="h-full flex flex-col justify-center">
                                                <p className="montserrat-medium text-[13px] text-custom-bluegreen">
                                                    {item.details_concern}
                                                </p>
                                                <p className="text-xs text-custom-grayA5 truncate">
                                                    {item.details_message}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="w-[320px] shrink-0 h-full px-10 flex items-center">
                                            <p className="flex space-x-4 text-xs text-custom-solidgreen">
                                                <span>Transactions</span>
                                                <span>&gt;</span>
                                                <span>Casa Mira</span>
                                                <span>&gt;</span>
                                                <span>Equity</span>
                                            </p>
                                        </td>
                                        <td className="h-full shrink-0 flex justify-center items-center">
                                            <p className="text-xs montserrat-regular space-x-1 text-custom-bluegreen">
                                                <span>
                                                    {moment(
                                                        item.created_at
                                                    ).format("M / D / YYYY")}
                                                </span>
                                                <span>
                                                    ({" "}
                                                    {moment(
                                                        item.created_at
                                                    ).format("hh:mm A")}
                                                    )
                                                </span>
                                            </p>
                                        </td>
                                    </tr>
                                ))}
                            {/* READ */}
                            {/*  <tr className='flex items-center h-[47px] cursor-pointer my-1 bg-custom-grayF1 hover:shadow-custom4'>
                            <td className='w-[228px] shrink-0 h-full px-4 bg-custom-grayF1'>
                                <div className='h-full flex flex-col justify-center'>
                                    <p className='montserrat-medium text-[13px] '>Kent Jeffrey Armelia</p>
                                    <p className='text-xs text-custom-grayA5'>Property Owner</p>
                                </div> 
                            </td>
                            <td className='w-[375px] h-full px-2 shrink-0 bg-custom-grayF1'>
                                <div className='h-full flex flex-col justify-center'>
                                    <p className='montserrat-medium text-[13px] '>Property Transaction Failure</p>
                                    <p className='text-xs text-custom-grayA5 truncate'>Hello, I can’t seen to complete my action because I can’t click the porperty thank you</p>
                                </div> 
                            </td>
                            <td className='w-[320px] shrink-0 h-full px-10 flex items-center bg-custom-grayF1'>
                                <p className='flex space-x-4 text-xs text-custom-grayA5'>
                                   <span>Transactions</span> 
                                    <span>&gt;</span>
                                    <span>Casa Mira</span>
                                    <span>&gt;</span>
                                    <span>Equity</span>
                                </p>
                            </td>
                            <td className='h-full shrink-0 flex justify-center items-center bg-custom-grayF1'>
                                <p className='text-xs montserrat-regular space-x-1 text-custom-grayA5'>
                                    <span>7 / 26 /2024</span>
                                    <span>( 09:50 AM)</span>
                                </p>
                            </td>
                        </tr> */}
                        </tbody>
                    </table>
                </div>
                <div className="h-[63px] bg-white rounded-b-[10px] px-4 flex justify-start items-center gap-4">
                    {" "}
                </div>
                <div className="flex w-full justify-end mt-3">
                    <ReactPaginate
                        previousLabel={
                            <MdKeyboardArrowLeft className="text-[#404B52]" />
                        }
                        nextLabel={
                            <MdKeyboardArrowRight className="text-[#404B52]" />
                        }
                        breakLabel={"..."}
                        pageCount={notifPageCount}
                        marginPagesDisplayed={2}
                        pageRangeDisplayed={1}
                        onPageChange={handlePageClick}
                        containerClassName={"flex gap-2"}
                        previousClassName="border border-[#EEEEEE] text-custom-bluegreen font-semibold w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:text-white hover:bg-custom-lightgreen hover:text-white"
                        nextClassName="border border-[#EEEEEE] text-custom-bluegreen font-semibold w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:text-white hover:bg-custom-lightgreen hover:text-white"
                        pageClassName=" border border-[#EEEEEE] text-black w-[26px] h-[24px] rounded-[4px] flex justify-center items-center hover:bg-custom-lightgreen text-[12px]"
                        activeClassName="w-[26px] h-[24px] border border-[#EEEEEE] bg-custom-lightgreen text-[#404B52] rounded-[4px] text-white text-[12px]"
                        pageLinkClassName="w-full h-full flex justify-center items-center"
                        activeLinkClassName="w-full h-full flex justify-center items-center"
                        disabledLinkClassName={
                            "text-gray-300 cursor-not-allowed"
                        }
                        forcePage={notifCurrentPage}
                    />
                </div>
            </div>
        </div>
    );
};

export default Notification;

import React, { useCallback, useEffect, useRef, useState } from "react";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { data } from "@/component/servicesApi/apiCalls/transactions";
import Skeleton from "react-loading-skeleton";

const PreviewMessageModal = ({ transactModalRef, ticketId }) => {
    const [messageData, setMessageData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loadingNextPage, setLoadingNextPage] = useState(false); 
    const [previousTicketId, setPreviousTicketId] = useState(null);

    const handleCloseModal = () => {
        if (transactModalRef.current) {
            transactModalRef.current.close();
        }
    };

    const getData = async (page = 1) => {
        if (loadingNextPage || page > totalPages) return;
        setLoadingNextPage(true);
        const params = {
            page: page,
            ticket_id: ticketId,
        };

        
        const responseData = await data.getCustomerInquiries(params);
        setMessageData((prevData) => {
            console.log("prevData", prevData);
            return {
                ...prevData,
                [ticketId]: [
                    ...(prevData?.[ticketId] || []), 
                    ...(responseData.data || []),      
                ],
            };
        });

        setTotalPages(responseData.last_page);
        setCurrentPage(page);
        setLoadingNextPage(false);
    };

    const indexMessageData = messageData[ticketId] || [];

    const observer = useRef();
    const lastMessageElementRef = useCallback(
        (node) => {
            if (loadingNextPage) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver(
                (entries) => {
                    if (entries[0].isIntersecting && currentPage < totalPages) {
                        getData(currentPage + 1);
                    }
                },
                { threshold: 1.0 }
            );
            if (node) observer.current.observe(node);
        },
        [loadingNextPage, currentPage, totalPages]
    );

    console.log("messageData", messageData);

    console.log("ticketid", ticketId);

  /*   useEffect(() => {
        if (ticketId) {
            getData();
        }
    }, [ticketId]);
 */

    useEffect(() => {
        if (ticketId && ticketId !== previousTicketId) {
            getData(); // Fetch data if ticketId is different from the previous one
            setPreviousTicketId(ticketId); // Update the previousTicketId state
        }
    }, [ticketId, previousTicketId])
    return (
        <dialog
            className=" w-[454px] h-[939px] rounded-[10px] shadow-custom5 backdrop:bg-black/50 px-4 pb-4 py-1"
            ref={transactModalRef}
        >
            <div className="transaction-scrollbar overflow-auto h-full">
                <div className="flex justify-end items-center">
                    <button
                        className="w-10 h-10 rounded-full bg-custom-grayFA text-custom-bluegreen hover:bg-custombg"
                        onClick={handleCloseModal}
                    >
                        ✕
                    </button>
                </div>
                <div className="grid px-5 pb-5 py-1">
                    <span className="text-[16px] text-custom-bluegreen">
                        Casa Mira (Transaction) - Ticket # 240000087
                    </span>
                    <div className="flex items-center space-x-1 mt-2.5 mb-5">
                        <span className="text-xs text-custom-lightgreen font-semibold">
                            Ticket Resolved
                        </span>
                        <IoIosCheckmarkCircle className="size-[18px] text-custom-lightgreen" />
                    </div>

                    <div className="flex flex-col mt-2">
                        {indexMessageData.length > 0 ? (
                            indexMessageData.map((item, index) => {
                                const isEven = index % 2 === 0;
                                const isLastItem =
                                    index === indexMessageData.length - 1;

                                return (
                                    <div
                                        key={index}
                                        ref={
                                            isLastItem
                                                ? lastMessageElementRef
                                                : null
                                        }
                                        className="mb-5"
                                    >
                                        <span className="text-sm text-custom-bluegreen font-semibold leading-6">
                                            September 1, 2024 | 11:19 AM
                                        </span>
                                        {isEven ? (
                                            <div className="flex text-sm text-custom-gray81 leading-6">
                                                <span>
                                                    From: Jannet Doe | CLI |
                                                    Customer Relations Services
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col text-sm text-custom-gray81 leading-6">
                                                <span>From: Joshua Doe</span>
                                                <span>
                                                    Josh@gmail.com | 09480016608
                                                </span>
                                            </div>
                                        )}
                                        <div
                                            className={`w-[382px] h-[198px] rounded-r-[10px] rounded-b-[10px] mt-2 py-5 pr-5 pl-[31px] ${
                                                isEven
                                                    ? "gradient-background2"
                                                    : "gradient-background1"
                                            }`}
                                        >
                                            <span
                                                className={`text-sm ${
                                                    isEven
                                                        ? "text-black"
                                                        : "text-white"
                                                }`}
                                            >
                                                {item.details_message}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <span></span>
                        )}

                        {/* Skeleton loader for the next page */}
                        {loadingNextPage && (
                            <>
                                <Skeleton
                                    /* count={3} */
                                    height={40}
                                    style={{ marginBottom: "10px" }}
                                />
                                <Skeleton
                                    count={3}
                                    height={40}
                                    style={{ marginBottom: "10px" }}
                                />
                                <Skeleton
                                    count={3}
                                    height={40}
                                    style={{ marginBottom: "10px" }}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </dialog>
    );
};

export default PreviewMessageModal;

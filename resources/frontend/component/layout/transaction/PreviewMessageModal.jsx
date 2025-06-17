import React, { useCallback, useEffect, useRef, useState } from "react";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { data } from "@/component/servicesApi/apiCalls/transactions";
import Skeleton from "react-loading-skeleton";
import { useStateContext } from "@/context/contextprovider";
import moment from "moment";
import { Link } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { BsDownload } from "react-icons/bs";
import FolderFile from "../../../../../public/Images/folder_file.svg";

const PreviewMessageModal = ({ transactModalRef, ticketId, setTicketId }) => {
    const { messageData, setMessageData, isTotalPages, setIsTotalPages } =
        useStateContext();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loadingNextPage, setLoadingNextPage] = useState(false);

    const handleCloseModal = () => {
        if (transactModalRef.current) {
            transactModalRef.current.close();
        }
        setCurrentPage(1);
        setTotalPages(1);
        setTicketId("");
    };

    const getData = async (page = 1) => {
        let responseData = [];
        let prevDataIndex = [];
        let uniqueMessages = [];

        if (messageData[ticketId]?.loadedPages?.includes(page)) {
            // Skip fetching data for already loaded pages
            return;
        }

        const params = {
            page: page,
            ticket_id: ticketId,
        };

        setLoadingNextPage(true);
        responseData = await data.getCustomerInquiries(params);

        setMessageData((prevData) => {
            prevDataIndex = prevData[ticketId]?.data || [];
            const newMessages = responseData.data;

            const loadedPages = new Set(prevData[ticketId]?.loadedPages || []);
            loadedPages.add(page);

            uniqueMessages = newMessages.filter(
                (message) =>
                    !prevDataIndex.some(
                        (item) => item.messageId === message.messageId
                    )
            );

            return {
                ...prevData,
                [ticketId]: {
                    data: [...prevDataIndex, ...(uniqueMessages || [])],
                    pagination: {
                        prevDataCurrentPage: responseData.current_page,
                        totalPages: responseData.last_page,
                    },
                    loadedPages: Array.from(loadedPages),
                },
            };
        });

        setTotalPages(responseData.last_page);
        setCurrentPage(responseData.current_page);
        setLoadingNextPage(false);
    };

    const indexMessageData = messageData[ticketId]?.data || [];

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
        [loadingNextPage, currentPage, totalPages, getData]
    );

    useEffect(() => {
        return () => {
            if (observer.current) observer.current.disconnect();
        };
    }, []);

    const memoizedGetData = useCallback(getData, [ticketId]);

    useEffect(() => {
        if (ticketId) {
            setCurrentPage(1);
            setTotalPages(1);
            memoizedGetData(1);
        }
    }, [ticketId, memoizedGetData]);

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
                        Casa Mira (Transaction) -{" "}
                        {indexMessageData[0]?.ticket_id || ""}
                    </span>
                    <div className="flex items-center space-x-1 mt-2.5 mb-5">
                        <span className="text-xs text-custom-lightgreen font-semibold">
                            Ticket Resolved
                        </span>
                        <IoIosCheckmarkCircle className="size-[18px] text-custom-lightgreen" />
                    </div>

                    <div className="flex flex-col mt-2">
                        {loadingNextPage && isTotalPages && (
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
                            </>
                        )}
                        {indexMessageData.length > 0 ? (
                            indexMessageData.map((item, index) => {
                                const isAdmin = item.admin_email ? true : false;
                                const isLastItem =
                                    index === indexMessageData.length - 1;
                                const attachmentData = JSON.parse(
                                    item.attachment || "[]"
                                );

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
                                            {moment(item.created_at).format(
                                                "MMMM D, YYYY"
                                            )}{" "}
                                            |{" "}
                                            {moment(item.created_at).format(
                                                "hh:mm A"
                                            )}
                                        </span>
                                        {isAdmin ? (
                                            <div className="flex text-sm text-custom-gray81 leading-6">
                                                <span>
                                                    From: {item.admin_name} |
                                                    CLI | Customer Relations -
                                                    Services
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col text-sm text-custom-gray81 leading-6">
                                                <span>
                                                    From: {item.buyer_firstname}{" "}
                                                    {item.buyer_lastname}
                                                </span>
                                                <span>
                                                    {item.buyer_email} |{" "}
                                                    {item.mobile_number}
                                                </span>
                                            </div>
                                        )}
                                        <div
                                            className={`w-[382px] h-auto rounded-r-[10px] rounded-b-[10px] mt-2 py-5 pr-5 pl-[31px] ${
                                                isAdmin
                                                    ? "gradient-background2"
                                                    : "gradient-background1"
                                            }`}
                                        >
                                            <span
                                                className={`text-sm ${
                                                    isAdmin
                                                        ? "text-black"
                                                        : "text-white"
                                                }`}
                                            >
                                                {item.message}
                                            </span>
                                            {attachmentData.length > 0 &&
                                                attachmentData.map(
                                                    (attachment, index) => {
                                                        const fileName =
                                                            attachment?.original_file_name;
                                                        if (!fileName) {
                                                            // If fileName is undefined or null, return a fallback UI or nothing
                                                            return null;
                                                        }
                                                        const fileType =
                                                            fileName
                                                                .split(".")
                                                                .pop(); // Get the file extension
                                                        const baseName =
                                                            fileName.substring(
                                                                0,
                                                                fileName.lastIndexOf(
                                                                    "."
                                                                )
                                                            ); // Get the name without extension

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
                                                                className="mt-4 w-[300px] overflow-hidden font-light flex items-center gap-x-4 "
                                                                key={index}
                                                            >
                                                                <Link
                                                                    to={`/file-viewer/attachment/${item.messageId}`}
                                                                    onClick={(
                                                                        e
                                                                    ) => {
                                                                        e.preventDefault(); // Prevents the immediate navigation

                                                                        localStorage.setItem(
                                                                            "fileUrlPath",
                                                                            JSON.stringify(
                                                                                attachment.url
                                                                            )
                                                                        );
                                                                        window.open(
                                                                            `/file-viewer/attachment/${item.messageId}`,
                                                                            "_blank"
                                                                        );
                                                                    }}
                                                                    className="flex items-center justify-start bg-customnavbar h-12 pl-4 text-black gap-2 rounded-[5px]"
                                                                >
                                                                    <img
                                                                        src={
                                                                            FolderFile
                                                                        }
                                                                        alt="View Attachment"
                                                                    />
                                                                    <span className="w-[200px] h-[20px]">
                                                                        {" "}
                                                                        {
                                                                            truncatedName
                                                                        }
                                                                        .
                                                                        {
                                                                            fileType
                                                                        }
                                                                    </span>
                                                                </Link>
                                                                {/*  <div>
                                                                        <button
                                                                            onClick={() =>
                                                                                handleDownloadFile(
                                                                                    attachment.url
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                loadingStates[
                                                                                    attachment
                                                                                        .url
                                                                                ]
                                                                            }
                                                                            type="submit"
                                                                            className="h-6 w-6 text-custom-solidgreen hover:text-gray-700 cursor-pointer"
                                                                        >
                                                                            {loadingStates[
                                                                                attachment
                                                                                    .url
                                                                            ] ? (
                                                                                <CircularProgress className="spinnerSize" />
                                                                            ) : (
                                                                                <BsDownload className="h-6 w-6 text-custom-solidgreen hover:text-gray-700 cursor-pointer" />
                                                                            )}
                                                                        </button>
                                                                    </div> */}
                                                            </div>
                                                        );
                                                    }
                                                )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <span></span>
                        )}

                        {/* Skeleton loader for the next page */}
                        {/* {loadingNextPage && !isTotalPages && (
                            <>
                                <Skeleton
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
                        )} */}
                        {/* Skeleton loader for the next page */}
                        {loadingNextPage &&
                            (!messageData[ticketId]?.loadedPages ||
                                !messageData[ticketId].loadedPages.includes(
                                    currentPage + 1
                                )) && (
                                <>
                                    <Skeleton
                                        height={40}
                                        style={{ marginBottom: "10px" }}
                                    />
                                    <Skeleton
                                        height={40}
                                        style={{ marginBottom: "10px" }}
                                    />
                                    <Skeleton
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

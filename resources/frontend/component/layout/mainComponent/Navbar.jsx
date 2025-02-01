import React, { useState, useRef, useEffect } from "react";
import CLILogo from "../../../../../public/Images/CLILogo.png";
import Kent from "../../../../../public/Images/kent.png";
import apiService from "../../servicesApi/apiService";
import { useStateContext } from "../../../context/contextprovider";
import { Link, useLocation } from "react-router-dom";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import { FaAngleRight } from "react-icons/fa";
import Stack from "@mui/material/Stack";
import { startsWith } from "lodash";
import Alert from "@mui/material/Alert";
import { MdOutlineMail } from "react-icons/md";
import FeedbackModal from "./FeedbackModal";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const Navbar = () => {
    const { data, ticketId, navBarData, loading, user, getNavBarData } =
        useStateContext();
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const modalRef = useRef(null);
    const dropdownRef = useRef(null);

    const pathnames = location.pathname.split("/").filter((x) => x);
 
    const handleOpenModal = () => {
        if (modalRef.current) {
            modalRef.current.showModal();
        }
    };

    useEffect(() => {
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    useEffect(() => {
        getNavBarData();
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

    const breadcrumbs = [
        ...pathnames.map((value, index) => {
            const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;

            let breadcrumbLabel = decodeURIComponent(
                value.charAt(0).toUpperCase() + value.slice(1)
            );

            if (value.toLowerCase() === "inquirymanagement") {
                breadcrumbLabel = "Inquiry Management";
                // Non-linkable
                return (
                    <span
                        key={routeTo}
                        className="text-custom-solidgreen cursor-default"
                    >
                        {breadcrumbLabel}
                    </span>
                );
            }

            if (value.toLowerCase() === "bannersettings") {
                breadcrumbLabel = "Banner Settings";
                // Non-linkable
                return (
                    <span
                        key={routeTo}
                        className="text-custom-solidgreen cursor-default"
                    >
                        {breadcrumbLabel}
                    </span>
                );
            }

            if (value.toLowerCase() === "autoassign") {
                breadcrumbLabel = "Auto Assign";
                // Non-linkable
                return (
                    <span
                        key={routeTo}
                        className="text-custom-solidgreen cursor-default"
                    >
                        {breadcrumbLabel}
                    </span>
                );
            }

            if (value.toLowerCase() === "settings") {
                breadcrumbLabel = "Settings";
                // Non-linkable
                return (
                    <span
                        key={routeTo}
                        className="text-custom-solidgreen cursor-default"
                    >
                        {breadcrumbLabel}
                    </span>
                );
            }

            if (value.toLowerCase() === "versionlogs") {
                breadcrumbLabel = "Version Logs";
                // Non-linkable
                return (
                    <span
                        key={routeTo}
                        className="text-custom-solidgreen cursor-default"
                    >
                        {breadcrumbLabel}
                    </span>
                );
            }

            if (value.toLowerCase() === "transactionmanagement") {
                breadcrumbLabel = "Transaction Management";
                // Non-linkable
                return (
                    <span
                        key={routeTo}
                        className="text-custom-solidgreen cursor-default"
                    >
                        {breadcrumbLabel}
                    </span>
                );
            }
            if (value.toLowerCase()==='property-pricing') {
                breadcrumbLabel = "Property Pricing";
                
            }
            if (value.toLowerCase()==='master-lists') {
                breadcrumbLabel = "Master Lists";
                
            }
            
            if (value.toLowerCase() === "inquirylist") {
                breadcrumbLabel = "Inquiries";
            }

            if (value.toLowerCase() === "transactionrecords") {
                breadcrumbLabel = "Transaction Records";
            }

            if (value.toLowerCase() === "thread") {
                breadcrumbLabel = "Inquiries";
                return (
                    <Link
                        key={routeTo}
                        to="/inquirymanagement/inquirylist"
                        className="text-custom-solidgreen"
                    >
                        {breadcrumbLabel}
                    </Link>
                );
            }

            
            if (routeTo.startsWith("/transaction/details/")) {
                return null; // Skip rendering this breadcrumb
            }

            if (breadcrumbLabel.startsWith("Ticket#")) {
                const ticketId = breadcrumbLabel;
                const dataProperty =
                    data?.find((item) => item.ticket_id === ticketId) || {};

                const concernData = navBarData[ticketId] || [];

                if (concernData.length === 0) {
                    // Render skeleton while loading
                    return (
                        <span key={routeTo} className="text-custom-solidgreen">
                            <Skeleton width={200} />
                        </span>
                    );
                }
                return (
                    <span
                        key={routeTo}
                        className="text-custom-solidgreen cursor-default"
                    >
                        {
                            /* capitalizeWords()*/
                            `${concernData?.buyer_firstname || ""} ${
                                concernData?.buyer_middlename || ""
                            } ${concernData?.buyer_lastname || ""}`
                        }{" "}
                        {/* capitalizeWords()*/ concernData?.suffix_name || ""}{" "}
                        {""}({concernData?.details_concern || ""}){" "}
                        {concernData?.property || ""} ({concernData?.ticket_id})
                    </span>
                );
            }
            return (
                <Link
                    key={routeTo}
                    to={routeTo}
                    className="text-custom-solidgreen"
                >
                    {breadcrumbLabel}
                </Link>
            );
        }),
    ];

    const handleLogout = async () => {
        try {
            const response = await apiService.post("auth/logout", {});
            if (response.status === 200) {
                /*    localStorage.removeItem("selectedUnit");
        sessionStorage.removeItem("modalAlreadyShown"); */
                localStorage.removeItem("authToken");
                sessionStorage.removeItem("userAccessData");
                window.location.href = "/";
            } else {
                console.log("Logout failed");
            }
        } catch (error) {
            console.log("Error", error);
        }
    };

    const handleClickOutside = (event) => {
        if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target)
        ) {
            setIsOpen(false);
        }
    };

    return (
        <>
            <div className="flex h-[100px] pr-16 w-screen bg-custom-grayFA">
                <div className="flex w-full">
                    <div className="flex">
                        <div className="flex justify-center items-center">
                            <img
                                className="h-16 ml-5"
                                src={CLILogo}
                                alt="cli logo"
                            />
                        </div>
                        <div className="flex ml-[65px] justify-between items-center">
                            <Link to="salesmanagement/reservationpage">
                                <div>
                                    <button className="w-[130px] h-[45px] rounded-[9px] montserrat-semibold gradient-btn2 text-white hover:shadow-custom4 hidden">
                                        Reserve
                                    </button>
                                </div>
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center justify-start">
                        <Stack spacing={2}>
                            <Breadcrumbs
                                separator={
                                    <FaAngleRight className="text-custom-solidgreen" />
                                }
                                aria-label="breadcrumb"
                            >
                                {breadcrumbs}
                            </Breadcrumbs>
                        </Stack>
                    </div>
                </div>
                <div className="flex items-center justify-end">
                    <div className="flex gap-[7px]">
                        <div className="flex items-center w-[74px] justify-center">
                            <button
                                className="text-base font-bold bg-gradient-to-r from-custom-bluegreen via-custom-lightgreen to-custom-lightgreen bg-clip-text text-transparent"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </div>
                        <div
                            className="relative flex justify-center w-[67px]"
                            ref={dropdownRef}
                        >
                            <img
                                src={user?.profile_picture}
                                alt="image"
                                className="h-[63px] w-[63px] rounded-full border-8"
                                onClick={() => setIsOpen(!isOpen)}
                            />
                            {/* {isOpen && (
                                <div className="absolute top-full right-0 mt-2 w-[262px] h-auto px-[14px] py-[12px] bg-white text-custom-gray81 text-sm rounded-[10px] shadow-custom4 z-10">
                                   <div className="h-[29px] px-[10px] py-[6px]">
                                        <p>Jannet T. Doe</p>
                                   </div>
                                   <div className="h-[29px] px-[10px] py-[6px]">
                                        <p>jtdoe@gmail.com</p>
                                   </div>
                                   <div className="h-[29px] px-[10px] py-[6px]">
                                        <p>Customer Relation</p>
                                   </div>
                                   <div onClick={handleOpenModal} className="h-[29px] px-[10px] py-[6px] cursor-pointer hover:shadow-custom5">
                                        <p className="flex items-cemter gap-1 text-custom-solidgreen">
                                            <div className="flex items-center">
                                                <MdOutlineMail />
                                            </div>
                                            Send Feedback/Suggestion
                                        </p>
                                   </div>
                                </div>
                            )} */}
                        </div>
                        <div className="flex items-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="size-7"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                />
                            </svg>
                        </div>
                        <div>
                            {/*  <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            className="inline-block h-5 w-5 stroke-current">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path>
                            </svg> */}
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <FeedbackModal modalRef={modalRef} />
            </div>
        </>
    );
};

export default Navbar;

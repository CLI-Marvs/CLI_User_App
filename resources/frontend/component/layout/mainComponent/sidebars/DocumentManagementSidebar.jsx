import React, { useState, useEffect, useRef } from "react";
import { Card, List, ListItem } from "@material-tailwind/react";
import { Link, useLocation } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";
import { set } from "lodash";

const DocumentManagementSidebar = () => {
    const location = useLocation();
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isWorkOrderPopUpOpen, setIsWorkOrderPopUpOpen] = useState(false);
    const [isAccountMasterActive, setIsAccountMasterActive] = useState(false);
    const [isWorkOrderActive, setIsWorkOrderActive] = useState(false);
    const popupRef = useRef(null);

    const togglePopup = () => {
        const willBeOpen = !isPopupOpen;
        setIsPopupOpen(willBeOpen);
        setIsAccountMasterActive(willBeOpen);
        // Close other popup
        setIsWorkOrderPopUpOpen(false);
        setIsWorkOrderActive(false);
    };

    const toggleWorkOrderPopUp = () => {
        const willBeOpen = !isWorkOrderPopUpOpen;
        setIsWorkOrderPopUpOpen(willBeOpen);
        setIsWorkOrderActive(willBeOpen);
        // Close other popup
        setIsPopupOpen(false);
        setIsAccountMasterActive(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                setIsPopupOpen(false);
                setIsAccountMasterActive(false);
                setIsWorkOrderPopUpOpen(false);
                setIsWorkOrderActive(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <>
            <div className="bg-custom-grayFA relative">
                <Card className="flex min-w-[189px] h-screen pt-3 rounded-l-[10px] bg-[#EFEFEF]">
                    <List className="flex flex-col justify-center w-full">
                        <div className="px-5 leading-1">
                            <div className="flex flex-col space-y-1 mt-1">
                                <div className="relative">
                                    <ListItem
                                        onClick={togglePopup}
                                        className={`cursor-pointer h-[39px] w-[160px] mb-[5px] flex justify-between items-center rounded-[10px] px-4 ${
                                            isAccountMasterActive ||
                                            location.pathname.startsWith(
                                                "/documentmanagement/titleandregistration/masterlist"
                                            ) ||
                                            location.pathname.startsWith(
                                                "/documentmanagement/titleandregistration/takenoutaccounts"
                                            )
                                                ? "text-[15px] font-semibold bg-white shadow-custom6"
                                                : "text-[15px] text-[#8A8888]"
                                        }`}
                                    >
                                        <span>Account Master</span>
                                        <IoIosArrowForward className="text-[15px]" />
                                    </ListItem>
                                    {isPopupOpen && (
                                        <div
                                            ref={popupRef}
                                            className="absolute top-0 left-[170px] bg-white shadow-lg rounded-[10px] py-4 h-[80px] w-[161px] z-50 flex flex-col justify-center"
                                        >
                                            <Link
                                                to="takenoutaccounts"
                                                onClick={() => {
                                                    setIsPopupOpen(false);
                                                    setIsAccountMasterActive(
                                                        false
                                                    );
                                                }}
                                            >
                                                <div className="text-[14px] pl-[15px] pt-2 hover:font-bold hover:bg-gradient-to-r hover:from-custom-bluegreen hover:via-custom-lightgreen hover:to-custom-solidgreen hover:bg-clip-text hover:text-transparent text-[#A5A5A5]">
                                                    Taken out accounts
                                                </div>
                                            </Link>
                                            <div className="border-t border-gray-300 my-2"></div>
                                            <Link
                                                to="masterlist"
                                                onClick={() => {
                                                    setIsPopupOpen(false);
                                                    setIsAccountMasterActive(
                                                        false
                                                    );
                                                }}
                                            >
                                                <div className="text-[14px] pl-[15px] pb-2 hover:font-bold hover:bg-gradient-to-r hover:from-custom-bluegreen hover:via-custom-lightgreen hover:to-custom-solidgreen hover:bg-clip-text hover:text-transparent text-[#A5A5A5]">
                                                    Masterlist
                                                </div>
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                <ListItem
                                    onClick={toggleWorkOrderPopUp}
                                    className={`cursor-pointer h-[39px] w-[160px] mb-[5px] flex justify-between items-center rounded-[10px] px-4 ${
                                        isWorkOrderActive ||
                                        location.pathname.startsWith(
                                            "/documentmanagement/titleandregistration/workorders"
                                        ) ||
                                        location.pathname.startsWith(
                                            "/documentmanagement/titleandregistration/myworkorders"
                                        )
                                            ? "text-[15px] font-semibold bg-white shadow-custom6"
                                            : "text-[15px] text-[#8A8888]"
                                    }`}
                                >
                                    <span>Work Orders</span>
                                    <IoIosArrowForward className="text-[15px]" />
                                </ListItem>
                                {isWorkOrderPopUpOpen && (
                                    <div
                                        ref={popupRef}
                                        className="absolute top-[68px] left-[198px] bg-white shadow-lg rounded-[10px] py-4 h-[80px] w-[161px] z-50 flex flex-col justify-center"
                                    >
                                        <Link
                                            to="workorders"
                                            onClick={() => {
                                                setIsWorkOrderPopUpOpen(false);
                                                setIsWorkOrderActive(false);
                                            }}
                                        >
                                            <div className="text-[14px] pl-[15px] pt-2 hover:font-bold hover:bg-gradient-to-r hover:from-custom-bluegreen hover:via-custom-lightgreen hover:to-custom-solidgreen hover:bg-clip-text hover:text-transparent text-[#A5A5A5]">
                                                Manage Work Orders
                                            </div>
                                        </Link>
                                        <div className="border-t border-gray-300 my-2"></div>
                                        <Link
                                            to="myworkorders"
                                            onClick={() => {
                                                setIsWorkOrderPopUpOpen(false);
                                                setIsWorkOrderActive(false);
                                            }}
                                        >
                                            <div className="text-[14px] pl-[15px] pb-2 hover:font-bold hover:bg-gradient-to-r hover:from-custom-bluegreen hover:via-custom-lightgreen hover:to-custom-solidgreen hover:bg-clip-text hover:text-transparent text-[#A5A5A5]">
                                                My Work Orders
                                            </div>
                                        </Link>
                                    </div>
                                )}

                                <Link to="executivedashboard">
                                    <ListItem
                                        className={`h-[59px] w-[160px] mb-[5px] flex justify-start items-center gap-2 rounded-[10px] px-4 ${
                                            location.pathname.startsWith(
                                                "/documentmanagement/titleandregistration/executivedashboard"
                                            )
                                                ? "text-[15px] font-semibold bg-white shadow-custom6"
                                                : " text-[15px] text-[#8A8888]"
                                        }`}
                                    >
                                        Executive Dashboard
                                    </ListItem>
                                </Link>

                                <Link to="settings">
                                    <ListItem
                                        className={`h-[39px] w-[160px] mb-[5px] flex justify-start items-center gap-2 rounded-[10px] px-4 ${
                                            location.pathname.startsWith(
                                                "/documentmanagement/titleandregistration/settings"
                                            )
                                                ? "text-[15px] font-semibold bg-white shadow-custom6"
                                                : " text-[15px] text-[#8A8888]"
                                        }`}
                                    >
                                        Settings
                                    </ListItem>
                                </Link>
                            </div>
                        </div>
                    </List>
                </Card>
            </div>
        </>
    );
};

export default DocumentManagementSidebar;

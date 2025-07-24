import React, { useEffect, useState, useRef } from "react";
import { createPortal } from 'react-dom';
import { IoIosArrowDown } from "react-icons/io";
import { MdChevronRight } from "react-icons/md";
import { GoPlus } from "react-icons/go";
import {
    Card,
    Typography,
    List,
    ListItem,
    ListItemPrefix,
    ListItemSuffix,
    Chip,
    Accordion,
    AccordionHeader,
    AccordionBody,
} from "@material-tailwind/react";
import { Link, useLocation } from "react-router-dom";
import { useStateContext } from "../../../context/contextprovider";
import { ALLOWED_EMPLOYEES_CRS } from "../../../constant/data/allowedEmployeesCRS";

const Sidebar = () => {
    const reportsButtonRef = useRef(null);
    const reportsMenuRef = useRef(null);
    const { unreadCount, getCount, user } = useStateContext();
    const location = useLocation();
    const [isInquiryOpen, setInquiryOpen] = useState(false);
    const [isSuperAdminOpen, setSuperAdminOpen] = useState(false);
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
    const [activeItemTransaction, setActiveItemTransaction] = useState(null);
    const [showReportsSubmenu, setShowReportsSubmenu] = useState(false);
    const [activeItem, setActiveItem] = useState("notification");
    const [isPropertyPricingOpen, setPropertyPricingOpen] = useState(false);
    const [activeItemSales, setActiveItemSales] = useState(null);
    const userLoggedInEmail = user?.employee_email;
    const [isSalesOpen, setIsSalesOpen] = useState(false);

    useEffect(() => {
        if (!location.pathname.startsWith("/inquirymanagement/thread")) {
            localStorage.removeItem("dataConcern");
            localStorage.removeItem("updatedData");
            localStorage.removeItem("closeConcern");
        }
    }, [location]);

    useEffect(() => {
        getCount();
    }, [location]);

    const handleInquiryDropdownClick = () => {
        setInquiryOpen(!isInquiryOpen);
    };

    useEffect(() => {
        if (showReportsSubmenu && reportsButtonRef.current && reportsMenuRef.current) {
            const buttonRect = reportsButtonRef.current.getBoundingClientRect();
            const menu = reportsMenuRef.current;

            menu.style.position = 'fixed';
            menu.style.top = `${buttonRect.top}px`;
            menu.style.left = `${buttonRect.right + 8}px`;
        }
    }, [showReportsSubmenu]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                reportsMenuRef.current &&
                !reportsMenuRef.current.contains(event.target) &&
                reportsButtonRef.current &&
                !reportsButtonRef.current.contains(event.target)
            ) {
                setShowReportsSubmenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleReportsClick = () => {
        setShowReportsSubmenu((prev) => !prev);
    };

    const handleSuperAdminDropdownClick = () => {
        setSuperAdminOpen(!isSuperAdminOpen);
    };

    const handlePropertyPricingOpen = () => {
        setPropertyPricingOpen(!isPropertyPricingOpen);
    };

    const handleInvoiceDropdownClick = () => {
        setIsInvoiceOpen((prev) => !prev);
    };

    const handleSalesDropdownClick = () => {
        setIsSalesOpen((prev) => !prev);
    };

    const handleItemClick = (item) => {
        setActiveItem(item);
    };

    const handleItemTransactionClick = (item) => {
        setActiveItemTransaction(item);
    };

    useEffect(() => {
        const pathname = location.pathname;

        // Dynamic path checks (regex)
        const isSurveyForm =
            /^\/inquirymanagement\/settings\/surveysettings\/surveyform\/[\w-]+$/.test(
                pathname
            );
        const isSurveyReport =
            /^\/inquirymanagement\/report\/survey\/[\w-]+$/.test(pathname);

        // Fixed switch statement logic
        if (pathname === "/superadmin/userrightsandpermissions" ||
            pathname === "/super-admin/user-rights-and-permissions" ||
            pathname.startsWith("/super-admin")) {
            setInquiryOpen(false);
            setIsInvoiceOpen(false);
            setSuperAdminOpen(true);
            setIsSalesOpen(false);
        } else if (pathname.startsWith("/transaction")) {
            setInquiryOpen(false);
            setIsInvoiceOpen(true);
            setSuperAdminOpen(false);
            setIsSalesOpen(false);
        } else if (pathname.startsWith("/inquirymanagement")) {
            setIsInvoiceOpen(false);
            setInquiryOpen(true);
            setSuperAdminOpen(false);
            setIsSalesOpen(false);
        } else if (pathname === "/sales/customer" || pathname.startsWith("/sales")) {
            setIsSalesOpen(true);
            setInquiryOpen(false);
            setIsInvoiceOpen(false);
            setSuperAdminOpen(false);
        } else {
            // Default case
            setInquiryOpen(false);
            setIsInvoiceOpen(false);
            setSuperAdminOpen(false);
            setIsSalesOpen(false);
        }
    }, [location.pathname]);
    return (
        <>
            <Card className="shadow-none w-[230px] max-w-[230px] p-[25px] pr-[20px] pt-0 rounded-none bg-custom-grayFA relative z-50 overflow-hidden crs-sidebar-blur">
                <List className="p-0 gap-0">
                    <Link to="/notification">
                        <ListItem
                            className={`flex text-sm items-center w-[185px] h-[36px] pl-[12px] pr-[60px] gap-2 rounded-[10px] ${activeItem === "notification" &&
                                location.pathname.startsWith("/notification")
                                ? "bg-custom-lightestgreen text-custom-solidgreen font-semibold shadow-custom4"
                                : " hover:font-bold hover:bg-gradient-to-r hover:from-custom-bluegreen hover:via-custom-lightgreen hover:to-custom-solidgreen hover:bg-clip-text hover:text-transparent text-custom-solidgreen "
                                }`}
                            onClick={() => handleItemClick("notification")}
                        >
                            Notifications
                            <ListItemSuffix>
                                <Chip
                                    value={unreadCount}
                                    size="sm"
                                    variant="ghost"
                                    color="blue-gray"
                                    className="rounded-md gradient-btn2 text-white"
                                />
                            </ListItemSuffix>
                        </ListItem>
                    </Link>
                    <Link to="inquirymanagement/inquirylist">
                        <ListItem
                            className={`h-[35px] w-[185px] text-sm pl-[12px] transition-all duration-300 ease-in-out z-10 
                  ${activeItem === "inquiry" ||
                                    location.pathname.startsWith("/inquirymanagement")
                                    ? "bg-custom-lightestgreen text-custom-solidgreen font-semibold shadow-custom5"
                                    : "hover:font-bold hover:bg-gradient-to-r hover:from-custom-bluegreen hover:via-custom-lightgreen hover:to-custom-solidgreen hover:bg-clip-text hover:text-transparent text-custom-solidgreen "
                                }
                    ${isInquiryOpen
                                    ? "rounded-[10px] rounded-b-none"
                                    : "rounded-[10px]"
                                }`}
                            onClick={handleInquiryDropdownClick}
                        >
                            Customer Relations
                            <ListItemSuffix>
                                <IoIosArrowDown
                                    className={`text-custom-solidgreen  transition-transform duration-200 ease-in-out ${isInquiryOpen ? "rotate-180" : ""
                                        }`}
                                />
                            </ListItemSuffix>
                        </ListItem>
                    </Link>
                    {isInquiryOpen && (
                        <div className="px-[12px] py-[20px] w-[185px] min-h-[122px] flex flex-col gap-[5px] z-20 shadow-custom5  bg-custom-lightestgreen border-t rounded-t-none rounded-b-[10px] border-custom-solidgreen transition-all duration-300 ease-in-out">
                            <Link to="/inquirymanagement/inquirylist">
                                <ListItem
                                    className={`h-[32px] w-full py-[8px] px-[18px]  text-sm rounded-[50px] ${location.pathname.startsWith(
                                        "/inquirymanagement/inquirylist"
                                    ) ||
                                        location.pathname.startsWith(
                                            "/inquirymanagement/thread"
                                        )
                                        ? "bg-white text-custom-solidgreen font-semibold"
                                        : "hover:font-bold hover:bg-gradient-to-r hover:from-custom-bluegreen hover:via-custom-lightgreen hover:to-custom-solidgreen hover:bg-clip-text hover:text-transparent text-custom-solidgreen "
                                        }`}
                                    onClick={() =>
                                        handleItemClick(
                                            "/inquirymanagement/inquirylist"
                                        )
                                    }
                                >
                                    Feedback
                                </ListItem>
                            </Link>
                            <Link to="/inquirymanagement/walk-in">
                                <ListItem
                                    className={`h-[32px] w-full py-[8px] px-[18px] text-sm rounded-[50px] ${location.pathname.startsWith(
                                        "/inquirymanagement/walk-in"
                                    )
                                        ? "bg-white text-custom-solidgreen font-semibold"
                                        : "hover:font-bold hover:bg-gradient-to-r hover:from-custom-bluegreen hover:via-custom-lightgreen hover:to-custom-solidgreen hover:bg-clip-text hover:text-transparent text-custom-solidgreen "
                                        }`}
                                    onClick={() =>
                                        handleItemClick("/walk-in")
                                    }
                                >
                                    Walk-in
                                </ListItem>
                            </Link>
                            <div className="relative">
                                {/* Reports Toggle Button */}
                                <div ref={reportsButtonRef}>
                                    <ListItem
                                        className={`flex justify-between h-[32px] w-full py-[8px] pl-[18px] text-sm rounded-[50px] 
                          ${location.pathname.startsWith(
                                            "/inquirymanagement/report"
                                        )
                                                ? "bg-white text-custom-solidgreen font-semibold"
                                                : "hover:font-bold hover:bg-gradient-to-r hover:from-custom-bluegreen hover:via-custom-lightgreen hover:to-custom-solidgreen hover:bg-clip-text hover:text-transparent text-custom-solidgreen"
                                            }`}
                                        onClick={handleReportsClick}
                                    >
                                        <div>Reports</div>
                                        <div className="text-custom-solidgreen group-hover:text-custom-solidgreen">
                                            <MdChevronRight />
                                        </div>
                                    </ListItem>
                                </div>
                                {/* Floating submenu */}
                                {showReportsSubmenu &&
                                    createPortal(
                                        <div
                                            ref={reportsMenuRef}
                                            className="fixed z-[9999] bg-white shadow-lg border rounded-md w-48 py-2"
                                        >
                                            <Link
                                                to="/inquirymanagement/report/inquiries"
                                                onClick={() => setShowReportsSubmenu(false)}
                                            >
                                                <div className="px-4 py-2 text-sm hover:font-bold hover:bg-gradient-to-r hover:from-custom-bluegreen hover:via-custom-lightgreen hover:to-custom-solidgreen hover:bg-clip-text hover:text-transparent text-custom-solidgreen">
                                                    Inquiries
                                                </div>
                                            </Link>
                                            <Link
                                                to="/inquirymanagement/report/survey"
                                                onClick={() => setShowReportsSubmenu(false)}
                                            >
                                                <div className="px-4 py-2 text-sm hover:font-bold hover:bg-gradient-to-r hover:from-custom-bluegreen hover:via-custom-lightgreen hover:to-custom-solidgreen hover:bg-clip-text hover:text-transparent text-custom-solidgreen">
                                                    Survey
                                                </div>
                                            </Link>
                                        </div>,
                                        document.getElementById('portal-root')
                                    )}
                            </div>
                            <Link to="/inquirymanagement/settings/bannersettings">
                                <ListItem
                                    className={`h-[32px] w-full py-[8px] px-[18px] text-sm rounded-[50px]  ${location.pathname.startsWith(
                                        "/inquirymanagement/settings"
                                    )
                                        ? "bg-white text-custom-solidgreen font-semibold"
                                        : "hover:font-bold hover:bg-gradient-to-r hover:from-custom-bluegreen hover:via-custom-lightgreen hover:to-custom-solidgreen hover:bg-clip-text hover:text-transparent text-custom-solidgreen "
                                        }`}
                                    onClick={() =>
                                        handleItemClick("/settings")
                                    }
                                >
                                    Settings
                                </ListItem>
                            </Link>
                        </div>
                    )}
                    <Link to="/transaction/bank-monitoring/bank-statements">
                        <ListItem
                            className={`h-[35px] w-[185px] text-sm pl-[12px] py-7 transition-all duration-300 ease-in-out 
            ${location.pathname.startsWith("/transaction")
                                    ? "bg-custom-lightestgreen text-custom-solidgreen font-semibold"
                                    : "hover:font-bold hover:bg-gradient-to-r hover:from-custom-bluegreen hover:via-custom-lightgreen hover:to-custom-solidgreen hover:bg-clip-text hover:text-transparent text-custom-solidgreen "
                                }
              ${isInvoiceOpen
                                    ? "rounded-[10px] rounded-b-none"
                                    : "rounded-[10px]"
                                }`}
                            onClick={handleInvoiceDropdownClick}
                        >
                            Transaction Management
                            <ListItemSuffix>
                                <IoIosArrowDown
                                    className={`text-custom-solidgreen transition-transform duration-200 ease-in-out ${isInvoiceOpen ? "rotate-180" : ""
                                        }`}
                                />
                            </ListItemSuffix>
                        </ListItem>
                    </Link>
                    {isInvoiceOpen && (
                        <div className="px-[10px] py-[20px] w-[185px] min-h-[122px] flex flex-col gap-[5px] bg-custom-lightestgreen border-t rounded-t-none rounded-b-[10px] border-custom-solidgreen transition-all duration-300 ease-in-out">
                            <Link to="/transaction/bank-monitoring/bank-statements">
                                <ListItem
                                    className={`h-[32px] w-full py-[8px] px-[18px] text-sm rounded-[50px] ${location.pathname.startsWith(
                                        "/transaction/bank-monitoring/bank-statements"
                                    )
                                        ? "bg-white text-custom-solidgreen font-semibold"
                                        : "hover:font-bold hover:bg-gradient-to-r hover:from-custom-bluegreen hover:via-custom-lightgreen hover:to-custom-solidgreen hover:bg-clip-text hover:text-transparent text-custom-solidgreen "
                                        }`}
                                    onClick={() =>
                                        handleItemTransactionClick(
                                            "/transaction/bank-monitoring/bank-statements"
                                        )
                                    }
                                >
                                    Bank Monitoring
                                </ListItem>
                            </Link>
                            <Link to="/transaction/receivables/transactions">
                                <ListItem
                                    className={`h-[32px] w-full py-[8px] px-[18px] text-sm rounded-[50px] ${location.pathname.startsWith(
                                        "/transaction/receivables"
                                    )
                                        ? "bg-white text-custom-solidgreen font-semibold"
                                        : "hover:font-bold hover:bg-gradient-to-r hover:from-custom-bluegreen hover:via-custom-lightgreen hover:to-custom-solidgreen hover:bg-clip-text hover:text-transparent text-custom-solidgreen "
                                        }`}
                                    onClick={() =>
                                        handleItemTransactionClick(
                                            "/transaction/receivables/transactions"
                                        )
                                    }
                                >
                                    Receivables/Incoming
                                </ListItem>
                            </Link>
                            <Link to="/transaction/settings/markup">
                                <ListItem
                                    className={`h-[32px] w-full py-[8px] px-[18px] text-sm rounded-[50px] ${location.pathname.startsWith(
                                        "/transaction/settings"
                                    )
                                        ? "bg-white text-custom-solidgreen font-semibold"
                                        : "hover:font-bold hover:bg-gradient-to-r hover:from-custom-bluegreen hover:via-custom-lightgreen hover:to-custom-solidgreen hover:bg-clip-text hover:text-transparent text-custom-solidgreen "
                                        }`}
                                    onClick={() =>
                                        handleItemTransactionClick(
                                            "/transaction/settings/markup"
                                        )
                                    }
                                >
                                    Settings
                                </ListItem>
                            </Link>
                            <Link to="/transaction/tools/check-generator">
                                <ListItem
                                    className={`h-[32px] w-full py-[8px] px-[18px] text-sm rounded-[50px] ${location.pathname.startsWith(
                                        "/transaction/tools"
                                    )
                                        ? "bg-white text-custom-solidgreen font-semibold"
                                        : "hover:font-bold hover:bg-gradient-to-r hover:from-custom-bluegreen hover:via-custom-lightgreen hover:to-custom-solidgreen hover:bg-clip-text hover:text-transparent text-custom-solidgreen "
                                        }`}
                                    onClick={() =>
                                        handleItemTransactionClick(
                                            "/transaction/tools/check-generator"
                                        )
                                    }
                                >
                                    Tools
                                </ListItem>
                            </Link>
                        </div>
                    )}
                    {isSalesOpen && location.pathname.startsWith("/sales") && (
                        <div className="px-[12px] py-[20px] w-[210px] min-h-[122px] flex flex-col gap-[5px] bg-custom-lightestgreen border-t rounded-t-none rounded-b-[10px] border-custom-solidgreen transition-all duration-300 ease-in-out">
                            <Link to="/sales/customer">
                                <ListItem
                                    className={`h-[32px] w-full py-[8px] px-[18px] text-sm rounded-[50px] ${location.pathname.startsWith(
                                        "/sales/customer"
                                    )
                                        ? "bg-white text-custom-solidgreen font-semibold"
                                        : "hover:font-bold hover:bg-gradient-to-r hover:from-custom-bluegreen hover:via-custom-lightgreen hover:to-custom-solidgreen hover:bg-clip-text hover:text-transparent text-custom-solidgreen "
                                        }`}
                                    onClick={() =>
                                        handleItemSalesClick("/customer")
                                    }
                                >
                                    Customer Masterlist
                                </ListItem>
                            </Link>
                        </div>
                    )}
                    <div className="mt-3 mb-1 px-4">
                        <p className="text-[14px] font-bold bg-gradient-to-r from-custom-bluegreen via-custom-lightgreen to-custom-solidgreen bg-clip-text text-transparent">
                            Coming Soon
                        </p>
                    </div>
                    <div className=" text-sm p-4 h-auto rounded-[10px] text-gray-400 border border-custom-lightestgreen flex flex-col gap-4 cursor-not-allowed mb-2">
                        <p>Property & Pricing</p>
                        <p>Broker Management</p>
                        <p className="leading-none">
                            Document
                            <br /> Management
                        </p>
                        <p className="leading-none">
                            Property
                            <br /> Management
                        </p>
                        <p className="leading-none">Sales Management</p>
                    </div>
                    {ALLOWED_EMPLOYEES_CRS.includes(userLoggedInEmail) && (
                        <Link to="/super-admin/user-rights-and-permissions">
                            <ListItem
                                className={`h-[35px] w-[185px] text-sm pl-[12px] transition-all duration-300 ease-in-out 
                                ${activeItem === "super-admin" ||
                                        location.pathname.startsWith("/super-admin")
                                        ? "bg-custom-lightestgreen text-custom-solidgreen font-semibold"
                                        : "hover:font-bold hover:bg-gradient-to-r hover:from-custom-bluegreen hover:via-custom-lightgreen hover:to-custom-solidgreen hover:bg-clip-text hover:text-transparent text-custom-solidgreen "
                                    }
                                ${isSuperAdminOpen
                                        ? "rounded-[10px] rounded-b-none"
                                        : "rounded-[10px]"
                                    }`}
                                onClick={handleSuperAdminDropdownClick}
                            >
                                Admin Settings
                                <ListItemSuffix>
                                    <IoIosArrowDown
                                        className={`text-custom-solidgreen transition-transform duration-200 ease-in-out ${isSuperAdminOpen ? "rotate-180" : ""
                                            }`}
                                    />
                                </ListItemSuffix>
                            </ListItem>
                        </Link>
                    )}
                    {ALLOWED_EMPLOYEES_CRS.includes(userLoggedInEmail) &&
                        (isSuperAdminOpen ||
                            location.pathname.startsWith("/super-admin")) && (
                            <div className="px-[12px] py-[20px] w-[185px] min-h-[122px] flex flex-col gap-[5px] bg-custom-lightestgreen border-t rounded-t-none rounded-b-[10px] border-custom-solidgreen transition-all duration-300 ease-in-out">
                                <Link to="/super-admin/user-rights-and-permissions">
                                    <ListItem
                                        className={`h-[48px] w-full py-[8px] px-[18px] text-sm rounded-[25px] ${location.pathname.startsWith(
                                            "/super-admin/user-rights-and-permissions"
                                        )
                                            ? "bg-white text-custom-solidgreen font-semibold"
                                            : "hover:font-bold hover:bg-gradient-to-r hover:from-custom-bluegreen hover:via-custom-lightgreen hover:to-custom-solidgreen hover:bg-clip-text hover:text-transparent text-custom-solidgreen"
                                            }`}
                                        onClick={() =>
                                            handleItemClick(
                                                "user-rights-and-permissions"
                                            )
                                        }
                                    >
                                        User Rights & Permissions
                                    </ListItem>
                                </Link>
                                <Link to="/super-admin/property-settings">
                                    <ListItem
                                        className={`h-[48px] w-full py-[8px] px-[18px] text-sm rounded-[25px] ${location.pathname.startsWith(
                                            "/super-admin/property-settings"
                                        )
                                            ? "bg-white text-custom-solidgreen font-semibold"
                                            : "hover:font-bold hover:bg-gradient-to-r hover:from-custom-bluegreen hover:via-custom-lightgreen hover:to-custom-solidgreen hover:bg-clip-text hover:text-transparent text-custom-solidgreen"
                                            }`}
                                        onClick={() =>
                                            handleItemClick("property-settings")
                                        }
                                    >
                                        Property Settings
                                    </ListItem>
                                </Link>
                            </div>
                        )}
                </List>
            </Card>
        </>
    );
};

export default Sidebar;
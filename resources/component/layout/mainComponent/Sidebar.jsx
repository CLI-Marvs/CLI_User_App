import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { IoIosArrowDown } from "react-icons/io";
import { MdChevronRight } from "react-icons/md";
import {
    Card,
    List,
    ListItem,
    ListItemSuffix,
    Chip,
} from "@material-tailwind/react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useStateContext } from "../../../context/contextprovider";
import { ALLOWED_EMPLOYEES_CRS } from "../../../constant/data/allowedEmployeesCRS";
import { getSidebarConfig } from "./sidebarConfig/getSidebarConfig";



const Sidebar = () => {
    const { unreadCount, getCount, user } = useStateContext();
    const location = useLocation();
    const navigate = useNavigate();
    const userLoggedInEmail = user?.employee_email;

    const [openDropdowns, setOpenDropdowns] = useState({});
    const [floatingMenu, setFloatingMenu] = useState(null);
    const floatingButtonRef = useRef(null);
    const floatingMenuRef = useRef(null);

    const sidebarConfig = getSidebarConfig(userLoggedInEmail);

    // Clear localStorage on path change
    useEffect(() => {
        if (!location.pathname.startsWith("/inquirymanagement/thread")) {
            localStorage.removeItem("dataConcern");
            localStorage.removeItem("updatedData");
            localStorage.removeItem("closeConcern");
        }
    }, [location]);

    // Get count on location change
    useEffect(() => {
        getCount();
    }, [location]);

    // Auto-open dropdowns based on current path
    useEffect(() => {
        const newOpenState = {};
        sidebarConfig.forEach((item) => {
            if (item.type === "dropdown" && item.basePath && location.pathname.startsWith(item.basePath)) {
                newOpenState[item.id] = true;
            }
        });
        setOpenDropdowns(newOpenState);
    }, [location.pathname]);

    // Position floating menu
    useEffect(() => {
        if (floatingMenu && floatingButtonRef.current && floatingMenuRef.current) {
            const buttonRect = floatingButtonRef.current.getBoundingClientRect();
            const menu = floatingMenuRef.current;
            menu.style.position = "fixed";
            menu.style.top = `${buttonRect.top}px`;
            menu.style.left = `${buttonRect.right + 8}px`;
        }
    }, [floatingMenu]);

    // Close floating menu on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                floatingMenuRef.current &&
                !floatingMenuRef.current.contains(event.target) &&
                floatingButtonRef.current &&
                !floatingButtonRef.current.contains(event.target)
            ) {
                setFloatingMenu(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleDropdown = (id, item) => {
        const isCurrentlyOpen = openDropdowns[id];
        
        // Toggle the dropdown state
        setOpenDropdowns((prev) => {
            const newState = { ...prev, [id]: !isCurrentlyOpen };
            return newState;
        });
        
        // If opening (was closed, now opening), navigate to first child
        if (!isCurrentlyOpen && item?.children && item.children.length > 0) {
            const firstChild = item.children[0];
            if (firstChild.path) {
                navigate(firstChild.path);
            }
        }
    };

    const isPathActive = (path, matchPaths = []) => {
        const pathsToCheck = [path, ...matchPaths];
        return pathsToCheck.some((p) => location.pathname.startsWith(p));
    };

    const renderMenuItem = (item, isNested = false) => {
        if (item.visible === false) return null;

        const baseClasses = isNested
            ? "h-[32px] w-full py-[8px] px-[18px] text-sm rounded-[50px]"
            : " w-[185px] text-sm pl-[12px] py-1";

        const activeClasses = isNested
            ? "bg-white text-custom-solidgreen font-semibold"
            : "bg-custom-lightestgreen text-custom-solidgreen font-semibold shadow-custom5";

        const hoverClasses =
            "hover:font-bold hover:bg-gradient-to-r hover:from-custom-bluegreen hover:via-custom-lightgreen hover:to-custom-solidgreen hover:bg-clip-text hover:text-transparent text-custom-solidgreen";

        const isActive = isPathActive(item.path || item.basePath, item.matchPaths);
        const isOpen = openDropdowns[item.id];

        // Floating submenu item
        if (item.type === "floating") {
            return (
                <div key={item.id} className="relative">
                    <div ref={item.id === floatingMenu ? floatingButtonRef : null}>
                        <ListItem
                            className={`flex justify-between ${baseClasses} ${
                                isPathActive(item.path) ? activeClasses : hoverClasses
                            }`}
                            onClick={() =>
                                setFloatingMenu(floatingMenu === item.id ? null : item.id)
                            }
                        >
                            <div>{item.label}</div>
                            <div className="text-custom-solidgreen">
                                <MdChevronRight />
                            </div>
                        </ListItem>
                    </div>
                    {floatingMenu === item.id &&
                        createPortal(
                            <div
                                ref={floatingMenuRef}
                                className="fixed z-[9999] bg-white shadow-custom3 border rounded-md w-[120px] py-2"
                            >
                                {item.children.map((child) => (
                                    <Link
                                        key={child.id}
                                        to={child.path}
                                        onClick={() => setFloatingMenu(null)}
                                    >
                                        <div className="px-4 py-2 text-sm hover:font-bold hover:bg-gradient-to-r hover:from-custom-bluegreen hover:via-custom-lightgreen hover:to-custom-solidgreen hover:bg-clip-text hover:text-transparent text-custom-solidgreen">
                                            {child.label}
                                        </div>
                                    </Link>
                                ))}
                            </div>,
                            document.getElementById("portal-root")
                        )}
                </div>
            );
        }

        // Regular menu item
        const content = (
            <ListItem
                className={`${baseClasses} ${isActive ? activeClasses : hoverClasses} ${
                    item.type === "dropdown" && !isNested
                        ? isOpen
                            ? "rounded-[10px] rounded-b-none"
                            : "rounded-[10px]"
                        : "rounded-[10px]"
                } transition-all duration-300 ease-in-out`}
                onClick={() => {
                    if (item.type === "dropdown") {
                        if (!isNested) {
                            toggleDropdown(item.id, item);
                        }
                    }
                }}
            >
                {item.label}
                {item.showBadge && (
                    <ListItemSuffix>
                        <Chip
                            value={unreadCount}
                            size="sm"
                            variant="ghost"
                            color="blue-gray"
                            className="rounded-md gradient-btn2 text-white"
                        />
                    </ListItemSuffix>
                )}
                {item.type === "dropdown" && (
                    <ListItemSuffix>
                        <IoIosArrowDown
                            className={`text-custom-solidgreen transition-transform duration-200 ease-in-out ${
                                isOpen ? "rotate-180" : ""
                            }`}
                        />
                    </ListItemSuffix>
                )}
            </ListItem>
        );

        return (
            <React.Fragment key={item.id}>
                {item.path ? <Link to={item.path}>{content}</Link> : content}
                {item.type === "dropdown" && isOpen && (
                    <div className="px-[12px] py-[20px] -mt-2 w-[185px] min-h-[122px] flex flex-col gap-[5px] z-20 shadow-custom5 bg-custom-lightestgreen border-t rounded-t-none rounded-b-[10px] border-custom-solidgreen transition-all duration-300 ease-in-out">
                        {item.children.map((child) => renderMenuItem(child, true))}
                    </div>
                )}
            </React.Fragment>
        );
    };

    return (
        <Card className="shadow-none w-[230px] max-w-[230px] p-[25px] pr-[20px] pt-0 rounded-none bg-custom-grayFA relative overflow-hidden crs-sidebar-blur">
            <List className="p-0 gap-2">
                {sidebarConfig.map((item) => {
                    if (item.type === "section") {
                        return (
                            <React.Fragment key={item.id}>
                                <div className="mt-3 mb-1 px-4">
                                    <p className="text-[14px] font-bold bg-gradient-to-r from-custom-bluegreen via-custom-lightgreen to-custom-solidgreen bg-clip-text text-transparent">
                                        {item.label}
                                    </p>
                                </div>
                                <div className="text-sm p-4 h-auto rounded-[10px] text-gray-400 border border-custom-lightestgreen flex flex-col gap-4 cursor-not-allowed mb-2">
                                    {item.items.map((text, idx) => (
                                        <p key={idx} className="leading-none whitespace-pre-line">
                                            {text}
                                        </p>
                                    ))}
                                </div>
                            </React.Fragment>
                        );
                    }
                    return renderMenuItem(item);
                })}
            </List>
        </Card>
    );
};

export default Sidebar;
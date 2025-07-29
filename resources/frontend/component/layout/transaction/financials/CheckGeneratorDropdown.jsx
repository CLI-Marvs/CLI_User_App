import React, { useRef, useState, useEffect } from "react";
import { MdChevronRight } from "react-icons/md";
import { Link, useLocation } from "react-router-dom";
import { createPortal } from "react-dom";

const submenuItems = [
    {
        label: "Check Writer",
        to: "/transaction/tools/check-generator",
    },
    {
        label: "Reports",
        to: "/transaction/tools/reports",
    },
    {
        label: "Admin Settings",
        to: "/transaction/tools/reports",
    },
];

const CheckGeneratorDropdown = () => {
    const location = useLocation();
    const buttonRef = useRef(null);
    const menuRef = useRef(null);
    const [showSubmenu, setShowSubmenu] = useState(false);
    const [submenuPosition, setSubmenuPosition] = useState({ top: 0, left: 0 });
    const isActive = location.pathname.startsWith("/transaction/tools");

    const handleToggle = () => {
        const buttonRect = buttonRef.current?.getBoundingClientRect();
        if (buttonRect) {
            setSubmenuPosition({
                top: buttonRect.top,
                left: buttonRect.right + 5,
            });
        }
        setShowSubmenu((prev) => !prev);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target) &&
                !buttonRef.current.contains(event.target)
            ) {
                setShowSubmenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="relative">
            <div ref={buttonRef}>
                <div
                    className={`flex items-center justify-center  py-[8px] cursor-pointer sidebar_content w-full ${
                        isActive ? "bg-white shadow-custom12 rounded-xl" : ""
                    }`}
                    onClick={handleToggle}
                >
                    <span
                        className={`ml-3 text-base font-semibold ${
                            isActive ? "text-black" : "text-[#8A8888]"
                        }`}
                    >
                        Check Generator
                    </span>
                    <div
                        className={`ml-3 text-[#8A8888] ${
                            isActive ? "text-black" : ""
                        }`}
                    >
                        <MdChevronRight />
                    </div>
                </div>
            </div>

            {showSubmenu &&
                createPortal(
                    <div
                        ref={menuRef}
                        className="fixed z-[9999] bg-white shadow-custom3 border rounded-md w-[160px] py-2"
                        style={{
                            top: submenuPosition.top,
                            left: submenuPosition.left,
                        }}
                    >
                        <ul>
                            {submenuItems.map((item) => (
                                <li key={item.to}>
                                    <Link
                                        to={item.to}
                                        onClick={() => setShowSubmenu(false)}
                                        className="block px-4 py-2 text-sm text-custom-solidgreen hover:font-bold hover:bg-gradient-to-r hover:from-custom-bluegreen hover:via-custom-lightgreen hover:to-custom-solidgreen hover:bg-clip-text hover:text-transparent"
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>,
                    document.getElementById("portal-root")
                )}
        </div>
    );
};

export default CheckGeneratorDropdown;

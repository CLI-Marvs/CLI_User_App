import React, { useState, useEffect, useRef } from "react";

const TransactionTooltip = ({
    content = "Tooltip text",
    position = "top",
    children,
    onToggleOverflow = () => {},
}) => {
    const [visible, setVisible] = useState(false);
    const tooltipRef = useRef(null);

    const toggleTooltip = () => {
        const nextVisible = !visible;
        setVisible(nextVisible);
        onToggleOverflow(nextVisible); 
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
                setVisible(false);
            }
        };

        if (visible) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [visible, onToggleOverflow]);

    return (
        <div
            className="relative inline-block group z-10"
            onMouseEnter={() => window.innerWidth > 768 && setVisible(true)}
            onMouseLeave={() => window.innerWidth > 768 && setVisible(false)}
            onClick={() => window.innerWidth <= 768 && toggleTooltip()}
            ref={tooltipRef}
        >
            {visible && (
                <div
                    className={`absolute w-[300px] z-50  bg-gray-800 text-[10px] text-white p-4 rounded-[10px] shadow-lg transition-opacity duration-200 opacity-100 pointer-events-none flex items-center
                        ${
                            position === "top"
                                ? "bottom-full mb-3 left-1/2 -translate-x-1/4 xl:-translate-x-1/2 lg:-translate-x-1/2"
                                : ""
                        }
                        ${
                            position === "bottom"
                                ? "top-full mt-3 left-1/2 -translate-x-1/2"
                                : ""
                        }
                        ${
                            position === "left"
                                ? "right-full mr-3 top-1/2 -translate-y-1/2"
                                : ""
                        }
                        ${
                            position === "right"
                                ? "left-full ml-3 top-1/2 -translate-y-1/2"
                                : ""
                        }
                        ${
                            position === "center"
                                ? "left-full ml-3 top-1/2 -translate-y-1/2 sm:left-1/2 sm:ml-0 sm:-translate-x-1/2"
                                : ""
                        }
                    `}
                >
                    {content}
                    <div
                        className={`absolute w-0 h-0 
                            ${
                                position === "top"
                                    ? "left-1/4 -translate-x-1/4 lg:left-1/2 xl:left-1/2 2xl:left-1/2 lg:-translate-x-1/2 xl:-translate-x-1/2 top-full border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-gray-800"
                                    : ""
                            }
                            ${
                                position === "bottom"
                                    ? "left-1/2 -translate-x-1/2 bottom-full border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-gray-800"
                                    : ""
                            }
                            ${
                                position === "left"
                                    ? "top-1/2 -translate-y-1/2 right-[-8px] border-t-8 border-b-8 border-l-8 border-t-transparent border-b-transparent border-l-gray-800"
                                    : ""
                            }
                            ${
                                position === "right"
                                    ? "top-1/2 -translate-y-1/2 left-[-8px] border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-gray-800"
                                    : ""
                            }
                             ${
                                position === "center"
                                    ? "top-1/2 -translate-y-1/2 left-[-8px] border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-gray-800"
                                    : ""
                            }
                        `}
                    ></div>
                </div>
            )}
            {children}
        </div>
    );
};

export default TransactionTooltip;

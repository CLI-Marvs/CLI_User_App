import React, { useState } from "react";

const CustomToolTip = ({
    text = "Tooltip text",
    width = "w-max",
    height = "h-auto",
    position = "top",
    children,
}) => {
    const [visible, setVisible] = useState(false);

    return (
        <div
            className="inline-block overflow-visible z-10 group"
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
        >
            {children}
            {visible && (
                <div
                    className={`z-50 absolute ${width} ${height} bg-gray-800 text-white text-sm p-2 rounded shadow-lg transition-opacity duration-200 opacity-0 group-hover:opacity-60 pointer-events-auto montserrat-regular px-4 flex items-center
                ${
                    position === "top"
                        ? "bottom-full mb-3 left-1/2 -translate-x-1/2 before:absolute before:content-[''] before:w-0 before:h-0 before:border-l-8 before:border-r-8 before:border-t-8 before:border-transparent before:border-t-gray-800 before:bottom-[-6px] before:left-1/2 before:-translate-x-1/2"
                        : ""
                }
                ${
                    position === "bottom"
                        ? "top-full mt-3 left-1/2 -translate-x-1/2 before:absolute before:content-[''] before:w-0 before:h-0 before:border-l-8 before:border-r-8 before:border-b-8 before:border-transparent before:border-b-gray-800 before:top-[-6px] before:left-1/2 before:-translate-x-1/2"
                        : ""
                }
                ${
                    position === "left"
                        ? "right-full mr-3 top-1/2 -translate-y-1/2 before:absolute before:content-[''] before:w-0 before:h-0 before:border-t-8 before:border-b-8 before:border-l-8 before:border-transparent before:border-l-gray-800 before:right-[-6px] before:top-1/2 before:-translate-y-1/2"
                        : ""
                }
                ${
                    position === "right"
                        ? "left-full ml-3 top-1/2 -translate-y-1/2 before:absolute before:content-[''] before:w-0 before:h-0 before:border-t-8 before:border-b-8 before:border-r-8 before:border-transparent before:border-r-gray-800 before:left-[-6px] before:top-1/2 before:-translate-y-1/2"
                        : ""
                }
            `}
                >
                    {text}
                </div>
            )}
        </div>
    );
};

export default CustomToolTip;

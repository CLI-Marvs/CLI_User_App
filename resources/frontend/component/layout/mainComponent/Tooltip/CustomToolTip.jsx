import React, { useState } from "react";

const CustomToolTip = ({
    text = "Tooltip text",
    width = "w-32",
    height = "h-auto",
    position = "top",
    children,
}) => {
    const [visible, setVisible] = useState(false);

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
        >
            {children}
            {visible && (
                <div
                    className={`absolute ${width} ${height} bg-gray-800 text-white text-sm p-2 rounded shadow-lg transition-opacity duration-200 opacity-60 montserrat-regular
            ${
                position === "top"
                    ? "bottom-full mb-2 left-1/2 -translate-x-1/2 md:right-full md:mr-2 md:top-1/2 md:-translate-y-1/2 lg:bottom-full lg:mb-2 lg:left-1/2 lg:-translate-x-1/2"
                    : ""
            }
            ${
                position === "bottom"
                    ? "top-full mt-2 left-1/2 -translate-x-1/2"
                    : ""
            }
            ${
                position === "left"
                    ? "right-full mr-2 top-1/2 -translate-y-1/2"
                    : ""
            }
            ${
                position === "right"
                    ? "left-full ml-2 top-1/2 -translate-y-1/2"
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

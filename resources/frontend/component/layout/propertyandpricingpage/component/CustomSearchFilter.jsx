import React from "react";

const CustomSearchFilter = React.forwardRef(
    ({ children, isFilterVisible }, ref) => {
        if (!isFilterVisible) return null;
        return (
            <div className="">
                <div
                    className="absolute left-0 mt-12 p-8 bg-white border border-gray-300 shadow-lg rounded-lg z-10 w-[582px]"
                    ref={ref}
                >
                    {children}
                </div>
            </div>
        );
    }
);

export default CustomSearchFilter;

import React from "react";

const Button = ({ 
    type = "button", 
    onClick, 
    disabled = false, 
    className = "", 
    children 
}) => {
    // Default button style classes
    const defaultClasses = "gradient-btn5 w-[150px] h-[35px] rounded-[10px] text-sm text-white montserrat-semibold";
    
    // Combine default classes with any custom classes provided
    const buttonClasses = className ? className : defaultClasses;

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={buttonClasses}
        >
            {children}
        </button>
    );
};

export default Button;

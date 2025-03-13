import React from "react";

/**
 * A flexible custom input component that supports different input types.
 *
 * @param {Object} props - The properties passed to the input component.
 * @param {string} props.type - The type of the input (e.g., "text", "email", "password", "number").
 * @param {boolean} props.restrictNumbers - Whether to restrict non-numeric characters.
 * @param {Function} props.onChange - Function to handle input changes.
 * @param {string} props.value - The current value of the input field.
 * @param {string} props.className - Additional classes for styling.
 * @returns {JSX.Element} A customizable input field.
 */
const CustomInput = ({ restrictNumbers, value, onChange, ...props }) => {
    //Help function to handle user input 'e or -' key
    const handleKeyDown = (e) => {
        if (restrictNumbers && (e.key === "e" || e.key === "-")) {
            e.preventDefault();
        }
    };
    return (
        <input
            {...props}
            value={value || ""}
            onInput={onChange}
            onKeyDown={handleKeyDown}
            className={props.className}
        />
    );
};

export default CustomInput;

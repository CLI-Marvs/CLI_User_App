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
const CustomInput = ({
    type = "text",
    restrictNumbers,
    value = "",
    onChange,
    className = "",
    inputRef,
    ...props
}) => {
    //Help function to handle user input 'e or -' key
    // const handleKeyDown = (e) => {
    //     if (
    //         type === "number" &&
    //         restrictNumbers &&
    //         (e.key === "e" || e.key === "-")
    //     ) {
    //         e.preventDefault();
    //     }
    // };
    // Handle input to validate against patterns
    const handleInput = (e) => {
        let newValue = e.target.value;

        // Apply number restriction if enabled
        if (restrictNumbers) {
            newValue = newValue.replace(/[^0-9]/g, "");
            e.target.value = newValue;
        }

        // Call the onChange handler
        if (onChange) {
            onChange(e);
        }
    };

    return (
        <input
            type={type}
            value={value || ""}
            onChange={handleInput}
            className={className}
            ref={inputRef}
            {...props}
        />
    );
};

export default CustomInput;

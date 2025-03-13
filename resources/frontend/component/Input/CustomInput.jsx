import React from "react";

/**
 * A flexible custom input component that supports different input types.
 * It includes an optional "onlyNumbers" prop to restrict text inputs to numbers.
 *
 * @param {Object} props - The properties passed to the input component.
 * @param {string} props.type - The type of the input (e.g., "text", "email", "password").
 * @param {boolean} [props.onlyNumbers] - If true, restricts text input to numbers only.
 * @param {Function} props.onChange - The function to handle input changes.
 * @returns {JSX.Element} A customizable input field.
 */
const CustomInput = (props) => {
    /**
     * Handles the input event and filters out non-numeric values
     * if "onlyNumbers" is enabled.
     *
     * @param {Event} e - The input event object.
     */
    //Event handler
    const handleInput = (e) => {
        let { value } = e.target;

        // If input type is "text" and only numbers are allowed
        if (props.type === "text" && props.onlyNumbers) {
            value = value.replace(/[^0-9]/g, ""); // Allow only numbers
        }

        props.onChange({ ...e, target: { ...e.target, value } });
    };

    return <input {...props} onChange={handleInput} />;
};

export default CustomInput;

/**
 * CustomInput Component
 *
 * A reusable input component that supports different input types and includes
 * an optional number restriction feature.
 *
 * Props:
 * - `name` (string)        : The name of the input field.
 * - `value` (string)       : The current value of the input field.
 * - `onChange` (function)  : Callback function to handle value changes.
 * - `type` (string)        : Defines the input type (default: "text").
 * - `className` (string)   : Custom CSS classes for styling.
 * - `restrictNumbers` (bool): If `true`, allows only numbers and a single decimal point.
 * - `inputRef` (ref)       : Reference for the input element.
 * - `...rest`              : Spreads additional props to the input element.
 *
 * Features:
 * - Restricts numeric inputs to only digits and a single decimal point.
 * - Blocks invalid characters like `e`, `E`, `+`, and `-` for number inputs.
 * - Prevents multiple decimal points from being entered.
 *
 * **Usage Instructions for Developers:**
 * - For **text inputs**, make sure `restrictNumbers` is **removed** or set to `false`.
 * - For **number inputs**, set `restrictNumbers` to **true** to enforce validation.
 */

const CustomInput = ({
    name = "",
    value = "",
    onChange,
    type = "text",
    className = "",
    restrictNumbers,
    inputRef,
    ...rest
}) => {
    // Handle input to validate against patterns
    const handleInput = (e) => {
        let inputValue = e.target.value;

        // Apply number restriction if enabled
        if (restrictNumbers) {
            // Allow only numbers but prevent `e`, `+`, and `-`
            if (!/^\d*\.?\d*$/.test(inputValue)) {
                return; // Ignore invalid input
            }
        }

        // Call the onChange handler
        if (onChange) {
            onChange({ target: { name, value: inputValue } });
        }
    };

    // Prevent invalid key inputs when restricting numbers
    const handleKeyDown = (e) => {
        if (restrictNumbers) {
            if (["e", "E", "+", "-"].includes(e.key)) {
                e.preventDefault(); // Block invalid keys
            }

            if (e.key === "." && e.target.value.includes(".")) {
                e.preventDefault(); // Prevent multiple dots
            }
        }
    };

    
    return (
        <input
            name={name}
            value={value || ""}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            type={type}
            className={className}
            ref={inputRef}
            {...rest}
        />
    );
};

export default CustomInput;

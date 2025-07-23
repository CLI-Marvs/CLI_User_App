import { useState } from "react";

export default function useValidation(initialErrors = {}) {
    const [errors, setErrors] = useState(initialErrors);

    const validateField = (field, value) => {
        let stringValue = "";

        if (typeof value === "string") {
            stringValue = value.trim();
        } else if (value !== null && value !== undefined) {
            stringValue = value.toString().trim();
        }

        const isEmpty = stringValue === "";

        setErrors((prev) => ({
            ...prev,
            [field]: isEmpty ? "This field is required." : "",
        }));

        return !isEmpty;
    };

    const validateAll = (fields) => {
        const newErrors = {};
        let isValid = true;

        Object.keys(fields).forEach((field) => {
            if (!fields[field] || fields[field].toString().trim() === "") {
                newErrors[field] = "This field is required.";
                isValid = false;
            }
        });

        setErrors(newErrors);
        return isValid;
    };

    const clearError = (field) => {
        setErrors((prev) => ({ ...prev, [field]: "" }));
    };

    return {
        errors,
        validateField,
        validateAll,
        clearError,
        setErrors,
    };
}

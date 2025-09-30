import { useState } from "react";

export default function useValidation(initialErrors = {}) {
    const [errors, setErrors] = useState(initialErrors);

    const validateField = (field, value) => {
        let stringValue = "";
        let errorMsg = "";

        if (typeof value === "string") {
            stringValue = value.trim();
        } else if (value !== null && value !== undefined && value) {
            stringValue = value.toString().trim();
        }

        const isEmpty = stringValue === "";

        if (isEmpty) {
            errorMsg = "This field is required.";
        } else if (field === "contract_number" && stringValue.length !== 13) {
            errorMsg = "Contract number must be exactly 13 digits.";
        }

        setErrors((prev) => ({
            ...prev,
            [field]: errorMsg,
        }));

        return !isEmpty;
    };

    const validateAll = (fields) => {
        const newErrors = {};
        let isValid = true;

        Object.keys(fields).forEach((field) => {
            const value = fields[field];
            const stringValue = value?.toString().trim() || "";

            if (stringValue === "") {
                newErrors[field] = "This field is required.";
                isValid = false;
            } else if (
                field === "contract_number" &&
                stringValue.length !== 13
            ) {
                newErrors[field] = "Contract number must be exactly 13 digits.";
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

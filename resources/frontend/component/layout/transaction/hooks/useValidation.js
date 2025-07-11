import { useState } from "react";

export default function useValidation(initialErrors = {}) {
  const [errors, setErrors] = useState(initialErrors);

  const validateField = (field, value) => {
    let message = "";

    if (!value || value.trim() === "") {
      message = "This field is required.";
    }

    setErrors((prev) => ({ ...prev, [field]: message }));
    return message === "";
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

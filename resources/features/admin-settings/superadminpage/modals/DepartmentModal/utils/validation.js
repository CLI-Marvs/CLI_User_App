export const validateDepartment = (formData) => {
    console.log("formData", formData);

    if (!formData.department_id || formData.department_id === 0) {
        return "Please select a department.";
    }

    if (!formData.features || formData.features.length === 0) {
        return "Please select at least one feature.";
    }

    return null; // No error
};

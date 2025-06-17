// Function to handle button disable state
export const isButtonDisabled = (formData) => {
    // Ensure formData is valid and has required properties
    if (!formData || Object.keys(formData).length === 0) {
        return true; // Disable button if formData is empty or null
    }

    // Example conditions: Check if department_id and features are valid
    const { department_id, features } = formData;

    if (!department_id || department_id === 0) {
        return true; // Disable button if department is not selected
    }

    if (!features || features.length === 0) {
        return true; // Disable button if no features are selected
    }

    return false; // Enable button if all conditions are met
};

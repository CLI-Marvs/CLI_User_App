// Function to handle button disable state
export const isButtonDisabled = (formData) => {
    // Ensure formData is valid and has required properties
    if (!formData || Object.keys(formData).length === 0) {
        return true; // Disable button if formData is empty or null
    }

    const {
        propertyName,
        type,
        towerPhase,
        tower_description,
        barangay,
        city,
        province,
        country,
    } = formData;

    if (!propertyName || propertyName.length === 0) {
        return true;
    }

    if (!type || type.length === 0) {
        return true;
    }

    if (!towerPhase || towerPhase.length === 0) {
        return true;
    }

    if (!tower_description || tower_description.length === 0) {
        return true;
    }

    if (!barangay || barangay.length === 0) {
        return true;
    }

    if (!city || city.length === 0) {
        return true;
    }

    if (!province || province.length === 0) {
        return true;
    }

    if (!country || country.length === 0) {
        return true;
    }

    return false;
};

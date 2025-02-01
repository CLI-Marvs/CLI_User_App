// Function to handle button disable state
export const isButtonDisabled = (formData) => {
    // Ensure formData is valid and has required properties
    if (!formData || Object.keys(formData).length === 0) {
        return true; // Disable button if formData is empty or null
    }

    const {
        spot,
        paymentSchemeName,
        description,
        dpInstallment,
        noMonthsDP,
        discount,
        bankFinancing,
    } = formData;

    if (!spot || spot.length === 0) {
        return true;
    }

    if (!paymentSchemeName || paymentSchemeName.length === 0) {
        return true;
    }

    if (!description || description.length === 0) {
        return true;
    }

    if (!dpInstallment || dpInstallment.length === 0) {
        return true;
    }

    if (!noMonthsDP || noMonthsDP.length === 0) {
        return true;
    }

    if (!discount || discount.length === 0) {
        return true;
    }
 
    if (!bankFinancing || bankFinancing.length === 0) {
        return true;
    }

    return false;
};

/**
 * Determines if a button should be disabled based on required fields in the form data.
 *
 * @param {Object} formData - The current form data object.
 * @param {Array<string>} requiredFields - An array of field names that must have values.
 * @returns {boolean} - Returns `true` if any required field is empty, otherwise `false`.
 *
 * @example
 * // Basic usage
 * const formData = { name: "John", email: "" };
 * const requiredFields = ["name", "email"];
 * const isDisabled = isButtonDisabled(formData, requiredFields); // true (because email is empty)
 *
 * @example
 * // Excluding a specific field from validation
 * const formDataState = {
 *     propertyName: "",
 *     type: "",
 *     towerPhase: "",
 *     tower_description: "",
 *     barangay: "",
 *     city: "",
 *     province: "",
 *     country: "",
 *     google_map_link: "",
 * };
 *
 * const isPropertyButtonDisabled = isButtonDisabled(
 *     formData,
 *     Object.keys(formDataState).filter((key) => key !== "google_map_link")
 * );
 * // This ensures that all fields except "google_map_link" must be filled before enabling the button.
 * 
 *  
 * 
 */

const isFormButtonDisabled = (formData = {}, requiredFields = []) => {
    if (!formData || Object.keys(formData).length === 0) return true;
    if (!Array.isArray(requiredFields)) return true;
    return requiredFields.some(
        (field) => !formData[field] || formData[field].length === 0
    );
};

export default isFormButtonDisabled;

const validateContractNumber = (contractNumber) => {
    // Check if the contract number is empty
    if (!contractNumber) {
        return "Contract number is required";
    }

    // Check if the contract number is in the correct format (e.g., alphanumeric)
    const contractNumberPattern = /^[a-zA-Z0-9]+$/;
    if (!contractNumberPattern.test(contractNumber)) {
        return "Contract number must be alphanumeric";
    }

    // If all checks pass, return null (indicating no errors)
    return null;
};

export default validateContractNumber;

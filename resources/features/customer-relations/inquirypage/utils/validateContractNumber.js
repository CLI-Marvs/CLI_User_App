const validateContractNumber = (contractNumber) => {
    // Check if the contract number is empty or not 13 characters long
    if (!contractNumber || contractNumber.length !== 13) {
        return "invalid";
    }

    // Check if the contract number is in the correct format (alphanumeric)
    const contractNumberPattern = /^[a-zA-Z0-9]+$/;
    if (!contractNumberPattern.test(contractNumber)) {
        return null;
    }

    // If all checks pass, return null (indicating no errors)
    return null;
};

export default validateContractNumber;

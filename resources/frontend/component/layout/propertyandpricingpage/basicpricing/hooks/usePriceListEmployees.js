import { useState } from "react";
import { usePricing } from "@/component/layout/propertyandpricingpage/basicpricing/context/BasicPricingContext";

const usePriceListEmployees = () => {
    const [approvedByEmployees, setApprovedByEmployees] = useState([]);
    const [reviewedByEmployees, setReviewedByEmployees] = useState([]);
    const { setPricingData } = usePricing();

    //Handle remove the selected employee
    const handleRemoveEmployee = (employee, type) => {
        const employeeId = employee.id;

        if (type === "reviewedByEmployees") {
            setReviewedByEmployees((prevEmployees) => {
                const updatedEmployees = prevEmployees.filter(
                    (emp) => emp.id !== employeeId
                );

                // Also update pricingData
                setPricingData((prev) => ({
                    ...prev,
                    reviewedByEmployees: updatedEmployees,
                }));

                return updatedEmployees;
            });
        } else {
            setApprovedByEmployees((prevEmployees) => {
                const updatedEmployees = prevEmployees.filter(
                    (emp) => emp.id !== employeeId
                );

                // Also update pricingData
                setPricingData((prev) => ({
                    ...prev,
                    approvedByEmployees: updatedEmployees,
                }));

                return updatedEmployees;
            });
        }
    };

    return {
        reviewedByEmployees,
        setReviewedByEmployees,
        approvedByEmployees,
        setApprovedByEmployees,
        handleRemoveEmployee,
    };
};

export default usePriceListEmployees;

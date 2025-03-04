import { useState } from "react";
import { usePricing } from "@/component/layout/propertyandpricingpage/basicpricing/context/BasicPricingContext";

const usePriceListEmployees = () => {
    const { setPricingData, pricingData } = usePricing();
    const [approvedByEmployees, setApprovedByEmployees] = useState(
        pricingData.approvedByEmployees
    );
    const [reviewedByEmployees, setReviewedByEmployees] = useState(
        pricingData.reviewedByEmployees
    );

    //Handle remove the selected employee
    const handleRemoveEmployee = (employeeId, type) => {
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
            // Create new array excluding the employee with matching ID
            // const updatedEmployees = reviewedByEmployees.filter(
            //     (emp) => emp.id !== employeeId
            // );

            // // Update state with the filtered array
            // setReviewedByEmployees(updatedEmployees);

            // // Also update pricingData
            // setPricingData((prev) => ({
            //     ...prev,
            //     reviewedByEmployees: updatedEmployees,
            // }));
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

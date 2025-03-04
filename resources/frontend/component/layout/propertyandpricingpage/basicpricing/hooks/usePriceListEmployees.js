import { useState } from "react";
import { usePricing } from "@/component/layout/propertyandpricingpage/basicpricing/context/BasicPricingContext";

const usePriceListEmployees = () => {
    const { setPricingData, pricingData } = usePricing();
    const [approvedByEmployees, setApprovedByEmployees] = useState(
        pricingData.approvedByEmployees || []
    );

    const [reviewedByEmployees, setReviewedByEmployees] = useState(
        pricingData.reviewedByEmployees || []
    );

    //Handle remove the selected employee
    const handleRemoveEmployee = (employeeId, type) => {
        if (type === "reviewedByEmployees") {
            setReviewedByEmployees((prevEmployees) => {
                const updatedEmployees = prevEmployees.filter(
                    (emp) => emp.id !== employeeId
                );

           
                setPricingData((prev) => ({
                    ...prev,
                    reviewedByEmployees: [...updatedEmployees],
                }));

                return updatedEmployees;
            });

        } else {
            setApprovedByEmployees((prevEmployees) => {
                const updatedEmployees = prevEmployees.filter(
                    (emp) => emp.id !== employeeId
                );

             
                setPricingData((prev) => ({
                    ...prev,
                    approvedByEmployees: [...updatedEmployees],
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

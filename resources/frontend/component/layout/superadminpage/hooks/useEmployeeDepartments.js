import { employeeDepartmentService } from "../../../servicesApi/apiCalls/roleManagement";
import { useState, useEffect } from "react";
const useEmployeeDepartments = () => {
    const [employeeDepartments, setEmployeeDepartments] = useState([]);

    const fetchEmployeeDepartments = async () => {
        try {
            const employeeDepartmentData =
                await employeeDepartmentService.getAllEmployeeDepartment();
            setEmployeeDepartments(employeeDepartmentData);
        } catch (error) {
            console.error("Error fetching employee department:", error);
        } finally {
        }
    };
    useEffect(() => {
        fetchEmployeeDepartments(); // Initial fetch
    }, []);

    return {
        employeeDepartments,
        fetchEmployeeDepartments,
    };
};

export default useEmployeeDepartments;

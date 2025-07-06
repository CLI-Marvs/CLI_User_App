import React, { createContext, useContext, useState, useCallback } from 'react';
import { employeeDepartmentService } from '@/component/servicesApi/apiCalls/roleManagement';

const DepartmentContext = createContext();

export const DepartmentProvider = ({ children }) => {
    const [departments, setDepartments] = useState(null);
    const [isDepartmentLoading, setIsDepartmentLoading] = useState(false);
    const [error, setError] = useState(null);

    // This function does the actual database fetch
    const fetchEmployeeDepartments = useCallback(async (forceFetch = false) => {
        if (departments && !forceFetch) {
            return departments;
        }

        setIsDepartmentLoading(true);
        try {
            const response = await employeeDepartmentService.getAllEmployeeDepartment();
            setDepartments(response);
            setError(null);
            return response;
        } catch (error) {
            setError(error.message);
            console.error("Error fetching departments:", error);
        } finally {
            setIsDepartmentLoading(false);
        }
    }, [departments]);


    const value = {
        departments,
        isDepartmentLoading,
        fetchEmployeeDepartments,
        error,
    }
    return (
        <DepartmentContext.Provider value={value}>
            {children}
        </DepartmentContext.Provider>
    );
};

const useDepartment = () => {
    const context = useContext(DepartmentContext);
    if (!context) {
        throw new Error('useDepartmentTest must be used within a DepartmentContextProvider');
    }
    return context;
};

export default useDepartment
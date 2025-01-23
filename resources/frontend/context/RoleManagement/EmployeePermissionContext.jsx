import React, { createContext, useContext, useState, useCallback } from 'react';
import { employeePermissionService } from '@/component/servicesApi/apiCalls/roleManagement';

const EmployeePermissionContext = createContext();

export const EmployeePermissionProvider = ({ children }) => {

    const [employeesWithPermissions, setEmployeesWithPermissions] = useState(null);
    const [isEmployeePermissionLoading, setIsEmployeePermissionLoading] = useState(false);
    const [error, setError] = useState(null);

    // This function does the actual database fetch
    const fetchEmployeeWithPermissions = useCallback(async (forceFetch = false) => {
        if (employeesWithPermissions && !forceFetch) {
            return employeesWithPermissions;
        }

        setIsEmployeePermissionLoading(true);
        try {
            const response = await employeePermissionService.getEmployeesWithPermissions();
            setEmployeesWithPermissions(response);
            setError(null);
            return response;
        } catch (error) {
            setError(error.message);
            console.error("Error fetching employee permisions:", error);
        } finally {
            setIsEmployeePermissionLoading(false);
        }
    }, [employeesWithPermissions]);


    const value = {
        employeesWithPermissions,
        isEmployeePermissionLoading,
        fetchEmployeeWithPermissions,
        error,
    }
    return (
        <EmployeePermissionContext.Provider value={value}>
            {children}
        </EmployeePermissionContext.Provider>
    );
};

const useEmployeePermission = () => {
    const context = useContext(EmployeePermissionContext);
    if (!context) {
        throw new Error('useEmployeePermissionTest must be used within a EmployeePermissionContextProvider');
    }
    return context;
};

export default useEmployeePermission
import React, { createContext, useContext, useState, useCallback } from "react";
import { departmentPermissionService } from "@/component/servicesApi/apiCalls/roleManagement";
import useDepartment from "@/context/RoleManagement/DepartmentContext";
const DepartmentPermissionContext = createContext();

export const DepartmentPermissionProvider = ({ children }) => {
    const [departmentsWithPermissions, setDepartmentsWithPermissions] =
        useState(null);
    const { fetchEmployeeDepartments } = useDepartment();
    const [isDepartmentPermissionsLoading, setIsDepartmentPermissionsLoading] =
        useState(false);
    const [error, setError] = useState(null);

    // This function does the actual database fetch
    const fetchDepartmentPermissions = useCallback(
        async (forceFetch = false, setLoading = true) => {
            if (departmentsWithPermissions && !forceFetch) {
                return departmentsWithPermissions;
            }

            try {
                if (setLoading) setIsDepartmentPermissionsLoading(true);
                const response =
                    await departmentPermissionService.getDepartmentsWithPermissions();
                setDepartmentsWithPermissions(response);
                // await fetchEmployeeDepartments(true);
                setError(null);
                return response;
            } catch (error) {
                setError(error.message);
                console.error("Error fetching department permisions:", error);
            } finally {
                if (setLoading) setIsDepartmentPermissionsLoading(false);
            }
        },
        [isDepartmentPermissionsLoading, departmentsWithPermissions]
    );

    const value = {
        departmentsWithPermissions,
        isDepartmentPermissionsLoading,
        setIsDepartmentPermissionsLoading,
        fetchDepartmentPermissions,
        error,
        setDepartmentsWithPermissions,
    };
    return (
        <DepartmentPermissionContext.Provider value={value}>
            {children}
        </DepartmentPermissionContext.Provider>
    );
};

const useDepartmentPermission = () => {
    const context = useContext(DepartmentPermissionContext);
    if (!context) {
        throw new Error(
            "useDepartmentPermissionTest must be used within a DepartmentPermissionContextProvider"
        );
    }
    return context;
};

export default useDepartmentPermission;

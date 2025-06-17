import { FeatureProvider } from "@/context/RoleManagement/FeatureContext";
import { DepartmentPermissionProvider } from "@/context/RoleManagement/DepartmentPermissionContext";
import { EmployeePermissionProvider } from "@/context/RoleManagement/EmployeePermissionContext";
import { DepartmentProvider } from '@/context/RoleManagement/DepartmentContext';
import { PropertyFeatureProvider } from "@/context/RoleManagement/PropertyFeatureContext";

/**
 * This is the main provider for the role management context.
 *  
 */
export const RoleManagementProvider = ({ children }) => {
    return (
        <FeatureProvider>
            <DepartmentProvider>
                <DepartmentPermissionProvider>
                    <EmployeePermissionProvider>
                        <PropertyFeatureProvider>
                            {children}
                        </PropertyFeatureProvider>
                    </EmployeePermissionProvider>
                </DepartmentPermissionProvider>
            </DepartmentProvider>

        </FeatureProvider>
    );
};
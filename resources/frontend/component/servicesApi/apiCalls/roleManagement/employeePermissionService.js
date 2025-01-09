import apiService from "../../apiService";

export const employeePermissionService = {
    //Function to get all employees with permissions
    getEmployeesWithPermissions: async () => {
        try {
            const response = await apiService.get(
                "get-employees-with-permissions"
            );
            return response?.data?.data;
        } catch (error) {
            console.error("Error fetching employee permissions:", error);
            throw error;
        }
    },

    //Function to store employees with permissions
    storeEmployeesWithPermissions: async (payload) => {
        try {
            const response = await apiService.post(
                "employee-assign-feature-permissions",
                payload
            );
            return response;
        } catch (error) {
            console.error("Error storing employee permissions:", error);
            throw error;
        }
    },

    //Function to edit employees permission status 'Active or InActive'
    editEmployeesPermissionsStatus: async (payload) => {
        try {
            const response = await apiService.patch(
                "update-employee-status",
                payload
            );
            return response;
        } catch (error) {
            console.error("Error editing employee permissions:", error);
            throw error;
        }
    },

    //Function to edit employees with permissions(e.g can_view,can_edit,can_delete, etc)
    editEmployeesWithPermissions: async (payload) => {
        try {
            const response = await apiService.patch(
                "update-employees-feature-permissions",
                payload
            );
            return response;
        } catch (error) {
            console.error("Error editing employee permissions:", error);
            throw error;
        }
    },
};


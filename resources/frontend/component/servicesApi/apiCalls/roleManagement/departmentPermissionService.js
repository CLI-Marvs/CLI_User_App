import apiService from "../../apiService";

export const departmentPermissionService = {
    //Function to get all departments with permissions
    getDepartmentsWithPermissions: async () => {
        try {
            const response = await apiService.get(
                "get-departments-with-permissions"
            );
            return response?.data?.data;
        } catch (error) {
            console.error("Error fetching department permissions:", error);
            throw error;
        }
    },

    //Function to store departments with permissions
    storeDepartmentsWithPermissions: async (payload) => {
        try {
            const response = await apiService.post(
                "departments-assign-feature-permissions",
                payload
            );
            return response;
        } catch (error) {
            console.error("Error storing department permissions:", error);
            throw error;
        }
    },

    //Function to edit departments status 'Active or InActive'
    editDepartmentPermissionsStatus: async (payload) => {
        try {
            const response = await apiService.patch(
                "update-departments-status",
                payload
            );
            return response;
        } catch (error) {
            console.error("Error editing department permissions:", error);
            throw error;
        }
    },

    //Function to edit departments with permissions (e.g can_view,can_edit,can_delete, etc)
    editDepartmentsWithPermissions: async (payload) => {
        try {
            const response = await apiService.put(
                "update-departments-feature-permissions",
                payload
            );
            return response;
        } catch (error) {
            console.error("Error editing department permissions:", error);
            throw error;
        }
    },
};

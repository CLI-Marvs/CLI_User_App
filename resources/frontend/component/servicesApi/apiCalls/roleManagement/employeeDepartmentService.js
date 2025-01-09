import apiService from "../../apiService";

export const employeeDepartmentService = {
    getAllEmployeeDepartment: async () => {
        try {
            const response = await apiService.get("get-employees-departments");
            return response.data.data;
        } catch (error) {
            console.error("Error fetching employee departments:", error);
            throw error;
        }
    },
};
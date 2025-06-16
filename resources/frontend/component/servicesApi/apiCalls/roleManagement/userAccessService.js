import apiService from "../../apiService";


export const userAccessService = {
    getUserAccessData: async (token) => {
        try {
            const response = await apiService.get("get-user-access-data", {
                token,
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching user access data:", error);
            throw error;
        }
    },
};


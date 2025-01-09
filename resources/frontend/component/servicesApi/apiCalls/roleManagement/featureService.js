import apiService from '../../apiService';
export const featureService = {
    getAllFeatures: async () => {
        try {
            const response = await apiService.get("get-features");
            return response.data.data;
        } catch (error) {
            console.error("Error fetching features:", error);
            throw error;
        }
    },
};
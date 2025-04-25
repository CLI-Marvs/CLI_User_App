import apiService from '@/component/servicesApi/apiService';
export const featureService = {
    //get all features for the User rights and Permissions
    getAllFeatures: async () => {
        try {
            const response = await apiService.get("get-features");
            return response.data.data;
        } catch (error) {
            console.error("Error fetching features:", error);
            throw error;
        }
    },

    //Get features for the property settings
    getPropertySettingsFeatures: async () => {
        try {
            const response = await apiService.get("get-features");
            return response.data.property_settings_features;
        } catch (error) {
            console.error("Error fetching property settings features:", error);
            throw error;
        }
    },
};
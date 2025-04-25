import apiService from "@/component/servicesApi/apiService";

export const propertyMasterService = {
    //Function to store property master data
    storePropertyMaster: async (payload) => {
        try {
            const response = await apiService.post("properties/", payload);
            console.log("from 8", response);

            // Ensure response has the correct structure
            if (!response || !response.data || !response.data.data) {
                throw new Error("Invalid response structure");
            }
            return response;
        } catch (error) {
            console.error("Error storing property master data:", error);
            throw error;
        }
    },

    //Function to get all property names with IDs
    getPropertyNamesWithIds: async () => {
        try {
            const response = await apiService.get("properties/names/with-ids");
            return response;
        } catch (error) {
            console.error("Error fetching property names:", error);
            throw error;
        }
    },

    getPropertiesByFeatures: async () => {
        try {
            const response = await apiService.get(
                `/property-feature-settings/properties-with-features`
            );
            return response;
        } catch (error) {
            console.error("Error fetching properties by features:", error);
            throw error;
        }
    },
};

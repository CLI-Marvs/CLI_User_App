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

    getPropertiesByFeatures: async (page = 1, perPage = 10, filters) => {
        try {
            const cleanFilters = Object.fromEntries(
                Object.entries(filters || {}).filter(
                    ([, v]) => v != null && v !== ""
                )
            );

            // Convert filters object into query parameters
            const queryParams = new URLSearchParams({
                page,
                per_page: perPage,
                ...cleanFilters,
            }).toString();

            const response = await apiService.get(
                `/property-feature-settings/properties?${queryParams}`
            );

            return response;
        } catch (error) {
            console.error("Error fetching properties by features:", error);
            throw error;
        }
    },

    updatePropertyFeatureSettings: async (payload) => {
        try {
            console.log("Payload in updatePropertyFeatureSettings:", payload);
            const response = await apiService.put(
                `/property-feature-settings/properties/${payload.propertyId}/features`,
                payload
            );
            return response;
        } catch (error) {
            console.error("Error updating property feature settings:", error);
            throw error;
        }
    },

    storePropertyFeatureSettings: async (payload) => {
        try {
            console.log("Response from storePropertyFeatureSettings:", payload);

            const response = await apiService.post(
                `/property-feature-settings/properties/features`,
                payload
            );

            return response.data;
        } catch (error) {
            console.error("Error storing property feature settings:", error);
            throw error;
        }
    },
};

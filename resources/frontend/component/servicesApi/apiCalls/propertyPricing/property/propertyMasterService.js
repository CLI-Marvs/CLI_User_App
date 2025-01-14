import apiService from "@/component/servicesApi/apiService";
 
export const propertyMasterService = {
 
    //Function to store property master data
    storePropertyMaster: async (payload) => {
        try {
            const response = await apiService.post("properties/", payload);
            return response;
        } catch (error) {
            console.error("Error storing property master data:", error);
            throw error;
        }
    },

    //Function to get all property names
    getPropertyNames: async () => {
        try {
            const response = await apiService.get("properties/names");
            return response;
        } catch (error) {
            console.error("Error fetching property names:", error);
            throw error;
        }
    },
 
};
import apiService from "@/component/servicesApi/apiService";

export const priceListMasterService = {
    //Function to get property master lists
    getPriceListMasters: async () => {
        try {
            const response = await apiService.get("price-list-masters/");
            return response;
        } catch (error) {
            console.error("Error getting price list masters:", error);
            throw error;
        }
    },

    //Function to store price list masters
    storePriceListMasters: async (payload) => {
        try {
            const response = await apiService.post("price-list-masters/", payload);
            return response;
        } catch (error) {
            console.error("Error storing price list masters:", error);
            throw error;
        }
    },

    //Function to update price list masters
    updatePriceListMasters: async (payload) => {
        try {
            const response = await apiService.put("price-list-masters/update", payload);
            return response;
        } catch (error) {
            console.error("Error updating price list masters:", error);
            throw error;
        }
    },
};

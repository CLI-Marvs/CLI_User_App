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
            const response = await apiService.post(
                "price-list-masters/",
                payload
            );
            return response;
        } catch (error) {
            console.error("Error storing price list masters:", error);
            throw error;
        }
    },

    //Function to update price list masters (e.g Price List Settings, floor premiums, Additional premiums, price versions
    updatePriceListMasters: async (payload) => {
        try {
            const response = await apiService.put(
                "price-list-masters/update",
                payload
            );
            return response;
        } catch (error) {
            console.error("Error updating price list masters:", error);
            throw error;
        }
    },

    /**
     * Function to update the price list master status
     * If status is On-going approval then user can click 'cancel' and set the status to 'Inactive'
     */
    updatePriceListMasterStatus: async (id) => {
        try {
            const response = await apiService.patch(
                `price-list-masters/${id}/status`
            );
            return response;
        } catch (error) {
            console.error("Error updating price list master status:", error);
            throw error;
        }
    },
};

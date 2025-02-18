import apiService from "@/component/servicesApi/apiService";

export const priceVersionService = {
    // Function to get price version data
    getPriceVersions: async () => {
        try {
            const response = await apiService.get("price-version/");
            console.log("response", response);
            return response;
        } catch (error) {
            console.error("Error getting price list masters:", error);
            throw error;
        }
    },

    //Function to store price list masters
    storePriceVersion: async (payload) => {
        try {
            const response = await apiService.post("price-version/", payload);
            return response;
        } catch (error) {
            console.error("Error storing price version :", error);
            throw error;
        }
    },
};

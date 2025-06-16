import apiService from "@/component/servicesApi/apiService";

export const priceVersionService = {
    // Function to get price version data
    getPriceVersions: async (page = 1, perPage = 10, filters) => {
        try {
            const cleanFilters = Object.fromEntries(
                Object.entries(filters || {}).filter(
                    ([, v]) => v != null && v !== "" // Ignore the key
                )
            );
            // Convert filters object into query parameters
            const queryParams = new URLSearchParams({
                page,
                per_page: perPage,
                ...cleanFilters, // Spread the filters object
            }).toString();

            const response = await apiService.get(
                `price-version?${queryParams}`
            );
            
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

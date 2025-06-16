import apiService from "@/component/servicesApi/apiService";

export const paymentSchemeService = {
    //Function to store payment scheme
    storePaymentScheme: async (payload) => {
        try {
            const response = await apiService.post("payment-schemes/", payload);
            return response;
        } catch (error) {
            console.error("Error storing property master data:", error);
            throw error;
        }
    },

    //Function to get all property names
    getPaymentSchemes: async (page = 1, perPage = 10, filters) => {
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
                `payment-schemes?${queryParams}`
            );

            return response;
        } catch (error) {
            console.error("Error fetching property names:", error);
            throw error;
        }
    },
};

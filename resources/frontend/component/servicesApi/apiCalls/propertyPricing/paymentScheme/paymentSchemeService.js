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
    getPaymentSchemes: async () => {
        try {
            const response = await apiService.get("payment-schemes/");
            return response;
        } catch (error) {
            console.error("Error fetching property names:", error);
            throw error;
        }
    },
};
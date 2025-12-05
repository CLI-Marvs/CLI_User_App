import walkinFeedbackService from '@/servicesApi/walkinFeedbackService';

export const categoryService = {
    /*
     * Fetches all walkin transactions from the server.
     * @returns {Promise<Object>} A promise that resolves to the response containing all walkin transactions.
     * @throws {Error} If the request fails.
     */
    getAllCategories: async () => {
        try {
            const response = await walkinFeedbackService.get("/categories");
            return response.data
        } catch (error) {
            console.error("Error fetching walkin categories:", error);
            throw error;
        }
    },
};

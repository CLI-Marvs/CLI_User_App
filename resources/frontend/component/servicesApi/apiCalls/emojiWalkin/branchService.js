import walkinFeedbackService from '@/component/servicesApi/walkinFeedbackService';

export const branchService = {
    /*
     * Fetches all walkin transactions from the server.
     * @returns {Promise<Object>} A promise that resolves to the response containing all walkin transactions.
     * @throws {Error} If the request fails.
     */
    getAllBranches: async () => {
        try {
            const response = await walkinFeedbackService.get("/branches");
            return response.data
        } catch (error) {
            console.error("Error fetching walkin branches:", error);
            throw error;
        }
    },
};

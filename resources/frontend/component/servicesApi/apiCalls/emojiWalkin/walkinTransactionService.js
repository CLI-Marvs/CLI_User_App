import walkinFeedbackService from "@/component/servicesApi/walkinFeedbackService";

export const walkinTransactionService = {
    /*
     * Fetches all initial walkin transactions
     * @returns {Promise<Object>} A promise that resolves to the response containing all walkin transactions.
     * @throws {Error} If the request fails.
     */
    getAllWalkinTransactions: async () => {
        try {
            const response = await walkinFeedbackService.get("/transactions");
            return response.data;
        } catch (error) {
            console.error("Error fetching walkin transactions:", error);
            throw error;
        }
    },

    /*
     * Creates a new walkin transaction.
     * @param {Object} data - The data for the new walkin transaction.
     * @returns {Promise<Object>} A promise that resolves to the response containing the created walkin transaction.
     * @throws {Error} If the request fails.
     */
    createWalkinTransactionDetail: async (payload) => {
        try {
            const response = await walkinFeedbackService.post(
                `/admin/transactions/${payload.walkin_transaction_id}/details`,
                payload
            );
            return response.data;
        } catch (error) {
            console.error("Error creating walkin transaction:", error);
            throw error;
        }
    },
    
    updateWalkinTransactionStatus: async (payload) => {
        try {
            // Add this route to your admin group
            const response = await walkinFeedbackService.put(
                `/admin/transactions/${payload.walkin_transaction_id}`,
                { status: payload.status }
            );
            return response.data;
        } catch (error) {
            console.error("Error updating walkin transaction status:", error);
            throw error;
        }
    },
};

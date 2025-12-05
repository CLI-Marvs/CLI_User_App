import walkinFeedbackService from "frontend/component/servicesApi/walkinFeedbackService";

export const walkinTransactionService = {
    /*
     * Fetches all in queue  walkin transactions
     * @returns {Promise<Object>} A promise that resolves to the response containing all walkin transactions.
     * @throws {Error} If the request fails.
     */
    getQueuedWalkinTransactions: async (
        page = 1,
        perPage = 10,
        selectedBranch
    ) => {
        try {
            const queryParams = new URLSearchParams({
                page,
                per_page: perPage,
                status: "queue",
                slug: selectedBranch,
            }).toString();
            const response = await walkinFeedbackService.get(
                `/admin/transactions/queue?${queryParams}`
            );
            return response.data.data;
        } catch (error) {
            console.error("Error fetching walkin transactions:", error);
            throw error;
        }
    },

    /**
     * Get all walkin transactions history
     *
     * @param {number} page - Current page number
     * @param {number} perPage - Items per page
     * @param {Object} activeSearch - Search filters
     */
    getWalkinTransactionsHistory: async (
        page = 1,
        perPage = 10,
        filters,
        slug
    ) => {
        try {
            const cleanFilters = Object.fromEntries(
                Object.entries(filters || {}).filter(
                    ([, v]) => v != null && v !== ""
                )
            );

            // Convert filters object into query parameters
            const queryParams = new URLSearchParams({
                page,
                per_page: perPage,
                ...cleanFilters,
                slug,
            }).toString();

            const response = await walkinFeedbackService.get(
                `/admin/transactions/history?${queryParams}`
            );
            return response.data.data;
        } catch (error) {
            console.error("Error fetching walkin transactions history:", error);
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
            const response = await walkinFeedbackService.put(
                `/transactions/${payload.walkin_transaction_id}`,
                payload
            );
            return response.data;
        } catch (error) {
            console.error("Error updating walkin transaction status:", error);
            throw error;
        }
    },
};

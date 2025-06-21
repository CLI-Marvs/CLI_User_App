import walkinFeedbackService from "@/component/servicesApi/walkinFeedbackService";

export const walkinTransactionService = {
    /*
     * Fetches all in queue  walkin transactions
     * @returns {Promise<Object>} A promise that resolves to the response containing all walkin transactions.
     * @throws {Error} If the request fails.
     */
    getQueuedWalkinTransactions: async (page = 1, perPage = 10) => {
        try {
            const queryParams = new URLSearchParams({
                page,
                per_page: perPage,
                status: "queue",
            }).toString();
            const response = await walkinFeedbackService.get(
                `/transactions?${queryParams}`
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
        activeSearch = {}
    ) => {
        try {
        
            // Convert activeSearch to plain object if it's URLSearchParams
            const searchObject =
                activeSearch instanceof URLSearchParams
                    ? Object.fromEntries(activeSearch)
                    : activeSearch;

            // Filter out empty values and format for Laravel
            const filters = Object.entries(searchObject)
                .filter(
                    ([_, value]) =>
                        value !== "" && value !== null && value !== undefined
                )
                .reduce((acc, [key, value]) => {
                    acc[`filters[${key}]`] = value;
                    return acc;
                }, {});

            const queryString = new URLSearchParams({
                page,
                per_page: perPage,
                ...filters,
            }).toString();
            console.log("Query String:", queryString);
            const response = await walkinFeedbackService.get(
                `/admin/transactions/history?${queryString}`
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

    // updateWalkinTransactionStatus: async (payload) => {
    //     try {
    //         const response = await walkinFeedbackService.put(
    //             `/admin/transactions/${payload.walkin_transaction_id}`,
    //             { status: payload.status }
    //         );
    //         return response.data;
    //     } catch (error) {
    //         console.error("Error updating walkin transaction status:", error);
    //         throw error;
    //     }
    // },
};

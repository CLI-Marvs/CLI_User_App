import walkinFeedbackService from "@/component/servicesApi/walkinFeedbackService";

export const branchService = {
    /*
     * Fetches all walkin transactions from the server.

     * @returns {Promise<Object>} A promise that resolves to the response containing all walkin transactions.
     * @throws {Error} If the request fails.
     */
    getAllBranches: async () => {
        try {
            const response = await walkinFeedbackService.get("/admin/branches");
            return response.data;
        } catch (error) {
            console.error("Error fetching walkin branches:", error);
            throw error;
        }
    },

    /**
     * Create a branch with desks
     *
     * @param {Object} payload - The payload containing branch details.
     */
    createBranch: async (payload) => {
        try {
            console.log(payload);
            const response = await walkinFeedbackService.post(
                "/admin/branches",
                payload
            );
            return response.data;
        } catch (error) {
            console.error("Error creating branch:", error);
            throw error;
        }
    },

    /**
     * Updates a branch with desks
     *
     * @param {Object} payload - The payload containing branch details.
     */
    updateBranch: async (id, payload) => {
        try {
            const response = await walkinFeedbackService.put(
                `/admin/branches/${id}`,
                payload
            );
            return response.data;
        } catch (error) {
            console.error("Error updating branch:", error);
            throw error;
        }
    },

    /**
     * Deletes a branch by its ID.
     *
     * @param {number} id - The ID of the branch to delete.
     */
    deleteBranch: async (id) => {
        try {
            const response = await walkinFeedbackService.delete(
                `/admin/branches/${id}`
            );
            return response.data;
        } catch (error) {
            console.error("Error deleting branch:", error);
            throw error;
        }
    },
};

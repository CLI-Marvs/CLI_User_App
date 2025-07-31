import walkinFeedbackService from "@/component/servicesApi/walkinFeedbackService";

export const personTypeService = {
    /**
     * Fetches all person types from the server.
     *
     * @returns Promise<Array>
     */
    getAllPersonTypes: async () => {
        try {
            const response = await walkinFeedbackService.get(
                "/admin/person-types"
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching person types:", error);
            throw error;
        }
    },
};

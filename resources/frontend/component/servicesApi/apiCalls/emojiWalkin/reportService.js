import walkinFeedbackService from "@/component/servicesApi/walkinFeedbackService";

export const reportService = {
    /**
     * Fetches all reports for both stand alone and queue linked.
     *
     * @returns Promise<Array>
     */
    getReports: async (filters) => {
        try {
            const response = await walkinFeedbackService.get(
                "/admin/reports/emoji-feedback",
                { params: filters }
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching reports:", error);
            throw error;
        }
    },
};

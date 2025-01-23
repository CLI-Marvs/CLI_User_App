import apiService from "@/component/servicesApi/apiService";

export const data = {
    getCustomerInquiries: async (params) => {
        try {
            const response = await apiService.get("customer/inquiries", {
                params: { ticketId: params.ticket_id, page: params.page }
            });

            return response?.data;
        } catch (error) {
            console.log("error", error);
        }
    },

    getCustomerData: async (currentPage) => {
        try {
            const response = await apiService.get("customer/data", {
                params: { page: currentPage + 1}
            });

            return response?.data;
        } catch (error) {
            console.log("error", error);
        }
    },

    getCustomerByDetails: async (email) => {
        try {
            const response = await apiService.get("customer/details", {
                params: { email },
            });

            return response?.data;
        } catch (error) {
            console.log("error", error);
        }
    },
};

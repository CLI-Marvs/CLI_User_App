import apiService from "@/component/servicesApi/apiService";

export const data = {
    getCustomerInquiries: async (params) => {
        try {
            console.log("params", params);
            const response = await apiService.get("customer/inquiries", {
                params: { ticketId: params.ticket_id, page: params.page }
            });

            return response?.data;
        } catch (error) {
            console.log("error", error);
        }
    },

    getCustomerData: async () => {
        try {
            const response = await apiService.get("customer/data");

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

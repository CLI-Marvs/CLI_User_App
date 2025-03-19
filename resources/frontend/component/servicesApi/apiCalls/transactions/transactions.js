import apiService from "@/component/servicesApi/apiService";

export const transaction = {
    transactionList: async (currentPage, filter = {}) => {
        try {
            const params = { page: currentPage + 1, ...filter };

            const response = await apiService.get("transaction-list", {
                params,
            });

            return response?.data.data;
        } catch (error) {
            console.log("error", error);
        }
    },

    transactionUpdate: async (params) => {
        try {
           
            const response = await apiService.patch("transaction-update", params);

            return response?.data;
        } catch (error) {
            console.log("error", error);
        }
    },

    invoicesList: async (currentPage, filter = {}) => {
        try {
            const params = { page: currentPage + 1, ...filter };

            const response = await apiService.get("get-invoices", {
                params,
            });

            return response?.data.data;
        } catch (error) {
            console.log("error", error);
        }
    },

};

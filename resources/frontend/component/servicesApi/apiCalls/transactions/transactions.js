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
            const response = await apiService.patch(
                "transaction-update",
                params
            );

            return response?.data;
        } catch (error) {
            console.log("error", error);
        }
    },

    invoicesList: async (currentPage, filter = {}) => {
        try {
            const params = { page: currentPage + 1, ...filter };

            const response = await apiService.get("invoices-list", {
                params,
            });

            return response?.data.data;
        } catch (error) {
            console.log("error", error);
        }
    },

    bankStatementsList: async (currentPage, filter = {}) => {
        try {
            const params = { page: currentPage + 1, ...filter };

            const response = await apiService.get("bank-statements-list", {
                params,
            });

            return response?.data.data;
        } catch (error) {
            console.log("error", error);
        }
    },

    retrieveBanks: async () => {
        try {
            const response = await apiService.get("retrieve-banks");
            return response?.data.data;
        } catch (error) {
            console.log("error", error);
        }
    },

    transactionReports: async (filter = {}) => {
        try {
            const params = { ...filter };
            const response = await apiService.get("transaction-reports", {
                params,
            });
            return response?.data.data;
        } catch (error) {
            console.log("error", error);
        }
    },

    exportTransactions: async (data) => {
        try {
            console.log("data", data);
            const payload = {
                columns: data.columns,
                filter: data.filter,
            };
            const response = await apiService.post(
                "export-transactions",
                payload,
                { responseType: "blob" }
            );

            return response;
        } catch (error) {
            console.log("error", error);
            throw error;
        }
    },

    retrieveSubFeatureId: async (name = {}) => {
        try {
            const params = { ...name };
            const response = await apiService.get("sub-feature-id", {
                params,
            });
            return response?.data.data;
        } catch (error) {
            console.log("error", error);
        }
    },

    retrieveColumns: async (subFeatureId = {}) => {
        try {
            const params = { ...subFeatureId };
            const response = await apiService.get("transaction-columns", {
                params
            });

            return response?.data.data;
        } catch (error) {
            console.log("error", error);
        }
    },

    storeViewAndColumns: async (data) => {
        try {
            const response = await apiService.post("store-view-and-columns", data);

            return response?.data.data;
        } catch (error) {
            console.log("error", error);
        }
    },

    setDefaultView: async (data) => {
        try {
            const response = await apiService.put("set-default-view", data);
            return response?.data.data;
        } catch (error) {
            console.log("error", error);
        }
    },
};

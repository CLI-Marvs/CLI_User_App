import apiService from "@/component/servicesApi/apiService";

export const priceListMasterService = {
    /**
     * Fetches the list of price list masters from the API.
     * @returns {Promise<Array>} Resolves with an array of price list masters.
     * @throws Will throw an error if the API request fails.
     */
    getPriceListMasters: async (page = 1, perPage = 10, filters) => {
        try {
            const cleanFilters = Object.fromEntries(
                Object.entries(filters || {}).filter(
                    ([_, v]) => v != null && v !== ""
                )
            );

            // Convert filters object into query parameters
            const queryParams = new URLSearchParams({
                page,
                per_page: perPage,
                ...cleanFilters, // Spread the filters object
            }).toString();

            const response = await apiService.get(
                `price-list-masters?${queryParams}`
            );
            return response;
        } catch (error) {
            console.error("Error getting price list masters:", error);
            throw error;
        }
    },

    getPriceListsForReviewerOrApprover: async (
        page = 1,
        perPage = 10,
        filters,
        extraParams
    ) => {
        console.log("extraParams",extraParams);
        try {
            const cleanFilters = Object.fromEntries(
                Object.entries(filters || {}).filter(
                    ([_, v]) => v != null && v !== ""
                )
            );
            const empId = extraParams.empId;
           
            // Convert filters object into query parameters
            const queryParams = new URLSearchParams({
                page,
                per_page: perPage,
                ...cleanFilters, // Spread the filters object
            }).toString();

            const response = await apiService.get(
                `price-list-masters/approved-or-reviewed/${empId}?${queryParams}`
            );
            return response;
        } catch (error) {
            console.error("Error getting price list masters:", error);
            throw error;
        }
    },

    /**
     * Stores a new price list master by sending a POST request to the API.
     * @param {Object} payload - The data to be sent in the request body.
     * @returns {Promise<Object>} Resolves with the API response.
     * @throws Will throw an error if the API request fails.
     */
    storePriceListMasters: async (payload) => {
        try {
            const response = await apiService.post(
                "price-list-masters/",
                payload
            );
            return response;
        } catch (error) {
            console.error("Error storing price list masters:", error);
            throw error;
        }
    },

    /**
     * Updates the price list masters, including Price List Settings,
     * floor premiums, Additional premiums, and price versions.
     */
    updatePriceListMasters: async (payload) => {
        try {
            const response = await apiService.put(
                "price-list-masters/update",
                payload
            );
            return response;
        } catch (error) {
            console.error("Error updating price list masters:", error);
            throw error;
        }
    },

    /**
     * Updates the price list master status.
     * If the status is "On-going approval," the user can click 'cancel'
     * to set the status to 'Inactive'.
     */
    updatePriceListMasterStatus: async (id) => {
        try {
            const response = await apiService.patch(
                `price-list-masters/${id}/status`
            );
            return response;
        } catch (error) {
            console.error("Error updating price list master status:", error);
            throw error;
        }
    },

    /**
     * Downloads the price list masters as an Excel file.
     */
    exportPriceListMasterDataToExcel: async (payload) => {
        try {
            const response = await apiService.post(
                "price-list-masters/export-excel",
                { payload }, // Send payload as is
                {
                    // Headers should be in a separate config object
                    headers: {
                        Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    },
                    responseType: "blob", // Add this to handle Excel file response
                }
            );
            return response;
        } catch (error) {
            console.error("Error downloading price list masters:", error);
            throw error;
        }
    },

    /**
     * Filter the price list masters
     */
    filterPriceListMaster: async (payload) => {
        console.log("payload", payload);
        try {
            const response = await apiService.post(
                "price-list-masters/filter",
                payload
            );
            console.log("result of filter", response);
        } catch (error) {
            console.error("Error filtering the pricelist:", error);
            throw error;
        }
    },
};

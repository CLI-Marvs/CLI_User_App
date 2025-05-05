import apiService from "@/component/servicesApi/apiService";

export const settings = {
    retrieveSettings: async (currentPage, filter = {}) => {
        try {
            const params = { page: currentPage + 1, ...filter };

            const response = await apiService.get("markup-settings", {
                params,
            });

            return response?.data.data;
        } catch (error) {
            console.log("error", error);
        }
    },

    storeSettings: async (formData) => {
        try {
            const response = await apiService.post("markup-settings", formData);

            return response;
        } catch (error) {
            console.log("error", error);
        }
    },

    updateSettings: async (formData) => {
        try {
            const response = await apiService.put(`markup-settings/${formData.id}`, formData);

            return response;
        } catch (error) {
            console.log("error", error);
        }
    }

};

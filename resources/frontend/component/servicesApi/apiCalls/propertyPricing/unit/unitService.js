import apiService from "@/component/servicesApi/apiService";

export const unitService = {
    //Function to store property master data
    storeUnit: async (payload) => {
        try {
            const response = await apiService.post("units/", payload, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response;
        } catch (error) {
            console.error("Error unit data:", error);
            throw error;
        }
    },

    //Function to count all units floor in the uploaded excel
    countFloor: async (towerPhaseId, excelId) => {
        try {
            const response = await apiService.get(
                `units/floors/${towerPhaseId}/${excelId}`
            );
            return response;
        } catch (error) {
            console.error("Error counting floor:", error);
            throw error;
        }
    },

    //Function to check existing units for a tower phase
    getExistingUnits: async (towerPhaseId) => {
        try {
            const response = await apiService.get(
                `units/check/${towerPhaseId}`
            );
            return response;
        } catch (error) {
            console.error("Error checking existing units:", error);
            throw error;
        }
    },

    //Function to get all units in a tower phase and selected floor
    getUnitsInTowerPhase: async (towerPhaseId, selectedFloor) => {
 

        try {
            const response = await apiService.get(
                `units/tower/${towerPhaseId}/floor/${selectedFloor}/units`
            );
            return response;
        } catch (error) {
            console.error("Error getting units in tower phase:", error);
            throw error;
        }
    },
};

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
    getExistingUnits: async (towerPhaseId, excelId) => {
        if (excelId === null || excelId === undefined) {
            console.warn("Skipping API request: excelId is null or undefined");
            return { data: { data: [] } }; // Return empty data to prevent errors
        }
        try {
            const response = await apiService.get(
                `units/check/${towerPhaseId}/${excelId}`
            );
            return response;
        } catch (error) {
            console.error("Error checking existing units:", error);
            throw error;
        }
    },

    //Function to get all units in a tower phase and selected floor
    getUnitsInTowerPhase: async (towerPhaseId, selectedFloor, excelId) => {
        try {
            console.log(
                "getUnitsInTowerPhase",
                towerPhaseId,
                selectedFloor,
                excelId
            );
            const response = await apiService.get(
                `units/tower/${towerPhaseId}/floor/${selectedFloor}/units/${excelId}`
            );
            return response;
        } catch (error) {
            console.error("Error getting units in tower phase:", error);
            throw error;
        }
    },

    //Function to store unit details from the system
    storeUnitDetails: async (payload) => {
        try {
            const response = await apiService.post("units/store-unit", payload);
            return response;
        } catch (error) {
            console.error("Error storing unit details:", error);
            throw error;
        }
    },

    //Function to save the computed unit pricing data to the database
    saveComputedUnitPricingData: async (payload) => {
        try {
          
            const response = await apiService.post(
                "units/save-computed-pricing-data",
                payload,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
        
            return response;
        } catch (error) {
            console.error("Error saving pricing data:", error);
            throw error;
        }
    },
};

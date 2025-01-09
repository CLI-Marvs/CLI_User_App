import { featureService } from "../../../servicesApi/apiCalls/roleManagement";
import { useState } from "react";
const useFeatures = () => {
    const [features, setFeatures] = useState([]);
    const [isFeatureFetching, setIsFeatureFetching] = useState(false);

    const fetchFeatures = async () => {
        try {
            setIsFeatureFetching(true);
            const featuresData = await featureService.getAllFeatures();
            setFeatures(featuresData);
        } catch (error) {
            console.error("Error fetching features:", error);
        } finally {
            setIsFeatureFetching(false);
        }
    };

    return {
        features,
        isFeatureFetching,
        fetchFeatures,
    };
};

export default useFeatures;

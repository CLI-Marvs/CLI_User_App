import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { featureService } from '@/component/servicesApi/apiCalls/roleManagement';

const FeatureContext = createContext();

export const FeatureProvider = ({ children }) => {

    const [features, setFeatures] = useState(null);
    const [propertySettingsFeatures, setPropertySettingsFeatures] = useState([]);
    const [isFeatureFetching, setIsFeatureFetching] = useState(false);
    const [error, setError] = useState(null);

    
    const fetchFeatures = useCallback(async (forceFetch = false) => {
        if (!forceFetch && features) {
            return features; // Return current features if already loaded
        }

        setIsFeatureFetching(true);
        try {
            const response = await featureService.getAllFeatures();
            setFeatures(response);
            setError(null);
            return response;
        } catch (error) {
            setError(error.message);
            console.error("Error fetching featureTest:", error);
        } finally {
            setIsFeatureFetching(false);
        }
    }, [features]);


    const fetchPropertySettingsFeatures = useCallback(
        async (forceFetch = false) => {
            if (
                !forceFetch &&
                propertySettingsFeatures && propertySettingsFeatures.length > 0
            ) {
                return propertySettingsFeatures;
            }
            setIsFeatureFetching(true);
            try {
                const response =
                    await featureService.getPropertySettingsFeatures(); 
                setPropertySettingsFeatures(response);
                setError(null);
                return response;
            } catch (error) {
                setError(error.message);
                console.error(
                    "Error fetching property settings features:",
                    error
                );
            } finally {
                setIsFeatureFetching(false);
            }
        },
        [propertySettingsFeatures]
    );

    const value = useMemo(
        () => ({
            features,
            propertySettingsFeatures,
            isFeatureFetching,
            fetchFeatures,
            fetchPropertySettingsFeatures,
            error, 
        }),
        [features, propertySettingsFeatures, isFeatureFetching, fetchFeatures, fetchPropertySettingsFeatures, error]
    );

    return (
        <FeatureContext.Provider value={value}>
            {children}
        </FeatureContext.Provider>
    );
};

const useFeature = () => {
    const context = useContext(FeatureContext);
    if (!context) {
        throw new Error('usefeatureTest must be used within a FeatureContextProvider');
    }
    return context;
};

export default useFeature
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { featureService } from '@/component/servicesApi/apiCalls/roleManagement';

const FeatureContext = createContext();

export const FeatureProvider = ({ children }) => {

    const [features, setFeatures] = useState(null);
    const [isFeatureFetching, setIsFeatureFetching] = useState(false);
    const [error, setError] = useState(null);

    // This function does the actual database fetch
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


    const value = useMemo(
        () => ({
            features,
            isFeatureFetching,
            fetchFeatures,
            error, 
        }),
        [features, isFeatureFetching, fetchFeatures, error]
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
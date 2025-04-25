<?php

namespace App\Services;

use App\Repositories\Implementations\FeatureRepository;


class FeatureService
{
    protected $repository;
    public function __construct(FeatureRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Get all features and property settings features
     */
    public function getFeaturesWithPropertySettings()
    {
        // Fetch all features
        $features = $this->repository->getAllFeatures();

        // Fetch property settings features
        $propertySettingsFeatures = $this->repository->getPropertySettingsFeatures();

        // Combine the data
        return [
            'features' => $features,
            'property_settings_features' => $propertySettingsFeatures
        ];
    }
}

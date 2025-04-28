<?php

namespace App\Repositories\Implementations;


use Exception;
use App\Models\PropertyMaster;
use Illuminate\Support\Facades\DB;

class PropertyMasterRepository
{
    protected $model;

    public function __construct(PropertyMaster $model)
    {
        $this->model = $model;
    }

    /* 
     Store property data
    */
    public function store(array $data)
    {
        DB::beginTransaction();
        try {
            $propertyMaster = $this->findPropertyMaster($data['property_masters_id']);
            $towerPhase = $this->createTowerPhase($propertyMaster, $data);
            $priceListMaster = $this->createPriceListMaster($towerPhase, $data);

            $this->createCommercialDetails($propertyMaster, $data, $priceListMaster);

            DB::commit();

            return $this->buildSuccessResponse($propertyMaster);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->buildErrorResponse($e);
        }
    }

    /**
     * Find the property master by its ID.
     *
     * @param int $propertyMasterId
     * @return mixed
     */
    private function findPropertyMaster($propertyMasterId)
    {
        return $this->model->find($propertyMasterId);
    }

    /**
     * Create a new tower phase for the given property master.
     *
     * @param mixed $propertyMaster
     * @param array $data
     * @return mixed
     */
    private function createTowerPhase($propertyMaster, array $data)
    {
        $towerPhase = $propertyMaster->towerPhases()->create([
            'property_masters_id' => $propertyMaster->id,
            'tower_phase_name' => $data['tower_phase'],
            'tower_description' => $data['tower_description']
        ]);

        $towerPhase->update(['main_towerphase_id' => $towerPhase->id]);

        return $towerPhase;
    }

    /**
     * Create a price list master associated with a tower phase.
     *
     * @param mixed $towerPhase
     * @param array $data
     * @return mixed
     */
    private function createPriceListMaster($towerPhase, array $data)
    {
        return $towerPhase->priceListMasters()->create([
            'tower_phase_id' => $towerPhase->id,
            'status' => $data['status'],
        ]);
    }

    /**
     * Create commercial details for the property master.
     *
     * @param mixed $propertyMaster
     * @param array $data
     * @param mixed $priceListMaster
     * @return void
     */
    private function createCommercialDetails($propertyMaster, array $data, $priceListMaster)
    {
        $extractedGoogleMapLink = (!isset($data['google_map_link']) || empty(trim($data['google_map_link'])))
            ? null
            : $this->parseGoogleMapLink($data['google_map_link']);

        $propertyMaster->propertyCommercialDetail()->create([
            'type' => $data['type'],
            'barangay' => $data['barangay'],
            'city' => $data['city'],
            'province' => $data['province'],
            'country' => $data['country'],
            'latitude' => $extractedGoogleMapLink['latitude'] ?? null,
            'longitude' => $extractedGoogleMapLink['longitude'] ?? null,
            'price_list_master_id' => $priceListMaster->id,
        ]);
    }

    /**
     * Build the success response including property details.
     *
     * @param mixed $propertyMaster
     * @return array
     */
    private function buildSuccessResponse($propertyMaster)
    {
        $result = $this->model
            ->with([
                'towerPhases' => function ($query) {
                    $query->select('id', 'property_masters_id', 'tower_phase_name', 'tower_description')
                        ->latest('id')
                        ->limit(1);
                },
                'propertyCommercialDetail' => function ($query) {
                    $query->select('id', 'property_master_id', 'type', 'barangay', 'city', 'province', 'latitude', 'longitude', 'price_list_master_id')
                        ->latest('id')
                        ->limit(1);
                },
            ])
            ->select('id', 'property_name', 'status')
            ->find($propertyMaster->id);

        return [
            'data' => $result,
            'message' => 'Property and related details added successfully!',
            'success' => true
        ];
    }

    /**
     * Build the error response in case of failure.
     *
     * @param \Exception $exception
     * @return array
     */
    private function buildErrorResponse($exception)
    {
        return [
            'success' => false,
            'message' => 'Failed to add property: ' . $exception->getMessage(),
        ];
    }

    /**
     * Extracts location data from various formats of Google Maps URLs.
     *
     * @param string $googleMapLink Google Maps googleMapLink
     * @return array|null Location data array or null if parsing failed
     */
    public function parseGoogleMapLink($googleMapLink)
    {
        try {
            if (empty(trim($googleMapLink))) {
                return null;
            }

            $result = [
                'latitude' => null,
                'longitude' => null,
            ];

            $parsedUrl = parse_url($googleMapLink);

            if (!isset($parsedUrl['host']) || strpos($parsedUrl['host'], 'google.com') === false) {
                return null;
            }

            // 1. Extract pinned location from !3dlatitude!4dlongitude
            if (preg_match('/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/', $googleMapLink, $pinnedLocation)) {
                $result['latitude'] = floatval($pinnedLocation[1]);
                $result['longitude'] = floatval($pinnedLocation[2]);
            }

            // 2. If no pinned location, extract @latitude,longitude (map center)
            if (!$result['latitude'] && preg_match('/@(-?\d+\.\d+),(-?\d+\.\d+)/', $googleMapLink, $mapCenter)) {
                $result['latitude'] = floatval($mapCenter[1]);
                $result['longitude'] = floatval($mapCenter[2]);
            }

            // 3. If no @latitude,longitude, extract q=latitude,longitude
            if (!$result['latitude'] && preg_match('/q=(-?\d+\.\d+),(-?\d+\.\d+)/', $googleMapLink, $queryCoords)) {
                $result['latitude'] = floatval($queryCoords[1]);
                $result['longitude'] = floatval($queryCoords[2]);
            }

            return ($result['latitude'] && $result['longitude']) ? $result : null;
        } catch (Exception $e) {
            error_log('Error parsing Google Maps link: ' . $e->getMessage());
            return null;
        }
    }


    /**
     * Get all property names
     */
    public function getPropertyNames()
    {
        return $this->model->pluck('property_name')->toArray();
    }


    /**
     * Get all property names with ID
     */
    public function getPropertyNamesWithIds()
    {
        return $this->model
            ->orderBy('property_name', 'asc')
            ->pluck('property_name', 'id')
            ->toArray();
    }

    public function getAllPropertiesWithFeatures(array $validatedData)
    {

        $properties = $this->model->with('features')
            ->orderBy('property_name', 'asc')
            ->paginate(
                $validatedData['per_page'],
                ['*'],
                'page',
                $validatedData['page']
            );

        return [
            'data' =>
            $properties->getCollection()->map(function ($property) {
                return [
                    'id' => $property->id,
                    'property_name' => $property->property_name,
                    'description' => $property->description ?? null,
                    'entity' => $property->entity ?? null,
                    'features' => $property->features->map(function ($feature) {
                        return [
                            'id' => $feature->id,
                            'name' => $feature->name,
                            'status' => $feature->pivot->status,
                        ];
                    }),
                ];
            })->toArray(),
            'pagination' => [
                'current_page' => $properties->currentPage(),
                'last_page' => $properties->lastPage(),
                'per_page' => $properties->perPage(),
                'total' => $properties->total(),
                'next_page_url' => $properties->nextPageUrl(),
                'prev_page_url' => $properties->previousPageUrl(),
            ]
        ];
    }

    public function updatePropertyFeatures(array $data, int $id)
    {
        // Find the property by ID
        $property = $this->model->findOrFail($id);

        $property->update([
            'property_name' => $data['propertyName'] ?? null,
            'description' => $data['description'] ?? null,
            'entity' => $data['entity'] ?? null,
        ]);

        // Get existing feature IDs for this property
        $existingFeatureIds = $property->features()->pluck('features.id')->toArray();

        // Iterate through the features array and update the pivot table
        foreach ($data['features'] as $featureData) {
            if (in_array($featureData['id'], $existingFeatureIds)) {
                // Update existing feature
                $property->features()->updateExistingPivot(
                    $featureData['id'],
                    ['status' => $featureData['status'] === false ? 'Disabled' : 'Enabled']
                );
            } else {
                // Attach new feature
                $property->features()->attach($featureData['id'], [
                    'status' => $featureData['status'] === false ? 'Disabled' : 'Enabled'
                ]);
            }
        }

        // Reload the features relationship
        $property->load('features');
        return $property;
    }

    public function storePropertyFeature(array $data)
    {
        try {
            $property = $this->model->create([
                'property_name' => $data['propertyName'],
                'description' => $data['description'] ?? null,
                'entity' => $data['entity'] ?? null,
                'status' => 'Draft',
            ]);

            // Attach the features to the property with the specified status
            foreach ($data['features'] as $feature) {
                $property->features()->attach($feature['id'], ['status' => 'Enabled']);
            }

            // Reload the property with features
            $property->load('features');

            return $property;
        } catch (\Exception $e) {
            throw new \Exception('Failed to store property feature: ' . $e->getMessage());
        }
    }
}

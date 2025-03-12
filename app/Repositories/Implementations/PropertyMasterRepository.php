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
            $propertyMaster = $this->model->find($data['property_masters_id']);

            // Create the tower phase
            $towerPhase = $propertyMaster->towerPhases()->create([
                'property_masters_id' => $propertyMaster->id,
                'tower_phase_name' => $data['tower_phase'],
                'tower_description' => $data['tower_description']
            ]);

            // Update the tower phase with its own ID
            $towerPhase->update([
                'main_towerphase_id' => $towerPhase->id
            ]);
            $extractedGoogleMapLink = (!isset($data['google_map_link']) || empty(trim($data['google_map_link'])))
                ? null
                :  $this->parseGoogleMapLink($data['google_map_link']);

            // Create the price list master
            $priceListMaster = $towerPhase->priceListMasters()->create([
                'tower_phase_id' => $towerPhase->id,
                'status' => $data['status'],
            ]);


            // Create the commercial details
            $propertyMaster->propertyCommercialDetail()->create([
                'type' => $data['type'],
                'barangay' => $data['barangay'],
                'city' => $data['city'],
                'province' => $data['province'],
                'country' => $data['country'],
                'latitude'  => $extractedGoogleMapLink['latitude'] ?? null,
                'longitude' => $extractedGoogleMapLink['longitude'] ?? null,
                'price_list_master_id' => $priceListMaster->id,
            ]);


            DB::commit();
            // Fetch the property master with specific relationships and fields
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
                ->select('id', 'property_name')
                ->find($propertyMaster->id);

            // Return success status and optional message
            return [
                'data' => $result,
                'message' => 'Property and related details added successfully!',
                'success' => true
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            // Return failure status and error message
            return [
                'success' => false,
                'message' => 'Failed to add property: ' . $e->getMessage(),
            ];
        }
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
}

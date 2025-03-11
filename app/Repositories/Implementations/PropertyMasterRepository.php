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
            $extractedGoogleMapLink = $this->parseGoogleMapLink($data['google_map_link']);

            if (!$extractedGoogleMapLink || !isset($extractedGoogleMapLink['latitude'], $extractedGoogleMapLink['longitude'])) {
                throw new \Exception('Invalid Google Map link: Unable to extract coordinates.');
            }

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
                'latitude'  => $extractedGoogleMapLink['latitude'],
                'longitude' => $extractedGoogleMapLink['longitude'],
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
                        $query->select('id', 'property_master_id', 'type', 'barangay', 'city', 'province', 'latitude', 'longitude')
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
            $result = [
                'name' => '',
                'latitude' => null,
                'longitude' => null,
                'placeId' => null
            ];

            // Parse googleMapLink
            $parsedUrl = parse_url($googleMapLink);

            if (!isset($parsedUrl['host']) || strpos($parsedUrl['host'], 'google.com') === false) {
                return null; // Not a Google Maps googleMapLink
            }

            // Extract name from /place/{name}/ pattern
            if (preg_match('/\/place\/([^\/]+)/', $parsedUrl['path'] ?? '', $nameMatch)) {
                $result['name'] = urldecode(str_replace('+', ' ', $nameMatch[1]));
            }

            // Extract coordinates from @latitude,longitude
            if (preg_match('/@(-?\d+\.\d+),(-?\d+\.\d+)/', $googleMapLink, $locationMatch)) {
                $result['latitude'] = floatval($locationMatch[1]);
                $result['longitude'] = floatval($locationMatch[2]);
            }

            // Extract query parameters if available
            if (isset($parsedUrl['query'])) {
                parse_str($parsedUrl['query'], $queryParams);

                // Extract coordinates from 'll' parameter
                if (!$result['latitude'] && isset($queryParams['ll'])) {
                    list($latitude, $longitude) = explode(',', $queryParams['ll']);
                    $result['latitude'] = floatval($latitude);
                    $result['longitude'] = floatval($longitude);
                }

                // Extract place ID from 'cid' parameter or !1s pattern
                if (isset($queryParams['cid'])) {
                    $result['placeId'] = $queryParams['cid'];
                } elseif (preg_match('/!1s([\w\-]+)/', $googleMapLink, $placeIdMatch)) {
                    $result['placeId'] = $placeIdMatch[1];
                }

                // Extract name from 'q' parameter if available
                if (!$result['name'] && isset($queryParams['q'])) {
                    $result['name'] = urldecode($queryParams['q']);
                }
            }

            // Fallback: Detect generic coordinates in googleMapLink
            if (!$result['latitude'] && preg_match('/[?&@](-?\d+\.\d+),(-?\d+\.\d+)/', $googleMapLink, $genericCoords)) {
                $result['latitude'] = floatval($genericCoords[1]);
                $result['longitude'] = floatval($genericCoords[2]);
            }

            // Ensure at least latitude and longitude exist
            if ($result['latitude'] && $result['longitude']) {
                return $result;
            }

            return null;
        } catch (Exception $e) {
            error_log('Error parsing Google Maps googleMapLink: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Get specific master data
     */
    public function getPropertyMaster($id)
    {
        return $this->model->find($id);
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

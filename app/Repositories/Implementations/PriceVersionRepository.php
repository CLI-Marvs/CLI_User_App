<?php

namespace App\Repositories\Implementations;

use App\Models\PaymentScheme;
use App\Models\PriceVersion;
use App\Models\PropertyMaster;
use Illuminate\Support\Facades\DB;

class PriceVersionRepository
{
    protected $model;
    protected $towerPhase;
    public function __construct(PriceVersion $model)
    {
        $this->model = $model;
    }


    /*
     * Get all price versions data
     */
    public function index()
    {
        // First pluck all unique property_masters_id values
        $propertyMasterIds = $this->model->pluck('property_masters_id')->unique()->values();

        // Get property master data
        $propertyMasters = PropertyMaster::whereIn('id', $propertyMasterIds)
            ->get()
            ->keyBy('id'); // Index by ID for easier lookup

        // Then retrieve full data for these IDs
        $priceVersions = $this->model
            ->whereIn('property_masters_id', $propertyMasterIds)
            ->where('status', '=', 'Active')
            ->orderBy('created_at', 'desc')
            ->get();

        if ($priceVersions->isEmpty()) {
            return response()->json([
                'status' => 'error',
                'message' => 'No price versions found',
                'data' => []
            ], 404);
        }


        // Group and transform the data
        $groupedData = $priceVersions
            ->groupBy('property_masters_id')
            ->map(function ($versions, $propertyId) use ($propertyMasters) {
                return [
                    'property_masters_id' => $propertyId,
                    'propertyName' => $propertyMasters[$propertyId]->property_name ?? null,
                    'tower_phase_name' =>
                    $this->towerPhase,
                    'versions' => $versions->map(function ($version) {
                        $this->towerPhase = $version->tower_phase_name;
                        return [
                            'id' => $version->id,
                            'version' => $version->version_name,
                            'percent_increase' => $version->percent_increase,
                            'no_of_allowed_buyers' => $version->allowed_buyer,
                            'expiry_date' => $version->expiry_date,
                            'status' => $version->status,
                            'created_at' => $version->created_at,
                            'updated_at' => $version->updated_at,
                        ];
                    })->values()->all()
                ];
            })->values();

        return  [
            'status' => 'success',
            'data' => $groupedData
        ];
    }

    /**
     * Store price version data
     */
    public function store(array $data)
    {

        DB::beginTransaction();
        try {
            $priceVersions = [];
            foreach ($data['price_version'] as $version) {
                // Convert expiry_date to database format
                $expiryDate = \DateTime::createFromFormat('m-d-Y H:i:s', $version['expiry_date']);
                $priceVersion = $this->model->create([
                    'property_masters_id' => $data['property_id'],
                    'tower_phase_name' => $data['tower_phase_id'],
                    'version_name' => $version['name'],
                    'percent_increase' => $version['percent_increase'],
                    'allowed_buyer' => $version['no_of_allowed_buyers'],
                    'expiry_date' => $expiryDate->format('Y-m-d H:i:s'),
                    'status' => 'Active'
                ]);

                $priceVersions[] = $priceVersion;
            }

            DB::commit();
            return $priceVersion->fresh();
        } catch (\Exception $e) {
            DB::rollBack();
            // Return failure status and error message
            return [
                'success' => false,
                'message' => 'Failed to add property: ' . $e->getMessage(),
            ];
        }
    }
}

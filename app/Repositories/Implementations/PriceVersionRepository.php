<?php

namespace App\Repositories\Implementations;

use App\Models\PaymentScheme;
use App\Models\PriceVersion;
use Illuminate\Support\Facades\DB;

class PriceVersionRepository
{
    protected $model;

    public function __construct(PriceVersion $model)
    {
        $this->model = $model;
    }


    /*
     * Get all price versions data
     */
    public function index()
    {
        //TODO: Paginate to 10 records
        // First pluck all unique property_masters_Id values
        $propertyMasterIds = $this->model->pluck('property_masters_id')->unique()->values();

        // Then retrieve full data for these IDs
        $priceVersions = $this->model
            ->whereIn('property_masters_id', $propertyMasterIds)
            ->orderBy('created_at', 'desc')
            ->get();

        if ($priceVersions->isEmpty()) {
            return response()->json([
                'status' => 'error',
                'message' => 'No price versions found',
                'data' => []
            ], 404);
        }

        return [
            $priceVersions,
            'masterIds' => $propertyMasterIds
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
                    'tower_phase_name' => $data['tower_phase'],
                    'version_name' => $version['name'],
                    'percent_increase' => $version['percent_increase'],
                    'allowed_buyer' => $version['no_of_allowed_buyers'],
                    'expiry_date' => $expiryDate->format('Y-m-d H:i:s'),
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

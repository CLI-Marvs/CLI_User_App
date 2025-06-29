<?php

namespace App\Repositories\Implementations;

use App\Models\PriceVersion;
use App\Models\PaymentScheme;
use App\Traits\HasExpiryDate;
use App\Models\PropertyMaster;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;

class PriceVersionRepository
{
    use HasExpiryDate;

    protected $model;
    protected $towerPhase;
    public function __construct(PriceVersion $model)
    {
        $this->model = $model;
    }


    /*
     * Get all price versions data
     */
    public function index($validatedData)
    {
        // First pluck all unique property_masters_id values
        $propertyMasterIds = $this->model->pluck('property_masters_id')->unique()->values();

        // Get property master data
        $propertyMasters = PropertyMaster::whereIn('id', $propertyMasterIds)
            ->get()
            ->keyBy('id');

        // Then retrieve full data for these IDs
        $priceVersions = $this->model
            ->whereIn('property_masters_id', $propertyMasterIds)
            ->where('status', '=', 'Active')
            ->orderBy('created_at', 'desc')
            ->paginate(
                $validatedData['per_page'],
                ['*'],
                'page',
                $validatedData['page']
            );


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
                $towerPhase = optional($versions->first())->tower_phase_name;
                return [
                    'property_masters_id' => $propertyId,
                    'propertyName' => $propertyMasters[$propertyId]->property_name ?? null,
                    'tower_phase_name' =>
                    $towerPhase,
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
            });
        // Convert collection to pagination
        $perPage = $validatedData['per_page'];
        $currentPage = $validatedData['page'];
        $pagedData = new LengthAwarePaginator(
            $groupedData->forPage($currentPage, $perPage)->values(),
            $groupedData->count(),
            $perPage,
            $currentPage,
            ['path' => request()->url()]
        );
        
        return  [
            'data' => $pagedData->items(),
            'pagination' => [
                'current_page' => $pagedData->currentPage(),
                'last_page' => $pagedData->lastPage(),
                'per_page' => $pagedData->perPage(),
                'total' => $pagedData->total(),
                'next_page_url' => $pagedData->nextPageUrl(),
                'prev_page_url' => $pagedData->previousPageUrl(),
            ]
        ];
    }

    /**
     * Store price version data
     */
    public function storePriceVersion(array $data)
    {
        DB::beginTransaction();
        try {
            $priceVersions = [];

            foreach ($data['price_version'] as $version) {
                $priceVersions[] = $this->createPriceVersion($data, $version);
            }

            DB::commit();

            // Return the last created price version with fresh data
            return end($priceVersions)->fresh();
        } catch (\Exception $e) {
            DB::rollBack();

            return [
                'success' => false,
                'message' => 'Failed to add property: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Create a single price version record
     * 
     * @param array $data Main data array
     * @param array $version Version specific data
     * @return mixed The created price version model
     */
    private function createPriceVersion(array $data, array $version)
    {
        return $this->model->create([
            'property_masters_id' => $data['property_id'],
            'tower_phase_name' => $data['tower_phase_id'],
            'version_name' => $version['name'],
            'percent_increase' => $version['percent_increase'],
            'allowed_buyer' => $version['no_of_allowed_buyers'],
            'expiry_date' => $this->formatExpiryDate($version['expiry_date']),
            'status' => 'Active'
        ]);
    }
}

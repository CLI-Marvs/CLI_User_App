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
     * Get all property price list masters
     */
    public function index()
    {
        //TODO: Paginate here into 10 per page
        $priceListMasters = $this->model->with([
            'towerPhase.propertyMaster',  // Nested relationship to get property details
            'towerPhase',
            'priceBasicDetail',
            'towerPhase.propertyMaster.propertyCommercialDetail',
            'paymentSchemes',
        ])->select('price_list_masters.*')  // Select all fields from price list masters
            ->orderBy('created_at', 'desc')
            ->get();



        // Transform the data to get specific fields
        $transformedData = $priceListMasters->map(function ($priceList) {
            // Decode payment_scheme_id and ensure it's an array (default to empty array if null)
            $paymentSchemeIds = json_decode($priceList->payment_scheme_id, true);
            // Ensure it's an array (fallback to empty array if null)
            $paymentSchemeIds = is_array($paymentSchemeIds) ? $paymentSchemeIds : [];
            // Fetch PaymentSchemes by the decoded IDs
            $paymentSchemeData = PaymentScheme::whereIn('id', $paymentSchemeIds)->get();

            return [
                'price_list_master_id' => $priceList->id,
                'updated_at' => $priceList->updated_at,
                'tower_phase_id' => $priceList->towerPhase->id,
                'tower_phase_name' => $priceList->towerPhase->tower_phase_name,
                'status' => $priceList->status,
                'property_name' => $priceList->towerPhase->propertyMaster->property_name ?? null,
                'pricebasic_details' => $priceList->priceBasicDetail ? $priceList->priceBasicDetail->toArray() : null,
                'property_commercial_detail' => $priceList->towerPhase->propertyMaster->propertyCommercialDetail->toArray(),
                'payment_scheme' => $paymentSchemeData->map(function ($scheme) {
                    return [
                        'payment_scheme_name' => $scheme->payment_scheme_name,
                        'id' => $scheme->id,
                    ];
                }),

            ];
        });

        return $transformedData;
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

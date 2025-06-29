<?php

namespace App\Repositories\Implementations;

use Exception;
use Carbon\Carbon;
use App\Models\Unit;
use App\Models\Employee;
use App\Models\FloorPremium;
use App\Models\PriceVersion;
use Maatwebsite\Excel\Excel;
use App\Models\PaymentScheme;
use App\Traits\HasExpiryDate;
use App\Models\PriceListMaster;
use App\Models\PriceBasicDetail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Traits\HandlesMonetaryValues;
use App\Exports\PriceListMasterExportData;
use Symfony\Component\HttpFoundation\BinaryFileResponse;


class PriceListMasterRepository
{
    use HasExpiryDate, HandlesMonetaryValues;
    protected $model;
    protected $priceVersionModel;
    protected $unitModel;
    protected $floorPremiumModel;
    protected  $excel;
    protected $employeeModel;


    public function __construct(PriceListMaster $model, PriceVersion $priceVersionModel, FloorPremium $floorPremiumModel, Excel $excel, Unit $unitModel, Employee $employeeModel)
    {
        $this->model = $model;
        $this->priceVersionModel = $priceVersionModel;
        $this->floorPremiumModel = $floorPremiumModel;
        $this->excel = $excel;
        $this->unitModel = $unitModel;
        $this->employeeModel = $employeeModel;
    }


    /*
     * Get price list data with pagination of 10 per page, apply the filters also if any
     */
    public function index(array $validatedData)
    {
        $query = $this->getPriceListMastersWithRelations();

        // Apply filtering for approved/reviewed employees
        // $userId = auth()->id(); // Get logged-in user ID
        // $queryAllPriceListMasters = $this->getPriceListMastersWithRelations();
        // $test =   $queryAllPriceListMasters->where(function ($q) use ($userId) {
        //     $q->where('reviewed_by_employee_id', $userId)
        //         ->orWhere('approved_by_employee_id', $userId);
        // });
        // dd($test);

        $query = $this->filterPriceList($validatedData, $query);
        $priceListMasters = $query->paginate(
            $validatedData['per_page'],
            ['*'],
            'page',
            $validatedData['page']
        );

        return [
            'data' => $priceListMasters->getCollection()->map(
                fn($priceList) =>
                $this->transformPriceListMaster($priceList)
            ),
            'pagination' => [
                'current_page' => $priceListMasters->currentPage(),
                'last_page' => $priceListMasters->lastPage(),
                'per_page' => $priceListMasters->perPage(),
                'total' => $priceListMasters->total(),
                'next_page_url' => $priceListMasters->nextPageUrl(),
                'prev_page_url' => $priceListMasters->previousPageUrl(),
            ]
        ];
    }

    /**
     * Filter price list base
     */
    public function filterPriceList($validatedData, $query)
    {
        return $query
            //Filter by Property Name
            ->when(!empty($validatedData['property']), function ($q) use ($validatedData) {
                $q->whereHas('towerPhase.propertyMaster', function ($q) use ($validatedData) {
                    $q->where('property_name', 'ILIKE', "%{$validatedData['property']}%");
                });
            })

            //Filter by Payment Scheme Name
            ->when(!empty($validatedData['paymentScheme']), function ($q) use ($validatedData) {
                // Get all matching PaymentScheme IDs
                $paymentSchemeIds = PaymentScheme::where('payment_scheme_name', 'ILIKE', "%{$validatedData['paymentScheme']}%")
                    ->pluck('id')
                    ->toArray();

                // Get matching PriceVersion IDs based on payment_scheme_id
                $priceVersionIds = PriceVersion::where(function ($query) use ($paymentSchemeIds) {
                    foreach ($paymentSchemeIds as $id) {
                        $query->orWhereJsonContains('payment_scheme_id', $id);
                    }
                })->pluck('id')->toArray();

                $q->where(function ($query) use ($priceVersionIds) {
                    foreach ($priceVersionIds as $id) {
                        $query->orWhereJsonContains('price_versions_id', $id);
                    }
                });
            })


            //  Filter by Status
            ->when(!empty($validatedData['status']), function ($q) use ($validatedData) {
                $q->where('status', $validatedData['status']);
            })

            //  Filter by Date
            ->when(!empty($validatedData['date']), function ($q) use ($validatedData) {
                $q->whereDate('created_at', $validatedData['date']);
            });
    }


    /**
     * Update the price list master status to InActive, On-going Approval, Approved and Live, Approved not Live
     */
    public function updateStatus($id)
    {
        $priceListMaster = $this->model->find($id);
        if (!$priceListMaster) {
            return [
                'success' => false,
                'message' => 'Price List Master not found.'
            ];
        }


        $priceListMaster->update([
            'status' => 'InActive'
        ]);

        return [
            'success' => true,
            'message' => 'Price List Master status updated successfully.',
            'data' => $priceListMaster->fresh()

        ];
    }

    /**
     * Fetch price list masters with related models and fields.
     */
    protected function getPriceListMastersWithRelations()
    {
        return $this->model->with([
            'towerPhase.propertyMaster',
            'towerPhase',
            'priceBasicDetail',
            'towerPhase.propertyMaster.propertyCommercialDetail',
            'paymentSchemes',
            'priceVersions' => function ($query) {
                $query->where('status', 'Active')
                    ->oldest()
                ;
            },
            'floorPremiums' => function ($query) {
                $query->where('status', 'Active');
            },
            'additionalPremiums' => function ($query) {
                $query->where('status', 'Active');
            }
        ])->select('price_list_masters.*')
            ->orderBy('created_at', 'desc')
            ->where('status', '!=', 'InActive');
        // ->get();
    }

    /**
     * Transform the price list master data
     */
    protected function transformPriceListMaster($priceList)
    {

        return [
            'price_list_master_id' => $priceList->id,
            'updated_at' => $priceList->updated_at,
            'created_at' => $priceList->created_at,
            'tower_phases' => [
                [
                    'id' => $priceList->towerPhase->id,
                    'tower_phase_name' => $priceList->towerPhase->tower_phase_name,
                    'tower_description' => $priceList->towerPhase->tower_description,
                ]
            ],
            'status' => $priceList->status,
            'property_name' => $priceList->towerPhase->propertyMaster->property_name ?? null,
            'pricebasic_details' => $priceList->priceBasicDetail ? $priceList->priceBasicDetail->toArray() : null,
            'excel_id' => $priceList->towerPhase->units->where('status', 'Active')->pluck('excel_id')->unique()->first() ?? null,
            'property_commercial_detail' => optional(
                $priceList->towerPhase->propertyMaster->propertyCommercialDetail()
                    ->where('price_list_master_id', $priceList->id)
                    ->latest('id')
                    ->first()
            )->toArray(),
            'price_versions' => $this->transformPriceVersions($priceList->priceVersions),
            'floor_premiums' => $this->transformFloorPremiums($priceList->floorPremiums),
            'additional_premiums' => $this->transformAdditionalPremium(
                $priceList->additionalPremiums()
                    ->orderBy('created_at', 'desc')
                    ->get()
            ),
            'reviewedByEmployees' => $this->employeeModel->whereIn(
                'id',
                json_decode($priceList->reviewed_by_employee_id, true) ?? []
            )
                ->select('id', 'firstname', 'lastname')
                ->get()
                ->makeHidden(['firstname', 'lastname'])
                ->toArray(),

            'approvedByEmployees' => $this->employeeModel->whereIn(
                'id',
                json_decode($priceList->approved_by_employee_id, true) ?? []
            )
                ->select('id', 'firstname', 'lastname')
                ->get()
                ->makeHidden(['firstname', 'lastname'])
                ->toArray(),
        ];
    }

    /**
     * Transform the additional premium data
     */
    protected function transformAdditionalPremium($additionalPremiums)
    {
        return $additionalPremiums->map(function ($additionalPremium) {
            $excludedUnit = json_decode($additionalPremium->excluded_unit, true);
            $excludedUnitIds = is_array($excludedUnit) ? $excludedUnit : [];
            return [
                'id' => $additionalPremium->id,
                'viewName' => $additionalPremium->additional_premium,
                'premiumCost' => $additionalPremium->premium_cost,
                'excludedUnitIds' => $excludedUnitIds,
                'created_at' => $additionalPremium->created_at,
                'updated_at' => $additionalPremium->updated_at,
            ];
        })->toArray();
    }

    /**
     * Transform the floor premiums data
     */
    protected function transformFloorPremiums($floorPremiums)
    {
        return $floorPremiums->map(function ($floorPremium) {
            $excludedUnit = json_decode($floorPremium->excluded_unit, true);
            $excludedUnitIds = is_array($excludedUnit) ? $excludedUnit : [];
            return [
                'id' => $floorPremium->id,
                'floor' => $floorPremium->floor,
                'premium_cost' => $floorPremium->premium_cost,
                'lucky_number' => $floorPremium->lucky_number,
                'excluded_units' => $excludedUnitIds,

            ];
        });
    }


    /**
     * Transform the price list  versions data
     */
    protected function transformPriceVersions($priceVersions)
    {
        return $priceVersions->map(function ($version) {
            $paymentSchemeIds = json_decode($version->payment_scheme_id, true);
            $priceVersionIds = is_array($paymentSchemeIds) ? $paymentSchemeIds : [];
            $paymentSchemeData = PaymentScheme::whereIn('id', $priceVersionIds)
                ->get();
            $paymentSchemes = $paymentSchemeData->map(function ($scheme) {
                return [
                    'id' => $scheme->id,
                    'payment_scheme_name' => $scheme->payment_scheme_name,
                ];
            });

            return [
                'version_name' => $version->version_name,
                'status' => $version->status,
                'percent_increase' => $version->percent_increase,
                'no_of_allowed_buyers' => $version->allowed_buyer,
                'expiry_date' => $version->expiry_date,
                'version_id' => $version->id,
                'payment_schemes' => $paymentSchemes,
                'priority_number' => $version->priority_number,
            ];
        });
    }


    //Download the price list master excel
    public function exportExcel($data): BinaryFileResponse
    {
        $export = new PriceListMasterExportData(
            $data['payload']['building'],
            $data['payload']['project_name'],
            $data['payload']['exportPricingData']['priceVersions'],
            $data['payload']['exportPricingData']['units'],
            $data['payload']['exportPricingData']['priceListSettings'],
            $data['payload']['selectedVersion']
        );
        return $this->excel->download($export, 'price_list_master.xlsx');
    }

    public function getPriceListsForReviewerOrApprover(int $userId)
    {
        try {
            // Retrieve base query with all necessary relations
            $query = $this->model;

            // Filter price lists where the user is a reviewer or approver
            $priceListMasters = $query->where(function ($q) use ($userId) {
                $q->whereJsonContains('reviewed_by_employee_id', $userId)
                    ->orWhereJsonContains('approved_by_employee_id', $userId);
            })
                ->with(['additionalRelations']) // Add any necessary eager loading
                ->paginate(15); // Optional: add pagination

            return $priceListMasters;
        } catch (\Exception $e) {
            // Log the error
            \Log::error('Error retrieving price lists: ' . $e->getMessage());

            // Return an empty collection or throw a custom exception
            return collect();
        }
    }
}

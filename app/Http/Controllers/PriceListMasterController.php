<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\BasicPricing;
use App\Models\PriceBasicDetails;
use App\Models\PriceListMaster;
use App\Models\PricingMasterList;
use App\Models\PropertyDetail;
use App\Models\PropertyMaster;
use App\Services\PriceListMasterService;
use Illuminate\Http\Request;
use PhpParser\Node\Stmt\TryCatch;

class PriceListMasterController extends Controller
{
    protected $service;

    public function __construct(PriceListMasterService $service)
    {
        $this->service = $service;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $priceListMasters = $this->service->index();

        return response()->json(
            $priceListMasters
        );
    }
}

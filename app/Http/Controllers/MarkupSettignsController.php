<?php

namespace App\Http\Controllers;

use App\Http\Requests\CardMarkupRequest;
use App\Http\Requests\MarkupDetailsRequest;
use App\Http\Requests\StoreMarkupRequest;
use App\Models\CardMarkupDetails;
use App\Models\MarkupDetails;
use App\Models\MarkupSettings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class MarkupSettignsController extends Controller
{

    public function index(Request $request)
    {
        try {
            $query = MarkupSettings::with(['markupDetails' => function ($query) {
                $query->select(
                    'id',
                    'markup_setting_id',
                    'location',
                    'pti_bank_rate_percent',
                    'pti_bank_fixed_amount',
                    'cli_markup'
                );
            }])->whereHas('markupDetails');

            if ($request->has('payment_method')) {
                $query->where('payment_method', 'ILIKE', '%' . $request->payment_method . '%');
            }

            $settings = $query->orderBy('created_at', 'desc')->paginate(10);

            $formatted = $settings->getCollection()->map(function ($setting) {
                $details = $setting->markupDetails->keyBy('location');

                return [
                    'id' => $setting->id,
                    'payment_method' => $setting->payment_method,
                    'markup_details' => [
                        'local' => [
                            'pti_bank_rate_percent' => $details['local']->pti_bank_rate_percent ?? null,
                            'pti_bank_fixed_amount' => $details['local']->pti_bank_fixed_amount ?? null,
                            'cli_markup' => $details['local']->cli_markup ?? null,
                        ],
                        'international' => [
                            'pti_bank_rate_percent' => $details['international']->pti_bank_rate_percent ?? null,
                            'pti_bank_fixed_amount' => $details['international']->pti_bank_fixed_amount ?? null,
                            'cli_markup' => $details['international']->cli_markup ?? null,
                        ]
                    ]
                ];
            });

            $settings->setCollection($formatted);

            return response()->json(['data' => $settings]);
        } catch (\Throwable $th) {
            return response()->json(['message' => $th->getMessage()], 500);
        }
    }

    public function store(StoreMarkupRequest $request)
    {
        DB::beginTransaction();

        try {
            $validated = $request->validated();

            $markupSetting = MarkupSettings::create([
                'payment_method' => $validated['payment_method'],
            ]);

            foreach (['local', 'international'] as $type) {
                $details = $request['markup_details'][$type];

                MarkupDetails::create([
                    'markup_setting_id' => $markupSetting->id,
                    'location' => $type,
                    'pti_bank_rate_percent' => $details['pti_bank_rate_percent'],
                    'pti_bank_fixed_amount' => $details['pti_bank_fixed_amount'],
                    'cli_markup' => $details['cli_markup'],
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Record created successfully.'
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while saving the record.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(string $id)
    {
        //
    }

    public function update(StoreMarkupRequest $request, string $id)
    {
        DB::beginTransaction();

        try {
            $record = MarkupSettings::findOrFail($id);

            $validatedData = $request->validated();

            $record->update([
                'payment_method' => $validatedData['payment_method'],
            ]);


            foreach (['local', 'international'] as $type) {
                $details = $request['markup_details'][$type];

                $markupDetail = MarkupDetails::where('markup_setting_id', $record->id)
                    ->where('location', $type)
                    ->first();

                if ($markupDetail) {
                    $markupDetail->update([
                        'pti_bank_rate_percent' => $details['pti_bank_rate_percent'],
                        'pti_bank_fixed_amount' => $details['pti_bank_fixed_amount'],
                        'cli_markup' => $details['cli_markup'],
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Record updated successfully.'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while updating the record.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function retrieveCardMarkupDetails()
    {
        $markupDetails = MarkupSettings::select('card_markup_details.*', 'markup_settings.payment_method')
            ->leftJoin('card_markup_details', 'markup_settings.id', '=', 'card_markup_details.markup_setting_id')
            ->where('markup_settings.payment_method', '=', 'Credit/Debit Card')
            ->paginate(10);
        return response()->json([
            'data' => $markupDetails,
        ]);
    }


    public function updateCardSettings(CardMarkupRequest $request, string $id)
    {
        try {
            DB::beginTransaction();

            $record = CardMarkupDetails::findOrFail($id);

            $validatedData = $request->validated();

            $record->update([
                'mdr' => $validatedData['mdr'],
                'cli_rate' => $validatedData['cli_rate'],
                'withholding_tax' => $validatedData['withholding_tax'],
                'gateway_rate' => $validatedData['gateway_rate'],
            ]);

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Record updated successfully.'
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while saving the record.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

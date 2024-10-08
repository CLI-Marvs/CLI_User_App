<?php

namespace App\Imports;

use App\Models\Unit;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class ExcelImport implements ToModel, WithHeadingRow
{

    protected $data = [];
    protected $rowData = [];
    protected $headers;
    protected $propertyId;
    protected $towerPhaseId;
    public function __construct($headers, $propertyId, $towerPhaseId)
    {
        $this->headers = $headers;
        $this->propertyId = $propertyId;
        $this->towerPhaseId = $towerPhaseId;
    }


    //this function is already working if straight forward
    public function model(array $row)
    {
        // Create a mappedData array using headers from the frontend
        $mappedData = [];

        // Loop through headers to map values
        foreach ($this->headers as $header) {
            // Generate the database field name from the header
            $dbField = strtolower(str_replace(' ', '_', $header)); // Use the header string directly
            // Find the index of the header in the row array
           
            // Check if the key exists in $row and map it
            $mappedData[$header] = $row[$dbField] ?? null; //  
        }

        // Additional check to ignore rows with specific invalid values like 'FLOOR' or '#REF!'
        $invalidValues = ['FLOOR', '#REF!', null];
        $hasValidData = false;

        foreach ($mappedData as $key => $value) {
            // If the value is a string and not in the list of invalid values
            if (is_string($value) && !in_array($value, $invalidValues, true) && trim($value) !== '') {
                $hasValidData = true;
                break; // Valid data found
            }
        }

        // If the row is empty, return null to skip this row
        if (!$hasValidData) {
            return null;
        }

        try {
            // Creating a new Unit instance with mapped data
            return new Unit([
                'floor' => $mappedData['FLOOR'] ?? null,
                'room_number' => $mappedData['ROOM NUMBER'] ?? null,
                'unit' => $mappedData['UNIT'] ?? null,
                'type' => $mappedData['TYPE'] ?? null,
                'indoor_area' => $mappedData['INDOOR AREA'] ?? null,
                'balcony_area' => $mappedData['BALCONY AREA'] ?? null,
                'garden_area' => $mappedData['GARDEN AREA'] ?? null,
                'total_area' => $mappedData['TOTAL AREA'] ?? null,
                'property_masters_id' => $this->propertyId,
                'tower_phase_id' => $this->towerPhaseId
            ]);
        } catch (\Exception $e) {
            \Log::error('Error creating Unit model: ', [
                'error' => $e->getMessage(),
                'mappedData' => $mappedData
            ]);

            return null;
        }
    }


    // Getter for the data array
    public function getData()
    {
        return $this->data;
    }
    public function batchSize(): int
    {
        return 100;
    }

    // Extract headers dynamically from the Excel sheet using the first row
    public function headingRow(): int
    {
        return 1; // Assuming first row contains headers
    }
}

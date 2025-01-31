<?php

namespace App\Imports;

use App\Models\Unit;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class ExcelImport implements ToModel, WithHeadingRow, WithChunkReading, WithBatchInserts
{

    protected $data = [];
    protected $headers;
    protected $propertyId;
    protected $towerPhaseId;
    protected $status;
    protected $excelId;

    public function __construct($headers, $propertyId, $towerPhaseId, $status)
    {
        $this->headers = $headers;
        $this->propertyId = $propertyId;
        $this->towerPhaseId = $towerPhaseId;
        $this->status = $status;
        //Generate a unique id for the excel
        $this->excelId =   'Excel_' . uniqid();
    }


    /**
     * Maps the incoming row data to a Unit model instance.
     *
     * This method takes an array representing a row from the imported dataset,
     * maps the data to the corresponding fields in the Unit model, and returns
     * a new Unit instance. If the mapped data is invalid (as determined by
     * the hasValidData method), the function returns null to skip processing 
     * for that row.
     *
     * The fields that are populated include:
     * - floor
     * - room_number
     * - unit
     * - type
     * - indoor_area
     * - balcony_area
     * - garden_area
     * - total_area
     * 
     * The method also associates the unit with a specific property master
     * and tower phase based on the provided propertyId and towerPhaseId.
     *
     * @param array $row The row data from the imported dataset.
     * @return Unit|null A new Unit instance populated with the mapped data or null if the data is invalid.
     */
    public function model(array $row)
    {
        $mappedData = $this->mapData($row);
        // Return null to skip invalid rows
        if (!$this->hasValidData($mappedData)) {
            return null;
        }

        // Accumulate rows in batches and return them
        $unit =   new Unit([
            'floor' => $mappedData['FLOOR'] ?? null,
            'room_number' => $mappedData['ROOM NUMBER'] ?? null,
            'unit' => $mappedData['UNIT'] ?? null,
            'type' => $mappedData['TYPE'] ?? null,
            'indoor_area' => $mappedData['INDOOR AREA'] ?? null,
            'balcony_area' => $mappedData['BALCONY AREA'] ?? null,
            'garden_area' => $mappedData['GARDEN AREA'] ?? null,
            'total_area' => $mappedData['TOTAL AREA'] ?? null,
            'property_masters_id' => $this->propertyId,
            'tower_phase_id' => $this->towerPhaseId,
            'excel_id' => $this->excelId,
            'status' => $this->status
        ]);

        $this->data[] = $unit->toArray(); // Store the data as array
        return $unit;
    }

    /**
     * Map the row data to the appropriate fields.
     */
    private function mapData(array $row)
    {
        $mappedData = [];
        foreach ($this->headers as $header) {
            $dbField = strtolower(str_replace(' ', '_', $header));
            $mappedData[$header] = $row[$dbField] ?? null;
        }

        return $mappedData;
    }


    /**
     * Check if the row contains valid data.
     */
    private function hasValidData($mappedData)
    {
        $invalidValues = ['FLOOR', '#REF!', null];
        foreach ($mappedData as $value) {
            if (is_string($value) && !in_array($value, $invalidValues, true) && trim($value) !== '') {
                return true;
            }
        }
        return false;
    }

    /**
     * Getter for the data array
     */
    public function getData()
    {
        return $this->data;
    }
    
    /**
     * Get the excel Id
     */

    public function getExcelId()
    {
        return $this->excelId;
    }
    /**
     * Returns the batch size for processing records.
     *
     * This method specifies that records will be processed in batches of 500.
     * Using batch processing helps improve performance and manage memory usage
     * when handling large datasets by avoiding loading all records at once.
     *
     * @return int The number of records to process in each batch.
     */
    public function batchSize(): int
    {
        return 1000;
    }

    /**
     * Returns the size of each chunk for processing records.
     *
     * This method specifies that records will be processed in chunks of 500.
     * Chunking helps optimize performance and manage memory usage when handling
     * large datasets by allowing the processing of smaller subsets of data 
     * at a time.
     *
     * @return int The number of records to process in each chunk.
     */
    public function chunkSize(): int
    {
        return 1000;
    }

    /**
     * Returns the index of the heading row in the dataset.
     *
     * This method indicates that the first row (index 1) contains the headers
     * for the data being processed. It is used to correctly identify the 
     * column names when importing data from a file.
     *
     * @return int The index of the heading row.
     */
    public function headingRow(): int
    {
        return 1;
    }
}

<?php

namespace App\Exports;

use App\Models\Unit;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class ExcelExport implements FromCollection, WithHeadings
{
    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        return Unit::select("floor", "room_number", "unit", "type", "balcony_area", "garden_area", "total_area", "indoor_area")->get();
    }

    public function headings(): array
    {
        return ["FLOOR", "ROOM_NUMBER", "UNIT", "TYPE", "INDOOR AREA", "BALCONY AREA", "GARDEN AREA", "TOTAL AREA"];
    }
}

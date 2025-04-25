<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class FeaturesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $features = [
            ['name' => 'Notification'],
            ['name' => 'Inquiry Management'],
            ['name' => 'Transaction Management'],
            ['name' => 'Property Pricing'],
            ['name' => 'Sales Management'],
            ['name' => 'Ask CLI'],
            ['name' => 'Pay CLI'],

            //For long run use, just add new feature here
            //Example: ['name' => 'Document management'],
        ];

        foreach ($features as $feature) {
            DB::table('features')->updateOrInsert(
                ['name' => $feature['name']],
                ['created_at' => now(), 'updated_at' => now()]
            );
        }
    }
}

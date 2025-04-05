<?php

namespace App\Rules;

use Log;
use Closure;
use Illuminate\Http\UploadedFile;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Illuminate\Contracts\Validation\ValidationRule;

class MaliciousDetectionRule implements ValidationRule
{

    protected $malicious_keywords = [
        '\\/bin\\/bash',
        '__HALT_COMPILER',
        'Guzzle',
        'Laravel',
        'Monolog',
        'PendingRequest',
        '<script',   
        '</script>', 
        'ThinkPHP',
        'phar',
        'phpinfo',
        '\\<\\?php',
        '\\$_GET',
        '\\$_POST',
        '\\$_SESSION',
        '\\$_REQUEST',
        'whoami',
        'python',
        'composer',
        'passthru',
        'shell_exe',
        'PHPShell',
        'FilesMan',
    ];

    /**
     * Create a new rule instance.
     *
     * @return void
     */
    public function __construct(){}
    

    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        //
    }



    /**
     * Determine if the validation rule passes.
     *
     * @param  string  $attribute
     * @param  mixed  $value
     * @return bool
     *
     * @throws \Illuminate\Contracts\Filesystem\FileNotFoundException
     */
    public function passes($attribute, $value)
    {
        $allowedMimeTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

        if ($value instanceof UploadedFile) {
            // Check MIME type
            if (!in_array($value->getMimeType(), $allowedMimeTypes)) {
                \Log::warning('❌ Blocked file due to invalid MIME type: ' . $value->getMimeType());
                return false;
            }

            try {
                // Load Excel file and extract text content
                $spreadsheet = IOFactory::load($value->getRealPath());
                $textContent = '';

                foreach ($spreadsheet->getWorksheetIterator() as $worksheet) {
                    foreach ($worksheet->getRowIterator() as $row) {
                        foreach ($row->getCellIterator() as $cell) {
                            // Extract cell value
                            $textContent .= ' ' . $cell->getValue();

                            // Extract formula if present
                            if ($cell->isFormula()) {
                                $textContent .= ' ' . $cell->getCalculatedValue();
                            }
                        }
                    }
                }

                // Log extracted content for debugging
                \Log::info('📂 Extracted Excel Content: ' . $textContent);

                // Escape special characters dynamically
                $escapedKeywords = array_map('preg_quote', $this->malicious_keywords);
                $pattern = '/(' . implode('|', $escapedKeywords) . ')/im';

                // Log the regex pattern
                \Log::info('🔍 Regex Pattern: ' . $pattern);

                // Check for malicious content
                if (preg_match($pattern, $textContent)) {
                    \Log::warning('🚨 Malicious content detected: ' . $textContent);
                    return false;
                }

                return true; // File is clean
            } catch (\Exception $e) {
                \Log::error('❌ Error reading Excel file: ' . $e->getMessage());
                return false;
            }
        }

        return false; // Invalid file
    }

    /**
     * Get the validation error message.
     *
     * @return string
     */
    public function message()
    {
        return 'The system detected a malicious content in the attachment. Kindly check if your attachment is from the original sources';
    }
}

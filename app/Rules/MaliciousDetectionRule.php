<?php

namespace App\Rules;

use Closure;
use Illuminate\Http\UploadedFile;
use Illuminate\Contracts\Validation\ValidationRule;

class MaliciousDetectionRule implements ValidationRule
{

    /**
     * Create a new rule instance.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }


    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        //
    }

    protected $malicious_keywords = [
        '\\/bin\\/bash',
        '__HALT_COMPILER',
        'Guzzle',
        'Laravel',
        'Monolog',
        'PendingRequest',
        '\\<script',
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
            // Check if the file is an Excel file based on MIME type

            if (!in_array($value->getMimeType(), $allowedMimeTypes)) {
                return false;
            }

            // Check for malicious content
            return !preg_match('/(' . implode('|', $this->malicious_keywords) . ')/im', $value->get());
        }

        if (!request()->hasFile($attribute)) {
            return true;
        }

        $uploadedFile = request()->file($attribute);

        // Check if the file is an Excel file based on MIME type
        if (!in_array($uploadedFile->getMimeType(), $allowedMimeTypes)) {
            return false;
        }

        // Check for malicious content
        return !preg_match('/(' . implode('|', $this->malicious_keywords) . ')/im', $uploadedFile->get());
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

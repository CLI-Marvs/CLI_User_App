<?php

namespace App\Services;


class FileScanService
{
    /**
     * List of malicious keywords to check for in Excel content
     */
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
        '<?php',
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
     * List of valid MIME types for Excel files
     */
    protected $validMimeTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.oasis.opendocument.spreadsheet',
        'application/x-excel',
        'application/x-msexcel',
        'application/x-dos_ms_excel',
        'application/xls',
        'application/x-xls',
        'application/x-xlsx',
    ];

    /**
     * Scan Excel file for malicious content
     * 
     * @param \Illuminate\Http\UploadedFile $file
     * @return array
     */
    public function scan($file)
    {
        $results = [
            'safe' => true,
            'threats' => []
        ];

        // Check if file is a valid Excel file
        if (!$this->isExcelFile($file)) {
            $results['safe'] = false;
            $results['threats'][] = 'File is not an Excel file.';
            // return $results;
        }

        // Check if the file is empty
        if ($file->getSize() === 0) {
            dd('empty file');
            $results['safe'] = false;
            $results['threats'][] = 'File is empty.';
            // return $results;
        }

        // Extract and scan shared strings (where most text content is stored)
        $stringThreats = $this->scanSharedStrings($file);
        if (!empty($stringThreats)) {
            $results['safe'] = false;
            $results['threats'] = array_merge($results['threats'], $stringThreats);
        }

        // Check if file contains macros (VBA)
        if ($this->containsMacros($file)) {
            $results['safe'] = false;
            $results['threats'][] = 'File contains macros.';
        }

        // Check for suspicious formulas
        $formulaThreats = $this->checkForDangerousFormulas($file);
        if (!empty($formulaThreats)) {
            $results['safe'] = false;
            $results['threats'] = array_merge($results['threats'], $formulaThreats);
        }

        // Check for malicious keywords
        $keywordThreats = $this->checkForMaliciousKeywords($file);
        if (!empty($keywordThreats)) {
            $results['safe'] = false;
            $results['threats'] = array_merge($results['threats'], $keywordThreats);
        }

        // Check for external links/references
        $linkThreats = $this->checkForExternalLinks($file);
        if (!empty($linkThreats)) {
            $results['safe'] = false;
            $results['threats'] = array_merge($results['threats'], $linkThreats);
        }

        return $results;
    }


    /**
     * Verify file is actually an Excel file
     */
    public function isExcelFile($file)
    {
        $mimeType = $file->getMimeType();
        if (!in_array($mimeType, $this->validMimeTypes)) {
            return false;
        }

        // Additional check for file signatures
        $handle = fopen($file->getRealPath(), 'rb');
        $header = fread($handle, 8);
        fclose($handle);

        $xlsSignature = "\xD0\xCF\x11\xE0\xA1\xB1\x1A\xE1"; // XLS file signature
        $zipSignature = "PK\x03\x04"; // ZIP file signature (XLSX)


        if (strncmp($header, $xlsSignature, 8) === 0 || strncmp($header, $zipSignature, 4) === 0) {
            return true;
        }

        // If the file doesn't match any of the known signatures, return false
        return false;
    }


    /**
     * Scan the shared strings XML where most Excel text content is stored
     */
    protected function scanSharedStrings($file)
    {
        $threats = [];
        $extension = strtolower($file->getClientOriginalExtension());

        // For modern Excel files (.xlsx, .xlsm)
        if ($extension === 'xlsx' || $extension === 'xlsm') {
            $zip = new \ZipArchive();
            if ($zip->open($file->getRealPath()) === true) {
                // Check shared strings (this is where most cell text is stored in XLSX files)
                $sharedStringsFile = 'xl/sharedStrings.xml';
                if ($zip->locateName($sharedStringsFile) !== false) {
                    $content = $zip->getFromName($sharedStringsFile);

                    // Decode XML entities that might be hiding malicious content
                    $content = html_entity_decode($content);

                    foreach ($this->malicious_keywords as $keyword) {
                        // Use a case-insensitive search, escape regex special chars if needed
                        $pattern = '/' . preg_quote($keyword, '/') . '/i';
                        if (preg_match($pattern, $content)) {
                            $threats[] = "Malicious code detected: '$keyword'";
                        }
                    }
                }

                // Also check each sheet directly (for inline strings not in shared strings)
                for ($i = 0; $i < $zip->numFiles; $i++) {
                    $filename = $zip->getNameIndex($i);
                    if (strpos($filename, 'xl/worksheets/sheet') === 0) {
                        $content = $zip->getFromIndex($i);
                        $content = html_entity_decode($content);

                        foreach ($this->malicious_keywords as $keyword) {
                            $pattern = '/' . preg_quote($keyword, '/') . '/i';
                            if (preg_match($pattern, $content)) {
                                $threats[] = "Malicious code detected in worksheet: '$keyword'";
                            }
                        }
                    }
                }

                $zip->close();
            }
        }
        // For old Excel files (.xls)
        else if ($extension === 'xls') {
            $content = file_get_contents($file->getRealPath());

            foreach ($this->malicious_keywords as $keyword) {
                // Case-insensitive search for binary content
                if (stripos($content, $keyword) !== false) {
                    $threats[] = "Malicious code detected: '$keyword'";
                }
            }
        }

        return $threats;
    }


    /**
     * Check if file contains macros (VBA)
     * 
     * @param \Illuminate\Http\UploadedFile $file
     * @return bool
     */
    public function containsMacros($file)
    {
        $extension = $file->getClientOriginalExtension();

        if ($extension === 'xlsm') {
            return true;
        }

        if ($extension === 'xlsx' || $extension === 'xlsb') {
            // Check for VBA project in XLS files
            $zip = new \ZipArchive();
            if ($zip->open($file->getRealPath()) === true) {
                // Look for vbaProject.bin which indicates macros
                if ($zip->locateName('xl/vbaProject.bin') !== false) {
                    $zip->close();
                    return true;
                }
                $zip->close();
            }
        }

        // For .xls files, check for specific signatures
        if ($extension === 'xls') {
            $content = file_get_contents($file->getRealPath());
            // Check for common VBA module markers
            if (
                strpos($content, 'VBA') !== false &&
                (strpos($content, 'ThisWorkbook') !== false ||
                    strpos($content, 'Worksheet') !== false)
            ) {
                return true;
            }
        }

        return false;
    }


    /**
     * Check for suspicious formulas in the Excel file
     * 
     * @param \Illuminate\Http\UploadedFile $file
     * @return array
     */
    public function checkForDangerousFormulas($file)
    {
        $threats = [];
        $extension = strtolower($file->getClientOriginalExtension());

        // For modern Excel files (.xlsx)
        if ($extension === 'xlsx' || $extension === 'xlsm') {
            $zip = new \ZipArchive();
            if ($zip->open($file->getRealPath()) === true) {
                // Get sheet data
                for ($i = 1; $i <= $zip->numFiles; $i++) {
                    $filename = $zip->getNameIndex($i - 1);

                    // Look at the worksheets
                    if (strpos($filename, 'xl/worksheets/sheet') === 0) {
                        $content = $zip->getFromIndex($i - 1);

                        // Check for dangerous formula patterns
                        if ($this->hasRiskyFormulaPatterns($content)) {
                            $threats[] = 'Potentially dangerous formula detected in spreadsheet';
                        }
                    }
                }
                $zip->close();
            }
        }

        // For old Excel files (.xls), we'd need binary parsing which is complex
        else if ($extension === 'xls') {
            $content = file_get_contents($file->getRealPath());

            // Check for common dangerous formula strings (basic approach)
            if (preg_match('/EXEC|SHELL|CMD/i', $content)) {
                $threats[] = 'Potentially dangerous command execution formula detected';
            }
        }

        return $threats;
    }

    /**
     * Check for malicious keywords in the Excel file
     * 
     * @param \Illuminate\Http\UploadedFile $file
     * @return array
     */
    public function checkForMaliciousKeywords($file)
    {
        $threats = [];
        $threats = [];
        $extension = strtolower($file->getClientOriginalExtension());

        // For modern Excel files (.xlsx, .xlsm)
        if ($extension === 'xlsx' || $extension === 'xlsm') {
            $zip = new \ZipArchive();
            if ($zip->open($file->getRealPath()) === true) {
                // Check all files in the archive
                for ($i = 0; $i < $zip->numFiles; $i++) {
                    $filename = $zip->getNameIndex($i);

                    // Skip directories
                    if (substr($filename, -1) === '/') {
                        continue;
                    }

                    // Check text-based files (XML, sheets, etc)
                    if (preg_match('/(xml|txt|rels)$/', $filename)) {
                        $content = $zip->getFromIndex($i);
                        $keywordMatches = $this->detectMaliciousKeywords($content);

                        if (!empty($keywordMatches)) {
                            $threats[] = "Suspicious code detected: " . implode(', ', $keywordMatches);
                        }
                    }
                }
                $zip->close();
            }
        }
        // For old Excel files (.xls)
        else if ($extension === 'xls') {
            $content = file_get_contents($file->getRealPath());
            $keywordMatches = $this->detectMaliciousKeywords($content);

            if (!empty($keywordMatches)) {
                $threats[] = "Suspicious code detected: " . implode(', ', $keywordMatches);
            }
        }

        return $threats;
    }

    /**
     * Check for external links/references in the Excel file
     * 
     * @param \Illuminate\Http\UploadedFile $file
     * @return array
     */
    public function checkForExternalLinks($file)
    {
        $warnings = [];
        $extension = strtolower($file->getClientOriginalExtension());

        if ($extension === 'xlsx' || $extension === 'xlsm') {
            $zip = new \ZipArchive();
            if ($zip->open($file->getRealPath()) === true) {
                // Check for external workbook references
                if ($zip->locateName('xl/externalLinks/') !== false) {
                    $warnings[] = 'File contains external workbook references';
                }

                // Check for hyperlinks in sheets
                for ($i = 1; $i <= $zip->numFiles; $i++) {
                    $filename = $zip->getNameIndex($i - 1);
                    if (strpos($filename, 'xl/worksheets/sheet') === 0) {
                        $content = $zip->getFromIndex($i - 1);
                        if (
                            strpos($content, '<hyperlink') !== false ||
                            strpos($content, 'HYPERLINK') !== false
                        ) {
                            $warnings[] = 'File contains hyperlinks which may lead to external resources';
                            break;
                        }
                    }
                }
                $zip->close();
            }
        }

        return $warnings;
    }


    /**
     * Check for risky formula patterns in the content
     * 
     * @param string $content The content to check for risky formula patterns
     * @return bool True if risky patterns are found, false otherwise
     */
    public function hasRiskyFormulaPatterns($xmlContent)
    {
        // Check for dynamic data exchange (DDE) commands
        if (
            preg_match('/=.*EXEC\s*\(/i', $xmlContent) ||
            preg_match('/=.*SYSTEM\s*\(/i', $xmlContent) ||
            preg_match('/=.*CMD\s*\(/i', $xmlContent) ||
            preg_match('/=.*SHELL\s*\(/i', $xmlContent) ||
            preg_match('/!.*Run\s*\(/i', $xmlContent) ||
            preg_match('/=\s*".*\|\s*\w+.*"/', $xmlContent) || // DDE formula pattern
            preg_match('/HYPERLINK\s*\(.*(exe|bat|cmd|ps1|vbs|js)/i', $xmlContent)
        ) { // Dangerous hyperlinks
            return true;
        }
        return false;
    }

    /**
     * Detect malicious keywords in the content
     * 
     * @param string $content The content to check for malicious keywords
     * @return array An array of detected malicious keywords
     */
    public function detectMaliciousKeywords($content)
    {
        $matches = [];
        foreach ($this->malicious_keywords as $keyword) {
            // Escape the keyword for use in preg_match
            $escapedKeyword = preg_quote($keyword, '/');
            if (preg_match('/' . $escapedKeyword . '/i', $content)) {
                $matches[] = $keyword;
            }
        }

        return $matches;
    }
}

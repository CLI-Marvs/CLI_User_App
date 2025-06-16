<?php

return [
    'mode' => env('CLAMAV_MODE', 'daemon'), // 'daemon' or 'executable'
    'executable' => env('CLAMAV_EXECUTABLE', '/usr/bin/clamscan'), // Path to ClamAV scanner
    'socket' => env('CLAMAV_SOCKET', '/var/run/clamav/clamd.ctl'), // Path to ClamAV socket (for daemon mode)
];

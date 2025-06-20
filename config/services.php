<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT'),
        'client_id_gdrive' => env('GOOGLE_DRIVE_CLIENT_ID'),
        'client_secret_gdrive' => env('GOOGLE_DRIVE_CLIENT_SECRET'),
        'refresh_token_gdrive' => env('GOOGLE_DRIVE_REFRESH_TOKEN'),
        'folder_id_gdrive' => env('GOOGLE_DRIVE_FOLDER_ID')
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'gcs' => [
        'key_json' => env('GCS_KEY_JSON'),
    ],

    'gcs_prod' => [
        'key_json' => env('GCS_KEY_PROD'),
    ],

    'app_url' => env('APP_URL'),


    'paynamics' => [
        'username' => env('PAYNAMICS_USERNAME'),
        'password' => env('PAYNAMICS_PASSWORD'),
    ],

];

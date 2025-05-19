<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap"
        rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;700&display=swap" rel="stylesheet">
    <style>
        @font-face {
            font-family: 'Barlow';
            src: url(data:font/woff2;base64,YOUR_BASE64_STRING_HERE) format('woff2');
            font-weight: 400;
            font-style: normal;
        }



        p {
            font-family: 'Barlow', sans-serif;
            font-weight: 400;
        }

        .font-size {
            font-size: 1.125rem;
            line-height: 1.75rem;
        }

        .text-bold {
            font-weight: 700;
        }

        .container-center {
            display: flex;
            flex-direction: column;
            /* Ensure child elements stack vertically */
            align-items: center;
            /* Center child elements horizontally */
            text-align: center;
            /* Center text within container */
            justify-content: center;
        }

        .profile-container {
            border: 2px solid #000;
            /* Border width of 2px, solid style, and black color */
            border-radius: 50%;
            /* Makes the container circular */
            width: 100px;
            /* Adjust width and height as needed */
            height: 100px;
            overflow: hidden;
            /* Ensures content fits within the circle */
            display: flex;
            flex-direction: column;
            /* Ensure child elements stack vertically */
            align-items: center;
            /* Center child elements horizontally */
            text-align: center;
            /* Center text within container */
            justify-content: center;
        }

        .barlow-thin {
            font-family: "Barlow", sans-serif;
            font-weight: 100;
            font-style: normal;
        }

        .barlow-extralight {
            font-family: "Barlow", sans-serif;
            font-weight: 200;
            font-style: normal;
        }

        .barlow-light {
            font-family: "Barlow", sans-serif;
            font-weight: 300;
            font-style: normal;
        }

        .barlow-regular {
            font-family: "Barlow", sans-serif;
            font-weight: 400;
            font-style: normal;
        }

        .barlow-medium {
            font-family: "Barlow", sans-serif;
            font-weight: 500;
            font-style: normal;
        }

        .barlow-semibold {
            font-family: "Barlow", sans-serif;
            font-weight: 600;
            font-style: normal;
        }

        .barlow-bold {
            font-family: "Barlow", sans-serif;
            font-weight: 700;
            font-style: normal;
        }

        .barlow-extrabold {
            font-family: "Barlow", sans-serif;
            font-weight: 800;
            font-style: normal;
        }

        .barlow-black {
            font-family: "Barlow", sans-serif;
            font-weight: 900;
            font-style: normal;
        }
    </style>
</head>

<body style="font-family: Arial, sans-serif; font-size: 14px; color: #333; line-height: 1.6;">

    <p>Hi {{ ucwords($data['assignee_name']) }},</p>

    <p>You have been assigned a new feedback ticket:</p>
    <ul style="list-style-type: none; padding: 0;">
        <li><strong>Ticket No:</strong> {{ $data['ticketId'] }}</li>
        <li><strong>Concern: </strong> {{ $data['details_concern'] }}</li>
        <li><strong>From:</strong> {{ ucwords($data['buyer_name']) }}</li>
    </ul>

    <p>Please review the concern in your <span> <a href="{{ $data['adminLink'] }}">Masters Admin
                Dashboard.</a> </span> </p>


    <hr style="border: none; border-top: 1px solid #000; margin: 10px 0; width: 100%; max-width: 620px;">



    <p style="margin-top: 5px;">
        <strong>
            Reminder:
            This is an automated message from a no-reply email address.
            <br>
            Please do not reply directly to this email as your message will not be received.
        </strong>
    </p>

    <p style="margin: 0; padding: 0;">Thank you,</p>
    <p style="margin: 0; padding: 0;">Cebu Landmasters, Inc.</p>
    <br>
    <img style="margin-top; 5px"
        src="https://storage.googleapis.com/super-app-storage/concerns/67219ce89c592.png?GoogleAccessId=799945112092-compute%40developer.gserviceaccount.com&Expires=2045788905&Signature=aIFtdGmczZSDdCikC8VR%2FIEnS6g0bLs%2BXhOP7lekJ5m10Qktmc%2FotqfUrpYCFyC9qBizDk5zo4jhc1ebO54YBPc45h1qYf%2B96R8m2v0AWzo9NED1sD6i4qgKPd4Nn5wJ19iZFPPpSXWrht7idXcg9Ja05hd%2BpuxoknvV0%2BP%2Fnh9W%2B4pucqoT%2Fo6C7jN9Rp2gvrkH04EgjgrsSfgTkxraaURAs0IcUlmq7Ma4eBQU%2FDL2uMuSsupk9%2FyxisXoI2PT%2FOAdjanl9uxSNFqnR2dg8YUmF2NcxRPaSjcojZfcwZEiuz%2B9Pc50f1DvqVNOe06hl%2BCw9i7dJMsKUNN0tgkz0w%3D%3D"
        title="clisignature" />

    {{--   <p style="margin-top: 5px;">
        <strong>
            Reminder:
            This is an automated message from a no-reply email address.
            <br>
            Please do not reply directly to this email as your message will not be received.
        </strong>
    </p> --}}

</body>

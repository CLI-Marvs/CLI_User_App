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
    <p style="font-size: 16px; font-weight: bold;">Hi Mr./Ms. {{ $buyer_lname }},</p>

    <p style="margin-bottom: 5px;">
        We are pleased to inform you that your feedback ticket {{ $ticket_id }} has been resolved. 
        Thank you for bringing this matter to our attention and for your patience as we addressed it.
    </p>

    <p>
        If you have any further questions or need additional assistance, please don't hesitate to contact us.
    </p>

    <p>
        Thank you for choosing Cebu Landmasters. We build with you in mind.
    </p>


    {{-- <p>Thank you for reaching out to us; we build with you in mind.</p> --}}

    <p style="font-size: 16px;">Best regards,</p>
    <p style="font-weight: bold;">Cebu Landmasters Inc.</p>
    <img src="https://storage.googleapis.com/super-app-storage/concerns/67219ce89c592.png?GoogleAccessId=799945112092-compute%40developer.gserviceaccount.com&Expires=2045788905&Signature=aIFtdGmczZSDdCikC8VR%2FIEnS6g0bLs%2BXhOP7lekJ5m10Qktmc%2FotqfUrpYCFyC9qBizDk5zo4jhc1ebO54YBPc45h1qYf%2B96R8m2v0AWzo9NED1sD6i4qgKPd4Nn5wJ19iZFPPpSXWrht7idXcg9Ja05hd%2BpuxoknvV0%2BP%2Fnh9W%2B4pucqoT%2Fo6C7jN9Rp2gvrkH04EgjgrsSfgTkxraaURAs0IcUlmq7Ma4eBQU%2FDL2uMuSsupk9%2FyxisXoI2PT%2FOAdjanl9uxSNFqnR2dg8YUmF2NcxRPaSjcojZfcwZEiuz%2B9Pc50f1DvqVNOe06hl%2BCw9i7dJMsKUNN0tgkz0w%3D%3D" title="clisignature" />
</body>
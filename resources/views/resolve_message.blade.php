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
        <br>
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
    <img src="https://storage.googleapis.com/super-app-storage/concerns/68773fee685f1.png?GoogleAccessId=super-app-dev-uat%40super-app-anaplan.iam.gserviceaccount.com&Expires=2068178415&Signature=lZThBXMVut6vzcqW5tgcJFr9oBxg210pSK6u6eKqmb14xzcHuwLfghzQDYA%2BE4wGcicDHuBSjBKXuZZmEDTyeIjGz1Pe1LFXXxX3LpDxZ0B1%2BWP2j3Eo4uKOVyjtaaPZJgJqPDT4iipYQZe7FeLeGNacabqOrIHtkjeYPm7yVOiMMVfbQ%2BaKsKh5UvlxXy9PHVnn%2BP2zBCgpoxgcmgzQJUe0qv8d%2BYZoGcbHb0g9N8yjfh4%2BQ5OWwRR%2BEoexnSNbifitSmhxvmOmyzwwBcKgOvCWoCNWinNrqSE2IxglN%2FONlgApcNfN6K80jmFZQLc%2B7CCgAQmkKrlKcazNjUGVFA%3D%3D" title="clisignature" />
</body>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap"
        rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;700&display=swap" rel="stylesheet">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
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

<body style="font-family: Arial, sans-serif; font-size: 14px; color: #333; line-height: 1.6; padding: 10px;">
    <div class="container">
        <span>Hi {{ $assignee_name }},</span>
        <p>A feedback ticket that is assigned to you is marked as {{ lcfirst($status) }} by {{ $admin_name }}.
        </p>
        <p><strong>Ticket info:</strong></p>
        <ul style="list-style-type: none; padding: 0;">
            <li><strong>Ticket No:</strong> {{ $modifiedTicketId }}</li>
            <li><strong>Concern: </strong> {{ $details_concern }}</li>
            <li><strong>From:</strong> {{ ucwords($buyer_name) }}</li>
        </ul>
        {{-- <div class="footer">
            Best regards,
            Cebu Landmasters, Inc.
        </div> --}}

        <hr style="border: none; border-top: 1px solid #000; width: 50%; margin: 10px 0 10px 0;">

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
            src="https://storage.googleapis.com/super-app-storage/concerns/68773fee685f1.png?GoogleAccessId=super-app-dev-uat%40super-app-anaplan.iam.gserviceaccount.com&Expires=2068178415&Signature=lZThBXMVut6vzcqW5tgcJFr9oBxg210pSK6u6eKqmb14xzcHuwLfghzQDYA%2BE4wGcicDHuBSjBKXuZZmEDTyeIjGz1Pe1LFXXxX3LpDxZ0B1%2BWP2j3Eo4uKOVyjtaaPZJgJqPDT4iipYQZe7FeLeGNacabqOrIHtkjeYPm7yVOiMMVfbQ%2BaKsKh5UvlxXy9PHVnn%2BP2zBCgpoxgcmgzQJUe0qv8d%2BYZoGcbHb0g9N8yjfh4%2BQ5OWwRR%2BEoexnSNbifitSmhxvmOmyzwwBcKgOvCWoCNWinNrqSE2IxglN%2FONlgApcNfN6K80jmFZQLcf%2B7CCgAQmkKrlKcazNjUGVFA%3D%3D"
            title="clisignature" />


       

        {{-- <p style="font-weight: bold;">CLI - {{$department}}</p> --}}
    </div>
</body>

</html>
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

        .button-border {
            border-color: #3D3D3D;
        }
    </style>
</head>


<body
    style="font-family: Arial, sans-serif; font-size: 14px; color: #333; line-height: 1.6; background-image: url('https://storage.googleapis.com/super-app-storage/concerns/678f649c89f71.jpg?GoogleAccessId=799945112092-compute%40developer.gserviceaccount.com&Expires=2052983454&Signature=K%2BKq0z98OB3TTiwSnH10AASu1mmkGpRGLr86ywUwKYhVLvIPtFSlRiD8mARqBX4IfaydGrbSfqXrMBK%2B0IVtA8y17SPn4MYdEcyuBLjFqswPosJMgjesfs24gKvL4hYxvG9jUhLz%2FOUPMFDdUUgFKTlQDitUoORINioWQTF1G1KIjmCo7v5EGoVHvVgfQn5oCSFii8A6%2F3h3Kli4xy2uEwLy4%2F%2BHVWGOYqMI%2BLj%2Bfd4A2MK5GNdt5dUmi1UnlP4pmxeE%2FPjSvXdEtyqdVoD%2Fxyyog%2FzC8wlMVt9csQwnBqvYX0RJ7na2KAo9g8ZwHF8hWrO1tsYQ%2B2yrM%2FC1Gu1gOg%3D%3D'); max-width: 1000px; height:auto; background-size: cover; background-position: center; min-height: 100vh; position: bottom;">

    <div>
        <img style="margin-top: 5px; max-width: 1000px; height:auto;"
            src="https://storage.googleapis.com/super-app-storage/concerns/67935544b1cf0.jpg?GoogleAccessId=799945112092-compute%40developer.gserviceaccount.com&Expires=2053241671&Signature=J3R4fy9hxL91OnTkgfd8nTLsPcIvps1tZukmBvhGVfbZEjROqw9vuoDHEBcMuBLB901B%2BCOoDRVpkc8IIzRnmVWnLT21Xw6yo3vwPAGZZ4l%2B3qYcCwZ4dF4XRT%2F%2FQhFUkTHdKZdGYFiMxHY1Lu%2B%2BaikTiNg34ObJuqYhHUD3jsQ3VP64JcKGee9QZWM3MEovqnCJ89jhne7PW2VNK6OrFTtew0tutZsLwXYsBtBoFrIMT3n2AsGhiy8SUYYFhVNozcwdQ3qugaGHHiX5ki%2FIsW4Wmj6qXLvJ6KPtM%2F4fobHDzyCuxrOG2R7wiWGC2Aiq%2BIESG1oJtogLsRXyPrJhjQ%3D%3D"
            title="clisignature" />
    </div>
   
    <p style="color:#404B52; font-size: 20px;">Dear {{ ucwords($buyer_name) }},</p>
    <p style="color:#404B52; font-size: 20px;">
        Thank you for reaching out to us. We're glad we could assist you with your concern, and we hope everything has
        been @if ($status === 'resolve')
        resolved
        @else
        closed
        @endif
        to your satisfaction.
    </p>
    <p style="color:#404B52;font-size: 20px;">
        We value your feedback and would appreciate it if you could take a few moments to complete a short survey (5
        minutes)
        about your experience.<br>
        Your insights help us improve our services and better serve you in the future.
    </p>

    <p style="color:#404B52; font-size: 20px;">
        Please click the link below to access the survey: <br>
        <a href="{{ $selectedSurveyType['surveyLink']}}={{ $modifiedTicketId }}"
            style="  height: 50px; width: 225px;  margin-top: 5px; font-weight: 600; font-size: 18px;"
            class="button">
            Click Here! 👈
        </a>
        
    </p>

    <p style="color:#404B52; font-weight:500; font-size: 20px;">
        Thank you for your time and for being a valued customer. If you need any further assistance, feel free to reach
        out.
    </p>

    <p style="margin: 0; padding: 0; color:#404B52; font-weight:500; font-size: 20px;">
        Best regards,
    </p>
    <p style="margin: 0; padding: 0; color:#404B52; font-weight:500; font-size: 20px;">
        At CLI, we build with you in mind!
    </p>
    <div style="height: 25rem; width: 100%; "></div>
    {{-- <p style="margin: 0; padding: 0;">{{ ucwords($admin_name) }}</p>
    <p style="margin: 0; padding: 0;">CLI - {{$department}}</p> --}}
    {{-- <br>
    <img style="margin-top; 5px"
        src="https://storage.googleapis.com/super-app-storage/concerns/67219ce89c592.png?GoogleAccessId=799945112092-compute%40developer.gserviceaccount.com&Expires=2045788905&Signature=aIFtdGmczZSDdCikC8VR%2FIEnS6g0bLs%2BXhOP7lekJ5m10Qktmc%2FotqfUrpYCFyC9qBizDk5zo4jhc1ebO54YBPc45h1qYf%2B96R8m2v0AWzo9NED1sD6i4qgKPd4Nn5wJ19iZFPPpSXWrht7idXcg9Ja05hd%2BpuxoknvV0%2BP%2Fnh9W%2B4pucqoT%2Fo6C7jN9Rp2gvrkH04EgjgrsSfgTkxraaURAs0IcUlmq7Ma4eBQU%2FDL2uMuSsupk9%2FyxisXoI2PT%2FOAdjanl9uxSNFqnR2dg8YUmF2NcxRPaSjcojZfcwZEiuz%2B9Pc50f1DvqVNOe06hl%2BCw9i7dJMsKUNN0tgkz0w%3D%3D"
        title="clisignature" /> --}}

</body>
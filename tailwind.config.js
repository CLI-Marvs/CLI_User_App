/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./resources/**/*.blade.php",
        "./resources/**/*.js",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./resources/**/*.jsx",
    ],
    theme: {
        extend: {
            colors: {
                "custom-solidgreen": "#348017",
                "custom-lightgreen": "#70AD47",
                "custom-lightestgreen": "#D6E4D1",
                "custom-blue": "#1A73E8",
                "custom-solidblue": "#067ACS",
                "custom-lightblue": "#5B9BD5",
                "custom-gray": "#A5A5A5",
                "custom-bluegreen": "#175D5F",
                custombg: "#f1f1f1",
                custombg2: "#f5f5f5",
                custombg3: "#f7f7f7",
                customnavbar: "#D6E4D1",
                "custom-disable": "#D6E4D1",
                "custom-tablebg": "#F3F7F2",
                "custom-gray81": "#818181",
                "custom-gray71": "#717171",
                "custom-gray71": "#717171",
                "custom-gray12": "#121212",
                "custom-grayA5": "#A5A5A5",
                "custom-grayF1": "#F1F1F1",
                "custom-grayFA": "#FAFAFA",
            },
            borderWidth: {
                1: "1px",
                10: "10px",
                12: "12px",
                14: "14px",
            },
            spacing: {
                90: "22rem",
            },
            backgroundImage: {
                "gradient-to-r":
                    "linear-gradient(to right, var(--tw-gradient-stops))",
            },
            gradientColorStops: (theme) => ({
                "custom-green": "#70AD77",
                "custom-blue": "#175D5F",
            }),
            backgroundSize: {
                "full-width-original-height": "100% auto",
            },
            boxShadow: {
                custom: "0px 0px 10px rgba(0, 0, 0, 0.20)",
                custom2: "0px 0px 20px rgba(0, 0, 0, 0.50)",
                custom3: "0px 0px 10px rgba(0, 0, 0, 0.30)",
                custom4: "0px 3px 5px rgba(0, 0, 0, 0.30)",
                custom5: "0px 0px 5px rgba(0, 0, 0, 0.40)",
                custom6: "0px 3px 5px rgba(0, 0, 0, 0.30)",
                custom7: "0px 0px 5px rgba(0, 0, 0, 0.20)",
                custom8: "0px 10px 20px rgba(0, 0, 0, 0.50)",
                custom9:
                    "0px 3px 3px rgba(0, 0, 0, 0.10), 0px -3px 3px rgba(0, 0, 0, 0.10), 3px 0px 3px rgba(0, 0, 0, 0.10), -3px 0px 3px rgba(0, 0, 0, 0.10)",
                custom10: "12px 12px 7px rgba(0, 0, 0, 0.25)",
                custom11:
                    "0px 2px 3px rgba(0, 0, 0, 0.10), 0px 3px 3px rgba(0, 0, 0, 0.20)",
                custom12: "0px 3px 3px rgba(0, 0, 0, 0.20)",
                custom13:
                    "inset 3px 3px 3px rgba(0, 0, 0, 0.10), inset -3px 3px 3px rgba(0, 0, 0, 0.10), inset 0px 6px 3px rgba(0, 0, 0, 0.10)",
                card: "0px 14px 24px rgba(0, 0, 0, 0.06)",
                card2: ` 0px 10px 24px rgba(0, 0, 0, 0.06),    
     0px 0px 24px rgba(0, 0, 0, 0.06)`,
            },
            width: {
                "3/5": "60%",
                "17/20": "85%",
                108: "27rem",
                66: "17rem",
                90: "23rem",
                34: "8.5rem",
            },
            height: {
                30: "10 rem",
            },
            fontSize: {
                sm2: "11px",
                sm3: "10px",
                sm4: "9px",
                sm5: "8px",
                "sm-light": "13px",
                "sm-xlight": "12px",
            },
            animation: {
                fadeinleft: "fade-in-left 0.60s ease-in-out 0.10s 1",
                fadeinright: "fade-in-right 0.60s ease-in-out 0.10s 1",
                fadeoutleft: "fade-out-left 0.60s ease-in-out 0.10s 1",
                fadeoutright: "fade-out-right 0.60s ease-in-out 0.10s 1",
                fadein: "fade-in 1s ease-in-out 0.25s 1",
                fadeout: "fade-out 1s ease-out 0.25s 1",
            },
        },
        keyframes: {
            "fade-in-left": {
                "0%": {
                    opacity: 0,
                    transform: "translate3d(-60%, 0, 0)",
                },
                "100%": {
                    opacity: 1,
                    transform: "translate3d(0, 0, 0)",
                },
            },
            "fade-in-right": {
                "0%": {
                    opacity: 0,
                    transform: "translate3d(60%, 0, 0)",
                },
                "100%": {
                    opacity: 1,
                    transform: "translate3d(0, 0, 0)",
                },
            },
            "fade-out-left": {
                "0%": {
                    opacity: 1,
                },
                "100%": {
                    opacity: 0,
                    transform: "translate3d(-60%, 0, 0)",
                },
            },
            "fade-out-right": {
                "0%": {
                    opacity: 1,
                },
                "100%": {
                    opacity: 0,
                    transform: "translate3d(60%, 0, 0)",
                },
            },
            "fade-in": {
                "0%": {
                    opacity: 0,
                },
                "100%": {
                    opacity: 1,
                },
            },
            "fade-out": {
                "0%": {
                    opacity: 1,
                },
                "100%": {
                    opacity: 0,
                },
            },
            fontFamily: {
                montserrat: ["Montserrat", "sans-serif"],
                montserrat: ["Montserrat"],
                poppins: ["Poppins"],
            },
            backgroundImage: {
                "gradient-custom":
                    "linear-gradient(to right, #348017, #067ACS)",
            },
            textColor: {
                "gradient-custom":
                    "linear-gradient(to right, #348017, #067ACS)",
            },
            borderColor: {
                "gradient-custom":
                    "linear-gradient(to right, #348017, #067ACS)",
            },
        },
        // screens: {
        //   largeScreen: '1900px',
        //   mediumScrren: '1500px'
        // }
    },
    plugins: [],
};

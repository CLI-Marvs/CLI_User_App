import React, { useEffect } from "react";
import CLILogo from "../../../../../public/Images/CLI20-Logo.png";
import GoogleLogo from "../../../../../public/Images/googleLogo.svg";
import { API_PROVIDER } from "../../servicesApi/apiService";
import { useLocation } from "react-router-dom";
const Login = () => {
    const location = useLocation();

    useEffect(() => {
        // Get the 'error' query parameter
        const params = new URLSearchParams(location.search);
        const errorMessage = params.get("error");

        if (errorMessage) {
            alert(decodeURIComponent(errorMessage)); // Show the alert with the error message
        }
    }, [location]);
    const signinGoogle = () => {
        const response = window.location.href = `${API_PROVIDER}/google/redirect`;
        console.log("response", response);
    };

    return (
        <>
            <div className="flex h-screen w-full relative overflow-hidden">
                <div className="bg-left-side flex h-full w-1/2 "></div>
                <div className="w-1/2 flex flex-col items-center justify-center p-4 z-2">
                    <div className="">
                        <img className="h-40" src={CLILogo} alt="cli logo" />
                    </div>
                    <div className="bg-white px-12 pb-8 pt-12 rounded-xl shadow-custom w-108">
                        <button onClick={signinGoogle} className="relative flex justify-center items-center w-full text-sm border rounded-lg border-custom-lightgreen hover:shadow-custom3 text-custom-lightgreen h-11 mb-2">
                            <img src={GoogleLogo} className="h-5 w-5 mr-6" />
                            <span className="relative right-3 text-base">
                                Login with Google
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;

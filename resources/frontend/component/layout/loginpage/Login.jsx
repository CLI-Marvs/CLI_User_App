import React, { useEffect, useState } from "react";
import CLILogo from "../../../../../public/Images/CLI_Horizontal.svg";
import GoogleLogo from "../../../../../public/Images/googleLogo.svg";
import { API_PROVIDER } from "../../servicesApi/apiService";
import { useLocation } from "react-router-dom";
import { toast, Bounce, ToastContainer } from "react-toastify";

const Login = () => {
    const location = useLocation();
    const [showModal, setShowModal] = useState(false);
    const APP_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        // Get the 'error' query parameter
        const query = new URLSearchParams(location.search);
        const error = query.get("error");
        if (error) {
            toast.error(error, {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
            });
            // Clear the error from the URL
            window.history.replaceState({}, document.title, "/");
        }
    }, [location]);

    useEffect(() => {
        const isBannerShown = sessionStorage.getItem("bannerShown");

        if (!isBannerShown) {
            // Always show banner once when app loads
            setShowModal(true);
            sessionStorage.setItem("bannerShown", "true");
        }

        if (
            APP_URL === "http://localhost:8001" ||
            APP_URL === "https://admin-dev.cebulandmasters.com" ||
            APP_URL === "https://admin-uat.cebulandmasters.com"
        ) {
            sessionStorage.setItem("isTestEnvironment", "true");
        }
    }, []);

    const signinGoogle = async () => {
        window.location.href = `${API_PROVIDER}/google/redirect`;
    };

    return (
        <>
            <ToastContainer />
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative animate-fadeIn">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label="Close modal"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>

                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                                <svg
                                    className="h-6 w-6 text-[#70ad47]"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <h3 className="montserrat-semibold text-base">
                                TEST ENVIRONMENT
                            </h3>
                            <p className="text-sm text-gray-500 mb-6 mt-3 montserrat-medium">
                                You are currently accessing a{" "}
                                <strong>test environment</strong>, which is for
                                testing and exploration purposes only. To access
                                the <strong>Live application</strong>, go to{" "}
                                <a href={APP_URL} className="underline">
                                    master-cx.cebulandmasters.com
                                </a>
                            </p>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-full text-white py-2 px-4 rounded-lg gradient-background3 montserrat-medium transition-colors"
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex h-screen w-full relative overflow-hidden">
                <div className="bg-left-side flex h-full w-1/2 "></div>
                <div className="w-1/2 flex flex-col items-center justify-center p-4 z-2">
                    <div className="mb-[26px]">
                        <img
                            className="w-[352px]"
                            src={CLILogo}
                            alt="cli logo"
                        />
                    </div>
                    <div className="bg-white shadow-custom w-[528px] h-[144px] rounded-[20px] py-[42px] px-[33px]">
                        <button
                            onClick={signinGoogle}
                            className="relative flex gap-[20px] justify-center items-center w-full h-[60px] text-[18px] border rounded-[10px] border-custom-lightgreen hover:shadow-custom3 text-custom-lightgreen"
                        >
                            <img
                                src={GoogleLogo}
                                className="h-[30px] w-[30px]"
                            />
                            <span className="relative right-3">
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

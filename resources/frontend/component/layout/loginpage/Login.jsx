import React, { useEffect } from "react";
import CLILogo from "../../../../../public/Images/CLI_Horizontal.svg";
import GoogleLogo from "../../../../../public/Images/googleLogo.svg";
import { API_PROVIDER } from "../../servicesApi/apiService";
import { useLocation } from "react-router-dom";
import { toast, Bounce, ToastContainer } from "react-toastify";
const Login = () => {
    const location = useLocation();

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


    const signinGoogle = async () => {
        window.location.href = `${API_PROVIDER}/google/redirect`;
    };

    return (
        <>
            <ToastContainer />
            <div className="flex h-screen w-full relative overflow-hidden">
                <div className="bg-left-side flex h-full w-1/2 "></div>
                <div className="w-1/2 flex flex-col items-center justify-center p-4 z-2">
                    <div className="mb-[26px]">
                        <img className="w-[352px]" src={CLILogo} alt="cli logo" />
                    </div>
                    <div className="bg-white shadow-custom w-[528px] h-[144px] rounded-[20px] py-[42px] px-[33px]">
                        <button
                            onClick={signinGoogle}
                            className="relative flex gap-[20px] justify-center items-center w-full h-[60px] text-[18px] border rounded-[10px] border-custom-lightgreen hover:shadow-custom3 text-custom-lightgreen"
                        >
                            <img src={GoogleLogo} className="h-[30px] w-[30px]" />
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

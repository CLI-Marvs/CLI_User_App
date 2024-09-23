import React from "react";
import { Link } from "react-router-dom";
import { useStateContext } from "../../../../context/contextprovider";

const DisconnectedPage = () => {
    const { token } = useStateContext();
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
            <div className="w-full max-w-3xl p-6 bg-red-100 border border-red-300 rounded-lg">
                <div className="flex items-center mb-4">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-red-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M18.364 5.636a9 9 0 11-12.728 12.728A9 9 0 0118.364 5.636zm-2.828 2.828L7.05 18.95M12 12h.01"
                        />
                    </svg>
                    <h1 className="ml-3 text-lg font-semibold text-red-700">
                        Page Disconnected:
                    </h1>
                </div>
                <p className="text-red-700 mb-4">
                    The page you requested was disconnected from the server.
                    This page is no longer available. As a security precaution,
                    the web browser does not automatically resubmit your
                    information for you.
                </p>
                <p className="text-blue-700">
                    Please{" "}
                   {/*  <Link
                        className="underline text-blue-500 hover:text-blue-700"
                        to="/"
                    >
                        click here
                    </Link>{" "} */}
                    to go back to the Log In page.
                </p>
            </div>
        </div>
    );
};

export default DisconnectedPage;

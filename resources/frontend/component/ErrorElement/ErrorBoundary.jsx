
import React, { useState, useEffect } from "react";

const ErrorBoundary = ({ children }) => {
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        const errorHandler = (error, errorInfo) => {
            setHasError(true);
        };

        window.addEventListener("error", errorHandler);
        window.addEventListener("unhandledrejection", errorHandler);

        return () => {
            window.removeEventListener("error", errorHandler);
            window.removeEventListener("unhandledrejection", errorHandler);
        };
    }, []);

    if (hasError) {
        return (
            <div className="relative flex flex-col justify-center items-center h-screen text-center">
                <div className="absolute inset-0"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl montserrat-semibold">
                        Oops! Something went wrong.
                    </h1>
                    <p className="montserrat-regular py-3">
                        Please refresh or try again later.
                    </p>
                </div>
            </div>
        );
    }

    return children;
};

export default ErrorBoundary;

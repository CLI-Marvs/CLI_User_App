import React from "react";
import errorImage from "../../../../public/Images/errorImage.png";

const ErrorPage = () => {
    return (
        <div className="relative flex flex-col justify-center items-center h-screen text-center">
            <div className="absolute inset-0"></div>
            <div className="relative z-10">
                <img
                    className="h-50 w-80 object-contain md:object-cover mx-auto"
                    src={errorImage}
                    alt="Error Image"
                    loading="lazy"
                />
                <h1 className="text-3xl montserrat-semibold">
                    Oops! Something went wrong.
                </h1>
            </div>
        </div>
    );
};

export default ErrorPage;

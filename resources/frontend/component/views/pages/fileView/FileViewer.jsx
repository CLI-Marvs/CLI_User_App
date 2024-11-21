import React, { useState, useEffect } from "react";
import apiService from "../../../servicesApi/apiService";
import CircularProgress from "@mui/material/CircularProgress";

import { useStateContext } from "../../../../context/contextprovider";
const FileViewer = () => {
    //State
    const [fileUrlPath, setFileUrlPath] = useState(null);
    const [loading, setLoading] = useState(false);
    const { token } = useStateContext();
    const [folderName, setFolderName] = useState('');
    const [imageDimensions, setImageDimensions] = useState({
        width: 0,
        height: 100,
    });

    const APP_URL = import.meta.env.VITE_API_BASE_URL; 

    //Hooks
    /**
     *  Get the file URL from localStorage when the page loads
     */

    useEffect(() => {
        if (APP_URL === 'http://localhost:8002') {
            setFolderName('concerns/');
        } else if (APP_URL === 'https://admin-uat.cebulandmasters.com') {
            setFolderName('concerns-uat/');
        } else if (APP_URL === 'http://localhost:8001') {
            setFolderName('concerns-attachments/');
        }
    }, [])

    useEffect(() => {
        const storedFileUrlPath = localStorage.getItem("fileUrlPath");
        if (storedFileUrlPath) {
            setFileUrlPath(JSON.parse(storedFileUrlPath));
            localStorage.removeItem("fileUrlPath");
        }
    }, []);

    console.log("fileUrlPath", fileUrlPath);

    /**
     * Check if the user is authenticated, place this function here to early check if the user is authenticated or not
     */
    if (!token) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <h1 className="text-lg font-bold">Unauthorized Access</h1>
            </div>
        );
    }

    //Event Handlers
    /**
     * Prevent the default context menu or the inspect element from appearing
     */
    const handleContextMenu = (event) => {
        event.preventDefault();
    };

    /**
     *  This function handles keydown events to prevent default actions for specific key combinations
     * that are commonly used to open developer tools or view source.
     *  The following key combinations are prevented:
     *  F12 (opens developer tools)
     *   Ctrl + Shift + I (opens developer tools)
     *   Ctrl + Shift + C (opens inspect element)
     *   Ctrl + U (views page source)
     *    Cmd + I (opens developer tools on macOS)
     *    Cmd + Shift + C (inspects element on macOS)
     */
    const handleKeyDown = (event) => {
        if (
            event.key === "F12" ||
            (event.ctrlKey &&
                event.shiftKey &&
                (event.key === "I" || event.key === "C")) ||
            (event.ctrlKey && event.key === "U") ||
            (event.metaKey && event.key === "I") ||
            (event.metaKey && event.shiftKey && event.key === "C")
        ) {
            event.preventDefault();
        }
    };

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    /*
     * Check if fileUrlPath is available before performing operations on it
     */
    if (!fileUrlPath) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <h1 className="text-lg font-bold">No Attachment Found</h1>
            </div>
        );
    }

   
    // Get the file name including the path after 'concerns/'
    const concernsPathIndex =
        fileUrlPath.indexOf(folderName) + folderName.length;
    const fullFilePath = fileUrlPath.slice(concernsPathIndex);

    // Get the full URL and determine the extension
    const fileName = fullFilePath.split("?")[0];
    console.log("fileName", fileName);
    const fileExtension = fileName.split(".").pop().toLowerCase();

    /**
     * Function to handle the loading of an image
     */
    const handleImageLoad = (e) => {
        // Destructure the width and height properties from the event target (the loaded image)
        let { width, height } = e.target;
        console.log("orig size", width, height);
        if (width > 1200) {
            const aspectRatio = width / height; // Calculate the aspect ratio
            width = 1200; // Set the new width to 1200
            height = 1200 / aspectRatio; // Set height proportional to the new width
        }
        // Update the state with the dimensions of the loaded image
        setImageDimensions({ width, height });
    };

    /**
     * Function to handle download of the file from the google
     */
    const handleDownloadFile = async (fileName) => {
        try {
            setLoading(true);
            //Set responseType to 'blob' to receive the file as a binary blob
            const response = await apiService.post(
                "download-file",
                { fileUrlPath: fileName },
                { responseType: "blob" }
            );
            // Convert the response data to a blob
            const blob = new Blob([response.data], {
                type: response.headers["content-type"],
            });
            const url = window.URL.createObjectURL(blob);

            // Create a link element and trigger a download
            const link = document.createElement("a");
            link.href = url;
            link.download = fileName; // Use the actual file name here
            link.click();

            // Clean up URL object
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.log("Error in downloading file", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
           /*  onContextMenu={handleContextMenu} */
            className={`${fileExtension === "txt" ? "bg-white" : "bg-black"}`}
        >
            {fileExtension === "jpg" ||
            fileExtension === "bmp" ||
            fileExtension === "png" ||
            fileExtension === "jpeg" ? (
                <div className="flex items-center justify-center min-h-screen">
                    <img
                        onLoad={handleImageLoad}
                        src={fileUrlPath}
                        alt="attachment"
                        width={
                            imageDimensions.width > 0
                                ? imageDimensions.width
                                : undefined
                        }
                        height={
                            imageDimensions.height > 0
                                ? imageDimensions.height
                                : undefined
                        }
                    />
                </div>
            ) : fileExtension === "pdf" || fileExtension === "txt" ? (
                <iframe
                    onContextMenu={(e) => e.preventDefault()}
                    src={fileUrlPath}
                    width="100%"
                    className="min-h-screen "
                ></iframe>
            ) : fileExtension === "xls" ||
              fileExtension === "xlsx" ||
              fileExtension === "xlsm" ||
              fileExtension === "xml" ||
              fileExtension === "doc" ||
              fileExtension === "docx" ||
              fileExtension === "csv" ? (
                <div className="flex flex-col items-center justify-center min-h-screen text-white">
                    <p>Only images, text documents and pdf are viewable.</p>
                    <button
                        onClick={() => handleDownloadFile(fileName)}
                        disabled={loading}
                        type="submit"
                        className={` mt-4 w-[133px] text-sm montserrat-semibold text-white h-[49px] rounded-[10px] gradient-btn2 flex justify-center items-center gap-2 tablet:w-full hover:shadow-custom4  ${
                            loading ? "cursor-not-allowed" : ""
                        }`}
                    >
                        {loading ? (
                            <CircularProgress className="spinnerSize" />
                        ) : (
                            <>Download File</>
                        )}
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center min-h-screen text-white">
                    <p>Only images, text documents and pdf are viewable.</p>
                    <button
                        onClick={() => handleDownloadFile(fileName)}
                        disabled={loading}
                        type="submit"
                        className={` mt-4 w-[133px] text-sm montserrat-semibold text-white h-[49px] rounded-[10px] gradient-btn2 flex justify-center items-center gap-2 tablet:w-full hover:shadow-custom4  ${
                            loading ? "cursor-not-allowed" : ""
                        }`}
                    >
                        {loading ? (
                            <CircularProgress className="spinnerSize" />
                        ) : (
                            <>Download File</>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default FileViewer;

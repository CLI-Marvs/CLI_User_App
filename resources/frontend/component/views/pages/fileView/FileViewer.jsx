import React, { useState, useEffect } from "react";

import { useStateContext } from "../../../../context/contextprovider";
const FileViewer = () => {
    //State
    const [fileUrlPath, setFileUrlPath] = useState(null);

    const { token } = useStateContext();
    const [imageDimensions, setImageDimensions] = useState({
        width: 0,
        height: 100,
    });

    //Hooks
    /**
     *  Get the file URL from localStorage when the page loads
     */
    useEffect(() => {
        const storedFileUrlPath = localStorage.getItem("fileUrlPath");
        if (storedFileUrlPath) {
            setFileUrlPath(JSON.parse(storedFileUrlPath));
            localStorage.removeItem("fileUrlPath");
        }
    }, []);

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
        fileUrlPath.indexOf("concerns/") + "concerns/".length;
    const fullFilePath = fileUrlPath.slice(concernsPathIndex);
    // Get the full URL and determine the extension
    const fileName = fullFilePath.split("?")[0];
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
    return (
        <div
            onContextMenu={handleContextMenu}
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
              fileExtension === ".xml" ||
              fileExtension === "doc" ||
              fileExtension === "docx" ||
              fileExtension === ".csv" ? (
                <div className="flex flex-col items-center justify-center min-h-screen text-white">
                    <p>Only images, text documents and pdf are viewable.</p>
                    <button className="w-[133px] h-[39px] gradient-btn5 font-semibold text-sm text-white rounded-[10px] mt-4">
                        Download File
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center min-h-screen text-white">
                    <p>Only images, text documents and pdf are viewable.</p>
                    <button className="w-[133px] h-[39px] gradient-btn5 font-semibold text-sm text-white rounded-[10px] mt-4">
                        Download File
                    </button>
                </div>
            )}
        </div>
    );
};

export default FileViewer;

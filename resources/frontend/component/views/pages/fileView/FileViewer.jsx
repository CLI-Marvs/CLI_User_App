import React, { useState, useEffect } from "react";

import { useStateContext } from "../../../../context/contextprovider";
const FileViewer = () => {
    //State
    const [fileUrlPath, setFileUrlPath] = useState(null);
    const { token } = useStateContext();

    //Hooks
    useEffect(() => {
        // Get the file URL from localStorage when the page loads
        const storedFileUrlPath = localStorage.getItem("fileUrlPath");
        if (storedFileUrlPath) {
            setFileUrlPath(JSON.parse(storedFileUrlPath));
            localStorage.removeItem("fileUrlPath"); // Optionally remove it after use
        }
    }, []);

    if (!token) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <h1 className="text-lg font-bold">Unauthorized Access</h1>
            </div>
        );
    } //Check if the user is authenticated, place this function here to early check if the user is authenticated or not

    const handleContextMenu = (event) => {
        event.preventDefault();
    }; // Prevent the default context menu from appearing

    const handleKeyDown = (event) => {
        if (
            event.key === "F12" ||
            (event.ctrlKey &&
                event.shiftKey &&
                (event.key === "I" || event.key === "C")) ||
            (event.ctrlKey && event.key === "U") ||
            (event.metaKey && event.key === "I") || // Cmd + I for macOS
            (event.metaKey && event.shiftKey && event.key === "C") // Cmd + Shift + C for macOS
        ) {
            event.preventDefault(); // Prevent the default action
        }
    };

    // Add this event listener in a useEffect hook
    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    if (!fileUrlPath) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <h1 className="text-lg font-bold">No Attachment Found</h1>
            </div>
        );
    } // Check if fileUrlPath is available before performing operations on it

    // Get the file name including the path after 'concerns/'
    const concernsPathIndex =
        fileUrlPath.indexOf("concerns/") + "concerns/".length;
    // This gives you everything after 'concerns/'
    const fullFilePath = fileUrlPath.slice(concernsPathIndex);

    // Get the full URL and determine the extension
    const fileName = fullFilePath.split("?")[0];
    const fileExtension = fileName.split(".").pop().toLowerCase();

    return (
        <div onContextMenu={handleContextMenu}>
            {fileExtension === "jpg" ||
            fileExtension === "png" ||
            fileExtension === "jpeg" ? (
                <div className="flex items-center justify-center min-h-screen">
                    <img
                        src={fileUrlPath}
                        alt="attachment"
                        className="w-96 h-96"
                    />
                </div>
            ) : fileExtension === "pdf" ? (
                <iframe
                    onContextMenu={(e) => e.preventDefault()}
                    src={fileUrlPath}
                    width="100%"
                    className="min-h-screen "
                ></iframe>
            ) : fileExtension === "xlsx" ||
              fileExtension === "xls" ||
              fileExtension === "xlsm" ||
              fileExtension === ".xml" ? (
                <div className="flex items-center justify-center min-h-screen">
                    <a href={fileUrlPath} download>
                        Download Excel File
                    </a>
                </div>
            ) : (
                <a href={fileUrlPath} target="_blank" rel="noopener noreferrer">
                    Download File
                </a>
            )}
        </div>
    );
};

export default FileViewer;

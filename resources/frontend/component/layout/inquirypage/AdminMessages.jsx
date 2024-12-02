import React, { useEffect, useState, useRef } from "react";
import AdminLogo from "../../../../../public/Images/AdminSilouette.svg";
import { useStateContext } from "../../../context/contextprovider";
import FolderFile from "../../../../../public/Images/folder_file.svg";
import { BsDownload } from "react-icons/bs";
import moment from "moment";
import apiService from "../../servicesApi/apiService";
import CircularProgress from "@mui/material/CircularProgress";

import { useNavigate, Link } from "react-router-dom";
const AdminMessages = ({ items }) => {
    //State
    const APP_URL = import.meta.env.VITE_API_BASE_URL;
    const [loadingStates, setLoadingStates] = useState({});  //Each file's loading state is managed independently in the loadingStates object.
    const { user } = useStateContext();
    const attachmentData = JSON.parse(items.attachment || "[]");
    const [folderName, setFolderName] = useState('');


    const navigate = useNavigate();
    const dynamicName =
        user?.id === parseInt(items?.admin_id)
            ? "You"
            : `CLI ${user?.department}`;

    const formattedDate = moment(items.created_at).format("MMMM D, YYYY");
    const formattedTime = moment(items.created_at).format("hh:mm A");


    /**
     *  Get the file URL from localStorage when the page loads
     */
    useEffect(() => {
        if (APP_URL === 'http://localhost:8001' || APP_URL === 'https://admin-dev.cebulandmasters.com') {
            setFolderName('concerns/');
        } else if (APP_URL === 'https://admin-uat.cebulandmasters.com') {
            setFolderName('concerns-uat/');
        } else if (APP_URL === 'https://admin.cebulandmasters.com') {
            setFolderName('concerns-attachments/');
        }
    }, [])




    /*
     * Function to handle download of the file from the google cloud
     */
    const handleDownloadFile = async (attachmentUrl) => {
        // Get the file name including the path after 'concerns/'
        const concernsPathIndex =
            attachmentUrl.indexOf(folderName) + folderName.length;
        const fullFilePath = attachmentUrl.slice(concernsPathIndex);

        // Get the full URL and determine the extension
        const fileName = fullFilePath.split("?")[0];

        try {
            // Set loading state for the specific file
            setLoadingStates((prev) => ({ ...prev, [attachmentUrl]: true }));

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
            // Reset loading state for the specific file
            setLoadingStates((prev) => ({ ...prev, [attachmentUrl]: false }));
        }
    };

    return (
        <div className="w-full">
            <div className="flex justify-start w-full mt-[27px] gap-2 ">
                <div className="flex flex-col text-sm gap-[6px]">
                    <p className="font-semibold  text-custom-bluegreen">
                        {formattedDate} <span>|</span> {formattedTime}
                    </p>
                    <p className="flex gap-1 text-custom-gray81">
                        <span>From:</span>
                        {items.admin_name} <span>|</span>
                        CLI
                        <span>|</span>
                        Customer Relations - Services
                    </p>
                </div>
            </div>
            <div className="w-full mt-[10px]">
                <div className=" w-full h-auto gradient-background2 rounded-b-[10px] rounded-r-[10px] p-[20px] pl-[31px] text-sm">
                    <div className="break-words whitespace-pre-wrap">
                        <p
                            dangerouslySetInnerHTML={{
                                __html: items.details_message,
                            }}
                        />
                    </div>
                    {Array.isArray(attachmentData) &&
                        attachmentData.length > 0 &&
                        attachmentData.map((attachment, index) => {
                            const fileName = attachment?.original_file_name;
                            if (!fileName) {
                                // If fileName is undefined or null, return a fallback UI or nothing
                                return null;
                            }
                            const fileType = fileName.split(".").pop(); // Get the file extension
                            const baseName = fileName.substring(
                                0,
                                fileName.lastIndexOf(".")
                            ); // Get the name without extension

                            // Truncate the base name to 15 characters
                            const truncatedName =
                                baseName.length > 15
                                    ? `${baseName.slice(0, 15)}...`
                                    : baseName;
                            return (
                                <div
                                    className="mt-4 w-[300px] overflow-hidden font-light flex items-center gap-x-4 "
                                    key={index}
                                >
                                    <Link
                                        to={`/file-viewer/attachment/${items.id}`}
                                        onClick={(e) => {
                                            e.preventDefault(); // Prevents the immediate navigation

                                            localStorage.setItem(
                                                "fileUrlPath",
                                                JSON.stringify(attachment.url)
                                            );
                                            window.open(
                                                `/file-viewer/attachment/${items.id}`,
                                                "_blank"
                                            );
                                        }}
                                        className="flex items-center justify-start bg-customnavbar h-12 pl-4 text-black gap-2 rounded-[5px]"
                                    >
                                        <img
                                            src={FolderFile}
                                            alt="View Attachment"
                                        />
                                        <span className="w-[200px] h-[20px]">
                                            {" "}
                                            {truncatedName}.{fileType}
                                        </span>
                                    </Link>
                                    <div>
                                        <button
                                            onClick={() => handleDownloadFile(attachment.url)}
                                            disabled={loadingStates[attachment.url]}
                                            type="submit"
                                            className="h-6 w-6 text-custom-solidgreen hover:text-gray-700 cursor-pointer"
                                        >
                                            {loadingStates[attachment.url] ? (
                                                <CircularProgress className="spinnerSize" />
                                            ) : (
                                                <BsDownload className="h-6 w-6 text-custom-solidgreen hover:text-gray-700 cursor-pointer" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}

                </div>
            </div>
        </div>
    );
};

export default AdminMessages;

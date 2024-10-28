import React, { useEffect, useState, useRef } from "react";
import AdminLogo from "../../../../../public/Images/AdminSilouette.svg";
import { useStateContext } from "../../../context/contextprovider";
import FolderFile from "../../../../../public/Images/folder_file.svg";

import moment from "moment";
import { useNavigate, Link } from "react-router-dom";
const AdminMessages = ({ items }) => {
    //State
  
    console.log("item", items); 
    console.log('12')
    const { user } = useStateContext();
    const attachmentData = JSON.parse(items.attachment || "[]");
    /* console.log("attachmentData", iteattachmentDatams);  */

    const navigate = useNavigate();
    const dynamicName =
        user?.id === parseInt(items?.admin_id)
            ? "You"
            : `CLI ${user?.department}`;

    const formattedDate = moment(items.created_at).format("MMMM D, YYYY");
    const formattedTime = moment(items.created_at).format("hh:mm A");

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
                                    className="mt-4 w-[219px] overflow-hidden font-light"
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
                                </div>
                            );
                        })}
                  
                </div>
            </div>
        </div>
    );
};

export default AdminMessages;

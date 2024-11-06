import React from "react";
import FolderFile from "../../../../../public/Images/folder_file.svg";
import Kent from "../../../../../public/Images/kent.png";
import defaultAvatar from "../../../../../public/Images/AdminSilouette.svg";
import moment from "moment";
import { useStateContext } from "../../../context/contextprovider";
import { Link, useLocation, useParams } from "react-router-dom";

const UserMessages = ({ items, dataConcern }) => {
    const attachmentData = JSON.parse(items.attachment || "[]");
    const { data } = useStateContext();

    const params = useParams();
    const ticketId = decodeURIComponent(params.id);
    const formattedDate = moment(items.created_at).format("MMMM D, YYYY");
    const formattedTime = moment(items.created_at).format("hh:mm A");

    /*   const location = useLocation();
    const { dataConcern } = location?.state || {}; */
    /*  const dataConcern = data?.find((item) => item.ticket_id === ticketId) || {}; */
    const capitalizeWords = (name) => {
        if (name) {
            return name
                .split(" ")
                .map(
                    (word) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase()
                )
                .join(" ");
        }
    };
    return (
        <div className="w-full">
            <div className="flex w-full mt-[27px] gap-[10px]">
                <div className="flex flex-col gap-[6px]">
                    <p className="flex gap-1 font-semibold text-sm text-custom-bluegreen">
                        {formattedDate} <span>|</span> {formattedTime}
                    </p>
                    <p className=" text-sm text-custom-gray81 flex gap-1">
                        <span>From:</span>
                        {capitalizeWords(
                            `${dataConcern?.buyer_firstname || ""} ${
                                dataConcern?.buyer_middlename || ""
                            } ${dataConcern?.buyer_lastname || ""}`
                        )}{" "}
                        {capitalizeWords(dataConcern?.suffix_name)}
                    </p>
                    <p className=" text-sm text-custom-gray81 flex gap-1">
                        {dataConcern.buyer_email} <span>|</span>{" "}
                        {dataConcern.mobile_number}
                    </p>
                </div>
            </div>
            <div className="w-full mt-[10px]">
                <div className="w-full h-auto gradient-background1 rounded-b-[10px] rounded-r-[10px]  p-[20px] pl-[31px] text-xs text-white">
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
                                            console.log(
                                                "attachment",
                                                attachment.url
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

export default UserMessages;

import React from "react";
import FolderFile from "../../../../../public/Images/folder_file.svg";
import Kent from "../../../../../public/Images/kent.png";
import defaultAvatar from "../../../../../public/Images/AdminSilouette.svg";
import moment from "moment";
import { useStateContext } from "../../../context/contextprovider";
import { Link, useParams } from "react-router-dom";

const UserMessages = ({ items }) => {
    const attachmentData = JSON.parse(items.attachment || "[]");
    const { data } = useStateContext();

    const params = useParams();
    const ticketId = decodeURIComponent(params.id);
    const formattedDate = moment(items.created_at).format("MMMM D, YYYY");
    const formattedTime = moment(items.created_at).format("hh:mm A");

    const dataConcern = data?.find((item) => item.ticket_id === ticketId) || {};
    console.log("items in USERMESSAGE", items);
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
                        {capitalizeWords(dataConcern.buyer_name)}
                    </p>
                    <p className=" text-sm text-custom-gray81 flex gap-1">
                        {dataConcern.buyer_email} <span>|</span>{" "}
                        {dataConcern.mobile_number}
                    </p>
                </div>
            </div>
            <div className="w-full mt-[10px]">
                <div className="w-full h-auto gradient-background1 rounded-b-[10px] rounded-r-[10px]  p-[20px] pl-[31px] text-xs text-white">
                    <div>

                        <p
                            dangerouslySetInnerHTML={{
                                __html: items.details_message,
                            }}
                        />
                    </div>
                    {Array.isArray(attachmentData) &&
                        attachmentData.length > 0 &&
                        attachmentData.map((attachment, index) => {
                            console.log("123", attachment.original_file_name);
                            return (
                                <div className="mt-4 w-[400px] bg-red-900" key={index}>
                                    <Link
                                        to={`/file-viewer/attachment/${items.id}`}
                                        onClick={(e) => {
                                            e.preventDefault(); // Prevents the immediate navigation
                                            console.log(
                                                "attachment",
                                                attachment
                                            );
                                            localStorage.setItem(
                                                "fileUrlPath",
                                                JSON.stringify(attachment.url)
                                            ); // Store the data
                                            // Manually navigate to the new page after setting localStorage
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
                                        View Attachment
                                        <span>{attachment.original_name}</span>
                                    </Link>
                                    {attachment.original_file_name}
                                </div>
                            );
                        }
                         
                        )}
                </div>
            </div>
        </div>
    );
};

export default UserMessages;

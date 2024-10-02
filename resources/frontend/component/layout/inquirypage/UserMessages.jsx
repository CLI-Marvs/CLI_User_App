import React from "react";
import FolderFile from "../../../../../public/Images/folder_file.svg";
import Kent from "../../../../../public/Images/kent.png";
import defaultAvatar from "../../../../../public/Images/AdminSilouette.svg";
import moment from "moment";

const UserMessages = ({ items }) => {
    const attachmentData = JSON.parse(items.attachment || "[]");

    const formatTime = (createdAt) => {
        return moment(createdAt).fromNow();
    };

    return (
        <div className="w-full">
            <div className="flex w-full mt-[27px] gap-[10px]">
                <div className="flex flex-col gap-[6px]">
                    <p className="flex gap-1 font-semibold text-sm text-custom-bluegreen">September 1, 2024 <span>|</span> 11:19 AM</p>
                    <p className=" text-sm text-custom-gray81 flex gap-1">
                        <span>
                            From: 
                        </span> 
                        {(() => {
                            const nameParts = items.buyer_name.split(" ");
                            const lastName = nameParts.pop();
                            const firstName = nameParts.join(" ");

                            const capitalize = (name) =>
                                name.charAt(0).toUpperCase() +
                                name.slice(1).toLowerCase();

                            return `${capitalize(firstName)} ${capitalize(
                                lastName
                            )}`;
                        })()}
                    </p>
                    <p className=" text-sm text-custom-gray81 flex gap-1">
                        josh@gmail.com <span>|</span> 09123123123
                    </p>
                </div>
            </div>
            <div className="w-full mt-[10px]">
                <div className="w-full h-auto gradient-background1 rounded-b-[10px] rounded-r-[10px]  p-[20px] pl-[31px] text-sm text-white">
                    <div>
                        <p>{items.details_message}</p>
                    </div>
                    {Array.isArray(attachmentData) &&
                        attachmentData.length > 0 &&
                        attachmentData.map((attachment, index) => (
                            <div className="mt-4" key={index}>
                                <button
                                    onClick={() =>
                                        window.open(attachment, "_blank")
                                    }
                                    className="flex items-center justify-start bg-customnavbar h-12 px-24 pl-4 text-black gap-2 rounded-[5px]"
                                >
                                    <img
                                        src={FolderFile}
                                        alt="View Attachment"
                                    />
                                    View Attachment
                                </button>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
};

export default UserMessages;

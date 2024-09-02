import React from "react";
import FolderFile from "../../../../../public/Images/folder_file.svg";
import Kent from "../../../../../public/Images/kent.png";
import moment from "moment";

const UserMessages = ({ items }) => {
    const formatTime = (createdAt) => {
        return moment(createdAt).fromNow();
    };
    return (
        <div className="w-full">
            <div className="flex w-full mt-10 gap-2">
                <div className="h-12 w-12">
                    <img className="rounded-full" src={Kent} alt="" />
                </div>
                <div className="flex flex-col">
                    <p className="font-bold text-custom-bluegreen">Buyer</p>
                    <p className="font-semibold text-custom-gray81">
                        {items.buyer_name}
                    </p>
                </div>
            </div>
            <div className="w-full mt-2 pl-12">
                <div className="w-full h-auto gradient-background1 rounded-b-lg rounded-r-lg  px-8 py-3 text-white">
                    <div>
                        <p>{items.details_message}</p>
                    </div>
                    {items.attachment && (
                        <div className="mt-4">
                            <button
                                onClick={() =>
                                    window.open(items.attachment, "_blank")
                                }
                                className="flex items-center justify-start bg-customnavbar h-12 px-24 pl-4 text-black gap-2 rounded-lg"
                            >
                                <img src={FolderFile} alt="download btn" />
                                View Attachment
                            </button>
                        </div>
                    )}
                </div>
                <div className="w-full flex justify-end">
                    <p className="flex text-custom-gray81 text-sm space-x-1">
                        {/*   <span>Jul 17, 2024,</span>
                    <span>11:19 AM</span>
                    <span>(7 days ago)</span> */}

                        <p>{formatTime(items.created_at)}</p>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UserMessages;

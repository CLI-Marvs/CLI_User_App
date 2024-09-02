import React from "react";
import AdminLogo from "../../../../../public/Images/AdminSilouette.svg";
import { useStateContext } from "../../../context/contextprovider";
import FolderFile from "../../../../../public/Images/folder_file.svg";
import moment from "moment";

const AdminMessages = ({ items }) => {
    const { user } = useStateContext();

    const formatTime = (createdAt) => {
        return moment(createdAt).fromNow();
    };

    const dynamicName =
        user?.id === parseInt(items?.admin_id) ? "You" : "CLI Support";
    return (
        <div className="w-full">
            <div className="flex justify-end w-full mt-10 gap-2 ">
                <div className="flex flex-col">
                    <p className="font-bold text-custom-bluegreen">
                        {dynamicName}
                    </p>
                    <p className="font-semibold text-custom-gray81">
                        {items.admin_name}
                    </p>
                </div>
                <div className="h-12 w-12">
                    <img className="rounded-full" src={AdminLogo} alt="Admin Logo" />
                </div>
            </div>
            <div className="w-full mt-2 mb-5 pr-12">
                <div className=" w-full h-auto gradient-background2 rounded-b-lg rounded-l-lg px-8 py-3">
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
                <div className="w-full flex justify-start">
                    <p className="flex text-custom-gray81 text-sm space-x-1">
                        <span>{formatTime(items.created_at)}</span>
                        {/* <span>Jul 17, 2024,</span>
                    <span>11:19 AM</span>
                    <span>(7 days ago)</span> */}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminMessages;

import React, { useEffect } from "react";
import AdminLogo from "../../../../../public/Images/AdminSilouette.svg";
import { useStateContext } from "../../../context/contextprovider";
import FolderFile from "../../../../../public/Images/folder_file.svg";
import moment from "moment";

const AdminMessages = ({ items }) => {
    const { user, getFile } = useStateContext();
    const attachmentData = JSON.parse(items.attachment || "[]");

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
                        Customer Relations Services
                    </p>
                </div>
            </div>
            <div className="w-full mt-[10px]">
                <div className=" w-full h-auto gradient-background2 rounded-b-[10px] rounded-r-[10px] p-[20px] pl-[31px] text-sm">
                    <div>
                        <p>{items.details_message}</p>
                    </div>
                    {Array.isArray(attachmentData) &&
                        attachmentData.length > 0 &&
                        attachmentData.map((attachment, index) => (
                            <div className="mt-4" key={index}>
                                <button
                                    // onClick={() =>
                                    //     window.open(attachment, "_blank")
                                    // }
                                    onClick={() =>
                                        handleViewAttachment(attachment)
                                    }
                                    className="flex items-center justify-start bg-customnavbar h-12 px-24 pl-4 text-black gap-2 rounded-lg"
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

export default AdminMessages;

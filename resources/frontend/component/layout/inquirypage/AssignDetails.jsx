import React from "react";

const AssignDetails = ({ logMessages }) => {
    const renderDetails = (actionType, details) => {
        switch (actionType) {
            case "client_inquiry":
                return (
                    <>
                    <div className="flex flex-col gap-1">
                        <div className="truncate">
                            <p className="truncate text-sm text-[#616161]">{details.message_tag}</p>
                        </div>
                        <div>
                            <p className="text-xs text-custom-gray space-x-1">
                                (<span>{details.buyer_name || "N/A"}</span>
                                <span>|</span>
                                <span> {details.buyer_email || "N/A"}</span>)
                            </p>
                        </div>
                        
                    </div>
                        
                    </>
                );
            case "admin_reply":
                return (
                    <>
                        <div className="flex flex-col truncate">
                            <p className="truncate text-sm text-[#616161]">
                                {details.message_tag} {details.admin_name}
                            </p>
                        </div>
                    </>
                );
            case "assign_to":
                return (
                    <>
                        <div className="flex flex-col truncate">
                            <p className="truncate text-sm text-[#616161]">
                                {details.message_tag} {details.assign_to_name} 
                            </p>
                            <p className="text-xs text-custom-gray space-x-1">
                                <span>by {details.assign_by}</span>
                                <span>|</span>
                                <span>{details.assign_by_department}</span>
                            </p>
                        </div>
                    </>
                );
            case "inquiry_status":
                return (
                    <>
                        <div className="flex flex-col truncate">
                            <p className="text-sm text-[#616161]">
                                {details.message_tag} {details.resolve_by}
                            </p>
                            <p className="text-xs text-custom-gray space-x-1">
                            (<span className="truncate">{details.remarks}</span>)
                        </p>
                        </div>
                    </>
                );
            default:
                return <p>Unknown log type</p>;
        }
    };

    return (
        <>
            {logMessages.length > 0 &&
                logMessages.map((item, index) => {
                    let logData = {};
                    if (item.received_inquiry) {
                        logData = JSON.parse(item.received_inquiry);
                    } else if (item.admin_reply) {
                        logData = JSON.parse(item.admin_reply);
                    } else if (item.requestor_reply) {
                        logData = JSON.parse(item.requestor_reply);
                    } else if (item.assign_to) {
                        logData = JSON.parse(item.assign_to);
                    } else if (item.inquiry_status) {
                        logData = JSON.parse(item.inquiry_status);
                    }

                    const logType = logData.log_type || "unknown";
                    const details = logData.details || {};

                    return (
                        <div
                            className="flex h-auto py-1 gap-5 items-start mt-1 mb-5 grow-0"
                            key={index}
                        >
                            <div className="flex w-[144px] shrink-0 flex-col text-[#A5A5A5]">
                                <p className="flex justify-end text-sm">
                                    {new Date(
                                        item.created_at
                                    ).toLocaleDateString()}
                                </p>
                                <p className="flex justify-end text-sm gap-1">
                                    {new Date(
                                        item.created_at
                                    ).toLocaleTimeString()}
                                    <span>○</span>
                                </p>
                            </div>
                            <div className="items-start flex-1 flex">
                                {renderDetails(logType, details)}
                            </div>
                        </div>
                    );
                })}
        </>
    );
};

export default AssignDetails;

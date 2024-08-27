import React from "react";

const AssignDetails = ({ logMessages }) => {
    const renderDetails = (actionType, details) => {
        switch (actionType) {
            case "client_inquiry":
                return (
                    <>
                        <div className="truncate w-44">
                            <p className="truncate">
                                Inquiry Feedback Received
                            </p>
                        </div>
                        <p className="text-xs text-custom-gray space-x-1">
                            (<span>{details.buyer_name || "N/A"}</span>
                            <span>|</span>
                            <span> {details.buyer_email || "N/A"}</span>)
                        </p>
                    </>
                );
            case "admin_reply":
                return (
                    <>
                       <div className="truncate w-44">
                            <p className="truncate">
                               Replied by {details.admin_name}
                            </p>
                        </div>
                      
                    </>
                );
            /*   case 'status_update':
                return (
                    <p><strong>Status:</strong> {details.status || 'N/A'}</p>
                ); */
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
                    }

                    const logType = logData.log_type || "unknown";
                    const details = logData.details || {};

                    return (
                        <div
                            className="flex h-12 w-full gap-5 items-center mt-1 mb-5"
                            key={index}
                        >
                            <div className="flex w-36 flex-col text-custom-gray71">
                                <p className="flex justify-end text-sm">
                                    {new Date(
                                        item.created_at
                                    ).toLocaleDateString()}
                                </p>
                                <p className="flex justify-end text-sm">
                                    {new Date(
                                        item.created_at
                                    ).toLocaleTimeString()}
                                </p>
                            </div>
                            <div className="flex-1">
                                {renderDetails(logType, details)}
                            </div>
                        </div>
                    );
                })}
        </>
    );
};

export default AssignDetails;

import React from "react";

const AssignDetails = ({ logMessages }) => {

    const renderDetails = (actionType, details) => {
        switch (actionType) {
            case 'client_inquiry':
                return (
                    <>
                        <p><strong>Buyer Name:</strong> {details.buyer_name || 'N/A'}</p>
                        <p><strong>Buyer Email:</strong> {details.buyer_email || 'N/A'}</p>
                        <p><strong>Contact No:</strong> {details.contact_no || 'N/A'}</p>
                    </>
                );
            case 'admin_reply':
                return (
                  <>
                    <p><strong>Replied By:</strong> {details.admin_name|| 'N/A'}</p>
                    <p><strong>Department:</strong> {details.department || 'N/A'}</p>
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

                    const logType = logData.log_type || 'unknown';
                    const details = logData.details || {};

                    return (
                        <div className="flex h-12 w-full gap-5 items-center mt-1 mb-5" key={index}>
                            <div className="flex w-36 flex-col text-custom-gray71">
                                <p className="flex justify-end text-sm">
                                    {new Date(item.created_at).toLocaleDateString()} {/* Adjust formatting as needed */}
                                </p>
                                <p className="flex justify-end text-sm">
                                    {new Date(item.created_at).toLocaleTimeString()} {/* Adjust formatting as needed */}
                                </p>
                            </div>
                            <div className="flex-1">
                                <div className="truncate w-44">
                                    <p className="truncate">
                                        {logType.replace('_', ' ').toUpperCase()}
                                    </p>
                                </div>
                                <div className="text-xs text-custom-gray space-x-1">
                                    {renderDetails(logType, details)}
                                </div>
                            </div>
                        </div>
                    );
                })}
        </>
    );
};

export default AssignDetails;

import React from "react";
import VersionLogUpdates from "../../versionlogupdatespage/VersionLogUpdates";
import ReleaseNotes from "../component/ReleaseNotes";

const TransactionLogs = () => {
    const items = [
        {
            id: 1,
            content: (
                <ReleaseNotes
                    date="September 30, 2025"
                    features={["Go Live"]}
                />
            ),
        },
    ];

    return <VersionLogUpdates items={items} />;
};

export default TransactionLogs;

import { useState, useEffect } from "react";

function NotesAndUpdatesModal({
    selectedAccountId,
    onClose,
    onAddNote,
    selectedWorkOrder,
    selectedAssignee,
}) {
    const [logs, setLogs] = useState([]);
    const [accountInfo, setAccountInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showAll, setShowAll] = useState(false);

    console.log("ASSIGNEE: ", selectedAssignee.id);

    useEffect(() => {
        if (selectedAccountId) {
            setLogs([]);
            setAccountInfo(null);
            setError(null);
            fetchAccountAndLogData();
        } else {
            setLogs([]);
            setAccountInfo(null);
            setError(null);
            setLoading(false);
        }
    }, [selectedAccountId]);

    const fetchAccountAndLogData = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `/api/get-account-logs/${selectedAccountId}?log_type=${encodeURIComponent(
                    selectedWorkOrder
                )}`
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(
                    `HTTP error! status: ${response.status} - ${
                        errorText || response.statusText
                    }`
                );
            }

            const data = await response.json();
            console.log("API response data:", data);
            const logsArray = data.log_data || [];

            setLogs(logsArray);
            setAccountInfo(null);
        } catch (err) {
            console.error("Error fetching account and log data:", err);
            setError(`Failed to load notes and updates: ${err.message}`);
            setLogs([]);
            setAccountInfo(null);
        } finally {
            setLoading(false);
        }
    };

    console.log("Fetched API response data:", logs);

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const options = {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        };
        return date.toLocaleDateString("en-US", options);
    };

    const formatHeaderDate = (dateStr) => {
        const date = new Date(dateStr);
        const day = date.getDate();
        const month = date.toLocaleDateString("en-US", { month: "short" });
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const formatDateWithTime = (dateStr) => {
        const date = new Date(dateStr);
        const dateOptions = {
            year: "numeric",
            month: "short",
            day: "numeric",
        };
        const timeOptions = {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        };
        const formattedDate = date.toLocaleDateString("en-US", dateOptions);
        const formattedTime = date.toLocaleTimeString("en-US", timeOptions);
        return `${formattedDate} | ${formattedTime}`;
    };

    const getDisplayLogs = () => {
        return logs.filter((log) => {
            const matchesLogType = log.log_type === selectedWorkOrder;
            const matchesAccount = log.account_ids?.includes(selectedAccountId);
            const matchesAssignee = selectedAssignee?.id
                ? log.assigned_user_id === selectedAssignee.id ||
                  log.created_by_user_id === selectedAssignee.id
                : true;

            return matchesLogType && matchesAccount && matchesAssignee;
        });
    };

    const getUserDisplayName = (log) => {
        return log.fullname || log.assigned_user_name || "Unknown User";
    };

    const getAssigneeName = (log) => {
        return log.assigned_user_name || "Unassigned";
    };

    const latestLogDate =
        logs.length > 0 ? logs[0].created_at : new Date().toISOString();

    if (loading && !error) {
        return (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
                <div className="bg-white rounded-lg p-8 w-auto min-w-[200px]">
                    <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        <span className="ml-2">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
            <div
                className="bg-white rounded-2xl w-1/2 max-w-2xl max-h-[80vh] overflow-hidden shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-white p-8 pb-4">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-medium text-teal-600">
                                Notes and Updates:{" "}
                                <span className="text-green-500 font-medium">
                                    {selectedWorkOrder || "Details"}
                                </span>
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors text-2xl font-light"
                        >
                            ×
                        </button>
                    </div>
                    
                    {/* Date badge */}
                    <div className="flex justify-end mb-4">
                        <div className="flex items-center space-x-2 text-sm text-teal-600 bg-gray-100 px-4 py-2 rounded-lg">
                            <span>{formatHeaderDate(latestLogDate)}</span>
                            <span>📅</span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="px-8 pb-4 max-h-80 overflow-y-auto">
                    {error && (
                        <div className="text-center text-red-500 py-8">
                            <p>{error}</p>
                            <p>Please try again later.</p>
                        </div>
                    )}
                    {!error && !loading && logs.length === 0 && (
                        <div className="text-center text-gray-500 py-8">
                            No notes or updates found for this account.
                        </div>
                    )}
                    {!error && logs.length > 0 && (
                        <div className="space-y-8">
                            {getDisplayLogs().map((log) => (
                                <div key={log.id} className="space-y-2">
                                    <div className="text-teal-600 font-medium text-lg">
                                        {formatDateWithTime(log.created_at)}
                                    </div>

                                    <div className="text-gray-500 text-base">
                                        {/* Display log message */}
                                        <span className="text-gray-800">
                                            {log.log_message ||
                                                "Work Order Update"}
                                        </span>

                                        {/* Display creator */}
                                        <span className="text-gray-500 ml-2">
                                            by{" "}
                                            <span className="text-blue-500 font-medium">
                                                {getUserDisplayName(log)}
                                            </span>
                                        </span>

                                        {/* Show assignment info if available */}
                                        {log.assigned_user_name && (
                                            <span className="text-gray-500 ml-2">
                                                • Assigned to:{" "}
                                                <span className="text-blue-500 font-medium">
                                                    {getAssigneeName(log)}
                                                </span>
                                            </span>
                                        )}
                                    </div>

                                    {/* Display note content if available */}
                                    {log.note_content && (
                                        <div className="text-gray-700 text-base mt-3 pl-4 border-l-2 border-gray-200">
                                            {log.note_content}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-6">
                    <div className="flex justify-center space-x-4">
                        {logs.length > 2 && (
                            <button
                                onClick={() => setShowAll(!showAll)}
                                className="text-green-600 hover:text-green-700 text-base font-medium transition-colors border border-green-600 hover:border-green-700 px-6 py-3 rounded-lg"
                            >
                                {showAll ? "Show Less" : "See More"}
                            </button>
                        )}
                        <button
                            onClick={() =>
                                onAddNote && onAddNote(selectedAccountId)
                            }
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors text-base font-medium"
                        >
                            <span>+</span>
                            <span>Add Note</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NotesAndUpdatesModal;
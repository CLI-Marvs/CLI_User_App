import { useState, useEffect} from "react";
import DateLogo from "../../../../../public/Images/Date_range.svg";
import AttachmentIcon from "../../../../../public/Images/ATTCHMT.svg"; 
import AddNoteModal from "./AddNoteModal";

function NotesAndUpdatesModal({
    selectedAccountId,
    onClose,
    selectedWorkOrder,
    selectedAssignee,
    workOrderData,
}) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showAll, setShowAll] = useState(false);
    const [initialLogCount] = useState(3);
    const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);

    useEffect(() => {
        if (selectedAccountId) {
            setLogs([]);
            setError(null);
            fetchAccountAndLogData();
        } else {
            setLogs([]);
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
            const logsArray = data.log_data || [];

            setLogs(
                logsArray.sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                )
            );
        } catch (err) {
            console.error("Error fetching account and log data:", err);
            setError(`Failed to load notes and updates: ${err.message}`);
            setLogs([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter((log) => {
        return (
            log.work_order_id === selectedWorkOrder &&
            log.log_type === selectedLogType &&
            log.account_id === selectedAccountId
        );
    });

    const handleAddNoteSuccess = async () => {
        setIsAddNoteModalOpen(false);
        await fetchAccountAndLogData();
    };

    const currentUserId = workOrderData?.currentUser?.id || 1;

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
        console.log("logs:", logs);
        console.log("selectedWorkOrder:", selectedWorkOrder);
        console.log("selectedAccountId:", selectedAccountId);
        console.log("selectedAssignee:", selectedAssignee);

        return logs.filter((log) => {
            const matchesLogType = log.log_type === selectedWorkOrder;
            const matchesAccount =
                (log.note_type === "Manual Entry" &&
                    log.account_id === selectedAccountId) ||
                (log.account_ids &&
                    log.account_ids.includes(selectedAccountId));
            const matchesAssignee = selectedAssignee?.id
                ? log.assigned_user_id === selectedAssignee.id ||
                  log.created_by_user_id === selectedAssignee.id
                : true;

            return matchesLogType && matchesAccount && matchesAssignee;
        });
    };

    const displayedLogs = getDisplayLogs();
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
                className="bg-white rounded-[10px] w-[449px] max-h-[90vh] overflow-y-auto shadow-xl p-[18px_25px] flex flex-col gap-[10px] relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-3 right-4 text-gray-500 hover:text-gray-600 transition-colors text-2xl font-bold z-10"
                >
                    ×
                </button>
                <div className="mb-1 mt-3">
                    {" "}
                    <div>
                        <h2 className="text-2xl font-semibold text-custom-bluegreen">
                            Notes and Updates:{" "}
                            <span className="text-custom-lightgreen font-normal">
                                {selectedWorkOrder || "Details"}
                            </span>
                        </h2>
                    </div>
                    <div className="flex justify-end mt-2">
                        {" "}
                        <div className="flex w-[170px] justify-center items-center space-x-1 text-sm font-semibold text-custom-bluegreen bg-[#F7F7F7] px-3 py-2 rounded-lg border gap-2">
                            <span>{formatHeaderDate(latestLogDate)}</span>
                            <img
                                src={DateLogo}
                                alt="Date"
                                className="w-6 h-6"
                            />
                        </div>
                    </div>
                </div>
                <div className="flex-1 space-y-0 overflow-y-auto max-h-screen">
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
                        <div className="space-y-0">
                            {displayedLogs.map((log) => (
                                <div key={log.id} className="py-2 border-y-1">
                                    <div className="text-custom-bluegreen font-semibold text-sm ">
                                        {formatDateWithTime(log.created_at)}
                                    </div>

                                    <div className="text-[#818181] text-sm">
                                        <div className="whitespace-pre-wrap break-words">
                                            {log.log_message ||
                                                "Work Order Updated"}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            <span>
                                                by{" "}
                                                <span className="text-blue-500 font-medium break-words">
                                                    {getUserDisplayName(log)}
                                                </span>
                                            </span>

                                            {log.assigned_user_name &&
                                                log.note_type !==
                                                    "Manual Entry" && (
                                                    <span className="ml-2">
                                                        • Assigned to:{" "}
                                                        <span className="text-blue-500 font-medium">
                                                            {getAssigneeName(
                                                                log
                                                            )}
                                                        </span>
                                                    </span>
                                                )}
                                        </div>
                                    </div>

                                    {log.note_content && (
                                        <div className="text-gray-700 text-base mt-3 pl-4 border-l-2 border-gray-200">
                                            {log.note_content}
                                        </div>
                                    )}

                                    {log.documents && log.documents.length > 0 && (
                                        <div className="mt-2 pl-1">
                                            <p className="text-xs font-semibold text-gray-600 mb-1">Attachments:</p>
                                            <ul className="space-y-1">
                                                {log.documents.map((doc) => (
                                                    <li key={doc.document_id} className="text-xs">
                                                        <a
                                                            href={doc.file_path}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-custom-bluegreen hover:text-custom-lightgreen hover:underline flex items-center"
                                                        >
                                                            <img src={AttachmentIcon} alt="Attachment" className="w-3 h-3 mr-1.5 opacity-70" />
                                                            {doc.file_title || doc.file_name}
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div>
                    <div className="flex justify-center space-x-4">
                        {logs.length > 2 && (
                            <button
                                onClick={() => setShowAll(!showAll)}
                                className="text-gray-600 hover:text-gray-700 text-base font-normal transition-colors border border-gray-300 hover:border-gray-400 px-6 py-3 rounded-lg bg-white"
                            >
                                {showAll ? "Show Less" : "See More"}
                            </button>
                        )}
                        <button
                            onClick={() => setIsAddNoteModalOpen(true)}
                            className="bg-gradient-to-r from-[#175D5F] to-[#70AD47] text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors text-base font-normal hover:from-[#1A6A6C] hover:to-[#7CBF4F]"
                        >
                            <span>+</span>
                            <span>Add Note</span>
                        </button>
                    </div>
                </div>
            </div>
            {isAddNoteModalOpen && (
                <AddNoteModal
                    isOpen={isAddNoteModalOpen}
                    onClose={() => setIsAddNoteModalOpen(false)}
                    onSaveSuccess={handleAddNoteSuccess}
                    selectedAccountId={selectedAccountId}
                    selectedAssignee={selectedAssignee}
                    numericWorkOrderId={workOrderData?.work_order_id}
                    logType={selectedWorkOrder}
                    currentUserId={currentUserId}
                />
            )}
        </div>
    );
}

export default NotesAndUpdatesModal;

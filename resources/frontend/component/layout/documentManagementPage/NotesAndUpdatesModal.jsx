import { useState, useEffect } from "react";
import DateLogo from "../../../../../public/Images/Date_range.svg";
import FileIcon from "../../../../../public/Images/folder_file_notes.svg";
import ViewIcon from "../../../../../public/Images/eye_icon.svg";
import DownloadIcon from "../../../../../public/Images/download_icon.svg";
import AddNoteModal from "./AddNoteModal";
import axios from "axios";

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
    const [initialLogCount] = useState(2);
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
                `/api/get-account-logs/${selectedAccountId}?log_type=${selectedWorkOrder}&work_order_id=${
                    workOrderData.work_order_id
                }&assigned_user_id=${selectedAssignee?.id || selectedAssignee}`
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
        return logs.filter((log) => {
            if (
                log.is_new &&
                log.log_type === selectedWorkOrder &&
                ((log.note_type === "Manual Entry" &&
                    log.account_id === selectedAccountId) ||
                    (log.account_ids &&
                        log.account_ids.includes(selectedAccountId))) &&
                log.assigned_user_id === selectedAssignee.id
            ) {
                axios
                    .patch(`/api/update-is-new/${log.id}`, { is_new: false })
                    .then((response) => {
                        console.log(response.data);
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            }
            const matchesLogType = log.log_type === selectedWorkOrder;
            const matchesAccount =
                (log.note_type === "Manual Entry" &&
                    log.account_id === selectedAccountId) ||
                (log.account_ids &&
                    log.account_ids.includes(selectedAccountId));
            const matchesAssignee =
                log.assigned_user_id === selectedAssignee.id;

            return matchesLogType && matchesAccount && matchesAssignee;
        });
    };

    const handleDownload = async () => {
        try {
            const response = await fetch(doc.file_path);
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = doc.file_name;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error("Download failed:", error);
        }
    };

    const displayedLogs = getDisplayLogs();
    const logsToRender = showAll
        ? displayedLogs
        : displayedLogs.slice(0, initialLogCount);

    const getUserDisplayName = (log) => {
        return log.fullname || log.assigned_user_name || "Unknown User";
    };

    const getAssigneeName = (log) => {
        return log.assigned_user_name || "Unassigned";
    };

    const latestLogDate =
        displayedLogs.length > 0
            ? displayedLogs[0].created_at
            : new Date().toISOString();

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
                            {logsToRender.map((log) => (
                                <div key={log.id} className="py-2 border-y-1">
                                    <div className="text-custom-bluegreen font-semibold text-sm ">
                                        {formatDateWithTime(log.created_at)}
                                        {log.is_new && (
                                            <span className="bg-custom-bluegreen text-white py-1 px-2 rounded-full text-xs ml-2">
                                                New
                                            </span>
                                        )}
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

                                    {log.documents &&
                                        log.documents.length > 0 && (
                                            <div className="mt-0 pl-1">
                                                <div className="space-y-3">
                                                    {log.documents.map(
                                                        (doc) => (
                                                            <div
                                                                key={
                                                                    doc.document_id
                                                                }
                                                                className="flex items-center space-x-3"
                                                            >
                                                                <div className="w-24 flex-shrink-0">
                                                                    <span
                                                                        className="text-sm font-normal text-custom-solidgreen truncate block"
                                                                        title={
                                                                            doc.file_title ||
                                                                            "Document"
                                                                        }
                                                                    >
                                                                        {doc.file_title ||
                                                                            "Document"}
                                                                    </span>
                                                                </div>
                                                                <div className="bg-[#D6E4D1] rounded-lg py-0 px-[10px] border w-66">
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                                                                            <div className=" p-2 rounded flex-shrink-0">
                                                                                <img
                                                                                    src={
                                                                                        FileIcon
                                                                                    }
                                                                                    alt="File"
                                                                                    className="w-[22px] h-[22px]"
                                                                                />
                                                                            </div>
                                                                            <span
                                                                                className="text-xs font-light truncate"
                                                                                title={
                                                                                    doc.file_name
                                                                                }
                                                                            >
                                                                                {
                                                                                    doc.file_name
                                                                                }
                                                                            </span>
                                                                        </div>

                                                                        {/* Action Icons */}
                                                                        <div className="flex items-center space-x-0 flex-shrink-0">
                                                                            {/* View Icon */}
                                                                            <button
                                                                                onClick={() =>
                                                                                    window.open(
                                                                                        doc.file_path,
                                                                                        "_blank"
                                                                                    )
                                                                                }
                                                                                className="p-1.5 text-green-600 hover:text-green-700 rounded transition-colors"
                                                                                title="View document"
                                                                            >
                                                                                <img
                                                                                    src={
                                                                                        ViewIcon
                                                                                    }
                                                                                    alt="View"
                                                                                    className="w-6 h-6"
                                                                                />
                                                                            </button>

                                                                            <a
                                                                                href={
                                                                                    doc.file_path
                                                                                }
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="p-1.5 text-green-600 hover:text-green-700 rounded transition-colors"
                                                                                title="Download document"
                                                                            >
                                                                                <img
                                                                                    src={
                                                                                        DownloadIcon
                                                                                    }
                                                                                    alt="Download"
                                                                                    className="w-5 h-5"
                                                                                />
                                                                            </a>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div>
                    <div className="flex justify-center space-x-4">
                        {displayedLogs.length > initialLogCount && (
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

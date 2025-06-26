import { useState, useEffect, useMemo, useCallback } from "react";
import ReactDOM from "react-dom";
import DateLogo from "../../../../../public/Images/Date_range.svg";
import FileIcon from "../../../../../public/Images/folder_file_notes.svg";
import ViewIcon from "../../../../../public/Images/eye_icon.svg";
import DownloadIcon from "../../../../../public/Images/download_icon.svg";
import apiService from "../../../../frontend/component/servicesApi/apiService";
import {
    getNotesAndUpdatesData, 
    getCachedNotesAndUpdatesData,
} from "../../../component/layout/documentManagementPage/service/notesAndUpdatesDataService";
import AddNoteModal from "./AddNoteModal";
import FileViewerModal from "./FileViewerModal"; 

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
    const initialLogCount = 2;
    const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
    const [mounted, setMounted] = useState(false); 
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [viewingFile, setViewingFile] = useState(null);


    const fetchData = useCallback(async (isMounted) => {
        setLogs([]);
        setError(null);
        
        if (!selectedAccountId) return;

        setLoading(true);
        setError(null);

        const params = {
            selectedAccountId,
            selectedWorkOrder,
            workOrderId: workOrderData.work_order_id,
        };

        const cachedData = getCachedNotesAndUpdatesData(params);
        if (cachedData) {
            setLogs(
                cachedData.log_data.sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                ) || []
            );
            setLoading(false);
        } else {
            setLoading(true);
        }

        try {
            const freshData = await getNotesAndUpdatesData(params);
            if (isMounted) {
                const logsArray = freshData.log_data || [];
                setLogs(logsArray.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
            }
        } catch (err) {
            if (isMounted) {
                setError(`Failed to load notes and updates: ${err.message}`);
            }
        } finally {
            if (isMounted) { 
                setLoading(false);
            }
        }
    }, [selectedAccountId, selectedWorkOrder, workOrderData.work_order_id]);

    useEffect(() => {
        setMounted(true); 
        let isMounted = true;

        fetchData(isMounted); 

        return () => {
            isMounted = false; 
            setMounted(false); 
        };
    }, [fetchData]);

    const handleAddNoteSuccess = async () => {
        setIsAddNoteModalOpen(false);
        invalidateNotesAndUpdatesData({
            selectedAccountId,
            selectedWorkOrder,
            workOrderId: workOrderData.work_order_id,
        });
        await fetchData(true); 
    };

    const handleOpenViewer = (file) => {
        setViewingFile(file);
        setIsViewerOpen(true);
    };

    const handleCloseViewer = () => {
        setIsViewerOpen(false);
        setViewingFile(null);
    };

    const currentUserId = workOrderData?.currentUser?.id || 1;

    const formatHeaderDate = useCallback((dateStr) => {
        const date = new Date(dateStr);
        const day = date.getDate();
        const month = date.toLocaleDateString("en-US", { month: "short" });
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }, []);

    const formatDateWithTime = useCallback((dateStr) => {
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
    }, []);

    const displayedLogs = useMemo(() => {
        return logs.filter((log) => {
            const matchesLogType = log.log_type === selectedWorkOrder;
            const matchesAccount =
                (log.note_type === "Manual Entry" &&
                    log.account_id === selectedAccountId) ||
                (log.account_ids &&
                    log.account_ids.includes(selectedAccountId));
            return matchesLogType && matchesAccount;
        });
    }, [logs, selectedWorkOrder, selectedAccountId]);

    useEffect(() => {
        const logsToUpdate = displayedLogs.filter(
            (log) =>
                log.is_new &&
                log.log_type === selectedWorkOrder &&
                ((log.note_type === "Manual Entry" &&
                    log.account_id === selectedAccountId) ||
                    (log.account_ids &&
                        log.account_ids.includes(selectedAccountId))) &&
                log.assigned_user_id === selectedAssignee?.id
        );

        logsToUpdate.forEach((log) => {
            apiService
                .patch(`/update-is-new/${log.id}`, { is_new: false })
                .then((response) => {
                })
                .catch((error) => {
                    console.error(
                        `Error marking log ${log.id} as read:`,
                        error
                    );
                });
        });
    }, [displayedLogs, selectedWorkOrder, selectedAccountId, selectedAssignee]);

    // const handleDownload = async () => {
    //     try {
    //         const response = await fetch(doc.file_path);
    //         const blob = await response.blob();
    //         const downloadUrl = window.URL.createObjectURL(blob);
    //         const link = document.createElement("a");
    //         link.href = downloadUrl;
    //         link.download = doc.file_name;
    //         document.body.appendChild(link);
    //         link.click();
    //         link.remove();
    //         window.URL.revokeObjectURL(downloadUrl);
    //     } catch (error) {
    //         console.error("Download failed:", error);
    //     }
    // };

    const logsToRender = useMemo(
        () =>
            showAll ? displayedLogs : displayedLogs.slice(0, initialLogCount),
        [showAll, displayedLogs, initialLogCount]
    );

    const getUserDisplayName = (log) => {
        return log.fullname || log.assigned_user_name || "Unknown User";
    };

    const getAssigneeName = (log) => {
        return log.assigned_user_name || "Unassigned";
    };

    const getAssignmentPrefix = (logMessage) => {
        if (!logMessage) return "• Assigned to:";
        const lowerLogMessage = logMessage.toLowerCase();
        if (
            lowerLogMessage.includes("reassign") ||
            (lowerLogMessage.includes("update") &&
                !lowerLogMessage.includes("create"))
        ) {
            return "• Reassigned to:";
        }
        return "• Assigned to:";
    };

    const latestLogDate =
        displayedLogs.length > 0
            ? displayedLogs[0].created_at
            : new Date().toISOString();

    if (!mounted) {
        return null;
    }

    if (loading && !error) {
        return ReactDOM.createPortal(
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-[70]"> {/* Ensure z-index is high */}
                <div className="bg-white rounded-lg p-8 w-auto min-w-[200px]">
                    <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        <span className="ml-2">Loading...</span>
                    </div>
                </div>
            </div>,
            document.body
        );
    }

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60]"> {/* Main modal z-index */}
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
                                            <span className="bg-custom-lightgreen text-white py-1 px-3 rounded-[50px] text-xs ml-2">
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
                                                        {getAssignmentPrefix(
                                                            log.log_message
                                                        )}{" "}
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
                                                                className="flex items-center space-x-0"
                                                            >
                                                                <div className="w-[250px] flex-shrink-0">
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
                                                                <div className="bg-[#D6E4D1] rounded-lg py-0 px-[10px] border w-36">
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center space-x-0 min-w-0 flex-1">
                                                                            <div className=" p-2 rounded flex-shrink-0">
                                                                                <img
                                                                                    src={
                                                                                        FileIcon
                                                                                    }
                                                                                    alt="File"
                                                                                    className="w-[22px] h-[22px]"
                                                                                />
                                                                            </div>
                                                                            {/* <span
                                                                                className="text-xs font-light truncate"
                                                                                title={
                                                                                    doc.file_name
                                                                                }
                                                                            >
                                                                                {
                                                                                    doc.file_name
                                                                                }
                                                                            </span> */}
                                                                        </div>

                                                                        <div className="flex items-center space-x-0 flex-shrink-0">
                                                                            <button
                                                                                onClick={() => handleOpenViewer(doc)}
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
                                                                                download={
                                                                                    doc.file_name
                                                                                }
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
            {isViewerOpen && viewingFile && (
                <FileViewerModal
                    isOpen={isViewerOpen}
                    onClose={handleCloseViewer}
                    file={viewingFile}
                />
            )}
        </div>,
        document.body
    );
}

export default NotesAndUpdatesModal;

import { useState, useEffect } from "react";
import DateLogo from "../../../../../public/Images/Date_range.svg";
import FileIcon from "../../../../../public/Images/folder_file_notes.svg";
import ViewIcon from "../../../../../public/Images/eye_icon.svg";
import DownloadIcon from "../../../../../public/Images/download_icon.svg";
import axios from "axios";
import UploadFilesOnlyModal from "./UploadFilesOnlyModal";
import apiService from "../../../component/servicesApi/apiService";

function AddFilesModal({
    selectedAccountId,
    onClose,
    selectedWorkOrder,
    workOrderData,
    // selectedAssignee,
}) {
    const [logsWithFiles, setLogsWithFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showAll, setShowAll] = useState(false);
    const [initialLogCount] = useState(3);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    useEffect(() => {
        if (selectedAccountId && workOrderData?.work_order_id) {
            setLogsWithFiles([]);
            setError(null);
            fetchLogDataWithFiles();
        } else {
            setLogsWithFiles([]);
            setError(null);
            setLoading(false);
        }
    }, [selectedAccountId, workOrderData?.work_order_id, selectedWorkOrder]);

    const fetchLogDataWithFiles = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiService.get(
                `/get-account-logs/${selectedAccountId}?log_type=${selectedWorkOrder}&work_order_id=${workOrderData.work_order_id}`
            );

            const data = response.data;
            console.log("ADD FILES MODAL LOG DATA:", data);
            const logsArray = data.log_data || [];

            const filteredLogs = logsArray
                .filter(
                    (log) =>
                        log.documents &&
                        log.documents.length > 0 &&
                        log.log_type === selectedWorkOrder &&
                        (log.account_id === selectedAccountId ||
                            (log.account_ids &&
                                log.account_ids.includes(selectedAccountId)))
                )
                .sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                );

            const updatePromises = filteredLogs
                .filter((log) => log.is_new)
                .map((log) =>
                    apiService
                        .patch(`/update-is-new/${log.id}`, { is_new: false })
                        .then((res) =>
                            console.log("Updated is_new for log:", res.data)
                        )
                        .catch((err) =>
                            console.error("Error updating is_new:", err)
                        )
                );

            Promise.all(updatePromises);

            setLogsWithFiles(filteredLogs);
        } catch (err) {
            console.error("Error fetching log data with files:", err);

            let errorMessage = `Failed to load files: ${err.message}`;
            if (
                err.response &&
                err.response.data &&
                err.response.data.message
            ) {
                errorMessage = `Failed to load files: ${err.response.data.message}`;
            } else if (err.response) {
                errorMessage = `Failed to load files: HTTP error! status: ${err.response.status}`;
            }

            setError(errorMessage);
            setLogsWithFiles([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadSuccess = async () => {
        setIsUploadModalOpen(false);
        await fetchLogDataWithFiles();
    };

    const formatHeaderDate = (dateStr) => {
        if (!dateStr) return "N/A";
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

    const getUserDisplayName = (log) => {
        return log.fullname || log.assigned_user_name || "Unknown User";
    };

    const latestLogDate =
        logsWithFiles.length > 0
            ? logsWithFiles[0].created_at
            : new Date().toISOString();

    const logsToRender = showAll
        ? logsWithFiles
        : logsWithFiles.slice(0, initialLogCount);

    if (loading && !error) {
        return (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
                <div className="bg-white rounded-lg p-8 w-auto min-w-[200px]">
                    <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        <span className="ml-2">Loading Files...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
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
                    <div>
                        <h2 className="text-2xl font-semibold text-custom-bluegreen">
                            Files:{" "}
                            <span className="text-custom-lightgreen font-normal">
                                {selectedWorkOrder || "Details"}
                            </span>
                        </h2>
                    </div>
                    <div className="flex justify-end mt-2">
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
                    {!error && !loading && logsWithFiles.length === 0 && (
                        <div className="text-center text-gray-500 py-8">
                            No files found for this entry.
                        </div>
                    )}
                    {!error && logsWithFiles.length > 0 && (
                        <div className="space-y-4">
                            {logsToRender.map((log) => (
                                <div
                                    key={log.id}
                                    className="py-2 border-b border-gray-200 last:border-b-0"
                                >
                                    <div className="text-custom-bluegreen font-semibold text-sm ">
                                        {formatDateWithTime(log.created_at)}
                                        {log.is_new && (
                                            <span className="bg-custom-lightgreen text-white py-1 px-3 rounded-[50px] text-xs ml-2">
                                                New
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-500 mb-2">
                                        <span>
                                            by{" "}
                                            <span className="text-blue-500 font-medium break-words">
                                                {getUserDisplayName(log)}
                                            </span>
                                        </span>
                                    </div>

                                    {log.documents &&
                                        log.documents.length > 0 && (
                                            <div className="mt-1 pl-1">
                                                <div className="space-y-3">
                                                    {log.documents.map(
                                                        (doc) => (
                                                            <div
                                                                key={
                                                                    doc.document_id ||
                                                                    doc.id
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
                                                                        <div className="flex items-center space-x-0 flex-shrink-0">
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
                    <div className="flex justify-center space-x-4 mt-3 pt-3 border-t">
                        {logsWithFiles.length > initialLogCount && !error && (
                            <button
                                onClick={() => setShowAll(!showAll)}
                                className="text-gray-600 hover:text-gray-700 text-base font-normal transition-colors border border-gray-300 hover:border-gray-400 px-6 py-3 rounded-lg bg-white"
                            >
                                {showAll ? "Show Less" : "See More"}
                            </button>
                        )}
                        <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="bg-gradient-to-r from-[#175D5F] to-[#70AD47] text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors text-base font-normal hover:from-[#1A6A6C] hover:to-[#7CBF4F]"
                        >
                            <span>+</span>
                            <span>Upload File</span>
                        </button>
                    </div>
                </div>
            </div>
            {isUploadModalOpen && (
                <UploadFilesOnlyModal
                    isOpen={isUploadModalOpen}
                    onClose={() => setIsUploadModalOpen(false)}
                    onUploadSuccess={handleUploadSuccess}
                    selectedAccountId={selectedAccountId}
                    numericWorkOrderId={workOrderData?.work_order_id}
                    logType={selectedWorkOrder}
                    currentUserId={workOrderData?.currentUser?.id}
                />
            )}
        </div>
    );
}

export default AddFilesModal;

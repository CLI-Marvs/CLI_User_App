import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useStateContext } from "../../../../../resources/frontend/context/contextprovider";
import apiService from "../../../component/servicesApi/apiService";

const UploadFilesOnlyModal = ({
    isOpen,
    onClose,
    onUploadSuccess,
    selectedAccountId,
    numericWorkOrderId,
    logType,
}) => {
    const [attachedFiles, setAttachedFiles] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [submilestoneOptions, setSubmilestoneOptions] = useState([]);
    const [loadingSubmilestones, setLoadingSubmilestones] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const { user } = useStateContext();

    useEffect(() => {
        if (isOpen) {
            setAttachedFiles([]);
            setError(null);
            setIsSaving(false);
            setSubmilestoneOptions([]);

            if (logType) {
                const fetchSubmilestones = async () => {
                    setLoadingSubmilestones(true);
                    try {
                        const response = await apiService.get(
                            `/submilestones-details?work_order_type_name=${encodeURIComponent(
                                logType
                            )}`
                        );
                        console.log(response.data);
                        if (Array.isArray(response.data)) {
                            setSubmilestoneOptions(response.data);
                        } else {
                            console.warn(
                                "API for submilestones did not return an array. Received:",
                                response.data
                            );
                            setSubmilestoneOptions([]);
                        }
                    } catch (err) {
                        console.error(
                            "Failed to fetch submilestone options:",
                            err
                        );
                        setSubmilestoneOptions([]);
                    } finally {
                        setLoadingSubmilestones(false);
                    }
                };
                fetchSubmilestones();
            }
        }
    }, [isOpen, logType]);

    if (!isOpen) return null;

    const handleFileChange = (event) => {
        const files = event.target.files || event.dataTransfer?.files;
        if (files) {
            processFiles(Array.from(files));
        }
        if (event.target.value !== undefined) {
            event.target.value = null;
        }
    };

    const processFiles = (files) => {
        const newFiles = files.map((file) => ({
            id: `${file.name}-${file.lastModified}-${file.size}-${Math.random()
                .toString(36)
                .substr(2, 9)}`,
            file: file,
            title: "",
        }));
        const uniqueNewFiles = newFiles.filter(
            (nf) => !attachedFiles.some((af) => af.id === nf.id)
        );
        setAttachedFiles((prevFiles) => [...prevFiles, ...uniqueNewFiles]);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleTitleChange = (id, newTitle) => {
        setAttachedFiles((prevFiles) =>
            prevFiles.map((f) => (f.id === id ? { ...f, title: newTitle } : f))
        );
    };

    const handleRemoveFile = (idToRemove) => {
        setAttachedFiles((prevFiles) =>
            prevFiles.filter((f) => f.id !== idToRemove)
        );
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const handleSave = async () => {
        if (attachedFiles.length === 0) {
            setError("Please attach at least one file.");
            return;
        }
        // Ensure all files have a title/document type
        const filesWithoutTitles = attachedFiles.filter((fw) => !fw.title);
        if (filesWithoutTitles.length > 0) {
            setError(
                submilestoneOptions.length > 0
                    ? "Please select a document type for all attached files."
                    : "Please provide a title for all attached files."
            );
            return;
        }
        setError(null);
        setIsSaving(true);

        const formData = new FormData();
        formData.append("note_text", "");
        formData.append(
            "log_message",
            `Files uploaded for Work Order #${numericWorkOrderId}.`
        );
        formData.append("account_id", selectedAccountId);
        formData.append("work_order_id", numericWorkOrderId);
        formData.append("log_type", logType);
        formData.append("note_type", "File Upload");

        if (user && user.id) {
            formData.append("created_by_user_id", user.id);
        } else {
            console.error(
                "User ID not found in context. Cannot set created_by_user_id for file upload."
            );
            setError(
                "Could not identify the user. Please ensure you are logged in and try again."
            );
            setIsSaving(false);
            return;
        }

        attachedFiles.forEach((fileWrapper) => {
            formData.append("files[]", fileWrapper.file);
            formData.append("file_titles[]", fileWrapper.title);
        });

        try {
            const config = {
                method: "post",
                url: "/work-orders/notes/add",
                data: formData,
                headers: {
                    ...apiService.defaults.headers.common,
                    "Content-Type": "multipart/form-data",
                },
            };

            const csrfToken = document.querySelector('meta[name="csrf-token"]');
            const userToken = localStorage.getItem("authToken");

            if (csrfToken) {
                const token = csrfToken.getAttribute("content");
                if (token) {
                    config.headers["X-CSRF-TOKEN"] = token;
                }
            }

            if (userToken) {
                config.headers["Authorization"] = `Bearer ${userToken}`;
            }

            const response = await apiService.request(config);
            const fileTitles = attachedFiles.map((fw) => fw.title);
            for (const fileWrapper of attachedFiles) {
                const checklist_id = fileWrapper.checklist_id;
                await apiService.post("/account-checklist-status/bulk", {
                    account_id: selectedAccountId,
                    file_titles: fileTitles,
                    is_completed: true,
                    completed_at: new Date().toISOString(),
                });
            }

            onUploadSuccess();
            onClose();
        } catch (err) {
            console.error("Failed to upload files:", err);

            let errorMessage = "Failed to upload files. Please try again.";
            if (
                err.response &&
                err.response.data &&
                err.response.data.message
            ) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    return ReactDOM.createPortal(
        <div
            className="fixed inset-0 z-[60] bg-black bg-opacity-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            Upload Documents
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {logType
                                ? `${logType} - Work Order No. ${numericWorkOrderId}`
                                : `Work Order No. ${numericWorkOrderId}`}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                        aria-label="Close modal"
                        disabled={isSaving}
                    >
                        <svg
                            className="w-5 h-5 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* File Upload Area */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Select Files to Upload
                        </label>

                        {/* Drag and Drop Zone */}
                        <div
                            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
                                dragActive
                                    ? "border-blue-400 bg-blue-50"
                                    : "border-gray-300 hover:border-gray-400"
                            }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                id="fileAttachment"
                                multiple
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                disabled={isSaving}
                            />

                            <div className="flex flex-col items-center">
                                <svg
                                    className="w-12 h-12 text-gray-400 mb-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                    />
                                </svg>
                                <p className="text-lg font-medium text-gray-700 mb-2">
                                    Drop files here or click to browse
                                </p>
                                <p className="text-sm text-gray-500">
                                    Select multiple files to upload at once
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* File List */}
                    {attachedFiles.length > 0 && (
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-medium text-gray-700">
                                    Selected Files ({attachedFiles.length})
                                </h3>
                                <button
                                    onClick={() => setAttachedFiles([])}
                                    className="text-sm text-red-600 hover:text-red-800 font-medium"
                                    disabled={isSaving}
                                >
                                    Clear All
                                </button>
                            </div>

                            <div className="space-y-3 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                                {attachedFiles.map((fileWrapper) => (
                                    <div
                                        key={fileWrapper.id}
                                        className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1 min-w-0">
                                                <p
                                                    className="text-sm font-medium text-gray-900 truncate"
                                                    title={
                                                        fileWrapper.file.name
                                                    }
                                                >
                                                    {fileWrapper.file.name}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {formatFileSize(
                                                        fileWrapper.file.size
                                                    )}{" "}
                                                    •{" "}
                                                    {fileWrapper.file.type ||
                                                        "Unknown type"}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() =>
                                                    handleRemoveFile(
                                                        fileWrapper.id
                                                    )
                                                }
                                                className="ml-3 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors duration-200"
                                                disabled={isSaving}
                                                aria-label={`Remove ${fileWrapper.file.name}`}
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                    />
                                                </svg>
                                            </button>
                                        </div>

                                        {/* Document Type Selection */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Document Type{" "}
                                                {submilestoneOptions.length >
                                                    0 && (
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                )}
                                            </label>
                                            {loadingSubmilestones ? (
                                                <div className="flex items-center text-sm text-gray-500 p-2 bg-gray-100 rounded">
                                                    <svg
                                                        className="animate-spin -ml-1 mr-2 h-4 w-4"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <circle
                                                            className="opacity-25"
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            stroke="currentColor"
                                                            strokeWidth="4"
                                                        ></circle>
                                                        <path
                                                            className="opacity-75"
                                                            fill="currentColor"
                                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                        ></path>
                                                    </svg>
                                                    Loading document types...
                                                </div>
                                            ) : submilestoneOptions.length >
                                              0 ? (
                                                <select
                                                    value={fileWrapper.title}
                                                    onChange={(e) =>
                                                        handleTitleChange(
                                                            fileWrapper.id,
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                                    disabled={isSaving}
                                                >
                                                    <option value="" disabled>
                                                        Select document type...
                                                    </option>
                                                    {submilestoneOptions.map(
                                                        (submilestone) =>
                                                            submilestone.checklists &&
                                                            submilestone
                                                                .checklists
                                                                .length > 0 ? (
                                                                <optgroup
                                                                    key={`sub-${submilestone.id}`}
                                                                    label={
                                                                        submilestone.name
                                                                    }
                                                                >
                                                                    {submilestone.checklists.map(
                                                                        (
                                                                            checklist
                                                                        ) => (
                                                                            <option
                                                                                key={`chk-${checklist.id}`}
                                                                                value={
                                                                                    checklist.name
                                                                                }
                                                                            >
                                                                                {
                                                                                    checklist.name
                                                                                }
                                                                            </option>
                                                                        )
                                                                    )}
                                                                </optgroup>
                                                            ) : (
                                                                <option
                                                                    key={`sub-${submilestone.id}`}
                                                                    value={
                                                                        submilestone.name
                                                                    }
                                                                >
                                                                    {
                                                                        submilestone.name
                                                                    }
                                                                </option>
                                                            )
                                                    )}
                                                </select>
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={
                                                        fileWrapper.title || ""
                                                    }
                                                    placeholder="Enter document title..."
                                                    onChange={(e) =>
                                                        handleTitleChange(
                                                            fileWrapper.id,
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    disabled={isSaving}
                                                />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start">
                                <svg
                                    className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                                    />
                                </svg>
                                <div>
                                    <h3 className="text-sm font-medium text-red-800">
                                        Upload Error
                                    </h3>
                                    <p className="text-sm text-red-700 mt-1">
                                        {error}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                    <div className="text-sm text-gray-600">
                        {attachedFiles.length > 0 && (
                            <span>
                                {attachedFiles.length} file
                                {attachedFiles.length !== 1 ? "s" : ""} selected
                            </span>
                        )}
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={onClose}
                            disabled={isSaving}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving || attachedFiles.length === 0}
                            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
                        >
                            {isSaving ? (
                                <>
                                    <svg
                                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <svg
                                        className="w-4 h-4 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                        />
                                    </svg>
                                    Upload Files
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default UploadFilesOnlyModal;

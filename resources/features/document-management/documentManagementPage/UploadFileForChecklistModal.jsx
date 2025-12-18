import { toast } from "react-toastify";
import React, { useState, useRef } from "react";

export function UploadFileForChecklistModal({
    checklist,
    step,
    sub,
    onUpload,
    onClose,
}) {
    const [attachedFiles, setAttachedFiles] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef();

    // Drag and drop handlers
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
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(Array.from(e.dataTransfer.files));
        }
    };

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
        const checklistName = checklist && checklist.name ? checklist.name : "";
        const newFiles = files.map((file) => ({
            id: `${file.name}-${file.lastModified}-${file.size}-${Math.random()
                .toString(36)
                .substr(2, 9)}`,
            file: file,
            title: checklistName,
        }));
        const uniqueNewFiles = newFiles.filter(
            (nf) => !attachedFiles.some((af) => af.id === nf.id)
        );
        setAttachedFiles((prevFiles) => [...prevFiles, ...uniqueNewFiles]);
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
            toast.error("Please attach at least one file.");
            return;
        }
        // Ensure all files have a title
        const filesWithoutTitles = attachedFiles.filter((fw) => !fw.title);
        if (filesWithoutTitles.length > 0) {
            setError("Please provide a title for all attached files.");
            toast.error("Please provide a title for all attached files.");
            return;
        }
        setError(null);
        setIsSaving(true);

        // Only support single file upload for now (to match backend)
        const file = attachedFiles[0].file;
        try {
            if (file && onUpload) {
                await onUpload(file, checklist, step, sub);
                toast.success("File uploaded successfully!");
            }
        } catch (err) {
            toast.error("Upload failed.");
        }
        setIsSaving(false);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-[10000] bg-black bg-opacity-50 flex items-center justify-center p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
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
                            Checklist: {checklist?.name}
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
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Drag and Drop Zone */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Select Files to Upload
                        </label>
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
                                ref={fileInputRef}
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
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Document Title
                                            </label>
                                            <input
                                                type="text"
                                                value={fileWrapper.title || ""}
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
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
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
                            className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#175D5F] to-[#70AD47] border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
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
                                        />
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
        </div>
    );
}

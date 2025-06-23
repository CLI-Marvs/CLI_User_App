import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useStateContext } from "../../../../../resources/frontend/context/contextprovider";
import apiService from "../../../component/servicesApi/apiService";

const AddNoteModal = ({
    isOpen,
    onClose,
    onSaveSuccess,
    selectedAccountId,
    selectedAssignee,
    numericWorkOrderId,
    logType,
    currentUserId,
}) => {
    const [noteText, setNoteText] = useState("");
    const [attachedFiles, setAttachedFiles] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [submilestoneOptions, setSubmilestoneOptions] = useState([]);
    const [loadingSubmilestones, setLoadingSubmilestones] = useState(false);
    const { user } = useStateContext();

    useEffect(() => {
        if (isOpen) {
            setNoteText("");
            setAttachedFiles([]);
            setError(null);
            setIsSaving(false);
            setSubmilestoneOptions([]);

            if (logType) {
                const fetchSubmilestones = async () => {
                    setLoadingSubmilestones(true);
                    try {
                        const response = await apiService.get(
                            `/submilestones-details?work_order_type_name=${encodeURIComponent(logType)}`
                        );
                        
                        if (response && response.data && Array.isArray(response.data)) {
                            setSubmilestoneOptions(response.data);
                            setError(null); 
                        } else {
                            let receivedInfo = "Received unexpected data format from server.";
                            if (response && response.headers && typeof response.headers['content-type'] === 'string' && response.headers['content-type'].toLowerCase().includes('text/html')) {
                                receivedInfo = "Received HTML page instead of expected JSON data.";
                                console.warn(
                                    `API for submilestones (AddNoteModal) returned HTML. Status: ${response.status || 'N/A'}. Response data snippet:`,
                                    typeof response.data === 'string' ? response.data.substring(0, 300) + "..." : response.data
                                );
                            } else {
                                console.warn("API for submilestones (AddNoteModal) did not return an array. Received:", response.data);
                            }
                            setError(`Failed to load document types: ${receivedInfo} Please contact support if this issue persists.`);
                            setSubmilestoneOptions([]);
                        }
                    } catch (err) {
                        console.error("Failed to fetch submilestone options (AddNoteModal):", err);
                        let userErrorMessage = "An unexpected error occurred while fetching document types.";

                        if (err.response) {
                            console.error("Server responded with error:", err.response.status, err.response.data);
                            if (err.response.headers && typeof err.response.headers['content-type'] === 'string' && err.response.headers['content-type'].toLowerCase().includes('text/html')) {
                                userErrorMessage = "Failed to load document types: Server returned an unexpected page.";
                            } else if (err.response.data && typeof err.response.data.message === 'string') {
                                userErrorMessage = `Failed to load document types: ${err.response.data.message}`;
                            } else {
                                userErrorMessage = `Failed to load document types: Server error (status ${err.response.status || 'unknown'}).`;
                            }
                        } else if (err.message) {
                            userErrorMessage = `Failed to load document types: ${err.message}`;
                        }
                        setError(userErrorMessage);
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
            file,
            title: "",
            checklist_id: null,
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

    const handleTitleChange = (id, newTitle, newChecklistId) => {
        setAttachedFiles((prevFiles) =>
            prevFiles.map((f) =>
                f.id === id ? { ...f, title: newTitle, checklist_id: newChecklistId } : f
            )
        );
    };

    const handleRemoveFile = (idToRemove) => {
        setAttachedFiles((prevFiles) =>
            prevFiles.filter((f) => f.id !== idToRemove)
        );
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleSave = async () => {
        if (noteText.trim() === "" && attachedFiles.length === 0) {
            setError("Please enter a note or attach at least one file.");
            return;
        }
        if (noteText.length > 500) {
            setError("Note cannot exceed 500 characters.");
            return;
        }
        if (submilestoneOptions.length > 0 && attachedFiles.length > 0) {
            const filesWithoutTitles = attachedFiles.filter(fw => !fw.title);
            if (filesWithoutTitles.length > 0) {
                setError("Please select a document type for all attached files.");
                return;
            }
        }

        setError(null);
        setIsSaving(true);

        const formData = new FormData();
        formData.append("note_text", noteText);
        formData.append("account_id", selectedAccountId);
        formData.append("work_order_id", numericWorkOrderId);
        formData.append("log_type", logType);
        formData.append("note_type", "Manual Entry");

        if (user.id) {
            formData.append("created_by_user_id", user.id);
        }
        if (selectedAssignee && selectedAssignee.id) {
            formData.append("assigned_user_id", selectedAssignee.id);
        }

        attachedFiles.forEach((fileWrapper) => {
            formData.append("files[]", fileWrapper.file);
            formData.append("file_titles[]", fileWrapper.title);
        });

        const config = {
            method: "post",
            url: "/work-orders/notes/add",
            data: formData,
            headers: {
                "Content-Type": "multipart/form-data",
            },
        };

        const csrfToken = document.querySelector('meta[name="csrf-token"]');
        if (csrfToken) {
            const token = csrfToken.getAttribute("content");
            if (token) {
                config.headers["X-CSRF-TOKEN"] = token;
            }
        }
        const userToken = localStorage.getItem("authToken");
        if (userToken) {
            config.headers["Authorization"] = `Bearer ${userToken}`;
        }

        try {
            const response = await apiService.request(config); 

            if (response.data && response.data.success === false) { 
                throw new Error(
                    response.data.message || "Failed to save note."
                );
            }

            if (attachedFiles.length > 0) {
                const fileTitles = attachedFiles.map((fw) => fw.title);
                await apiService.post("/account-checklist-status/bulk", {
                    account_id: selectedAccountId,
                    file_titles: fileTitles,
                    is_completed: true,
                    completed_at: new Date().toISOString(),
                });
            }
            onSaveSuccess();
        } catch (err) {
            console.error("Failed to save note:", err);

            let errorMessage = "Failed to save note. Please try again.";
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

    const remainingChars = 500 - noteText.length;
    const isValid = noteText.trim() !== "" || attachedFiles.length > 0;

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
                        <h2 className="text-xl font-semibold text-custom-bluegreen">
                            Add Note
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {logType ? `${logType} - Work Order #${numericWorkOrderId}` : `Work Order No.${numericWorkOrderId}`}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                        aria-label="Close modal"
                        disabled={isSaving}
                    >
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <label htmlFor="noteText" className="block text-sm font-medium text-gray-700">
                                Note Text
                            </label>
                            <div className="flex items-center space-x-2">
                                <span className={`text-xs ${remainingChars < 50 ? 'text-orange-600' : remainingChars < 20 ? 'text-red-600' : 'text-gray-500'}`}>
                                    {remainingChars} characters remaining
                                </span>
                            </div>
                        </div>
                        <textarea
                            id="noteText"
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            rows="5"
                            maxLength="500"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent resize-none"
                            placeholder="Enter your note here..."
                            disabled={isSaving}
                        />
                        <div className="mt-2 flex justify-between items-center">
                            <p className="text-xs text-gray-500">
                                Maximum 500 characters
                            </p>
                            <p className={`text-xs font-medium ${noteText.length >= 450 ? 'text-orange-600' : noteText.length >= 480 ? 'text-red-600' : 'text-gray-500'}`}>
                                {noteText.length}/500
                            </p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Attach Files (Optional)
                        </label>
                        <div
                            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
                                dragActive 
                                    ? 'border-blue-400 bg-blue-50' 
                                    : 'border-gray-300 hover:border-gray-400'
                            }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                id="fileAttachmentInput"
                                multiple
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                disabled={isSaving}
                            />
                            
                            <div className="flex flex-col items-center">
                                <svg className="w-8 h-8 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                                <p className="text-sm font-medium text-gray-700 mb-1">
                                    Drop files here or click to browse
                                </p>
                                <p className="text-xs text-gray-500">
                                    Optional file attachments
                                </p>
                            </div>
                        </div>
                    </div>

                    {attachedFiles.length > 0 && (
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-medium text-gray-700">
                                    Attached Files ({attachedFiles.length})
                                </h3>
                                <button
                                    onClick={() => setAttachedFiles([])}
                                    className="text-sm text-red-600 hover:text-red-800 font-medium"
                                    disabled={isSaving}
                                >
                                    Remove All
                                </button>
                            </div>
                            
                            <div className="space-y-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                                {attachedFiles.map((fileWrapper) => (
                                    <div
                                        key={fileWrapper.id}
                                        className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate" title={fileWrapper.file.name}>
                                                    {fileWrapper.file.name}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {formatFileSize(fileWrapper.file.size)} • {fileWrapper.file.type || 'Unknown type'}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveFile(fileWrapper.id)}
                                                className="ml-3 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors duration-200"
                                                disabled={isSaving}
                                                aria-label={`Remove ${fileWrapper.file.name}`}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                {submilestoneOptions.length > 0 ? "Document Type" : "File Title (Optional)"}
                                                {submilestoneOptions.length > 0 && <span className="text-red-500">*</span>}
                                            </label>
                                            {loadingSubmilestones ? (
                                                <div className="flex items-center text-sm text-gray-500 p-2 bg-gray-100 rounded">
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Loading document types...
                                                </div>
                                            ) : submilestoneOptions.length > 0 ? (
                                                <select
                                                    value={fileWrapper.title}
                                                    onChange={(e) => handleTitleChange(fileWrapper.id, e.target.value, e.target.selectedOptions[0].dataset.checklistId)}
                                                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                                    disabled={isSaving}
                                                >
                                                    <option value="" disabled>Select document type...</option>
                                                    {submilestoneOptions.map((submilestone) =>
                                                        submilestone.checklists && submilestone.checklists.length > 0 ? (
                                                            <optgroup key={`sub-${submilestone.id}`} label={submilestone.name}>
                                                                {submilestone.checklists.map((checklist) => (
                                                                    <option key={`chk-${checklist.id}`} value={checklist.name}>{checklist.name}</option>
                                                                ))}
                                                            </optgroup>
                                                        ) : (
                                                            <option key={`sub-${submilestone.id}`} value={submilestone.name}>{submilestone.name}</option>
                                                        )
                                                    )}
                                                </select>
                                            ) : (
                                                <input type="text" value={fileWrapper.title || ""} placeholder="Enter file title..." onChange={(e) => handleTitleChange(fileWrapper.id, e.target.value)} className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" disabled={isSaving} />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start">
                                <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <div>
                                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                                    <p className="text-sm text-red-700 mt-1">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                    <div className="text-sm text-gray-600">
                        {noteText.trim() && (
                            <span className="mr-4">
                                <svg className="w-4 h-4 inline mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Note added
                            </span>
                        )}
                        {attachedFiles.length > 0 && (
                            <span>
                                <svg className="w-4 h-4 inline mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                                {attachedFiles.length} file{attachedFiles.length !== 1 ? 's' : ''} attached
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
                            disabled={isSaving || !isValid}
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
                                        ></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4 mr-2 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                    </svg>
                                    Save Note
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

export default AddNoteModal;
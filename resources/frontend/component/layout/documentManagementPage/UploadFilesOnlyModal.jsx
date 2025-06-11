import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useStateContext } from "../../../../../resources/frontend/context/contextprovider";

const UploadFilesOnlyModal = ({
    isOpen,
    onClose,
    onUploadSuccess,
    selectedAccountId,
    numericWorkOrderId,
    logType,
    // selectedAssigneeId,
}) => {
    const [attachedFiles, setAttachedFiles] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useStateContext();

    useEffect(() => {
        if (isOpen) {
            setAttachedFiles([]);
            setError(null);
            setIsSaving(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleFileChange = (event) => {
        const newFiles = Array.from(event.target.files).map(file => ({
            id: `${file.name}-${file.lastModified}-${file.size}-${Math.random().toString(36).substr(2, 9)}`,
            file: file,
            title: file.name
        }));
        const uniqueNewFiles = newFiles.filter(nf => !attachedFiles.some(af => af.id === nf.id));
        setAttachedFiles(prevFiles => [...prevFiles, ...uniqueNewFiles]);
        event.target.value = null;
    };

    const handleTitleChange = (id, newTitle) => {
        setAttachedFiles(prevFiles =>
            prevFiles.map(f => (f.id === id ? { ...f, title: newTitle } : f))
        );
    };

    const handleRemoveFile = (idToRemove) => {
        setAttachedFiles(prevFiles => prevFiles.filter(f => f.id !== idToRemove));
    };

    const handleSave = async () => {
        if (attachedFiles.length === 0) {
            setError("Please attach at least one file.");
            return;
        }
        setError(null);
        setIsSaving(true);

        const formData = new FormData();
        formData.append("note_text", "");
        formData.append("log_message", `Files uploaded for Work Order #${numericWorkOrderId}.`);
        formData.append("account_id", selectedAccountId);
        formData.append("work_order_id", numericWorkOrderId);
        formData.append("log_type", logType);
        formData.append("note_type", "File Upload");
        if (user && user.id) {
            formData.append("created_by_user_id", user.id);
        } else {
            console.error("User ID not found in context. Cannot set created_by_user_id for file upload.");
            setError("Could not identify the user. Please ensure you are logged in and try again.");
            setIsSaving(false);
            return; 
        }
        // if (selectedAssigneeId) { // If you need to log who the WO is assigned to at the time of upload
        //     formData.append("assigned_user_id", selectedAssigneeId);
        // }

        attachedFiles.forEach((fileWrapper) => {
            formData.append("files[]", fileWrapper.file);
            formData.append("file_titles[]", fileWrapper.title);
        });

        try {
            const response = await fetch(`/api/work-orders/notes/add`, { // Reusing the same endpoint as AddNoteModal
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({ message: "An unknown error occurred." }));
                throw new Error(errData.message || `HTTP error! status: ${response.status}`);
            }
            onUploadSuccess();
        } catch (err) {
            console.error("Failed to upload files:", err);
            setError(err.message || "Failed to upload files. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[60] bg-black bg-opacity-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-[10px] shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 relative flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center pb-3 border-b">
                    <h2 className="text-xl font-semibold text-custom-bluegreen">Upload Files</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl font-bold focus:outline-none" aria-label="Close"> × </button>
                </div>

                <div>
                    <label htmlFor="fileAttachment" className="block text-sm font-medium text-gray-700 mb-1">Attach Files</label>
                    <input type="file" id="fileAttachment" multiple onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-custom-lightgreen file:text-white hover:file:bg-custom-solidgreen" />
                    {attachedFiles.length > 0 && (
                        <div className="mt-3 space-y-2">
                            <p className="text-sm font-medium text-gray-700">Files to upload:</p>
                            {attachedFiles.map((fileWrapper) => (
                                <div key={fileWrapper.id} className="p-2 border border-gray-200 rounded-md bg-gray-50">
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="text-sm text-gray-700 truncate" title={fileWrapper.file.name}>
                                            {fileWrapper.file.name} ({ (fileWrapper.file.size / 1024).toFixed(2) } KB)
                                        </p>
                                        <button onClick={() => handleRemoveFile(fileWrapper.id)} className="text-xs text-red-500 hover:text-red-700 font-medium" type="button">Remove</button>
                                    </div>
                                    <input
                                        type="text"
                                        value={fileWrapper.title}
                                        placeholder="File Title"
                                        onChange={(e) => handleTitleChange(fileWrapper.id, e.target.value)}
                                        className="w-full p-1.5 border border-gray-300 rounded-md text-sm focus:ring-custom-lightgreen focus:border-custom-lightgreen"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {error && (
                    <div className="text-red-500 text-sm p-3 bg-red-100 border border-red-300 rounded-md">
                        {error}
                    </div>
                )}

                <div className="flex justify-end space-x-3 pt-3 border-t mt-auto">
                    <button onClick={onClose} disabled={isSaving} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none disabled:opacity-50">Cancel</button>
                    <button onClick={handleSave} disabled={isSaving || attachedFiles.length === 0} className="px-4 py-2 text-white bg-custom-solidgreen rounded-md hover:bg-green-700 focus:outline-none disabled:opacity-50 disabled:bg-gray-400 flex items-center">
                        {isSaving ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Uploading...
                            </>
                        ) : (
                            "Upload"
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default UploadFilesOnlyModal;
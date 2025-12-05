import React, { useState, useCallback, useEffect } from "react";
import ReactDOM from "react-dom";
import apiService from "../../servicesApi/apiService";
import { useDropzone } from "react-dropzone";
import { useStateContext } from "../../../../frontend/context/contextprovider";
import { useDocumentManagementContext } from "../../../../frontend/context/DocumentManagement/DocumentManagementContext";

const ProcessWorkOrderModal = ({ isOpen, onClose, workOrder }) => {
    const { user } = useStateContext();
    const docMgmt = useDocumentManagementContext();
    const [selectedAccountId, setSelectedAccountId] = useState("");
    const [note, setNote] = useState("");
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        // Pre-select the first account if available when the modal opens for a new work order
        if (isOpen && workOrder?.accounts?.length > 0) {
            setSelectedAccountId(workOrder.accounts[0].id);
        }
    }, [isOpen, workOrder]);

    const onDrop = useCallback((acceptedFiles) => {
        setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
    });

    const removeFile = (fileToRemove) => {
        setFiles((prevFiles) =>
            prevFiles.filter((file) => file !== fileToRemove)
        );
    };

    const handleSave = async () => {
        if (!selectedAccountId) {
            setError("Please select an account for the files.");
            return;
        }
        if (files.length === 0 && !note.trim()) {
            setError("Please add files or a note before submitting.");
            return;
        }

        setLoading(true);
        setError("");

        const formData = new FormData();
        formData.append("work_order_id", workOrder.work_order_id);
        formData.append("account_id", selectedAccountId);
        formData.append("log_type", workOrder.work_order_type.type_name);
        formData.append(
            "note_text",
            note.trim() || `Uploaded ${files.length} file(s).`
        );
        formData.append("created_by_user_id", user.id);

        files.forEach((file) => {
            formData.append("files[]", file);
            formData.append("file_titles[]", file.name);
        });

        try {
            await apiService.post("/work-orders/notes/add", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            onClose(true); // Pass true to indicate success and trigger a refetch
        } catch (err) {
            console.error("Failed to upload files:", err);
            setError(
                err.response?.data?.message ||
                "An error occurred during upload."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFiles([]);
        setNote("");
        setError("");
        setSelectedAccountId("");
        onClose();
    };

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-[1000] p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl transform transition-all">
                <div className="flex justify-between items-center pb-4 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Process Work Order #{workOrder.work_order_id}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700 text-3xl"
                    >
                        &times;
                    </button>
                </div>

                <div className="mt-6 space-y-4">
                    <div>
                        <label
                            htmlFor="account"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Select Account for Upload
                        </label>
                        <select
                            id="account"
                            value={selectedAccountId}
                            onChange={(e) =>
                                setSelectedAccountId(e.target.value)
                            }
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        >
                            {workOrder.accounts?.map((acc) => (
                                <option key={acc.id} value={acc.id}>
                                    {acc.account_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Upload Files (Bulk)
                        </label>
                        <div
                            {...getRootProps()}
                            className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-indigo-500 ${isDragActive
                                    ? "bg-indigo-50 border-indigo-500"
                                    : "bg-white"
                                }`}
                        >
                            <input {...getInputProps()} />
                            <div className="space-y-1 text-center">
                                <svg
                                    className="mx-auto h-12 w-12 text-gray-400"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 48 48"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                <p className="text-sm text-gray-600">
                                    {isDragActive
                                        ? "Drop the files here ..."
                                        : "Drag & drop files here, or click to select"}
                                </p>
                                <p className="text-xs text-gray-500">
                                    PNG, JPG, PDF up to 10MB
                                </p>
                            </div>
                        </div>
                    </div>

                    {files.length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-700">
                                Selected Files:
                            </h3>
                            <ul className="mt-2 border border-gray-200 rounded-md divide-y divide-gray-200 max-h-40 overflow-y-auto">
                                {files.map((file, index) => (
                                    <li
                                        key={index}
                                        className="px-3 py-2 flex items-center justify-between text-sm"
                                    >
                                        <span className="text-gray-800 truncate">
                                            {file.name}
                                        </span>
                                        <button
                                            onClick={() => removeFile(file)}
                                            className="text-red-500 hover:text-red-700 font-bold"
                                        >
                                            &times;
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div>
                        <label
                            htmlFor="note"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Add a Note (Optional)
                        </label>
                        <textarea
                            id="note"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows="3"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        ></textarea>
                    </div>

                    {error && <p className="text-sm text-red-600">{error}</p>}
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
                    >
                        {loading ? "Submitting..." : "Submit"}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ProcessWorkOrderModal;

import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import apiService from '../../../component/servicesApi/apiService';
import FileIcon from "../../../../../public/Images/folder_file_notes.svg";
import ViewIcon from "../../../../../public/Images/eye_icon.svg";
import DownloadIcon from "../../../../../public/Images/download_icon.svg";

const getAssignmentActionText = (logMessage) => {
    if (!logMessage) return null; 
    const lowerLogMessage = logMessage.toLowerCase();
    if (
        lowerLogMessage.includes("reassign") ||
        (lowerLogMessage.includes("update") && 
            !lowerLogMessage.includes("create")) 
    ) {
        return "Reassigned to";
    }

    return null;
};

const formatDateWithTime = (dateStr) => {
    if (!dateStr) return "Invalid Date";
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

const TitlingStepNotesModal = ({ isOpen, onClose, contractNumber, workOrderId, stepName }) => {
    const [mounted, setMounted] = useState(false);
    const [notes, setNotes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setMounted(true);
        document.body.style.overflow = isOpen ? 'hidden' : 'unset';
        return () => {
            document.body.style.overflow = 'unset';
            setMounted(false);
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && contractNumber && workOrderId && stepName && workOrderId !== "TBD" && workOrderId !== "N/A") {
            setIsLoading(true);
            setError(null);

            const endpoint = `/get-account-logs/${contractNumber}?log_type=${encodeURIComponent(stepName)}&work_order_id=${encodeURIComponent(workOrderId)}`;

            apiService.get(endpoint)
                .then(response => {
                    const data = response.data;
                    const logsArray = data && Array.isArray(data.log_data) ? data.log_data : [];
                    setNotes(
                        logsArray.sort(
                            (a, b) => new Date(b.created_at) - new Date(a.created_at)
                        )
                    );
                    setIsLoading(false);
                })
                .catch(err => {
                    console.error("Failed to fetch titling step notes:", err);
                    let errorMessage = `Failed to load notes: ${err.message}`;
                    if (err.response && err.response.data && err.response.data.message) {
                        errorMessage = `Failed to load notes: ${err.response.data.message}`;
                    } else if (err.response) {
                        errorMessage = `Failed to load notes: HTTP error! status: ${err.response.status}`;
                    }
                    setError(errorMessage);
                    setIsLoading(false);
                    setNotes([]);
                });
        } else if (isOpen && (workOrderId === "TBD" || workOrderId === "N/A")) {
            setNotes([]);
            setIsLoading(false);
            setError("Work Order ID is not yet determined.");
        }
    }, [isOpen, contractNumber, workOrderId, stepName]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen || !mounted) return null;

    const modalTitle = `Notes for ${stepName}`;

    return ReactDOM.createPortal(
        <div
            className="fixed inset-0 z-[60] bg-black bg-opacity-50 flex items-center justify-center p-4" // Ensure z-index is high enough
            onClick={onClose}
        >
            <div
                className="bg-white rounded-[10px] shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-6 pb-3 border-b">
                    <h2 className="text-xl font-semibold text-custom-bluegreen">{modalTitle}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl font-bold focus:outline-none"
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>
                <div className="p-6 overflow-y-auto flex-grow">
                    {isLoading && <p className="text-center text-gray-600">Loading notes...</p>}
                    {error && <p className="text-center text-red-500">{error}</p>}
                    {!isLoading && !error && notes.length === 0 && (
                        <p className="text-center text-gray-500">No notes found for this step and work order.</p>
                    )}
                    {!isLoading && !error && notes.length > 0 && (
                        <ul className="space-y-4">
                            {notes.map((note, index) => (
                                <li key={note.id || `note-${index}`} className="py-3 border-b border-gray-200 last:border-b-0">
                                    <div className="text-custom-bluegreen font-semibold text-sm mb-1">
                                        {formatDateWithTime(note.created_at)}
                                        {note.is_new && (
                                            <span className="bg-custom-lightgreen text-white py-0.5 px-2 rounded-full text-xs ml-2">
                                                New
                                            </span>
                                        )}
                                    </div>

                                    <div className="text-gray-700 text-sm mb-1 whitespace-pre-wrap break-words">
                                        {note.log_message || "No content provided."}
                                    </div>

                                    <div className="text-xs text-gray-500">
                                        <span>
                                            by{" "}
                                            <span className="text-blue-600 font-medium">
                                                {note.fullname || 'System'}
                                            </span>
                                        </span>
                                        {(() => {
                                            const actionText = getAssignmentActionText(note.log_message);
                                            if (actionText && note.assigned_user_name) {
                                                return (
                                                    <span className="ml-2">
                                                        • {actionText}:{" "}
                                                        <span className="text-blue-600 font-medium">
                                                            {note.assigned_user_name}
                                                        </span>
                                                    </span>
                                                );
                                            }
                                            return null;
                                        })()}
                                    </div>

                                    {note.documents && note.documents.length > 0 && (
                                        <div className="mt-2 pl-1">
                                            <div className="space-y-2">
                                                {note.documents.map((doc) => (
                                                    <div key={doc.document_id || doc.id} className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
                                                        <div className="flex items-center space-x-2 min-w-0">
                                                            <img src={FileIcon} alt="File" className="w-5 h-5 flex-shrink-0" />
                                                            <span className="text-xs text-gray-700 truncate" title={doc.file_name}>
                                                                {doc.file_title || doc.file_name}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center space-x-1 flex-shrink-0">
                                                            <button onClick={() => window.open(doc.file_path, "_blank")} className="p-1 text-green-600 hover:text-green-700" title="View document"> <img src={ViewIcon} alt="View" className="w-5 h-5" /> </button>
                                                            <a href={doc.file_path} target="_blank" rel="noopener noreferrer" download={doc.file_name} className="p-1 text-green-600 hover:text-green-700" title="Download document"> <img src={DownloadIcon} alt="Download" className="w-4 h-4" /> </a>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="p-6 pt-4 border-t flex justify-end">
                    <button onClick={onClose} className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500">Close</button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default TitlingStepNotesModal;


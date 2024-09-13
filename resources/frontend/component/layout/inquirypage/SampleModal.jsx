import React from 'react';
import ReactDOM from 'react-dom';

const SampleModal = ({ isOpen, onClose, attachment }) => {
    if (!isOpen) return null;

    const getFileType = (url) => {
        const extension = url.split('.').pop().toLowerCase();
        if (['pdf'].includes(extension)) return 'pdf';
        if (['doc', 'docx'].includes(extension)) return 'doc';
        if (['xls', 'xlsx'].includes(extension)) return 'xls';
        return 'image';
    };

    const fileType = getFileType(attachment);

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg relative">
                <button
                    className="absolute top-2 right-2 text-red-500"
                    onClick={onClose}
                >
                    &times;
                </button>
                {fileType === 'pdf' && (
                    <iframe
                        src={attachment}
                        title="PDF Preview"
                        className="w-full h-96"
                        frameBorder="0"
                    />
                )}
                {fileType === 'doc' || fileType === 'xls' ? (
                    <div className="text-center">
                        <p>Preview is not available for this file type.</p>
                        <a href={attachment} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                            Download {fileType.toUpperCase()} File
                        </a>
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <img src={attachment} alt="Attachment" className="max-w-full max-h-screen" />
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

export default SampleModal;

import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

const FileViewerModal = ({ isOpen, onClose, file }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);
    if (!mounted || !isOpen || !file) {
        return null;
    }

    const getFileExtension = (filePathOrName) => {
        if (!filePathOrName || typeof filePathOrName !== "string") return "";
        return filePathOrName.split(".").pop()?.toLowerCase() || "";
    };

    const extension = getFileExtension(file.file_name || file.file_path);
    const fileName =
        file.file_name || file.file_path?.split("/").pop() || "Document";

    let viewerContent;

    switch (extension) {
        case "pdf":
            viewerContent = (
                <iframe
                    src={file.file_path}
                    title={fileName}
                    className="w-full h-full border-0"
                    allowFullScreen
                />
            );
            break;
        case "jpg":
        case "jpeg":
        case "png":
        case "gif":
        case "svg":
        case "webp":
            viewerContent = (
                <div className="w-full h-full flex items-center justify-center p-4 bg-gray-100">
                    <img
                        src={file.file_path}
                        alt={fileName}
                        className="max-w-full max-h-full object-contain"
                    />
                </div>
            );
            break;
        case "doc":
        case "docx":
        case "xls":
        case "xlsx":
        case "ppt":
        case "pptx":
            const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                file.file_path
            )}`;
            viewerContent = (
                <iframe
                    src={officeViewerUrl}
                    title={fileName}
                    className="w-full h-full border-0"
                    allowFullScreen
                />
            );
            break;
        default:
            viewerContent = (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-gray-700">
                    <p className="text-lg mb-2">
                        Preview not available for this file type ({extension}).
                    </p>
                    <p className="mb-4">File: {fileName}</p>
                    <a
                        href={file.file_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                        Download File
                    </a>
                </div>
            );
    }

    return ReactDOM.createPortal(
        <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[80] p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-3 border-b bg-gray-50">
                    <h3
                        className="text-lg font-semibold text-gray-800 truncate"
                        title={fileName}
                    >
                        {fileName}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-800 text-2xl font-bold leading-none"
                        aria-label="Close"
                    >
                        &times;
                    </button>
                </div>
                <div className="flex-grow relative">{viewerContent}</div>
            </div>
        </div>,
        document.body
    );
};

export default FileViewerModal;

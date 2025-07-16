import React, { useState, useEffect } from "react";
import FileViewerModal from "./FileViewerModal";
import { Dialog, Button, Typography } from "@material-tailwind/react";

const getFileType = (extension) => {
    const fileTypes = {
        // Images
        jpg: {
            color: "text-purple-500",
            icon: (
                <img
                    className="w-full h-full object-contain"
                    src="https://cdn-icons-png.flaticon.com/512/8344/8344913.png"
                    alt="Image file"
                />
            ),
        },
        jpeg: {
            color: "text-purple-500",
            icon: (
                <img
                    className="w-full h-full object-contain"
                    src="https://cdn-icons-png.flaticon.com/512/8344/8344913.png"
                    alt="Image file"
                />
            ),
        },
        png: {
            color: "text-purple-500",
            icon: (
                <img
                    className="w-full h-full object-contain"
                    src="https://cdn-icons-png.flaticon.com/512/8344/8344913.png"
                    alt="Image file"
                />
            ),
        },
        gif: {
            color: "text-pink-500",
            icon: (
                <img
                    className="w-full h-full object-contain"
                    src="https://cdn-icons-png.flaticon.com/512/8344/8344913.png"
                    alt="Image file"
                />
            ),
        },
        webp: {
            color: "text-purple-500",
            icon: (
                <img
                    className="w-full h-full object-contain"
                    src="https://cdn-icons-png.flaticon.com/512/8344/8344913.png"
                    alt="Image file"
                />
            ),
        },
        svg: {
            color: "text-orange-500",
            icon: (
                <img
                    className="w-full h-full object-contain"
                    src="https://cdn-icons-png.flaticon.com/512/8344/8344913.png"
                    alt="Image file"
                />
            ),
        },
        // Documents
        pdf: {
            color: "text-red-500",
            icon: (
                <img
                    className="w-full h-full object-contain"
                    src="https://cdn-icons-png.flaticon.com/512/9496/9496432.png"
                    alt="PDF file"
                />
            ),
        },
        docx: {
            color: "text-blue-500",
            icon: (
                <svg
                    className="w-full h-full"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                    <path d="M14 2v6h6" />
                    <path d="M10 9H8v2h2V9zm4 0h-2v2h2V9zm-4 4H8v2h2v-2zm4 0h-2v2h2v-2z" />
                </svg>
            ),
        },
        doc: {
            color: "text-blue-500",
            icon: (
                <svg
                    className="w-full h-full"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                    <path d="M14 2v6h6" />
                    <path d="M10 9H8v2h2V9zm4 0h-2v2h2V9zm-4 4H8v2h2v-2zm4 0h-2v2h2v-2z" />
                </svg>
            ),
        },
        // Spreadsheet
        xlsx: {
            color: "text-green-500",
            icon: (
                <img
                    className="w-full h-full object-contain"
                    src="https://cdn-icons-png.flaticon.com/512/732/732220.png"
                    alt="Excel file"
                />
            ),
        },
        xls: {
            color: "text-green-500",
            icon: (
                <img
                    className="w-full h-full object-contain"
                    src="https://cdn-icons-png.flaticon.com/512/732/732220.png"
                    alt="Excel file"
                />
            ),
        },
        csv: {
            color: "text-green-600",
            icon: (
                <img
                    className="w-full h-full object-contain"
                    src="https://cdn-icons-png.flaticon.com/512/732/732220.png"
                    alt="CSV file"
                />
            ),
        },
        // Default
        default: {
            color: "text-gray-500",
            icon: (
                <svg
                    className="w-full h-full"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                    <path d="M14 2v6h6" />
                </svg>
            ),
        },
    };
    return fileTypes[extension] || fileTypes.default;
};

// ✅ Reusable FileCard component with drag and drop
const FileCard = ({
    file,
    onClick,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDragEnter,
    onDragLeave,
    onDrop,
    index,
    isDragOver,
    isDragging,
}) => {
    const displayName =
        file.file_title || file.file_name || file.name || "ID.csv";
    const sourceFileName = file.file_name || file.name || displayName; // Always use a name with an extension for logic
    const extension = sourceFileName.split(".").pop()?.toLowerCase();
    const { color, icon } = getFileType(extension);
    const isImage = ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(
        extension
    );

    const uploadedBy =
        file.uploaded_by?.fullname ||
        file.uploaded_by?.name ||
        file.uploaded_by ||
        file.uploaded_by_name ||
        file.user_name ||
        "User Name";
    const uploadDate = file.created_at
        ? new Date(file.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
          })
        : "May 19, 2025";

    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, file, index)}
            onDragEnd={onDragEnd}
            onDragOver={onDragOver}
            onDragEnter={(e) => onDragEnter(e, index)}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, index)}
            className={`w-[200px] h-[200px] rounded-xl border-2 bg-white shadow-md p-2 flex flex-col justify-between hover:shadow-lg transition-all cursor-pointer ${
                isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-200"
            } ${isDragging ? "opacity-50 scale-105" : ""}`}
            onClick={() => onClick(file)}
        >
            {/* Top Row */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center min-w-0">
                    <div
                        className={`w-6 h-6 flex items-center justify-center shrink-0 ${color}`}
                    >
                        {icon}
                    </div>
                    <span className="ml-2 text-xs font-medium text-gray-800 truncate">
                        {displayName}
                    </span>
                </div>
                <button
                    className="text-gray-400 hover:text-gray-600 text-sm shrink-0"
                    onClick={(e) => e.stopPropagation()}
                >
                    ⋮
                </button>
            </div>

            {/* Preview Section - Fixed Height */}
            <div className="h-[140px] flex items-center justify-center border border-gray-200 rounded-md bg-gray-50 overflow-hidden">
                {isImage ? (
                    <img
                        src={file.file_path}
                        alt={displayName}
                        className="w-full h-full object-cover"
                    />
                ) : extension === "pdf" ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <embed
                            src={file.file_path}
                            type="application/pdf"
                            className="w-full h-full"
                            onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                            }}
                        />
                        <div
                            className={`hidden items-center justify-center w-full h-full text-4xl ${color}`}
                        >
                            {icon}
                        </div>
                    </div>
                ) : extension === "csv" ||
                  extension === "xlsx" ||
                  extension === "xls" ? (
                    <div className="w-full h-full flex items-center justify-center bg-white">
                        <iframe
                            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                                file.file_path
                            )}`}
                            className="w-full h-full border-0"
                            onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                            }}
                        />
                        <div
                            className={`hidden items-center justify-center w-full h-full text-4xl ${color}`}
                        >
                            {icon}
                        </div>
                    </div>
                ) : (
                    <div className={`text-4xl ${color}`}>{icon}</div>
                )}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center text-xs text-gray-600 mt-2 px-1">
                <span className="truncate">{uploadedBy}</span>
                <span>{uploadDate}</span>
            </div>
        </div>
    );
};

const AccountFilesModal = ({
    isOpen,
    onClose,
    files = [],
    accountInfo = {},
}) => {
    const [viewerOpen, setViewerOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [modalOpen, setModalOpen] = useState(isOpen);
    const [viewType, setViewType] = useState("grid"); // 'grid' or 'list'
    const [sortBy, setSortBy] = useState("name");
    const [searchTerm, setSearchTerm] = useState("");
    const [draggedFile, setDraggedFile] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);

    // Helper function to get property name
    const getPropertyName = (accountInfo) => {
        // Try different possible property names in order of preference
        const propertyName =
            accountInfo.property_name ||
            accountInfo.project_name ||
            accountInfo.milestone_name ||
            accountInfo.group_name ||
            accountInfo.group?.property_name ||
            accountInfo.group?.project_name ||
            accountInfo.group?.name ||
            accountInfo.account?.property_name ||
            accountInfo.account?.project_name ||
            // Try to get from work_orders if available
            (accountInfo.group?.work_orders &&
            accountInfo.group.work_orders.length > 0
                ? accountInfo.group.work_orders[0]?.property_name ||
                  accountInfo.group.work_orders[0]?.project_name ||
                  accountInfo.group.work_orders[0]?.account?.property_name
                : null);

        return propertyName || "Project";
    };

    // Modal position and size state
    const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
    const [modalSize, setModalSize] = useState({ width: 1200, height: 700 });
    const [isMaximized, setIsMaximized] = useState(false);
    const [previousState, setPreviousState] = useState({
        position: { x: 0, y: 0 },
        size: { width: 1200, height: 700 },
    });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [resizeStart, setResizeStart] = useState({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    });

    // Initialize modal position to center of screen
    useEffect(() => {
        if (isOpen) {
            const centerX = (window.innerWidth - modalSize.width) / 2;
            const centerY = (window.innerHeight - modalSize.height) / 2;
            setModalPosition({ x: centerX, y: centerY });
        }
    }, [isOpen, modalSize.width, modalSize.height]);

    // Maximize/Restore functionality
    const toggleMaximize = () => {
        if (isMaximized) {
            // Restore to previous state
            setModalPosition(previousState.position);
            setModalSize(previousState.size);
            setIsMaximized(false);
        } else {
            // Save current state and maximize to full screen
            setPreviousState({ position: modalPosition, size: modalSize });
            setModalPosition({ x: 0, y: 0 });
            setModalSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
            setIsMaximized(true);
        }
    };

    // Prevent text selection during resize/drag
    useEffect(() => {
        if (isDragging || isResizing) {
            document.body.style.userSelect = "none";
            document.body.style.pointerEvents = "none";
            const modal = document.querySelector(".modal-content");
            if (modal) {
                modal.style.pointerEvents = "auto";
            }
        } else {
            document.body.style.userSelect = "";
            document.body.style.pointerEvents = "";
        }

        return () => {
            document.body.style.userSelect = "";
            document.body.style.pointerEvents = "";
        };
    }, [isDragging, isResizing]);

    useEffect(() => {
        setModalOpen(isOpen);
    }, [isOpen]);

    // Drag functionality
    const handleMouseDown = (e) => {
        // Prevent dragging when clicking on buttons or other controls
        if (
            e.target.closest(".resize-handle") ||
            e.target.closest("button") ||
            e.target.closest("input") ||
            e.target.closest("select")
        ) {
            return;
        }
        setIsDragging(true);
        setDragStart({
            x: e.clientX - modalPosition.x,
            y: e.clientY - modalPosition.y,
        });
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            setModalPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y,
            });
        } else if (isResizing) {
            const newWidth = Math.max(
                400,
                resizeStart.width + (e.clientX - resizeStart.x)
            );
            const newHeight = Math.max(
                300,
                resizeStart.height + (e.clientY - resizeStart.y)
            );
            setModalSize({ width: newWidth, height: newHeight });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setIsResizing(false);
    };

    // Resize functionality
    const handleResizeStart = (e) => {
        e.stopPropagation();
        setIsResizing(true);
        setResizeStart({
            x: e.clientX,
            y: e.clientY,
            width: modalSize.width,
            height: modalSize.height,
        });
    };

    // Add global event listeners
    useEffect(() => {
        if (isDragging || isResizing) {
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
            return () => {
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
            };
        }
    }, [
        isDragging,
        isResizing,
        dragStart,
        resizeStart,
        modalPosition,
        modalSize,
    ]);

    const handleViewFile = (file) => {
        setSelectedFile(file);
        setViewerOpen(true);
    };

    const handleCloseViewer = () => {
        setViewerOpen(false);
        setSelectedFile(null);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setViewerOpen(false);
        setSelectedFile(null);
        setDraggedFile(null);
        setDragOverIndex(null);
        if (onClose) onClose();
    };

    // Drag and drop functionality for files
    const handleDragStart = (e, file, index) => {
        setDraggedFile({ file, index });
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/html", e.target.outerHTML);
        e.target.style.opacity = "0.5";
    };

    const handleDragEnd = (e) => {
        e.target.style.opacity = "1";
        setDraggedFile(null);
        setDragOverIndex(null);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDragEnter = (e, index) => {
        e.preventDefault();
        setDragOverIndex(index);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setDragOverIndex(null);
        }
    };

    const handleDrop = (e, dropIndex) => {
        e.preventDefault();
        if (draggedFile && draggedFile.index !== dropIndex) {
            // Create a new array with the dragged file moved to the new position
            const newFiles = [...filteredAndSortedFiles];
            const draggedItem = newFiles[draggedFile.index];
            newFiles.splice(draggedFile.index, 1);
            newFiles.splice(dropIndex, 0, draggedItem);

            // You can update the files array here if needed
            // For now, we'll just show the visual feedback
        }
        setDraggedFile(null);
        setDragOverIndex(null);
    };

    // Filter and sort files
    const filteredAndSortedFiles = files
        .filter((file) => {
            const fileName =
                file.file_title || file.file_name || file.name || "";
            const uploadedBy =
                file.uploaded_by?.fullname ||
                file.uploaded_by?.name ||
                file.uploaded_by ||
                file.uploaded_by_name ||
                file.user_name ||
                "";
            return (
                fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                uploadedBy.toLowerCase().includes(searchTerm.toLowerCase())
            );
        })
        .sort((a, b) => {
            const getFileName = (file) =>
                file.file_title || file.file_name || file.name || "";
            const getUploadedBy = (file) =>
                file.uploaded_by?.fullname ||
                file.uploaded_by?.name ||
                file.uploaded_by ||
                file.uploaded_by_name ||
                file.user_name ||
                "";
            const getDate = (file) => new Date(file.created_at || 0);

            switch (sortBy) {
                case "name":
                    return getFileName(a).localeCompare(getFileName(b));
                case "date":
                    return getDate(b) - getDate(a); // newest first
                case "type":
                    const extA = (
                        getFileName(a).split(".").pop() || ""
                    ).toLowerCase();
                    const extB = (
                        getFileName(b).split(".").pop() || ""
                    ).toLowerCase();
                    return extA.localeCompare(extB);
                case "uploader":
                    return getUploadedBy(a).localeCompare(getUploadedBy(b));
                default:
                    return 0;
            }
        });

    // List view component
    const FileListItem = ({ file, onClick }) => {
        const displayName =
            file.file_title || file.file_name || file.name || "ID.csv";
        const sourceFileName = file.file_name || file.name || displayName;
        const extension = sourceFileName.split(".").pop()?.toLowerCase();
        const { color, icon } = getFileType(extension);
        const isImage = ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(
            extension
        );

        const uploadedBy =
            file.uploaded_by?.fullname ||
            file.uploaded_by?.name ||
            file.uploaded_by ||
            file.uploaded_by_name ||
            file.user_name ||
            "User Name";
        const uploadDate = file.created_at
            ? new Date(file.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
              })
            : "May 19, 2025";

        return (
            <div
                className="flex items-center space-x-4 p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onClick(file)}
            >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div
                        className={`w-8 h-8 flex items-center justify-center shrink-0 ${color}`}
                    >
                        {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {displayName}
                        </p>
                        <p className="text-xs text-gray-500">
                            {extension?.toUpperCase() || "FILE"}
                        </p>
                    </div>
                </div>
                <div className="text-sm text-gray-500 w-32 truncate">
                    {uploadedBy}
                </div>
                <div className="text-sm text-gray-500 w-24">{uploadDate}</div>
                <div className="w-8 h-8 flex items-center justify-center">
                    <button className="text-gray-400 hover:text-gray-600">
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        );
    };

    return (
        <>
            {modalOpen && (
                <div className="fixed inset-0 z-50 pointer-events-none">
                    <div
                        className="bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden pointer-events-auto"
                        style={{
                            position: "absolute",
                            left: `${modalPosition.x}px`,
                            top: `${modalPosition.y}px`,
                            width: `${modalSize.width}px`,
                            height: `${modalSize.height}px`,
                            minWidth: "400px",
                            minHeight: "300px",
                            maxWidth: "100vw",
                            maxHeight: "100vh",
                            cursor: isDragging ? "grabbing" : "default",
                            zIndex: isMaximized ? 9999 : 1000,
                            borderRadius: isMaximized ? "0px" : "0.5rem",
                        }}
                    >
                        {/* Draggable Header */}
                        <div
                            className="px-6 py-4 border-b border-gray-200 bg-gray-200 cursor-grab active:cursor-grabbing select-none"
                            onMouseDown={handleMouseDown}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 gradient-btn5 rounded-lg flex items-center justify-center">
                                        <svg
                                            className="w-5 h-5 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M3 7a2 2 0 012-2h3.172a2 2 0 011.414.586l1.828 1.828A2 2 0 0012.828 8H19a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900">
                                            Document Library
                                        </h2>
                                        <p className="text-sm text-gray-600">
                                            {accountInfo.account_name ||
                                                "Account"}{" "}
                                            • {getPropertyName(accountInfo)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                                        <svg
                                            className="w-4 h-4 text-gray-500"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                        </svg>
                                        <span className="text-sm font-medium text-gray-700">
                                            {files.length} files
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleMaximize();
                                            }}
                                            className="p-2 hover:bg-gray-100 rounded-sm transition-colors"
                                            title={
                                                isMaximized
                                                    ? "Restore"
                                                    : "Maximize"
                                            }
                                        >
                                            {isMaximized ? (
                                                <svg
                                                    className="w-4 h-4 text-gray-600"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2M16 4h2a2 2 0 012 2v2M16 20h2a2 2 0 002-2v-2"
                                                    />
                                                </svg>
                                            ) : (
                                                <svg
                                                    className="w-4 h-4 text-gray-600"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                                                    />
                                                </svg>
                                            )}
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCloseModal();
                                            }}
                                            className="p-2 hover:bg-red-100 rounded-sm transition-colors"
                                            title="Close"
                                        >
                                            <svg
                                                className="w-4 h-4 text-gray-600 hover:text-red-600"
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
                                </div>
                            </div>
                        </div>

                        {/* Toolbar */}
                        <div className="px-6 py-3 bg-white border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <button
                                            className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${
                                                viewType === "list"
                                                    ? "bg-custom-lightestgreen text-gray-900"
                                                    : ""
                                            }`}
                                            onClick={() => setViewType("list")}
                                        >
                                            <svg
                                                className="w-5 h-5 text-gray-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                                                />
                                            </svg>
                                        </button>
                                        <button
                                            className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${
                                                viewType === "grid"
                                                    ? "bg-custom-lightestgreen text-gray-900"
                                                    : ""
                                            }`}
                                            onClick={() => setViewType("grid")}
                                        >
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="h-6 w-px bg-gray-300"></div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium text-gray-700">
                                            Sort by:
                                        </span>
                                        <select
                                            className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white"
                                            value={sortBy}
                                            onChange={(e) =>
                                                setSortBy(e.target.value)
                                            }
                                        >
                                            <option value="name">Name</option>
                                            <option value="date">
                                                Date modified
                                            </option>
                                            <option value="type">Type</option>
                                            <option value="uploader">
                                                Uploader
                                            </option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="relative">
                                        <svg
                                            className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                            />
                                        </svg>
                                        <input
                                            type="text"
                                            placeholder="Search files..."
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-custom-lightgreen focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="flex-1 overflow-hidden bg-gray-200">
                            {filteredAndSortedFiles.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                        <svg
                                            className="w-12 h-12 text-gray-400"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M3 7a2 2 0 012-2h3.172a2 2 0 011.414.586l1.828 1.828A2 2 0 0012.828 8H19a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {searchTerm
                                            ? "No files found matching your search"
                                            : "No files found"}
                                    </h3>
                                    <p className="text-gray-500 text-center max-w-md">
                                        {searchTerm
                                            ? `No files match "${searchTerm}". Try adjusting your search terms.`
                                            : "This account doesn't have any uploaded files yet. Files will appear here when uploaded."}
                                    </p>
                                </div>
                            ) : (
                                <div className="h-full overflow-y-auto">
                                    {viewType === "grid" ? (
                                        <div className="p-6">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                                {filteredAndSortedFiles.map(
                                                    (file, idx) => (
                                                        <FileCard
                                                            key={file.id || idx}
                                                            file={file}
                                                            index={idx}
                                                            onClick={
                                                                handleViewFile
                                                            }
                                                            onDragStart={
                                                                handleDragStart
                                                            }
                                                            onDragEnd={
                                                                handleDragEnd
                                                            }
                                                            onDragOver={
                                                                handleDragOver
                                                            }
                                                            onDragEnter={
                                                                handleDragEnter
                                                            }
                                                            onDragLeave={
                                                                handleDragLeave
                                                            }
                                                            onDrop={handleDrop}
                                                            isDragOver={
                                                                dragOverIndex ===
                                                                idx
                                                            }
                                                            isDragging={
                                                                draggedFile?.index ===
                                                                idx
                                                            }
                                                        />
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-6">
                                            {/* List View Header */}
                                            <div className="flex items-center space-x-4 p-3 border-b border-gray-200 bg-gray-50 text-sm font-medium text-gray-700">
                                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                                    <div className="w-8"></div>
                                                    <div className="flex-1 min-w-0">
                                                        Name
                                                    </div>
                                                </div>
                                                <div className="w-32">
                                                    Uploaded by
                                                </div>
                                                <div className="w-24">Date</div>
                                                <div className="w-8"></div>
                                            </div>
                                            {/* List View Items */}
                                            <div className="divide-y divide-gray-400">
                                                {filteredAndSortedFiles.map(
                                                    (file, idx) => (
                                                        <FileListItem
                                                            key={file.id || idx}
                                                            file={file}
                                                            onClick={
                                                                handleViewFile
                                                            }
                                                        />
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Status Bar */}
                        <div className="px-6 py-2 bg-white border-t border-gray-200">
                            <div className="flex items-center justify-between text-sm text-gray-600">
                                <span>
                                    {filteredAndSortedFiles.length}{" "}
                                    {filteredAndSortedFiles.length === 1
                                        ? "item"
                                        : "items"}
                                    {searchTerm && ` matching "${searchTerm}"`}
                                </span>
                                <div className="flex items-center space-x-4">
                                    <span>
                                        Last updated:{" "}
                                        {new Date().toLocaleDateString()}
                                    </span>
                                    <div className="flex items-center space-x-1">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span>Connected</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Resize Handle */}
                        <div
                            className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-nw-resize bg-gray-300 hover:bg-gray-400 transition-colors"
                            onMouseDown={handleResizeStart}
                            style={{
                                clipPath: "polygon(100% 0, 0 100%, 100% 100%)",
                            }}
                        />
                    </div>
                </div>
            )}

            <FileViewerModal
                isOpen={viewerOpen}
                onClose={handleCloseViewer}
                file={selectedFile}
            />
        </>
    );
};

export default AccountFilesModal;

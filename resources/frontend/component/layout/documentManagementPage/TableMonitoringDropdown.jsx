import React, { useState, useEffect } from "react";
import apiService from "../../../component/servicesApi/apiService";
import FileViewerModal from "./FileViewerModal";

const WORK_ORDER_TBD = "TBD";
const WORK_ORDER_NA = "N/A";

const Dropdown = ({ currentMilestone, workOrderId, accountId }) => {
    const [expandedSubMilestones, setExpandedSubMilestones] = useState({});
    const [checkedItems, setCheckedItems] = useState({});
    const [milestoneDetails, setMilestoneDetails] = useState({});
    const [uploadedDocuments, setUploadedDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [viewingFile, setViewingFile] = useState(null);
    const [isCompletionStatusUpdated, setIsCompletionStatusUpdated] = useState(false);

    useEffect(() => {
        const isWorkOrderInvalid =
            !workOrderId ||
            workOrderId === WORK_ORDER_TBD ||
            workOrderId === WORK_ORDER_NA;

        setIsCompletionStatusUpdated(false); // Reset when key identifiers change

        if (!currentMilestone || isWorkOrderInvalid || !accountId) {
            setMilestoneDetails({});
            setUploadedDocuments([]);
            setCheckedItems({});
            // Reset loading and error only if it's due to invalid work order/account ID, not just missing currentMilestone
            if (isWorkOrderInvalid || !accountId) {
                setIsLoading(false);
                setError(null);
            }
            return;
        }

        const fetchMilestoneDetails = async () => {
            setIsLoading(true);
            setError(null);
            setExpandedSubMilestones({});
            try {
                const response = await apiService.get(
                    `/milestones-details?milestoneName=${encodeURIComponent(
                        currentMilestone
                    )}&workOrderId=${encodeURIComponent(
                        workOrderId
                    )}&accountId=${encodeURIComponent(accountId)}`
                );

                if (
                    typeof response.data === "object" &&
                    response.data !== null &&
                    response.data.checklistStructure &&
                    Array.isArray(response.data.uploadedDocuments)
                ) {
                    const upperCasedData = Object.keys(
                        response.data.checklistStructure
                    ).reduce((acc, key) => {
                        acc[key.toUpperCase()] =
                            response.data.checklistStructure[key];
                        return acc;
                    }, {});
                    setMilestoneDetails(upperCasedData);
                    setUploadedDocuments(response.data.uploadedDocuments || []);
                } else {
                    console.error(
                        "API did not return a valid object for milestone details:",
                        response.data
                    );
                    setError("Failed to load details: Invalid data format.");
                    setMilestoneDetails({});
                    setUploadedDocuments([]);
                }
            } catch (err) {
                console.error(
                    `Error fetching details for ${currentMilestone}:`,
                    err
                );
                setError(
                    err.message || "Failed to fetch details. Please try again."
                );
                setMilestoneDetails({});
                setUploadedDocuments([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMilestoneDetails();
    }, [currentMilestone, workOrderId, accountId]);

    useEffect(() => {
        if (
            Object.keys(milestoneDetails).length > 0 &&
            uploadedDocuments.length >= 0
        ) {
            const initialCheckedState = {};
            Object.keys(milestoneDetails).forEach((subMilestone) => {
                (milestoneDetails[subMilestone] || []).forEach(
                    (item, index) => {
                        if (
                            uploadedDocuments.some(
                                (doc) => doc.file_title === item
                            )
                        ) {
                            initialCheckedState[
                                `${subMilestone}-${index}`
                            ] = true;
                        }
                    }
                );
            });
            setCheckedItems(initialCheckedState);
        } else {
            setCheckedItems({});
        }
    }, [milestoneDetails, uploadedDocuments]);

    useEffect(() => {
        if (
            isCompletionStatusUpdated ||
            Object.keys(milestoneDetails).length === 0 ||
            !workOrderId ||
            workOrderId === WORK_ORDER_TBD ||
            workOrderId === WORK_ORDER_NA ||
            !accountId
        ) {
            return; // Don't proceed if already updated, no details, invalid work order, or no accountId
        }

        const allSubmilestonesComplete = Object.keys(milestoneDetails).every(
            (subMilestone) => {
                const items = milestoneDetails[subMilestone];
                if (!items || items.length === 0) return true; // Consider empty submilestones as complete

                const checkedCount = items.filter(
                    (_, index) => checkedItems[`${subMilestone}-${index}`]
                ).length;
                return (checkedCount / items.length) * 100 === 100;
            }
        );

        if (allSubmilestonesComplete) {
            const updateWorkOrderStatus = async () => {
                try {
                    await apiService.patch(`/work-orders/${workOrderId}/status-complete`);
                    setIsCompletionStatusUpdated(true);
                } catch (error) {
                    console.error(`Failed to update work order ${workOrderId} status to complete:`, error);
                }
            };
            updateWorkOrderStatus();
        }
    }, [milestoneDetails, checkedItems, workOrderId, accountId, isCompletionStatusUpdated]);

    const toggleSubMilestone = (subMilestone) => {
        setExpandedSubMilestones((prev) => ({
            ...prev,
            [subMilestone]: !prev[subMilestone],
        }));
    };

    const handleOpenViewer = (file) => {
        setViewingFile(file);
        setIsViewerOpen(true);
    };

    const handleCloseViewer = () => {
        setIsViewerOpen(false);
        setViewingFile(null);
    };

    const getCompletionPercentage = (subMilestone) => {
        const items = milestoneDetails[subMilestone];
        if (!items || items.length === 0) return 0;

        const checkedCount = items.filter(
            (_, index) => checkedItems[`${subMilestone}-${index}`]
        ).length;
        return Math.round((checkedCount / items.length) * 100);
    };

    const getDocumentIcon = (fileName) => {
        if (!fileName || typeof fileName !== "string") return "📁";
        const extension = fileName.split(".").pop()?.toLowerCase() || "";
        switch (extension) {
            case "pdf":
                return "📁";
            case "doc":
            case "docx":
                return "📁";
            case "xls":
            case "xlsx":
                return "📁";
            case "ppt":
            case "pptx":
                return "📁";
            case "jpg":
            case "jpeg":
            case "png":
            case "gif":
                return "📁";
            default:
                return "📁";
        }
    };

    if (isLoading) {
        return (
            <div className="p-6 text-center">
                <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-lg">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                    <span className="text-blue-700 font-medium">
                        Loading document requirements for {currentMilestone}...
                    </span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <span className="text-red-500 mr-2">⚠️</span>
                        <span className="text-red-700 font-medium">
                            Error loading documents: {error}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    if (
        (!workOrderId ||
            workOrderId === WORK_ORDER_TBD ||
            workOrderId === WORK_ORDER_NA ||
            !accountId) &&
        !isLoading &&
        !error
    ) {
        return (
            <div className="p-6">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <span className="text-amber-500 mr-2">⏳</span>
                        <span className="text-amber-700">
                            Document requirements will be available once a Work
                            Order ID is assigned for {currentMilestone}.
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    if (Object.keys(milestoneDetails).length === 0 && !isLoading) {
        return (
            <div className="p-6">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <span className="text-gray-500 mr-2">📋</span>
                        <span className="text-gray-600">
                            No document requirements found for{" "}
                            {currentMilestone}.
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-white border border-gray-200 rounded shadow-sm">
            <div className="divide-y divide-gray-200">
                {Object.keys(milestoneDetails).map((subMilestone) => {
                    const isExpanded = expandedSubMilestones[subMilestone];
                    const items = milestoneDetails[subMilestone];
                    const completion =
                        items && items.length > 0
                            ? getCompletionPercentage(subMilestone)
                            : 0;
                    return (
                        <div key={subMilestone} className="bg-white">
                            <div
                                className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() => toggleSubMilestone(subMilestone)}
                            >
                                <div className="flex items-center space-x-2">
                                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600">
                                        <span className="text-xs font-bold">
                                            {isExpanded ? "−" : "+"}
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-semibold text-gray-800 uppercase">
                                            {subMilestone}
                                        </h4>
                                        <p className="text-xs text-gray-500">
                                            {items ? items.length : 0} document
                                            {(items ? items.length : 0) !== 1
                                                ? "s"
                                                : ""}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <div
                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                            completion === 100
                                                ? "bg-green-100 text-green-800"
                                                : completion > 0
                                                ? "bg-yellow-100 text-yellow-800"
                                                : "bg-gray-100 text-gray-600"
                                        }`}
                                    >
                                        {completion === 100
                                            ? "✓"
                                            : completion > 0
                                            ? "⚠️"
                                            : "○"}{" "}
                                        {completion}%
                                    </div>
                                    <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${
                                                completion === 100
                                                    ? "bg-green-500"
                                                    : "bg-blue-500"
                                            }`}
                                            style={{ width: `${completion}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="px-2 pb-2 bg-gray-50">
                                    <div className="ml-7 space-y-1">
                                        {items.map((item, index) => {
                                            const itemKey = `${subMilestone}-${item}-${index}`;
                                            const isChecked =
                                                checkedItems[
                                                    `${subMilestone}-${index}`
                                                ];
                                            const uploadedDoc = isChecked
                                                ? uploadedDocuments.find(
                                                      (doc) =>
                                                          doc.file_title ===
                                                          item
                                                  )
                                                : null;
                                            return (
                                                <div
                                                    key={itemKey}
                                                    className={`flex items-center justify-between p-2 rounded border transition-all ${
                                                        isChecked
                                                            ? "bg-green-50 border-green-200"
                                                            : "bg-white border-gray-200"
                                                    }`}
                                                >
                                                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                                                        <span className="text-sm flex-shrink-0">
                                                            {getDocumentIcon(
                                                                uploadedDoc
                                                                    ? uploadedDoc.file_name
                                                                    : item
                                                            )}
                                                        </span>
                                                        <div className="flex-1 min-w-0">
                                                            <div
                                                                className="text-xs text-gray-800 truncate"
                                                                title={item}
                                                            >
                                                                {item}
                                                            </div>
                                                            <div
                                                                className={`text-xs font-medium flex items-center ${
                                                                    isChecked
                                                                        ? "text-green-700"
                                                                        : "text-orange-600"
                                                                }`}
                                                            >
                                                                <span className="mr-1">
                                                                    {isChecked
                                                                        ? "✓"
                                                                        : "⚠️"}
                                                                </span>
                                                                {isChecked
                                                                    ? "Document Uploaded"
                                                                    : "Document Required"}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {uploadedDoc && (
                                                        <div className="flex-shrink-0 ml-3">
                                                            <button
                                                                type="button"
                                                                title={`View ${
                                                                    uploadedDoc.file_name ||
                                                                    item
                                                                }`}
                                                                className="inline-flex items-center px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200"
                                                                onClick={(
                                                                    e
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    handleOpenViewer(
                                                                        uploadedDoc
                                                                    );
                                                                }}
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    strokeWidth={
                                                                        1.5
                                                                    }
                                                                    stroke="currentColor"
                                                                    className="w-3 h-3 mr-1"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                                                                    />
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                                                    />
                                                                </svg>
                                                                View Document
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            {isViewerOpen && viewingFile && (
                <FileViewerModal
                    isOpen={isViewerOpen}
                    onClose={handleCloseViewer}
                    file={viewingFile}
                />
            )}
        </div>
    );
};

export default Dropdown;

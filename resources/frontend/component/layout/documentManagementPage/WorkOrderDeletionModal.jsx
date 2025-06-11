import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import Profile from "../../../../../public/Images/Profile2.svg";
import IconNotes from "../../../../../public/Images/Icon_Notes.svg";
import Attachment from "../../../../../public/Images/ATTCHMT.svg";
import CheckmarkIcon from '../../../../../public/Images/round_check.svg';

export default function WorkOrderDeletionModal({
    isOpen,
    onClose,
    onSubmit,
    workOrderName,
    isDeleting,
    workOrderDetails,
}) {
    const [reason, setReason] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);


    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            document.addEventListener("keydown", handleEsc);
        }
        return () => {
            document.removeEventListener("keydown", handleEsc);
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) {
            setIsSubmitted(false);
            setReason("");
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        if (isDeleting) return;

        try {
            await onSubmit(reason);
            setIsSubmitted(true); 
        } catch (error) {
            console.error("Error during submission in modal:", error);
        }
    };

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-[10px] shadow-xl w-[630px] max-w-2xl max-h-[90vh] overflow-y-auto relative"
                onClick={(e) => e.stopPropagation()} 
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold focus:outline-none"
                    aria-label="Close"
                >
                    ×
                </button>

                {isSubmitted ? (
                    <div className="p-8 text-center">
                        <img
                            src={CheckmarkIcon}
                            alt="Success"
                            className="mx-auto mb-4 w-16 h-16" 
                        />
                        <p className="text-xl mb-8">
                            Your Work Order <span className="text-red-600">deletion request</span> has been submitted for approval.
                        </p>
                        <button
                            onClick={onClose}
                            className="bg-custom-bluegreen hover:bg-opacity-90 text-white px-8 py-2.5 rounded-md font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-custom-bluegreen focus:ring-offset-2"
                        >
                            OK
                        </button>
                    </div>
                ) : (
                    <div className="p-8">
                        <h2 className="text-red-500 font-normal text-base mb-0">
                            Deletion Request
                        </h2>

                        <h3 className="text-2xl font-semibold text-custom-bluegreen mb-1">
                            Work Order:{" "}
                            <span className="font-normal">
                                {workOrderName || "N/A"}
                            </span>
                        </h3>

                        {workOrderDetails?.work_order_id && (
                            <div className="mb-2">
                                <span className="bg-[#067AC5] text-white px-5 py-1 rounded-3xl text-xs font-normal">
                                    Order No. {workOrderDetails.work_order_id}
                                </span>
                            </div>
                        )}

                        <div className="flex justify-between items-center text-sm mb-2 pb-3 border-b">
                            <div>
                                <span className="text-custom-bluegreen font-semibold text-base">
                                    Date Created:{" "}
                                </span>
                                <span className="text-custom-bluegreen font-normal text-base">
                                    {workOrderDetails?.created_at
                                        ? new Date(
                                              workOrderDetails.created_at
                                          ).toLocaleDateString("en-GB", {
                                              day: "2-digit",
                                              month: "short",
                                              year: "numeric",
                                          })
                                          .replace(/ /g, "-")
                                        : "N/A"}
                                </span>
                            </div>
                            <div className="flex items-center">
                                <span className="text-custom-bluegreen font-semibold text-base">
                                    Due Date:{" "}
                                </span>
                                <span
                                    className={`font-normal text-base ml-1 ${
                                        workOrderDetails?.work_order_deadline &&
                                        new Date(workOrderDetails.work_order_deadline) < new Date() &&
                                        workOrderDetails.status?.toLowerCase() !== "completed"
                                            ? "text-orange-500" 
                                            : "text-custom-bluegreen"
                                    }`}
                                >
                                    {workOrderDetails?.work_order_deadline
                                        ? new Date(
                                              workOrderDetails.work_order_deadline
                                          ).toLocaleDateString("en-GB", {
                                              day: "2-digit",
                                              month: "short",
                                              year: "numeric",
                                          })
                                          .replace(/ /g, "-")
                                        : "N/A"}
                                </span>
                                {workOrderDetails?.work_order_deadline &&
                                    new Date(workOrderDetails.work_order_deadline) <
                                        new Date() &&
                                    workOrderDetails.status?.toLowerCase() !==
                                        "completed" && (
                                        <span className="ml-1 text-orange-500">
                                            ⚠️
                                        </span>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 mb-6">
                            <div className="space-y-4">
                                {/* Assignee Row */}
                                <div className="flex items-center mb-2">
                                    <span className="text-custom-bluegreen font-semibold text-sm mr-2 min-w-[70px]">
                                        Assignee
                                    </span>
                                    {workOrderDetails?.assignee?.fullname ? (
                                        <div className="flex items-center">
                                            <img
                                                src={Profile}
                                                alt="Assignee"
                                                className="w-6 h-6 mr-2"
                                            />
                                            <span className="text-custom-bluegreen font-normal text-sm">
                                                {workOrderDetails.assignee.fullname}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center">
                                            <img
                                                src={Profile}
                                                alt="Assignee"
                                                className="w-6 h-6 mr-2 opacity-50"
                                            />
                                            <span className="text-gray-500 italic">
                                                N/A
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Status Row */}
                                <div className="flex items-center">
                                    <span className="text-gray-600 font-semibold text-sm mr-2 min-w-[70px]">
                                        Status
                                    </span>
                                    <div>
                                        {workOrderDetails?.status ? (
                                            <span
                                                className={`px-3 py-1 rounded-[10px] text-sm font-medium ${
                                                    workOrderDetails.status.toLowerCase() ===
                                                    "in progress"
                                                        ? "bg-green-100 text-green-700"
                                                        : workOrderDetails.status.toLowerCase() ===
                                                          "completed"
                                                        ? "bg-green-100 text-green-800"
                                                        : workOrderDetails.status.toLowerCase() ===
                                                          "pending"
                                                        ? "bg-[#F5F4DC] text-custom-bluegreen font-normal text-xs"
                                                        : "bg-gray-100 text-gray-800"
                                                }`}
                                            >
                                                {workOrderDetails.status}
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 rounded text-sm font-medium bg-green-100 text-green-700">
                                                In Progress
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center text-green-600 hover:text-green-700 cursor-pointer">
                                    <img
                                        src={Attachment}
                                        alt="View Files"
                                        className="w-[18px] h-[18px] mr-2"
                                    />
                                    <span className="text-sm underline">
                                        View Files
                                    </span>
                                </div>
                                <div className="flex items-center text-green-600 hover:text-green-700 cursor-pointer">
                                    <img
                                        src={IconNotes}
                                        alt="View Notes"
                                        className="w-[15px] h-[18px] mr-2"
                                    />
                                    <span className="text-sm underline">
                                        View Notes
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <p className="text-gray-700 text-sm">
                                You are requesting for{" "}
                                <span className="text-red-500 font-semibold">
                                    Work Order Deletion
                                </span>
                                . Kindly state your reason or grounds for the
                                request below:{" "}
                                <span className="text-red-500">*</span>
                            </p>
                        </div>

                        <div className="mb-6">
                            <textarea
                                rows="6"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                                placeholder="Enter reason for deletion..."
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={handleSubmit}
                                className={`bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition font-medium ${
                                    isDeleting // This prop comes from parent, indicates API call in progress
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                }`}
                                disabled={isDeleting}
                            >
                                {isDeleting ? "Submitting..." : "Submit Request"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}

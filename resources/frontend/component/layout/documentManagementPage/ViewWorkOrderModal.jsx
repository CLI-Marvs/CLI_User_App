import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { FaStickyNote, FaTrashAlt, FaEdit } from "react-icons/fa";
import Profile from "../../../../../public/Images/Profile2.svg";
import IconNotes from "../../../../../public/Images/Icon_Notes.svg";
import Attachment from "../../../../../public/Images/ATTCHMT.svg";
import Trashcan from "../../../../../public/Images/delete_icon.svg";
import Pen from "../../../../../public/Images/pen_icon.svg";
import NotesAndUpdatesModal from "./NotesAndUpdatesModal";

const PersonIcon = () => (
    <img
        src={Profile}
        alt="Person Icon"
        className="h-6 w-6 text-custom-solidgreen"
    />
);

const PenIcon = () => (
    <img src={Pen} alt="Pen Icon" className="h-4 w-4 text-custom-solidgreen" />
);

const DeleteIcon = () => (
    <img
        src={Trashcan}
        alt="Delete Icon"
        className="h-6 w-6 text-custom-solidgreen"
    />
);

const DocumentIcon = () => (
    <img
        src={IconNotes}
        alt="Document Icon"
        className="h-[18px] w-[15px] text-gray-600"
    />
);
const LinkIcon = () => (
    <img
        src={Attachment}
        alt="Link Icon"
        className="h-[18px] w-[18px] text-gray-600"
    />
);

const ViewWorkOrderModal = ({ isOpen, onClose, workOrderData }) => {
    const [mounted, setMounted] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAccountId, setSelectedAccountId] = useState(null);
    const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
    const [selectedAssignee, setSelectedAssignee] = useState(null);

    const handleRowClick = (accountId) => {
        setIsModalOpen(true);
        setSelectedAccountId(accountId);
        setSelectedWorkOrder(workOrderData.work_order);
        setSelectedAssignee(workOrderData.assignee);
    };

    useEffect(() => {
        setMounted(true);
        document.body.style.overflow = isOpen ? "hidden" : "unset";
        return () => {
            document.body.style.overflow = "unset";
            setMounted(false);
        };
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape" && isOpen) onClose();
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen || !mounted || !workOrderData) return null;

    return ReactDOM.createPortal(
        <div
            className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-[10px] shadow-xl w-full max-w-[521px] max-h-[90vh] overflow-y-auto p-6 relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="mb-4 pb-3">
                    <h2 className="text-2xl font-semibold text-custom-bluegreen">
                        Work Order:{" "}
                        <span className="text-custom-lightgreen font-normal text-2xl">
                            {workOrderData.work_order}
                        </span>
                    </h2>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold focus:outline-none"
                        aria-label="Close"
                    >
                        ×
                    </button>
                    <div className="mt-1 bg-gradient-to-r from-custom-lightgreen to-custom-lightblue text-white font-normal text-xs inline-block px-5 py-1 rounded-full">
                        Order No. {workOrderData.work_order_id}
                    </div>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-4 border-b border-solid pb-4">
                    <p>
                        <span className="font-semibold text-base text-custom-bluegreen">
                            Date Created:
                        </span>
                        <span className="font-normal text-base text-custom-bluegreen ml-1">
                            {" "}
                            {new Date(
                                workOrderData.created_at
                            ).toLocaleDateString()}
                        </span>
                    </p>
                    <p>
                        <span className="font-semibold text-base text-custom-bluegreen">
                            Due Date:
                        </span>
                        <span className="text-orange-600 text-base font-normal ml-2">
                            {new Date(
                                workOrderData.work_order_deadline
                            ).toLocaleDateString()}{" "}
                            ⚠️
                        </span>
                    </p>
                    <p className="flex items-center gap-1">
                        <span className="font-semibold text-base text-custom-bluegreen">
                            Assignee:
                        </span>
                        <PersonIcon />
                        <span className="font-normal text-sm text-custom-bluegreen">
                            {workOrderData.assignee?.fullname || "N/A"}
                        </span>
                    </p>
                    <p>
                        <span className="font-semibold text-base text-custom-bluegreen">
                            Status:
                        </span>
                        <span
                            className={`ml-2 px-3 py-1 rounded-full text-xs
                                ${
                                    workOrderData.status === "In Progress" ||
                                    workOrderData.status === "Pending"
                                        ? "bg-[#F5F4DC] text-custom-bluegreen text-sm font-normal"
                                        : ""
                                }
                                ${
                                    workOrderData.status === "Completed"
                                        ? "bg-custom-bluegreen text-white"
                                        : ""
                                }
                            `}
                        >
                            {workOrderData.status}
                        </span>
                    </p>
                </div>

                {/* Accounts Table */}
                <div className="border rounded-lg overflow-hidden mb-6">
                    <div className="grid grid-cols-12 bg-gradient-to-r from-custom-lightgreen to-custom-lightblue text-white font-semibold px-4 py-2 text-base">
                        <div className="col-span-4 flex items-center">
                            Account Name
                        </div>
                        <div className="col-span-3 flex items-center justify-center">
                            Status
                        </div>
                        <div className="col-span-2 flex items-center justify-center">
                            Notes
                        </div>
                        <div className="col-span-3 flex items-center justify-center">
                            Files
                        </div>
                    </div>
                    {workOrderData.accounts?.map((account) => (
                        <div
                            key={account.id}
                            className="grid grid-cols-12 items-center px-4 py-3 border-t text-base font-normal text-custom-bluegreen"
                        >
                            <div className="col-span-4">
                                <div>{account.account_name}</div>
                                <div className="text-base font-normal text-custom-bluegreen">
                                    {account.id}
                                </div>
                            </div>
                            <div className="col-span-3 flex justify-center">
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-normal
                                    ${
                                        workOrderData.status ===
                                            "In Progress" ||
                                        workOrderData.status === "Pending"
                                            ? "bg-[#F5F4DC] text-custom-bluegreen text-sm font-normal"
                                            : ""
                                    }
                                    ${
                                        workOrderData.status === "Completed"
                                            ? "bg-custom-bluegreen text-white"
                                            : ""
                                    }
                                `}
                                >
                                    In Progress
                                </span>
                            </div>
                            <div className="col-span-2 flex justify-center">
                                <button onClick={(e) => { e.stopPropagation(); handleRowClick(account.id); }}>
                                    <DocumentIcon />
                                </button>
                            </div>
                            <div className="col-span-3 flex justify-center">
                                <LinkIcon />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer buttons */}
                <div className="flex justify-end space-x-3 mt-4">
                    <button className="text-red-500 hover:text-red-700">
                        <DeleteIcon />
                    </button>
                    <button className="bg-green-600 text-white gap-2 gradient-btn5 px-4 py-2 rounded-[10px] hover:bg-green-700 flex items-center">
                        <PenIcon className="mr-2" />
                        Edit
                    </button>
                </div>

                {/* Modal for Notes and Updates - rendered once, outside the loop */}
                {isModalOpen && selectedAccountId && (
                    <NotesAndUpdatesModal
                        workOrderData={workOrderData}
                        selectedAccountId={selectedAccountId}
                        selectedWorkOrder={selectedWorkOrder}
                        selectedAssignee={selectedAssignee}
                        onClose={() => {
                            setIsModalOpen(false);
                            setSelectedAccountId(null);
                        }}
                    />
                )}
            </div>
        </div>,
        document.body
    );
};

export default ViewWorkOrderModal;

import React, { useState, useEffect } from "react";
import Profile from "../../../../../public/Images/Profile2.svg";
import IconNotes from "../../../../../public/Images/Icon_Notes.svg";
import Attachment from "../../../../../public/Images/ATTCHMT.svg";
import apiService from "../../../component/servicesApi/apiService";
import Dropdown from "../../../../../resources/frontend/component/layout/documentManagementPage/TableMonitoringDropdown";
import TitlingStepNotesModal from "./TitlingStepNotesModal"; // Import the new modal
import { motion } from "framer-motion";

const PersonIcon = () => (
    <img src={Profile} alt="Person Icon" className="h-6 w-6 text-gray-600" />
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
function getDaysUntilDue(dueDate) {
    const today = new Date();
    const dueDateObj = new Date(dueDate);
    const todayMidnight = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );
    const dueDateMidnight = new Date(
        dueDateObj.getFullYear(),
        dueDateObj.getMonth(),
        dueDateObj.getDate()
    );
    const diffInMs = dueDateMidnight.getTime() - todayMidnight.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    return diffInDays;
}

export default function TitlingAndRegistrationMonitor({
    onClose,
    user,
    contractNumber,
    propertyName,
    unitNumber,
}) {
    const [monitoringData, setMonitoringData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRow, setSelectedRow] = useState(null);
    // State for the new Titling Step Notes Modal
    const [isTitlingStepNotesModalOpen, setIsTitlingStepNotesModalOpen] = useState(false);
    const [selectedItemForTitlingNotes, setSelectedItemForTitlingNotes] = useState(null);


    const TITLING_PROCESS_STEPS = [
        "Docketing",
        "DOA",
        "Transfer Tax Payment",
        "BIR Submission",
        "eCAR Release",
        "Registry of Deeds Submission",
        "Certificate of Title Release",
        "Local Assessor Submission",
        "Tax Declaration Release",
        "Submission to Financial Institution",
    ];

    useEffect(() => {
        const fetchMonitoringData = async (contractNumber) => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await apiService.get(
                    `/titling-registration/monitor/${contractNumber}`
                );
                const data = response.data;
                if (!Array.isArray(data)) {
                    throw new Error(
                        "Unexpected API response: expected an array in response.data"
                    );
                }

                const transformedData = data.map((item) => ({
                    step: item.stepName,
                    workOrderId: item.workOrderId || "TBD",
                    assignee: item.assigneeName
                        ? { name: item.assigneeName }
                        : null,
                    status: item.status || "Unassigned",
                    dueDate: item.dueDate || "TBD",
                    hasNotes: item.notesCount > 0,
                    hasFiles: item.filesCount > 0,
                }));

                setMonitoringData(transformedData);
            } catch (err) {
                console.error(
                    "Failed to fetch titling and registration data:",
                    err
                );
                setError(
                    err.message ||
                        "Failed to load data. Please try again later."
                );
                setMonitoringData([]);
            } finally {
                setIsLoading(false);
            }
        };

        if (contractNumber) {
            fetchMonitoringData(contractNumber);
        } else {
            setError(
                "Contract number is missing. Cannot load monitoring data."
            );
            setIsLoading(false);
            setMonitoringData(
                TITLING_PROCESS_STEPS.map((stepName) => ({
                    step: stepName,
                    workOrderId: "N/A",
                    assignee: null,
                    status: "N/A",
                    dueDate: "N/A",
                    hasNotes: false,
                    hasFiles: false,
                }))
            );
        }
    }, [contractNumber]);

    const handleOpenTitlingStepNotesModal = (item) => {
        setSelectedItemForTitlingNotes(item);
        setIsTitlingStepNotesModalOpen(true);
    };

    const handleCloseTitlingStepNotesModal = () => {
        setIsTitlingStepNotesModalOpen(false);
        setSelectedItemForTitlingNotes(null);
    };


    if (isLoading) {
        return (
            <div className="w-full p-8 text-center text-lg bg-white rounded-lg shadow-lg">
                Loading Titling and Registration Data...
            </div>
        );
    }

    return (
        <div className="bg-white w-full rounded-lg shadow-lg overflow-hidden">
            <div className="bg-[#175D5F] text-white p-4 flex justify-center items-center relative">
                {" "}
                <button
                    onClick={onClose}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-sm font-semibold py-1 px-3 rounded border border-white hover:bg-white hover:text-[#175D5F] transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                >
                    &larr; Back
                </button>
                <h2 className="text-lg font-semibold">
                    Titling and Registration Monitoring
                </h2>
            </div>
            {error && (
                <div className="p-4 bg-red-100 text-red-700 text-center">
                    <p>
                        <strong>Error:</strong> {error}
                    </p>
                    <p>
                        Please use the 'Back' button and try again. If the issue
                        persists, contact support.
                    </p>
                </div>
            )}

            <div className="h-[500px] overflow-y-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-[#5B9BD5] text-white text-left">
                            <th className="p-2 text-center"> </th>
                            <th className="p-2">Work Order No.</th>
                            <th className="p-2 text-center">Assignee</th>
                            <th className="p-2 text-center">Status</th>
                            <th className="p-2 text-center">Due Date</th>
                            <th className="p-2 text-center">Notes</th>
                            <th className="p-2 text-center">Files</th>
                        </tr>
                    </thead>
                    <tbody>
                        {monitoringData.map((item, index) => {
                            const isSelected = index === selectedRow;

                            return (
                                <React.Fragment
                                    key={`row-${item.workOrderId || index}`}
                                >
                                    <tr
                                        className={`hover:bg-gray-50 cursor-pointer ${
                                            isSelected
                                                ? "bg-gray-100"
                                                : "border-b border-gray-200"
                                        }`}
                                        onClick={() =>
                                            setSelectedRow(
                                                isSelected ? null : index
                                            )
                                        }
                                    >
                                        <td className="p-2 text-base text-[#175D5F] font-semibold pl-10">
                                            {item.step}
                                        </td>
                                        <td className="p-2 text-base font-normal text-[#A5A5A5]">
                                            {item.workOrderId}
                                        </td>
                                        <td className="p-2 text-sm text-gray-700 align-middle">
                                            <div className="flex items-center gap-1">
                                                {item.assignee ? (
                                                    <>
                                                        <PersonIcon className="w-4 h-4 text-gray-600" />
                                                        <span>
                                                            {item.assignee
                                                                .name ||
                                                                item.assignee}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                                        <PersonIcon className="w-4 h-4 text-gray-400" />
                                                        TBD
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-2 text-center align-middle">
                                            <span
                                                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                                    item.status === "Completed"
                                                        ? "bg-green-200 text-green-800"
                                                        : item.status ===
                                                          "In Progress"
                                                        ? "bg-blue-200 text-blue-800"
                                                        : item.status ===
                                                          "On Hold"
                                                        ? "bg-red-200 text-red-800"
                                                        : item.status ===
                                                          "Pending"
                                                        ? "bg-yellow-200 text-yellow-800"
                                                        : "bg-gray-200 text-gray-800"
                                                }`}
                                            >
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="pl-16 align-middle text-base font-normal text-gray-700">
                                            {item.dueDate ? (
                                                <div>
                                                    <span>{item.dueDate}</span>
                                                    <br />
                                                    {getDaysUntilDue(
                                                        item.dueDate
                                                    ) < 0 ? (
                                                        <span className="text-red-500 text-xs">
                                                            Overdue by{" "}
                                                            {Math.abs(
                                                                getDaysUntilDue(
                                                                    item.dueDate
                                                                )
                                                            )}{" "}
                                                            Days❗
                                                        </span>
                                                    ) : getDaysUntilDue(
                                                          item.dueDate
                                                      ) <= 5 &&
                                                      getDaysUntilDue(
                                                          item.dueDate
                                                      ) !== 0 ? (
                                                        <span className="text-yellow-500 text-xs">
                                                            Due in{" "}
                                                            {getDaysUntilDue(
                                                                item.dueDate
                                                            )}{" "}
                                                            Days⚠️
                                                        </span>
                                                    ) : null}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-500">
                                                    TBD
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-2 text-center align-middle">
                                            {item.hasNotes ? (
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenTitlingStepNotesModal(item)}
                                                    className="bg-transparent border-none p-0 m-0 cursor-pointer hover:opacity-75 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
                                                    aria-label={`View notes for step ${item.step}`}
                                                >
                                                    <DocumentIcon />
                                                </button>
                                            ) : (
                                                "-"
                                            )}
                                        </td>
                                        <td className="p-2 text-center align-middle">
                                            {item.hasFiles ? <LinkIcon /> : "-"}
                                        </td>
                                    </tr>
                                    {isSelected && (
                                        <tr className="bg-white">
                                            <td
                                                colSpan={7}
                                                className="p-0 border-b border-gray-200"
                                            >
                                                <motion.div
                                                    key={`dropdown-content-${index}`}
                                                    initial={{
                                                        height: 0,
                                                        opacity: 0,
                                                    }}
                                                    animate={{
                                                        height: "auto",
                                                        opacity: 1,
                                                    }}
                                                    exit={{
                                                        height: 0,
                                                        opacity: 0,
                                                    }}
                                                    transition={{
                                                        duration: 0.25,
                                                        ease: "easeInOut",
                                                    }}
                                                    style={{
                                                        overflow: "hidden",
                                                    }}
                                                >
                                                    <div className="p-4">
                                                        <Dropdown />
                                                    </div>
                                                </motion.div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {isTitlingStepNotesModalOpen && selectedItemForTitlingNotes && (
                <TitlingStepNotesModal
                    isOpen={isTitlingStepNotesModalOpen}
                    onClose={handleCloseTitlingStepNotesModal}
                    contractNumber={contractNumber} // Account identifier
                    workOrderId={selectedItemForTitlingNotes.workOrderId}
                    stepName={selectedItemForTitlingNotes.step}
                    // title prop can be customized if needed, or rely on default in modal
                />
            )}

            <div className="bg-[#175D5F] text-white p-4 text-sm">
                <div className="flex justify-between">
                    <div>
                        <span className="font-semibold text-sm">
                            Account Name:
                        </span>{" "}
                        <span className="font-normal text-sm">
                            &nbsp;{user}
                        </span>
                    </div>
                    <div>
                        <span className="font-semibold text-sm">
                            Property Details:
                        </span>
                        <span className="font-normal text-sm">
                            &nbsp;&nbsp;{contractNumber}
                            &nbsp;&nbsp;|&nbsp;&nbsp;{propertyName}
                            &nbsp;&nbsp;|&nbsp;&nbsp;{unitNumber}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

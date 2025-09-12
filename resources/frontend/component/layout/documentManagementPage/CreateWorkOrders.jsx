import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import ReactDOM from "react-dom";
import apiService from "../../../component/servicesApi/apiService";
import { useStateContext } from "../../../context/contextprovider";
import { useDocumentManagementContext } from "../../../context/DocumentManagement/DocumentManagementContext";
import DatePicker from "react-datepicker";
import SearchableDropdown from "./SearchableDropdown";
import WorkOrderCreatedModal from "./WorkOrderCreatedModal";

const CreateWorkOrderModal = ({ isOpen, onClose, onCreateWorkOrder }) => {
    const [selectedAccounts, setSelectedAccounts] = useState([]);
    const [selectedProject, setSelectedProject] = useState("");
    const [dueDate, setDueDate] = useState("");
    const modalRef = useRef();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [workOrderId, setWorkOrderId] = useState(null);
    const [projectMilestoneStructure, setProjectMilestoneStructure] = useState(
        []
    );

    // New state for modern dropdowns
    const [projectSearchTerm, setProjectSearchTerm] = useState("");
    const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
    const [accountSearchTerm, setAccountSearchTerm] = useState("");
    const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);

    const { user } = useStateContext();
    const { accounts, workOrderTypes, fetchWorkOrderGroups } =
        useDocumentManagementContext();

    useEffect(() => {
        // Since accounts and workOrderTypes are managed by DocumentManagementContext,
        // we don't need to fetch them separately here
    }, []);

    useEffect(() => {
        if (selectedProject) {
            apiService
                .get(
                    `/projects/${encodeURIComponent(
                        selectedProject
                    )}/milestone-structure`
                )
                .then((res) => {
                    setProjectMilestoneStructure(res.data || []);
                })
                .catch((err) => {
                    console.error(
                        "Failed to fetch project milestone structure:",
                        err
                    );
                    setProjectMilestoneStructure([]);
                });
        } else {
            setProjectMilestoneStructure([]);
        }
    }, [selectedProject]);

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === "Escape" && isOpen) {
                onClose();
            }
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!isOpen) {
            setSelectedAccounts([]);
            setSelectedProject("");
            setDueDate("");
            setProjectSearchTerm("");
            setAccountSearchTerm("");
            setIsProjectDropdownOpen(false);
            setIsAccountDropdownOpen(false);
        }
    }, [isOpen]);

    const firstWorkOrderType = useMemo(() => {
        if (!workOrderTypes || workOrderTypes.length === 0) {
            return null;
        }
        return workOrderTypes[0];
    }, [workOrderTypes]);

    const projects = useMemo(() => {
        if (!accounts) return [];
        const projectNames = accounts
            .map((acc) => acc.property_name)
            .filter(Boolean);
        return [...new Set(projectNames)].sort();
    }, [accounts]);

    const filteredAccounts = useMemo(() => {
        if (!selectedProject) {
            return accounts;
        }
        return accounts.filter(
            (account) => account.property_name === selectedProject
        );
    }, [accounts, selectedProject]);

    // Helper functions for modern dropdowns
    const selectedProjectDetails = useMemo(() => {
        return projects.find((p) => p === selectedProject) || null;
    }, [selectedProject, projects]);

    const filteredProjects = projects.filter(
        (project) =>
            project &&
            project.toLowerCase().includes(projectSearchTerm.toLowerCase())
    );

    const filteredAccountsForDropdown = filteredAccounts.filter(
        (account) =>
            account.account_name &&
            account.account_name
                .toLowerCase()
                .includes(accountSearchTerm.toLowerCase())
    );

    const handleProjectToggle = useCallback((projectName) => {
        setSelectedProject((prev) => (prev === projectName ? "" : projectName));
        setSelectedAccounts([]); // Clear accounts when project changes
        setIsProjectDropdownOpen(false);
        setProjectSearchTerm("");
    }, []);

    const handleAccountToggle = useCallback((account) => {
        setSelectedAccounts((prev) => {
            const exists = prev.find((acc) => acc.id === account.id);
            if (exists) {
                return prev.filter((acc) => acc.id !== account.id);
            } else {
                return [...prev, account];
            }
        });
    }, []);

    const handleRemoveAccount = useCallback((accountId) => {
        setSelectedAccounts((prev) =>
            prev.filter((acc) => acc.id !== accountId)
        );
    }, []);

    const handleSelectAllAccounts = useCallback(() => {
        setSelectedAccounts(filteredAccountsForDropdown);
        setIsAccountDropdownOpen(false);
    }, [filteredAccountsForDropdown]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Validation: Check if required data exists
        if (
            !firstWorkOrderType ||
            !firstWorkOrderType.id ||
            !firstWorkOrderType.type_name
        ) {
            alert(
                "Work order type is not available. Please refresh the page and try again."
            );
            return;
        }

        if (!user || !user.id) {
            alert("User information is not available. Please log in again.");
            return;
        }

        if (selectedAccounts.length === 0) {
            alert("Please select at least one account to create a work order.");
            return;
        }

        // Validate selectedAccounts have proper structure
        const invalidAccounts = selectedAccounts.filter(
            (account) => !account || !account.id
        );
        if (invalidAccounts.length > 0) {
            alert(
                "Some selected accounts are invalid. Please reselect your accounts."
            );
            return;
        }

        let formattedDueDate = null;
        if (dueDate) {
            // Format as local date string (YYYY-MM-DD)
            const year = dueDate.getFullYear();
            const month = String(dueDate.getMonth() + 1).padStart(2, "0");
            const day = String(dueDate.getDate()).padStart(2, "0");
            formattedDueDate = `${year}-${month}-${day}`;
        }

        if (
            !projectMilestoneStructure ||
            projectMilestoneStructure.length === 0
        ) {
            alert(
                "The selected project has no assigned employees. Please assign employees to this project first."
            );
            return;
        }

        // Get all assignees from all milestones
        const allProjectAssignees = [];
        projectMilestoneStructure.forEach((step) => {
            if (step.milestones && Array.isArray(step.milestones)) {
                step.milestones.forEach((milestone) => {
                    if (
                        milestone.assignees &&
                        Array.isArray(milestone.assignees)
                    ) {
                        milestone.assignees.forEach((assignee) => {
                            if (
                                assignee &&
                                assignee.id &&
                                assignee.full_name &&
                                !allProjectAssignees.find(
                                    (emp) => emp.id === assignee.id
                                )
                            ) {
                                allProjectAssignees.push(assignee);
                            }
                        });
                    }
                });
            }
        });

        if (allProjectAssignees.length === 0) {
            alert(
                "The selected project has no assigned employees. Please assign employees to this project first."
            );
            return;
        }

        // Assign each account to a project assignee in ascending order (round-robin)
        const accountAssignments = selectedAccounts
            .map((account, idx) => {
                const assignee =
                    allProjectAssignees[idx % allProjectAssignees.length];
                if (!assignee || !assignee.id || !account || !account.id) {
                    return null; // Mark invalid assignments
                }
                return {
                    account_id: account.id,
                    employee_id: assignee.id,
                };
            })
            .filter((assignment) => assignment !== null); // Remove invalid assignments

        if (accountAssignments.length !== selectedAccounts.length) {
            alert(
                "Some accounts could not be assigned to employees due to data issues. Please try again."
            );
            return;
        }

        if (accountAssignments.some((a) => !a.employee_id || !a.account_id)) {
            alert("One or more accounts could not be assigned to an employee.");
            return;
        }

        const formData = {
            work_order: firstWorkOrderType.type_name,
            account_ids: selectedAccounts
                .map((account) => account.id)
                .filter((id) => id), // Filter out null/undefined IDs
            work_order_type_id: firstWorkOrderType.id,
            work_order_deadline: formattedDueDate,
            status: "In Progress",
            description: "",
            priority: "Medium",
            created_by_user_id: user.id,
            account_assignments: accountAssignments,
        };

        console.log("Submitting form data:", formData); // Debug log for production

        try {
            const response = await apiService.post(
                "/work-orders/create-work-order",
                formData
            );

            if (response.status === 201) {
                const newWorkOrderId = response.data.data.work_order_id;
                const workOrderGroupId = response.data.data.work_order_group_id;
                setWorkOrderId(workOrderGroupId || newWorkOrderId);
                setIsModalOpen(true);
                if (fetchWorkOrderGroups) {
                    fetchWorkOrderGroups();
                }

                if (response.status === 201) {
                    const newWorkOrderId = response.data.data.work_order_id;
                    const workOrderGroupId =
                        response.data.data.work_order_group_id;
                    setWorkOrderId(workOrderGroupId || newWorkOrderId);
                    setIsModalOpen(true);
                    if (fetchWorkOrderGroups) {
                        fetchWorkOrderGroups();
                    }

                    // LOG FEATURE: Create a log entry for the new work order
                    const logData = {
                        work_order_id: newWorkOrderId,
                        log_type: firstWorkOrderType?.type_name,
                        log_message: `Work Order #${newWorkOrderId} created.`,
                        account_ids: selectedAccounts.map(
                            (account) => account.id
                        ),
                        created_by_user_id: user.id,
                    };

                    try {
                        const logResponse = await apiService.post(
                            "/work-order-logs",
                            logData
                        );
                        if (
                            logResponse.status === 201 ||
                            logResponse.data?.message ===
                                "Log created successfully."
                        ) {
                            // Optionally handle log success
                        } else {
                            console.error(
                                "Error creating work order log:",
                                logResponse
                            );
                        }
                    } catch (logError) {
                        console.error(
                            "Exception while creating work order log:",
                            logError
                        );
                    }
                }
            } else {
                console.error(
                    "Error creating work order:",
                    response.error ||
                        response.message ||
                        response ||
                        "Unknown error"
                );
            }
        } catch (error) {
            console.error("Error creating work order:", error.message || error);
        }

        return true; // Always return true, even if the work order creation fails
    };

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-[1000] p-4"
            onClick={onClose}
        >
            {!isModalOpen ? (
                <div
                    ref={modalRef}
                    className="bg-white rounded-lg shadow-xl p-6 w-full max-w-[700px] transform transition-all duration-300 ease-out scale-100 opacity-100"
                    onClick={(e) => e.stopPropagation()}
                >
                    <>
                        <div className="flex justify-between items-center pb-4 border-b border-gray-200 font-semibold text-2xl">
                            <h2 className="text-2xl font-semibold text-custom-bluegreen">
                                Create Work Order
                            </h2>
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-gray-700 text-3xl leading-none font-bold"
                            >
                                &times;
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="mt-6 space-y-4"
                        >
                            <div className="flex items-center mb-2 justify-between">
                                <label
                                    htmlFor="project-filter"
                                    className="block text-sm ml-4 font-semibold text-custom-bluegreen w-1/4"
                                >
                                    Filter by Project:
                                </label>
                                <div className="w-2/3">
                                    <div className="relative">
                                        {!selectedProjectDetails && (
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg
                                                    className="h-4 w-4 text-gray-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                                    />
                                                </svg>
                                            </div>
                                        )}

                                        {/* Selected Project Tag inside input */}
                                        {selectedProjectDetails && (
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-custom-lightestgreen border text-custom-solidgreen shadow-sm">
                                                    <span className="mr-1">
                                                        {selectedProjectDetails}
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            handleProjectToggle(
                                                                selectedProjectDetails
                                                            )
                                                        }
                                                        className="text-custom-solidgreen hover:text-red-600 transition-colors duration-200 pointer-events-auto"
                                                    >
                                                        <svg
                                                            className="w-3 h-3"
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <input
                                            type="text"
                                            placeholder={
                                                selectedProjectDetails
                                                    ? ""
                                                    : "Search for a project..."
                                            }
                                            value={projectSearchTerm}
                                            onChange={(e) =>
                                                setProjectSearchTerm(
                                                    e.target.value
                                                )
                                            }
                                            onFocus={() =>
                                                setIsProjectDropdownOpen(true)
                                            }
                                            className={`w-full pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm ${
                                                selectedProjectDetails
                                                    ? "pl-32"
                                                    : "pl-10"
                                            }`}
                                            style={{
                                                paddingLeft:
                                                    selectedProjectDetails
                                                        ? `${
                                                              selectedProjectDetails.length *
                                                                  8 +
                                                              60
                                                          }px`
                                                        : "40px",
                                            }}
                                        />
                                        {projectSearchTerm && (
                                            <button
                                                onClick={() => {
                                                    setProjectSearchTerm("");
                                                    setIsProjectDropdownOpen(
                                                        false
                                                    );
                                                }}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                            >
                                                <svg
                                                    className="h-4 w-4"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        )}
                                    </div>

                                    {isProjectDropdownOpen && (
                                        <div className="relative">
                                            <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden mt-1">
                                                <div className="sticky top-0 bg-gray-50 px-4 py-2 border-b border-gray-200">
                                                    <p className="text-sm font-medium text-gray-700">
                                                        Select Project (
                                                        {
                                                            filteredProjects.length
                                                        }{" "}
                                                        available)
                                                    </p>
                                                </div>
                                                <div className="overflow-y-auto max-h-48">
                                                    {filteredProjects.length ===
                                                    0 ? (
                                                        <div className="px-4 py-6 text-center text-gray-500">
                                                            <svg
                                                                className="w-8 h-8 mx-auto mb-2 text-gray-300"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={
                                                                        1.5
                                                                    }
                                                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                                                />
                                                            </svg>
                                                            <p className="text-sm">
                                                                No projects
                                                                found
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        filteredProjects.map(
                                                            (project) => (
                                                                <label
                                                                    key={
                                                                        project
                                                                    }
                                                                    className="group px-4 py-3 cursor-pointer hover:bg-blue-50 flex items-center space-x-3 border-b border-gray-100 last:border-b-0 transition-all duration-200"
                                                                >
                                                                    <div className="flex-shrink-0">
                                                                        <input
                                                                            type="radio"
                                                                            name="project-selection"
                                                                            checked={
                                                                                selectedProject ===
                                                                                project
                                                                            }
                                                                            onChange={() =>
                                                                                handleProjectToggle(
                                                                                    project
                                                                                )
                                                                            }
                                                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 transition-colors duration-200"
                                                                        />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <span className="select-none font-medium text-gray-900 group-hover:text-blue-700 transition-colors duration-200">
                                                                            {
                                                                                project
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                    {selectedProject ===
                                                                        project && (
                                                                        <div className="flex-shrink-0">
                                                                            <svg
                                                                                className="w-4 h-4 text-green-500"
                                                                                fill="currentColor"
                                                                                viewBox="0 0 20 20"
                                                                            >
                                                                                <path
                                                                                    fillRule="evenodd"
                                                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                                    clipRule="evenodd"
                                                                                />
                                                                            </svg>
                                                                        </div>
                                                                    )}
                                                                </label>
                                                            )
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {isProjectDropdownOpen && (
                                        <div
                                            className="fixed inset-0 z-5"
                                            onClick={() =>
                                                setIsProjectDropdownOpen(false)
                                            }
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center mb-2 justify-between">
                                <label
                                    htmlFor="account"
                                    className="block text-sm ml-4 font-semibold text-custom-bluegreen w-1/4"
                                >
                                    Add Accounts:
                                </label>
                                <div className="w-2/3">
                                    <div className="relative">
                                        {selectedAccounts.length === 0 && (
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg
                                                    className="h-4 w-4 text-gray-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                                    />
                                                </svg>
                                            </div>
                                        )}

                                        {/* Selected Accounts Tags inside input */}
                                        {selectedAccounts.length > 0 && (
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none overflow-x-auto">
                                                <div className="flex gap-1 items-center">
                                                    {selectedAccounts
                                                        .slice(0, 3)
                                                        .map((account) => (
                                                            <div
                                                                key={account.id}
                                                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-custom-lightestgreen border text-custom-solidgreen shadow-sm flex-shrink-0"
                                                            >
                                                                <span className="mr-1 truncate max-w-20">
                                                                    {
                                                                        account.account_name
                                                                    }
                                                                </span>
                                                                <button
                                                                    onClick={() =>
                                                                        handleRemoveAccount(
                                                                            account.id
                                                                        )
                                                                    }
                                                                    className="text-custom-solidgreen hover:text-red-600 transition-colors duration-200 pointer-events-auto"
                                                                >
                                                                    <svg
                                                                        className="w-3 h-3"
                                                                        fill="currentColor"
                                                                        viewBox="0 0 20 20"
                                                                    >
                                                                        <path
                                                                            fillRule="evenodd"
                                                                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                                            clipRule="evenodd"
                                                                        />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        ))}
                                                    {selectedAccounts.length >
                                                        3 && (
                                                        <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 border text-gray-600 shadow-sm flex-shrink-0">
                                                            <span>
                                                                +
                                                                {selectedAccounts.length -
                                                                    3}{" "}
                                                                more
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <input
                                            type="text"
                                            placeholder={
                                                selectedAccounts.length > 0
                                                    ? ""
                                                    : "Search for accounts..."
                                            }
                                            value={accountSearchTerm}
                                            onChange={(e) =>
                                                setAccountSearchTerm(
                                                    e.target.value
                                                )
                                            }
                                            onFocus={() =>
                                                setIsAccountDropdownOpen(true)
                                            }
                                            className={`w-full pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm ${
                                                selectedAccounts.length > 0
                                                    ? "pl-64"
                                                    : "pl-10"
                                            }`}
                                            style={{
                                                paddingLeft:
                                                    selectedAccounts.length > 0
                                                        ? `${Math.min(
                                                              selectedAccounts.length *
                                                                  80 +
                                                                  60,
                                                              250
                                                          )}px`
                                                        : "40px",
                                            }}
                                        />
                                        {accountSearchTerm && (
                                            <button
                                                onClick={() => {
                                                    setAccountSearchTerm("");
                                                    setIsAccountDropdownOpen(
                                                        false
                                                    );
                                                }}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                            >
                                                <svg
                                                    className="h-4 w-4"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        )}
                                    </div>

                                    {isAccountDropdownOpen && (
                                        <div className="relative">
                                            <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden mt-1">
                                                <div className="sticky top-0 bg-gray-50 px-4 py-2 border-b border-gray-200">
                                                    <div className="flex justify-between items-center">
                                                        <p className="text-sm font-medium text-gray-700">
                                                            Select Accounts (
                                                            {
                                                                filteredAccountsForDropdown.length
                                                            }{" "}
                                                            available)
                                                        </p>
                                                        <div className="flex gap-2">
                                                            {filteredAccountsForDropdown.length >
                                                                0 && (
                                                                <button
                                                                    onClick={
                                                                        handleSelectAllAccounts
                                                                    }
                                                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                                                >
                                                                    Select All
                                                                </button>
                                                            )}
                                                            {selectedAccounts.length >
                                                                0 && (
                                                                <button
                                                                    onClick={() =>
                                                                        setSelectedAccounts(
                                                                            []
                                                                        )
                                                                    }
                                                                    className="text-xs text-red-600 hover:text-red-800 font-medium"
                                                                >
                                                                    Clear All
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="overflow-y-auto max-h-48">
                                                    {filteredAccountsForDropdown.length ===
                                                    0 ? (
                                                        <div className="px-4 py-6 text-center text-gray-500">
                                                            <svg
                                                                className="w-8 h-8 mx-auto mb-2 text-gray-300"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={
                                                                        1.5
                                                                    }
                                                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                                />
                                                            </svg>
                                                            <p className="text-sm">
                                                                No accounts
                                                                found
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        filteredAccountsForDropdown.map(
                                                            (account) => (
                                                                <label
                                                                    key={
                                                                        account.id
                                                                    }
                                                                    className="group px-4 py-3 cursor-pointer hover:bg-blue-50 flex items-center space-x-3 border-b border-gray-100 last:border-b-0 transition-all duration-200"
                                                                >
                                                                    <div className="flex-shrink-0">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={selectedAccounts.some(
                                                                                (
                                                                                    acc
                                                                                ) =>
                                                                                    acc.id ===
                                                                                    account.id
                                                                            )}
                                                                            onChange={() =>
                                                                                handleAccountToggle(
                                                                                    account
                                                                                )
                                                                            }
                                                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200"
                                                                        />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <span className="select-none font-medium text-gray-900 group-hover:text-blue-700 transition-colors duration-200">
                                                                            {
                                                                                account.account_name
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                    {selectedAccounts.some(
                                                                        (acc) =>
                                                                            acc.id ===
                                                                            account.id
                                                                    ) && (
                                                                        <div className="flex-shrink-0">
                                                                            <svg
                                                                                className="w-4 h-4 text-green-500"
                                                                                fill="currentColor"
                                                                                viewBox="0 0 20 20"
                                                                            >
                                                                                <path
                                                                                    fillRule="evenodd"
                                                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                                    clipRule="evenodd"
                                                                                />
                                                                            </svg>
                                                                        </div>
                                                                    )}
                                                                </label>
                                                            )
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {isAccountDropdownOpen && (
                                        <div
                                            className="fixed inset-0 z-5"
                                            onClick={() =>
                                                setIsAccountDropdownOpen(false)
                                            }
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start mb-2 justify-between">
                                <label className="block text-sm ml-4 font-semibold text-custom-bluegreen w-1/4 pt-2">
                                    Assigned To:
                                </label>
                                <div className="w-2/3">
                                    {projectMilestoneStructure &&
                                    projectMilestoneStructure.length > 0 ? (
                                        <div className="p-3 border border-gray-200 rounded-md bg-gray-50 max-h-60 overflow-y-auto font-mono text-sm">
                                            {projectMilestoneStructure.map(
                                                (step, stepIndex) => (
                                                    <div
                                                        key={stepIndex}
                                                        className="mb-3"
                                                    >
                                                        {/* Step */}
                                                        <div className="font-semibold text-blue-700 text-sm mb-1">
                                                            {step.step_name}
                                                        </div>

                                                        {/* Milestones */}
                                                        {step.milestones.map(
                                                            (
                                                                milestone,
                                                                milestoneIndex
                                                            ) => (
                                                                <div
                                                                    key={
                                                                        milestoneIndex
                                                                    }
                                                                    className="mb-1"
                                                                >
                                                                    {/* Milestone with tree connector */}
                                                                    <div className="flex items-start text-gray-700 text-xs mb-1">
                                                                        <span className="text-gray-400 mr-2 mt-0.5 select-none">
                                                                            {milestoneIndex ===
                                                                            step
                                                                                .milestones
                                                                                .length -
                                                                                1
                                                                                ? "└──"
                                                                                : "├──"}
                                                                        </span>
                                                                        <span className="font-medium leading-tight">
                                                                            {
                                                                                milestone.milestone_name
                                                                            }
                                                                        </span>
                                                                    </div>

                                                                    {/* Assignees */}
                                                                    {milestone
                                                                        .assignees
                                                                        .length >
                                                                        0 &&
                                                                        milestone.assignees.map(
                                                                            (
                                                                                assignee,
                                                                                assigneeIndex
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        assigneeIndex
                                                                                    }
                                                                                    className="flex items-start text-xs"
                                                                                >
                                                                                    <span className="text-gray-400 mr-2 mt-0.5 select-none whitespace-pre">
                                                                                        {milestoneIndex ===
                                                                                        step
                                                                                            .milestones
                                                                                            .length -
                                                                                            1
                                                                                            ? "    "
                                                                                            : "│   "}
                                                                                        {assigneeIndex ===
                                                                                        milestone
                                                                                            .assignees
                                                                                            .length -
                                                                                            1
                                                                                            ? "└──"
                                                                                            : "├──"}
                                                                                    </span>
                                                                                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs leading-tight">
                                                                                        {
                                                                                            assignee.full_name
                                                                                        }
                                                                                    </span>
                                                                                </div>
                                                                            )
                                                                        )}
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 pt-2">
                                            {selectedProject
                                                ? "Loading assignees..."
                                                : "Select a project to see assignees"}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div class="flex items-center mb-2 justify-between">
                                <label
                                    htmlFor="date"
                                    className="block text-sm ml-4 font-semibold text-custom-bluegreen w-1/4"
                                >
                                    Due Date:
                                </label>
                                <div className="w-2/3">
                                    <DatePicker
                                        selected={dueDate}
                                        onChange={(date) => setDueDate(date)}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        wrapperClassName="w-full"
                                        placeholderText="Select Due Date"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-6">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="inline-flex justify-center py-[10px] px-11 border border-gray-300 shadow-sm text-sm font-medium rounded-[10px] text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex justify-center py-[10px] px-11 border border-transparent shadow-sm text-sm font-medium rounded-[10px] text-white bg-gradient-to-r from-custom-bluegreen to-custom-lightgreen focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </>
                </div>
            ) : (
                <WorkOrderCreatedModal
                    isOpen={isModalOpen}
                    workOrderGroupId={workOrderId}
                    onClose={() => {
                        setIsModalOpen(false);
                        onClose();
                    }}
                />
            )}
        </div>,
        document.body
    );
};

export default CreateWorkOrderModal;

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
    const [isMilestoneStructureLoading, setIsMilestoneStructureLoading] =
        useState(false);
    const [isProjectsRefreshing, setIsProjectsRefreshing] = useState(false);

    // New state for modern dropdowns
    const [projectSearchTerm, setProjectSearchTerm] = useState("");
    const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
    const [accountSearchTerm, setAccountSearchTerm] = useState("");
    const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);

    // State for tracking selected assignees per milestone
    const [selectedAssignees, setSelectedAssignees] = useState({});

    const { user } = useStateContext();
    const {
        accounts,
        workOrderTypes,
        fetchWorkOrderGroups,
        fetchAccounts,
        fetchWorkOrderTypes,
    } = useDocumentManagementContext();

    useEffect(() => {
        // Since accounts and workOrderTypes are managed by DocumentManagementContext,
        // we don't need to fetch them separately here
    }, []);

    useEffect(() => {
        if (selectedProject) {
            fetchProjectMilestoneStructure();
        } else {
            setProjectMilestoneStructure([]);
            setSelectedAssignees({}); // Reset assignee selections when project changes
        }
    }, [selectedProject]);

    // Initialize selectedAssignees when milestone structure loads
    useEffect(() => {
        if (projectMilestoneStructure && projectMilestoneStructure.length > 0) {
            const initialSelection = {};
            projectMilestoneStructure.forEach((step, stepIndex) => {
                if (step.milestones && Array.isArray(step.milestones)) {
                    step.milestones.forEach((milestone, milestoneIndex) => {
                        const key = `${stepIndex}-${milestoneIndex}`;
                        if (
                            milestone.assignees &&
                            Array.isArray(milestone.assignees)
                        ) {
                            if (milestone.assignees.length === 1) {
                                // For milestones with 1 assignee, select that assignee by default
                                initialSelection[key] = [
                                    milestone.assignees[0].id,
                                ];
                            } else if (milestone.assignees.length > 1) {
                                // For milestones with 2+ assignees, select all by default (user can uncheck)
                                initialSelection[key] = milestone.assignees.map(
                                    (assignee) => assignee.id
                                );
                            } else {
                                // No assignees
                                initialSelection[key] = [];
                            }
                        } else {
                            initialSelection[key] = [];
                        }
                    });
                }
            });
            setSelectedAssignees(initialSelection);
        }
    }, [projectMilestoneStructure]);

    // Function to refresh projects data
    const refreshProjects = useCallback(async () => {
        setIsProjectsRefreshing(true);
        try {
            await fetchAccounts();
        } catch (error) {
            console.error("Failed to refresh projects:", error);
        } finally {
            setIsProjectsRefreshing(false);
        }
    }, [fetchAccounts]);

    // Function to fetch project milestone structure
    const fetchProjectMilestoneStructure = useCallback(() => {
        if (!selectedProject) return;

        setIsMilestoneStructureLoading(true);
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
            })
            .finally(() => {
                setIsMilestoneStructureLoading(false);
            });
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
            setSelectedAssignees({}); // Reset assignee selections when modal closes
        } else if (isOpen) {
            // Refresh work order types when modal opens to ensure latest data
            if (fetchWorkOrderTypes) {
                fetchWorkOrderTypes();
            }
            // Refresh milestone structure when modal opens and project is selected
            if (selectedProject) {
                fetchProjectMilestoneStructure();
            }
        }
    }, [
        isOpen,
        fetchProjectMilestoneStructure,
        selectedProject,
        fetchWorkOrderTypes,
    ]);

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

    // Handler for assignee checkbox selection
    const handleAssigneeToggle = useCallback(
        (stepIndex, milestoneIndex, assigneeId) => {
            const key = `${stepIndex}-${milestoneIndex}`;
            setSelectedAssignees((prev) => {
                const current = prev[key] || [];
                const isSelected = current.includes(assigneeId);

                if (isSelected) {
                    // Remove assignee
                    const updated = current.filter((id) => id !== assigneeId);
                    return { ...prev, [key]: updated };
                } else {
                    // Add assignee
                    return { ...prev, [key]: [...current, assigneeId] };
                }
            });
        },
        []
    );

    const handleSelectAllAccounts = useCallback(() => {
        // Only select accounts that don't have active work orders
        const availableAccounts = filteredAccountsForDropdown.filter(
            (account) => !account.has_active_work_orders
        );
        setSelectedAccounts(availableAccounts);
        setIsAccountDropdownOpen(false);
    }, [filteredAccountsForDropdown]);

    // Helper function to check if all requirements are met for work order creation
    const canCreateWorkOrder = useMemo(() => {
        // Check if project is selected
        if (!selectedProject || selectedProject.trim() === "") {
            return false;
        }

        // Check if due date is selected
        if (!dueDate) {
            return false;
        }

        // Check if project milestone structure exists
        if (
            !projectMilestoneStructure ||
            projectMilestoneStructure.length === 0
        ) {
            return false;
        }

        // Check if all milestones have selected assignees and checklists
        return projectMilestoneStructure.every((step, stepIndex) => {
            if (!step.milestones || !Array.isArray(step.milestones)) {
                return false;
            }
            return step.milestones.every((milestone, milestoneIndex) => {
                const key = `${stepIndex}-${milestoneIndex}`;
                const selectedForMilestone = selectedAssignees[key] || [];

                // Check if milestone has selected assignees
                const hasSelectedAssignees =
                    milestone.assignees &&
                    Array.isArray(milestone.assignees) &&
                    milestone.assignees.length > 0 &&
                    selectedForMilestone.length > 0;

                // Check if milestone has checklists
                const hasChecklists =
                    milestone.checklists &&
                    Array.isArray(milestone.checklists) &&
                    milestone.checklists.length > 0;

                return hasSelectedAssignees && hasChecklists;
            });
        });
    }, [
        selectedProject,
        dueDate,
        projectMilestoneStructure,
        selectedAssignees,
    ]);

    // Keep the original function for backward compatibility and specific checks
    const allMilestonesHaveAssignees = useMemo(() => {
        if (
            !projectMilestoneStructure ||
            projectMilestoneStructure.length === 0
        ) {
            return false;
        }

        return projectMilestoneStructure.every((step, stepIndex) => {
            if (!step.milestones || !Array.isArray(step.milestones)) {
                return false;
            }
            return step.milestones.every((milestone, milestoneIndex) => {
                const key = `${stepIndex}-${milestoneIndex}`;
                const selectedForMilestone = selectedAssignees[key] || [];

                return (
                    milestone.assignees &&
                    Array.isArray(milestone.assignees) &&
                    milestone.assignees.length > 0 &&
                    selectedForMilestone.length > 0
                );
            });
        });
    }, [projectMilestoneStructure, selectedAssignees]);

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

        // Validate work order type structure: Must have milestones with checklists
        if (
            !projectMilestoneStructure ||
            projectMilestoneStructure.length === 0
        ) {
            alert(
                "Cannot create work order. The selected work order type has no milestones defined. Please configure milestones for this work order type first."
            );
            return;
        }

        // Check that all milestones have checklists
        const milestonesWithoutChecklists = [];
        projectMilestoneStructure.forEach((step) => {
            if (step.milestones && Array.isArray(step.milestones)) {
                step.milestones.forEach((milestone) => {
                    if (
                        !milestone.checklists ||
                        !Array.isArray(milestone.checklists) ||
                        milestone.checklists.length === 0
                    ) {
                        milestonesWithoutChecklists.push({
                            stepName: step.step_name,
                            milestoneName: milestone.milestone_name,
                        });
                    }
                });
            }
        });

        if (milestonesWithoutChecklists.length > 0) {
            const milestoneList = milestonesWithoutChecklists
                .map((item) => `• ${item.stepName} > ${item.milestoneName}`)
                .join("\n");

            alert(
                `Cannot create work order. The following milestones have no checklists defined:\n\n${milestoneList}\n\nPlease configure checklists for all milestones before creating a work order.`
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

        // Check which milestones have selected assignees (don't require all to have selections)
        const milestonesWithSelectedAssignees = [];
        projectMilestoneStructure.forEach((step, stepIndex) => {
            if (step.milestones && Array.isArray(step.milestones)) {
                step.milestones.forEach((milestone, milestoneIndex) => {
                    const key = `${stepIndex}-${milestoneIndex}`;
                    const selectedForMilestone = selectedAssignees[key] || [];

                    if (
                        milestone.assignees &&
                        Array.isArray(milestone.assignees) &&
                        milestone.assignees.length > 0 &&
                        selectedForMilestone.length > 0
                    ) {
                        milestonesWithSelectedAssignees.push({
                            stepId: step.id,
                            stepName: step.step_name,
                            milestoneName: milestone.milestone_name,
                            selectedCount: selectedForMilestone.length,
                        });
                    }
                });
            }
        });

        if (milestonesWithSelectedAssignees.length === 0) {
            alert(
                "Please select at least one assignee from any milestone before creating work orders."
            );
            return;
        }

        // Get selected assignees from all milestones
        const allSelectedAssignees = [];
        projectMilestoneStructure.forEach((step, stepIndex) => {
            if (step.milestones && Array.isArray(step.milestones)) {
                step.milestones.forEach((milestone, milestoneIndex) => {
                    const key = `${stepIndex}-${milestoneIndex}`;
                    const selectedForMilestone = selectedAssignees[key] || [];

                    if (
                        milestone.assignees &&
                        Array.isArray(milestone.assignees) &&
                        selectedForMilestone.length > 0
                    ) {
                        milestone.assignees.forEach((assignee) => {
                            if (
                                assignee &&
                                assignee.id &&
                                assignee.full_name &&
                                selectedForMilestone.includes(assignee.id) &&
                                !allSelectedAssignees.find(
                                    (emp) => emp.id === assignee.id
                                )
                            ) {
                                allSelectedAssignees.push(assignee);
                            }
                        });
                    }
                });
            }
        });
        if (allSelectedAssignees.length === 0) {
            alert(
                "No assignees are selected. Please select at least one assignee from the milestone structure."
            );
            return;
        }

        // Assign each account to all selected employees (support multiple assignees per account)
        const accountAssignments = selectedAccounts.map((account) => {
            const employeeIds = [];
            projectMilestoneStructure.forEach((step, stepIndex) => {
                if (step.milestones && Array.isArray(step.milestones)) {
                    step.milestones.forEach((milestone, milestoneIndex) => {
                        const key = `${stepIndex}-${milestoneIndex}`;
                        const selectedForMilestone =
                            selectedAssignees[key] || [];

                        if (
                            milestone.assignees &&
                            Array.isArray(milestone.assignees) &&
                            selectedForMilestone.length > 0
                        ) {
                            milestone.assignees.forEach((assignee) => {
                                if (
                                    assignee &&
                                    assignee.id &&
                                    selectedForMilestone.includes(
                                        assignee.id
                                    ) &&
                                    !employeeIds.includes(assignee.id)
                                ) {
                                    employeeIds.push(assignee.id);
                                }
                            });
                        }
                    });
                }
            });
            return {
                account_id: account.id,
                employee_ids: employeeIds,
            };
        });

        if (accountAssignments.length !== selectedAccounts.length) {
            alert(
                "Some accounts could not be assigned to employees due to data issues. Please try again."
            );
            return;
        }

        if (
            accountAssignments.some(
                (a) =>
                    !a.employee_ids ||
                    !a.account_id ||
                    a.employee_ids.length === 0
            )
        ) {
            alert("One or more accounts could not be assigned to an employee.");
            return;
        }

        // Group milestone assignments by work order type (step) and create multiple work orders
        const workOrderTypesWithAssignments = {};

        projectMilestoneStructure.forEach((step, stepIndex) => {
            if (step.milestones && Array.isArray(step.milestones)) {
                step.milestones.forEach((milestone, milestoneIndex) => {
                    const key = `${stepIndex}-${milestoneIndex}`;
                    const selectedForMilestone = selectedAssignees[key] || [];

                    if (selectedForMilestone.length > 0) {
                        if (!workOrderTypesWithAssignments[step.id]) {
                            workOrderTypesWithAssignments[step.id] = {
                                step: step,
                                milestoneAssignments: [],
                            };
                        }

                        workOrderTypesWithAssignments[
                            step.id
                        ].milestoneAssignments.push({
                            step_name: step.step_name,
                            milestone_name: milestone.milestone_name,
                            selected_assignee_ids: selectedForMilestone,
                        });
                    }
                });
            }
        });

        // Create a separate work order for each work order type that has assignments
        const workOrdersToCreate = Object.values(
            workOrderTypesWithAssignments
        ).map(({ step, milestoneAssignments }) => {
            // For each work order type, get account assignments from the milestones in that step
            const stepAccountAssignments = selectedAccounts.map((account) => {
                const employeeIds = [];
                milestoneAssignments.forEach((milestone) => {
                    milestone.selected_assignee_ids.forEach((employeeId) => {
                        if (!employeeIds.includes(employeeId)) {
                            employeeIds.push(employeeId);
                        }
                    });
                });

                return {
                    account_id: account.id,
                    employee_ids: employeeIds,
                };
            });

            return {
                work_order: step.step_name,
                account_ids: selectedAccounts
                    .map((account) => account.id)
                    .filter((id) => id),
                work_order_type_id: step.id,
                work_order_deadline: formattedDueDate,
                status: "In Progress",
                description: "",
                priority: "Medium",
                created_by_user_id: user.id,
                account_assignments: stepAccountAssignments,
                milestone_assignments: milestoneAssignments,
            };
        });

        if (workOrdersToCreate.length === 0) {
            alert(
                "No work orders to create. Please select assignees for at least one milestone."
            );
            return;
        }

        try {
            // Create all work orders
            const responses = await Promise.all(
                workOrdersToCreate.map((workOrderData) =>
                    apiService.post(
                        "/work-orders/create-work-order",
                        workOrderData
                    )
                )
            );

            // Check if all were successful
            const allSuccessful = responses.every(
                (response) => response.status === 201
            );

            if (allSuccessful) {
                const workOrderIds = responses.map(
                    (response) => response.data.data.work_order_id
                );
                const workOrderGroupIds = responses.map(
                    (response) => response.data.data.work_order_group_id
                );

                // Use the first work order group ID for display
                const firstWorkOrderGroupId = workOrderGroupIds[0];
                setWorkOrderId(firstWorkOrderGroupId || workOrderIds[0]);
                setIsModalOpen(true);

                if (fetchWorkOrderGroups) {
                    fetchWorkOrderGroups();
                }
                if (fetchWorkOrderTypes) {
                    fetchWorkOrderTypes();
                }
                if (fetchAccounts) {
                    fetchAccounts();
                }

                // NOTE FEATURE: Create a single consolidated note for all new work orders
                const logWorkOrderIds = responses.map(
                    (response) => response.data.data.work_order_id
                );
                const workOrderNames = workOrdersToCreate.map(
                    (workOrderData) => workOrderData.work_order
                );

                // Use the first work order ID for the note entry (or the group ID if available)
                const primaryWorkOrderId = logWorkOrderIds[0];
                const logWorkOrderGroupId =
                    responses[0].data.data.work_order_group_id;

                const consolidatedNoteData = {
                    work_order_id: logWorkOrderGroupId || primaryWorkOrderId,
                    log_type: "Work Order Creation",
                    note_text: `Work Orders created: ${workOrderNames.join(
                        ", "
                    )} for ${selectedAccounts.length} account(s).`,
                    note_type: "System Generated",
                    created_by_user_id: user.id,
                };

                try {
                    const noteResponse = await apiService.post(
                        "/work-orders/notes/add",
                        consolidatedNoteData
                    );
                    if (
                        noteResponse.status !== 201 &&
                        noteResponse.data?.message !==
                            "Note and attachments added successfully."
                    ) {
                        console.error(
                            "Error creating consolidated work order note:",
                            noteResponse
                        );
                    }
                } catch (noteError) {
                    console.error(
                        "Exception while creating consolidated work order note:",
                        noteError
                    );
                }
            } else {
                const failedResponses = responses.filter(
                    (response) => response.status !== 201
                );
                console.error(
                    "Some work orders failed to create:",
                    failedResponses
                );
                alert(
                    "Some work orders could not be created. Please try again."
                );
            }
        } catch (error) {
            console.error(
                "Error creating work orders:",
                error.message || error
            );
            alert(
                "An error occurred while creating work orders. Please try again."
            );
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
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none overflow-hidden">
                                                <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-custom-lightestgreen border text-custom-solidgreen shadow-sm max-w-[200px]">
                                                    <span className="mr-1 truncate">
                                                        {selectedProjectDetails}
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            handleProjectToggle(
                                                                selectedProjectDetails
                                                            )
                                                        }
                                                        className="text-custom-solidgreen hover:text-red-600 transition-colors duration-200 pointer-events-auto flex-shrink-0"
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
                                            className={`w-full py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm ${
                                                selectedProjectDetails
                                                    ? "pl-56 pr-20"
                                                    : "pl-10 pr-20"
                                            }`}
                                        />

                                        {/* Clear button */}
                                        {projectSearchTerm && (
                                            <button
                                                onClick={() => {
                                                    setProjectSearchTerm("");
                                                    setIsProjectDropdownOpen(
                                                        false
                                                    );
                                                }}
                                                className="absolute inset-y-0 right-10 pr-1 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
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

                                        {/* Refresh button */}
                                        <button
                                            onClick={refreshProjects}
                                            disabled={isProjectsRefreshing}
                                            className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors duration-200 ${
                                                isProjectsRefreshing
                                                    ? "text-custom-bluegreen cursor-not-allowed"
                                                    : "text-gray-400 hover:text-custom-bluegreen"
                                            }`}
                                            title="Refresh projects"
                                        >
                                            <svg
                                                className={`h-4 w-4 ${
                                                    isProjectsRefreshing
                                                        ? "animate-spin"
                                                        : ""
                                                }`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                                />
                                            </svg>
                                        </button>
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
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none overflow-hidden">
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
                                                                filteredAccountsForDropdown.filter(
                                                                    (acc) =>
                                                                        !acc.has_active_work_orders
                                                                ).length
                                                            }{" "}
                                                            available,{" "}
                                                            {
                                                                filteredAccountsForDropdown.filter(
                                                                    (acc) =>
                                                                        acc.has_active_work_orders
                                                                ).length
                                                            }{" "}
                                                            assigned)
                                                        </p>
                                                        <div className="flex gap-2">
                                                            {filteredAccountsForDropdown.filter(
                                                                (acc) =>
                                                                    !acc.has_active_work_orders
                                                            ).length > 0 && (
                                                                <button
                                                                    onClick={
                                                                        handleSelectAllAccounts
                                                                    }
                                                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                                                >
                                                                    Select All
                                                                    Available
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
                                                        // Sort accounts alphabetically by last name
                                                        [
                                                            ...filteredAccountsForDropdown,
                                                        ]
                                                            .sort((a, b) => {
                                                                const aLast = (
                                                                    a.account_name ||
                                                                    ""
                                                                )
                                                                    .split(" ")
                                                                    .pop()
                                                                    .toLowerCase();
                                                                const bLast = (
                                                                    b.account_name ||
                                                                    ""
                                                                )
                                                                    .split(" ")
                                                                    .pop()
                                                                    .toLowerCase();
                                                                return aLast.localeCompare(
                                                                    bLast
                                                                );
                                                            })
                                                            .map((account) => {
                                                                const nameParts =
                                                                    (
                                                                        account.account_name ||
                                                                        ""
                                                                    ).split(
                                                                        " "
                                                                    );
                                                                const lastName =
                                                                    nameParts.length >
                                                                    0
                                                                        ? nameParts[
                                                                              nameParts.length -
                                                                                  1
                                                                          ]
                                                                        : account.account_name;
                                                                const unit =
                                                                    account.unit_no ||
                                                                    "";
                                                                return (
                                                                    <label
                                                                        key={
                                                                            account.id
                                                                        }
                                                                        className={`group px-4 py-3 flex items-center space-x-3 border-b border-gray-100 last:border-b-0 transition-all duration-200 ${
                                                                            account.has_active_work_orders
                                                                                ? "cursor-not-allowed opacity-60 bg-gray-50"
                                                                                : "cursor-pointer hover:bg-blue-50"
                                                                        }`}
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
                                                                                disabled={
                                                                                    account.has_active_work_orders
                                                                                }
                                                                                onChange={() =>
                                                                                    handleAccountToggle(
                                                                                        account
                                                                                    )
                                                                                }
                                                                                className={`h-4 w-4 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200 ${
                                                                                    account.has_active_work_orders
                                                                                        ? "text-gray-400 cursor-not-allowed"
                                                                                        : "text-blue-600"
                                                                                }`}
                                                                            />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <span
                                                                                className={`select-none font-medium transition-colors duration-200 ${
                                                                                    account.has_active_work_orders
                                                                                        ? "text-gray-500"
                                                                                        : "text-gray-900 group-hover:text-blue-700"
                                                                                }`}
                                                                            >
                                                                                {
                                                                                    lastName
                                                                                }
                                                                                {unit && (
                                                                                    <span className="ml-2 text-xs text-gray-500">
                                                                                        (Unit:{" "}
                                                                                        {
                                                                                            unit
                                                                                        }

                                                                                        )
                                                                                    </span>
                                                                                )}
                                                                                {account.has_active_work_orders && (
                                                                                    <span className="ml-2 text-xs text-red-600 font-medium">
                                                                                        (Already
                                                                                        has
                                                                                        active
                                                                                        work
                                                                                        order)
                                                                                    </span>
                                                                                )}
                                                                            </span>
                                                                        </div>
                                                                        {selectedAccounts.some(
                                                                            (
                                                                                acc
                                                                            ) =>
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
                                                                );
                                                            })
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
                                <div className="w-1/4 pt-2">
                                    <label className="block text-sm ml-4 font-semibold text-custom-bluegreen">
                                        Assigned To:
                                    </label>
                                </div>
                                <div className="w-2/3 relative">
                                    {selectedProject && (
                                        <button
                                            type="button"
                                            onClick={
                                                fetchProjectMilestoneStructure
                                            }
                                            disabled={
                                                isMilestoneStructureLoading
                                            }
                                            className={`absolute top-2 right-0 pr-5 text-custom-bluegreen hover:text-custom-lightgreen transition-colors duration-200 p-1 rounded-full hover:bg-gray-100 z-0 ${
                                                isMilestoneStructureLoading
                                                    ? "cursor-not-allowed opacity-50"
                                                    : ""
                                            }`}
                                            title="Refresh milestone structure"
                                        >
                                            <svg
                                                className={`w-4 h-4 ${
                                                    isMilestoneStructureLoading
                                                        ? "animate-spin"
                                                        : ""
                                                }`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                                />
                                            </svg>
                                        </button>
                                    )}
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
                                                                        <div className="flex items-center gap-2 flex-wrap">
                                                                            <span className="font-medium leading-tight">
                                                                                {
                                                                                    milestone.milestone_name
                                                                                }
                                                                            </span>
                                                                            {(!milestone.assignees ||
                                                                                !Array.isArray(
                                                                                    milestone.assignees
                                                                                ) ||
                                                                                milestone
                                                                                    .assignees
                                                                                    .length ===
                                                                                    0) && (
                                                                                <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                                                                    No
                                                                                    Assignees
                                                                                </span>
                                                                            )}
                                                                            {(!milestone.checklists ||
                                                                                !Array.isArray(
                                                                                    milestone.checklists
                                                                                ) ||
                                                                                milestone
                                                                                    .checklists
                                                                                    .length ===
                                                                                    0) && (
                                                                                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                                                                                    No
                                                                                    Checklists
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    {/* Assignees */}
                                                                    {milestone.assignees &&
                                                                        milestone
                                                                            .assignees
                                                                            .length >
                                                                            0 &&
                                                                        milestone.assignees.map(
                                                                            (
                                                                                assignee,
                                                                                assigneeIndex
                                                                            ) => {
                                                                                const key = `${stepIndex}-${milestoneIndex}`;
                                                                                const selectedForMilestone =
                                                                                    selectedAssignees[
                                                                                        key
                                                                                    ] ||
                                                                                    [];
                                                                                const isSelected =
                                                                                    selectedForMilestone.includes(
                                                                                        assignee.id
                                                                                    );
                                                                                const showCheckbox =
                                                                                    milestone
                                                                                        .assignees
                                                                                        .length >=
                                                                                    2;

                                                                                return (
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
                                                                                        <div className="flex items-center gap-2">
                                                                                            {showCheckbox && (
                                                                                                <input
                                                                                                    type="checkbox"
                                                                                                    checked={
                                                                                                        isSelected
                                                                                                    }
                                                                                                    onChange={() =>
                                                                                                        handleAssigneeToggle(
                                                                                                            stepIndex,
                                                                                                            milestoneIndex,
                                                                                                            assignee.id
                                                                                                        )
                                                                                                    }
                                                                                                    className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200"
                                                                                                    title={`${
                                                                                                        isSelected
                                                                                                            ? "Unselect"
                                                                                                            : "Select"
                                                                                                    } ${
                                                                                                        assignee.full_name
                                                                                                    }`}
                                                                                                />
                                                                                            )}
                                                                                            <span
                                                                                                className={`px-2 py-1 rounded-full text-xs leading-tight ${
                                                                                                    showCheckbox
                                                                                                        ? isSelected
                                                                                                            ? "bg-green-100 text-green-800"
                                                                                                            : "bg-gray-100 text-gray-600"
                                                                                                        : "bg-green-100 text-green-800"
                                                                                                }`}
                                                                                            >
                                                                                                {
                                                                                                    assignee.full_name
                                                                                                }
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            }
                                                                        )}

                                                                    {/* Show messages for milestones with missing requirements */}
                                                                    {(!milestone.assignees ||
                                                                        !Array.isArray(
                                                                            milestone.assignees
                                                                        ) ||
                                                                        milestone
                                                                            .assignees
                                                                            .length ===
                                                                            0 ||
                                                                        !milestone.checklists ||
                                                                        !Array.isArray(
                                                                            milestone.checklists
                                                                        ) ||
                                                                        milestone
                                                                            .checklists
                                                                            .length ===
                                                                            0) && (
                                                                        <div className="space-y-1">
                                                                            {(!milestone.assignees ||
                                                                                !Array.isArray(
                                                                                    milestone.assignees
                                                                                ) ||
                                                                                milestone
                                                                                    .assignees
                                                                                    .length ===
                                                                                    0) && (
                                                                                <div className="flex items-start text-xs">
                                                                                    <span className="text-gray-400 mr-2 mt-0.5 select-none whitespace-pre">
                                                                                        {milestoneIndex ===
                                                                                        step
                                                                                            .milestones
                                                                                            .length -
                                                                                            1
                                                                                            ? "    "
                                                                                            : "│   "}
                                                                                        ├──
                                                                                    </span>
                                                                                    <span className="px-2 py-1 bg-red-50 text-red-600 rounded text-xs italic">
                                                                                        Please
                                                                                        assign
                                                                                        employees
                                                                                        to
                                                                                        this
                                                                                        milestone
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                            {(!milestone.checklists ||
                                                                                !Array.isArray(
                                                                                    milestone.checklists
                                                                                ) ||
                                                                                milestone
                                                                                    .checklists
                                                                                    .length ===
                                                                                    0) && (
                                                                                <div className="flex items-start text-xs">
                                                                                    <span className="text-gray-400 mr-2 mt-0.5 select-none whitespace-pre">
                                                                                        {milestoneIndex ===
                                                                                        step
                                                                                            .milestones
                                                                                            .length -
                                                                                            1
                                                                                            ? "    "
                                                                                            : "│   "}
                                                                                        └──
                                                                                    </span>
                                                                                    <span className="px-2 py-1 bg-orange-50 text-orange-600 rounded text-xs italic">
                                                                                        Please
                                                                                        configure
                                                                                        checklists
                                                                                        for
                                                                                        this
                                                                                        milestone
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-500 pt-2">
                                            {isMilestoneStructureLoading ? (
                                                <div className="flex items-center gap-2">
                                                    <svg
                                                        className="animate-spin h-4 w-4 text-custom-bluegreen"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <circle
                                                            className="opacity-25"
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            stroke="currentColor"
                                                            strokeWidth="4"
                                                        ></circle>
                                                        <path
                                                            className="opacity-75"
                                                            fill="currentColor"
                                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                        ></path>
                                                    </svg>
                                                    <span>
                                                        Loading milestone
                                                        structure...
                                                    </span>
                                                </div>
                                            ) : selectedProject ? (
                                                <div>
                                                    <p>
                                                        No milestones found for
                                                        this project.
                                                    </p>
                                                    <p className="text-xs mt-1 text-gray-400">
                                                        Click the refresh button
                                                        to reload milestone
                                                        data.
                                                    </p>
                                                </div>
                                            ) : (
                                                "Select a project to see milestone structure"
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center mb-2 justify-between">
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
                                        minDate={new Date()}
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
                                <div className="relative group">
                                    <button
                                        type="submit"
                                        disabled={
                                            !canCreateWorkOrder ||
                                            selectedAccounts.length === 0
                                        }
                                        className={`inline-flex justify-center py-[10px] px-11 border border-transparent shadow-sm text-sm font-medium rounded-[10px] text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                                            canCreateWorkOrder &&
                                            selectedAccounts.length > 0
                                                ? "bg-gradient-to-r from-custom-bluegreen to-custom-lightgreen hover:opacity-90"
                                                : "bg-gray-400 cursor-not-allowed"
                                        }`}
                                    >
                                        Create
                                    </button>
                                    {(!canCreateWorkOrder ||
                                        selectedAccounts.length === 0) && (
                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50">
                                            {!canCreateWorkOrder &&
                                            selectedAccounts.length === 0
                                                ? "Complete all required fields: project, accounts, due date, and assignee selection"
                                                : !canCreateWorkOrder
                                                ? "Complete required fields: project, due date, and ensure all milestones have assignees & checklists"
                                                : "Select at least one account"}
                                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                        </div>
                                    )}
                                </div>
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

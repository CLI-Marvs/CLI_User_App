import React, { useMemo, useState, Fragment } from "react";
import WorkOrderMilestoneRow from "./WorkOrderMilestoneRow";
import AccountFilesModal from "./AccountFilesModal";
import ChecklistTable from "./ChecklistTable";
import AddFilesModal from "./AddFilesModal";
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
    Typography,
    Select,
    Option,
    Input,
    IconButton,
    Tooltip,
} from "@material-tailwind/react";
import EnhancedControlBar from "./EnhancedControlBar";
import NotesAndUpdatesModal from "./NotesAndUpdatesModal";
import apiService from "../../../../frontend/component/servicesApi/apiService";

const WorkOrderGroupDetailsModal = ({
    isOpen,
    onClose,
    group,
    getStatusBadge,
    isLoading,
    showChecklistTable = false,
    currentUserId,
    onRefresh,
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
    const [selectedAccountForNotes, setSelectedAccountForNotes] =
        useState(null);
    const [filesModalOpen, setFilesModalOpen] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [selectedAccountInfo, setSelectedAccountInfo] = useState({});
    const [progressionStatus, setProgressionStatus] = useState({
        isProgressing: false,
        message: "",
        type: "info",
    });
    const [isRefreshing, setIsRefreshing] = useState(false);

    // New filter states
    const [buyerFilter, setBuyerFilter] = useState("All");
    const [showStepView, setShowStepView] = useState(true);
    const [assigneeFilter, setAssigneeFilter] = useState("All");
    const [availableAssignees, setAvailableAssignees] = useState([]);
    const [visibleSteps, setVisibleSteps] = useState(new Set()); // Track which steps are visible
    const [stepAssigneeFilter, setStepAssigneeFilter] = useState("All"); // Filter steps by assignee
    const [hideCompletedChecklists, setHideCompletedChecklists] =
        useState(false); // Hide completed checklists filter

    // AddFilesModal state
    const [isAddFilesModalOpen, setIsAddFilesModalOpen] = useState(false);
    const [selectedAccountId, setSelectedAccountId] = useState(null);
    const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
    const [selectedStepName, setSelectedStepName] = useState(null);
    const [selectedChecklist, setSelectedChecklist] = useState(null);

    // Local handler for opening AddFilesModal
    const handleAddFiles = (accountId, workOrder, stepName, checklist) => {
        setSelectedAccountId(accountId);
        setSelectedWorkOrder(workOrder);
        setSelectedStepName(stepName);
        setSelectedChecklist(checklist);
        setIsAddFilesModalOpen(true);
    };

    // Milestone progression logic
    const checkMilestoneProgression = (account, steps) => {
        const currentStep = steps.find((step) =>
            step.subMilestones.some(
                (sub) => sub.id === account.currentSubMilestoneId
            )
        );

        if (!currentStep) return null;

        // Check if DOCKETING milestone is completed in current step
        const docketingMilestone = currentStep.subMilestones.find((sub) =>
            sub.name.toLowerCase().includes("docketing")
        );

        if (docketingMilestone) {
            const isDocketingCompleted = checkMilestoneCompletion(
                account,
                docketingMilestone
            );

            if (isDocketingCompleted) {
                // Check if all other milestones in current step are completed
                const allMilestonesCompleted = currentStep.subMilestones.every(
                    (milestone) => checkMilestoneCompletion(account, milestone)
                );

                if (allMilestonesCompleted) {
                    // Milestone progression logic here
                }
            }
        }

        return null;
    };

    // Handler to show files modal for an account
    const handleShowFilesModal = (account) => {
        const transformedFiles = (account.uploaded_documents || []).map(
            (doc) => {
                const transformedDoc = {
                    ...doc,
                    uploaded_by:
                        doc.uploaded_by?.fullname ||
                        doc.uploaded_by?.name ||
                        doc.uploaded_by_name ||
                        doc.uploader ||
                        doc.uploaded_by ||
                        "User Name",
                };
                return transformedDoc;
            }
        );
        setSelectedFiles(transformedFiles);
        setSelectedAccountInfo({
            account_name:
                account.accountName ||
                account.account_name ||
                account.name ||
                account.account,
            project_name:
                group.project_name ||
                group.project ||
                group.property_name ||
                group.property ||
                null,
            property_name:
                account.property_name ||
                account.property ||
                account.project_name ||
                account.project ||
                null,
            milestone_name: group.milestone_name || group.milestone || null,
            group_name: group.name || group.group_name || null,
            group_id: group.id,
            account_id: account.id || account.key,
            account: account,
            group: group,
            currentUser: group.currentUser,
            currentUserId: currentUserId,
        });
        setFilesModalOpen(true);
    };

    // Extract available steps from the group data
    const availableSteps = useMemo(() => {
        if (!group || !group.work_orders) return [];

        return [...group.work_orders]
            .sort(
                (a, b) =>
                    (a.work_order_type?.sequence ?? 0) -
                    (b.work_order_type?.sequence ?? 0)
            )
            .map((wo) => ({
                id: wo.work_order_type_id, // Use work_order_type_id to match with submilestone filtering
                stepName: wo.work_order_type?.type_name || `Step`,
                sequence: wo.work_order_type?.sequence ?? 0,
            }));
    }, [group]);

    // Initialize visible steps when available steps change
    React.useEffect(() => {
        if (availableSteps.length > 0) {
            // Show all steps by default
            setVisibleSteps(new Set(availableSteps.map((step) => step.id)));
        }
    }, [availableSteps]);

    // Extract available assignees from the group data
    const assignees = useMemo(() => {
        if (!group) return [];

        // Use the project_assignees from the enhanced API response
        if (group.project_assignees && Array.isArray(group.project_assignees)) {
            return group.project_assignees.map((assignee) => ({
                id: assignee.id,
                name:
                    assignee.name ||
                    `${assignee.firstname || ""} ${
                        assignee.lastname || ""
                    }`.trim(),
                firstname: assignee.firstname,
                lastname: assignee.lastname,
            }));
        }

        return [];
    }, [group]);

    // Update available assignees when data changes
    React.useEffect(() => {
        setAvailableAssignees(assignees);
    }, [assignees]);

    // --- Milestone progression updater: must be above all usages ---
    const updateMilestoneProgression = async (accountId, newSubmilestoneId) => {
        try {
            setProgressionStatus({
                isProgressing: true,
                // message: "Updating milestone progression...",
                type: "info",
            });

            await apiService.put(
                `/accounts/${accountId}/milestone-progression`,
                {
                    current_submilestone_id: newSubmilestoneId,
                }
            );

            if (onRefresh) {
                await onRefresh();
            }

            setProgressionStatus({
                isProgressing: false,
                message: "Milestone progression updated successfully!",
                type: "success",
            });
        } catch (error) {
            setProgressionStatus({
                isProgressing: false,
                // message: "Failed to update milestone progression.",
                type: "error",
            });
            console.error("Error updating milestone progression:", error);
        }
    };

    const {
        columnHeaders,
        tableRows,
        filteredRows,
        totalPages,
        steps,
        checklistTableAccounts,
    } = useMemo(() => {
        if (!group || !group.work_orders)
            return {
                columnHeaders: [],
                tableRows: [],
                filteredRows: [],
                totalPages: 0,
                steps: [],
                checklistTableAccounts: [],
            };

        // 1. Gather all steps (work orders) and sort by sequence
        const steps = [...group.work_orders]
            .sort(
                (a, b) =>
                    (a.work_order_type?.sequence ?? 0) -
                    (b.work_order_type?.sequence ?? 0)
            )
            .map((wo) => ({
                id: wo.work_order_type_id, // Use work_order_type_id to match with submilestone filtering
                workOrderId: wo.work_order_id, // Keep original work order ID for reference
                stepName: wo.work_order_type?.type_name || `Step`,
                sequence: wo.work_order_type?.sequence ?? 0,
                subMilestones:
                    group.submilestonesByType?.[wo.work_order_type_id] || [],
                workOrder: wo,
            }));

        // 2. Prepare column headers for each step and its sub-milestones (only for visible steps)
        const columnHeaders = steps
            .filter((step) => visibleSteps.has(step.id))
            .map((step) => {
                let filteredSubMilestones = step.subMilestones;

                // Filter milestones by assignee if step assignee filter is active
                if (stepAssigneeFilter !== "All") {
                    const selectedAssigneeId = parseInt(stepAssigneeFilter);
                    filteredSubMilestones = step.subMilestones.filter(
                        (milestone) => {
                            // Use work_order_account_assignees instead of milestone_assignees
                            if (
                                !milestone.work_order_account_assignees ||
                                milestone.work_order_account_assignees
                                    .length === 0
                            ) {
                                return false;
                            }

                            // Check if the selected assignee is assigned to this milestone for this work order
                            return milestone.work_order_account_assignees.some(
                                (assignee) => {
                                    return (
                                        assignee.employee_id ===
                                            selectedAssigneeId &&
                                        assignee.submilestone_id ===
                                            milestone.id &&
                                        assignee.work_order_id ===
                                            (step.workOrder?.work_order_id ||
                                                step.workOrder?.id)
                                    );
                                }
                            );
                        }
                    );
                }

                // Filter milestones by buyer-related checklists
                if (buyerFilter !== "All") {
                    filteredSubMilestones = filteredSubMilestones.filter(
                        (milestone) => {
                            if (
                                !milestone.checklists ||
                                milestone.checklists.length === 0
                            )
                                return false;

                            const hasBuyerRelatedChecklist =
                                milestone.checklists.some(
                                    (checklist) =>
                                        checklist.is_buyer_related === true
                                );
                            const hasNonBuyerRelatedChecklist =
                                milestone.checklists.some(
                                    (checklist) =>
                                        checklist.is_buyer_related === false
                                );

                            if (buyerFilter === "Buyer Related") {
                                return hasBuyerRelatedChecklist;
                            } else if (buyerFilter === "Non-buyer") {
                                return hasNonBuyerRelatedChecklist;
                            }
                            return true;
                        }
                    );
                }

                return {
                    stepName: step.stepName,
                    stepId: step.id,
                    subMilestones:
                        filteredSubMilestones.length > 0
                            ? filteredSubMilestones.map((m) => m.name)
                            : [],
                    allSubMilestones: step.subMilestones, // Keep reference to all milestones
                    filteredSubMilestones: filteredSubMilestones, // Filtered milestones for reference
                };
            })
            .filter((col) => col.subMilestones.length > 0); // Remove steps with no milestones after filtering

        // 3. Gather accounts and build milestone completion data
        const accountMap = {};

        steps.forEach((step) => {
            (step.workOrder.accounts || []).forEach((account) => {
                const accId = account.id;
                if (!accountMap[accId]) {
                    accountMap[accId] = {
                        ...account,
                        milestoneData: {},
                        latestStep: {
                            sequence: step.sequence,
                            status: step.workOrder.status,
                            workOrder: step.workOrder,
                        },
                        remarks: step.workOrder.remarks || "-",
                        currentSubMilestoneId: account.current_submilestone_id,
                    };
                }
                // Update latest step if this step is further
                if (step.sequence > accountMap[accId].latestStep.sequence) {
                    accountMap[accId].latestStep = {
                        sequence: step.sequence,
                        status: step.workOrder.status,
                        workOrder: step.workOrder,
                    };
                    accountMap[accId].remarks = step.workOrder.remarks || "-";
                }

                // Mark milestones as completed or current
                let values;

                // Get filtered milestones based on assignee filter
                let milestonesToProcess = step.subMilestones;
                if (stepAssigneeFilter !== "All") {
                    const selectedAssigneeId = parseInt(stepAssigneeFilter);
                    milestonesToProcess = step.subMilestones.filter(
                        (milestone) => {
                            // Use work_order_account_assignees instead of milestone_assignees
                            if (
                                !milestone.work_order_account_assignees ||
                                milestone.work_order_account_assignees
                                    .length === 0
                            ) {
                                return false;
                            }

                            // Check if the selected assignee is assigned to this milestone for this work order
                            return milestone.work_order_account_assignees.some(
                                (assignee) => {
                                    return (
                                        assignee.employee_id ===
                                            selectedAssigneeId &&
                                        assignee.submilestone_id ===
                                            milestone.id &&
                                        assignee.work_order_id ===
                                            (step.workOrder?.work_order_id ||
                                                step.workOrder?.id)
                                    );
                                }
                            );
                        }
                    );
                }

                // Filter milestones by buyer-related checklists
                if (buyerFilter !== "All") {
                    milestonesToProcess = milestonesToProcess.filter(
                        (milestone) => {
                            if (
                                !milestone.checklists ||
                                milestone.checklists.length === 0
                            )
                                return false;

                            const hasBuyerRelatedChecklist =
                                milestone.checklists.some(
                                    (checklist) =>
                                        checklist.is_buyer_related === true
                                );
                            const hasNonBuyerRelatedChecklist =
                                milestone.checklists.some(
                                    (checklist) =>
                                        checklist.is_buyer_related === false
                                );

                            if (buyerFilter === "Buyer Related") {
                                return hasBuyerRelatedChecklist;
                            } else if (buyerFilter === "Non-buyer") {
                                return hasNonBuyerRelatedChecklist;
                            }
                            return true;
                        }
                    );
                }

                if (milestonesToProcess.length > 0) {
                    values = milestonesToProcess.map((sub) => {
                        const items = sub.checklists || [];
                        if (!items || items.length === 0) return 0;

                        const uploadedDocs = account.uploaded_documents || [];
                        const completedCount = items.filter((item) => {
                            // Check if item is completed by either uploaded document OR checklist status
                            const hasUploadedDoc = uploadedDocs.some(
                                (doc) => doc.file_title === item.name
                            );

                            // Check if item is completed via account_checklist_statuses
                            const accountChecklistStatus = (
                                account.account_checklist_statuses || []
                            ).find((status) => status.checklist_id === item.id);
                            const hasCompletedStatus =
                                accountChecklistStatus &&
                                accountChecklistStatus.is_completed;

                            return hasUploadedDoc || hasCompletedStatus;
                        }).length;

                        return Math.round(
                            (completedCount / items.length) * 100
                        );
                    });
                } else {
                    // For steps without submilestones, we need to determine progress differently
                    // Since we only have current_submilestone_id, we'll set default values
                    values = [0];
                }
                accountMap[accId].milestoneData[step.id] = values;
            });
        });

        const tableRows = Object.values(accountMap).map((account) => {
            // Build stepData only for visible steps AND filtered by buyer filter
            const stepData = steps
                .filter((step) => visibleSteps.has(step.id))
                .map((step) => {
                    // Get filtered milestones based on assignee filter
                    let milestonesToProcess = step.subMilestones;
                    if (stepAssigneeFilter !== "All") {
                        const selectedAssigneeId = parseInt(stepAssigneeFilter);
                        milestonesToProcess = step.subMilestones.filter(
                            (milestone) => {
                                // Use work_order_account_assignees instead of milestone_assignees
                                if (
                                    !milestone.work_order_account_assignees ||
                                    milestone.work_order_account_assignees
                                        .length === 0
                                ) {
                                    return false;
                                }

                                // Check if the selected assignee is assigned to this milestone for this work order
                                return milestone.work_order_account_assignees.some(
                                    (assignee) => {
                                        return (
                                            assignee.employee_id ===
                                                selectedAssigneeId &&
                                            assignee.submilestone_id ===
                                                milestone.id &&
                                            assignee.work_order_id ===
                                                (step.workOrder
                                                    ?.work_order_id ||
                                                    step.workOrder?.id)
                                        );
                                    }
                                );
                            }
                        );
                    }

                    // Filter milestones by buyer-related checklists (SAME AS COLUMN HEADERS)
                    if (buyerFilter !== "All") {
                        milestonesToProcess = milestonesToProcess.filter(
                            (milestone) => {
                                if (
                                    !milestone.checklists ||
                                    milestone.checklists.length === 0
                                )
                                    return false;

                                const hasBuyerRelatedChecklist =
                                    milestone.checklists.some(
                                        (checklist) =>
                                            checklist.is_buyer_related === true
                                    );
                                const hasNonBuyerRelatedChecklist =
                                    milestone.checklists.some(
                                        (checklist) =>
                                            checklist.is_buyer_related === false
                                    );

                                if (buyerFilter === "Buyer Related") {
                                    return hasBuyerRelatedChecklist;
                                } else if (buyerFilter === "Non-buyer") {
                                    return hasNonBuyerRelatedChecklist;
                                }
                                return true;
                            }
                        );
                    }

                    // Use the filtered milestones for stepData calculation
                    if (milestonesToProcess.length > 0) {
                        return milestonesToProcess.map((sub) => {
                            const items = sub.checklists || [];
                            if (!items || items.length === 0) return 0;

                            const uploadedDocs =
                                account.uploaded_documents || [];
                            const completedCount = items.filter((item) => {
                                const hasUploadedDoc = uploadedDocs.some(
                                    (doc) => doc.file_title === item.name
                                );
                                const accountChecklistStatus = (
                                    account.account_checklist_statuses || []
                                ).find(
                                    (status) => status.checklist_id === item.id
                                );
                                const hasCompletedStatus =
                                    accountChecklistStatus &&
                                    accountChecklistStatus.is_completed;
                                return hasUploadedDoc || hasCompletedStatus;
                            }).length;

                            return Math.round(
                                (completedCount / items.length) * 100
                            );
                        });
                    } else {
                        return []; // Return empty array for steps with no matching milestones
                    }
                })
                .filter((stepValues) => stepValues.length > 0); // Remove empty steps

            // Build checklistInfos: array of info for each submilestone cell (only for visible steps)
            const checklistInfos = [];
            steps
                .filter((step) => visibleSteps.has(step.id))
                .forEach((step) => {
                    // Get filtered milestones based on assignee filter
                    let milestonesToProcess = step.subMilestones;
                    if (stepAssigneeFilter !== "All") {
                        const selectedAssigneeId = parseInt(stepAssigneeFilter);
                        milestonesToProcess = step.subMilestones.filter(
                            (milestone) => {
                                // Use work_order_account_assignees instead of milestone_assignees
                                if (
                                    !milestone.work_order_account_assignees ||
                                    milestone.work_order_account_assignees
                                        .length === 0
                                ) {
                                    return false;
                                }

                                // Check if the selected assignee is assigned to this milestone for this work order
                                return milestone.work_order_account_assignees.some(
                                    (assignee) => {
                                        return (
                                            assignee.employee_id ===
                                                selectedAssigneeId &&
                                            assignee.submilestone_id ===
                                                milestone.id &&
                                            assignee.work_order_id ===
                                                (step.workOrder
                                                    ?.work_order_id ||
                                                    step.workOrder?.id)
                                        );
                                    }
                                );
                            }
                        );
                    }

                    // Filter milestones by buyer-related checklists
                    if (buyerFilter !== "All") {
                        milestonesToProcess = milestonesToProcess.filter(
                            (milestone) => {
                                if (
                                    !milestone.checklists ||
                                    milestone.checklists.length === 0
                                )
                                    return false;

                                const hasBuyerRelatedChecklist =
                                    milestone.checklists.some(
                                        (checklist) =>
                                            checklist.is_buyer_related === true
                                    );
                                const hasNonBuyerRelatedChecklist =
                                    milestone.checklists.some(
                                        (checklist) =>
                                            checklist.is_buyer_related === false
                                    );

                                if (buyerFilter === "Buyer Related") {
                                    return hasBuyerRelatedChecklist;
                                } else if (buyerFilter === "Non-buyer") {
                                    return hasNonBuyerRelatedChecklist;
                                }
                                return true;
                            }
                        );
                    }

                    milestonesToProcess.forEach((sub) => {
                        const checklists = sub.checklists || [];
                        const uploadedDocs = account.uploaded_documents || [];
                        let currentChecklistItem = null;
                        let completedCount = 0;
                        const completedChecklists = [];
                        const pendingChecklists = [];
                        for (const checklist of checklists) {
                            const hasUploadedDoc = uploadedDocs.some(
                                (doc) => doc.file_title === checklist.name
                            );
                            const accountChecklistStatus = (
                                account.account_checklist_statuses || []
                            ).find(
                                (status) => status.checklist_id === checklist.id
                            );
                            const hasCompletedStatus =
                                accountChecklistStatus &&
                                accountChecklistStatus.is_completed;
                            if (hasUploadedDoc || hasCompletedStatus) {
                                completedCount++;
                                completedChecklists.push({
                                    ...checklist,
                                    completedVia: hasUploadedDoc
                                        ? "document"
                                        : "status",
                                    completedDate: hasUploadedDoc
                                        ? uploadedDocs.find(
                                              (doc) =>
                                                  doc.file_title ===
                                                  checklist.name
                                          )?.created_at
                                        : accountChecklistStatus?.updated_at,
                                });
                            } else {
                                pendingChecklists.push(checklist);
                                if (!currentChecklistItem) {
                                    currentChecklistItem = checklist;
                                }
                            }
                        }
                        checklistInfos.push({
                            stepName: step.stepName,
                            milestoneName: sub.name,
                            totalChecklists: checklists.length,
                            completedCount: completedCount,
                            currentChecklistItem: currentChecklistItem,
                            completedChecklists: completedChecklists,
                            pendingChecklists: pendingChecklists,
                            progressPercentage:
                                checklists.length > 0
                                    ? Math.round(
                                          (completedCount / checklists.length) *
                                              100
                                      )
                                    : 0,
                            subMilestoneId: sub.id,
                        });
                    });
                });

            // Find current submilestone information
            let currentChecklistInfo = null;
            if (account.currentSubMilestoneId) {
                for (const step of steps) {
                    const currentSubmilestone = step.subMilestones.find(
                        (sub) => sub.id === account.currentSubMilestoneId
                    );
                    if (currentSubmilestone) {
                        const checklists = currentSubmilestone.checklists || [];
                        const uploadedDocs = account.uploaded_documents || [];
                        let currentChecklistItem = null;
                        let completedCount = 0;
                        const completedChecklists = [];
                        const pendingChecklists = [];
                        for (const checklist of checklists) {
                            const hasUploadedDoc = uploadedDocs.some(
                                (doc) => doc.file_title === checklist.name
                            );
                            const accountChecklistStatus = (
                                account.account_checklist_statuses || []
                            ).find(
                                (status) => status.checklist_id === checklist.id
                            );
                            const hasCompletedStatus =
                                accountChecklistStatus &&
                                accountChecklistStatus.is_completed;
                            if (hasUploadedDoc || hasCompletedStatus) {
                                completedCount++;
                                completedChecklists.push({
                                    ...checklist,
                                    completedVia: hasUploadedDoc
                                        ? "document"
                                        : "status",
                                    completedDate: hasUploadedDoc
                                        ? uploadedDocs.find(
                                              (doc) =>
                                                  doc.file_title ===
                                                  checklist.name
                                          )?.created_at
                                        : accountChecklistStatus?.updated_at,
                                });
                            } else {
                                pendingChecklists.push(checklist);
                                if (!currentChecklistItem) {
                                    currentChecklistItem = checklist;
                                }
                            }
                        }
                        currentChecklistInfo = {
                            stepName: step.stepName,
                            milestoneName: currentSubmilestone.name,
                            totalChecklists: checklists.length,
                            completedCount: completedCount,
                            currentChecklistItem: currentChecklistItem,
                            completedChecklists: completedChecklists,
                            pendingChecklists: pendingChecklists,
                            progressPercentage:
                                checklists.length > 0
                                    ? Math.round(
                                          (completedCount / checklists.length) *
                                              100
                                      )
                                    : 0,
                        };
                        break;
                    }
                }
            }

            // Check for milestone progression after setting currentChecklistInfo
            if (
                currentChecklistInfo &&
                currentChecklistInfo.progressPercentage === 100
            ) {
                const nextSubmilestoneId = checkMilestoneProgression(
                    account,
                    steps
                );
                if (
                    nextSubmilestoneId &&
                    nextSubmilestoneId !== account.currentSubMilestoneId
                ) {
                    updateMilestoneProgression(account.id, nextSubmilestoneId);
                }
            }

            // Determine the overall status based on whether all checklists for the account are complete.
            const overallStatus = account.checklist_status
                ? "Complete"
                : "In Progress";

            const notesData = {
                accountId: account.id,
                workOrder: account.latestStep.workOrder,
                workOrderType: "All Steps",
                addNoteLogType:
                    account.latestStep.workOrder.work_order_type?.type_name,
                assignee: account.latestStep.workOrder.assignee,
                currentUser: group.currentUser,
                workOrderGroupId: group.id,
            };

            return {
                key: account.id,
                accountName: account.account_name,
                property_name: account.property_name,
                stepData,
                status: overallStatus,
                remarks: account.remarks,
                notesData: notesData,
                currentSubMilestoneId: account.current_submilestone_id,
                currentChecklistInfo: currentChecklistInfo,
                uploaded_documents: account.uploaded_documents || [],
                checklistInfos,
            };
        });

        // Filter rows based on search term, status, buyer type, and assignee
        const filteredRows = tableRows.filter((row) => {
            const searchMatch =
                searchTerm === "" ||
                row.accountName
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                row.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
                row.remarks.toLowerCase().includes(searchTerm.toLowerCase());

            const statusMatch =
                statusFilter === "All" || row.status === statusFilter;

            // Note: Buyer filter now filters columns instead of rows
            const buyerMatch = true;

            // Assignee filter logic
            const assigneeMatch = (() => {
                if (assigneeFilter === "All") return true;

                // Check if any step in this row has the selected assignee
                const account = Object.values(accountMap).find(
                    (acc) => acc.id === row.key
                );
                if (!account) return true;

                // Check work order assignee
                if (
                    account.latestStep?.workOrder?.assignee?.id?.toString() ===
                    assigneeFilter
                ) {
                    return true;
                }

                // Check account-specific assignees if they exist
                const accountAssignees = account.assignees || [];
                return accountAssignees.some(
                    (assignee) => assignee.id?.toString() === assigneeFilter
                );
            })();

            return searchMatch && statusMatch && buyerMatch && assigneeMatch;
        });

        const totalPages = Math.ceil(filteredRows.length / itemsPerPage);

        // Calculate ChecklistTable accounts for pagination
        const checklistTableAccounts = (() => {
            const allAccounts = Object.values(
                steps.reduce((acc, step) => {
                    (step.workOrder.accounts || []).forEach((account) => {
                        acc[account.id] = account;
                    });
                    return acc;
                }, {})
            );
            // Filter using the same logic as filteredRows
            return allAccounts.filter((account) => {
                const searchMatch =
                    searchTerm === "" ||
                    (account.account_name &&
                        account.account_name
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())) ||
                    (account.remarks &&
                        account.remarks
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()));
                return searchMatch;
            });
        })();

        return {
            columnHeaders,
            tableRows,
            filteredRows,
            totalPages,
            steps,
            checklistTableAccounts,
        };
    }, [
        group,
        searchTerm,
        itemsPerPage,
        statusFilter,
        buyerFilter,
        assigneeFilter,
        visibleSteps,
        stepAssigneeFilter,
    ]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredRows.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredRows, currentPage, itemsPerPage]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (value) => {
        setItemsPerPage(parseInt(value));
        setCurrentPage(1);
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleStatusFilterChange = (value) => {
        setStatusFilter(value);
        setCurrentPage(1);
    };

    // New filter handlers
    const handleBuyerFilterChange = (value) => {
        setBuyerFilter(value);
        setCurrentPage(1);
    };

    const handleStepViewToggle = (checked) => {
        setShowStepView(checked);
    };

    const handleStepVisibilityToggle = (stepId) => {
        setVisibleSteps((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(stepId)) {
                newSet.delete(stepId);
            } else {
                newSet.add(stepId);
            }
            return newSet;
        });
    };

    const handleToggleAllSteps = (checked) => {
        if (checked) {
            setVisibleSteps(new Set(availableSteps.map((step) => step.id)));
        } else {
            setVisibleSteps(new Set());
        }
    };

    const handleAssigneeFilterChange = (value) => {
        setAssigneeFilter(value);
        setCurrentPage(1);
    };

    const handleStepAssigneeFilterChange = (value) => {
        setStepAssigneeFilter(value);

        // Auto-update visible steps based on assignee filter
        if (value === "All") {
            // Show all steps when "All" is selected
            setVisibleSteps(new Set(availableSteps.map((step) => step.id)));
        } else {
            // Filter steps to only show those assigned to the selected assignee
            if (group?.submilestonesByType) {
                const selectedAssigneeId = parseInt(value);
                const stepsWithAssignee = new Set();

                Object.keys(group.submilestonesByType).forEach((stepId) => {
                    const milestones = group.submilestonesByType[stepId];

                    const hasAssignee = milestones.some((milestone) => {
                        // Use work_order_account_assignees instead of milestone_assignees
                        if (
                            !milestone.work_order_account_assignees ||
                            milestone.work_order_account_assignees.length === 0
                        ) {
                            return false;
                        }

                        return milestone.work_order_account_assignees.some(
                            (assignee) => {
                                return (
                                    assignee.employee_id ===
                                        selectedAssigneeId &&
                                    assignee.submilestone_id === milestone.id
                                );
                            }
                        );
                    });

                    if (hasAssignee) {
                        stepsWithAssignee.add(parseInt(stepId));
                    }
                });
                setVisibleSteps(stepsWithAssignee);
            } else {
                setVisibleSteps(new Set(availableSteps.map((step) => step.id)));
            }
        }
    };

    const handleHideCompletedChecklistsChange = (value) => {
        setHideCompletedChecklists(value);
    };

    const handleOpenNotesModal = (notesData) => {
        setSelectedAccountForNotes(notesData);
        setIsNotesModalOpen(true);
    };

    const handleCloseNotesModal = () => {
        setIsNotesModalOpen(false);
        setSelectedAccountForNotes(null);
    };

    const handleMilestoneProgression = async (accountId) => {
        try {
            const account = paginatedData.find((row) => row.key === accountId);
            if (account) {
                const nextSubmilestoneId = checkMilestoneProgression(
                    account,
                    steps
                );
                if (nextSubmilestoneId) {
                    await updateMilestoneProgression(
                        accountId,
                        nextSubmilestoneId
                    );
                }
            }
        } catch (error) {
            console.error("Error in milestone progression:", error);
        }
    };

    const handleRefresh = async () => {
        if (isRefreshing || !onRefresh) return;

        setIsRefreshing(true);

        // Reset all filters to default values
        setSearchTerm("");
        setStatusFilter("All");
        setBuyerFilter("All");
        setAssigneeFilter("All");
        setStepAssigneeFilter("All");
        setHideCompletedChecklists(false);
        setCurrentPage(1);

        // Reset visible steps to show all
        if (availableSteps.length > 0) {
            setVisibleSteps(new Set(availableSteps.map((step) => step.id)));
        }

        try {
            await onRefresh();
        } catch (error) {
            console.error("Error refreshing data:", error);
            setProgressionStatus({
                isProgressing: false,
                message: "Failed to refresh data. Please try again.",
                type: "error",
            });
            setTimeout(
                () =>
                    setProgressionStatus({
                        isProgressing: false,
                        message: "",
                        type: "info",
                    }),
                5000
            );
        } finally {
            setIsRefreshing(false);
        }
    };

    const checkGroupCompletion = async () => {
        if (!group?.id) return;

        try {
            const response = await apiService.post(
                `/work-order-groups/${group.id}/check-accounts-completion`
            );

            if (
                response.data.success &&
                response.data.data.all_accounts_completed
            ) {
                setProgressionStatus({
                    isProgressing: false,
                    message:
                        "🎉 All accounts completed! Work Order Group status updated to Complete.",
                    type: "success",
                });

                if (onRefresh) {
                    await onRefresh();
                }

                setTimeout(
                    () =>
                        setProgressionStatus({
                            isProgressing: false,
                            message: "",
                            type: "info",
                        }),
                    5000
                );
            }
        } catch (error) {
            console.error("Error checking group completion:", error);
        }
    };

    if (!isOpen) return null;

    return (
        <Dialog
            open={isOpen}
            handler={onClose}
            size="xxl"
            className="max-w-none w-screen h-screen m-0 rounded-none"
        >
            {/* Header */}
            <DialogHeader className="bg-white border-b border-gray-200 p-4 rounded-none">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 gradient-btn5 rounded flex items-center justify-center">
                            <svg
                                className="w-4 h-4 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                <path
                                    fillRule="evenodd"
                                    d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6.5a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 016 11.5V5z"
                                />
                            </svg>
                        </div>
                        <div>
                            <Typography
                                variant="h5"
                                className="text-gray-800 font-semibold"
                            >
                                Work Order No. {group?.id}
                            </Typography>
                        </div>
                    </div>
                    <IconButton
                        variant="text"
                        size="sm"
                        onClick={onClose}
                        className="hover:bg-gray-100 text-gray-600"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            />
                        </svg>
                    </IconButton>
                </div>
            </DialogHeader>

            <EnhancedControlBar
                searchTerm={searchTerm}
                onSearchChange={handleSearch}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={handleItemsPerPageChange}
                statusFilter={statusFilter}
                onStatusFilterChange={handleStatusFilterChange}
                buyerFilter={buyerFilter}
                onBuyerFilterChange={handleBuyerFilterChange}
                showStepView={showStepView}
                onStepViewToggle={handleStepViewToggle}
                assigneeFilter={assigneeFilter}
                onAssigneeFilterChange={handleAssigneeFilterChange}
                availableAssignees={availableAssignees}
                // Step visibility props
                availableSteps={availableSteps}
                visibleSteps={visibleSteps}
                onStepVisibilityToggle={handleStepVisibilityToggle}
                onToggleAllSteps={handleToggleAllSteps}
                // Step assignee filter props
                stepAssigneeFilter={stepAssigneeFilter}
                onStepAssigneeFilterChange={handleStepAssigneeFilterChange}
                onRefresh={handleRefresh}
                isRefreshing={isRefreshing}
                hideItemsPerPage={false}
                hideStatusFilter={showChecklistTable}
                hideBuyerFilter={showChecklistTable}
                hideStepViewToggle={false}
                hideAssigneeFilter={false}
                hideStepVisibility={showChecklistTable}
                hideStepAssigneeFilter={showChecklistTable}
                hideCompletedChecklists={hideCompletedChecklists}
                onHideCompletedChecklistsChange={
                    handleHideCompletedChecklistsChange
                }
                hideCompletedChecklistsFilter={!showChecklistTable}
            />

            {/* Milestone Progression Notification */}
            {progressionStatus.message && (
                <div
                    className={`mx-4 mb-4 p-3 rounded-lg border ${
                        progressionStatus.type === "success"
                            ? "bg-green-50 border-green-200 text-green-800"
                            : progressionStatus.type === "error"
                            ? "bg-red-50 border-red-200 text-red-800"
                            : "bg-blue-50 border-blue-200 text-blue-800"
                    }`}
                >
                    <div className="flex items-center">
                        {progressionStatus.isProgressing && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        )}
                        <span className="text-sm font-medium">
                            {progressionStatus.message}
                        </span>
                    </div>
                </div>
            )}

            {/* Table Content */}
            <DialogBody
                className={`p-0 flex-1 flex flex-col min-h-0 ${
                    showChecklistTable ? "overflow-hidden" : "overflow-y-auto"
                }`}
            >
                {isLoading ? (
                    <div className="flex items-center justify-center h-full bg-gray-50">
                        <div className="text-center">
                            <svg
                                className="animate-spin h-8 w-8 text-blue-600 mx-auto"
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
                                    d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                            <Typography color="gray" className="mt-4 text-sm">
                                Loading...
                            </Typography>
                        </div>
                    </div>
                ) : showChecklistTable ? (
                    <>
                        <ChecklistTable
                            steps={steps || []}
                            accounts={checklistTableAccounts || []}
                            onAddFiles={handleAddFiles}
                            handleOpenNotesModal={handleOpenNotesModal}
                            currentUserId={currentUserId}
                            onRefresh={onRefresh}
                            currentPage={currentPage}
                            itemsPerPage={itemsPerPage}
                            hideCompletedChecklists={hideCompletedChecklists}
                        />

                        {isAddFilesModalOpen && (
                            <AddFilesModal
                                selectedAccountId={selectedAccountId}
                                selectedWorkOrder={selectedStepName}
                                workOrderData={selectedWorkOrder}
                                selectedChecklist={selectedChecklist}
                                onClose={() => setIsAddFilesModalOpen(false)}
                                onRefresh={onRefresh}
                            />
                        )}
                    </>
                ) : !showStepView ? (
                    <div className="flex items-center justify-center h-96 bg-gray-50">
                        <div className="text-center">
                            <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                            </svg>
                            <Typography
                                variant="h6"
                                color="gray"
                                className="mt-4"
                            >
                                Step View Hidden
                            </Typography>
                            <Typography color="gray" className="mt-2 text-sm">
                                Enable "Show Step View" to see the detailed step
                                table.
                            </Typography>
                        </div>
                    </div>
                ) : paginatedData.length > 0 ? (
                    <div className="h-full overflow-x-auto overflow-y-auto">
                        <table className="w-full text-left border-separate border-spacing-0 bg-white min-w-max">
                            <thead className="sticky top-0 z-50 bg-custom-bluegreen">
                                {/* Row 1: Step headers */}
                                <tr className="bg-custom-bluegreen text-white">
                                    <th
                                        className="px-3 py-2 font-medium sticky left-0 bg-custom-bluegreen z-50 border-r border-white min-w-[180px] shadow-lg"
                                        style={{ backgroundColor: "#175D5F" }}
                                        rowSpan={3}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="flex flex-col items-center justify-center w-full">
                                                <svg
                                                    className="w-4 h-4 mb-1"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                                                </svg>
                                                <span className="text-xs font-semibold text-center block">
                                                    ACCOUNT NAME
                                                </span>
                                            </div>
                                        </div>
                                    </th>
                                    {columnHeaders.map((col, idx) => {
                                        // Check if this step is the current step for any account
                                        const isCurrentStepForAnyAccount =
                                            paginatedData.some((row) => {
                                                return col.subMilestones.some(
                                                    (sub) =>
                                                        sub.id ===
                                                        row.currentSubMilestoneId
                                                );
                                            });

                                        return (
                                            <th
                                                key={idx}
                                                colSpan={
                                                    col.subMilestones.length * 2
                                                }
                                                className={`text-center px-2 py-2 font-medium border-x border-white min-w-[100px] relative ${
                                                    isCurrentStepForAnyAccount
                                                        ? "bg-blue-600 border-2 border-blue-800 shadow-lg ring-2 ring-blue-300 ring-opacity-50 z-30"
                                                        : "bg-custom-bluegreen"
                                                }`}
                                                style={{
                                                    backgroundColor:
                                                        isCurrentStepForAnyAccount
                                                            ? "#2563eb"
                                                            : "var(--tw-bg-opacity, 1)",
                                                }}
                                            >
                                                <span
                                                    className={`text-xs font-semibold uppercase tracking-wide ${
                                                        isCurrentStepForAnyAccount
                                                            ? "text-white"
                                                            : ""
                                                    }`}
                                                >
                                                    {col.stepName}
                                                </span>
                                                {isCurrentStepForAnyAccount && (
                                                    <>
                                                        <div className="absolute top-0.5 left-0.5 w-2 h-2 bg-white rounded-full animate-pulse border border-blue-200 shadow-sm"></div>
                                                        <div className="absolute top-0.5 right-0.5 px-1 py-0.5 bg-white text-blue-800 text-[8px] rounded font-bold shadow-sm leading-none">
                                                            CURRENT
                                                        </div>
                                                    </>
                                                )}
                                            </th>
                                        );
                                    })}
                                    <th
                                        className="px-2 py-2 font-medium border-l border-white min-w-[80px] bg-custom-bluegreen"
                                        style={{
                                            backgroundColor:
                                                "var(--tw-bg-opacity, 1)",
                                        }}
                                        rowSpan={3}
                                    >
                                        <div className="flex items-center justify-center gap-1">
                                            <svg
                                                className="w-3 h-3"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                />
                                            </svg>
                                            <span className="text-xs font-semibold">
                                                STATUS
                                            </span>
                                        </div>
                                    </th>
                                    <th
                                        className="px-2 py-2 font-medium border-l border-white min-w-[120px] bg-custom-bluegreen"
                                        style={{
                                            backgroundColor:
                                                "var(--tw-bg-opacity, 1)",
                                        }}
                                        rowSpan={3}
                                    >
                                        <div className="flex items-center justify-center gap-1">
                                            <svg
                                                className="w-3 h-3"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                                />
                                            </svg>
                                            <span className="text-xs font-semibold">
                                                REMARKS
                                            </span>
                                        </div>
                                    </th>
                                    <th
                                        className="px-2 py-2 font-medium border-l border-white min-w-[80px] bg-custom-bluegreen"
                                        style={{
                                            backgroundColor:
                                                "var(--tw-bg-opacity, 1)",
                                        }}
                                        rowSpan={3}
                                    >
                                        <div className="flex items-center justify-center gap-1">
                                            <svg
                                                className="w-3 h-3"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                            </svg>
                                            <span className="text-xs font-semibold">
                                                ACTION
                                            </span>
                                        </div>
                                    </th>
                                </tr>

                                {/* Row 2: Sub-milestone headers */}
                                <tr className="bg-custom-bluegreen text-white">
                                    {columnHeaders.map((col, idx) =>
                                        col.subMilestones.map(
                                            (milestone, i) => (
                                                <th
                                                    key={`${idx}-${i}`}
                                                    colSpan={2}
                                                    className="text-center px-2 py-1 font-medium border-x border-y border-white min-w-[180px] bg-custom-bluegreen"
                                                    style={{
                                                        backgroundColor:
                                                            "var(--tw-bg-opacity, 1)",
                                                    }}
                                                >
                                                    <span
                                                        className="text-xs font-medium block"
                                                        title={milestone}
                                                    >
                                                        {milestone}
                                                    </span>
                                                </th>
                                            )
                                        )
                                    )}
                                </tr>

                                {/* Row 3: Date sub-headers */}
                                <tr className="bg-custom-bluegreen text-white">
                                    {columnHeaders.map((col, idx) =>
                                        col.subMilestones.map(
                                            (milestone, i) => (
                                                <React.Fragment
                                                    key={`${idx}-${i}-dates`}
                                                >
                                                    <th
                                                        className="text-center px-1 py-1 font-medium border-x border-white min-w-[90px] bg-custom-bluegreen"
                                                        style={{
                                                            backgroundColor:
                                                                "var(--tw-bg-opacity, 1)",
                                                        }}
                                                    >
                                                        <span className="text-xs font-medium">
                                                            Date Created
                                                        </span>
                                                    </th>
                                                    <th
                                                        className="text-center px-1 py-1 font-medium border-x border-white min-w-[90px] bg-custom-bluegreen"
                                                        style={{
                                                            backgroundColor:
                                                                "var(--tw-bg-opacity, 1)",
                                                        }}
                                                    >
                                                        <span className="text-xs font-medium">
                                                            Date Updated
                                                        </span>
                                                    </th>
                                                </React.Fragment>
                                            )
                                        )
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedData.map((row) => (
                                    <WorkOrderMilestoneRow
                                        key={row.key}
                                        row={row}
                                        steps={steps.filter((step) => {
                                            if (!visibleSteps.has(step.id))
                                                return false;

                                            // Apply the same buyer filter logic to steps passed to the row component
                                            if (buyerFilter !== "All") {
                                                const hasMatchingMilestones =
                                                    step.subMilestones.some(
                                                        (milestone) => {
                                                            if (
                                                                !milestone.checklists ||
                                                                milestone
                                                                    .checklists
                                                                    .length ===
                                                                    0
                                                            )
                                                                return false;

                                                            const hasBuyerRelatedChecklist =
                                                                milestone.checklists.some(
                                                                    (
                                                                        checklist
                                                                    ) =>
                                                                        checklist.is_buyer_related ===
                                                                        true
                                                                );
                                                            const hasNonBuyerRelatedChecklist =
                                                                milestone.checklists.some(
                                                                    (
                                                                        checklist
                                                                    ) =>
                                                                        checklist.is_buyer_related ===
                                                                        false
                                                                );

                                                            if (
                                                                buyerFilter ===
                                                                "Buyer Related"
                                                            ) {
                                                                return hasBuyerRelatedChecklist;
                                                            } else if (
                                                                buyerFilter ===
                                                                "Non-buyer"
                                                            ) {
                                                                return hasNonBuyerRelatedChecklist;
                                                            }
                                                            return true;
                                                        }
                                                    );

                                                return hasMatchingMilestones;
                                            }

                                            return true;
                                        })}
                                        getStatusBadge={getStatusBadge}
                                        handleOpenNotesModal={
                                            handleOpenNotesModal
                                        }
                                        onShowFiles={() =>
                                            handleShowFilesModal(row)
                                        }
                                        currentChecklistInfo={
                                            row.currentChecklistInfo
                                        }
                                        onMilestoneProgression={
                                            handleMilestoneProgression
                                        }
                                        isFiltered={
                                            // Check if any filters are active
                                            searchTerm.trim() !== "" ||
                                            statusFilter !== "All" ||
                                            buyerFilter !== "All" ||
                                            assigneeFilter !== "All" ||
                                            stepAssigneeFilter !== "All" ||
                                            hideCompletedChecklists ||
                                            // Check if column visibility (visibleSteps) is filtered
                                            (group?.work_orders &&
                                                visibleSteps.size <
                                                    group.work_orders.length)
                                        }
                                    />
                                ))}
                                <AccountFilesModal
                                    isOpen={filesModalOpen}
                                    onClose={() => setFilesModalOpen(false)}
                                    files={selectedFiles}
                                    accountInfo={selectedAccountInfo}
                                />
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full bg-gray-50">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                                <svg
                                    className="w-6 h-6 text-gray-400"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                    />
                                </svg>
                            </div>
                            <Typography
                                variant="h6"
                                className="text-gray-600 mb-1"
                            >
                                No Results Found
                            </Typography>
                            <Typography className="text-gray-500 text-sm">
                                {searchTerm
                                    ? `No accounts match "${searchTerm}"`
                                    : "No data available"}
                            </Typography>
                        </div>
                    </div>
                )}
            </DialogBody>

            {/* Pagination Footer */}
            <DialogFooter className="bg-white border-t border-gray-200 p-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
                    <Typography variant="small" className="text-gray-600">
                        Page {currentPage} of{" "}
                        {showChecklistTable
                            ? Math.ceil(
                                  checklistTableAccounts.length / itemsPerPage
                              )
                            : totalPages}{" "}
                        •{" "}
                        {showChecklistTable
                            ? checklistTableAccounts.length
                            : filteredRows.length}{" "}
                        entries
                    </Typography>

                    <div className="flex items-center gap-1">
                        {(() => {
                            const currentTotalPages = showChecklistTable
                                ? Math.ceil(
                                      checklistTableAccounts.length /
                                          itemsPerPage
                                  )
                                : totalPages;
                            return (
                                <>
                                    <Button
                                        variant="outlined"
                                        size="sm"
                                        onClick={() => handlePageChange(1)}
                                        disabled={currentPage === 1}
                                        className="border-gray-300 text-gray-700 hover:bg-gray-50 px-2 py-1 text-xs"
                                    >
                                        First
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="sm"
                                        onClick={() =>
                                            handlePageChange(currentPage - 1)
                                        }
                                        disabled={currentPage === 1}
                                        className="border-gray-300 text-gray-700 hover:bg-gray-50 px-2 py-1 text-xs"
                                    >
                                        ‹
                                    </Button>

                                    <div className="flex items-center gap-1">
                                        {(() => {
                                            let start = Math.max(
                                                1,
                                                currentPage - 2
                                            );
                                            let end = Math.min(
                                                currentTotalPages,
                                                currentPage + 2
                                            );
                                            if (end - start < 4) {
                                                if (start === 1) {
                                                    end = Math.min(
                                                        currentTotalPages,
                                                        start + 4
                                                    );
                                                } else if (
                                                    end === currentTotalPages
                                                ) {
                                                    start = Math.max(
                                                        1,
                                                        end - 4
                                                    );
                                                }
                                            }
                                            const pageNumbers = [];
                                            for (let i = start; i <= end; i++) {
                                                pageNumbers.push(i);
                                            }
                                            return pageNumbers.map(
                                                (pageNum) => (
                                                    <Button
                                                        key={pageNum}
                                                        variant={
                                                            currentPage ===
                                                            pageNum
                                                                ? "filled"
                                                                : "outlined"
                                                        }
                                                        size="sm"
                                                        onClick={() =>
                                                            handlePageChange(
                                                                pageNum
                                                            )
                                                        }
                                                        className={
                                                            currentPage ===
                                                            pageNum
                                                                ? "bg-custom-lightgreen text-white px-2 py-1 text-xs min-w-[28px]"
                                                                : "border-gray-300 text-gray-700 hover:bg-gray-50 px-2 py-1 text-xs min-w-[28px]"
                                                        }
                                                    >
                                                        {pageNum}
                                                    </Button>
                                                )
                                            );
                                        })()}
                                    </div>

                                    <Button
                                        variant="outlined"
                                        size="sm"
                                        onClick={() =>
                                            handlePageChange(currentPage + 1)
                                        }
                                        disabled={
                                            currentPage === currentTotalPages
                                        }
                                        className="border-gray-300 text-gray-700 hover:bg-gray-50 px-2 py-1 text-xs"
                                    >
                                        ›
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="sm"
                                        onClick={() =>
                                            handlePageChange(currentTotalPages)
                                        }
                                        disabled={
                                            currentPage === currentTotalPages
                                        }
                                        className="border-gray-300 text-gray-700 hover:bg-gray-50 px-2 py-1 text-xs"
                                    >
                                        Last
                                    </Button>
                                </>
                            );
                        })()}
                    </div>
                </div>
            </DialogFooter>

            {isNotesModalOpen && selectedAccountForNotes && (
                <NotesAndUpdatesModal
                    selectedAccountId={selectedAccountForNotes.accountId}
                    onClose={handleCloseNotesModal}
                    selectedWorkOrder={selectedAccountForNotes.workOrderType}
                    addNoteLogType={selectedAccountForNotes.addNoteLogType}
                    selectedAssignee={selectedAccountForNotes.assignee}
                    workOrderData={{
                        work_order_id:
                            selectedAccountForNotes.workOrder.work_order_id,
                        work_order_group_id:
                            selectedAccountForNotes.workOrderGroupId,
                        currentUser: selectedAccountForNotes.currentUser,
                    }}
                    checklistId={selectedAccountForNotes.checklistId}
                    checklistName={selectedAccountForNotes.checklistName}
                    onRefresh={onRefresh}
                />
            )}
        </Dialog>
    );
};

export default WorkOrderGroupDetailsModal;

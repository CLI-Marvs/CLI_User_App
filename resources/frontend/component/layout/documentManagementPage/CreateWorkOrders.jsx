import { useState, useEffect, useRef, useMemo } from "react";
import ReactDOM from "react-dom";
import apiService from "../../../component/servicesApi/apiService";
import { useStateContext } from "../../../context/contextprovider";
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
    const {
        accounts,
        assignee,
        workOrderTypes,
        fetchAccounts,
        fetchWorkOrders,
        user,
    } = useStateContext();

    useEffect(() => {
        fetchAccounts();
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
        }
    }, [isOpen]);

    const firstWorkOrderType = useMemo(() => {
        if (!workOrderTypes || workOrderTypes.length === 0) {
            return null;
        }
        // Assuming workOrderTypes are already sorted by sequence from the context/API
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

    const handleSubmit = async (event) => {
        event.preventDefault();

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
            step.milestones.forEach((milestone) => {
                milestone.assignees.forEach((assignee) => {
                    if (
                        !allProjectAssignees.find(
                            (emp) => emp.id === assignee.id
                        )
                    ) {
                        allProjectAssignees.push(assignee);
                    }
                });
            });
        });

        if (allProjectAssignees.length === 0) {
            alert(
                "The selected project has no assigned employees. Please assign employees to this project first."
            );
            return;
        }

        // Assign each account to a project assignee in ascending order (round-robin)
        const accountAssignments = selectedAccounts.map((account, idx) => {
            const assignee =
                allProjectAssignees[idx % allProjectAssignees.length];
            return {
                account_id: account.id,
                employee_id: assignee.id,
            };
        });

        if (accountAssignments.some((a) => !a.employee_id)) {
            alert("One or more accounts could not be assigned to an employee.");
            return;
        }

        const formData = {
            work_order: firstWorkOrderType?.type_name,
            account_ids: selectedAccounts.map((account) => account.id),
            work_order_type_id: firstWorkOrderType?.id,
            work_order_deadline: formattedDueDate,
            status: "In Progress",
            description: "",
            priority: "Medium",
            created_by_user_id: user.id,
            account_assignments: accountAssignments,
        };
        console.log("Submitting work order:", formData);
        try {
            const response = await apiService.post(
                "/work-orders/create-work-order",
                formData
            );

            if (response.status === 201) {
                console.log("Full response data:", response.data);
                const newWorkOrderId = response.data.data.work_order_id;
                const workOrderGroupId = response.data.data.work_order_group_id;
                console.log("Work Order ID:", newWorkOrderId);
                console.log("Work Order Group ID:", workOrderGroupId);
                setWorkOrderId(workOrderGroupId || newWorkOrderId);
                setIsModalOpen(true);
                fetchWorkOrders();

                if (response.status === 201) {
                    const newWorkOrderId = response.data.data.work_order_id;
                    const workOrderGroupId =
                        response.data.data.work_order_group_id;
                    setWorkOrderId(workOrderGroupId || newWorkOrderId);
                    setIsModalOpen(true);
                    fetchWorkOrders();

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
                                    <SearchableDropdown
                                        options={projects.map((p) => ({
                                            id: p,
                                            name: p,
                                        }))}
                                        selectedOptions={
                                            selectedProject
                                                ? [
                                                      {
                                                          id: selectedProject,
                                                          name: selectedProject,
                                                      },
                                                  ]
                                                : []
                                        }
                                        setSelectedOptions={(newOptions) => {
                                            setSelectedProject(
                                                newOptions[0]?.name || ""
                                            );
                                            setSelectedAccounts([]);
                                        }}
                                        placeholder="Filter by Project"
                                        showCheckbox={false}
                                        showSelectedTags={false}
                                        hideInputValue={false}
                                    />
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
                                    <SearchableDropdown
                                        options={filteredAccounts}
                                        selectedOptions={selectedAccounts}
                                        setSelectedOptions={setSelectedAccounts}
                                        optionKey="id"
                                        placeholder="Select Account"
                                        showCheckbox={true}
                                        showSelectedTags={true}
                                        hideInputValue={true}
                                        showSelectAll={true}
                                    />
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

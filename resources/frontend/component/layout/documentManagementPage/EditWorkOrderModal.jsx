import { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import apiService from "../../../component/servicesApi/apiService";
import { useStateContext } from "../../../context/contextprovider";
import DatePicker from "react-datepicker";
import SearchableDropdown from "./SearchableDropdown";

const EditWorkOrderModal = ({
    isOpen,
    onClose,
    workOrder,
    onWorkOrderUpdated,
}) => {
    const [selectedAccounts, setSelectedAccounts] = useState([]);
    const [selectedWorkOrderType, setSelectedWorkOrderType] = useState(null);
    const [selectedAssignee, setSelectedAssignee] = useState(null);
    const [dueDate, setDueDate] = useState("");
    const modalRef = useRef();
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
        if (isOpen && workOrder) {
            setSelectedWorkOrderType(
                workOrderTypes.find(
                    (type) => type.id === workOrder.work_order_type_id
                ) || null
            );
            setSelectedAccounts(
                accounts.filter((acc) =>
                    (workOrder.accounts || []).some(
                        (wacc) => wacc.id === acc.id
                    )
                )
            );
            setSelectedAssignee(
                assignee.find((a) => a.id === workOrder.assigned_to_user_id) ||
                    null
            );
            setDueDate(
                workOrder.work_order_deadline
                    ? new Date(workOrder.work_order_deadline)
                    : ""
            );
        }
    }, [isOpen, workOrder, accounts, assignee, workOrderTypes]);

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === "Escape" && isOpen) {
                onClose();
            }
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        let formattedDueDate = null;
        if (dueDate) {
            formattedDueDate = dueDate.toISOString().slice(0, 10);
        }

        const formData = {
            work_order_id: workOrder.id,
            work_order: selectedWorkOrderType?.type_name,
            account_ids: selectedAccounts.map((account) => account.id),
            assigned_to_user_id: selectedAssignee?.id,
            work_order_type_id: selectedWorkOrderType?.id,
            work_order_deadline: formattedDueDate,
            status: workOrder.status || "Pending",
            description: workOrder.description || "",
            priority: workOrder.priority || "Medium",
            updated_by_user_id: user.id,
        };

        try {
            const response = await apiService.put(
                `/work-orders/${workOrder.work_order_id}`,
                formData
            );
            if (
                response.status === 200 ||
                response.data?.message === "Work order updated successfully."
            ) {
                const logEntry = {
                    work_order_id: workOrder.work_order_id,
                    log_type: selectedWorkOrderType?.type_name,
                    log_message: `Work Order #${workOrder.work_order_id} has been updated.`,
                    account_ids: selectedAccounts.map((account) => account.id),
                    created_by_user_id: user.id,
                    assigned_user_id: selectedAssignee?.id,
                };

                await apiService.post("/work-order-logs", logEntry);

                fetchWorkOrders();
                if (onWorkOrderUpdated) onWorkOrderUpdated();
                onClose();
            } else {
                console.error("Error updating work order:", response);
            }
        } catch (error) {
            console.error("Error updating work order:", error.message || error);
        }
    };
    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] p-4"
            onClick={onClose}
        >
            <div
                ref={modalRef}
                className="bg-white rounded-lg shadow-xl p-6 w-full max-w-[700px] transform transition-all duration-300 ease-out scale-100 opacity-100"
                onClick={(e) => e.stopPropagation()}
            >
                <>
                    <div className="flex justify-between items-start pb-4 border-b border-gray-200">
                        <div>
                            <h3 className="text-custom-lightgreen font-normal text-base mb-0">
                                Currently Editing
                            </h3>
                            <h2 className="text-2xl font-semibold text-custom-bluegreen mt-1">
                                Work Order:{" "}
                                <span className="font-normal text-custom-lightgreen">
                                    {workOrder?.work_order || "N/A"}
                                </span>
                            </h2>
                            {workOrder?.work_order_id && (
                                <div className="mt-1 bg-[#067AC5] text-white font-normal text-xs inline-block px-4 py-1 rounded-full">
                                    Order No. {workOrder.work_order_id}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold focus:outline-none"
                            aria-label="Close"
                        >
                            ×
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        <div className="flex items-center mb-2 justify-between">
                            <label
                                htmlFor="work-order-type"
                                className="block text-sm ml-4 font-semibold text-custom-bluegreen w-1/4"
                            >
                                Work Order:
                            </label>
                            <div className="w-2/3">
                                <SearchableDropdown
                                    options={workOrderTypes}
                                    selectedOptions={
                                        selectedWorkOrderType
                                            ? [selectedWorkOrderType]
                                            : []
                                    }
                                    setSelectedOptions={(newOptionsArray) => {
                                        if (newOptionsArray.length === 0) {
                                            setSelectedWorkOrderType(null);
                                        } else if (
                                            newOptionsArray.length === 1
                                        ) {
                                            setSelectedWorkOrderType(
                                                newOptionsArray[0]
                                            );
                                        } else {
                                            const newSelectedItem =
                                                newOptionsArray.find(
                                                    (opt) =>
                                                        opt.id !==
                                                        selectedWorkOrderType?.id
                                                );
                                            setSelectedWorkOrderType(
                                                newSelectedItem ||
                                                    newOptionsArray[
                                                        newOptionsArray.length -
                                                            1
                                                    ]
                                            );
                                        }
                                    }}
                                    optionKey="id"
                                    optionLabel="type_name"
                                    placeholder="Select Work Order Type"
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
                                    options={accounts}
                                    selectedOptions={selectedAccounts}
                                    setSelectedOptions={setSelectedAccounts}
                                    optionKey="id"
                                    placeholder={
                                        selectedAccounts.length === 0 &&
                                        workOrder.accounts &&
                                        workOrder.accounts.length > 0
                                            ? workOrder.accounts
                                                  .map(
                                                      (acc) => acc.account_name
                                                  )
                                                  .join(", ")
                                            : "Select Account"
                                    }
                                    showCheckbox={true}
                                    showSelectedTags={true}
                                    hideInputValue={true}
                                />
                            </div>
                        </div>

                        <div className="flex items-center mb-2 justify-between">
                            <label
                                htmlFor="assignee"
                                className="block text-sm ml-4 font-semibold text-custom-bluegreen w-1/4"
                            >
                                Assignee:
                            </label>
                            <div className="w-2/3">
                                <SearchableDropdown
                                    options={assignee}
                                    selectedOptions={
                                        selectedAssignee
                                            ? [selectedAssignee]
                                            : []
                                    }
                                    setSelectedOptions={(newOptionsArray) => {
                                        if (newOptionsArray.length === 0) {
                                            setSelectedAssignee(null);
                                        } else if (
                                            newOptionsArray.length === 1
                                        ) {
                                            setSelectedAssignee(
                                                newOptionsArray[0]
                                            );
                                        } else {
                                            const newSelectedItem =
                                                newOptionsArray.find(
                                                    (opt) =>
                                                        opt.id !==
                                                        selectedAssignee?.id
                                                );
                                            if (newSelectedItem) {
                                                setSelectedAssignee(
                                                    newSelectedItem
                                                );
                                            } else {
                                                setSelectedAssignee(
                                                    newOptionsArray[
                                                        newOptionsArray.length -
                                                            1
                                                    ]
                                                );
                                            }
                                        }
                                    }}
                                    optionKey="id"
                                    getOptionLabel={(a) =>
                                        `${a.firstname} ${a.lastname}`
                                    }
                                    placeholder="Select Assignee"
                                    showCheckbox={false}
                                    showSelectedTags={false}
                                    hideInputValue={false}
                                />
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
                                Update
                            </button>
                        </div>
                    </form>
                </>
            </div>
        </div>,
        document.body
    );
};

export default EditWorkOrderModal;

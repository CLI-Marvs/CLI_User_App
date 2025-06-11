import { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import apiService from "../../../component/servicesApi/apiService";
import { useStateContext } from "../../../context/contextprovider";
import DatePicker from "react-datepicker";
import SearchableDropdown from "./SearchableDropdown";
import WorkOrderCreatedModal from "./WorkOrderCreatedModal";

const CreateWorkOrderModal = ({ isOpen, onClose, onCreateWorkOrder }) => {
    const [selectedAccounts, setSelectedAccounts] = useState([]);
    const [selectedWorkOrderType, setSelectedWorkOrderType] = useState(null);
    const [selectedAssignee, setSelectedAssignee] = useState(null);
    const [dueDate, setDueDate] = useState("");
    const modalRef = useRef();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [workOrderId, setWorkOrderId] = useState(null);
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
            setSelectedWorkOrderType(null);
            setSelectedAssignee(null);
            setDueDate("");
        }
    }, [isOpen]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        let formattedDueDate = null;
        if (dueDate) {
            formattedDueDate = dueDate.toISOString().slice(0, 10);
        }

        const formData = {
            work_order: selectedWorkOrderType?.type_name,
            account_ids: selectedAccounts.map((account) => account.id),
            assigned_to_user_id: selectedAssignee?.id,
            work_order_type_id: selectedWorkOrderType?.id,
            work_order_deadline: formattedDueDate,
            status: "Pending",
            description: "",
            priority: "Medium",
            created_by_user_id: user.id,
        };

        try {
            const response = await apiService.post(
                "/work-orders/create-work-order",
                formData
            );

            if (
                response.status === 201 ||
                response.message === "Work order created successfully." ||
                response.data?.message === "Work order created successfully."
            ) {
                const newWorkOrderId = response.data.data.work_order_id;
                setWorkOrderId(newWorkOrderId);
                setIsModalOpen(true);
                fetchWorkOrders();

                const logData = {
                    work_order_id: newWorkOrderId,
                    log_type: selectedWorkOrderType?.type_name,
                    log_message: `Work Order #${newWorkOrderId} created.`,
                    account_ids: selectedAccounts.map((account) => account.id),
                    created_by_user_id: user.id,
                    assigned_user_id: selectedAssignee?.id,
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
                        console.log(
                            "Work order log created successfully:",
                            logResponse.data
                        );

                        const logId = logResponse.data.data.id;

                        if (selectedAccounts.length > 0) {
                            try {
                                const accountIds = selectedAccounts.map(
                                    (account) => account.id
                                );
                                const attachResponse = await apiService.post(
                                    "/post-account-log",
                                    {
                                        work_order_log_id: logId,
                                        account_ids: accountIds,
                                    }
                                );

                                if (
                                    attachResponse.status === 200 ||
                                    attachResponse.data?.message ===
                                        "Accounts attached successfully."
                                ) {
                                    console.log(
                                        "Accounts successfully linked to work order log."
                                    );
                                } else {
                                    console.error(
                                        "Failed to link accounts to log:",
                                        attachResponse
                                    );
                                }
                            } catch (attachError) {
                                console.error(
                                    "Error attaching accounts to log:",
                                    attachError
                                );
                            }
                        }
                    } else {
                        console.error(
                            "Error creating work order log:",
                            logResponse.error ||
                                logResponse.message ||
                                logResponse
                        );
                    }
                } catch (logError) {
                    console.error(
                        "Exception while creating work order log:",
                        logError.message || logError
                    );
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

        const shouldTriggerModal = true;
        return shouldTriggerModal;
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
                                        setSelectedOptions={(
                                            newOptionsArray
                                        ) => {
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

                            <div class="flex items-center mb-2 justify-between">
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
                                        placeholder="Select Account"
                                        showCheckbox={true}
                                        showSelectedTags={true}
                                        hideInputValue={true}
                                    />
                                </div>
                            </div>

                            <div class="flex items-center mb-2 justify-between">
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
                                        setSelectedOptions={(
                                            newOptionsArray
                                        ) => {
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
                    workOrderId={workOrderId}
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

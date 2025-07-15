import React, { useMemo, useState, Fragment } from "react";
import WorkOrderMilestoneRow from "./WorkOrderMilestoneRow";
import ChecklistTable from "./ChecklistTable";
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
} from "@material-tailwind/react";
import EnhancedControlBar from "./EnhancedControlBar";
import NotesAndUpdatesModal from "./NotesAndUpdatesModal";

const WorkOrderGroupDetailsModal = ({
    isOpen,
    onClose,
    group,
    onAddFiles,
    getStatusBadge,
    isLoading,
    showChecklistTable = false, // Add this prop
    currentUserId, // Add current user ID prop
    onRefresh, // Add refresh callback
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
    const [selectedAccountForNotes, setSelectedAccountForNotes] =
        useState(null);

    const { columnHeaders, tableRows, filteredRows, totalPages, steps } =
        useMemo(() => {
            if (!group || !group.work_orders)
                return {
                    columnHeaders: [],
                    tableRows: [],
                    filteredRows: [],
                    totalPages: 0,
                    steps: [],
                };

            // 1. Gather all steps (work orders) and sort by sequence
            const steps = [...group.work_orders]
                .sort(
                    (a, b) =>
                        (a.work_order_type?.sequence ?? 0) -
                        (b.work_order_type?.sequence ?? 0)
                )
                .map((wo) => ({
                    id: wo.work_order_id,
                    stepName: wo.work_order_type?.type_name || `Step`,
                    sequence: wo.work_order_type?.sequence ?? 0,
                    subMilestones:
                        group.submilestonesByType?.[wo.work_order_type_id] ||
                        [],
                    workOrder: wo,
                }));

            // 2. Prepare column headers for each step and its sub-milestones
            const columnHeaders = steps.map((step) => ({
                stepName: step.stepName,
                subMilestones:
                    step.subMilestones.length > 0
                        ? step.subMilestones.map((m) => m.name)
                        : ["Progress"],
            }));

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
                            currentSubMilestoneId:
                                account.current_submilestone_id,
                        };
                    }
                    // Update latest step if this step is further
                    if (step.sequence > accountMap[accId].latestStep.sequence) {
                        accountMap[accId].latestStep = {
                            sequence: step.sequence,
                            status: step.workOrder.status,
                            workOrder: step.workOrder,
                        };
                        accountMap[accId].remarks =
                            step.workOrder.remarks || "-";
                    }

                    // Mark milestones as completed or current
                    let values;
                    if (step.subMilestones.length > 0) {
                        values = step.subMilestones.map((sub) => {
                            const items = sub.checklists || [];
                            if (!items || items.length === 0) return 0;

                            const uploadedDocs =
                                account.uploaded_documents || [];
                            const completedCount = items.filter((item) =>
                                uploadedDocs.some(
                                    (doc) => doc.file_title === item.name
                                )
                            ).length;

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
                const stepData = steps.map((step) => {
                    return (
                        account.milestoneData[step.id] ||
                        (step.subMilestones.length > 0
                            ? step.subMilestones.map(() => "")
                            : [""])
                    );
                });

                // Determine the overall status based on whether all checklists for the account are complete.
                const overallStatus = account.checklist_status
                    ? "Completed"
                    : "In Progress";

                const notesData = {
                    accountId: account.id,
                    workOrder: account.latestStep.workOrder,
                    workOrderType: "All Steps",
                    addNoteLogType:
                        account.latestStep.workOrder.work_order_type?.type_name, // For adding new notes
                    assignee: account.latestStep.workOrder.assignee,
                    currentUser: group.currentUser,
                    workOrderGroupId: group.id,
                };

                return {
                    key: account.id,
                    accountName: account.account_name,
                    stepData,
                    status: overallStatus,
                    remarks: account.remarks,
                    notesData: notesData,
                    currentSubMilestoneId: account.currentSubMilestoneId, // Add current submilestone ID
                    onAddFilesClick: () =>
                        onAddFiles(
                            account.id,
                            account.latestStep.workOrder,
                            account.latestStep.workOrder.work_order_type
                                ?.type_name
                        ),
                };
            });

            // Filter rows based on search term and status
            const filteredRows = tableRows.filter((row) => {
                const searchMatch =
                    searchTerm === "" ||
                    row.accountName
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    row.status
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    row.remarks
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase());

                const statusMatch =
                    statusFilter === "All" || row.status === statusFilter;

                return searchMatch && statusMatch;
            });

            const totalPages = Math.ceil(filteredRows.length / itemsPerPage);

            return {
                columnHeaders,
                tableRows,
                filteredRows,
                totalPages,
                steps,
            };
        }, [group, onAddFiles, searchTerm, itemsPerPage, statusFilter]);

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

    const handleOpenNotesModal = (notesData) => {
        setSelectedAccountForNotes(notesData);
        setIsNotesModalOpen(true);
    };

    const handleCloseNotesModal = () => {
        setIsNotesModalOpen(false);
        setSelectedAccountForNotes(null);
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
                                Work Order No. 1000{group?.id}
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
            />

            {/* Table Content */}
            <DialogBody className="p-0 flex-1 overflow-hidden">
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
                    <div className="h-full overflow-auto">
                        <ChecklistTable
                            steps={steps}
                            accounts={Object.values(
                                steps.reduce((acc, step) => {
                                    (step.workOrder.accounts || []).forEach(
                                        (account) => {
                                            acc[account.id] = account;
                                        }
                                    );
                                    return acc;
                                }, {})
                            )}
                            onAddFiles={onAddFiles}
                            handleOpenNotesModal={handleOpenNotesModal}
                            currentUserId={currentUserId}
                        />
                    </div>
                ) : paginatedData.length > 0 ? (
                    <div className="h-full overflow-auto">
                        <table className="w-full text-left border-collapse bg-white">
                            <thead className="sticky top-0 z-10">
                                {/* Row 1: Step headers */}
                                <tr className="bg-custom-bluegreen text-white">
                                    <th
                                        className="px-3 py-2 font-medium sticky left-0 bg-custom-bluegreen z-20 border-r border-white min-w-[180px]"
                                        rowSpan={3}
                                    >
                                        <div className="flex items-center gap-2">
                                            <svg
                                                className="w-4 h-4"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                                            </svg>
                                            <span className="text-xs font-semibold">
                                                ACCOUNT NAME
                                            </span>
                                        </div>
                                    </th>
                                    {columnHeaders.map((col, idx) => (
                                        <th
                                            key={idx}
                                            colSpan={
                                                col.subMilestones.length * 2
                                            }
                                            className="text-center px-2 py-2 font-medium border-x border-white min-w-[100px]"
                                        >
                                            <span className="text-xs font-semibold uppercase tracking-wide">
                                                {col.stepName}
                                            </span>
                                        </th>
                                    ))}
                                    <th
                                        className="px-2 py-2 font-medium border-l border-white min-w-[80px]"
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
                                        className="px-2 py-2 font-medium border-l border-white min-w-[120px]"
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
                                        className="px-2 py-2 font-medium border-l border-white min-w-[80px]"
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
                                                    className="text-center px-2 py-1 font-medium border-x border-y border-white min-w-[180px]"
                                                >
                                                    <span
                                                        className="text-xs font-medium truncate block"
                                                        title={milestone}
                                                    >
                                                        {milestone.length > 12
                                                            ? milestone.substring(
                                                                  0,
                                                                  12
                                                              ) + "..."
                                                            : milestone}
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
                                                    <th className="text-center px-1 py-1 font-medium border-x border-white min-w-[90px]">
                                                        <span className="text-xs font-medium">
                                                            Date Created
                                                        </span>
                                                    </th>
                                                    <th className="text-center px-1 py-1 font-medium border-x border-white min-w-[90px]">
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
                                        steps={steps}
                                        getStatusBadge={getStatusBadge}
                                        handleOpenNotesModal={
                                            handleOpenNotesModal
                                        }
                                    />
                                ))}
                            </tbody>
                        </table>

                        {/* Checklist Table - Show/Hide based on prop */}
                        {showChecklistTable && (
                            <div className="mt-4">
                                <ChecklistTable
                                    workOrders={group.work_orders}
                                    onAddFiles={onAddFiles}
                                    getStatusBadge={getStatusBadge}
                                    currentUserId={currentUserId}
                                />
                            </div>
                        )}
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
                        Page {currentPage} of {totalPages} •{" "}
                        {filteredRows.length} entries
                    </Typography>

                    <div className="flex items-center gap-1">
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
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="border-gray-300 text-gray-700 hover:bg-gray-50 px-2 py-1 text-xs"
                        >
                            ‹
                        </Button>

                        <div className="flex items-center gap-1">
                            {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                const pageNum = Math.max(
                                    1,
                                    Math.min(
                                        currentPage - 2 + i,
                                        totalPages - 4 + i
                                    )
                                );
                                return pageNum <= totalPages ? (
                                    <Button
                                        key={pageNum}
                                        variant={
                                            currentPage === pageNum
                                                ? "filled"
                                                : "outlined"
                                        }
                                        size="sm"
                                        onClick={() =>
                                            handlePageChange(pageNum)
                                        }
                                        className={
                                            currentPage === pageNum
                                                ? "bg-custom-lightgreen text-white px-2 py-1 text-xs min-w-[28px]"
                                                : "border-gray-300 text-gray-700 hover:bg-gray-50 px-2 py-1 text-xs min-w-[28px]"
                                        }
                                    >
                                        {pageNum}
                                    </Button>
                                ) : null;
                            })}
                        </div>

                        <Button
                            variant="outlined"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="border-gray-300 text-gray-700 hover:bg-gray-50 px-2 py-1 text-xs"
                        >
                            ›
                        </Button>
                        <Button
                            variant="outlined"
                            size="sm"
                            onClick={() => handlePageChange(totalPages)}
                            disabled={currentPage === totalPages}
                            className="border-gray-300 text-gray-700 hover:bg-gray-50 px-2 py-1 text-xs"
                        >
                            Last
                        </Button>
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

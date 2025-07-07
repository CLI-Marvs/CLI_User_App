import React, { useMemo, useState } from 'react';
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

const WorkOrderGroupDetailsModal = ({ isOpen, onClose, group, onAddFiles, getStatusBadge, isLoading }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [searchTerm, setSearchTerm] = useState('');

    const { columnHeaders, tableRows, filteredRows, totalPages } = useMemo(() => {
        if (!group || !group.work_orders) return { columnHeaders: [], tableRows: [], filteredRows: [], totalPages: 0 };

        // 1. Gather all steps (work orders) and sort by sequence
        const steps = [...group.work_orders]
            .sort((a, b) => (a.work_order_type?.sequence ?? 0) - (b.work_order_type?.sequence ?? 0))
            .map(wo => ({
                id: wo.work_order_id,
                stepName: wo.work_order_type?.type_name || `Step`,
                sequence: wo.work_order_type?.sequence ?? 0,
                subMilestones: group.submilestonesByType?.[wo.work_order_type_id] || [],
                workOrder: wo,
            }));
            console.log("STEPS", steps);
        // 2. Prepare column headers for each step and its sub-milestones
        const columnHeaders = steps.map(step => ({
            stepName: step.stepName,
            subMilestones: step.subMilestones.length > 0 ? step.subMilestones.map(m => m.name) : ['Progress'],
        }));

        // 3. Gather accounts and build milestone completion data
        const accountMap = {};

        steps.forEach(step => {
            (step.workOrder.accounts || []).forEach(account => {
                const accId = account.id;
                if (!accountMap[accId]) {
                    accountMap[accId] = {
                        ...account,
                        milestoneData: {},
                        latestStep: { sequence: step.sequence, status: step.workOrder.status, workOrder: step.workOrder },
                        remarks: step.workOrder.remarks || '-',
                        // Add progress fields if available
                        currentStepId: account.current_step_id,
                        currentSubMilestoneId: account.current_submilestone_id,
                    };
                }
                // Update latest step if this step is further
                if (step.sequence > accountMap[accId].latestStep.sequence) {
                    accountMap[accId].latestStep = { sequence: step.sequence, status: step.workOrder.status, workOrder: step.workOrder };
                    accountMap[accId].remarks = step.workOrder.remarks || '-';
                }

                // Mark milestones as completed or current
                let values;
                if (step.subMilestones.length > 0) {
                    values = step.subMilestones.map(sub => {
                        // If this is the current step
                        if (step.id === account.currentStepId) {
                            if (sub.id === account.currentSubMilestoneId) return "●"; // Current
                            // Completed before current
                            if (step.subMilestones.findIndex(m => m.id === sub.id) < step.subMilestones.findIndex(m => m.id === account.currentSubMilestoneId)) return "✓";
                            return "";
                        }
                        // Steps before current step: all completed
                        if (step.sequence < steps.find(s => s.id === account.currentStepId)?.sequence) return "✓";
                        // Steps after current: not started
                        return "";
                    });
                } else {
                    // No submilestones, just mark step
                    if (step.id === account.currentStepId) values = ["●"];
                    else if (step.sequence < steps.find(s => s.id === account.currentStepId)?.sequence) values = ["✓"];
                    else values = [""];
                }
                accountMap[accId].milestoneData[step.id] = values;
            });
        });

        const tableRows = Object.values(accountMap).map(account => {
            const stepData = steps.map(step => {
                return account.milestoneData[step.id] || (step.subMilestones.length > 0
                    ? step.subMilestones.map(() => "")
                    : [""]);
            });

            return {
                key: account.id,
                accountName: account.account_name,
                stepData,
                status: account.latestStep.status,
                remarks: account.remarks,
                onAddFilesClick: () =>
                    onAddFiles(account.id, account.latestStep.workOrder, account.latestStep.workOrder.work_order_type?.type_name),
            };
        });

        // Filter rows based on search term
        const filteredRows = tableRows.filter(row =>
            row.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            row.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
            row.remarks.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const totalPages = Math.ceil(filteredRows.length / itemsPerPage);

        return { columnHeaders, tableRows, filteredRows, totalPages };
    }, [group, onAddFiles, searchTerm, itemsPerPage]);

    // Paginated data
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

    if (!isOpen) return null;

    return (
        <Dialog 
            open={isOpen} 
            handler={onClose} 
            size="xxl" 
            className="max-w-none w-screen h-screen m-0 rounded-none"
        >
            {/* Header */}
            <DialogHeader className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-none">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                                <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6.5a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 016 11.5V5z"/>
                            </svg>
                        </div>
                        <div>
                            <Typography variant="h4" color="white" className="font-bold">
                                Work Order Group Management
                            </Typography>
                            <Typography variant="small" className="text-slate-300">
                                WO Group #{group?.id} • {filteredRows.length} of {tableRows.length} accounts
                            </Typography>
                        </div>
                    </div>
                    <IconButton
                        variant="text"
                        color="white"
                        size="lg"
                        onClick={onClose}
                        className="hover:bg-white/10"
                    >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
                        </svg>
                    </IconButton>
                </div>
            </DialogHeader>

            {/* Controls Bar */}
            <div className="bg-white border-b border-slate-200 p-4">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                        <div className="w-80">
                            <Input
                                label="Search accounts, status, or remarks..."
                                value={searchTerm}
                                onChange={handleSearch}
                                icon={<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"/>
                                </svg>}
                                className="!border-slate-300 focus:!border-slate-500"
                            />
                        </div>
                        <div className="w-40">
                            <Select
                                label="Items per page"
                                value={itemsPerPage.toString()}
                                onChange={(value) => handleItemsPerPageChange(value)}
                                className="!border-slate-300 focus:!border-slate-500"
                            >
                                <Option value="10">10 per page</Option>
                                <Option value="25">25 per page</Option>
                                <Option value="50">50 per page</Option>
                                <Option value="100">100 per page</Option>
                            </Select>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Typography variant="small" className="text-slate-600">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredRows.length)} of {filteredRows.length} entries
                        </Typography>
                    </div>
                </div>
            </div>

            {/* Table Content */}
            <DialogBody className="p-0 flex-1 overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full bg-slate-50">
                        <div className="text-center">
                            <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <Typography color="gray" className="mt-4">Loading Details...</Typography>
                        </div>
                    </div>
                ) : paginatedData.length > 0 ? (
                    <div className="h-full overflow-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 z-10">
                                {/* Row 1: Step headers */}
                                <tr className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
                                    <th className="p-4 font-semibold sticky left-0 bg-slate-800 z-20 border-r border-slate-600 min-w-[200px]" rowSpan={2}>
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
                                            </svg>
                                            <span className="font-bold text-sm">Account Name</span>
                                        </div>
                                    </th>
                                    {columnHeaders.map((col, idx) => (
                                        <th
                                            key={idx}
                                            colSpan={col.subMilestones.length}
                                            className="text-center p-4 font-semibold border-x border-slate-600 min-w-[120px]"
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                <span className="text-sm font-bold">{col.stepName}</span>
                                            </div>
                                        </th>
                                    ))}
                                    <th className="p-4 font-semibold border-l border-slate-600 min-w-[120px]" rowSpan={2}>
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                                            </svg>
                                            <span className="font-bold text-sm">Status</span>
                                        </div>
                                    </th>
                                    <th className="p-4 font-semibold border-l border-slate-600 min-w-[150px]" rowSpan={2}>
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"/>
                                            </svg>
                                            <span className="font-bold text-sm">Remarks</span>
                                        </div>
                                    </th>
                                    <th className="p-4 font-semibold border-l border-slate-600 min-w-[100px]" rowSpan={2}>
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                                            </svg>
                                            <span className="font-bold text-sm">Actions</span>
                                        </div>
                                    </th>
                                </tr>

                                {/* Row 2: Sub-milestone headers */}
                                <tr className="bg-slate-600 text-white">
                                    {columnHeaders.map((col, idx) =>
                                        col.subMilestones.map((milestone, i) => (
                                            <th
                                                key={`${idx}-${i}`}
                                                className="text-center p-3 font-medium border-x border-slate-500 min-w-[80px]"
                                            >
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="text-xs font-medium leading-tight text-center" title={milestone}>
                                                        {milestone}
                                                    </span>
                                                </div>
                                            </th>
                                        ))
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedData.map((row, index) => (
                                    <tr key={row.key} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                                        <td className="p-4 font-medium text-slate-800 sticky left-0 bg-inherit z-10 border-r border-slate-200">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <span className="text-xs font-bold text-white">
                                                        {row.accountName.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <span className="text-sm font-semibold text-slate-800 block truncate" title={row.accountName}>
                                                        {row.accountName}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        {row.stepData.map((step, i) =>
                                            step.map((milestone, j) => (
                                                <td
                                                    key={`${i}-${j}`}
                                                    className="p-3 text-center border-x border-slate-100"
                                                >
                                                    <div className="flex items-center justify-center">
                                                        {milestone === "✓" ? (
                                                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                                                                </svg>
                                                            </div>
                                                        ) : milestone === "" ? (
                                                            <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center">
                                                                <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm text-slate-600">{milestone}</span>
                                                        )}
                                                    </div>
                                                </td>
                                            ))
                                        )}
                                        <td className="p-4 text-center border-l border-slate-200">
                                            <div className="flex justify-center">
                                                {getStatusBadge(row.status)}
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600 border-l border-slate-200">
                                            <div className="max-w-[140px] truncate" title={row.remarks}>
                                                {row.remarks}
                                            </div>
                                        </td>
                                        <td className="p-4 border-l border-slate-200">
                                            <div className="flex justify-center">
                                                <Button
                                                    size="sm"
                                                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all"
                                                    onClick={row.onAddFilesClick}
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.413V13H5.5z"/>
                                                    </svg>
                                                    Add Files
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full bg-slate-50">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"/>
                                </svg>
                            </div>
                            <Typography variant="h6" color="blue-gray" className="mb-2">
                                No Results Found
                            </Typography>
                            <Typography color="gray" className="text-sm">
                                {group && searchTerm ? `No accounts match "${searchTerm}"` : "No data available to display"}
                            </Typography>
                        </div>
                    </div>
                )}
            </DialogBody>

            {/* Pagination Footer */}
            <DialogFooter className="bg-white border-t border-slate-200 p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
                    <Typography variant="small" color="blue-gray" className="font-normal">
                        Page {currentPage} of {totalPages} ({filteredRows.length} total entries)
                    </Typography>
                    
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outlined"
                            size="sm"
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === 1}
                            className="border-slate-300 text-slate-700 hover:bg-slate-50"
                        >
                            First
                        </Button>
                        <Button
                            variant="outlined"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="border-slate-300 text-slate-700 hover:bg-slate-50"
                        >
                            Previous
                        </Button>
                        
                        <div className="flex items-center gap-1">
                            {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                const pageNum = Math.max(1, Math.min(currentPage - 2 + i, totalPages - 4 + i));
                                return pageNum <= totalPages ? (
                                    <Button
                                        key={pageNum}
                                        variant={currentPage === pageNum ? "filled" : "outlined"}
                                        size="sm"
                                        onClick={() => handlePageChange(pageNum)}
                                        className={currentPage === pageNum 
                                            ? "bg-blue-600 text-white" 
                                            : "border-slate-300 text-slate-700 hover:bg-slate-50"
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
                            className="border-slate-300 text-slate-700 hover:bg-slate-50"
                        >
                            Next
                        </Button>
                        <Button
                            variant="outlined"
                            size="sm"
                            onClick={() => handlePageChange(totalPages)}
                            disabled={currentPage === totalPages}
                            className="border-slate-300 text-slate-700 hover:bg-slate-50"
                        >
                            Last
                        </Button>
                    </div>
                </div>
            </DialogFooter>
        </Dialog>
    );
};

export default WorkOrderGroupDetailsModal;
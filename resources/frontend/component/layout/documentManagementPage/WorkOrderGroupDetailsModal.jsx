import React, { useMemo } from 'react';
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
    Typography,
} from "@material-tailwind/react";

const WorkOrderGroupDetailsModal = ({ isOpen, onClose, group, onAddFiles, getStatusBadge }) => {
    const { columnHeaders, tableRows } = useMemo(() => {
        if (!group || !group.work_orders) return { columnHeaders: [], tableRows: [] };

        // 1. Gather all steps (work orders) and sort by sequence
        const steps = [...group.work_orders]
            .sort((a, b) => (a.work_order_type?.sequence ?? 0) - (b.work_order_type?.sequence ?? 0))
            .map(wo => ({
                id: wo.work_order_id,
                stepName: wo.work_order_type?.type_name || `Step`,
                sequence: wo.work_order_type?.sequence ?? 0,
                subMilestones: wo.sub_milestones || [],
                workOrder: wo,
            }));

            console.log("Steps Data", steps);

        // 2. Prepare column headers for each step and its sub-milestones (always at least 1 col)
        const columnHeaders = steps.map(step => ({
            stepName: step.stepName,
            subMilestones: step.subMilestones.length > 0 ? step.subMilestones.map(m => m.name) : [null],
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
                        // Track the latest step and its status for this account
                        latestStep: { sequence: step.sequence, status: step.workOrder.status, workOrder: step.workOrder },
                        remarks: step.workOrder.remarks || '-',
                    };
                }
                // Update latest step if this step is further along
                if (step.sequence > accountMap[accId].latestStep.sequence) {
                    accountMap[accId].latestStep = { sequence: step.sequence, status: step.workOrder.status, workOrder: step.workOrder };
                    accountMap[accId].remarks = step.workOrder.remarks || '-';
                }
                // Placeholder logic: mark all submilestones as "✓"
                const values = step.subMilestones.length > 0
                    ? step.subMilestones.map(() => "✓")
                    : ["✓"];
                accountMap[accId].milestoneData[step.id] = values;
            });
        });

        const tableRows = Object.values(accountMap).map(account => {
            const stepData = steps.map(step => {
                // Always return an array (even if just one cell)
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

        return { columnHeaders, tableRows };
    }, [group, onAddFiles]);

    if (!group) return null;

    return (
        <Dialog open={isOpen} handler={onClose} size="xl">
            <DialogHeader>
                Work Order Group Details: WO #{group.id}
            </DialogHeader>
            <DialogBody divider className="h-[70vh] overflow-auto px-2">
                {tableRows.length > 0 ? (
                    <div className="overflow-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                {/* Row 1: Step headers */}
                                <tr className="bg-gray-100 border-b border-gray-300">
                                    <th className="p-3 text-sm font-semibold" rowSpan={2}>Account Name</th>
                                    {columnHeaders.map((col, idx) => (
                                        <th
                                            key={idx}
                                            colSpan={col.subMilestones.length}
                                            className="text-center p-3 text-sm font-semibold border-x border-gray-200"
                                        >
                                            {col.stepName}
                                        </th>
                                    ))}
                                    <th className="p-3 text-sm font-semibold" rowSpan={2}>Overall Status</th>
                                    <th className="p-3 text-sm font-semibold" rowSpan={2}>Remarks</th>
                                    <th className="p-3 text-sm font-semibold" rowSpan={2}>Actions</th>
                                </tr>

                                {/* Row 2: Sub-milestone headers */}
                                <tr className="bg-gray-50 border-b border-gray-300">
                                    {columnHeaders.map((col, idx) =>
                                        col.subMilestones.map((milestone, i) => (
                                            <th
                                                key={`${idx}-${i}`}
                                                className="text-center p-2 text-xs font-medium text-gray-600 border-x"
                                            >
                                                {milestone || "—"}
                                            </th>
                                        ))
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {tableRows.map(row => (
                                    <tr key={row.key} className="border-t border-gray-200 hover:bg-gray-50">
                                        <td className="p-3 text-sm font-medium text-gray-800">
                                            {row.accountName}
                                        </td>
                                        {row.stepData.map((step, i) =>
                                            step.map((milestone, j) => (
                                                <td
                                                    key={`${i}-${j}`}
                                                    className="p-2 text-center text-sm"
                                                >
                                                    {milestone}
                                                </td>
                                            ))
                                        )}
                                        <td className="p-3 text-sm text-center">
                                            {getStatusBadge(row.status)}
                                        </td>
                                        <td className="p-3 text-sm">{row.remarks}</td>
                                        <td className="p-3 text-sm">
                                            <Button
                                                size="sm"
                                                variant="outlined"
                                                color="indigo"
                                                onClick={row.onAddFilesClick}
                                            >
                                                Add Files
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <Typography color="gray" className="text-center p-4">
                        No details to display for this work order group.
                    </Typography>
                )}
            </DialogBody>
            <DialogFooter>
                <Button variant="text" color="gray" onClick={onClose}>
                    Close
                </Button>
            </DialogFooter>
        </Dialog>
    );
};

export default WorkOrderGroupDetailsModal;

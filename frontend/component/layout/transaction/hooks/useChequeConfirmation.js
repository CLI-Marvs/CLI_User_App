import { useState } from "react";
import { showToast } from "frontend/util/toastUtil";
import { useSaveChecks } from "./useTransactionQueries";

export const useChequeConfirmation = (data, checkDates, getCheckNos) => {
    const [confirmIndex, setConfirmIndex] = useState(null);
    const [confirmedChecks, setConfirmedChecks] = useState([]);
    const [isConfirmAll, setIsConfirmAll] = useState(false);

    const { mutateAsync: storePrintedCheck, isPending: isSavePending } = useSaveChecks();

    const confirmCheck = async (index) => {
        setConfirmIndex(index);
        const cleaned = (data.amount || "0").replace(/,/g, "");
        const payload = {
            check_no: getCheckNos(index),
            check_date: checkDates[index]?.toISOString().split("T")[0],
            amount: parseFloat(cleaned),
            payTo: data.payTo,
            payor_name: data.payor_name,
            contract_number: data.contract_number,
            bank_name: data.bank_name,
            entity_id: data.entity_id,
            status: "active",
        };

        const response = await storePrintedCheck(payload);
        if (response.status !== 200) {
            showToast("Something went wrong while confirming the check.", "error");
            setConfirmIndex(null);
            return;
        } else {
            showToast("Check confirmed successfully.", "success");
            setConfirmedChecks((prev) => [...prev, index]);
        }
        setConfirmIndex(null);
    };

    const confirmAll = async (selectedChecks, setSelectedChecks, setAllSelected) => {
        const unconfirmedChecks = selectedChecks.filter(
            (index) => !confirmedChecks.includes(index)
        );
        if (unconfirmedChecks.length === 0) {
            showToast("Please select at least one check to confirm.", "info");
            return;
        }

        const checksArray = unconfirmedChecks.map((index) => {
            const cleaned = (data.amount || "0").replace(/,/g, "");
            return {
                check_no: getCheckNos(index),
                check_date: checkDates[index]?.toISOString().split("T")[0],
                amount: parseFloat(cleaned),
                payTo: data.payTo,
                payor_name: data.payor_name,
                entity_id: data.entity_id,
                contract_number: data.contract_number,
                bank_name: data.bank_name,
                status: "active",
            };
        });

        try {
            setIsConfirmAll(true);
            const response = await storePrintedCheck({ checks: checksArray });
            if (response.status !== 200) {
                return showToast("Something went wrong while confirming checks.", "error");
            } else {
                showToast("Checks confirmed successfully.", "success");
                setConfirmedChecks((prev) => [...prev, ...unconfirmedChecks]);
                setSelectedChecks([]);
                setAllSelected(false);
            }
        } catch (error) {
            showToast("Something went wrong while confirming checks.", "error");
        } finally {
            setIsConfirmAll(false);
        }
    };

    return {
        confirmIndex,
        confirmedChecks,
        setConfirmedChecks,
        isConfirmAll,
        isSavePending,
        confirmCheck,
        confirmAll,
    };
};
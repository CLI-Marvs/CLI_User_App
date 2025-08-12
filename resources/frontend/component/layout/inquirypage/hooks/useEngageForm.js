import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import isButtonDisabled from "@/util/isFormButtonDisabled";
import validateContractNumber from "@/component/layout/inquirypage/utils/validateContractNumber";
import { walkinTransactionService } from "@/component/servicesApi/apiCalls/emojiWalkin/walkinTransactionService";
import { showToast } from "@/util/toastUtil";
import { queueService } from "@/component/servicesApi/apiCalls/emojiWalkin/queueService";

export function useEngageForm(
    formData,
    itemData,
    setSelectedItem,
    setError,
    dialogRef
) {
    const queryClient = useQueryClient();
    const contractNumberError = validateContractNumber(
        formData.contract_number
    );
    const requiredFields = [
        "first_name",
        "last_name",
        "email",
        "contact_number",
        "property_id",
        "category_id",
        "type",
        "details_message",
    ];

    const isMiddleNameValid =
        formData.middle_name_na ||
        (formData.middle_name && formData.middle_name.trim() !== "");
    const isSuffixValid =
        formData.suffix_na ||
        (formData.suffix && formData.suffix.trim() !== "");
    const isContractNumberValid =
        !formData.contract_number || !contractNumberError;

    const isPropertyButtonDisabled =
        isButtonDisabled(formData, requiredFields) ||
        !isMiddleNameValid ||
        !isSuffixValid ||
        !isContractNumberValid;

    const transactionMutation = useMutation({
        mutationFn: walkinTransactionService.createWalkinTransactionDetail,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["queueWalkinTransactions"],
            });
        },
        onError: (error) => {
            showToast(error?.response?.data?.message || "Error", "error");
        },
    });

    const queueMutation = useMutation({
        mutationFn: queueService.updateQueueStatus,
    });

    const isSubmitting =
        transactionMutation.isPending || queueMutation.isPending;

    const handleSubmit = async (e, actionType) => {
        e.preventDefault();
        const transactionPayload = {
            walkin_transaction_id: itemData.id,
            category_id: formData.category_id,
            property_masters_id: formData.property_id,
            first_name: formData.first_name,
            last_name: formData.last_name,
            contact_number: formData.contact_number,
            contract_number: formData.contract_number,
            email: formData.email,
            detailed_notes: formData.details_message,
            status: actionType,
            type: formData.type,
            inquiry_from: formData.inquiry_from,
            unit_number: formData.unit_number,
            middle_name: formData.middle_name_na ? "" : formData.middle_name,
            suffix: formData.suffix_na ? "" : formData.suffix,
        };

        // Prepare queue payload
        const queuePayload = {
            priority_number: itemData?.priority_number,
            status: actionType,
        };
        try {
            await transactionMutation.mutateAsync(transactionPayload);

            // Then update queue status
            await queueMutation.mutateAsync(queuePayload);

            if (actionType === "resolved") {
                showToast(
                    "Walk-in Transaction Closed Successfully!",
                    "success"
                );
            } else {
                showToast("Walk-in Transaction Saved Successfully!", "success");
            }

            queryClient.invalidateQueries({
                queryKey: ["walkinTransactionHistory"],
            });
            setError(null);
            dialogRef.current?.close();
            setSelectedItem(null);
        } catch (error) {
            setError(
                error?.response?.data?.message ||
                    "An error occurred while processing the request"
            );
        }
    };

    
const handleCloseModal = async () => {
    try {
        dialogRef.current?.close();

        await Promise.all([
            queueMutation.mutateAsync({
                priority_number: itemData?.priority_number,
                status: "queue",
            }),
            walkinTransactionService.updateWalkinTransactionStatus({
                walkin_transaction_id: itemData?.id,
                status: "queue",
            }),
        ]);

        queryClient.invalidateQueries({
            queryKey: ["queueWalkinTransactions"],
        });

        setSelectedItem(null);
        setError(null);
    } catch (error) {
        showToast("Error closing the form", "error");
    }
};


    return {
        isPropertyButtonDisabled,
        isSubmitting,
        handleSubmit,
        contractNumberError,
        transactionMutation,
        queueMutation,
        handleCloseModal,
    };
}

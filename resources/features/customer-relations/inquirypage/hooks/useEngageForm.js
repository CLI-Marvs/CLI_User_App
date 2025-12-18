import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import isButtonDisabled from "@/util/isFormButtonDisabled";
import validateContractNumber from "@/features/customer-relations/inquirypage/utils/validateContractNumber";
import { walkinTransactionService } from "@/servicesApi/apiCalls/emojiWalkin/walkinTransactionService";
import { showToast } from "@/util/toastUtil";
import { queueService } from "@/servicesApi/apiCalls/emojiWalkin/queueService";
import { useStateContext } from "@/context/contextprovider";
import apiService from "@/servicesApi/apiService";
import { toLowerCaseText } from "@/util/formatToLowerCase";

export function useEngageForm(
    formData,
    itemData,
    setSelectedItem,
    setError,
    dialogRef,
    propertyNamesList,
    categories
) {
    const { getAllConcerns, user } = useStateContext();
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
        ...(formData.inquiry_from === "Others" ? ["other_user_type"] : []),
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
        onSuccess: async () => {
            try {
                await insertoConcern({ formData, user, categories, itemData });
                queryClient.invalidateQueries({
                    queryKey: ["queueWalkinTransactions"],
                });
            } catch (error) {
                showToast(
                    "Walk-in transaction saved but concern creation failed",
                    "warning"
                );
            }
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
            property_masters_id:
                formData.property_id === "0" || formData.property_id === 0
                    ? null
                    : Number(formData.property_id),
            first_name: formData.first_name,
            last_name: formData.last_name,
            contact_number: formData.contact_number,
            contract_number: formData.contract_number,
            email: formData.email,
            detailed_notes: formData.details_message,
            status: actionType,
            type: formData.type,
            inquiry_from: formData.inquiry_from ?? "",
            other_user_type: formData.other_user_type ?? "",
            unit_number: formData.unit_number,
            middle_name: formData.middle_name_na ? "" : formData.middle_name,
            suffix_name: formData.suffix_na ? "" : formData.suffix,
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

            //Refresh the data of feedback
            getAllConcerns();

            localStorage.removeItem("engagedWalkinId");
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

            // Remove engaged ID from localStorage
            localStorage.removeItem("engagedWalkinId");

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

    const insertoConcern = async ({ formData, user, categories, itemData }) => {
        try {
            const propertyName = toLowerCaseText(
                propertyNamesList?.find(
                    (property) => property.id === formData.property_id
                )?.name
            );
            const detailConcern = categories?.find(
                (category) => category.id === parseInt(formData.category_id)
            )?.name;

            const payload = {
                walkin_transaction_id: itemData.id,
                details_concern: detailConcern,
                property: propertyName ? propertyName : "N/A",
                message: formData.details_message,
                status: "Resolved",
                buyer_email: formData.email,
                mobile_number: formData.contact_number,
                contract_number: formData.contract_number,
                unit_number: formData.unit_number,
                inquiry_type: "from_admin",
                assign_to: JSON.stringify({
                    name: `${user.firstname} ${user.lastname}`,
                    email: user.employee_email,
                    department: user.department,
                }),
                buyer_name: `${formData.first_name} ${formData.last_name}`,
                mname: formData.middle_name,
                fname: formData.first_name,
                lname: formData.last_name,
                suffix: formData.suffix,
                user_type: formData.inquiry_from,
                other_user_type: formData.other_user_type,
                type: formData.type,
                channels: "Walk in",
                survey_link: formData.survey_link ?? null,
                source_from: "Walk-in",
            };

            const response = await apiService.post("/add-concern", payload);
            return response.data;
        } catch (error) {
            throw new Error(
                error?.response?.data?.message || "Error inserting concern"
            );
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

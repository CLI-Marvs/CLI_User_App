import React, { useRef, useState, useEffect } from "react";
import CustomTable from "@/component/layout/propertyandpricingpage/component/CustomTable";
import { BRANCH_SETTING_COLUMNS } from "@/constant/data/tableColumns";
import { useBranch } from "@/component/layout/inquirypage/hooks/useBranch";
import BranchTableRow from "@/component/layout/superadminpage/component/tableRow/BranchTableRow";
import BranchFormModal from "@/component/layout/superadminpage/component/BranchFormModal";
import Alert from "@/component/Alert";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { branchService } from "@/component/servicesApi/apiCalls/emojiWalkin/branchService";
import { showToast } from "@/util/toastUtil";
import Skeleton from "@/component/Skeletons";
import { createPortal } from 'react-dom';

const BranchSetting = () => {
    //States
    const { data: branches, isLoading } = useBranch();
    const branchFormRef = useRef(null);
    const [mode, setMode] = useState(null);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const queryClient = useQueryClient();
    const deleteBranchMutation = useMutation({
        mutationFn: (id) => branchService.deleteBranch(id),
        onSuccess: (response) => {
            showToast(response?.message, "success");
            queryClient.invalidateQueries({ queryKey: ["branches"] });
            setShowAlert(false);
            setSelectedBranch(null);
        },
        onError: (error) => {
            setError(
                error?.response?.data?.message || "Failed to delete branch"
            );
        },
        onSettled: () => setIsSubmitting(false),
    });


    //Event handler
    const handleCopyAllLinks = (urls) => {
        navigator.clipboard.writeText(Object.values(urls).join("\n"));
    };

    //Handle open branch form modal
    const handleOpenModal = (item, mode) => {
        setMode(mode);
        if (mode === "edit") {
            setSelectedBranch(item);
            branchFormRef.current.showModal();
        } else if (mode === "add") {
            setSelectedBranch(null);
            branchFormRef.current.showModal();
        } else if (mode === "delete") {
            setSelectedBranch(item);
            setShowAlert(true);
        }
    };

    //Handle confirm delete branch
    const handleConfirm = () => {
        if (selectedBranch) {
            deleteBranchMutation.mutate(selectedBranch.id);
        }
    };

    //Handle cancel delete branch
    const handleCancel = () => {
        setShowAlert(false);
    };
    return (
        <div className="h-screen max-w-full bg-custom-grayFA p-[20px]">
            <div>
                <div className="">
                    <button
                        onClick={() => handleOpenModal("", "add")}
                        className="montserrat-semibold text-sm px-6 gradient-btn h-[37px] rounded-[10px] text-white hover:shadow-custom4"
                    >
                        <span className="text-[18px] mt-1 mr-2">+</span>
                        Add Branch
                    </button>
                </div>
                
                {/* Table */}
                <div className="mt-6">
                    {isLoading ? (
                        <div className="text-center py-4">
                            <Skeleton height={60} className="my-1" />
                            <Skeleton height={60} className="my-1" />
                            <Skeleton height={60} className="my-1" />
                        </div>
                    ) : Array.isArray(branches) && branches.length === 0 ? (
                        <div className="text-center py-4 text-custom-bluegreen">
                            No branch data
                        </div>
                    ) : (
                        <CustomTable
                            textAlign="text-center"
                            className="gap-4 w-full h-[49px] montserrat-semibold text-sm text-white bg-custom-lightgreen mb-4 text-center "
                            tableClassName="w-full min-w-[882px]  "
                            columns={BRANCH_SETTING_COLUMNS}
                            data={Array.isArray(branches) ? branches : []}
                            isLoading={isLoading}
                            renderRow={(item) => (
                                <BranchTableRow
                                    onCopyAll={handleCopyAllLinks}
                                    onEdit={() => handleOpenModal(item, "edit")}
                                    onDelete={() =>
                                        handleOpenModal(item, "delete")
                                    }
                                    key={item.id}
                                    item={item}
                                />
                            )}
                        />
                    )}
                </div>
            </div>
            <div>
                <BranchFormModal
                    mode={mode}
                    ref={branchFormRef}
                    branch={selectedBranch}
                />
            </div>
            {showAlert &&
                createPortal(
                    <div className="fixed inset-0 flex items-center justify-center z-[60] px-4">
                        <div className="w-full max-w-md sm:max-w-xs bg-red-900">
                            <Alert
                                title="Are you sure you want to delete this branch?"
                                show={showAlert}
                                onCancel={handleCancel}
                                onConfirm={handleConfirm}
                            />
                        </div>
                    </div>,
                    document.body
                )}
        </div>
    );
};

export default BranchSetting;

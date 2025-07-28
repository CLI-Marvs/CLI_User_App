import React, {
    forwardRef,
    useImperativeHandle,
    useRef,
    useState,
    useEffect,
} from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { branchService } from "@/component/servicesApi/apiCalls/emojiWalkin/branchService";
import Button from "@/component/layout/inquirypage/component/ui/button";
import CircularProgress from "@mui/material/CircularProgress";
import { showToast } from "@/util/toastUtil";
import CustomInput from "@/component/Input/CustomInput";
import isFormButtonDisabled from "@/util/isFormButtonDisabled";
import { IoIosCloseCircle } from "react-icons/io";
import { id } from "date-fns/locale";

const initialFormState = {
    branch_name: "",
    desks: [{ name: "" }],
};

const BranchFormModal = forwardRef((props, ref) => {
    const dialogRef = useRef(null);
    const [formData, setFormData] = useState(initialFormState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const queryClient = useQueryClient();
    const [error, setError] = useState(null);
    const [initialData, setInitialData] = useState(initialFormState);

    //Hooks
    useEffect(() => {
        if (props.mode === "edit" && props.branch) {
            const editData = {
                branch_name: props.branch.name || "",
                desks: props.branch.desks?.map((d) => {
                    return {
                        name: d.name,
                        id: d.id,
                    };
                }) || [""],
            };
            setFormData(editData);
            setInitialData(editData);
        } else if (props.mode === "add") {
            setFormData(initialFormState);
            setInitialData(initialFormState);
        }
    }, [props.mode, props.branch]);

    useImperativeHandle(ref, () => ({
        showModal: () => dialogRef.current && dialogRef.current.showModal(),
        closeModal: () => dialogRef.current && dialogRef.current.close(),
    }));

    //Derived values
    const isButtonDisabled = () => {
        if (props.mode === "edit") {
            // Disable if no changes
            return (
                isFormButtonDisabled(formData, Object.keys(initialFormState)) ||
                JSON.stringify(formData) === JSON.stringify(initialData)
            );
        } else {
            // Disable if required fields are empty
            return isFormButtonDisabled(
                formData,
                Object.keys(initialFormState)
            );
        }
    };

    // Mutation for creating branch
    const createBranchMutation = useMutation({
        mutationFn: branchService.createBranch,
        onSuccess: () => {
            showToast("Branch created successfully!", "success");
            queryClient.invalidateQueries({ queryKey: ["branches"] });
            setFormData(initialFormState);
            setError(null);
            dialogRef.current?.close();
        },
        onError: (error) => {
            setError(
                error?.response?.data?.message || "Failed to create branch"
            );
        },
        onSettled: () => setIsSubmitting(false),
    });

    // Mutation for updating branch
    const updateBranchMutation = useMutation({
        mutationFn: ({ id, data }) => branchService.updateBranch(id, data),
        onSuccess: (response) => {
            showToast(response?.message, "success");
            queryClient.invalidateQueries({ queryKey: ["branches"] });
            setError(null);
            dialogRef.current?.close();
        },
        onError: (error) => {
            setError(
                error?.response?.data?.message || "Failed to update branch"
            );
        },
        onSettled: () => setIsSubmitting(false),
    });

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle desk label changes
    const handleDeskChange = (idx, value) => {
        setFormData((prev) => {
            const desks = prev.desks.map((desk, i) =>
                i === idx ? { ...desk, name: value } : desk
            );
            return { ...prev, desks };
        });
    };

    // Add new desk input
    const handleAddDesk = () => {
        setFormData((prev) => ({
            ...prev,
            desks: [...prev.desks, { name: "" }],
        }));
    };

    // Remove desk input
    const handleRemoveDesk = (idx) => {
        setFormData((prev) => {
            const desks = prev.desks.filter((_, i) => i !== idx);
            return { ...prev, desks };
        });
    };

    // Submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const payload = {
            name: formData.branch_name,
            desks: formData.desks
                .filter((d) => d.name.trim() !== "")
                .map((d) => ({ name: d.name, id: d.id })),
        };
        if (props.mode === "edit" && props.branch) {
            updateBranchMutation.mutate({ id: props.branch.id, data: payload });
        } else {
            createBranchMutation.mutate(payload);
        }
    };

    // Modal close handler
    const handleClose = () => {
        setIsSubmitting(false);
        setError(null);
        if (props.mode === "add") {
            setFormData(initialFormState);
            setInitialData(initialFormState);
        } else if (props.mode === "edit" && props.branch) {
            const editData = {
                branch_name: props.branch.name || "",
                desks: props.branch.desks?.map((d) => ({
                    name: d.name,
                    id: d.id,
                })) || [{ name: "" }],
            };
            setFormData(editData);
            setInitialData(editData);
        }
        dialogRef.current?.close();
    };

    return (
        <dialog
            id="branchFormModal"
            className="modal w-[600px] rounded-[10px] shadow-custom5 backdrop:bg-black/50"
            ref={dialogRef}
        >
            <div className="relative p-[20px] mb-5 rounded-lg">
                {/* Close modal button */}
                <div>
                    <button
                        className="absolute top-3 right-3 w-10 h-10 items-center rounded-full bg-custombg3 text-custom-bluegreen hover:bg-custombg"
                        onClick={handleClose}
                        type="button"
                    >
                        ✕
                    </button>
                </div>
                <div className="pt-5 flex justify-center items-center mb-5">
                    <p className="montserrat-bold text-center text-custom-solidgreen">
                        {props?.mode === "add"
                            ? " Add New Branch"
                            : " Edit Branch"}
                    </p>
                </div>
                <div>
                    {error && (
                        <div className="w-full flex justify-center items-center h-12 bg-red-100 mb-4 rounded-lg">
                            <p className="flex text-[#C42E2E] montserrat-regular">
                                {error}
                            </p>
                        </div>
                    )}
                </div>
                {/* Form */}
                <div className=" w-[550px]">
                    <form onSubmit={handleSubmit}>
                        <div className="py-1">
                            <div
                                className={`flex items-center border rounded-[5px] overflow-hidden  `}
                            >
                                <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex pl-3 py-1 w-[182px]">
                                    Branch Name
                                </span>
                                <CustomInput
                                    name="branch_name"
                                    type="text"
                                    value={formData.branch_name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                />
                            </div>
                        </div>

                        {/* Desks */}
                        <div className="py-2">
                            {formData &&
                                formData.desks?.map((desk, idx) => (
                                    <div key={idx} className="flex mb-2 w-full">
                                        <div className="py-1 w-full">
                                            <div className="flex items-center border rounded-[5px] overflow-hidden">
                                                <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex pl-3 py-1 w-[182px]">
                                                    Desk
                                                </span>
                                                <CustomInput
                                                    type="text"
                                                    value={desk.name}
                                                    onChange={(e) =>
                                                        handleDeskChange(
                                                            idx,
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                                />
                                            </div>
                                        </div>

                                        {formData.desks.length > 1 && (
                                            <IoIosCloseCircle
                                                size={24}
                                                onClick={() =>
                                                    handleRemoveDesk(idx)
                                                }
                                                className="ml-2 mt-2 text-red-500 h-6 w-6"
                                            />
                                        )}
                                    </div>
                                ))}
                            <button
                                type="button"
                                className="mt-1 text-custom-bluegreen underline montserrat-regular text-sm underline-offset-2"
                                onClick={handleAddDesk}
                            >
                                + Add Desk
                            </button>
                        </div>

                        {/* Submit */}
                        <div className="mt-6 flex justify-end">
                            <Button
                                type="submit"
                                disabled={isSubmitting || isButtonDisabled()}
                                className={`w-[150px] h-[35px] rounded-[10px] text-sm gradient-btn5 text-white montserrat-semibold ${
                                    isSubmitting || isButtonDisabled()
                                        ? "cursor-not-allowed opacity-50"
                                        : ""
                                }`}
                            >
                                {isSubmitting ? (
                                    <CircularProgress className="spinnerSize" />
                                ) : (
                                    <>
                                        {props?.mode === "edit"
                                            ? "Update Branch"
                                            : "Add Branch "}
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </dialog>
    );
});

export default BranchFormModal;

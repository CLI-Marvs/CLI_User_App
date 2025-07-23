import React, {
    forwardRef,
    useImperativeHandle,
    useState,
    useEffect,
} from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import { useProperty } from "@/context/PropertyPricing/PropertyContext";
import { toLowerCaseText } from "@/util/formatToLowerCase";
import { walkinTransactionService } from "@/component/servicesApi/apiCalls/emojiWalkin/walkinTransactionService";
import { showToast } from "@/util/toastUtil";
import Button from "@/component/layout/inquirypage/component/ui/button";
import { queueService } from "@/component/servicesApi/apiCalls/emojiWalkin/queueService";
import isButtonDisabled from "@/util/isFormButtonDisabled";
import CustomInput from "@/component/Input/CustomInput";
import CircularProgress from "@mui/material/CircularProgress";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const formDataInitialState = {
    category_id: "",
    property_id: "",
    first_name: "",
    last_name: "",
    contact_number: "",
    contract_number: "",
    email: "",
    details_message: "",
};

const EngageFormModal = forwardRef(
    ({ itemData, categories, setSelectedItem }, ref) => {
        //Ref
        const dialogRef = React.useRef(null);
        //States
        const [formData, setFormData] = useState(formDataInitialState);
        //Hooks
        const { propertyNamesList } = useProperty();
        const queryClient = useQueryClient();
        // Form validation
        const isPropertyButtonDisabled = isButtonDisabled(
            formData,
            Object.keys(formDataInitialState).filter(
                (key) => key !== "details_message"
            )
        );
        // Mutations
        const transactionMutation = useMutation({
            mutationFn: walkinTransactionService.createWalkinTransactionDetail,
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: ["queueWalkinTransactions"],
                });
            },
        });
        const queueMutation = useMutation({
            mutationFn: queueService.updateQueueStatus,
        });

        // Derived state
        const isSubmitting =
            transactionMutation.isPending || queueMutation.isPending;

        // Expose methods to parent through ref
        useImperativeHandle(ref, () => ({
            showModal: () => {
                if (dialogRef.current) {
                    dialogRef.current.showModal();
                }
            },
            closeModal: () => {
                if (dialogRef.current) {
                    dialogRef.current.close();
                }
            },
        }));

        // Populate form when item data changes
        useEffect(() => {
            if (itemData) {
                setFormData({
                    category_id: itemData.category_id || "",
                    property_id: itemData.property_id || "",
                    first_name: itemData.first_name || "",
                    last_name: itemData.last_name || "",
                    contact_number: itemData.contact_number || "",
                    contract_number: itemData.contract_number || "",
                    email: itemData.email || "",
                    details_message: itemData.details_message || "",
                });
            }
        }, [itemData]);

        //Event Handlers
        // Handle form submission
        const handleSubmit = async (e, actionType) => {
            e.preventDefault();

            // Prepare transaction payload
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
            };

            // Prepare queue payload
            const queuePayload = {
                priority_number: itemData?.priority_number,
                status: actionType,
            };

            try {
                // Submit transaction first
                const transactionResponse =
                    await transactionMutation.mutateAsync(transactionPayload);

                // Then update queue status
                await queueMutation.mutateAsync(queuePayload);


                if(actionType === "resolved"){
                    // Show success toast
                    showToast(
                        transactionResponse?.message ||
                            "Walk-in Transaction Closed Successfully!",
                        "success"
                    );
                }
                else{
                    showToast(
                        transactionResponse?.message ||
                            "Walk-in Transaction Saved Successfully!",
                        "success"
                    );
                }
              

                //Refresh the transaction history list
                queryClient.invalidateQueries({
                    queryKey: ["walkinTransactionHistory"],
                });

                // Reset form data and close dialog
                setFormData(formDataInitialState);
                dialogRef.current?.close();
                setSelectedItem(null);
            } catch (error) {
                showToast(
                    error?.message ||
                        "An error occurred while processing the request",
                    "error"
                );
            }
        };

        // Handle input changes
        const handleInputChange = (e) => {
            const { name, value } = e.target;
            setFormData((prevData) => ({
                ...prevData,
                [name]: value,
            }));
        };

        // Handle modal close
        const handleCloseModal = async () => {
            try {
                // Close the modal dialog first
                dialogRef.current?.close();

                // Create a single transaction for all updates
                await Promise.all([
                    // Update queue status
                    queueMutation.mutateAsync({
                        priority_number: itemData?.priority_number,
                        status: "queue",
                    }),

                    // Update transaction status
                    walkinTransactionService.updateWalkinTransactionStatus({
                        walkin_transaction_id: itemData?.id,
                        status: "queue",
                    }),
                ]);

                // Batch invalidate queries
                queryClient.invalidateQueries({
                    queries: [{ queryKey: ["queueWalkinTransactions"] }],
                });

                // Reset selected item
                setSelectedItem(null);
            } catch (error) {
                showToast("Error closing the form", "error");
            }
        };

        return (
            <dialog
                id="engageFormModal"
                className="modal w-[550px] rounded-[10px] shadow-custom5 backdrop:bg-black/50"
                ref={dialogRef}
            >
                <div className="relative p-[20px] mb-5 rounded-lg">
                    {/* Close modal button */}
                    <div className="">
                        <div>
                            <button
                                className="absolute top-3 right-3 w-10 h-10 items-center rounded-full bg-custombg3 text-custom-bluegreen hover:bg-custombg"
                                onClick={handleCloseModal}
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* Modal content */}
                    <div className=" ">
                        <div className="mt-10">
                            <h1 className="montserrat-bold ">
                                Priority Number :{" "}
                                <span className="montserrat-regular">
                                    {itemData?.priority_number}
                                </span>
                            </h1>
                        </div>

                        {/* Category Type */}
                        <div className="py-2">
                            <div className="flex items-center border border-custom-bluegreen rounded-[5px] overflow-hidden ">
                                <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex items-center w-[200px] tablet:w-[175px] mobile:w-[270px] mobile:text-xs -mr-4 pl-3 py-1">
                                    Category Type
                                </span>
                                <div className="relative w-full">
                                    <select
                                        name="category_id"
                                        value={formData.category_id}
                                        onChange={handleInputChange}
                                        className="appearance-none w-full px-4 py-1 text-sm bg-white focus:outline-none border-0 mobile:text-xs"
                                    >
                                        <option value="">
                                            (Select category type)
                                        </option>
                                        {categories &&
                                            categories.map((category) => (
                                                <option
                                                    key={category.id}
                                                    value={category.id}
                                                >
                                                    {category.name}
                                                </option>
                                            ))}
                                    </select>
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3  bg-custom-lightestgreen text-custom-bluegreen pointer-events-none">
                                        <IoMdArrowDropdown />
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/*Project/Property */}
                        <div className="py-1">
                            <div className="flex items-center border border-custom-bluegreen rounded-[5px] overflow-hidden ">
                                <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex items-center w-[200px] tablet:w-[175px] mobile:w-[270px] mobile:text-xs -mr-4 pl-3 py-1">
                                    Project
                                </span>
                                <div className="relative w-full">
                                    <select
                                        name="property_id"
                                        value={formData.property_id}
                                        onChange={handleInputChange}
                                        className="appearance-none w-full px-4 py-1 text-sm bg-white focus:outline-none border-0 mobile:text-xs"
                                    >
                                        <option value="">
                                            (Select project)
                                        </option>
                                        {propertyNamesList.map((property) => (
                                            <option
                                                key={property.id}
                                                value={property.id}
                                            >
                                                {toLowerCaseText(property.name)}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3  bg-custom-lightestgreen text-custom-bluegreen pointer-events-none">
                                        <IoMdArrowDropdown />
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/*First name */}
                        <div className="py-1">
                            <div
                                className={`flex items-center border border-custom-bluegreen rounded-[5px] overflow-hidden  `}
                            >
                                <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex pl-3 py-1 w-[182px]">
                                    First Name
                                </span>
                                <CustomInput
                                    name="first_name"
                                    type="text"
                                    value={formData.first_name}
                                    onChange={handleInputChange}
                                    noNumbers={true}
                                    className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                />
                            </div>
                        </div>

                        {/*Last name */}
                        <div className="py-1">
                            <div
                                className={`flex items-center border border-custom-bluegreen rounded-[5px] overflow-hidden  `}
                            >
                                <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex pl-3 py-1 w-[182px]">
                                    Last Name
                                </span>
                                <CustomInput
                                    name="last_name"
                                    type="text"
                                    value={formData.last_name}
                                    onChange={handleInputChange}
                                    noNumbers={true}
                                    className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                />
                            </div>
                        </div>

                        {/*Contact Number */}
                        <div className="py-1">
                            <div
                                className={`flex items-center border border-custom-bluegreen rounded-[5px] overflow-hidden  `}
                            >
                                <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex pl-3 py-1 w-[182px]">
                                    Mobile Number
                                </span>
                                <CustomInput
                                    name="contact_number"
                                    type="number"
                                    value={formData.contact_number}
                                    onChange={handleInputChange}
                                    className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                    restrictNumbers={true}
                                />
                            </div>
                        </div>

                        {/*Contract Number*/}
                        <div className="py-1">
                            {/* TODO: refactor this and move the  validation to 'validateContractNumber util */}
                            <div
                                className={`flex items-center border border-custom-bluegreen rounded-[5px] overflow-hidden ${
                                    formData.contract_number &&
                                    formData.contract_number.length !== 13
                                        ? "border-red-500"
                                        : formData.contract_number.length === 13
                                        ? "border-green-500"
                                        : " "
                                }`}
                            >
                                <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex pl-3 py-1 w-[182px]">
                                    Contract Number
                                </span>
                                <CustomInput
                                    name="contract_number"
                                    type="number"
                                    value={formData.contract_number}
                                    onChange={(e) => {
                                        if (e.target.value.length <= 13) {
                                            handleInputChange(e);
                                        }
                                    }}
                                    className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                    restrictNumbers={true}
                                    maxLength={13}
                                />
                            </div>
                            <span
                                className={`flex justify-end text-xs ${
                                    formData.contract_number &&
                                    formData.contract_number.length !== 13
                                        ? "text-red-500"
                                        : formData.contract_number.length === 13
                                        ? "text-green-500"
                                        : "text-gray-400"
                                }`}
                            >
                                {formData?.contract_number.length} /13
                                {formData.contract_number &&
                                    formData.contract_number.length !== 13 &&
                                    " (Must be 13 digits)"}
                            </span>
                        </div>

                        {/*Email*/}
                        <div className="py-1">
                            <div
                                className={`flex items-center border border-custom-bluegreen rounded-[5px] overflow-hidden  `}
                            >
                                <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex pl-3 py-1 w-[182px]">
                                    Email
                                </span>
                                <CustomInput
                                    name="email"
                                    type="text"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                />
                            </div>
                        </div>

                        {/* Detailed notes */}
                        <div
                            className={`  rounded-[5px] border-custom-bluegreen border mt-1`}
                        >
                            <div className="flex items-center justify-between h-full bg-custom-lightestgreen rounded-t-[5px]">
                                <p className="text-custom-bluegreen text-sm  pl-3  flex-grow mobile:text-xs mobile:w-[170px]">
                                    Detailed Notes
                                </p>
                                <span className="bg-white text-sm2 text-gray-400 font-normal py-2 border-l border-custom-bluegreen pl-2 pr-12 mobile:pr-1 mobile:text-xs ml-auto rounded-tr-[4px]">
                                    {formData.details_message.length}/500
                                    characters
                                </span>
                            </div>
                            <div className="flex gap-3 ">
                                <CustomInput
                                    type="textarea"
                                    id="details_message"
                                    name="details_message"
                                    maxLength={500}
                                    value={formData.details_message || ""}
                                    className={`border-custom-bluegreen rounded-b-[5px] border-t w-full pl-2 outline-none`}
                                    onChange={handleInputChange}
                                    rows="4"
                                />
                            </div>
                        </div>

                        <div className="mt-10 flex justify-end gap-3">
                            <Button
                                type="submit"
                                onClick={(e) => handleSubmit(e, "save")}
                                disabled={
                                    isPropertyButtonDisabled || isSubmitting
                                }
                                className={`bg-white border w-[150px] h-[35px] rounded-[10px] text-sm  text-custom-bluegreen montserrat-semibold  border-custom-bluegreen ${
                                    isPropertyButtonDisabled || isSubmitting
                                        ? "cursor-not-allowed opacity-50"
                                        : ""
                                }`}
                            >
                                {isSubmitting &&
                                transactionMutation.variables?.status ===
                                    "save" ? (
                                    <CircularProgress className="spinnerSize" />
                                ) : (
                                    <>Save</>
                                )}
                            </Button>
                            <Button
                                type="submit"
                                onClick={(e) => handleSubmit(e, "resolved")}
                                disabled={
                                    isPropertyButtonDisabled || isSubmitting
                                }
                                className={`border  w-[150px] h-[35px] rounded-[10px] text-sm bg-white text-white montserrat-semibold gradient-btn5 ${
                                    isPropertyButtonDisabled || isSubmitting
                                        ? "cursor-not-allowed opacity-50"
                                        : ""
                                }`}
                            >
                                {isSubmitting &&
                                transactionMutation.variables?.status ===
                                    "resolved" ? (
                                    <CircularProgress className="spinnerSize" />
                                ) : (
                                    <>Close ticket</>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </dialog>
        );
    }
);

export default EngageFormModal;

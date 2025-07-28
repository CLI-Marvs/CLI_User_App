import React, { useEffect, useRef } from "react";
import CustomInput from "@/component/Input/CustomInput";
import { toLowerCaseText } from "@/util/formatToLowerCase";

const WalkinTransactionModal = ({ open, onClose, item }) => {
    const dialogRef = useRef(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (open) {
            if (!dialog.open) dialog.showModal();
        } else {
            if (dialog.open) dialog.close();
        }

        const handleClose = () => onClose?.();
        dialog.addEventListener("close", handleClose);
        return () => dialog.removeEventListener("close", handleClose);
    }, [open, onClose]);

    if (!item) return null;

    return (
        <dialog
            ref={dialogRef}
            id="engageFormModal"
            className="modal w-[550px] rounded-[10px] shadow-custom5 backdrop:bg-black/50"
        >
            <div className="relative p-[20px]  rounded-lg">
                {/* Close modal button */}
                <div className="">
                    <div>
                        <button
                            className="absolute top-3 right-3 w-10 h-10 items-center rounded-full bg-custombg3 text-custom-bluegreen hover:bg-custombg"
                            onClick={onClose}
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
                                {item?.priority_number}
                            </span>
                        </h1>
                    </div>
                    {/* Status */}
                    <div className="">
                        <div
                            className={`flex items-center border rounded-[5px] overflow-hidden  `}
                        >
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex pl-3 py-1 w-[195px]  montserrat-regular ">
                                Status
                            </span>
                            <CustomInput
                                name="first_name"
                                type="text"
                                value={toLowerCaseText(item.status || "N/A")}
                                disabled
                                className="w-full px-2 text-sm focus:outline-none mobile:text-xs  montserrat-regular "
                            />
                        </div>
                    </div>

                    {/* Inquiry Type */}
                    <div className="py-1">
                        <div
                            className={`flex items-center border rounded-[5px] overflow-hidden  `}
                        >
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex pl-3 py-1 w-[195px]  montserrat-regular ">
                                Inquiry Type
                            </span>
                            <CustomInput
                                name="first_name"
                                type="text"
                                value={item.category?.name || ""}
                                disabled
                                className="w-full px-2 text-sm focus:outline-none mobile:text-xs  montserrat-regular "
                            />
                        </div>
                    </div>

                    {/*Project/Property */}
                    <div className="py-1">
                        <div
                            className={`flex items-center border rounded-[5px] overflow-hidden  `}
                        >
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex pl-3 py-1 w-[195px]  montserrat-regular ">
                                Project
                            </span>
                            <CustomInput
                                name="first_name"
                                type="text"
                                value={toLowerCaseText(
                                    item.walkin_transaction_detail
                                        ?.property_master?.property_name || ""
                                )}
                                disabled
                                className="w-full px-2 text-sm focus:outline-none mobile:text-xs  montserrat-regular "
                            />
                        </div>
                    </div>
                    {/*First name */}
                    <div className="py-1">
                        <div
                            className={`flex items-center border rounded-[5px] overflow-hidden  `}
                        >
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex pl-3 py-1 w-[195px]  montserrat-regular ">
                                First Name
                            </span>
                            <CustomInput
                                name="first_name"
                                type="text"
                                value={
                                    item.walkin_transaction_detail
                                        ?.first_name || ""
                                }
                                disabled
                                className="w-full px-2 text-sm focus:outline-none mobile:text-xs  montserrat-regular "
                            />
                        </div>
                    </div>

                    {/*Last name */}
                    <div>
                        <div
                            className={`flex items-center border rounded-[5px] overflow-hidden  `}
                        >
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex pl-3 py-1 w-[195px]  montserrat-regular ">
                                Last Name
                            </span>
                            <CustomInput
                                name="last_name"
                                type="text"
                                value={
                                    item.walkin_transaction_detail?.last_name ||
                                    ""
                                }
                                className="w-full px-2 text-sm focus:outline-none mobile:text-xs  montserrat-regular "
                                disabled
                            />
                        </div>
                    </div>

                    {/*Contact Number */}
                    <div className="py-1">
                        <div
                            className={`flex items-center border rounded-[5px] overflow-hidden  `}
                        >
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex pl-3 py-1 w-[195px]  montserrat-regular ">
                                Mobile Number
                            </span>
                            <CustomInput
                                name="contact_number"
                                type="number"
                                value={
                                    item.walkin_transaction_detail
                                        ?.contact_number || ""
                                }
                                className="w-full px-2 text-sm focus:outline-none mobile:text-xs  montserrat-regular "
                                restrictNumbers={true}
                                disabled
                            />
                        </div>
                    </div>

                    {/*Contract Number*/}
                    <div className="">
                        <div
                            className={`flex items-center border rounded-[5px] overflow-hidden  `}
                        >
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex pl-3 py-1 w-[195px]  montserrat-regular ">
                                Contract Number
                            </span>
                            <CustomInput
                                name="contract_number"
                                type="number"
                                value={
                                    item.walkin_transaction_detail
                                        ?.contract_number || ""
                                }
                                className="w-full px-2 text-sm focus:outline-none mobile:text-xs"
                                disabled
                            />
                        </div>
                    </div>

                    {/*Email*/}
                    <div className="py-1">
                        <div
                            className={`flex items-center border rounded-[5px] overflow-hidden  `}
                        >
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex pl-3 py-1 w-[195px]  montserrat-regular ">
                                Email
                            </span>
                            <CustomInput
                                name="email"
                                type="text"
                                value={
                                    item.walkin_transaction_detail?.email || ""
                                }
                                className="w-full px-2 text-sm focus:outline-none mobile:text-xs  montserrat-regular "
                                disabled
                            />
                        </div>
                    </div>

                    {/* Detailed notes */}
                    <div
                        className={`  rounded-[5px] bg-custom-lightestgreen border`}
                    >
                        <div className="flex items-center justify-between">
                            <p className="text-custom-bluegreen text-sm bg-custom-lightestgreen pl-3  flex-grow mobile:text-xs mobile:w-[170px] montserrat-regular py-2">
                                Detailed Notes
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <CustomInput
                                type="textarea"
                                id="details_message"
                                name="details_message"
                                maxLength={500}
                                value={
                                    item.walkin_transaction_detail
                                        ?.detailed_notes ||
                                    "No message provided."
                                }
                                className={`border-custom-bluegreen rounded-b-[5px] border-t w-full pl-2 outline-none montserrat-regular py-4`}
                                disabled
                                rows="4"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </dialog>
    );
};

export default WalkinTransactionModal;

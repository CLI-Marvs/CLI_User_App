import React, { useEffect, useRef } from "react";
import CustomInput from "frontend/component/Input/CustomInput";
import { toLowerCaseText } from "frontend/util/formatToLowerCase";
import SendSurveyModal from "frontend/component/layout/inquirypage/SendSurveyModal";
import { useSurvey } from "frontend/context/Survey/SurveyContext";
import { IoIosCheckmarkCircle } from "react-icons/io";

const WalkinTransactionModal = ({ open, onClose, item }) => {
    const dialogRef = useRef(null);
    const { surveyStatus, fetchSurveyStatus } = useSurvey();
    const surveyModalRef = useRef(null);

    useEffect(() => {
        if (!item?.ticket_id) return;
        fetchSurveyStatus(item.ticket_id);
    }, [item?.ticket_id, fetchSurveyStatus]);

    const handleClose = () => {
        onClose?.();
        if (item?.ticket_id) {
            fetchSurveyStatus(item.ticket_id);
        }
    };

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (open) {
            if (!dialog.open) dialog.showModal();
        } else {
            if (dialog.open) dialog.close();
        }

        dialog.addEventListener("close", handleClose);
        return () => dialog.removeEventListener("close", handleClose);
    }, [open, onClose, item?.ticket_id, fetchSurveyStatus]);

    if (!item) return null;

    return (
        <dialog
            ref={dialogRef}
            id="engageFormModal"
            className="modal w-[600px] rounded-[10px] shadow-custom5 backdrop:bg-black/50"
        >
            <div className="relative p-[20px]  rounded-lg">
                {/* Close modal button */}
                <div className="">
                    <div>
                        <button
                            className="absolute top-3 right-3 w-10 h-10 items-center rounded-full bg-custombg3 text-custom-bluegreen hover:bg-custombg"
                            onClick={handleClose}
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Modal content */}
                <div>
                    <div className="mt-[50px] flex justify-between items-center">
                        <h1 className="montserrat-bold ">
                            Priority Number :{" "}
                            <span className="montserrat-regular">
                                {item?.priority_number}
                            </span>
                        </h1>
                        {item?.status === "resolved" && (
                            <div className="flex items-center">
                                {surveyStatus === "submitted" ? (
                                    <div className="flex justify-start items-center px-[8px] font-semibold text-[13px] text-custom-lightgreen space-x-1">
                                        <p>Survey Submitted</p>
                                        <IoIosCheckmarkCircle className="size-[18px] text-custom-lightgreen" />
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => {
                                            if (surveyModalRef.current) {
                                                surveyModalRef.current.showModal();
                                            }
                                        }}
                                        className="w-auto font-semibold text-[13px] text-custom-lightgreen underline cursor-pointer montserrat-regular"
                                    >
                                        Input Survey Data
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                    {/* First Name */}
                    <div className="py-1">
                        <div className="flex items-center border border-custom-bluegreen rounded-[5px] overflow-hidden ">
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex pl-3 py-1 w-[215px] montserrat-regular ">
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
                                className="w-full px-2 text-sm focus:outline-none mobile:text-xs montserrat-regular"
                            />
                        </div>
                    </div>

                    {/* Middle Name with N/A */}
                    <div className="py-1">
                        <div className="flex relative items-center border border-custom-bluegreen rounded-[5px] overflow-hidden">
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex pl-3 py-1 w-[215px] montserrat-regular">
                                Middle Name
                            </span>
                            <CustomInput
                                name="middle_name"
                                type="text"
                                value={
                                    item.walkin_transaction_detail
                                        ?.middle_name_na
                                        ? ""
                                        : item.walkin_transaction_detail
                                            ?.middle_name || ""
                                }
                                disabled
                                className="w-full px-2 text-sm focus:outline-none mobile:text-xs montserrat-regular capitalize"
                            />
                        </div>
                    </div>

                    {/* Last Name */}
                    <div className="py-1">
                        <div className="flex items-center border border-custom-bluegreen rounded-[5px] overflow-hidden">
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex pl-3 py-1 w-[215px] montserrat-regular">
                                Last Name
                            </span>
                            <CustomInput
                                name="last_name"
                                type="text"
                                value={
                                    item.walkin_transaction_detail?.last_name ||
                                    ""
                                }
                                disabled
                                className="w-full px-2 text-sm focus:outline-none mobile:text-xs montserrat-regular"
                            />
                        </div>
                    </div>

                    {/* Suffix Name with N/A */}
                    <div className="py-1">
                        <div className="flex relative items-center border border-custom-bluegreen rounded-[5px] overflow-hidden">
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex pl-3 py-1 w-[215px] montserrat-regular">
                                Suffix Name
                            </span>
                            <CustomInput
                                name="suffix_name"
                                type="text"
                                value={
                                    item.walkin_transaction_detail
                                        ?.suffix_name || ""
                                }
                                disabled
                                className="w-full px-2 text-sm focus:outline-none mobile:text-xs montserrat-regular capitalize"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="py-1">
                        <div className="flex items-center border border-custom-bluegreen rounded-[5px] overflow-hidden">
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex pl-3 py-1 w-[215px] montserrat-regular">
                                Email
                            </span>
                            <CustomInput
                                name="email"
                                type="text"
                                value={
                                    item.walkin_transaction_detail?.email || ""
                                }
                                disabled
                                className="w-full px-2 text-sm focus:outline-none mobile:text-xs montserrat-regular"
                            />
                        </div>
                    </div>

                    {/* Mobile Number */}
                    <div className="py-1">
                        <div className="flex items-center border border-custom-bluegreen rounded-[5px] overflow-hidden">
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex pl-3 py-1 w-[215px] montserrat-regular">
                                Mobile Number
                            </span>
                            <CustomInput
                                name="contact_number"
                                type="number"
                                value={
                                    item.walkin_transaction_detail
                                        ?.contact_number || ""
                                }
                                disabled
                                className="w-full px-2 text-sm focus:outline-none mobile:text-xs montserrat-regular"
                            />
                        </div>
                    </div>

                    {/* Property */}
                    <div className="py-1">
                        <div className="flex items-center border border-custom-bluegreen rounded-[5px] overflow-hidden">
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex pl-3 py-1 w-[215px] montserrat-regular">
                                Property
                            </span>
                            <CustomInput
                                name="property"
                                type="text"
                                value={
                                    item.walkin_transaction_detail
                                        ?.property_masters_id === null
                                        ? "N/A"
                                        : toLowerCaseText(
                                            item.walkin_transaction_detail
                                                ?.property_master
                                                ?.property_name
                                        )
                                }
                                disabled
                                className="w-full px-2 text-sm focus:outline-none mobile:text-xs montserrat-regular"
                            />
                        </div>
                    </div>

                    {/* Category Type/Concern Regarding */}
                    <div className="py-1">
                        <div className="flex items-center border border-custom-bluegreen rounded-[5px] overflow-hidden">
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex pl-3 py-1 w-[215px] montserrat-regular">
                                Concern Regarding
                            </span>
                            <CustomInput
                                name="category"
                                type="text"
                                value={
                                    item.walkin_transaction_detail?.category
                                        ?.name || "N/A"
                                }
                                disabled
                                className="w-full px-2 text-sm focus:outline-none mobile:text-xs montserrat-regular"
                            />
                        </div>
                    </div>

                    {/* Type */}
                    <div className="py-1">
                        <div className="flex items-center border border-custom-bluegreen rounded-[5px] overflow-hidden">
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex pl-3 py-1 w-[215px] montserrat-regular">
                                Type
                            </span>
                            <CustomInput
                                name="type"
                                type="text"
                                value={
                                    item.walkin_transaction_detail?.type || ""
                                }
                                disabled
                                className="w-full px-2 text-sm focus:outline-none mobile:text-xs montserrat-regular"
                            />
                        </div>
                    </div>

                    {/* Inquiry From */}
                    <div className="py-1">
                        <div className="flex items-center border border-custom-bluegreen rounded-[5px] overflow-hidden">
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex pl-3 py-1 w-[215px] montserrat-regular">
                                Inquiry From
                            </span>
                            <CustomInput
                                name="inquiry_from"
                                type="text"
                                value={
                                    item.walkin_transaction_detail
                                        ?.inquiry_from || ""
                                }
                                disabled
                                className="w-full px-2 text-sm focus:outline-none mobile:text-xs montserrat-regular"
                            />
                        </div>
                    </div>

                    {/* Contract Number */}
                    <div className="py-1">
                        <div className="flex items-center border border-custom-bluegreen rounded-[5px] overflow-hidden">
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex pl-3 py-1 w-[215px] montserrat-regular">
                                Contract Number
                            </span>
                            <CustomInput
                                name="contract_number"
                                type="number"
                                value={
                                    item.walkin_transaction_detail
                                        ?.contract_number || ""
                                }
                                disabled
                                className="w-full px-2 text-sm focus:outline-none mobile:text-xs montserrat-regular"
                            />
                        </div>
                    </div>

                    {/* Unit/Lot Number */}
                    <div className="py-1">
                        <div className="flex items-center border border-custom-bluegreen rounded-[5px] overflow-hidden">
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex pl-3 py-1 w-[215px] montserrat-regular">
                                Unit/Lot Number
                            </span>
                            <CustomInput
                                name="unit_number"
                                type="text"
                                value={
                                    item.walkin_transaction_detail
                                        ?.unit_number || ""
                                }
                                disabled
                                className="w-full px-2 text-sm focus:outline-none mobile:text-xs montserrat-regular"
                            />
                        </div>
                    </div>

                    {/* Detailed Notes with character count */}
                    <div className="rounded-[5px] bg-custom-lightestgreen border border-custom-bluegreen mt-2">
                        <div className="flex items-center justify-between">
                            <p className="text-custom-bluegreen text-sm bg-custom-lightestgreen pl-3 flex-grow mobile:text-xs mobile:w-[170px] montserrat-regular py-2">
                                Detailed Notes
                            </p>
                            <span className="bg-white text-sm2 text-gray-400 font-normal py-3 border-l border-custom-bluegreen pl-2 pr-12 mobile:pr-1 mobile:text-xs ml-auto rounded-tr-[4px]">
                                {
                                    (
                                        item.walkin_transaction_detail
                                            ?.detailed_notes || ""
                                    ).length
                                }
                                /500 characters
                            </span>
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
                                className="border-custom-bluegreen rounded-b-[5px] border-t w-full pl-2 outline-none montserrat-regular py-4"
                                disabled
                                rows="4"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <SendSurveyModal
                    modalRef={surveyModalRef}
                    ticketId={item?.ticket_id}
                />
            </div>
        </dialog>
    );
};

export default WalkinTransactionModal;

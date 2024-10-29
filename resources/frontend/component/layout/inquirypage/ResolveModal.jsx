import React, { useEffect, useState } from "react";
import { useStateContext } from "../../../context/contextprovider";
import apiService from "../../servicesApi/apiService";
import { AiFillInfoCircle } from "react-icons/ai";

const ResolveModal = ({ modalRef, ticketId, dataRef }) => {
    const { getAllConcerns, user, getInquiryLogs, data, assigneesPersonnel } =
        useStateContext();
    const [remarks, setRemarks] = useState("");
    const maxCharacters = 500;
    const dataConcern =
        data?.find((items) => items.ticket_id === ticketId) || {};
    const messageId = dataConcern?.message_id || null;

    console.log("assigneesPersonnle", assigneesPersonnel);
    const capitalizeWords = (name) => {
        if (name) {
            return name
                .split(" ")
                .map(
                    (word) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase()
                )
                .join(" ");
        }
    };
    const updateStatus = async () => {
        try {
            const response = await apiService.post("resolve", {
                ticket_id: ticketId,
                admin_name: `${user?.firstname} ${user?.lastname}`,
                department: user?.department,
                buyer_email: dataRef.buyer_email,
                buyer_lastname: dataRef.buyer_lastname,
                buyer_name: `${capitalizeWords(`${dataRef.buyer_firstname} ${dataRef.buyer_lastname}`)}`,
                details_concern: dataRef.details_concern,
                remarks: remarks,
                assignees: assigneesPersonnel[ticketId],
                // assignees_info: Array.isArray(assigneesPersonnel[ticketId])
                //     ? assigneesPersonnel[ticketId].map((person) => ({
                //           assignees_email: person.employee_email,
                //           assignees_name: person.name,
                //       }))
                //     : [],
                message_id: messageId,
            });
            setRemarks("");
            getInquiryLogs(ticketId);
            getAllConcerns();
            console.log("sucess", response);
        } catch (error) {
            console.log("error saving", error);
        }
    };

    return (
        <dialog
            id="Resolved"
            className="modal w-[557px] rounded-[10px] shadow-custom5 backdrop:bg-black/50"
            ref={modalRef}
        >
            <div className=" px-[25px] rounded-lg">
                <div className="">
                    <form
                        method="dialog"
                        className="pt-3 flex justify-end -mr-4"
                    >
                        <button className="absolute justify-center w-10 h-10 items-center rounded-full bg-custom-grayFA text-custom-bluegreen hover:bg-custombg">
                            ✕
                        </button>
                    </form>
                </div>
                <div className="flex justify-center items-center mt-[14px] ">
                    <AiFillInfoCircle className="size-[37px] text-[#5B9BD5]" />
                </div>
                <div className="flex justify-center mt-[30px] mb-[26px]">
                    <p className="montserrat-medium text-[20px]">
                        You want to mark this as resolved?
                    </p>
                </div>
                <div className=" bg-[#EDEDED] border border-[#D9D9D9]">
                    <div className="flex items-center justify-between">
                        <p className="text-custom-gray81 pl-3 text-sm flex-grow">
                            Notes/Remarks
                        </p>
                        <span className="bg-white text-sm2 text-gray-400 font-normal py-3 border border-custom-grayFA pl-2 pr-12 ml-auto">
                            {remarks.length}/500 characters
                        </span>
                    </div>
                    <div className="flex gap-3">
                        <textarea
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            id="message"
                            rows="4"
                            maxLength={maxCharacters}
                            className="block border-t-1 h-40 p-2.5 w-full text-sm text-gray-900 bg-white outline-none"
                        ></textarea>
                    </div>
                </div>
                <div className="mt-5 mb-[25px]">
                    <form
                        method="dialog"
                        className="flex justify-center gap-[19px]"
                    >
                        <button className="gradient-btn5 p-[1px] w-[92px] h-[35px] rounded-[10px]">
                            <div className="w-full h-full rounded-[9px] bg-white flex justify-center items-center montserrat-semibold text-sm">
                                <p className="text-base font-bold bg-gradient-to-r from-custom-bluegreen via-custom-solidgreen to-custom-solidgreen bg-clip-text text-transparent">
                                    Cancel
                                </p>
                            </div>
                        </button>
                        <button
                            onClick={updateStatus}
                            className="h-[35px] w-[185px] text-white rounded-[10px] gradient-btn2 hover:shadow-custom4"
                        >
                            Mark as Resolved
                        </button>
                    </form>
                </div>
            </div>
        </dialog>
    );
};

export default ResolveModal;

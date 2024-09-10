import React, { useEffect, useState } from "react";
import { useStateContext } from "../../../context/contextprovider";
import apiService from "../../servicesApi/apiService";

const ResolveModal = ({ modalRef, ticketId, dataRef }) => {
    const {getAllConcerns, user, getInquiryLogs} = useStateContext();
    const [remarks, setRemarks] = useState("");
    const maxCharacters = 500;

    const updateStatus = async () => {
        try {
            const response = await apiService.post("resolve", {
                ticket_id: ticketId,
                admin_name: user?.firstname,
                department: user?.department,
                buyer_email: dataRef.buyer_email,
                remarks: remarks
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
        <dialog id="Resolved" className="modal w-[557px] rounded-[10px] shadow-custom5 backdrop:bg-black/50" ref={modalRef}>
            <div className=" px-[25px] rounded-lg">
                <div className="">
                    <form
                        method="dialog"
                        className="pt-3 flex justify-end -mr-4"
                    >
                        <button className="flex justify-center w-10 h-10 items-center rounded-full bg-custom-grayFA text-custom-bluegreen hover:bg-custombg">
                            ✕
                        </button>
                    </form>
                </div>
                <div className=" flex justify-center items-center mb-6">
                    <p className="text-2xl montserrat-bold text-custom-solidgreen">
                        Remarks
                    </p>
                </div>
                <div className="border border-b-1 border-[#D9D9D9] my-[10px]"></div>
                <div className=" bg-custom-grayFA border border-custom-grayF1">
                    <div className="flex items-center justify-between">
                        <p className="text-custom-gray81 pl-3 text-sm montserrat-semibold flex-grow">
                            Details
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
                            className="block border-t-1 h-40 p-2.5 w-full text-sm text-gray-900 bg-white"
                        ></textarea>
                    </div>
                </div>
                <div className="mt-5 mb-[25px]">
                    <form method="dialog" className="flex justify-end">
                        <button onClick={updateStatus} className="h-12 text-white px-10 rounded-lg gradient-btn2 hover:shadow-custom4">
                            Mark as Resolved
                        </button>
                    </form>
                </div>
            </div>
        </dialog>
    );
};

export default ResolveModal;

import React, { useEffect, useState } from "react";
import { useStateContext } from "../../../context/contextprovider";
import apiService from "../../servicesApi/apiService";
import { useNavigate } from "react-router-dom";

const AssignModal = ({ modalRef, employeeData, isAssign }) => {

    const { user, getInquiryLogs, getAllConcerns } = useStateContext();
    const [remarks, setRemarks] = useState("");
    const navigate = useNavigate();
    const maxCharacters = 500;

    const saveAssignee = async () => {
        if(!employeeData || Object.keys(employeeData).length === 0) {
            alert("please select employee first");
            return;
        }
        try {
            const response = await apiService.post("add-assignee", {
                ...employeeData,
                assign_by: user?.firstname + " " + user?.lastname,
                assign_by_department: user?.department,
                remarks: remarks,
            });
            getInquiryLogs(employeeData.ticketId);
            getAllConcerns();
            console.log("sucess");
        } catch (error) {
            console.log("error assigning", error);
        }
    };




    const reassignInquiry = async () => {
        if(!employeeData || Object.keys(employeeData).length === 0) {
            alert("please select employee first");
            return;
        }
        try {
            const response = await apiService.post("reassign", {
                ...employeeData,
                assign_by: user?.firstname + " " + user?.lastname,
                assign_by_department: user?.department,
                remarks: remarks,
            });
            getInquiryLogs(employeeData.ticketId);
            getAllConcerns();
           /*  navigate("/inquirymanagement/inquirylist"); */
        } catch (error) {
            console.log("error assigning", error);
        }
    };
   
    useEffect(() => {

    }, [isAssign]);
    return (
        <dialog
            id="Assign"
            className="modal w-[557px] rounded-[10px] shadow-custom4 backdrop:bg-black/50"
            ref={modalRef}
        >
            <div className=" px-[25px] rounded-lg">
                <div className="">
                    <form
                        method="dialog"
                        className="pt-3 flex justify-end -mr-3"
                    >
                        <button className="flex justify-center w-10 h-10 items-center rounded-full bg-custombg3 text-custom-bluegreen hover:bg-custombg">
                            ✕
                        </button>
                    </form>
                </div>
                <div className=" flex justify-center items-center mb-6">
                    <p className="text-2xl montserrat-bold text-custom-solidgreen">
                        Remarks
                    </p>
                </div>
                <div className="border border-b-1 border-gray-300 my-2"></div>
                <div className=" bg-custombg border">
                    <div className="flex items-center justify-between">
                        <p className="text-custom-gray81 pl-3 text-sm montserrat-semibold flex-grow">
                            Details
                        </p>
                        <span className="bg-white text-sm2 text-gray-400 font-normal py-3 border pl-2 pr-12 ml-auto">
                            {remarks.length}/500 characters
                        </span>
                    </div>
                    <div className="flex gap-3">
                        <textarea
                            onChange={(e) => setRemarks(e.target.value)}
                            value={remarks}
                            id="message"
                            maxLength={maxCharacters}
                            rows="4"
                            className="block border-t-1 h-40 p-2.5 w-full text-sm text-gray-900 bg-white"
                        ></textarea>
                    </div>
                </div>
                <div className="mt-5 mb-[25px]">
                    <form method="dialog" className="flex justify-end">
                        <button
                            onClick={isAssign ? reassignInquiry : saveAssignee}
                            className="h-12 text-white px-10 rounded-lg gradient-btn2 hover:shadow-custom4"
                        >
                            Assign
                        </button>
                    </form>
                </div>
            </div>
        </dialog>
    );
};

export default AssignModal;

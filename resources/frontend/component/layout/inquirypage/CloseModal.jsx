import React, { useEffect, useState, useCallback } from "react";
import { useStateContext } from "../../../context/contextprovider";
import apiService from "../../servicesApi/apiService";
import { AiFillInfoCircle } from "react-icons/ai";
import { IoMdArrowDropdown } from "react-icons/io";
import { SURVEY_LINKS } from '../../../constant/data/surveyLink';
import CircularProgress from "@mui/material/CircularProgress";

const CloseModal = ({ modalRef, ticketId, dataRef, onupdate }) => {
    const { getAllConcerns, user, getInquiryLogs, data, assigneesPersonnel } =
        useStateContext();
    const [remarks, setRemarks] = useState("");
    const [isCommunicationTypeRequired, setIsCommunicationTypeRequired] = useState(false);
    const [isSurveyRequired, setIsSurveyRequired] = useState(false);
    const maxCharacters = 500;
    const dataConcern =
        data?.find((items) => items.ticket_id === ticketId) || {};
    const messageId = dataConcern?.message_id || null;
    const [communicationType, setCommunicationType] = useState("");
    const [selectedSurveyType, setSelectedSurveyType] = useState([]);
    const [isLoading, setIsLoading] = useState(false);


    /**
     *  Set initial communication type when dataRef changes
     */
    useEffect(() => {
        if (dataRef) {
            setCommunicationType(dataRef.communication_type);
        }
    }, [dataRef])

    /**
     *Memoized function to fetch all concerns
     */
    const getConcerns = useCallback(() => {
        getAllConcerns();
    }, []);

    /**
     * Call getAllConcerns initially if needed, without dependency on dataConcern
     */
    useEffect(() => {
        getConcerns();
    }, [getConcerns]);

    const handleCommunityTypeChange = (e) => {
        setCommunicationType(e.target.value);
        setIsCommunicationTypeRequired(false);
    };

    /*
     * Function to update selected survey type
    */
    const handleSurveyChange = (selectedSurveyType) => {
        setSelectedSurveyType(selectedSurveyType);
        setIsSurveyRequired(false);
    };

    /* const capitalizeWords = (name) => {
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
 */
    /**
     * Function to handle marking a ticket as closed
     */
    const handleMarkAsClosed = async (status) => {
        if (communicationType === null || communicationType === "") {
            setIsCommunicationTypeRequired(true);
            return;
        }
        //Check if a survey type has been selected
        if (!selectedSurveyType || selectedSurveyType.length === 0) {
            setIsSurveyRequired(true);
            return;
        }

        const formattedSurveyType =
            selectedSurveyType?.surveyName?.split(" (")[0] || "";
        try {
            setIsLoading(true);
            const response = await apiService.post("close-concerns", {
                ticket_id: ticketId,
                admin_name: `${user?.firstname} ${user?.lastname}`,
                department: user?.department,
                buyer_email: dataRef.buyer_email,
                buyer_lastname: dataRef.buyer_lastname,
                buyer_name: `${/* capitalizeWords()*/`${dataRef.buyer_firstname} ${dataRef.buyer_lastname}`}`,
                details_concern: dataRef.details_concern,
                remarks: remarks,
                communication_type: communicationType,
                selectedSurveyType:
                {
                    surveyName: formattedSurveyType,
                    surveyLink: selectedSurveyType.surveyLink,
                },
                assignees: assigneesPersonnel[ticketId],
                message_id: messageId,
                status: status
            });

            setRemarks("");
            getInquiryLogs(ticketId);
            const updatedData = { ...dataRef, status: "Closed", communication_type: communicationType };
            localStorage.removeItem("updatedData");
            localStorage.removeItem("closeConcern");
            localStorage.setItem("dataConcern", JSON.stringify(updatedData));
            onupdate(updatedData); // Call handleUpdate with the updated data
            getAllConcerns();

            //Close the modal
            if (modalRef.current) {
                modalRef.current.close();
            }
        } catch (error) {
            console.log("error saving", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseModal = () => {
        setCommunicationType(dataRef.communication_type);
        setRemarks("");
        setIsCommunicationTypeRequired(false);
        setIsSurveyRequired(false);
        setSelectedSurveyType([]);
    };

    const handleCancel = () => {
        if (modalRef.current) {
            setCommunicationType(dataRef.communication_type);
            setRemarks("");
            setIsCommunicationTypeRequired(false);
            setIsSurveyRequired(false);
            setSelectedSurveyType([]);
            modalRef.current.close();
        }
    };
    return (
        <dialog
            id="Resolved"
            className="modal w-[557px] rounded-[10px] shadow-custom5 backdrop:bg-black/50  "
            ref={modalRef}
        >
            <div className=" px-[25px] rounded-lg">
                <div className="">
                    <form
                        method="dialog"
                        className="pt-3 flex justify-end -mr-4"
                    >
                        <button className="absolute justify-center w-10 h-10 items-center rounded-full bg-custom-grayFA text-custom-bluegreen hover:bg-custombg" onClick={handleCloseModal} >
                            ✕
                        </button>
                    </form>
                </div>
                <div className="flex justify-center items-center mt-[14px] ">
                    <AiFillInfoCircle className="size-[37px] text-[#5B9BD5]" />
                </div>
                <div className="flex justify-center mt-[30px] mb-[26px] flex-col items-center">
                    <p className="montserrat-medium text-[20px]">
                        You want to mark this as closed?
                    </p>
                    <div className="w-full mt-2">
                        {
                            isCommunicationTypeRequired && (
                                <div className="w-full flex justify-center items-center h-12 bg-red-100 mb-4 rounded-lg">
                                    <p className="flex text-[#C42E2E] ">
                                        Please select  type.
                                    </p>
                                </div>
                            )
                        }
                    </div>
                    <div className="w-full mt-2">
                        {
                            isSurveyRequired && (
                                <div className="w-full flex justify-center items-center h-12 bg-red-100 mb-4 rounded-lg">
                                    <p className="flex text-[#C42E2E] ">
                                        Please select a survey type.
                                    </p>
                                </div>
                            )
                        }
                    </div>
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
                <div
                    className={`flex items-center border border-[D6D6D6] rounded-[5px] overflow-hidden mt-[12px]`}
                >
                    <span className="text-custom-gray81 text-sm bg-[#EDEDED] flex items-center w-[308px] tablet:w-[175px] mobile:w-[270px] mobile:text-xs -mr-3 pl-3 py-1">
                        Type
                    </span>
                    <div className="relative w-full">

                        <select
                            disabled={!!dataRef.communication_type}
                            name="user_type"
                            value={communicationType || ""}
                            onChange={handleCommunityTypeChange}
                            className="appearance-none w-full px-4 text-sm py-1 bg-white focus:outline-none border-0 mobile:text-xs"
                        >
                            <option value="">(Select)</option>
                            <option value="Complaint">Complaint</option>
                            <option value="Request">Request</option>
                            <option value="Inquiry">Inquiry</option>
                            <option value="Suggestion or recommendation">Suggestion or Recommendation</option>
                        </select>
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 bg-[#EDEDED] text-custom-gray81 pointer-events-none">
                            <IoMdArrowDropdown />
                        </span>
                    </div>
                </div>

                {/**
                 * Loop through SURVEY_LINKS to create options;
                 * Display item.surveyName 
                */}
                <div
                    className={`flex items-center border border-[D6D6D6] rounded-[5px] overflow-hidden mt-[12px]`}
                >
                    <span className="text-custom-gray81 text-sm bg-[#EDEDED] flex items-center w-[308px] tablet:w-[175px] mobile:w-[270px] mobile:text-xs -mr-3 pl-3 py-1">
                        Send Survey
                    </span>
                    <div className="relative w-full">
                        {/**
                         * SET onChange TO handleSurveyChange with parsed value from the selected option
                         *SET value TO JSON string of selectedSurveyType
                        */}
                        <select
                            onChange={(e) => handleSurveyChange(JSON.parse(e.target.value))}
                            value={JSON.stringify(selectedSurveyType)}
                            className="appearance-none w-full px-4 text-sm py-1 bg-white focus:outline-none border-0 mobile:text-xs"
                        >
                            <option value="">(Select)</option>
                            {SURVEY_LINKS.map((item, index) => (
                                <option key={index} value={JSON.stringify(item)}>
                                    {item.surveyName}
                                </option>
                            ))}
                        </select>
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 bg-[#EDEDED] text-custom-gray81 pointer-events-none">
                            <IoMdArrowDropdown />
                        </span>
                    </div>
                </div>
                <div

                >
                    <div className="mt-5 mb-[25px]">
                        <div
                            className="flex justify-center gap-[19px]"
                        >
                            <button className="gradient-btn5 p-[1px] w-[92px] h-[35px] rounded-[10px]" onClick={handleCancel}>
                                <div className="w-full h-full rounded-[9px] bg-white flex justify-center items-center montserrat-semibold text-sm">
                                    <p className="text-base font-bold bg-gradient-to-r from-custom-bluegreen via-custom-solidgreen to-custom-solidgreen bg-clip-text text-transparent">
                                        Cancel
                                    </p>
                                </div>
                            </button>
                            <button
                                onClick={() => handleMarkAsClosed('Resolved')}
                                disabled={isLoading}
                                type="submit"
                                className={`className="h-[35px] w-[185px] text-white rounded-[10px] gradient-btn2 hover:shadow-custom4" ${isLoading ? "cursor-not-allowed" : ""
                                    }`}
                            >
                                {isLoading ? (
                                    <CircularProgress className="spinnerSize" />
                                ) : (
                                    <> Mark as Closed</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </dialog>
    );
}

export default CloseModal

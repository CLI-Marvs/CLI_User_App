import React, { useEffect, useState } from "react";
import { IoIosSend, IoMdArrowDropdown } from "react-icons/io";
import apiService from "../../servicesApi/apiService";
import { data } from "autoprefixer";
import { useStateContext } from "../../../context/contextprovider";
import { showToast } from "../../../util/toastUtil";
import CircularProgress from "@mui/material/CircularProgress";

const ThreadInquiryFormModal = ({ modalRef, dataConcern, messageRef }) => {
    const attachmentData = JSON.parse(messageRef?.attachment || "[]");
    const predefinedUserTypes = [
        "Property Owner",
        "Buyer",
        "Broker",
        "Seller",
        "Lessee",
    ];

    const [loading, setLoading] = useState(false);
    const [validationMessage, setValidationMessage] = useState("");
    const { user, propertyNamesList, getAllConcerns } = useStateContext();
    const [invalidFields, setInvalidFields] = useState({});
    const [message, setMessage] = useState(messageRef?.details_message || "");
    const [isMiddleNameChecked, setIsMiddleNameChecked] = useState(false);
    const [isSuffixChecked, setIsSuffixChecked] = useState(false);
    const maxCharacters = 500;

    useEffect(() => {
        if (messageRef?.details_message) {
            setMessage(messageRef.details_message); 
        }
    }, [messageRef?.details_message]); 

    const [dataToUpdate, setDataToUpdate] = useState({
        ticket_id: dataConcern.ticket_id,
        details_concern: dataConcern.details_concern || "",
        contract_number: dataConcern.contract_number || "",
        unit_number: dataConcern.unit_number || "",
        property: dataConcern.property || "",
        admin_remarks: dataConcern.admin_remarks || "",
        buyer_email: dataConcern.buyer_email || "",
        mobile_number: dataConcern.mobile_number || "",
        buyer_firstname: dataConcern.buyer_firstname || "",
        buyer_middlename: dataConcern.buyer_middlename || "",
        buyer_lastname: dataConcern.buyer_lastname || "",
        suffix_name: dataConcern.suffix_name || "",
        user_type: predefinedUserTypes.includes(dataConcern.user_type)
            ? dataConcern.user_type
            : "Others",
        communication_type: dataConcern.communication_type || "",
        channels: dataConcern.channels || "",
        other_user_type: !predefinedUserTypes.includes(dataConcern.user_type)
            ? dataConcern.user_type
            : "",
    });

    const validateFields = () => {
        const requiredFields = [
            { field: "details_concern", label: "Details Concern" },
            { field: "buyer_email", label: "Buyer Email" },
            { field: "communication_type", label: "Communication Type" },
            { field: "channels", label: "Channels" },
            { field: "buyer_firstname", label: "First Name" },
            { field: "buyer_lastname", label: "Last Name" },
            { field: "property", label: "Property" },
            { field: "mobile_number", label: "Mobile Number" },
        ];
        if (!isMiddleNameChecked) {
            requiredFields.push({
                field: "buyer_middlename",
                label: "Middle Name",
            });
        }
        if (!isSuffixChecked) {
            requiredFields.push({ field: "suffix_name", label: "Suffix" });
        }
        if (dataToUpdate.user_type === "Others") {
            requiredFields.push({ field: "other_user_type", label: "Other User Type" });
        }

        const newInvalidFields = {};
        let isValid = true;

        requiredFields.forEach(({ field }) => {
            if (!dataToUpdate[field]) {
                newInvalidFields[field] = true;
                isValid = false;
            }
        });

        setInvalidFields(newInvalidFields);
        if (!isValid) {
            setValidationMessage("Kindly ensure all fields are completed.");
        } else {
            setValidationMessage("");
        }

        return isValid;
    };

    const handleMiddleNameCheckboxChange = (event) => {
        const isChecked = event.target.checked;
        setIsMiddleNameChecked(isChecked);
        setDataToUpdate((prevData) => ({
            ...prevData,
            buyer_middlename: isChecked ? "" : "",
        }));
    };
    const handleSuffixNameCheckboxChange = (event) => {
        setIsSuffixChecked(event.target.checked);
        setDataToUpdate((prevData) => ({
            ...prevData,
            suffix_name: isSuffixChecked ? "" : "",
        }));
    };

    const handleChangeValue = (e) => {
        const newValue = e.target.value;
        setMessage(newValue);
    };

    const formatFunc = (name) => {
        return name
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const formattedPropertyNames = [
        "N/A",
        ...(Array.isArray(propertyNamesList) && propertyNamesList.length > 0
            ? propertyNamesList
                .filter((item) => !item.toLowerCase().includes("phase"))
                .map((item) => {
                    const formattedItem = formatFunc(item);
                    return formattedItem === "Casamira South"
                        ? "Casa Mira South"
                        : formattedItem;
                })
                .sort((a, b) => {
                    if (a === "N/A") return -1;
                    if (b === "N/A") return 1;
                    return a.localeCompare(b);
                })
            : []),
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;

        setDataToUpdate((prevState) => {
            if (name === "user_type") {
                return {
                    ...prevState,
                    user_type: value,
                    other_user_type:
                        value === "Others" ? prevState.other_user_type : "",
                };
            }

            return {
                ...prevState,
                [name]: value,
            };
        });
        if (name === "buyer_middlename" || name === "suffix_name") {
            setInvalidFields((prevState) => ({
                ...prevState,
                [name]: value === "",
            }));
        }
        setInvalidFields((prevState) => ({
            ...prevState,
            [name]: value === "",
        }));
    };

    const handleCloseModal = () => {
        setValidationMessage("");
        setInvalidFields({});
        if (dataConcern) {
            setIsMiddleNameChecked(!dataConcern.buyer_middlename);
            setIsSuffixChecked(!dataConcern.suffix_name);
            setDataToUpdate(dataConcern);
            setMessage(messageRef.details_message);
            getAllConcerns();
        }
    };

    const submitNewEntry = async () => {
        if (!validateFields()) {
            return;
        }
        setLoading(true);
        try {
            const formData = new FormData();
            /*  Object.keys(dataToUpdate).forEach((key) => {
                 formData.append(key, dataToUpdate[key]);
             }); */

            Object.keys(dataToUpdate).forEach((key) => {
                const value = dataToUpdate[key];
                formData.append(key, value == null ? "" : value); // Replace null/undefined with empty string
            });

            const encodedTicketId = encodeURIComponent(dataToUpdate.ticket_id);

            const baseMessage = message || "";
            const ticketNumber = dataToUpdate.ticket_id;
            const ticketLink = `/inquirymanagement/thread/${encodedTicketId}`;
            const referenceText = `<br><br>Reference: Ticket No. ${ticketNumber}`;
            const formattedMessage = `${baseMessage.replace(
                /\n/g,
                "<br>"
            )}${referenceText}`;
            formData.append("message", formattedMessage);
            formData.append("admin_email", user?.employee_email);
            formData.append("admin_profile_picture", user?.profile_picture);

            const response = await apiService.post(
                "add-concern-prev",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            showToast("New data added successfully!", "success");
            if (modalRef.current) {
                modalRef.current.close();
            }
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.log("error", error);
        }
    };

    useEffect(() => {
        setIsMiddleNameChecked(!dataConcern.buyer_middlename);
    }, [dataConcern]);

    useEffect(() => {
        setIsSuffixChecked(!dataConcern.suffix_name);
    }, [dataConcern]);


    return (
        <dialog
            id="Employment"
            className="modal w-[589px] rounded-[10px] shadow-custom5 backdrop:bg-black/50"
            ref={modalRef}
        >
            <div className=" px-20 rounded-lg">
                <div className="">
                    <form
                        method="dialog"
                        className="pt-1 flex justify-end -mr-[75px]"
                    >
                        <button
                            className="flex justify-center w-10 h-10 items-center rounded-full text-custom-bluegreen hover:bg-custombg"
                            onClick={handleCloseModal}
                        >
                            ✕
                        </button>
                    </form>
                    <div>
                        {validationMessage && (
                            <div className="w-full flex justify-center items-center h-12 bg-red-100 mb-4 rounded-lg">
                                <p className="flex text-[#C42E2E] ">
                                    {validationMessage}
                                </p>
                            </div>
                        )}
                        <div className="flex justify-center items-center my-2 mobile:mb-7 mobile:my-0">
                            <p className="montserrat-bold text-[19px] text-custom-solidgreen mobile:text-sm">
                                Create New Ticket
                            </p>
                        </div>

                        {/* {specificInputErrors &&
                            Object.entries(specificInputErrors).map(
                                (item, index) => (
                                    <div
                                        className="w-full flex justify-center items-center h-12 bg-red-100 mb-4 rounded-lg"
                                        key={index}
                                    >
                                        <p className="flex text-[#C42E2E] ">
                                            {item}
                                        </p>
                                    </div>
                                )
                            )} */}
                        {/*  {isSuccess && (
                                <div className="w-full flex justify-center items-center h-12 bg-custom-lightestgreen mb-4 rounded-lg">
                                    <p className="flex text-custom-solidgreen ">
                                       Message sent successfully.
                                    </p>
                                </div>
                            )} */}
                    </div>
                    <div className="mb-3">
                        <p className="text-sm font-semibold mobile:text-xs">
                            Required
                        </p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div
                            className={`flex items-center border rounded-[5px] overflow-hidden ${invalidFields.buyer_firstname &&
                                    validationMessage
                                    ? "border-red-500"
                                    : "border-custom-bluegreen"
                                }`}
                        >
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex pl-3 py-1 w-[240px]">
                                First Name
                            </span>
                            <input
                                name="buyer_firstname"
                                type="text"
                                className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                placeholder=""
                                value={dataToUpdate.buyer_firstname || ""}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="flex items-center gap-[4px]">
                            <div
                                className={`flex relative items-center border w-[430px] rounded-[5px] overflow-hidden  ${invalidFields.buyer_middlename &&
                                        validationMessage
                                        ? "border-red-500"
                                        : "border-custom-bluegreen"
                                    }`}
                            >
                                <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex w-[240px] pl-3 py-1 tablet:w-[160px] mobile:w-[270px] mobile:text-xs">
                                    Middle Name
                                </span>
                                <input
                                    name="buyer_middlename"
                                    type="text"
                                    disabled={isMiddleNameChecked}
                                    className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                    value={dataToUpdate.buyer_middlename || ""}
                                    onChange={handleChange}
                                />
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 gap-2 text-sm bg-custom-lightestgreen">
                                    <input
                                        type="checkbox"
                                        name="checkbox"
                                        className="accent-custom-lightgreen"
                                        checked={isMiddleNameChecked}
                                        onChange={
                                            handleMiddleNameCheckboxChange
                                        }
                                    />
                                    <p>N/A</p>
                                </span>
                            </div>
                        </div>

                        <div
                            className={`flex items-center border rounded-[5px] overflow-hidden ${invalidFields.buyer_lastname &&
                                    validationMessage
                                    ? "border-red-500"
                                    : "border-custom-bluegreen"
                                }`}
                        >
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex w-[240px] pl-3 py-1">
                                Last Name
                            </span>
                            <input
                                name="buyer_lastname"
                                type="text"
                                className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                placeholder=""
                                value={dataToUpdate.buyer_lastname || ""}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="flex items-center gap-[4px]">
                            <div
                                className={`flex relative items-center border w-[430px] rounded-[5px] overflow-hidden  ${invalidFields.suffix_name &&
                                        validationMessage
                                        ? "border-red-500"
                                        : "border-custom-bluegreen"
                                    }`}
                            >
                                <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex w-[240px] pl-3 py-1 tablet:w-[160px] mobile:w-[270px] mobile:text-xs">
                                    Suffix Name
                                </span>
                                <input
                                    name="suffix_name"
                                    type="text"
                                    className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                    placeholder=""
                                    value={dataToUpdate.suffix_name || ""}
                                    onChange={handleChange}
                                />
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 gap-2 text-sm bg-custom-lightestgreen">
                                    <input
                                        type="checkbox"
                                        name="checkbox"
                                        className="accent-custom-lightgreen"
                                        value="checkbox"
                                        checked={isSuffixChecked}
                                        onChange={
                                            handleSuffixNameCheckboxChange
                                        }
                                    />
                                    <p>N/A</p>
                                </span>
                            </div>
                        </div>
                        <div
                            className={`flex items-center border rounded-[5px] overflow-hidden ${invalidFields.buyer_email && validationMessage
                                    ? "border-red-500"
                                    : "border-custom-bluegreen"
                                }`}
                        >
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex w-[240px] pl-3 py-1">
                                Email
                            </span>
                            <input
                                name="buyer_email"
                                type="email"
                                className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                placeholder=""
                                value={dataToUpdate.buyer_email || ""}
                                onChange={handleChange}
                            />
                        </div>

                        <div
                            className={`flex items-center border rounded-[5px] overflow-hidden ${invalidFields.mobile_number && validationMessage
                                    ? "border-red-500"
                                    : "border-custom-bluegreen"
                                }`}
                        >
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex w-[240px] pl-3 py-1">
                                Mobile Number
                            </span>
                            <input
                                name="mobile_number"
                                type="number"
                                className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                placeholder=""
                                value={dataToUpdate.mobile_number || ""}
                                onChange={handleChange}
                            />
                        </div>
                        <div
                            className={`flex items-center border rounded-[5px] overflow-hidden ${invalidFields.property && validationMessage
                                    ? "border-red-500"
                                    : "border-custom-bluegreen"
                                }`}
                        >
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex items-center w-[250px] tablet:w-[175px] mobile:w-[270px] mobile:text-xs -mr-3 pl-3 py-1">
                                Property
                            </span>
                            <div className="relative w-full">
                                <select
                                    name="property"
                                    value={dataToUpdate.property || ""}
                                    onChange={handleChange}
                                    className="appearance-none w-full px-4 text-sm py-1 bg-white focus:outline-none border-0 mobile:text-xs"
                                >
                                    <option value="">(Select)</option>
                                    {formattedPropertyNames.map(
                                        (project, index) => (
                                            <option key={index} value={project}>
                                                {project}
                                            </option>
                                        )
                                    )}
                                </select>
                                <span className="absolute inset-y-0 right-0 flex  items-center pr-3 pl-3 bg-custom-lightestgreen text-custom-bluegreen pointer-events-none">
                                    <IoMdArrowDropdown />
                                </span>
                            </div>
                        </div>
                        <div
                            className={`flex items-center border rounded-[5px] overflow-hidden ${invalidFields.details_concern &&
                                    validationMessage
                                    ? "border-red-500"
                                    : "border-custom-bluegreen"
                                }`}
                        >
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex items-center w-[250px] tablet:w-[175px] mobile:w-[270px] mobile:text-xs -mr-3 pl-3 py-1">
                                Concern regarding
                            </span>
                            <div className="relative w-full">
                                <select
                                    name="details_concern"
                                    value={dataToUpdate.details_concern || ""}
                                    onChange={handleChange}
                                    className="appearance-none w-full px-4 text-sm py-1 bg-white focus:outline-none border-0 mobile:text-xs"
                                >
                                    <option value="">(Select)</option>
                                    <option value="Reservation Documents">
                                        Reservation Documents
                                    </option>
                                    <option value="Payment Issues">
                                        Payment Issues
                                    </option>
                                    <option value="SOA/ Buyer's Ledger">
                                        SOA/ Buyer's Ledger
                                    </option>
                                    <option value="Turn Over Status">
                                        Turn Over Status
                                    </option>
                                    <option value="Unit Status">
                                        Unit Status
                                    </option>
                                    <option value="Loan Application">
                                        Loan Application
                                    </option>
                                    <option value="Title and Other Registration Documents">
                                        Title and Other Registration Documents
                                    </option>
                                    <option value="Commissions">
                                        Commissions
                                    </option>
                                    <option value="Leasing">Leasing</option>
                                    <option value="Other Concerns">
                                        Other Concerns
                                    </option>
                                </select>
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 bg-custom-lightestgreen text-custom-bluegreen pointer-events-none">
                                    <IoMdArrowDropdown />
                                </span>
                            </div>
                        </div>
                        <div
                            className={`flex items-center border rounded-[5px] overflow-hidden ${invalidFields.communication_type &&
                                    validationMessage
                                    ? "border-red-500"
                                    : "border-custom-bluegreen"
                                }`}
                        >
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex items-center w-[250px] tablet:w-[175px] mobile:w-[270px] mobile:text-xs -mr-3 pl-3 py-1">
                                Type
                            </span>
                            <div className="relative w-full">
                                <select
                                    name="communication_type"
                                    value={
                                        dataToUpdate.communication_type || ""
                                    }
                                    onChange={handleChange}
                                    className="appearance-none w-full px-4 text-sm py-1 bg-white focus:outline-none border-0 mobile:text-xs"
                                >
                                    <option value="">(Select)</option>
                                    <option value="Complaint">Complaint</option>
                                    <option value="Request">Request</option>
                                    <option value="Inquiry">Inquiry</option>
                                    <option value="Suggestion or Recommendation">
                                        Suggestion or Recommendation
                                    </option>
                                </select>
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 bg-custom-lightestgreen text-custom-bluegreen pointer-events-none">
                                    <IoMdArrowDropdown />
                                </span>
                            </div>
                        </div>
                        <div
                            className={`flex items-center border rounded-[5px] overflow-hidden ${invalidFields.channels && validationMessage
                                    ? "border-red-500"
                                    : "border-custom-bluegreen"
                                }`}
                        >
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex items-center w-[250px] tablet:w-[175px] mobile:w-[270px] mobile:text-xs -mr-3 pl-3 py-1">
                                Channels
                            </span>
                            <div className="relative w-full">
                                <select
                                    name="channels"
                                    value={dataToUpdate.channels || ""}
                                    onChange={handleChange}
                                    className="appearance-none w-full px-4 text-sm py-1 bg-white focus:outline-none border-0 mobile:text-xs"
                                >
                                    <option value="">(Select)</option>
                                    <option value="Email">Email</option>
                                    <option value="Call">Call</option>
                                    <option value="Walk in">Walk-in</option>
                                    <option value="Website">Website</option>
                                    <option value="Social media">
                                        Social media
                                    </option>
                                    <option value="Branch Tablet">
                                        Branch Tablet
                                    </option>
                                    <option value="Internal Endorsement">
                                        Internal Endorsement
                                    </option>
                                </select>
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 bg-custom-lightestgreen text-custom-bluegreen pointer-events-none">
                                    <IoMdArrowDropdown />
                                </span>
                            </div>
                        </div>
                        <div className="border border-t-1 border-[#D9D9D9]"></div>
                        <div className="mt-3">
                            <p className="text-sm font-semibold mobile:text-xs">
                                Optional
                            </p>
                        </div>
                        <div className="flex items-center border border-custom-bluegreen rounded-[5px] overflow-hidden">
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex items-center w-[255px] tablet:w-[175px] mobile:w-[270px] mobile:text-xs -mr-4 pl-3 py-1">
                                Inquiry From
                            </span>
                            <div className="relative w-full">
                                <select
                                    name="user_type"
                                    value={dataToUpdate.user_type || ""}
                                    onChange={handleChange}
                                    className="appearance-none w-full px-4 text-sm py-1 bg-white focus:outline-none border-0 mobile:text-xs"
                                >
                                    <option value="">(Select)</option>
                                    <option value="Property Owner">
                                        Property Owner
                                    </option>
                                    <option value="Buyer">Buyer</option>
                                    <option value="Broker">Broker</option>
                                    <option value="Seller">Seller</option>
                                    <option value="Lessee">Lessee</option>
                                    <option value="Others">Others</option>
                                </select>
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3  bg-custom-lightestgreen text-custom-bluegreen pointer-events-none">
                                    <IoMdArrowDropdown />
                                </span>
                            </div>
                        </div>
                        {dataToUpdate.user_type === "Others" && (
                            <div className="flex justify-end">
                                <div
                                    className={`flex items-center border rounded-[5px] w-[61.5%] overflow-hidden ${invalidFields.other_user_type && validationMessage ? 'border-red-500' : 'border'}`}
                                >
                                    <input
                                        name="other_user_type"
                                        type="text"
                                        className="w-full px-4 text-sm focus:outline-none mobile:text-xs py-1"
                                        value={dataToUpdate.other_user_type}
                                        onChange={handleChange}
                                        placeholder=""
                                    />
                                </div>
                            </div>
                        )}
                        {/* {formData.user_type === "Others" && (
                            <div className="flex justify-end">
                                <div
                                    className={`flex items-center border rounded-[5px] w-[277px] overflow-hidden ${isSubmitted && !formData.other_user_type
                                        ? resetSuccess
                                            ? "border-custom-bluegreen"
                                            : "border-red-500"
                                        : "border-custom-bluegreen"
                                        }`}
                                >
                                    <input
                                        name="other_user_type"
                                        type="text"
                                        className="w-full px-4 text-sm focus:outline-none mobile:text-xs py-1"
                                        value={formData.other_user_type}
                                        onChange={handleChange}
                                        placeholder=""
                                    />
                                </div>
                            </div>
                        )} */}
                        <div className="flex items-center border border-custom-bluegreen rounded-[5px] overflow-hidden">
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex w-[240px] pl-3 py-1">
                                Contract Number
                            </span>
                            <input
                                name="contract_number"
                                type="number"
                                className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                placeholder=""
                                onChange={handleChange}
                                value={dataToUpdate.contract_number || ""}
                            />
                        </div>
                        <div className="flex items-center border border-custom-bluegreen rounded-[5px] overflow-hidden">
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex w-[240px] pl-3 py-1">
                                Unit/Lot Number
                            </span>
                            <input
                                name="unit_number"
                                type="text"
                                value={dataToUpdate.unit_number || ""}
                                onChange={handleChange}
                                className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                placeholder=""
                            />
                        </div>
                    </div>
                    <div className="border border-b-1 border-[#D9D9D9] my-2"></div>
                    <div
                        className={`border-custom-bluegreen rounded-[5px] bg-custom-lightestgreen border mb-5`}
                    >
                        <div className="flex items-center justify-between">
                            <p className="text-custom-bluegreen text-sm bg-custom-lightestgreen pl-3  montserrat-semibold flex-grow mobile:text-xs mobile:w-[170px]">
                                Details (Required)
                            </p>
                            <span className="bg-white text-sm2 text-gray-400 font-normal py-3 border-l border-custom-bluegreen pl-2 pr-12 mobile:pr-1 mobile:text-xs ml-auto rounded-tr-[4px]">
                                {" "}
                                {message.length}/500 characters
                            </span>
                        </div>
                        <div className="flex gap-3 ">
                            <textarea
                                id="details_message"
                                disabled={true}
                                onChange={handleChangeValue}
                                value={(message || "").replace(
                                    /<br\s*\/?>/gi,
                                    "\n"
                                )}
                                name="details_message"
                                placeholder=""
                                maxLength={maxCharacters}
                                rows="4"
                                className={` border-custom-bluegreen rounded-b-[5px] border-t w-full pl-2 outline-none disabled:bg-white disabled:text-gray-500`}
                            ></textarea>
                        </div>
                    </div>
                    <div className="flex flex-col mt-5 mb-12">
                        {attachmentData.length > 0 && (
                            <span className="">Attachments:</span>
                        )}
                        <div className="flex justify-between w-54 tablet:flex-col">
                            <div>
                                {attachmentData &&
                                    attachmentData.map((item, key) => {
                                        // Check if the file name exists and is valid
                                        const originalFileName = item?.original_file_name;

                                        if (!originalFileName || typeof originalFileName !== 'string') {
                                            return null;
                                        }

                                        const fileParts = originalFileName.split('.');

                                        const fileName = fileParts.slice(0, -1).join('.') || 'Unknown';
                                        const fileExtension = fileParts.length > 1 ? fileParts[fileParts.length - 1] : 'unknown';

                                        const truncatedName = fileName.length > 20 ? fileName.slice(0, 15) + '...' : fileName;

                                        return (
                                            <div key={key}>
                                                <span>
                                                    {truncatedName}.{fileExtension}
                                                </span>
                                            </div>
                                        );
                                    }).filter(Boolean) /* Filter out null values */}
                            </div>
                            <button
                                onClick={submitNewEntry}
                                disabled={loading}
                                type="submit"
                                className={`w-[133px] text-sm montserrat-semibold text-white h-[40px] rounded-[10px] gradient-btn2 flex justify-center items-center gap-2 tablet:w-full hover:shadow-custom4
                                            ${loading
                                        ? "cursor-not-allowed"
                                        : ""
                                    }
                                            `}
                            >
                                {loading ? (
                                    <CircularProgress className="spinnerSize" />
                                ) : (
                                    <>
                                        Submit
                                        <IoIosSend />
                                    </>
                                )}
                            </button>
                        </div>
                        {/* <div className="mt-2">
                            {fileName && fileName.length > 0
                                ? fileName.map((item, index) => {
                                    return (
                                        <p
                                            key={index}
                                            className="flex items-center text-sm text-red-900 truncate gap-1"
                                        >
                                            {item}{" "}
                                            <IoMdTrash
                                                className="hover:text-red-500"
                                                onClick={() =>
                                                    handleDelete(item)
                                                }
                                            />
                                        </p>
                                    );
                                })
                                : null}
                        </div> */}
                    </div>
                </div>
            </div>
        </dialog>
    );
};

export default ThreadInquiryFormModal;

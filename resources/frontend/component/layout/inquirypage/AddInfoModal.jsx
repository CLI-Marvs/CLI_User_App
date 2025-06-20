import React, { useEffect, useState, useMemo } from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import apiService from "../../servicesApi/apiService";
import { useStateContext } from "../../../context/contextprovider";
import Alert from "../../Alert";
import { showToast } from "../../../util/toastUtil";
import { PREDEFINED_USER_TYPES } from "../../../constant/data/preDefinedUserTypes";

/**
 * Function to normalizeData, that returns;
 * Strip out fields that needed to compare (like `id`, `status`, `created_at`, `updated_at`, etc.)
 */
const normalizeData = (data) => {
    return {
        ticket_id: data.ticket_id || "",
        details_concern: data.details_concern || "",
        contract_number: data.contract_number || null,
        unit_number: data.unit_number || null,
        property: data.property || "",
        admin_remarks: data.admin_remarks || "",
        buyer_email: data.buyer_email || "",
        mobile_number: data.mobile_number || "",
        buyer_firstname: data.buyer_firstname || "",
        buyer_middlename: data.buyer_middlename || "",
        buyer_lastname: data.buyer_lastname || "",
        suffix_name: data.suffix_name || "",
        communication_type: data.communication_type || null,
        channels: data.channels || null,
        user_type: PREDEFINED_USER_TYPES.includes(data.user_type)
            ? data.user_type
            : data.user_type === null || data.user_type === ""
            ? null
            : "Others",
        other_user_type:
            data.user_type === "Others" ? data.other_user_type || "" : "",
    };
};

const checkUserTypeChange = (newData, oldData) => {
    return (
        newData.user_type === "Others" &&
        oldData.other_user_type !== newData.other_user_type
    );
};

const AddInfoModal = ({ modalRef, dataConcern, onupdate }) => {
    const [showAlert, setShowAlert] = useState(false);
    const {
        getAllConcerns,
        propertyNamesList,
        user,
        getInquiryLogs,
        isUserTypeChange,
        setIsUserTypeChange,
        getNavBarData,
    } = useStateContext();

    const [message, setMessage] = useState(dataConcern.admin_remarks || "");
    const [dataToUpdate, setDataToUpdate] = useState({});

    useEffect(() => {
        const storedData = JSON.parse(
            localStorage.getItem("updatedData") || "{}"
        );
        if (dataConcern) {
            setDataToUpdate({
                ...dataConcern,
                user_type:
                    dataConcern.user_type === null ||
                    dataConcern.user_type === ""
                        ? null // Leave null if user_type is empty
                        : PREDEFINED_USER_TYPES.includes(dataConcern.user_type)
                        ? dataConcern.user_type // Use predefined type
                        : "Others", // Otherwise, set to "Others"
                other_user_type:
                    dataConcern.user_type !== null &&
                    !PREDEFINED_USER_TYPES.includes(dataConcern.user_type)
                        ? storedData.other_user_type || dataConcern.user_type // Restore from storage or fallback
                        : "",
            });
        }
    }, [dataConcern]);

    /* Buyers old data to be used in AssignDetails.jsx
     * to compare the values and show the differences
     */
    const buyerOldData = {
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
        communication_type: dataConcern.communication_type || "",
        channels: dataConcern.channels || "",
        user_type:
            dataConcern.user_type === null || dataConcern.user_type === ""
                ? null // Leave as null if user_type is null or empty
                : PREDEFINED_USER_TYPES.includes(dataConcern.user_type)
                ? dataConcern.user_type // Keep it if it's in the predefined list
                : "Others", // Otherwise, set to "Others"
        other_user_type:
            dataConcern.user_type === null || dataConcern.user_type === ""
                ? "" // Leave as empty if user_type is null or empty
                : !PREDEFINED_USER_TYPES.includes(dataConcern.user_type)
                ? dataConcern.other_user_type || dataConcern.user_type // Assign `user_type` if it's not predefined
                : "", // Otherwise, keep empty
    };

    //Only recompute these values when necessary
    const normalizedBuyerOldData = useMemo(
        () => normalizeData(buyerOldData),
        [buyerOldData]
    );
    const normalizedDataToUpdate = useMemo(
        () => normalizeData(dataToUpdate),
        [dataToUpdate]
    );
    const hasChanges =
        JSON.stringify(normalizedBuyerOldData) !==
        JSON.stringify(normalizedDataToUpdate); //Check if there are any changes between the two normalized datasets

    /**
     * Detect changes in user type, specifically when the user type is set to "Others"
     */
    useEffect(() => {
        const hasUserTypeChanged = checkUserTypeChange(
            normalizedDataToUpdate,
            normalizedBuyerOldData
        );
        setIsUserTypeChange(hasUserTypeChanged);
    }, [normalizedDataToUpdate, normalizedBuyerOldData, checkUserTypeChange]);

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
                      let formattedItem = formatFunc(item);

                      // Capitalize each word in the string
                      formattedItem = formattedItem
                          .split(" ")
                          .map((word) => {
                              // Check for specific words that need to be fully capitalized
                              if (/^(Sjmv|Lpu|Cdo|Dgt)$/i.test(word)) {
                                  return word.toUpperCase();
                              }
                              // Capitalize the first letter of all other words
                              return (
                                  word.charAt(0).toUpperCase() +
                                  word.slice(1).toLowerCase()
                              );
                          })
                          .join(" ");

                      // Replace specific names if needed
                      if (formattedItem === "Casamira South") {
                          formattedItem = "Casa Mira South";
                      }

                      return formattedItem;
                  })
                  .sort((a, b) => {
                      if (a === "N/A") return -1;
                      if (b === "N/A") return 1;
                      return a.localeCompare(b);
                  })
            : []),
    ];

    const maxCharacters = 500;

    const handleChangeValue = (e) => {
        const newValue = e.target.value;
        setMessage(newValue);
    };

    const handleCloseModal = () => {
        if (dataConcern) {
            setDataToUpdate((prevState) => ({
                ...prevState,
                ...dataConcern, // Spread the dataConcern values into the state
                user_type:
                    dataConcern.user_type === null ||
                    dataConcern.user_type === ""
                        ? null // Keep null if user_type is null or empty
                        : PREDEFINED_USER_TYPES.includes(dataConcern.user_type)
                        ? dataConcern.user_type // Keep if it's a predefined user type
                        : "Others", // Otherwise, set to "Others"
                other_user_type:
                    dataConcern.user_type === null ||
                    dataConcern.user_type === ""
                        ? "" // Leave as empty if user_type is null or empty
                        : !PREDEFINED_USER_TYPES.includes(dataConcern.user_type)
                        ? dataConcern.other_user_type || dataConcern.user_type // Set `other_user_type` to `user_type` when not predefined
                        : "", // Otherwise, keep empty
            }));
            if (message) {
                setMessage(dataConcern.admin_remarks || "");
            }
            setIsUserTypeChange(false);
            if (modalRef.current) {
                modalRef.current.close();
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDataToUpdate((prevState) => {
            // When switching to "Others," retain the current other_user_type if it exists
            if (name === "user_type") {
                return {
                    ...prevState,
                    user_type: value,
                    other_user_type:
                        value === "Others" ? prevState.other_user_type : "",
                };
            }

            if (
                name === "other_user_type" &&
                prevState.user_type === "Others"
            ) {
                return {
                    ...prevState,
                    other_user_type: value,
                };
            }

            return {
                ...prevState,
                [name]: value,
            };
        });
    };

    const handleShowUpdateAlert = () => {
        setShowAlert(true);
        modalRef.current.showModal();
    };

    const handleConfirm = () => {
        addInfo();
        setShowAlert(false);
        setTimeout(() => {
            modalRef.current.close();
        }, 1000);
    };

    const handleCancel = () => {
        setShowAlert(false);
    };

    const addInfo = async () => {
        try {
            const response = await apiService.post("update-info", {
                buyerOldData,
                ...dataToUpdate,
                ticketId: dataConcern.ticket_id,
                updated_by: user?.firstname + " " + user?.lastname,
            });
            const updatedData = { ...dataToUpdate };
            localStorage.removeItem("dataConcern");
            localStorage.removeItem("closeConcern");
            localStorage.setItem("updatedData", JSON.stringify(updatedData));
            showToast("Data updated successfully!", "success");
            setIsUserTypeChange(false);

            onupdate({ ...dataToUpdate, dataConcern });
            await Promise.all([
                getInquiryLogs(dataConcern.ticket_id),
                getAllConcerns(),
                getNavBarData(dataConcern.ticket_id),
            ]);
        } catch (error) {
            console.log("error", error);
        }
    };

    useEffect(() => {
        setDataToUpdate((prevData) => ({
            ...prevData,
            admin_remarks: message,
        }));
    }, [message]);

    return (
        <dialog
            id="Resolved"
            className="modal w-[587px] rounded-[10px] shadow-custom5 backdrop:bg-black/50"
            ref={modalRef}
        >
            <div className="rounded-[10px]">
                <div className="absolute right-0">
                    <button
                        className="flex justify-center w-10 h-10 items-center rounded-full bg-custom-grayFA text-custom-bluegreen hover:bg-custombg"
                        onClick={handleCloseModal}
                    >
                        ✕
                    </button>
                </div>
                <div className=" px-[50px] py-[77px] flex flex-col gap-[40px] ">
                    <div className="flex flex-col gap-[10px]">
                        {/* First name */}
                        <div
                            className={`flex items-center border border-[D6D6D6] rounded-[5px] overflow-hidden`}
                        >
                            <span className="text-custom-gray81 text-sm bg-[#EDEDED] flex pl-3 py-1 w-[300px]">
                                First Name
                            </span>
                            <input
                                name="buyer_firstname"
                                value={dataToUpdate.buyer_firstname || ""}
                                // value={
                                //     (dataToUpdate.name || "") +
                                //     " additional text"
                                // }
                                onChange={handleChange}
                                type="text"
                                className="w-full px-4 text-sm focus:outline-none mobile:text-xs capitalize"
                                placeholder=""
                            />
                        </div>
                        {/* Middle name */}
                        <div
                            className={`flex items-center border border-[D6D6D6] rounded-[5px] overflow-hidden`}
                        >
                            <span className="text-custom-gray81 text-sm bg-[#EDEDED] flex pl-3 py-1 w-[300px]">
                                Middle Name
                            </span>
                            <input
                                name="buyer_middlename"
                                value={dataToUpdate.buyer_middlename || ""}
                                // value={
                                //     (dataToUpdate.name || "") +
                                //     " additional text"
                                // }
                                onChange={handleChange}
                                type="text"
                                className="w-full px-4 text-sm focus:outline-none mobile:text-xs capitalize"
                                placeholder=""
                            />
                        </div>
                        {/* Last name */}

                        <div
                            className={`flex items-center border border-[D6D6D6] rounded-[5px] overflow-hidden`}
                        >
                            <span className="text-custom-gray81 text-sm bg-[#EDEDED] flex pl-3 py-1 w-[300px]">
                                Last Name
                            </span>
                            <input
                                name="buyer_lastname"
                                value={dataToUpdate.buyer_lastname || ""}
                                onChange={handleChange}
                                type="text"
                                className="w-full px-4 text-sm focus:outline-none mobile:text-xs capitalize"
                                placeholder=""
                            />
                        </div>
                        <div
                            className={`flex items-center border border-[D6D6D6] rounded-[5px] overflow-hidden`}
                        >
                            <span className="text-custom-gray81 text-sm bg-[#EDEDED] flex pl-3 py-1 w-[300px]">
                                Suffix Name
                            </span>
                            <input
                                name="suffix_name"
                                value={dataToUpdate.suffix_name || ""}
                                onChange={handleChange}
                                type="text"
                                className="w-full px-4 text-sm focus:outline-none mobile:text-xs capitalize"
                                placeholder=""
                            />
                        </div>
                        <div
                            className={`flex items-center border border-[D6D6D6] rounded-[5px] overflow-hidden`}
                        >
                            <span className="text-custom-gray81 text-sm bg-[#EDEDED] flex pl-3 py-1 w-[300px]">
                                Email
                            </span>
                            <input
                                name="buyer_email"
                                value={dataToUpdate.buyer_email || ""}
                                onChange={handleChange}
                                type="email"
                                className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                placeholder=""
                            />
                        </div>
                        <div
                            className={`flex items-center border border-[D6D6D6] rounded-[5px] overflow-hidden`}
                        >
                            <span className="text-custom-gray81 text-sm bg-[#EDEDED] flex pl-3 py-1 w-[300px]">
                                Mobile Number
                            </span>
                            <input
                                name="mobile_number"
                                type="number"
                                onChange={handleChange}
                                value={dataToUpdate.mobile_number || ""}
                                className="w-full px-4 text-sm focus:outline-none mobile:text-xs no-spinner"
                                placeholder=""
                                onInput={(e) =>
                                    (e.target.value = e.target.value.replace(
                                        /[^0-9]/g,
                                        ""
                                    ))
                                }
                            />
                        </div>
                        <div
                            className={`flex items-center border border-[D6D6D6] rounded-[5px] overflow-hidden`}
                        >
                            <span className="text-custom-gray81 text-sm bg-[#EDEDED] flex items-center w-[308px] tablet:w-[175px] mobile:w-[270px] mobile:text-xs -mr-3 pl-3 py-1">
                                I am a
                            </span>
                            <div className="relative w-full">
                                <select
                                    name="user_type"
                                    value={dataToUpdate.user_type || ""}
                                    onChange={handleChange}
                                    className="appearance-none w-full px-4 text-sm py-1 bg-white focus:outline-none border-0 mobile:text-xs"
                                >
                                    <option value="">(Select)</option>
                                    {PREDEFINED_USER_TYPES.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                    <option value="Others">Others</option>
                                </select>
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 bg-[#EDEDED] text-custom-gray81 pointer-events-none">
                                    <IoMdArrowDropdown />
                                </span>
                            </div>
                        </div>
                        {dataToUpdate.user_type === "Others" && (
                            <div className="flex justify-end">
                                <div
                                    className={`flex items-center border rounded-[5px] w-[61.5%] overflow-hidden`}
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
                        <div
                            className={`flex items-center border border-[D6D6D6] rounded-[5px] overflow-hidden`}
                        >
                            <span className="text-custom-gray81 text-sm bg-[#EDEDED] flex items-center w-[308px] tablet:w-[175px] mobile:w-[270px] mobile:text-xs -mr-3 pl-3 py-1">
                                Type
                            </span>
                            <div className="relative w-full">
                                <select
                                    name="communication_type"
                                    value={
                                        dataToUpdate.communication_type?.toLowerCase() ===
                                        "suggestion or recommendation"
                                            ? "Suggestion or Recommendation"
                                            : dataToUpdate.communication_type ||
                                              ""
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
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 bg-[#EDEDED] text-custom-gray81 pointer-events-none">
                                    <IoMdArrowDropdown />
                                </span>
                            </div>
                        </div>
                        <div
                            className={`flex items-center border border-[D6D6D6] rounded-[5px] overflow-hidden`}
                        >
                            <span className="text-custom-gray81 text-sm bg-[#EDEDED] flex items-center w-[308px] tablet:w-[175px] mobile:w-[270px] mobile:text-xs -mr-3 pl-3 py-1">
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
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 bg-[#EDEDED] text-custom-gray81 pointer-events-none">
                                    <IoMdArrowDropdown />
                                </span>
                            </div>
                        </div>
                        <div
                            className={`flex items-center border border-[D6D6D6] rounded-[5px] overflow-hidden`}
                        >
                            <span className="text-custom-gray81 text-sm bg-[#EDEDED] flex items-center w-[308px] tablet:w-[175px] mobile:w-[270px] mobile:text-xs -mr-3 pl-3 py-1">
                                Concern Regarding
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
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 bg-[#EDEDED] text-custom-gray81 pointer-events-none">
                                    <IoMdArrowDropdown />
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-[10px]">
                        <div
                            className={`flex items-center border border-[D6D6D6] rounded-[5px] overflow-hidden`}
                        >
                            <span className="text-custom-gray81 text-sm bg-[#EDEDED] flex pl-3 py-1 w-[300px]">
                                Contract No.
                            </span>
                            <input
                                name="contract_number"
                                onChange={(e) => {
                                    if (e.target.value.length <= 13) {
                                        handleChange(e);
                                    }
                                }}
                                value={dataToUpdate.contract_number || ""}
                                className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                placeholder=""
                                onInput={(e) =>
                                    (e.target.value = e.target.value.replace(
                                        /[^0-9]/g,
                                        ""
                                    ))
                                }
                            />
                        </div>
                        <div
                            className={`flex items-center border border-[D6D6D6] rounded-[5px] overflow-hidden`}
                        >
                            <span className="text-custom-gray81 text-sm bg-[#EDEDED] flex items-center w-[308px] tablet:w-[175px] mobile:w-[270px] mobile:text-xs -mr-3 pl-3 py-1">
                                Property
                            </span>
                            <div className="relative w-full">
                                <select
                                    name="property"
                                    value={dataToUpdate.property || ""}
                                    onChange={handleChange}
                                    className="appearance-none w-full px-4 text-sm py-1 bg-white focus:outline-none border-0 mobile:text-xs"
                                >
                                    <option value="">(Please Select)</option>
                                    {formattedPropertyNames.map(
                                        (project, index) => (
                                            <option key={index} value={project}>
                                                {project}
                                            </option>
                                        )
                                    )}
                                </select>
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 bg-[#EDEDED] text-custom-gray81 pointer-events-none">
                                    <IoMdArrowDropdown />
                                </span>
                            </div>
                        </div>
                        <div
                            className={`flex items-center border border-[D6D6D6] rounded-[5px] overflow-hidden`}
                        >
                            <span className="text-custom-gray81 text-sm bg-[#EDEDED] flex pl-3 py-1 w-[300px]">
                                Unit/Lot Number
                            </span>
                            <input
                                name="unit_number"
                                onChange={handleChange}
                                value={dataToUpdate.unit_number || ""}
                                type="text"
                                className="w-full px-4 text-sm focus:outline-none mobile:text-xs no-spinner"
                                placeholder=""
                            />
                        </div>
                    </div>
                    <div
                        className={`border-[D6D6D6] rounded-[5px] bg-[#EDEDED] border`}
                    >
                        <div className="flex items-center justify-between">
                            <p className="text-custom-gray81 text-sm bg-[#EDEDED] pl-3 flex-grow mobile:text-xs mobile:w-[170px]">
                                CLI Admin Notes
                            </p>
                            <span className="bg-white text-sm2 text-gray-400 font-normal py-3 border border-[D6D6D6] pl-2 pr-12 mobile:pr-1 mobile:text-xs ml-auto rounded-r-[4px]">
                                {" "}
                                {message.length}/500 characters
                            </span>
                        </div>
                        <div className="flex gap-3 ">
                            <textarea
                                id="details_message"
                                value={message}
                                onChange={handleChangeValue}
                                maxLength={maxCharacters}
                                name="details_message"
                                rows="4"
                                draggable="false"
                                className={` rounded-[5px] bg-white border border-[D6D6D6] w-full pl-2 outline-none`}
                            ></textarea>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <div>
                            {/**
                             * Disable button if no changes detected
                             * Visually indicate button is non-interactive when no changes exist
                             */}
                            {/*  {user?.department === "Customer Relations - Services" && ( */}
                            <button
                                disabled={!isUserTypeChange && !hasChanges}
                                className="w-[133px] h-[39px] font-semibold text-sm text-white rounded-[10px] gradient-btn5"
                                type="button"
                                onClick={handleShowUpdateAlert}
                                style={{
                                    opacity:
                                        !isUserTypeChange && !hasChanges
                                            ? 0.5
                                            : 1,
                                    cursor:
                                        !isUserTypeChange && !hasChanges
                                            ? "not-allowed"
                                            : "pointer",
                                }}
                            >
                                Update
                            </button>

                            {/*  )} */}
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <div className="">
                    <Alert
                        title="Are you sure you want to update this data?"
                        show={showAlert}
                        onCancel={handleCancel}
                        onConfirm={handleConfirm}
                        //You can pass onConfirm and onCancel props to customize the text of the buttons. Example below;
                        // confirmText="Update"
                        // cancelText="Cancel"
                    />
                </div>
            </div>
        </dialog>
    );
};

export default AddInfoModal;

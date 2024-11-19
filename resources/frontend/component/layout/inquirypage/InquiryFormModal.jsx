import React, { useState, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { IoIosSend, IoMdArrowDropdown, IoMdTrash } from "react-icons/io";
import apiService from "../../servicesApi/apiService";
import { useStateContext } from "../../../context/contextprovider";
import CircularProgress from "@mui/material/CircularProgress";
import { toast, ToastContainer, Bounce } from "react-toastify";
import { VALID_FILE_EXTENSIONS } from "../../../constant/data/validFile";
const formDataState = {
    fname: "",
    mname: "",
    lname: "",
    suffix: "",
    buyer_email: "",
    mobile_number: "",
    property: "",
    type: "",
    channels: "",
    user_type: "",
    other_user_type: "",
    contract_number: "",
    details_concern: "",
    unit_number: "",
};

const InquiryFormModal = ({ modalRef }) => {
    const [files, setFiles] = useState([]);
    const fileInputRef = useRef();
    const [fileName, setFileName] = useState([]);
    const [message, setMessage] = useState("");
    const { user, getAllConcerns } = useStateContext();
    const maxCharacters = 500;
    const [isMiddleNameChecked, setIsMiddleNameChecked] = useState(false);
    const [isSuffixChecked, setIsSuffixChecked] = useState(false);
    const [hasErrors, setHasErrors] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isValid, setIsValid] = useState(true);
    const [errors, setErrors] = useState({});
    const { propertyNamesList } = useStateContext();
    const [specificInputErrors, setSpecificInputErrors] = useState({});
    const [isSendEmail, setIsSendEmail] = useState(false);
    const handleFileChange = (event) => {
        const selectedFiles = Array.from(event.target.files);
        setFiles((prevFiles) => {
            const prevFileNames = prevFiles.map((file) => file.name);

            // Add only unique files
            const uniqueFiles = selectedFiles.filter(
                (file) => !prevFileNames.includes(file.name)
            );

            return [...prevFiles, ...uniqueFiles];
        });
        setFileName((prevFileNames) => {
            const uniqueFileNames = selectedFiles
                .map((file) => formatFileName(file.name))
                .filter((name) => !prevFileNames.includes(name));

            return [...prevFileNames, ...uniqueFileNames];
        });

        event.target.value = null;
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

    // Helper function to normalize file names
    const formatFileName = (fileName) => {
        return fileName.length > 15
            ? `${fileName.substring(0, 12)}... .${fileName.split(".").pop()}`
            : fileName;
    };

    const handleDelete = (fileNameToDelete) => {
        const normalizedFileNameToDelete = formatFileName(fileNameToDelete);
        // Remove from `files` state by comparing with the original file name
        setFiles((prevFiles) =>
            prevFiles.filter(
                (file) =>
                    formatFileName(file.name) !== normalizedFileNameToDelete
            )
        );

        // Remove from `fileName` state
        setFileName((prevFileNames) =>
            prevFileNames.filter((name) => name !== normalizedFileNameToDelete)
        );
    };
    const [formData, setFormData] = useState(formDataState);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
        setHasErrors(false);
        setIsSubmitted(false);

        if (name === "buyer_email") {
            setErrors((prevErrors) => ({
                ...prevErrors,
                buyer_email: validateEmail(value)
                    ? ""
                    : "Invalid email address",
            }));
        }
    };
    const handleMiddleNameCheckboxChange = (event) => {
        setIsMiddleNameChecked(event.target.checked);
        setFormData((prevData) => ({
            ...prevData,
            mname: isMiddleNameChecked ? "" : "",
        }));
        // setHasErrors(false);
        setResetSuccess(true);
        setIsSubmitted(false);
    };
    const handleSendEmailChange = (event) => {
        setIsSendEmail(event.target.checked);
    };
    const handleSuffixNameCheckboxChange = (event) => {
        setIsSuffixChecked(event.target.checked);
        setFormData((prevData) => ({
            ...prevData,
            suffix: isSuffixChecked ? "" : "",
        }));
        // setHasErrors(false);
        setResetSuccess(true);
        setIsSubmitted(false);
    };
    const isTextareaValid = message.trim().length > 0;

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };
    const handleCloseModal = () => {
        setFormData(formDataState);
        setMessage("");
        setFiles([]);
        setFileName("");
        setIsSendEmail(false);

    }

    const handleChangeValue = (e) => {
        const newValue = e.target.value;
        setMessage(newValue);
        setIsValid(newValue.trim().length > 0);
    };

    const callBackHandler = () => {
        getAllConcerns();
        setFormData(formDataState);
        setIsSubmitted(false);
        setFileName("");
        setMessage("");
        setIsMiddleNameChecked(false);
        setIsSuffixChecked(false);
        setIsSendEmail(false);
    };

    const {
        user_type,
        contract_number,
        unit_number,
        other_user_type,
        mname,
        suffix,
        ...requiredFields
    } = formData;

    const isFormDataValid = Object.values(requiredFields).every(
        (value) => value !== ""
    );

    const handleSubmit = async (e) => {
        e.preventDefault();

        setIsSubmitted(true);
        const isMnameValid = isMiddleNameChecked || mname.trim() !== "";
        const isSuffixValid = isSuffixChecked || suffix.trim() !== "";

        let isOtherUserTypeValid = true;
        if (user_type === "Others") {
            isOtherUserTypeValid = other_user_type.trim().length > 0;
        }

        if (files && files.length > 0) {
            let allFilesValid = true; // Track if all files are valid
            const invalidExtensions = []; // Store invalid extensions

            files.forEach((file) => {
                const extension = file.name.split(".").pop(); // Get the file extension

                if (file.size > 100 * 1024 * 1024) {
                    // Check size (100 MB)
                    setLoading(false);
                    toast.warning(`File is too large. Maximum size is 100MB.`, {
                        position: "top-right",
                        autoClose: 1500,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                        transition: Bounce
                    });
                    allFilesValid = false;
                    return;
                }

                const isFileValid = VALID_FILE_EXTENSIONS.includes(extension); // Check if extension is allowed
                if (!isFileValid) {
                    invalidExtensions.push(extension); // Add to invalid list
                    allFilesValid = false;
                }
            });

            // If there are any invalid extensions, show a message
            if (invalidExtensions.length > 0) {
                toast.warning(
                    `.${invalidExtensions.join(
                        ", ."
                    )} file type(s) are not allowed.`,
                    {
                        position: "top-right",
                        autoClose: 1500,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                        transition: Bounce,
                    }
                );
                setLoading(false);
                return;
            }

            if (!allFilesValid) {
                // Stop further processing if files are invalid
                return;
            }

            // Proceed with further processing if all files are valid
            setLoading(true);
        }

        if (
            isFormDataValid &&
            isTextareaValid &&
            isMnameValid &&
            isSuffixValid &&
            !errors.buyer_email &&
            isOtherUserTypeValid
        ) {
            try {
                setLoading(true);
                const fileData = new FormData();
                files.forEach((file) => {
                    fileData.append("files[]", file);
                });

                Object.keys(formData).forEach((key) => {
                    fileData.append(key, formData[key]);
                });
                const formattedMessage = message.replace(/\n/g, "<br>");
                fileData.append("message", formattedMessage);
                fileData.append("admin_email", user?.employee_email);
                fileData.append('isSendEmail', isSendEmail);
                fileData.append("admin_id", user?.id);
                fileData.append("admin_profile_picture", user?.profile_picture);

                const response = await apiService.post(
                    "add-concern",
                    fileData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );
                setSpecificInputErrors([]);
                setResetSuccess(true);
                if (modalRef.current) {
                    modalRef.current.close();
                }
                callBackHandler();
                setLoading(false);
                setFiles([]);
            } catch (error) {
                console.log("error saving concerns", error.response);

                if (error.response) {
                    if (error?.response?.status === 422) {
                        const validationErrors = error.response?.data.error;
                        // Set the validation errors returned from the backend
                        //  setSpecificInputErrors(error.response.data.errors);
                        // const errorMessages = [];
                        // for (const field in validationErrors) {
                        //     if (validationErrors.hasOwnProperty(field)) {
                        //         validationErrors.forEach((error) => {
                        //             errorMessages.push(error); // Add each error message for the field
                        //         });
                        //     }
                        // }
                        // console.log(
                        //     "All Validation Error Messages:",
                        //     errorMessages
                        // );
                        console.log("180", error.response?.data.error);
                        setHasErrors(false);
                        setLoading(false);
                        // setSpecificInputErrors(error.response?.data.error);
                        // if (topRef.current) {
                        //     topRef.current.scrollTop = 0;
                        // }
                    }
                }
                {
                    console.log("192");
                    setHasErrors(true);
                    setResetSuccess(false);
                }
            }
        } else {
            setResetSuccess(false);
            if (!isTextareaValid) {
                setIsValid(false);
            }
            if (!isMiddleNameChecked) {
                //setIsValid(false);
                setResetSuccess(false);
                setHasErrors(false);
            }
            // console.log("(!isMiddleNameChecked", isMiddleNameChecked);
            console.log("Form validation failed");
        }
    };

    return (
        <dialog
            id="Employment"
            className="modal w-[589px] rounded-[10px] shadow-custom5 backdrop:bg-black/50"
            ref={modalRef}
        >
            <ToastContainer />
            <div className="px-[50px] rounded-lg overflow-hidden">
                <div className="">
                    <form
                        method="dialog"
                        className="pt-1 flex justify-end -mr-[50px]"
                    >
                        <button
                            className="flex justify-center w-10 h-10 items-center rounded-full text-custom-bluegreen hover:bg-custombg"
                            onClick={handleCloseModal}
                        >
                            ✕
                        </button>
                    </form>
                    <div>
                        <div className="flex justify-center items-center my-2 mobile:mb-7 mobile:my-0">
                            <p className="montserrat-bold text-[19px] text-custom-solidgreen mobile:text-sm">
                                Feedback / Inquiry Form
                            </p>
                        </div>
                        {hasErrors && (
                            <div className="w-full flex justify-center items-center h-12 bg-red-100 mb-4 rounded-lg">
                                <p className="flex text-[#C42E2E] ">
                                    Please complete all required fields.
                                </p>
                            </div>
                        )}

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
                        {errors.buyer_email && (
                            <div className="w-full flex justify-center items-center h-12 bg-red-100 mb-4 rounded-lg">
                                <p className="flex text-[#C42E2E] ">
                                    Invalid email address
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="mb-3">
                        <p className="text-sm font-semibold mobile:text-xs">
                            Required
                        </p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div
                            className={`flex items-center border rounded-[5px] overflow-hidden ${isSubmitted && !formData.fname
                                ? resetSuccess
                                    ? "border-custom-bluegreen"
                                    : "border-red-500"
                                : "border-custom-bluegreen"
                                }`}
                        >
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex pl-3 py-1 w-[240px]">
                                First Name
                            </span>
                            <input
                                name="fname"
                                type="text"
                                className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                placeholder=""
                                value={formData.fname}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="flex items-center gap-[4px]">
                            <div
                                // className={`flex relative items-center border w-[430px] rounded-[5px] overflow-hidden ${
                                //     isSubmitted && !formData.mname
                                //         ? resetSuccess
                                //             ? "border-custom-bluegreen"
                                //             : "border-red-500"
                                //         : "border-custom-bluegreen"
                                // }`}
                                className={`flex relative items-center border w-full rounded-[5px] overflow-hidden ${isSubmitted &&
                                    !formData.mname &&
                                    !isMiddleNameChecked
                                    ? "border-red-500"
                                    : "border-custom-bluegreen"
                                    }`}
                            >
                                <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex w-[240px] pl-3 py-1 tablet:w-[160px] mobile:w-[270px] mobile:text-xs">
                                    Middle Name
                                </span>
                                <input
                                    name="mname"
                                    type="text"
                                    disabled={isMiddleNameChecked}
                                    className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                    value={formData.mname}
                                    onChange={handleChange}
                                    placeholder=""
                                />
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 gap-2 text-sm bg-custom-lightestgreen">
                                    <input
                                        onChange={
                                            handleMiddleNameCheckboxChange
                                        }
                                        type="checkbox"
                                        checked={isMiddleNameChecked}
                                        name="checkbox"
                                        className="accent-custom-lightgreen"
                                        value="checkbox"
                                    />
                                    <p>N/A</p>
                                </span>
                            </div>
                        </div>

                        <div
                            className={`flex items-center border  rounded-[5px] overflow-hidden ${isSubmitted && !formData.lname
                                ? resetSuccess
                                    ? "border-custom-bluegreen"
                                    : "border-red-500"
                                : "border-custom-bluegreen"
                                }`}
                        >
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex w-[240px] pl-3 py-1">
                                Last Name
                            </span>
                            <input
                                name="lname"
                                type="text"
                                value={formData.lname}
                                onChange={handleChange}
                                className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                placeholder=""
                            />
                        </div>
                        <div className="flex items-center gap-[4px]">
                            <div
                                className={`flex relative items-center border w-full rounded-[5px] overflow-hidden ${isSubmitted &&
                                    !formData.suffix &&
                                    !isSuffixChecked
                                    ? "border-red-500"
                                    : "border-custom-bluegreen"
                                    }`}
                            >
                                <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex w-[240px] pl-3 py-1 tablet:w-[160px] mobile:w-[270px] mobile:text-xs">
                                    Suffix Name
                                </span>
                                <input
                                    name="suffix"
                                    type="text"
                                    disabled={isSuffixChecked}
                                    className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                    value={formData.suffix}
                                    onChange={handleChange}
                                    placeholder=""
                                />
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 gap-2 text-sm bg-custom-lightestgreen">
                                    <input
                                        onChange={
                                            handleSuffixNameCheckboxChange
                                        }
                                        type="checkbox"
                                        checked={isSuffixChecked}
                                        name="checkbox"
                                        className="accent-custom-lightgreen"
                                        value="checkbox"
                                    />
                                    <p>N/A</p>
                                </span>
                            </div>
                        </div>
                        <div
                            className={`flex items-center border  rounded-[5px] overflow-hidden ${isSubmitted && !formData.buyer_email
                                ? resetSuccess
                                    ? "border-custom-bluegreen"
                                    : "border-red-500"
                                : "border-custom-bluegreen"
                                }`}
                        >
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex w-[240px] pl-3 py-1">
                                Email
                            </span>
                            <input
                                name="buyer_email"
                                value={formData.buyer_email}
                                onChange={handleChange}
                                type="email"
                                className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                placeholder=""
                            />
                        </div>
                        <div className="flex gap-[6px] items-center">
                            <input type="checkbox" className="h-[16px] w-[16px] rounded-[2px] border border-gray-400 checked:bg-transparent flex items-center justify-center accent-custom-lightgreen" onChange={handleSendEmailChange} value="checkbox"
                                checked={isSendEmail} />
                            <p className="text-sm text-custom-bluegreen font-semibold">Email will be sent.</p>
                        </div>
                        <div
                            className={`flex items-center border rounded-[5px] overflow-hidden ${isSubmitted && !formData.mobile_number
                                ? resetSuccess
                                    ? "border-custom-bluegreen"
                                    : "border-red-500"
                                : "border-custom-bluegreen"
                                }`}
                        >
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex w-[240px] pl-3 py-1">
                                Mobile Number
                            </span>
                            <input
                                value={formData.mobile_number}
                                onChange={handleChange}
                                name="mobile_number"
                                type="number"
                                onInput={(e) =>
                                (e.target.value = e.target.value.replace(
                                    /[^0-9]/g,
                                    ""
                                ))
                                }
                                className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                placeholder=""
                            />
                        </div>
                        <div
                            className={`flex items-center border rounded-[5px] overflow-hidden ${isSubmitted && !formData.property
                                ? resetSuccess
                                    ? "border-custom-bluegreen"
                                    : "border-red-500"
                                : "border-custom-bluegreen"
                                }`}
                        >
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex items-center w-[250px] tablet:w-[175px] mobile:w-[270px] mobile:text-xs -mr-3 pl-3 py-1">
                                Property
                            </span>
                            <div className="relative w-full">
                                <select
                                    name="property"
                                    value={formData.property}
                                    onChange={handleChange}
                                    className="appearance-none w-[88%] px-4 text-sm py-1 bg-white focus:outline-none border-0 mobile:text-xs"
                                >
                                    <option value="">(Select)</option>
                                    {formattedPropertyNames.map(
                                        (item, index) => {
                                            return (
                                                <option
                                                    key={index}
                                                    value={item}
                                                >
                                                    {item}
                                                </option>
                                            );
                                        }
                                    )}
                                </select>
                                <span className="absolute inset-y-0 right-0 flex  items-center pr-3 pl-3 bg-custom-lightestgreen text-custom-bluegreen pointer-events-none">
                                    <IoMdArrowDropdown />
                                </span>
                            </div>
                        </div>
                        <div
                            className={`flex items-center border rounded-[5px]  ${isSubmitted && !formData.details_concern
                                ? resetSuccess
                                    ? "border-custom-bluegreen"
                                    : "border-red-500"
                                : "border-custom-bluegreen"
                                }  `}
                        >
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex items-center w-[250px] tablet:w-[175px] mobile:w-[270px] mobile:text-xs -mr-3 pl-3 py-1">
                                Concern Regarding
                            </span>
                            <div className="relative w-full ">
                                <select
                                    value={formData.details_concern}
                                    onChange={handleChange}
                                    name="details_concern"
                                    className="appearance-none text-sm  px-4 py-1  focus:outline-none border-0 mobile:text-xs   "
                                >
                                    <option value="">(Select)</option>
                                    <option value="Reservation Documents" className="pr-8">
                                        Reservation Documents
                                    </option>
                                    <option value="Payment Issues" className="pr-8">
                                        Payment Issues
                                    </option>
                                    <option value="SOA/ Buyer's Ledger" className="pr-8">
                                        SOA/ Buyer's Ledger
                                    </option>
                                    <option value="Turn Over Status" className="pr-8">
                                        Turn Over Status
                                    </option>
                                    <option value="Unit Status" className="pr-8">
                                        Unit Status
                                    </option>
                                    <option value="Loan Application" className="pr-8">
                                        Loan Application
                                    </option>
                                    <option value="Title and Other Registration Documents" className="pr-8  ">
                                        Title and Other Registration Documents
                                    </option>

                                    <option value="Commissions" className="pr-8">
                                        Commissions
                                    </option>
                                    <option value="Leasing" className="pr-8">
                                        Leasing
                                    </option>
                                    <option value="Other Concerns" className="pr-8">
                                        Other Concerns
                                    </option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 bg-custom-lightestgreen text-custom-bluegreen pointer-events-none">
                                    <IoMdArrowDropdown />
                                </div>
                            </div>

                        </div>
                        <div
                            className={`flex items-center border rounded-[5px] overflow-hidden ${isSubmitted && !formData.type
                                ? resetSuccess
                                    ? "border-custom-bluegreen"
                                    : "border-red-500"
                                : "border-custom-bluegreen"
                                }`}
                        >
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex items-center w-[250px] tablet:w-[175px] mobile:w-[270px] mobile:text-xs -mr-3 pl-3 py-1">
                                Type
                            </span>
                            <div className="relative w-full">
                                <select
                                    value={formData.type}
                                    onChange={handleChange}
                                    name="type"
                                    className="appearance-none text-sm w-[89%] px-4 py-1 bg-white focus:outline-none border-0 mobile:text-xs"
                                >
                                    <option value="">(Select)</option>
                                    <option value="Complain">Complain</option>
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
                            className={`flex items-center border rounded-[5px] overflow-hidden ${isSubmitted && !formData.type
                                ? resetSuccess
                                    ? "border-custom-bluegreen"
                                    : "border-red-500"
                                : "border-custom-bluegreen"
                                }`}
                        >
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex items-center w-[250px] tablet:w-[175px] mobile:w-[270px] mobile:text-xs -mr-3 pl-3 py-1">
                                Channels
                            </span>
                            <div className="relative w-full">
                                <select
                                    value={formData.channels}
                                    onChange={handleChange}
                                    name="channels"
                                    className="appearance-none text-sm w-[89%] px-4 py-1 bg-white focus:outline-none border-0 mobile:text-xs"
                                >
                                    <option value="">(Select)</option>
                                    <option value="Email">Email</option>
                                    <option value="Call">Call</option>
                                    <option value="Walk in">Walk-in</option>
                                    <option value="Website">Website</option>
                                    <option value="Social media">Social Media</option>
                                    <option value="Branch Tablet">Branch Tablet (Jotform created by IT)</option>
                                    <option value="Internal Endorsement">Internal Endorsement</option>

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
                                    value={formData.user_type}
                                    onChange={handleChange}
                                    className="appearance-none w-[90%] px-4 py-1 text-sm bg-white focus:outline-none border-0 mobile:text-xs"
                                >
                                    <option value="">(Select)</option>
                                    <option value="Property Owner">
                                        Property Owner
                                    </option>
                                    <option value="Buyer">Buyer</option>
                                    <option value="Broker">Broker</option>
                                    <option value="Lessee">Lessee</option>
                                    <option value="Others">Others</option>
                                </select>
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3  bg-custom-lightestgreen text-custom-bluegreen pointer-events-none">
                                    <IoMdArrowDropdown />
                                </span>
                            </div>
                        </div>
                        {formData.user_type === "Others" && (
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
                        )}
                        <div className="flex items-center border border-custom-bluegreen rounded-[5px] overflow-hidden">
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex w-[240px] pl-3 py-1">
                                Contract Number
                            </span>
                            <input
                                name="contract_number"
                                value={formData.contract_number}
                                onChange={(e) => {
                                    if (e.target.value.length <= 13) {
                                        handleChange(e);
                                    }
                                }}
                                type="number"
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
                        <div className="flex items-center border border-custom-bluegreen rounded-[5px] overflow-hidden">
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex w-[240px] pl-3 py-1">
                                Unit/Lot Number
                            </span>
                            <input
                                name="unit_number"
                                value={formData.unit_number}
                                onChange={handleChange}
                                type="text"
                                className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                placeholder=""
                            />
                        </div>
                    </div>
                    <div className="border border-b-1 border-[#D9D9D9] my-2"></div>
                    <div
                        className={`${!isValid
                            ? resetSuccess
                                ? "border-custom-bluegreen"
                                : "border-red-500"
                            : "border-custom-bluegreen"
                            } rounded-[5px] bg-custom-lightestgreen border`}
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
                                value={message}
                                onChange={handleChangeValue}
                                maxLength={maxCharacters}
                                name="details_message"
                                placeholder=""
                                rows="4"
                                className={` border-custom-bluegreen rounded-b-[5px] border-t w-full pl-2 outline-none`}
                            ></textarea>
                        </div>
                    </div>
                    <div className="flex flex-col mt-5 mb-12">
                        <div className="flex justify-between w-54 tablet:flex-col">
                            {/* <label
                                htmlFor="attachment"
                                className="tablet:w-full h-10 px-5 text-sm border montserrat-medium border-custom-solidgreen rounded-lg text-custom-solidgreen flex justify-center items-center gap-1 cursor-pointer hover:shadow-custom bg-red-900"
                                onClick={() => {
                                    if (fileInputRef.current) {
                                        fileInputRef.current.click();
                                    }
                                }}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    className="size-3"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                                    />
                                </svg>
                                Attachments
                            </label> */}
                            <button
                                htmlFor="attachment"
                                className="tablet:w-full h-10 px-5 text-sm border montserrat-medium border-custom-solidgreen rounded-lg text-custom-solidgreen flex justify-center items-center gap-1 cursor-pointer hover:shadow-custom"
                                onClick={() => {
                                    if (fileInputRef.current) {
                                        fileInputRef.current.click();
                                    }
                                }}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    className="size-3"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                                    />
                                </svg>
                                Add attachment
                            </button>
                            <input
                                type="file"
                                id="attachment"
                                name="files[]"
                                className="hidden"
                                ref={fileInputRef}
                                multiple
                                onChange={handleFileChange}
                            />
                            <button
                                onClick={handleSubmit}
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
                        <div className="mt-2">
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
                        </div>
                    </div>
                </div>
            </div>
        </dialog>
    );
};

export default InquiryFormModal;

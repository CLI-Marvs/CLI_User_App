import React, { useState, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { IoIosSend, IoMdArrowDropdown, IoMdTrash } from "react-icons/io";
import apiService from "../../servicesApi/apiService";
import { useStateContext } from "../../../context/contextprovider";
import CircularProgress from "@mui/material/CircularProgress";
import { toast, ToastContainer, Bounce } from "react-toastify";
const formDataState = {
    fname: "",
    mname: "",
    lname: "",
    buyer_email: "",
    mobile_number: "",
    property: "",
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
    const [isChecked, setIsChecked] = useState(false);
    const [hasErrors, setHasErrors] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isValid, setIsValid] = useState(true);
    const [errors, setErrors] = useState({});
    const { propertyNamesList } = useStateContext();
    const [specificInputErrors, setSpecificInputErrors] = useState({});

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
                .map((file) =>
                    file.name.length > 15
                        ? `${file.name.substring(0, 12)}... .${file.name
                              .split(".")
                              .pop()}`
                        : file.name
                )
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

    const handleDelete = (fileNameToDelete) => {
        // setFiles((prevFiles) =>
        //     prevFiles.filter((file) => file !== fileNameToDelete)
        // );
        // setFiles([]);
        setFileName((prevFiles) =>
            prevFiles.filter((file) => file !== fileNameToDelete)
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
    const handleCheckboxChange = (event) => {
        setIsChecked(event.target.checked);
        setFormData((prevData) => ({
            ...prevData,
            mname: isChecked ? "" : "",
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
        setIsChecked(false);
    };

    const {
        user_type,
        contract_number,
        unit_number,
        other_user_type,
        mname,
        ...requiredFields
    } = formData;

    const isFormDataValid = Object.values(requiredFields).every(
        (value) => value !== ""
    );

    const handleSubmit = async (e) => {
        e.preventDefault();

        setIsSubmitted(true);
        const isMnameValid = isChecked || mname.trim() !== "";
        let isOtherUserTypeValid = true;
        if (user_type === "Others") {
            isOtherUserTypeValid = other_user_type.trim().length > 0;
        }

        if (files && files.length > 0) {
            const validFile = [
                "pdf",
                "png",
                "bmp",
                "jpg",
                "jpeg",
                "xls",
                "xlsx",
                "xlsm",
                "xml",
                "csv",
                "doc",
                "docx",
                "mp4", // MPEG-4
                "m4v", // MPEG-4 with DRM
                "mov", // Apple QuickTime
                "avi", // Audio Video Interleave
                "wmv", // Windows Media Video
                "flv", // Flash Video
                "mkv", // Matroska Video
                "webm", // WebM format
                "3gp", // 3GPP format for mobile
                "3g2", // 3GPP2 format for mobile
                "zip",
                "txt", // Handle for .txt file extension
            ];

            const extension = files[0].type;

            let modifiedExtension = extension.split("/")[1]; //from application/pdf to pdf
            // Special handling for .docx MIME type
            if (
                extension ===
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            ) {
                modifiedExtension = "docx";
            } else if (extension === "application/msword") {
                modifiedExtension = "doc";
            } else if (
                extension === "application/vnd.ms-excel.sheet.macroEnabled.12"
            ) {
                modifiedExtension = "xlsm";
            } else if (extension === "application/vnd.ms-excel") {
                modifiedExtension = "xls";
            } else if (
                extension ===
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            ) {
                modifiedExtension = "xlsx";
            } else if (extension === "application/pdf") {
                modifiedExtension = "pdf";
            } else if (extension === "image/jpeg") {
                modifiedExtension = "jpeg";
            } else if (extension === "image/png") {
                modifiedExtension = "png";
            } else if (extension === "image/bmp") {
                modifiedExtension = "bmp";
            } else if (extension === "text/plain") {
                modifiedExtension = "txt";
            } else if (extension === "video/mp4") {
                modifiedExtension = "mp4";
            } else if (
                extension === "video/x-m4v" ||
                extension === "video/m4v"
            ) {
                modifiedExtension = "m4v";
            } else if (
                extension === "video/x-msvideo" ||
                extension === "video/avi"
            ) {
                modifiedExtension = "avi";
            } else if (
                extension === "video/x-ms-wmv" ||
                extension === "video/wmv"
            ) {
                modifiedExtension = "wmv";
            } else if (
                extension === "video/x-flv" ||
                extension === "video/flv"
            ) {
                modifiedExtension = "flv";
            } else if (
                extension === "video/x-matroska" ||
                extension === "video/mkv"
            ) {
                modifiedExtension = "mkv";
            } else if (extension === "video/webm") {
                modifiedExtension = "webm";
            } else if (
                extension === "video/3gpp" ||
                extension === "video/3gp"
            ) {
                modifiedExtension = "3gp";
            } else if (
                extension === "video/3gpp2" ||
                extension === "video/3g2"
            ) {
                modifiedExtension = "3g2";
            } else if (extension === "application/x-zip-compressed") {
                modifiedExtension = "zip";
            } else {
                // alert("File type not supported.");
                toast("File type not supported.", {
                    position: "top-right",
                    autoClose: 1000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",

                    transition: Bounce,
                });
                setLoading(false);
                return;
            }

            const isFileValid = validFile.includes(modifiedExtension);
            if (files[0].size > 100 * 1024 * 1024) {
                // 100 MB
                setLoading(false);
                // alert("File size must be 100MB or less.");
                toast(`File size must be 100MB or less.`, {
                    position: "top-right",
                    autoClose: 1000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",

                    transition: Bounce,
                });
                return;
            }
            if (!isFileValid) {
                // alert(`${modifiedExtension} is not allowed.`);
                toast(`${modifiedExtension} is not allowed.`, {
                    position: "top-right",
                    autoClose: 1000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",

                    transition: Bounce,
                });
                setLoading(false);
                return;
            }
        }
        if (
            isFormDataValid &&
            isTextareaValid &&
            isMnameValid &&
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
            if (!isChecked) {
                //setIsValid(false);
                setResetSuccess(false);
                setHasErrors(false);
            }
            // console.log("(!isChecked", isChecked);
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
            <div className=" px-20 rounded-lg">
                <div className="">
                    <form
                        method="dialog"
                        className="pt-1 flex justify-end -mr-[75px]"
                    >
                        <button
                            className="flex justify-center w-10 h-10 items-center rounded-full text-custom-bluegreen hover:bg-custombg"
                            onClick={() => {
                                setFormData(formDataState);
                                setMessage("");
                                setFiles([]);
                                setFileName("");
                            }}
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
                            className={`flex items-center border rounded-[5px] overflow-hidden ${
                                isSubmitted && !formData.fname
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
                                className={`flex relative items-center border w-[430px] rounded-[5px] overflow-hidden ${
                                    isSubmitted && !formData.mname && !isChecked
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
                                    disabled={isChecked}
                                    className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                    value={formData.mname}
                                    onChange={handleChange}
                                    placeholder=""
                                />
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 gap-2 text-sm bg-custom-lightestgreen">
                                    <input
                                        onChange={handleCheckboxChange}
                                        type="checkbox"
                                        checked={isChecked}
                                        name="checkbox"
                                        className="accent-custom-lightgreen"
                                        value="checkbox"
                                    />
                                    <p>N/A</p>
                                </span>
                            </div>
                        </div>
                        <div
                            className={`flex items-center border  rounded-[5px] overflow-hidden ${
                                isSubmitted && !formData.lname
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
                        <div
                            className={`flex items-center border  rounded-[5px] overflow-hidden ${
                                isSubmitted && !formData.buyer_email
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
                        <div
                            className={`flex items-center border rounded-[5px] overflow-hidden ${
                                isSubmitted && !formData.mobile_number
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
                            className={`flex items-center border rounded-[5px] overflow-hidden ${
                                isSubmitted && !formData.property
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
                                    className="appearance-none w-full px-4 text-sm py-1 bg-white focus:outline-none border-0 mobile:text-xs"
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
                            className={`flex items-center border rounded-[5px] overflow-hidden ${
                                isSubmitted && !formData.details_concern
                                    ? resetSuccess
                                        ? "border-custom-bluegreen"
                                        : "border-red-500"
                                    : "border-custom-bluegreen"
                            }`}
                        >
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex items-center w-[250px] tablet:w-[175px] mobile:w-[270px] mobile:text-xs -mr-3 pl-3 py-1">
                                Concern regarding
                            </span>
                            <div className="relative w-full">
                                {/* <select
                                    name="details_concern"
                                    value={formData.details_concern}
                                    onChange={handleChange}
                                    className="appearance-none text-sm w-full px-4 py-1 bg-white focus:outline-none border-0 mobile:text-xs"
                                >
                                    <option value="">(Select)</option>
                                    <option value="Reservation Documents">
                                        Reservation Documents
                                    </option>
                                    <option value="Payment Issues">
                                        Payment Issues
                                    </option>
                                    <option value="Statement of Account and Billing Statement">
                                        Statement of Account and Billing
                                        Statement
                                    </option>
                                    <option value="Turnover Status/Unit Concerns">
                                        Turnover Status/Unit Concerns
                                    </option>
                                    <option value="Loan Application">
                                        Loan Application
                                    </option>
                                    <option value="Title and Other Registration Documents">
                                       Title and Other Registration Documents
                                    </option>formDatainqu
                                    <option value="Commissions">
                                        Commissions
                                    </option>
                                    <option value="Other Concerns">
                                        Other Concerns
                                    </option>
                                </select> */}
                                <select
                                    value={formData.details_concern}
                                    onChange={handleChange}
                                    name="details_concern"
                                    className="appearance-none text-sm w-full px-4 py-1 bg-white focus:outline-none border-0 mobile:text-xs"
                                >
                                    <option value="">(Select)</option>
                                    <option value="Reservation Documents">
                                        Reservation Documents
                                    </option>
                                    <option value="Payment Issues">
                                        Payment Issues
                                    </option>
                                    <option value="SOA/ Billing Statement/ Buyer's Ledger">
                                        SOA/ Billing Statement/ Buyer's Ledger
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
                                    className="appearance-none w-full px-4 py-1 text-sm bg-white focus:outline-none border-0 mobile:text-xs"
                                >
                                    <option value="">(Select)</option>
                                    <option value="Property Owner">
                                        Property Owner
                                    </option>
                                    <option value="Buyer">Buyer</option>
                                    <option value="Broker">Broker</option>
                                    <option value="Others">Others</option>
                                </select>
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3  bg-custom-lightestgreen text-custom-bluegreen pointer-events-none">
                                    <IoMdArrowDropdown />
                                </span>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            {formData.user_type === "Others" && (
                                <div
                                    className={`flex items-center border rounded-[5px] w-[277px] overflow-hidden ${
                                        isSubmitted && !formData.other_user_type
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
                            )}
                        </div>
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
                        className={`${
                            !isValid
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
                                className={` border-t border-custom-bluegreen rounded-b-[5px] border-t w-full pl-2 outline-none`}
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
                                            ${
                                                loading
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

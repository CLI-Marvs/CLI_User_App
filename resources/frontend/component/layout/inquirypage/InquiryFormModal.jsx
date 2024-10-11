import React, { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { IoIosSend, IoMdArrowDropdown, IoMdTrash } from "react-icons/io";
import apiService from "../../servicesApi/apiService";
import { useStateContext } from "../../../context/contextprovider";

const formDataState = {
    fname: "",
    lname: "",
    buyer_email: "",
    mobile_number: "",
    property: "",
    user_type: "",
    contract_number: "",
    details_concern: "",
    unit_number: "",
};

const projectList = [
    "N/A",
    "38 Park Avenue",
    "Astra Centre",
    "Asia Premiere",
    "Base Line Center Phase 2",
    "Baseline Center",
    "Baseline Residences",
    "Casa Mira Bacolod",
    "Casa Mira Coast Sibulan",
    "Casa Mira Homes Butuan",
    "Casa Mira Iloilo Camalig",
    "Casa Mira Linao",
    "Casa Mira Towers CDO",
    "Casa Mira Towers Guadalupe",
    "Casa Mira Towers Labangon",
    "Casa Mira Towers LPU Davao",
    "Casa Mira Towers Mandaue",
    "Casamira South",
    "Calle 104",
    "Casa Mira Dumaguete",
    "Casa Mira Towers Bacolod",
    "Casa Mira Towers Palawan",
    "Costa Mira Beachtown",
    "Costa Mira Beachtown Panglao",
    "Latitude Corporate Center",
    "Mesaverte Residences",
    "Mesavirre Garden Residences",
    "Midori Residences",
    "Mivela Garden Residences",
    "Mivesa Garden Residences",
    "Mandtra Residences",
    "Midori Plains",
    "Mindara Residences",
    "Patria De Cebu",
    "Park Centrale Tower",
    "San Jose Maria Village - Balamban",
    "San Jose Maria Village - Minglanilla",
    "San Jose Maria Village - Toledo",
    "San Josemaria Village - Talisay",
    "Test Project",
    "The East Village",
    "Velmiro Greens Bohol",
    "Velmiro Heights",
    "Velmiro Heights Uptown",
    "Velmiro Plains Bacolod",
    "Villa Casita - Balamban",
    "Villa Casita - Bogo",
];

const InquiryFormModal = ({ modalRef }) => {
    const [files, setFiles] = useState([]);
    const [fileName, setFileName] = useState("");
    const [message, setMessage] = useState("");
    const { user, getAllConcerns } = useStateContext();
    const maxCharacters = 500;
    const [hasErrors, setHasErrors] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isValid, setIsValid] = useState(true);
    const [errors, setErrors] = useState({});
    const { propertyNamesList } = useStateContext();
    const handleFileChange = (event) => {
        const selectedFiles = Array.from(event.target.files);
        const fileNames = selectedFiles.map((file) =>
            file.name.length > 15
                ? `${file.name.substring(0, 12)}... .${file.name
                      .split(".")
                      .pop()}`
                : file.name
        );
        setFiles(selectedFiles);
    };

    const formatFunc = (name) => {
        return name
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };
    const formattedPropertyNames = ["N/A", ...propertyNamesList.map((item) => 
        formatFunc(item)
    )]

    const handleDelete = (fileNameToDelete) => {
        setFiles((prevFiles) =>
            prevFiles.filter((file) => file.name !== fileNameToDelete)
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
        ~setFormData(formDataState);
        setFiles([]);
        setMessage("");
    };

    const { user_type, contract_number, unit_number, ...requiredFields } =
        formData;

    const isFormDataValid = Object.values(requiredFields).every(
        (value) => value !== ""
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitted(true);
        if (isFormDataValid && isTextareaValid && !errors.buyer_email) {
            try {
                const fileData = new FormData();
                files.forEach((file) => {
                    fileData.append("files[]", file);
                });
                Object.keys(formData).forEach((key) => {
                    fileData.append(key, formData[key]);
                });
                fileData.append("message", message);
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
                setResetSuccess(true);
                if (modalRef.current) {
                    modalRef.current.close();
                }
                callBackHandler();
            } catch (error) {
                console.log("error saving concerns", error);
                setHasErrors(true);
                setResetSuccess(false);
            }
        } else {
            setResetSuccess(false);
            if (!isTextareaValid) {
                setIsValid(false);
            }
            console.log("Form validation failed");
        }
    };
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
                        <button className="flex justify-center w-10 h-10 items-center rounded-full text-custom-bluegreen hover:bg-custombg">
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
                                    {formattedPropertyNames.map((item, index) => {
                                        return (
                                            <option key={index} value={item}>
                                                {item}
                                            </option>
                                        );
                                    })}
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
                                <select
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
                                    <option value="Titile and Other Registration Documents">
                                        Titile and Other Registration Documents
                                    </option>
                                    <option value="Commissions">
                                        Commissions
                                    </option>
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
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex items-center w-[250px] tablet:w-[175px] mobile:w-[270px] mobile:text-xs -mr-4 pl-3 py-1">
                                I am
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
                                </select>
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3  bg-custom-lightestgreen text-custom-bluegreen pointer-events-none">
                                    <IoMdArrowDropdown />
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center border border-custom-bluegreen rounded-[5px] overflow-hidden">
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex w-[240px] pl-3 py-1">
                                Contract Number
                            </span>
                            <input
                                name="contract_number"
                                value={formData.contract_number}
                                onChange={handleChange}
                                type="number"
                                className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                placeholder=""
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
                                placeholder="Write your concern here."
                                rows="4"
                                className={` border-t border-custom-bluegreen rounded-b-[5px] border-t w-full pl-2 outline-none`}
                            ></textarea>
                        </div>
                    </div>
                    <div className="flex flex-col mt-5 mb-12">
                        <div className="flex justify-end w-54 tablet:flex-col">
                            <label
                                htmlFor="attachment"
                                className="hidden tablet:w-full h-10 px-5 text-sm border montserrat-medium border-custom-solidgreen rounded-lg text-custom-solidgreen flex justify-center items-center gap-1 cursor-pointer hover:shadow-custom"
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
                                <input
                                    type="file"
                                    id="attachment"
                                    name="files[]"
                                    multiple
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </label>
                            {files.length > 0 && (
                                <div className="flex flex-col mt-2">
                                    {files.map((file, index) => (
                                        <p
                                            key={index}
                                            className="flex items-center text-sm text-gray-600 truncate gap-1"
                                        >
                                            {file.name}
                                            <IoMdTrash
                                                className="hover:text-red-500"
                                                onClick={() =>
                                                    handleDelete(file.name)
                                                }
                                            />
                                        </p>
                                    ))}
                                </div>
                            )}
                            <button
                                type="submit"
                                onClick={handleSubmit}
                                className="h-10 text-white px-10 rounded-lg gradient-btn2 flex justify-center items-center gap-2 tablet:w-full hover:shadow-custom4"
                            >
                                Submit
                                <IoIosSend />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </dialog>
    );
};

export default InquiryFormModal;

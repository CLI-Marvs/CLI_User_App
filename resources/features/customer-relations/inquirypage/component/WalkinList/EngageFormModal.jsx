import React, {
    forwardRef,
    useImperativeHandle,
    useState,
    useEffect,
} from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import { useProperty } from "@/context/PropertyPricing/PropertyContext";
import { toLowerCaseText } from "@/util/formatToLowerCase";
import Button from "@/features/customer-relations/inquirypage/component/ui/button";
import CustomInput from "@/component/Input/CustomInput";
import CircularProgress from "@mui/material/CircularProgress";
import { useEngageForm } from "@/features/customer-relations/inquirypage/hooks/useEngageForm";
import { INQUIRY_FROM_OPTIONS } from "@/features/customer-relations/inquirypage/constants/inquiryFrom";
import { TYPE_OPTIONS } from "@/features/customer-relations/inquirypage/constants/type";

const formDataInitialState = {
    first_name: "",
    middle_name: "",
    last_name: "",
    suffix: "",
    email: "",
    contact_number: "",
    property_id: "",
    category_id: "",
    type: "",
    inquiry_from: "",
    contract_number: "",
    unit_number: "",
    details_message: "",
    middle_name_na: false,
    suffix_na: false,
    other_user_type: "",
};

const EngageFormModal = forwardRef(
    ({ itemData, categories, setSelectedItem }, ref) => {
        //Ref
        const dialogRef = React.useRef(null);
        //States
        const [formData, setFormData] = useState(formDataInitialState);
        const [error, setError] = useState("");
        //Hooks
        const { propertyNamesList } = useProperty();
        const {
            isPropertyButtonDisabled,
            isSubmitting,
            handleSubmit,
            contractNumberError,
            transactionMutation,
            handleCloseModal,
        } = useEngageForm(
            formData,
            itemData,
            setSelectedItem,
            setError,
            dialogRef,
            propertyNamesList,
            categories
        );

        const validateEmail = (email) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        };

        // Expose methods to parent through ref
        useImperativeHandle(ref, () => ({
            showModal: () => {
                if (dialogRef.current) {
                    dialogRef.current.showModal();
                }
            },
            closeModal: () => {
                if (dialogRef.current) {
                    dialogRef.current.close();
                }
            },
        }));

        // Populate form when item data changes
        useEffect(() => {
            if (itemData) {
                setFormData({
                    category_id: itemData.category_id || "",
                    property_id: itemData.property_id || "",
                    first_name: itemData.first_name || "",
                    last_name: itemData.last_name || "",
                    contact_number: itemData.contact_number || "",
                    contract_number: itemData.contract_number || "",
                    email: itemData.email || "",
                    details_message: itemData.details_message || "",
                });
            }
        }, [itemData]);

        useEffect(() => {
            if (formData.inquiry_from !== "Others") {
                setFormData((prevData) => ({
                    ...prevData,
                    other_user_type: "",
                }));
            }
        }, [formData.inquiry_from]);

        // Handle input changes
        const handleInputChange = (e) => {
            const { name, value } = e.target;
            setFormData((prevData) => ({
                ...prevData,
                [name]: value,
            }));

            if (name === "email") {
                setError(validateEmail(value) ? "" : "Invalid email address");
            }
        };

        return (
            <dialog
                id="engageFormModal"
                className="modal w-[600px] rounded-[10px] shadow-custom5 backdrop:bg-black/50"
                ref={dialogRef}
            >
                <div className="relative p-[20px] mb-5 rounded-lg">
                    {/* Close modal button */}
                    <div className="">
                        <div>
                            <button
                                className="absolute top-3 right-3 w-10 h-10 items-center rounded-full bg-custombg3 text-custom-bluegreen hover:bg-custombg"
                                onClick={handleCloseModal}
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-center items-center my-6 mobile:mb-7 mobile:my-0">
                        <p className="montserrat-bold text-[19px] text-custom-solidgreen mobile:text-sm">
                            Walk-in Form
                        </p>
                    </div>
                    {/* Modal content */}
                    <div>
                        {error && (
                            <div className="w-full flex justify-center items-center h-12 bg-red-100  rounded-lg mt-10">
                                <p className="flex text-[#C42E2E] montserrat-regular">
                                    {error}
                                </p>
                            </div>
                        )}
                    </div>
                    <div className=" ">
                        <div className="mt-8">
                            <h1 className="montserrat-bold ">
                                Priority Number :{" "}
                                <span className="montserrat-regular">
                                    {itemData?.priority_number}
                                </span>
                            </h1>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm font-semibold mobile:text-xs">
                                Required
                            </p>
                        </div>
                        {/*First name */}
                        <div className="py-1">
                            <div
                                className={`flex items-center border border-custom-bluegreen rounded-[5px] overflow-hidden  `}
                            >
                                <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex pl-3 py-1 w-[182px]">
                                    First Name
                                </span>
                                <CustomInput
                                    name="first_name"
                                    type="text"
                                    value={formData.first_name}
                                    onChange={handleInputChange}
                                    noNumbers={true}
                                    className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                />
                            </div>
                        </div>

                        {/*Middle name */}
                        <div className="py-1">
                            <div
                                className={`flex relative items-center border border-custom-bluegreen rounded-[5px] overflow-hidden`}
                            >
                                <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex pl-3 py-1 w-[182px]">
                                    Middle Name
                                </span>
                                <CustomInput
                                    name="middle_name"
                                    type="text"
                                    value={
                                        formData.middle_name_na
                                            ? ""
                                            : formData.middle_name
                                    }
                                    onChange={handleInputChange}
                                    noNumbers={true}
                                    className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                    disabled={formData.middle_name_na}
                                    required={!formData.middle_name_na}
                                />
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 gap-2 text-sm bg-custom-lightestgreen">
                                    <input
                                        onChange={(e) => {
                                            setFormData((prev) => ({
                                                ...prev,
                                                middle_name_na:
                                                    e.target.checked,
                                                middle_name: e.target.checked
                                                    ? ""
                                                    : prev.middle_name,
                                            }));
                                        }}
                                        type="checkbox"
                                        checked={formData.middle_name_na}
                                        name="middle_name_na"
                                        className="accent-custom-lightgreen"
                                        value="checkbox"
                                    />
                                    <p>N/A</p>
                                </span>
                            </div>
                        </div>

                        {/*Last name */}
                        <div className="py-1">
                            <div
                                className={`flex items-center border border-custom-bluegreen rounded-[5px] overflow-hidden  `}
                            >
                                <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex pl-3 py-1 w-[182px]">
                                    Last Name
                                </span>
                                <CustomInput
                                    name="last_name"
                                    type="text"
                                    value={formData.last_name}
                                    onChange={handleInputChange}
                                    noNumbers={true}
                                    className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                />
                            </div>
                        </div>

                        {/*Suffix name */}
                        <div className="py-1">
                            <div
                                className={`flex relative items-center border border-custom-bluegreen rounded-[5px] overflow-hidden  `}
                            >
                                <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex pl-3 py-1 w-[182px]">
                                    Suffix Name
                                </span>
                                <CustomInput
                                    name="suffix"
                                    type="text"
                                    value={
                                        formData.suffix_na
                                            ? ""
                                            : formData.suffix
                                    }
                                    onChange={handleInputChange}
                                    noNumbers={true}
                                    className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                    disabled={formData.suffix_na}
                                    required={!formData.suffix_na}
                                />
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 gap-2 text-sm bg-custom-lightestgreen">
                                    <input
                                        type="checkbox"
                                        checked={formData.suffix_na}
                                        onChange={(e) => {
                                            setFormData((prev) => ({
                                                ...prev,
                                                suffix_na: e.target.checked,
                                                suffix: e.target.checked
                                                    ? ""
                                                    : prev.suffix,
                                            }));
                                        }}
                                        name="suffix_na"
                                        className="accent-custom-lightgreen"
                                    />
                                    <p>N/A</p>
                                </span>
                            </div>
                        </div>

                        {/*Email*/}
                        <div className="py-1">
                            <div
                                className={`flex items-center border border-custom-bluegreen rounded-[5px] overflow-hidden  `}
                            >
                                <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex pl-3 py-1 w-[182px]">
                                    Email
                                </span>
                                <CustomInput
                                    name="email"
                                    type="text"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                />
                            </div>
                        </div>

                        {/*Mobile Number */}
                        <div className="py-1">
                            <div
                                className={`flex items-center border border-custom-bluegreen rounded-[5px] overflow-hidden  `}
                            >
                                <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex pl-3 py-1 w-[182px]">
                                    Mobile Number
                                </span>
                                <CustomInput
                                    name="contact_number"
                                    type="number"
                                    value={formData.contact_number}
                                    onChange={handleInputChange}
                                    className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                    restrictNumbers={true}
                                />
                            </div>
                        </div>

                        {/*Project/Property */}
                        <div className="py-1">
                            <div className="flex items-center border border-custom-bluegreen rounded-[5px] overflow-hidden ">
                                <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex items-center w-[200px] tablet:w-[175px] mobile:w-[270px] mobile:text-xs -mr-4 pl-3 py-1">
                                    Property
                                </span>
                                <div className="relative w-full">
                                    <select
                                        name="property_id"
                                        value={formData.property_id}
                                        onChange={handleInputChange}
                                        className="appearance-none w-full px-4 py-1 text-sm bg-white focus:outline-none border-0 mobile:text-xs"
                                    >
                                        <option value="">(Select)</option>
                                        <option value={0}>N/A</option>
                                        {propertyNamesList.map((property) => (
                                            <option
                                                key={property.id}
                                                value={property.id}
                                            >
                                                {toLowerCaseText(property.name)}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3  bg-custom-lightestgreen text-custom-bluegreen pointer-events-none">
                                        <IoMdArrowDropdown />
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Category Type */}
                        <div className="py-1">
                            <div className="flex items-center border border-custom-bluegreen rounded-[5px] overflow-hidden ">
                                <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex items-center w-[200px] tablet:w-[175px] mobile:w-[270px] mobile:text-xs -mr-4 pl-3 py-1">
                                    Concern Regarding
                                </span>
                                <div className="relative w-full">
                                    <select
                                        name="category_id"
                                        value={formData.category_id}
                                        onChange={handleInputChange}
                                        className="appearance-none w-full px-4 py-1 text-sm bg-white focus:outline-none border-0 mobile:text-xs"
                                    >
                                        <option value="">(Select)</option>
                                        {categories &&
                                            categories.map((category) => (
                                                <option
                                                    key={category.id}
                                                    value={category.id}
                                                >
                                                    {category.name}
                                                </option>
                                            ))}
                                    </select>
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3  bg-custom-lightestgreen text-custom-bluegreen pointer-events-none">
                                        <IoMdArrowDropdown />
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Type */}
                        <div className="py-1 mb-1">
                            <div className="flex items-center border border-custom-bluegreen rounded-[5px] overflow-hidden ">
                                <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex items-center w-[200px] tablet:w-[175px] mobile:w-[270px] mobile:text-xs -mr-4 pl-3 py-1">
                                    Type
                                </span>
                                <div className="relative w-full">
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        className="appearance-none w-full px-4 py-1 text-sm bg-white focus:outline-none border-0 mobile:text-xs"
                                    >
                                        {TYPE_OPTIONS.map((option) => (
                                            <option
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3  bg-custom-lightestgreen text-custom-bluegreen pointer-events-none">
                                        <IoMdArrowDropdown />
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="border border-t-1 border-[#D9D9D9]"></div>
                        <div className="mt-3">
                            <p className="text-sm font-semibold mobile:text-xs">
                                Optional
                            </p>
                        </div>

                        {/* Inquiry From */}
                        <div className="py-1 mb-1">
                            <div className="flex items-center border border-custom-bluegreen rounded-[5px] overflow-hidden ">
                                <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex items-center w-[200px] tablet:w-[175px] mobile:w-[270px] mobile:text-xs -mr-4 pl-3 py-1">
                                    Inquiry From
                                </span>
                                <div className="relative w-full">
                                    <select
                                        name="inquiry_from"
                                        value={formData.inquiry_from}
                                        onChange={handleInputChange}
                                        className="appearance-none w-full px-4 py-1 text-sm bg-white focus:outline-none border-0 mobile:text-xs"
                                    >
                                        {INQUIRY_FROM_OPTIONS.map((option) => (
                                            <option
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3  bg-custom-lightestgreen text-custom-bluegreen pointer-events-none">
                                        <IoMdArrowDropdown />
                                    </span>
                                </div>
                            </div>
                            {formData.inquiry_from === "Others" && (
                                <div className="flex justify-end mt-2">
                                    <div
                                        className={`flex items-center border rounded-[5px] w-[277px] overflow-hidden `}
                                    >
                                        <input
                                            name="other_user_type"
                                            type="text"
                                            className="w-full px-4 text-sm focus:outline-none mobile:text-xs py-1"
                                            value={formData.other_user_type}
                                            onChange={handleInputChange}
                                            placeholder=""
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/*Contract Number*/}
                        <div className="">
                            <div
                                className={`flex items-center rounded-[5px] overflow-hidden ${formData.contract_number.length === 13
                                    ? "border border-custom-bluegreen"
                                    : formData.contract_number.length > 0 &&
                                        formData.contract_number.length < 13
                                        ? "border border-red-500"
                                        : "border border-custom-bluegreen"
                                    }`}
                            >
                                <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex pl-3 py-1 w-[182px]">
                                    Contract Number
                                </span>
                                <CustomInput
                                    name="contract_number"
                                    value={formData.contract_number}
                                    onChange={(e) => {
                                        if (e.target.value.length <= 13) {
                                            handleInputChange(e);
                                        }
                                    }}
                                    className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                    restrictNumbers={true}
                                    maxLength={13}
                                />
                            </div>
                            <span
                                className={`flex justify-end text-xs ${formData.contract_number.length > 0 &&
                                    contractNumberError
                                    ? "text-red-500"
                                    : formData.contract_number.length === 13
                                        ? "text-custom-bluegreen"
                                        : "text-gray-400"
                                    }`}
                            >
                                {formData?.contract_number.length} /13
                            </span>
                        </div>

                        <div className="flex items-center border border-custom-bluegreen rounded-[5px] overflow-hidden mt-2">
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex w-[182px] pl-3 py-1">
                                Unit/Lot Number
                            </span>
                            <CustomInput
                                name="unit_number"
                                type="text"
                                value={formData.unit_number}
                                onChange={handleInputChange}
                                className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                            />
                        </div>
                        <div className="border border-t-1 border-[#D9D9D9] mt-2"></div>

                        {/* Detailed notes */}
                        <div
                            className={`  rounded-[5px] border-custom-bluegreen border mt-2`}
                        >
                            <div className="flex items-center justify-between h-full bg-custom-lightestgreen rounded-t-[5px]">
                                <p className="text-custom-bluegreen text-sm  pl-3  flex-grow mobile:text-xs mobile:w-[170px] montserrat-semibold">
                                    Details (Required)
                                </p>
                                <span className="bg-white text-sm2 text-gray-400 font-normal py-2 border-l border-custom-bluegreen pl-2 pr-12 mobile:pr-1 mobile:text-xs ml-auto rounded-tr-[4px]">
                                    {formData.details_message.length}/500
                                    characters
                                </span>
                            </div>
                            <div className="flex gap-3 ">
                                <CustomInput
                                    type="textarea"
                                    id="details_message"
                                    name="details_message"
                                    maxLength={500}
                                    value={formData.details_message || ""}
                                    className={`border-custom-bluegreen rounded-b-[5px] border-t w-full pl-2 outline-none`}
                                    onChange={handleInputChange}
                                    rows="4"
                                />
                            </div>
                        </div>

                        <div className="mt-10 flex justify-end gap-3">
                            <Button
                                type="submit"
                                onClick={(e) => handleSubmit(e, "saved")}
                                disabled={
                                    isPropertyButtonDisabled || isSubmitting
                                }
                                className={`bg-white border w-[150px] h-[35px] rounded-[10px] text-sm  text-custom-bluegreen montserrat-semibold  border-custom-bluegreen ${isPropertyButtonDisabled || isSubmitting
                                    ? "cursor-not-allowed opacity-50"
                                    : ""
                                    }`}
                            >
                                {isSubmitting &&
                                    transactionMutation.variables?.status ===
                                    "saved" ? (
                                    <CircularProgress className="spinnerSize" />
                                ) : (
                                    <>Save</>
                                )}
                            </Button>
                            <Button
                                type="submit"
                                onClick={(e) => handleSubmit(e, "resolved")}
                                disabled={
                                    isPropertyButtonDisabled || isSubmitting
                                }
                                className={`border  w-[150px] h-[35px] rounded-[10px] text-sm bg-white text-white montserrat-semibold gradient-btn5 ${isPropertyButtonDisabled || isSubmitting
                                    ? "cursor-not-allowed opacity-50"
                                    : ""
                                    }`}
                            >
                                {isSubmitting &&
                                    transactionMutation.variables?.status ===
                                    "resolved" ? (
                                    <CircularProgress className="spinnerSize" />
                                ) : (
                                    <>Close ticket</>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </dialog>
        );
    }
);

export default EngageFormModal;

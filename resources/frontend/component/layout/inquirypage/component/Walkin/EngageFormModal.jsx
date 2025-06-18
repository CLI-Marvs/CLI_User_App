import React, {
    forwardRef,
    useImperativeHandle,
    useState,
    useEffect,
} from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import { useProperty } from "@/context/PropertyPricing/PropertyContext";
import { toLowerCaseText } from "@/util/formatToLowerCase";
import { walkinTransactionService } from "@/component/servicesApi/apiCalls/emojiWalkin/walkinTransactionService";
import { showToast } from "@/util/toastUtil";
import Button from "@/component/layout/inquirypage/component/ui/button";

const formDataInitialState = {
    category_id: "",
    property_id: "",
    first_name: "",
    last_name: "",
    contact_number: "",
    contract_number: "",
    email: "",
    details_message: "",
};

const EngageFormModal = forwardRef(
    ({ itemData, categories, setSelectedItem }, ref) => {
        //TODO: confirm why it loads even if I did not click the engage modal
        //State
        // Create dialog ref inside the component
        const dialogRef = React.useRef(null);
        const { propertyNamesList } = useProperty();
        const [formData, setFormData] = useState(formDataInitialState);

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

        // Update the form with itemData when it changes
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

        //Event handler
        const handleSubmit = async (e, actionType) => {
            e.preventDefault();

            // Handle form submission logic here
            const payload = {
                walkin_transaction_id: itemData.id,
                category_id: formData.category_id,
                property_masters_id: formData.property_id,
                first_name: formData.first_name,
                last_name: formData.last_name,
                contact_number: formData.contact_number,
                contract_number: formData.contract_number,
                email: formData.email,
                detailed_notes: formData.details_message,
                status: actionType,
            };
            const reponse =
                await walkinTransactionService.createWalkinTransactionDetail(
                    payload
                );
            // Reset form data after submission
            setFormData(formDataInitialState);
            showToast(
                reponse?.message ||
                    "Walkin transaction details created successfully",
                "success"
            );

            dialogRef.current?.close();
        };

        // Handle input changes
        const handleInputChange = (e) => {
            const { name, value } = e.target;
            setFormData((prevData) => ({
                ...prevData,
                [name]: value,
            }));
        };

        return (
            <dialog
                id="engageFormModal"
                className="modal w-[550px] rounded-[10px] shadow-custom5 backdrop:bg-black/50"
                ref={dialogRef}
            >
                <div className="relative p-[20px] mb-5 rounded-lg">
                    {/* Close modal button */}
                    <div className="">
                        <div>
                            <button
                                className="absolute top-3 right-3 w-10 h-10 items-center rounded-full bg-custombg3 text-custom-bluegreen hover:bg-custombg"
                                onClick={() => dialogRef.current?.close()}
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                    {/* Modal content */}
                    <div className=" ">
                        <div className="mt-10">
                            <h1 className="montserrat-bold ">
                                Priority Number :{" "}
                                <span className="montserrat-regular">
                                    {itemData?.priority_number}
                                </span>
                            </h1>
                        </div>
                        {/* Inquiry Type */}
                        <div className="py-2">
                            <div className="flex items-center border border-custom-bluegreen rounded-[5px] overflow-hidden ">
                                <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex items-center w-[200px] tablet:w-[175px] mobile:w-[270px] mobile:text-xs -mr-4 pl-3 py-1">
                                    Inquiry Type
                                </span>
                                <div className="relative w-full">
                                    <select
                                        name="category_id"
                                        value={formData.category_id}
                                        onChange={handleInputChange}
                                        className="appearance-none w-full px-4 py-1 text-sm bg-white focus:outline-none border-0 mobile:text-xs"
                                    >
                                        <option value="">
                                            (Select category type)
                                        </option>
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

                        {/*Project/Property */}
                        <div className="py-1">
                            <div className="flex items-center border border-custom-bluegreen rounded-[5px] overflow-hidden ">
                                <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex items-center w-[200px] tablet:w-[175px] mobile:w-[270px] mobile:text-xs -mr-4 pl-3 py-1">
                                    Project
                                </span>
                                <div className="relative w-full">
                                    <select
                                        name="property_id"
                                        value={formData.property_id}
                                        onChange={handleInputChange}
                                        className="appearance-none w-full px-4 py-1 text-sm bg-white focus:outline-none border-0 mobile:text-xs"
                                    >
                                        <option value="">
                                            (Select project)
                                        </option>
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

                        {/*First name */}
                        <div className="py-1">
                            <div
                                className={`flex items-center border rounded-[5px] overflow-hidden  `}
                            >
                                <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex pl-3 py-1 w-[182px]">
                                    First Name
                                </span>
                                <input
                                    name="first_name"
                                    type="text"
                                    value={formData.first_name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                    placeholder=""
                                />
                            </div>
                        </div>

                        {/*Last name */}
                        <div className="py-1">
                            <div
                                className={`flex items-center border rounded-[5px] overflow-hidden  `}
                            >
                                <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex pl-3 py-1 w-[182px]">
                                    Last Name
                                </span>
                                <input
                                    name="last_name"
                                    type="text"
                                    value={formData.last_name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                    placeholder=""
                                />
                            </div>
                        </div>

                        {/*Contact Number */}
                        <div className="py-1">
                            <div
                                className={`flex items-center border rounded-[5px] overflow-hidden  `}
                            >
                                <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex pl-3 py-1 w-[182px]">
                                    Contact Number
                                </span>
                                <input
                                    name="contact_number"
                                    type="text"
                                    value={formData.contact_number}
                                    onChange={handleInputChange}
                                    className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                    placeholder=""
                                />
                            </div>
                        </div>

                        {/*Contract Number*/}
                        <div className="py-1">
                            <div
                                className={`flex items-center border rounded-[5px] overflow-hidden  `}
                            >
                                <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex pl-3 py-1 w-[182px]">
                                    Contract Number
                                </span>
                                <input
                                    name="contract_number"
                                    type="text"
                                    value={formData.contract_number}
                                    onChange={handleInputChange}
                                    className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                    placeholder=""
                                />
                            </div>
                        </div>

                        {/*Email*/}
                        <div className="py-1">
                            <div
                                className={`flex items-center border rounded-[5px] overflow-hidden  `}
                            >
                                <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex pl-3 py-1 w-[182px]">
                                    Email
                                </span>
                                <input
                                    name="email"
                                    type="text"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                    placeholder=""
                                />
                            </div>
                        </div>

                        {/* Detailed notes */}
                        <div
                            className={`  rounded-[5px] bg-custom-lightestgreen border mt-1`}
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-custom-bluegreen text-sm bg-custom-lightestgreen pl-3  flex-grow mobile:text-xs mobile:w-[170px]">
                                    Detailed Notes
                                </p>
                                <span className="bg-white text-sm2 text-gray-400 font-normal py-2 border-l border-custom-bluegreen pl-2 pr-12 mobile:pr-1 mobile:text-xs ml-auto rounded-tr-[4px]">
                                    {formData.details_message.length}/500
                                    characters
                                </span>
                            </div>
                            <div className="flex gap-3 ">
                                <textarea
                                    id="details_message"
                                    name="details_message"
                                    value={formData.details_message}
                                    onChange={handleInputChange}
                                    maxLength={500}
                                    placeholder=""
                                    rows="4"
                                    className={`border-custom-bluegreen rounded-b-[5px] border-t w-full pl-2 outline-none`}
                                ></textarea>
                            </div>
                        </div>

                        <div className="mt-10 flex justify-end gap-3">
                            <Button
                                type="submit"
                                onClick={(e) => handleSubmit(e, "resolved")}
                                // disabled={isButtonDisabled(formData) || isLoading}
                                className="border border-custom-bluegreen w-[150px] h-[35px] rounded-[10px] text-sm bg-white text-custom-bluegreen montserrat-semibold"
                            >
                                Close ticket
                            </Button>
                            <Button
                                type="submit"
                                onClick={(e) => handleSubmit(e, "save")}
                                className="gradient-btn5 w-[150px] h-[35px] rounded-[10px] text-sm bg-gray-500 text-white montserrat-semibold"
                            >
                                Save
                            </Button>
                        </div>
                    </div>
                </div>
            </dialog>
        );
    }
);

export default EngageFormModal;

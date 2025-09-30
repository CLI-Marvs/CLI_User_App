import React, { useState } from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import isButtonDisabled from "@/util/isFormButtonDisabled";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import { useStateContext } from "@/context/contextprovider";
import { showToast } from "@/util/toastUtil";
import { propertyMasterService } from "@/component/servicesApi/apiCalls/propertyPricing/property/propertyMasterService";
import { useProperty } from "@/context/PropertyPricing/PropertyContext";
import { useUnit } from "@/context/PropertyPricing/UnitContext";
import { toLowerCaseText } from "@/util/formatToLowerCase";
import CustomInput from "@/component/Input/CustomInput";

const formDataState = {
    propertyName: "",
    type: "",
    towerPhase: "",
    tower_description: "",
    barangay: "",
    city: "",
    province: "",
    country: "",
    google_map_link: "",
};

const AddPropertyModal = ({ propertyModalRef, fetchData }) => {
    //State
    const { user } = useStateContext();
    const [formData, setFormData] = useState(formDataState);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { propertyNamesList } = useProperty();
    const { setExcelId } = useUnit();
    const isPropertyButtonDisabled = isButtonDisabled(
        formData,
        Object.keys(formDataState).filter((key) => key !== "google_map_link")
    );

    //Event Handler
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    //Handle the submit/save button click
    const handleSubmit = async (e, status) => {
        e.preventDefault();
        const payload = {
            property_masters_id: formData?.propertyName,
            type: formData.type,
            tower_phase: formData.towerPhase,
            tower_description: formData.tower_description,
            barangay: formData.barangay,
            city: formData.city,
            province: formData.province,
            country: formData.country,
            google_map_link: formData.google_map_link,
            status: status,
            emp_id: user?.id,
        };

        try {
            setIsLoading(true);
            const response = await propertyMasterService.storePropertyMaster(
                payload
            );
            const priceListData = { data: response.data.data };
            const propertyCommercialDetail =
                priceListData?.data?.property_commercial_detail;
            const priceListId =
                propertyCommercialDetail?.price_list_master_id ?? null;

            if (response.status === 201) {
                showToast("Data added successfully!", "success");
                setFormData(formDataState);
                await fetchData(true, false);

                if (propertyModalRef.current) {
                    propertyModalRef.current.close();
                }
                setExcelId(null);
                navigate(`/property-pricing/basic-pricing/${priceListId}`, {
                    state: { priceListData: priceListData },
                });
            }
        } catch (error) {
            if (error.response.status === 422) {
                showToast(error.response.data.message, "error");
            }
        } finally {
            setIsLoading(false);
        }
    };

    //Handle close the modal and reset all state
    const handleClose = () => {
        if (propertyModalRef.current) {
            setFormData(formDataState);
            propertyModalRef.current.close();
        }
    };

    return (
        <dialog
            className="modal w-[475px] h-auto rounded-lg backdrop:bg-black/50"
            ref={propertyModalRef}
        >
            <div className=" px-14 mb-5 rounded-lg">
                <div className="">
                    <div
                        method="dialog"
                        className="pt-2 flex justify-end -mr-[50px]"
                    >
                        <button
                            onClick={handleClose}
                            className="flex justify-center w-10 h-10 items-center rounded-full  text-custom-bluegreen hover:bg-custombg"
                        >
                            ✕
                        </button>
                    </div>
                </div>
                {/* TODO: make this dynamic */}
                {/* <div className="w-full flex justify-center items-center h-12 bg-red-100 mb-4 rounded-lg">
                    <p className="flex text-[#C42E2E] ">Error message here</p>
                </div> */}
                <div className="pt-5 flex justify-center items-center mb-5 ">
                    <p className="montserrat-bold text-center text-custom-solidgreen ">
                        Add Property Details
                    </p>
                </div>
                <form>
                    <div className="flex flex-col gap-2">
                        {/*Property Name 
                        TODO: fix the placing of the select box
                        */}
                        <div className="flex items-center border border-custom-gray81 rounded-md overflow-hidden">
                            <span className="text-custom-bluegreen bg-custom-lightestgreen py-1.5 flex items-center w-3/4 -mr-3 pl-3  montserrat-semibold text-sm">
                                Property Name
                            </span>
                            <div className="relative w-full">
                                <select
                                    name="propertyName"
                                    className="appearance-none w-full px-4 py-1  focus:outline-none border-0"
                                    onChange={handleInputChange}
                                    value={formData.propertyName}
                                >
                                    <option value="">Select Property</option>
                                    {propertyNamesList.map((property) => (
                                        <option
                                            key={property.id}
                                            value={property.id}
                                        >
                                            {toLowerCaseText(property.name)}
                                        </option>
                                    ))}
                                </select>
                                <span className="absolute inset-y-0 right-0 text-custom-gray81 flex items-center pr-3 pl-3 bg-custom-grayFA pointer-events-none">
                                    <IoMdArrowDropdown />
                                </span>
                            </div>
                        </div>
                        {/* Type */}
                        <div className="flex items-center border border-custom-gray81 rounded-md overflow-hidden">
                            <span className="text-custom-bluegreen bg-custom-lightestgreen py-1.5  flex items-center w-3/4 -mr-3 pl-3   montserrat-semibold text-sm">
                                Type
                            </span>
                            <div className="relative w-full">
                                <select
                                    name="type"
                                    className="appearance-none w-full px-4 py-1 bg-white focus:outline-none border-0"
                                    onChange={handleInputChange}
                                    value={formData.type}
                                >
                                    <option value="">Select Type</option>
                                    <option value="Vertical">Vertical</option>
                                    <option value="Horizontal">
                                        Horizontal
                                    </option>
                                </select>
                                <span className="absolute inset-y-0 right-0 text-custom-gray81 flex items-center pr-3 pl-3 bg-custom-grayFA pointer-events-none">
                                    <IoMdArrowDropdown />
                                </span>
                            </div>
                        </div>

                        {/* Tower/Phase */}
                        <div className="flex items-center border border-custom-gray81 rounded-md overflow-hidden">
                            <span className="text-custom-bluegreen bg-custom-lightestgreen py-1.5  flex w-3/4 pl-3  montserrat-semibold  text-sm">
                                Tower/Phase
                            </span>
                            <CustomInput
                                name="towerPhase"
                                value={formData.towerPhase || ""}
                                className="w-full px-4 focus:outline-none"
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* tower_description */}
                        <div className="rounded-[5px] border-custom-gray81 border bg-custombg3">
                            <div className="flex items-center justify-between ">
                                <p className="text-custom-bluegreen bg-custom-lightestgreen py-[10px] lg:py-[12px] text-sm pl-3  montserrat-semibold flex-grow mobile:text-xs mobile:w-[170px] montserrat-semibold  rounded-tl-[5px]">
                                    Description
                                </p>
                                <span className="bg-white text-sm2 text-gray-400 font-normal py-3 border-l pl-2 pr-12 mobile:pr-1 mobile:text-xs ml-auto rounded-tr-[4px]">
                                    {" "}
                                    {formData.tower_description?.length || 0}
                                    /350 characters
                                </span>
                            </div>
                            <div className="flex gap-3 ">
                                <CustomInput
                                    type="textarea"
                                    id="tower_description"
                                    name="tower_description"
                                    value={formData.tower_description || ""}
                                    className="rounded-b-[5px] border-t w-full pl-2 outline-none"
                                    onChange={handleInputChange}
                                    rows="4"
                                    maxLength={350}
                                />
                            </div>
                        </div>

                        <div className="mt-2 flex justify-start items-center mb-5">
                            <p className="montserrat-bold">Address</p>
                        </div>

                        {/*Street/ Barangy */}
                        <div className="flex items-center border border-custom-gray81 rounded-md overflow-hidden">
                            <span className="text-custom-bluegreen bg-custom-lightestgreen py-1.5  flex w-3/4 pl-3  montserrat-semibold  text-sm">
                                Street/Barangay
                            </span>
                            <CustomInput
                                type="text"
                                name="barangay"
                                value={formData.barangay || ""}
                                className="w-full px-4 focus:outline-none"
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* City */}
                        <div className="flex items-center border border-custom-gray81 rounded-md overflow-hidden">
                            <span className="text-custom-bluegreen bg-custom-lightestgreen py-1.5  flex w-3/4 pl-3  montserrat-semibold text-sm">
                                City
                            </span>
                            <CustomInput
                                type="text"
                                name="city"
                                value={formData.city || ""}
                                className="w-full px-4 focus:outline-none"
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* Province */}
                        <div className="flex items-center border border-custom-gray81 rounded-md overflow-hidden">
                            <span className="text-custom-bluegreen bg-custom-lightestgreen py-1.5  flex w-3/4 pl-3 montserrat-semibold  text-sm">
                                Province
                            </span>
                            <CustomInput
                                type="text"
                                name="province"
                                value={formData.province || ""}
                                className="w-full px-4 focus:outline-none"
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* Country */}
                        <div className="flex items-center border border-custom-gray81 rounded-md overflow-hidden">
                            <span className="text-custom-bluegreen bg-custom-lightestgreen py-1.5  flex w-3/4 pl-3   montserrat-semibold  text-sm">
                                Country
                            </span>
                            <CustomInput
                                type="text"
                                name="country"
                                value={formData.country || ""}
                                className="w-full px-4 focus:outline-none"
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* Google Map Link */}
                        <div className="rounded-[5px] border-custom-gray81 border bg-custombg3">
                            <div className="flex items-center justify-between">
                                <p className="text-custom-bluegreen bg-custom-lightestgreen py-1.5  pl-3  montserrat-semibold flex-grow mobile:text-xs mobile:w-[170px]  rounded-t-md">
                                    Google Map Link
                                </p>
                                {/* <span className="bg-white text-sm2 text-gray-400 font-normal py-3 border-l   pl-2 pr-12 mobile:pr-1 mobile:text-xs ml-auto rounded-tr-[4px]">
                                    {" "}
                                    {formData.google_map_link?.length}/350
                                    characters
                                </span> */}
                            </div>
                            <div className="flex gap-3 ">
                                <CustomInput
                                    type="textarea"
                                    id="google_map_link"
                                    name="google_map_link"
                                    value={formData.google_map_link || ""}
                                    className={` rounded-b-[5px] border-t w-full pl-2 outline-none`}
                                    onChange={handleInputChange}
                                    rows="4"
                                />
                            </div>
                        </div>

                        {/* Button */}
                        <div className="flex justify-center my-3">
                            <button
                                className={`w-[173px] h-[37px] text-white montserrat-semibold text-sm gradient-btn rounded-[10px] hover:shadow-custom4 ${
                                    isLoading || isPropertyButtonDisabled
                                        ? "cursor-not-allowed opacity-50"
                                        : ""
                                }`}
                                onClick={(e) => handleSubmit(e, "Draft")}
                                disabled={isPropertyButtonDisabled || isLoading}
                            >
                                {isLoading ? (
                                    <CircularProgress className="spinnerSize" />
                                ) : (
                                    <> Create Pricing Draft</>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </dialog>
    );
};

export default AddPropertyModal;

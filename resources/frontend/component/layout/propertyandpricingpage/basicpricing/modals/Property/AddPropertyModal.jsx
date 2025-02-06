import React, { useState, useEffect } from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import { isButtonDisabled } from "@/component/layout/propertyandpricingpage/basicpricing/modals/Property/utils/isButtonDisabled";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import { useStateContext } from "@/context/contextprovider";
import { showToast } from "@/util/toastUtil";
import { propertyMasterService } from "@/component/servicesApi/apiCalls/propertyPricing/property/propertyMasterService";
import { usePriceListMaster } from "@/context/PropertyPricing/PriceListMasterContext";
import { usePropertyNamesWithIds } from "@/component/layout/propertyandpricingpage/hooks/usePropertyNamesWithIds";

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

const AddPropertyModal = ({ propertyModalRef }) => {
    //State
    const { user } = useStateContext();
    const [formData, setFormData] = useState(formDataState);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { propertyNamesList, fetchPropertyNamesWithIds } =
        usePropertyNamesWithIds();
    const { fetchPropertyListMasters } = usePriceListMaster();

    //Hooks
    useEffect(() => {
        fetchPropertyNamesWithIds();
    }, []);

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
            console.log("response 67 AddPropertyModal", response);
            const towerPhaseId = response?.data?.data?.tower_phases[0]?.id;
            const propertyData = response?.data;

            if (response.status === 201) {
                showToast("Data added successfully!", "success");
                setFormData(formDataState);
                await fetchPropertyListMasters(true, false);

                if (propertyModalRef.current) {
                    propertyModalRef.current.close();
                }

                navigate(`/property-pricing/basic-pricing/${towerPhaseId}`, {
                    state: { data: propertyData },
                });
            }
        } catch (error) {
            console.log("Error saving property master data:", error);
        } finally {
            setIsLoading(false);
        }
        // if (
        //     formData.propertyName === "" ||
        //     formData.towerPhase === "" ||
        //     formData.type === ""
        // ) {

        //     alert("Please fill all the fields");
        //     return;
        // }
        // try {
        //     setLoading(true);

        //     form.append("propertyName", formData.propertyName);
        //     form.append("towerPhase", formData.towerPhase);
        //     form.append("type", formData.type);
        //     form.append("status", status);

        //     const response = await apiService.post("property-details", form, {
        //         headers: {
        //             "Content-Type": "application/json",
        //         },
        //     });
        //     const propertyId = response?.data?.propertyData?.propertyMaster?.id;
        //     const passData = response?.data;
        //     alert(response.data.message);

        //     if (propertyModalRef.current) {
        //         propertyModalRef.current.close();
        //     }
        //     setFormData(formDataState);
        //     setFloorPremiumsAccordionOpen(false);
        //     navigate(`/propertyandpricing/basicpricing/${propertyId}`, {
        //         state: { passPropertyDetails: passData },
        //     });
        // } catch (error) {
        //     console.log("Error sending property details", error);
        // } finally {
        //     setLoading(false);
        // }
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
                <div className="w-full flex justify-center items-center h-12 bg-red-100 mb-4 rounded-lg">
                    <p className="flex text-[#C42E2E] ">
                        {/* TODO: make this dynamic */}
                        Error message here
                    </p>
                </div>
                <div className="pt-5 flex justify-start items-center mb-5">
                    <p className="montserrat-bold">Add Property Details</p>
                </div>
                <form>
                    <div className="flex flex-col gap-2">
                        {/* <div className="flex items-center border border-custom-gray81 rounded-md overflow-hidden">
                            <span className="text-custom-gray81 bg-custombg3 flex w-3/4 pl-3 py-1 montserrat-semibold text-sm">
                                Property Name
                            </span>
                            <input
                                name="propertyName"
                                type="text"
                                onChange={handleInputChange}
                                value={formData.propertyName}
                                className="w-full px-4 focus:outline-none"
                                placeholder=""
                            />
                        </div> */}

                        {/*Property Name 
                        TODO: fix the placing of the select box
                        */}
                        <div className="flex items-center border border-custom-gray81 rounded-md overflow-hidden">
                            <span className="text-custom-gray81 bg-custombg3 flex items-center w-3/4 -mr-3 pl-3 py-1 montserrat-semibold text-sm">
                                Property Name
                            </span>
                            <div className="relative w-full">
                                <select
                                    name="propertyName"
                                    className="appearance-none w-full px-4 py-1 bg-white focus:outline-none border-0"
                                    onChange={handleInputChange}
                                    value={formData.propertyName}
                                >
                                    <option value="">Select Property</option>
                                    {propertyNamesList.map((property) => (
                                        <option
                                            key={property.id}
                                            value={property.id}
                                        >
                                            {property.name}
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
                            <span className="text-custom-gray81 bg-custombg3 flex items-center w-3/4 -mr-3 pl-3 py-1 montserrat-semibold text-sm">
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
                            <span className="text-custom-gray81 bg-custombg3 flex w-3/4 pl-3 py-1 montserrat-semibold  text-sm">
                                Tower/Phase
                            </span>
                            <input
                                name="towerPhase"
                                type="string"
                                className="w-full px-4 focus:outline-none"
                                placeholder=""
                                onChange={handleInputChange}
                                value={formData.towerPhase}
                            />
                        </div>

                        {/* tower_description */}
                        <div className="rounded-[5px] border-custom-gray81 border bg-custombg3">
                            <div className="flex items-center justify-between">
                                <p className="text-custom-gray81 text-sm bg-custombg3 pl-3  montserrat-semibold flex-grow mobile:text-xs mobile:w-[170px] montserrat-semibold">
                                    Description
                                </p>
                                <span className="bg-white text-sm2 text-gray-400 font-normal py-3 border-l   pl-2 pr-12 mobile:pr-1 mobile:text-xs ml-auto rounded-tr-[4px]">
                                    {" "}
                                    {formData.tower_description?.length || 0}
                                    /350 characters
                                </span>
                            </div>
                            <div className="flex gap-3 ">
                                <textarea
                                    id="tower_description"
                                    name="tower_description"
                                    placeholder=""
                                    value={formData.tower_description}
                                    rows="4"
                                    onChange={handleInputChange}
                                    maxLength={350}
                                    className={`rounded-b-[5px] border-t w-full pl-2 outline-none`}
                                />
                            </div>
                        </div>

                        <div className="mt-2 flex justify-start items-center mb-5">
                            <p className="montserrat-bold">Address</p>
                        </div>

                        {/*Street/ Barangy */}
                        <div className="flex items-center border border-custom-gray81 rounded-md overflow-hidden">
                            <span className="text-custom-gray81 bg-custombg3 flex w-3/4 pl-3 py-1 montserrat-semibold  text-sm">
                                Street/Barangay
                            </span>
                            <input
                                name="barangay"
                                type="text"
                                onChange={handleInputChange}
                                value={formData.barangay}
                                className="w-full px-4 focus:outline-none"
                                placeholder=""
                            />
                        </div>

                        {/* City */}
                        <div className="flex items-center border border-custom-gray81 rounded-md overflow-hidden">
                            <span className="text-custom-gray81 bg-custombg3 flex w-3/4 pl-3 py-1 montserrat-semibold text-sm">
                                City
                            </span>
                            <input
                                name="city"
                                type="text"
                                onChange={handleInputChange}
                                value={formData.city}
                                className="w-full px-4 focus:outline-none"
                                placeholder=""
                            />
                        </div>

                        {/* Province */}
                        <div className="flex items-center border border-custom-gray81 rounded-md overflow-hidden">
                            <span className="text-custom-gray81 bg-custombg3 flex w-3/4 pl-3 py-1 montserrat-semibold  text-sm">
                                Province
                            </span>
                            <input
                                name="province"
                                type="text"
                                onChange={handleInputChange}
                                value={formData.province}
                                className="w-full px-4 focus:outline-none"
                                placeholder=""
                            />
                        </div>

                        {/* Country */}
                        <div className="flex items-center border border-custom-gray81 rounded-md overflow-hidden">
                            <span className="text-custom-gray81 bg-custombg3 flex w-3/4 pl-3 py-1 montserrat-semibold  text-sm">
                                Country
                            </span>
                            <input
                                name="country"
                                type="text"
                                onChange={handleInputChange}
                                value={formData.country}
                                className="w-full px-4 focus:outline-none"
                                placeholder=""
                            />
                        </div>

                        {/* Google Map Link */}
                        <div className="rounded-[5px] border-custom-gray81 border bg-custombg3">
                            <div className="flex items-center justify-between">
                                <p className="text-custom-gray81 text-sm bg-custombg3 pl-3  montserrat-semibold flex-grow mobile:text-xs mobile:w-[170px]">
                                    Google Map Link
                                </p>
                                <span className="bg-white text-sm2 text-gray-400 font-normal py-3 border-l   pl-2 pr-12 mobile:pr-1 mobile:text-xs ml-auto rounded-tr-[4px]">
                                    {" "}
                                    {formData.google_map_link?.length}/350
                                    characters
                                </span>
                            </div>
                            <div className="flex gap-3 ">
                                <textarea
                                    id="google_map_link"
                                    value={formData.google_map_link}
                                    name="google_map_link"
                                    placeholder=""
                                    onChange={handleInputChange}
                                    maxLength={350}
                                    rows="4"
                                    className={` rounded-b-[5px] border-t w-full pl-2 outline-none`}
                                />
                            </div>
                        </div>

                        {/* Button */}
                        <div className="flex justify-center my-3">
                            <button
                                className={`w-[173px] h-[37px] text-white montserrat-semibold text-sm gradient-btn rounded-[10px] hover:shadow-custom4 ${
                                    isLoading || isButtonDisabled(formData)
                                        ? "cursor-not-allowed opacity-50"
                                        : ""
                                }`}
                                onClick={(e) => handleSubmit(e, "Draft")}
                                disabled={
                                    isButtonDisabled(formData) || isLoading
                                }
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

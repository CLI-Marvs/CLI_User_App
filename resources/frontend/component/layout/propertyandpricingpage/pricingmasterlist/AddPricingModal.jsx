import React, { useRef, useState } from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import apiService from "../../../servicesApi/apiService";
import { useNavigate } from "react-router-dom";


const formDataState = {
    propertyName: "",
    type: "",
    towerPhase: "",
};


const AddPricingModal = ({ modalRef }) => {
    //States
    const [formData, setFormData] = useState(formDataState);
    const navigate = useNavigate();


    //Event Handler
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    
    const handleSubmit = async (e, status) => {
        e.preventDefault();
        const form = new FormData();
        try {
            // Append form data
            form.append("propertyName", formData.propertyName);
            form.append("towerPhase", formData.towerPhase);
            form.append("type", formData.type);
            // API call
            const response = await apiService.post("property-details", form, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            const passData = response.data.propertyData;

            //alert(response.data.message);
            //Close modal and call callback handler
            if (modalRef.current) {
                modalRef.current.close();
            }
            setFormData(formDataState);
            navigate("/propertyandpricing/basicpricing", {
                state: { passPropertyDetails: passData },
            }); //navigate to Basic pricing components   with the property detail data as props
        } catch (error) {
            console.log("Error sending property details", error);
        }
    };
    return (
        <dialog
            className="modal w-[475px] h-[330px] rounded-lg backdrop:bg-black/50"
            ref={modalRef}
        >
            <div className=" px-14 mb-5 rounded-lg">
                <div className="">
                    <form
                        method="dialog"
                        className="pt-2 flex justify-end -mr-[50px]"
                    >
                        <button className="flex justify-center w-10 h-10 items-center rounded-full  text-custom-bluegreen hover:bg-custombg">
                            ✕
                        </button>
                    </form>
                </div>
                <div className="pt-5 flex justify-start items-center mb-5">
                    <p className="montserrat-bold">Add Property Details</p>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center border border-custom-grayF1 rounded-md overflow-hidden">
                        <span className="text-custom-gray81 bg-custom-grayFA flex w-3/4 pl-3 py-1 text-sm">
                            Property Name
                        </span>
                        <input
                            name="propertyName"
                            type="text"
                            onChange={handleChange}
                            value={formData.propertyName}
                            className="w-full px-4 focus:outline-none"
                            placeholder=""
                        />
                    </div>
                    <div className="flex items-center border border-custom-grayF1 rounded-md overflow-hidden">
                        <span className="text-custom-gray81 bg-custom-grayFA flex items-center w-3/4 -mr-3 pl-3 py-1 text-sm">
                            Type
                        </span>
                        <div className="relative w-full">
                            <select
                                name="type"
                                className="appearance-none w-full px-4 py-1 bg-white text-sm focus:outline-none border-0"
                                onChange={handleChange}
                                value={formData.propertyName}
                            >
                                <option value="">Select Type</option>
                                <option value="Type 1">Type 1</option>
                                <option value="Type 2">Type 2</option>
                                <option value="Type 3">Type 3</option>
                            </select>
                            <span className="absolute inset-y-0 right-0 flex items-center text-custom-gray81 pr-3 pl-3 bg-custom-grayFA pointer-events-none">
                                <IoMdArrowDropdown />
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center border border-custom-grayF1 rounded-md overflow-hidden">
                        <span className="text-custom-gray81 bg-custom-grayFA flex w-3/4 pl-3 py-1 text-sm">
                            Tower/Phase
                        </span>
                        <input
                            name="towerPhase"
                            type="text"
                            onChange={handleChange}
                            value={formData.towerPhase}
                            className="w-full px-4 focus:outline-none"
                            placeholder=""
                        />
                    </div>
                    <div className="flex justify-center my-3">
                        <button
                            className="w-[173px] h-[37px] text-white montserrat-semibold text-sm gradient-btn2 rounded-[10px] hover:shadow-custom4"
                            type="submit"
                            onClick={handleSubmit}
                        >
                            Create Pricing Draft
                        </button>
                    </div>
                </div>
            </div>
        </dialog>
    );
};

export default AddPricingModal;

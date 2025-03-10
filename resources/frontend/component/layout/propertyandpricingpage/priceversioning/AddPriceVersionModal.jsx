import React, { useState, useCallback } from "react";
import { FaPray, FaRegCalendar } from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";
import { MdFormatListBulletedAdd } from "react-icons/md";
import { useProperty } from "@/context/PropertyPricing/PropertyContext";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { priceVersionService } from "@/component/servicesApi/apiCalls/propertyPricing/priceVersion/priceVersionService";
import { showToast } from "@/util/toastUtil";
import { usePriceVersion } from "@/context/PropertyPricing/PriceVersionContext";
import CircularProgress from "@mui/material/CircularProgress";
import { IoIosCloseCircle } from "react-icons/io";
import { toLowerCaseText } from "@/component/layout/propertyandpricingpage/utils/formatToLowerCase";

const formDataState = {
    name: "",
    percent_increase: 0,
    no_of_allowed_buyers: 0,
    expiry_date: moment(new Date()).format("MM-DD-YYYY HH:mm:ss"),
};

const AddPriceVersionModal = ({ modalRef }) => {
    //States
    const { propertyNamesList } = useProperty();
    const [formData, setFormData] = useState([formDataState]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState("");
    const [selectedTowerPhase, setSelectedTowerPhase] = useState("");
    const { getPriceVersions } = usePriceVersion();

    //Event Handler
    //Handle change in the input field for price version
    const handlePriceVersionInputChange = (event, index) => {
        const { name, value } = event.target;
        const data = [...formData];
        data[index][name] = value;
        setFormData(data);
    };

    //Handle click to add  more version fields
    const handleAddFields = () => {
        setFormData([...formData, formDataState]);
    };

    //Handle remove the version fields
    const handleRemoveFields = (index) => {
        const data = [...formData];
        data.splice(index, 1);
        setFormData(data);
    };

    //Handle submit the form
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            const payload = {
                property_id: selectedProperty,
                tower_phase_id: selectedTowerPhase,
                price_version: formData,
            };

            const response = await priceVersionService.storePriceVersion(
                payload
            );

            if (response?.status === 201) {
                showToast(response?.data?.message, "success");
                setFormData([{ ...formDataState }]);
                setSelectedProperty("");
                setSelectedTowerPhase("");
                await getPriceVersions(true, false);

                if (modalRef.current) {
                    modalRef.current.close();
                }
            }
        } catch (error) {
            console.log("Error123", error.response);
            if (error.response.status === 422) {
                showToast(error.response.data.message, "error");
            }
        } finally {
            setIsLoading(false);
        }
    };

    //Handle date change
    const handleDateChange = (date, formIndex) => {
        setFormData((prevState) =>
            prevState.map((item, i) =>
                i === formIndex
                    ? {
                          ...item,
                          expiry_date: date
                              ? moment(date).format("MM-DD-YYYY HH:mm:ss")
                              : "N/A",
                      }
                    : item
            )
        );
    };

    //Handle close the modal
    const handleCloseModal = () => {
        if (modalRef.current) {
            setFormData([{ ...formDataState }]);
            setSelectedProperty("");
            setSelectedTowerPhase("");
            modalRef.current.close();
        }
    };

    //Utility function to handle button disable state
    const isButtonDisabled = useCallback(
        (formDataArray) => {
            if (!formDataArray?.length) return true; // Disable if array is empty

            const formData = formDataArray[0];

            return (
                formData.name.trim() === "" ||
                Number(formData.percent_increase) === 0 ||
                Number(formData.no_of_allowed_buyers) === 0 ||
                !selectedProperty ||
                !selectedTowerPhase
            );
        },
        [selectedProperty, selectedTowerPhase]
    );

    return (
        <dialog
            className="modal w-[700px] rounded-[10px] bg-custom-grayFA backdrop:bg-black/50"
            ref={modalRef}
        >
            <div className=" px-[50px] mb-5 rounded-lg">
                <div className="">
                    <div
                        method="dialog"
                        className="pt-3 flex justify-end -mr-[40px]"
                    >
                        <button
                            type="button"
                            className="flex justify-center w-10 h-10 items-center rounded-full bg-custombg3 text-custom-bluegreen hover:bg-custombg"
                            onClick={handleCloseModal}
                        >
                            ✕
                        </button>
                    </div>
                </div>
                <div className="pt-5 flex justify-start items-center mb-5">
                    <p className="montserrat-bold">Add Property Details</p>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center w-[375px] border rounded-md overflow-hidden">
                        <span className="text-custom-gray81 bg-custombg flex items-center w-full -mr-3 pl-3 py-1 text-sm">
                            Property
                        </span>
                        <div className="relative w-full">
                            <select
                                name="property_id"
                                value={selectedProperty}
                                onChange={(event) =>
                                    setSelectedProperty(event.target.value)
                                }
                                className="appearance-none w-[144px] px-4 py-1 bg-white focus:outline-none border-0"
                            >
                                {/*TODO: Add Loading state "Retrieving properties..." */}
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
                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 bg-custombg text-custom-gray81 pointer-events-none">
                                <IoMdArrowDropdown />
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center h-[31px] w-[380px] border rounded-md text-sm overflow-hidden">
                        <span className="text-custom-gray81  bg-custombg flex w-full pl-3 py-1">
                            Tower/Phase
                        </span>
                        <input
                            name="tower_phase"
                            value={selectedTowerPhase}
                            type="text"
                            onChange={(event) =>
                                setSelectedTowerPhase(event.target.value)
                            }
                            className="w-[200px] px-4 focus:outline-none"
                            placeholder=""
                        />
                    </div>
                    <table className="">
                        <thead>
                            <tr className="h-[83px] flex gap-[30px] items-center text-custom-grayA5 montserrat-semibold text-sm">
                                <th className="rounded-tl-[10px] pl-[10px] w-[165px] text-left">
                                    Version
                                </th>
                                <th className="w-[100px] text-left pl-[10px] pr-10 leading-[18px]">
                                    Percent Increase
                                </th>
                                <th className="w-[100px] text-left pl-[10px] pr-10 leading-[18px]">
                                    No. of allowed buyers
                                </th>
                                <th className="w-[100px]">Expiry Date</th>
                                <th className="rounded-tr-[10px] w-[62px]"></th>
                            </tr>
                        </thead>
                        <div className="shadow-custom5 rounded-[10px] overflow-hidden w-[600px]">
                            {formData.length > 0 &&
                                formData.map((form, index) => (
                                    <tbody className="" key={index}>
                                        <tr className="h-[66px] text-sm border-separate bg-white">
                                            <td className="px-[10px]">
                                                <input
                                                    type="text"
                                                    name="name"
                                                    className="pl-3  border border-custom-grayF1 rounded-[5px] h-[31px]"
                                                    value={form.name}
                                                    onChange={(event) =>
                                                        handlePriceVersionInputChange(
                                                            event,
                                                            index
                                                        )
                                                    }
                                                />
                                            </td>
                                            <td className="px-[10px]">
                                                <input
                                                    type="number"
                                                    name="percent_increase"
                                                    className="pl-3 w-[100px] border border-custom-grayF1 rounded-[5px] h-[31px]"
                                                    onChange={(event) =>
                                                        handlePriceVersionInputChange(
                                                            event,
                                                            index
                                                        )
                                                    }
                                                    value={
                                                        form.percent_increase
                                                    }
                                                />
                                            </td>
                                            <td className="px-[10px]">
                                                <input
                                                    type="text"
                                                    name="no_of_allowed_buyers"
                                                    className="pl-3 w-[80px] border border-custom-grayF1 rounded-[5px] h-[31px]"
                                                    onChange={(event) =>
                                                        handlePriceVersionInputChange(
                                                            event,
                                                            index
                                                        )
                                                    }
                                                    value={
                                                        form.no_of_allowed_buyers
                                                    }
                                                />
                                            </td>
                                            <td className="px-[10px] mt-4 flex items-center gap-x-2">
                                                <DatePicker
                                                    selected={
                                                        formData.expiry_date !==
                                                        "N/A"
                                                            ? moment(
                                                                  form.expiry_date,
                                                                  "MM-DD-YYYY HH:mm:ss"
                                                              ).toDate()
                                                            : null
                                                    }
                                                    onChange={(date) =>
                                                        handleDateChange(
                                                            date,
                                                            index
                                                        )
                                                    }
                                                    className="w-[100px] border border-custom-grayF1 rounded-[5px] h-[31px] pl-2"
                                                    name="expiry_date"
                                                    calendarClassName="custom-calendar"
                                                    placeholderText="N/A" // Display "N/A" when no date is selected
                                                />
                                                <span>
                                                    <td className="flex justify-between gap-2 items-center">
                                                        <FaRegCalendar className="size-5 text-custom-gray81 hover:text-red-500 mt-1" />
                                                        {formData &&
                                                            formData.length >
                                                                1 && (
                                                                <IoIosCloseCircle
                                                                    onClick={() =>
                                                                        handleRemoveFields(
                                                                            index
                                                                        )
                                                                    }
                                                                    className="text-custom-gray h-6 w-6 cursor-pointer hover:text-red-500 mt-1"
                                                                />
                                                            )}
                                                    </td>
                                                </span>
                                            </td>
                                        </tr>
                                    </tbody>
                                ))}

                            <div className="flex justify-center">
                                <button
                                    className="h-[24px] w-[235px] my-[15px] flex gap-[10px] justify-center items-center text-sm"
                                    onClick={handleAddFields}
                                >
                                    <span>Add</span>
                                    <span>
                                        <MdFormatListBulletedAdd className="h-[24px] w-[24px] text-[#5F6368]" />
                                    </span>
                                </button>
                            </div>
                        </div>
                    </table>
                    <div className="flex justify-center my-3">
                        <button
                            disabled={
                                isLoading || isButtonDisabled(formData ?? {})
                            }
                            className={`w-[129px] h-[37px] text-white montserrat-semibold text-sm gradient-btn2 rounded-[10px] hover:shadow-custom4 ${
                                isLoading || isButtonDisabled(formData ?? {})
                                    ? "cursor-not-allowed opacity-50"
                                    : ""
                            }`}
                            onClick={handleSubmit}
                        >
                            {isLoading ? (
                                <CircularProgress className="spinnerSize" />
                            ) : (
                                <>Save Versions</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </dialog>
    );
};

export default AddPriceVersionModal;

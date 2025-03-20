import React, { useState } from "react";
import { paymentSchemeService } from "@/component/servicesApi/apiCalls/propertyPricing/paymentScheme/paymentSchemeService";
import { showToast } from "@/util/toastUtil";
import CircularProgress from "@mui/material/CircularProgress";
import isButtonDisabled from "@/util/isFormButtonDisabled";
import { usePaymentScheme } from "@/context/PropertyPricing/PaymentSchemeContext";

const formDataState = {
    spot: "",
    paymentSchemeName: "",
    description: "",
    dpInstallment: "",
    noMonthsDP: "",
    discount: "",
    bankFinancing: "",
};

const AddPaymentSchemeModal = ({ modalRef, fetchData }) => {
    //State
    const [formData, setFormData] = useState(formDataState);
    const [isLoading, setIsLoading] = useState({});
    const { fetchPaymentSchemes } = usePaymentScheme();
    const isPaymentSchemeButtonDisabled = isButtonDisabled(
        formData,
        Object.keys(formDataState)
    );
    //Event Handler
    //Handle change in the input field
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    //Handle submit the form
    const handleSubmit = async (e, status) => {
        e.preventDefault();
        const payload = {
            payment_scheme_name: formData.paymentSchemeName,
            description: formData.description,
            spot: formData.spot,
            downpayment_installment: formData.dpInstallment,
            number_months_downpayment: formData.noMonthsDP,
            discount: formData.discount,
            bank_financing: formData.bankFinancing,
            status: status,
        };
        try {
            setIsLoading((prev) => ({ ...prev, [status]: true }));
            const response = await paymentSchemeService.storePaymentScheme(
                payload
            );
            if (response.status === 201) {
                showToast("Data added successfully!", "success");
                setFormData(formDataState);
                await fetchData(true, false);
                if (modalRef.current) {
                    modalRef.current.close();
                }
            }
        } catch (error) {
            console.log("Error saving payment scheme data:", error);
        } finally {
            setIsLoading((prev) => ({ ...prev, [status]: false }));
        }
    };

    //Handle close the modal and reset all state
    const handleClose = () => {
        if (modalRef.current) {
            setIsLoading({});
            setFormData(formDataState);
            modalRef.current.close();
        }
    };

    return (
        <dialog
            className="modal w-[475px] rounded-lg backdrop:bg-black/50"
            ref={modalRef}
        >
            <div className=" px-14 mb-5 rounded-lg">
                <div className="">
                    <div
                        method="dialog"
                        className="pt-2 flex justify-end -mr-[50px]"
                    >
                        <button
                            className="flex justify-center w-10 h-10 items-center rounded-full text-custom-bluegreen hover:bg-custombg3 "
                            onClick={handleClose}
                        >
                            ✕
                        </button>
                    </div>
                </div>
                {/* TODO: make this dynamic */}
                {/* <div className="w-full flex justify-center items-center h-12 bg-red-100 mb-4 rounded-lg">
                    <p className="flex text-[#C42E2E] ">Error message here</p>
                </div> */}
                <div className="pt-5 flex justify-start items-center mb-5">
                    <p className="montserrat-bold">Add Payment Scheme</p>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex items-center border border-custom-grayF1 rounded-md overflow-hidden">
                        <span className="text-custom-gray81 bg-custombg3  flex w-full text-sm font-semibold pl-3 py-1">
                            Payment Scheme
                        </span>
                        <input
                            name="paymentSchemeName"
                            type="text"
                            className="w-[200px]  px-4 focus:outline-none "
                            placeholder=""
                            onChange={handleChange}
                            value={formData.paymentSchemeName}
                        />
                    </div>
                    <div
                        className={`border-custom-grayF1 rounded-[5px] bg-custombg3  border`}
                    >
                        <div className="flex items-center justify-between ">
                            <p className="text-custom-gray81 text-sm bg-custombg3  pl-3  font-semibold flex-grow">
                                Description
                            </p>
                            <span className="bg-white text-sm2 text-custom-gray81 font-normal py-3 border border-custom-grayF1 pl-2 pr-12 ml-auto rounded-r-[4px]">
                                {" "}
                                {formData.description?.length || 0}/350
                                characters
                            </span>
                        </div>
                        <div className="flex gap-3 ">
                            <textarea
                                id="description"
                                value={formData.description}
                                onChange={handleChange}
                                maxLength={350}
                                name="description"
                                placeholder="Write your concern here."
                                rows="4"
                                className={`block border-t-1  rounded-[5px] h-40 p-2.5 w-full text-sm  bg-white border-custom-grayF1 outline-none selection:`}
                            ></textarea>
                        </div>
                    </div>
                    <div className="flex items-center border border-custom-grayF1 rounded-md overflow-hidden">
                        <span className="text-custom-gray81 text-sm font-semibold  bg-custombg3  flex w-full pl-3 py-1">
                            Spot %
                        </span>
                        <input
                            name="spot"
                            value={formData.spot}
                            onChange={handleChange}
                            className="w-[200px] px-4 focus:outline-none"
                            onInput={(e) =>
                                (e.target.value = e.target.value.replace(
                                    /[^0-9]/g,
                                    ""
                                ))
                            }
                        />
                    </div>
                    <div className="flex items-center border border-custom-grayF1 rounded-md overflow-hidden">
                        <span className="text-custom-gray81 text-sm font-semibold  bg-custombg3  flex w-full pl-3 py-1">
                            DP Installment %
                        </span>
                        <input
                            name="dpInstallment"
                            value={formData.dpInstallment}
                            onChange={handleChange}
                            className="w-[200px] px-4 focus:outline-none"
                            onInput={(e) =>
                                (e.target.value = e.target.value.replace(
                                    /[^0-9]/g,
                                    ""
                                ))
                            }
                        />
                    </div>
                    <div className="flex items-center border border-custom-grayF1 rounded-md overflow-hidden">
                        <span className="text-custom-gray81   text-sm font-semibold  bg-custombg3  flex w-full pl-3 py-1">
                            No. Months (DP)
                        </span>
                        <input
                            value={formData.noMonthsDP}
                            name="noMonthsDP"
                            onChange={handleChange}
                            className="w-[200px] px-4 focus:outline-none"
                            onInput={(e) =>
                                (e.target.value = e.target.value.replace(
                                    /[^0-9]/g,
                                    ""
                                ))
                            }
                        />
                    </div>
                    <div className="flex items-center border border-custom-grayF1 rounded-md overflow-hidden">
                        <span className="text-custom-gray81 text-sm font-semibold  bg-custombg3  flex w-full pl-3 py-1">
                            Bank Financing %
                        </span>
                        <input
                            name="bankFinancing"
                            value={formData.bankFinancing}
                            onChange={handleChange}
                            className="w-[200px] px-4 focus:outline-none"
                            onInput={(e) =>
                                (e.target.value = e.target.value.replace(
                                    /[^0-9]/g,
                                    ""
                                ))
                            }
                        />
                    </div>
                    <div className="flex items-center border border-custom-grayF1 rounded-md overflow-hidden">
                        <span className="text-custom-gray81 text-sm font-semibold  bg-custombg3  flex w-full pl-3 py-1">
                            Discount %
                        </span>
                        <input
                            name="discount"
                            value={formData.discount}
                            onChange={handleChange}
                            className="w-[200px] px-4 focus:outline-none"
                            onInput={(e) =>
                                (e.target.value = e.target.value.replace(
                                    /[^0-9]/g,
                                    ""
                                ))
                            }
                        />
                    </div>
                    {/* <div className="flex items-center border border-custom-grayF1 rounded-md overflow-hidden">
                        <span className="text-custom-gray81 text-sm font-semibold  bg-custombg3  flex items-center w-full -mr-3 pl-3 py-1">
                            Discounted From
                        </span>
                        <div className="relative w-full">
                            <select
                                name="discountedFromSelect"
                                className="appearance-none w-[200px] px-4 py-1 bg-white focus:outline-none border-0"
                            >
                                <option value=""></option>
                                <option value="concern1">Type 1</option>
                                <option value="concern2">Type 2</option>
                                <option value="concern3">Type 3</option>
                            </select>
                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 bg-custombg3  pointer-events-none">
                                <IoMdArrowDropdown className="text-custom-gray81" />
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center border border-custom-grayF1 rounded-md overflow-hidden">
                        <span className="text-custom-gray81 text-sm font-semibold  bg-custombg3  flex w-full pl-3 py-1">
                            Discounted From %
                        </span>
                        <input
                            name="discountedFrom"
                            type="text"
                            className="w-[200px] px-4 focus:outline-none"
                            placeholder=""
                        />
                    </div> */}
                    <div className="flex justify-center gap-[10px] my-3">
                        <button
                            className={`w-[173px] h-[37px] text-white montserrat-semibold text-sm gradient-btn2 rounded-[10px] hover:shadow-custom4  ${
                                isPaymentSchemeButtonDisabled ||
                                isLoading["On-going Approval"]
                                    ? "cursor-not-allowed opacity-50"
                                    : ""
                            }`}
                            disabled={
                                isPaymentSchemeButtonDisabled ||
                                isLoading["On-going Approval"]
                            }
                            type="submit"
                            onClick={(e) =>
                                handleSubmit(e, "On-going Approval")
                            }
                        >
                            <div className="flex justify-center items-center h-full w-full rounded-[8px]">
                                {isLoading["On-going Approval"] ? (
                                    <CircularProgress className="spinnerSize" />
                                ) : (
                                    <> Submit for Approval </>
                                )}
                            </div>
                        </button>

                        <button
                            className={`h-[37px] w-[117px] rounded-[10px] text-custom-solidgreen montserrat-semibold text-sm gradient-btn2 hover:shadow-custom4 p-[3px] 
                                ${
                                    isPaymentSchemeButtonDisabled ||
                                    isLoading["Draft"]
                                        ? "cursor-not-allowed opacity-50"
                                        : ""
                                }`}
                            disabled={
                                isPaymentSchemeButtonDisabled ||
                                isLoading["Draft"]
                            }
                            type="submit"
                            onClick={(e) => handleSubmit(e, "Draft")}
                        >
                            <div className="flex justify-center items-center h-full w-full rounded-[8px] bg-white">
                                {isLoading["Draft"] ? (
                                    <CircularProgress className="spinnerSize" />
                                ) : (
                                    <>Save as Draft</>
                                )}
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </dialog>
    );
};

export default AddPaymentSchemeModal;

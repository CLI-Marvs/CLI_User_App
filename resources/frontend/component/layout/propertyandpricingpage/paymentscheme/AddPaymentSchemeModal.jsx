import React, { useState } from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import apiService from "../../../servicesApi/apiService";

const formDataState = {
    status: "",
    spot: "",
    paymentSchemeName: "",
    details_message: "",
    dpInstallment: "",
    noMonthsDP: "",
    discount: "",
    bankFinancing: "",
};
const AddPaymentSchemeModal = ({ modalRef }) => {
    //State
    // const [message, setMessage] = useState("");
    const maxCharacters = 350;
    const [formData, setFormData] = useState(formDataState);

    //event handler
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
            form.append("paymentScheme", formData.paymentSchemeName);
            form.append("status", status);
            form.append("spot", formData.spot);
            form.append("details_message", formData.details_message);
            form.append("dpInstallment", formData.dpInstallment);
            form.append("noMonthsDP", formData.noMonthsDP);
            form.append("bankFinancing", formData.bankFinancing);
            form.append("discount", formData.discount);
            // API call
            const response = await apiService.post("payment-schemes", form, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            alert(response.data.message);
            //Close modal and call callback handler
            if (modalRef.current) {
                modalRef.current.close();
            }
            setFormData(formDataState);
        } catch (error) {
            console.log("Error sending payment scheme data", error);
        }
    };

    return (
        <dialog
            className="modal w-[475px] rounded-lg backdrop:bg-black/50"
            ref={modalRef}
        >
            <div className=" px-14 mb-5 rounded-lg">
                <div className="">
                    <form
                        method="dialog"
                        className="pt-2 flex justify-end -mr-[50px]"
                    >
                        <button className="flex justify-center w-10 h-10 items-center rounded-full text-custom-bluegreen hover:bg-custom-grayFA">
                            ✕
                        </button>
                    </form>
                </div>
                <div className="pt-5 flex justify-start items-center mb-5">
                    <p className="montserrat-bold">Add Payment Scheme</p>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex items-center border border-custom-grayF1 rounded-md overflow-hidden">
                        <span className="text-custom-gray81 bg-custom-grayFA flex w-full text-sm font-semibold pl-3 py-1">
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
                        className={`border-custom-grayF1 rounded-[5px] bg-custom-grayFA border`}
                    >
                        <div className="flex items-center justify-between ">
                            <p className="text-custom-gray81 text-sm bg-custom-grayFA pl-3  font-semibold flex-grow">
                                Description
                            </p>
                            <span className="bg-white text-sm2 text-custom-gray81 font-normal py-3 border border-custom-grayF1 pl-2 pr-12 ml-auto rounded-r-[4px]">
                                {" "}
                                {formData.details_message.length}/350 characters
                            </span>
                        </div>
                        <div className="flex gap-3 ">
                            <textarea
                                id="details_message"
                                value={formData.details_message}
                                onChange={handleChange}
                                maxLength={maxCharacters}
                                name="details_message"
                                placeholder="Write your concern here."
                                rows="4"
                                className={`block border-t-1  rounded-[5px] h-40 p-2.5 w-full text-sm text-custom-gray81 bg-white border-custom-grayF1`}
                            ></textarea>
                        </div>
                    </div>
                    <div className="flex items-center border border-custom-grayF1 rounded-md overflow-hidden">
                        <span className="text-custom-gray81 text-sm font-semibold  bg-custom-grayFA flex w-full pl-3 py-1">
                            Spot %
                        </span>
                        <input
                            name="spot"
                            type="text"
                            value={formData.spot}
                            onChange={handleChange}
                            className="w-[200px] px-4 focus:outline-none"
                            placeholder=""
                        />
                    </div>
                    <div className="flex items-center border border-custom-grayF1 rounded-md overflow-hidden">
                        <span className="text-custom-gray81 text-sm font-semibold  bg-custom-grayFA flex w-full pl-3 py-1">
                            DP Installment %
                        </span>
                        <input
                            name="dpInstallment"
                            value={formData.dpInstallment}
                            onChange={handleChange}
                            type="text"
                            className="w-[200px] px-4 focus:outline-none"
                            placeholder=""
                        />
                    </div>
                    <div className="flex items-center border border-custom-grayF1 rounded-md overflow-hidden">
                        <span className="text-custom-gray81   text-sm font-semibold  bg-custom-grayFA flex w-full pl-3 py-1">
                            No. Months (DP)
                        </span>
                        <input
                            value={formData.noMonthsDP}
                            name="noMonthsDP"
                            type="text"
                            onChange={handleChange}
                            className="w-[200px] px-4 focus:outline-none"
                            placeholder=""
                        />
                    </div>
                    <div className="flex items-center border border-custom-grayF1 rounded-md overflow-hidden">
                        <span className="text-custom-gray81 text-sm font-semibold  bg-custom-grayFA flex w-full pl-3 py-1">
                            Bank Financing %
                        </span>
                        <input
                            name="bankFinancing"
                            type="text"
                            value={formData.bankFinancing}
                            onChange={handleChange}
                            className="w-[200px] px-4 focus:outline-none"
                            placeholder=""
                        />
                    </div>
                    <div className="flex items-center border border-custom-grayF1 rounded-md overflow-hidden">
                        <span className="text-custom-gray81 text-sm font-semibold  bg-custom-grayFA flex w-full pl-3 py-1">
                            Discount %
                        </span>
                        <input
                            name="discount"
                            value={formData.discount}
                            type="text"
                            onChange={handleChange}
                            className="w-[200px] px-4 focus:outline-none"
                            placeholder=""
                        />
                    </div>
                    <div className="flex items-center border border-custom-grayF1 rounded-md overflow-hidden">
                        <span className="text-custom-gray81 text-sm font-semibold  bg-custom-grayFA flex items-center w-full -mr-3 pl-3 py-1">
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
                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 bg-custom-grayFA pointer-events-none">
                                <IoMdArrowDropdown className="text-custom-gray81" />
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center border border-custom-grayF1 rounded-md overflow-hidden">
                        <span className="text-custom-gray81 text-sm font-semibold  bg-custom-grayFA flex w-full pl-3 py-1">
                            Discounted From %
                        </span>
                        <input
                            name="discountedFrom"
                            type="text"
                            className="w-[200px] px-4 focus:outline-none"
                            placeholder=""
                        />
                    </div>
                    <div className="flex justify-center gap-[10px] my-3">
                        <button
                            className="w-[173px] h-[37px] text-white montserrat-semibold text-sm gradient-btn2 rounded-[10px] hover:shadow-custom4"
                            type="submit"
                            onClick={(e) =>
                                handleSubmit(e, "On-going Approval")
                            }
                        >
                            Submit for Approval
                        </button>

                        <button
                            className="h-[37px] w-[117px] rounded-[10px] text-custom-solidgreen montserrat-semibold text-sm gradient-btn2 hover:shadow-custom4 p-[3px]"
                            type="submit"
                            onClick={(e) => handleSubmit(e, "Draft")}
                        >
                            <div className="flex justify-center items-center h-full w-full rounded-[8px] bg-white">
                                Save as Draft
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </dialog>
    );
};

export default AddPaymentSchemeModal;

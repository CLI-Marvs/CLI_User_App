import React, { useState, useEffect } from "react";
import { settings } from "@/component/servicesApi/apiCalls/markupSettings/settings";
import { showToast } from "@/util/toastUtil";
import usePagination from "@/hooks/usePagination";
import { useTransactionContext } from "@/context/Transaction/TransactionContext";
import Spinner from "@/util/Spinner";
import CustomInput from "@/component/Input/CustomInput";

const MarkupSettingModal = ({
    settingsRef,
    fields,
    type,
    selectedData = null,
    refetchData,
}) => {
    const [formData, setFormData] = useState({
        payment_method: "",
        markup_details: {
            local: {
                pti_bank_rate_percent: "",
                pti_bank_fixed_amount: "",
                cli_markup: "",
            },
            international: {
                pti_bank_rate_percent: "",
                pti_bank_fixed_amount: "",
                cli_markup: "",
            },
        },
    });
    const [validationErrors, setValidationErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (type === "update" && selectedData) {
            setFormData(selectedData);
        }

        if (type === "store") {
            resetFields();
        }
    }, [type, selectedData]);

    const handleCloseModal = () => {
        if (type === "store") {
            resetFields();
        }
        if (settingsRef.current) {
            settingsRef.current.close();
            setValidationErrors({});
        }
    };

    const resetFields = () => {
        setFormData({
            payment_method: "",
            markup_details: {
                local: {
                    pti_bank_rate_percent: "",
                    pti_bank_fixed_amount: "",
                    cli_markup: "",
                },
                international: {
                    pti_bank_rate_percent: "",
                    pti_bank_fixed_amount: "",
                    cli_markup: "",
                },
            },
        });
    };

    const getInputType = (name) => {
        const numericFields = [
            "pti_bank_rate_percent",
            "pti_bank_fixed_amount",
            "cli_markup",
        ];
        return numericFields.includes(name) ? "number" : "text";
    };

    const handleNestedChange = (e, region = null, field = null) => {
        const { name, value } = e.target;

        if (region && field) {
            setFormData((prev) => ({
                ...prev,
                markup_details: {
                    ...prev.markup_details,
                    [region]: {
                        ...prev.markup_details[region],
                        [field]: value,
                    },
                },
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const validateFields = () => {
        const errors = {};
    
        for (let field of fields) {
            let value;
    
            if (field.name === "payment_method") {
                value = formData.payment_method;
            } else {
                value = formData.markup_details.local[field.name];
            }
    
            if (value === "" || value === null || value === undefined) {
                errors[field.name] = [`${field.label} is required.`];
            }
        }
    
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };
    

    const handleSave = async () => {
        let response = null;
        setIsLoading(true);
        if (!validateFields()) {
            setIsLoading(false);
            return;
        }
        try {
            if (type === "store") {
                response = await settings.storeSettings(formData);
                showToast("Markup settings saved successfully", "success");
            } else {
                response = await settings.updateSettings(formData);
                showToast("Markup settings updated successfully", "success");
            }

            if (response.data.success && settingsRef.current) {
                settingsRef.current.close();

                if (type === "store") {
                    resetFields();
                }
                if (typeof refetchData === "function") {
                    refetchData();
                }
            }
        } catch (error) {
            resetFields();
            setIsLoading(false);
        } finally {
            setIsLoading(false);
            resetFields();
        }
    };

    return (
        <dialog
            className="modal w-[669px] rounded-[10px] shadow-custom5 backdrop:bg-black/50 outline-none transaction-scrollbar"
            ref={settingsRef}
        >
            <div
                className="bg-white rounded-full absolute top-2 right-5 h-6 w-6 shadow-md flex justify-center cursor-pointer"
                onClick={handleCloseModal}
            >
                <span>X</span>
            </div>
            <div className="bg-custombg3 w-auto h-auto px-5 py-5 rounded-[10px]">
                <div className="bg-white py-[20px] px-[35px] rounded-[10px]">
                    {/* Payment Method Field (above the header row) */}
                    <div className="grid grid-cols-3 items-center gap-4 mb-3">
                        <span className="font-semibold">Payment Method</span>
                        <div className="flex flex-col">
                            <CustomInput
                                type={getInputType("payment_method")}
                                name="payment_method"
                                value={formData["payment_method"]}
                                onChange={handleNestedChange}
                                className={`border border-gray-300 rounded-[5px] p-2 w-full ${
                                    type === "update"
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                }`}
                                disabled={type === "update"}
                            />
                            {validationErrors["payment_method"] && (
                                <span className="text-red-500 text-xs mt-1">
                                    {validationErrors["payment_method"][0]}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-2 font-semibold">
                        <span></span>
                        <span className="text-center">Local</span>
                        <span className="text-center">International</span>
                    </div>

                    <div className="flex flex-col gap-4">
                        {fields
                            .filter((item) => item.name !== "payment_method")
                            .map((item, index) => (
                                <div
                                    key={index}
                                    className="grid grid-cols-3 gap-4 items-start"
                                >
                                    {/* Label */}
                                    <div className="flex items-center h-full font-semibold">
                                        {item.label}
                                    </div>

                                    {/* Local Input + Validation */}
                                    <div className="flex flex-col gap-1">
                                        <CustomInput
                                            type={getInputType(item.name)}
                                            name={item.name}
                                            value={
                                                formData.markup_details.local[
                                                    item.name
                                                ]
                                            }
                                            onChange={(e) =>
                                                handleNestedChange(
                                                    e,
                                                    "local",
                                                    item.name
                                                )
                                            }
                                            className="border border-gray-300 rounded-[5px] p-2 w-full"
                                        />
                                        {validationErrors[item.name] && (
                                            <span className="text-red-500 text-xs">
                                                {validationErrors[item.name][0]}
                                            </span>
                                        )}
                                    </div>

                                    {/* International Input */}
                                    <div className="flex flex-col gap-1">
                                        <CustomInput
                                            type={getInputType(item.name)}
                                            name={item.name}
                                            value={
                                                formData.markup_details
                                                    .international[item.name]
                                            }
                                            onChange={(e) =>
                                                handleNestedChange(
                                                    e,
                                                    "international",
                                                    item.name
                                                )
                                            }
                                            className="border border-gray-300 rounded-[5px] p-2 w-full"
                                        />
                                    </div>
                                </div>
                            ))}
                    </div>

                    <div className="flex justify-end mt-5">
                        <div className="flex justify-center bg-gradient-to-r from-[#175D5F] to-[#70AD47] rounded-[10px] items-center shadow-md w-[150px] px-3 py-3 h-[40px] space-x-2 cursor-pointer">
                            <button
                                className="flex justify-center bg-gradient-to-r from-[#175D5F] to-[#70AD47] rounded-[10px] items-center shadow-md w-[150px] px-3 py-3 h-[40px] space-x-2 cursor-pointer text-white"
                                onClick={handleSave}
                                disabled={isLoading}
                            >
                                {isLoading ? <Spinner /> : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </dialog>
    );
};

export default MarkupSettingModal;

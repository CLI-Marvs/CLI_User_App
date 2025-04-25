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
        pti_bank_rate_percent_local: "",
        pti_bank_rate_percent_international: "",
        pti_bank_fixed_amount: "",
        cli_markup: "",
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
            pti_bank_rate_percent_local: "",
            pti_bank_rate_percent_international: "",
            pti_bank_fixed_amount: "",
            cli_markup: "",
        });
    };
 
    const getInputType = (name) => {
        const numericFields = [
            "pti_bank_rate_percent_local",
            "pti_bank_rate_percent_international",
            "pti_bank_fixed_amount",
            "cli_markup",
        ];
        return numericFields.includes(name) ? "number" : "text";
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const validateFields = () => {
        const errors = {};
        for (let field of fields) {
            if(field.name === "pti_bank_rate_percent_international") continue;
            if (
                formData[field.name] === "" ||
                formData[field.name] === null ||
                formData[field.name] === undefined 
            ) {
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
            <div className="bg-custombg3 w-auto h-auto px-5 py-5 rounded-[10px] space-y-5">
                <div className="bg-white py-[20px] px-[35px] rounded-[10px]">
                    <div className="grid grid-cols-2 gap-5 mb-4">
                        {fields.map((item, index) => (
                            <div
                                key={index}
                                className="flex flex-col space-y-2"
                            >
                                <label className="text-sm">{item.label}</label>
                                <CustomInput
                                    type={getInputType(item.name)}
                                    name={item.name}
                                    value={formData[item.name]}
                                    onChange={handleChange}
                                    className={`border border-gray-300 rounded-[5px] p-2 ${
                                        item.name === "payment_method" &&
                                        type === "update"
                                            ? "opacity-50 cursor-not-allowed"
                                            : ""
                                    }`}
                                    disabled={
                                        `${item.name}` === "payment_method" &&
                                        type === "update"
                                            ? true
                                            : false
                                    }
                                />

                                {validationErrors[item.name] && (
                                    <span className="text-red-500 text-xs">
                                        {validationErrors[item.name][0]}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end">
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

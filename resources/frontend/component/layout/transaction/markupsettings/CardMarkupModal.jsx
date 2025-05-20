import React, { useState, useEffect } from "react";
import { settings } from "@/component/servicesApi/apiCalls/markupSettings/settings";
import { showToast } from "@/util/toastUtil";
import Spinner from "@/util/Spinner";
import CustomInput from "@/component/Input/CustomInput";

const CardMarkupModal = ({
    settingsRef,
    fields,
    selectedData = null,
    refetchData,
}) => {
    const [formData, setFormData] = useState({
        payment_method: "",
        mdr: "",
        cli_rate: "",
        withholding_tax: "",
        gateway_rate: "",
    });
    const [validationErrors, setValidationErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (selectedData) {
            setFormData(selectedData);
        }
    }, [selectedData]);

    const handleCloseModal = () => {
        setFormData(selectedData);
        if (settingsRef.current) {
            settingsRef.current.close();
            setValidationErrors({});
        }
    };

    const getInputType = (name) => {
        const numericFields = [
            "mdr",
            "cli_rate",
            "withholding_tax",
            "gateway_rate",
        ];
        return numericFields.includes(name) ? "number" : "text";
    };

    const fieldsOnchange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const validateFields = () => {
        const errors = {};
        for (let field of fields) {
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
            if (
                selectedData &&
                JSON.stringify(formData) === JSON.stringify(selectedData)
            ) {
                showToast(
                    "No updates were made as no changes were detected.",
                    "info"
                );
                setIsLoading(false);
                settingsRef.current.close();
                return;
            }

            response = await settings.updateCardSettings(formData);
            showToast("Markup settings updated successfully", "success");

            if (response.data.success && settingsRef.current) {
                settingsRef.current.close();

                if (typeof refetchData === "function") {
                    refetchData();
                }
            }
        } catch (error) {
            setIsLoading(false);
        } finally {
            setIsLoading(false);
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
                    <div className="grid grid-cols-2 items-center gap-4 mb-3">
                        <span className="font-semibold">Payment Method</span>
                        <div className="flex flex-col">
                            <CustomInput
                                type={getInputType("payment_method")}
                                name="payment_method"
                                value={formData["payment_method"]}
                                onChange={fieldsOnchange}
                                className={`border border-gray-300 rounded-[5px] p-2 w-full ${
                                    selectedData
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                }`}
                                disabled={selectedData}
                            />
                            {validationErrors["payment_method"] && (
                                <span className="text-red-500 text-xs mt-1">
                                    {validationErrors["payment_method"][0]}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        {fields
                            .filter((item) => item.name !== "payment_method")
                            .map((item, index) => (
                                <div
                                    key={index}
                                    className="grid grid-cols-2 gap-4 items-start"
                                >
                                    {/* Label */}
                                    <div className="flex items-center h-full font-semibold">
                                        {item.label}
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <CustomInput
                                            type={getInputType(item.name)}
                                            name={item.name}
                                            value={formData[item.name]}
                                            onChange={(e) => fieldsOnchange(e)}
                                            className="border border-gray-300 rounded-[5px] p-2 w-full"
                                        />
                                        {validationErrors[item.name] && (
                                            <span className="text-red-500 text-xs">
                                                {validationErrors[item.name]}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                    </div>

                    <div className="flex justify-end mt-5">
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
        </dialog>
    );
};

export default CardMarkupModal;

import CustomInput from "frontend/component/Input/CustomInput";
import { transaction } from "frontend/component/servicesApi/apiCalls/transactions";
import Spinner from "frontend/util/Spinner";
import { showToast } from "frontend/util/toastUtil";
import React, { useEffect, useState } from "react";
import { useCheckEntities, useCheckStreamBanks } from "../hooks/useTransactionQueries";
import SelectInput from "frontend/component/shared/components/SelectInput";

const FIELDS = [
    { name: "check_no", label: "Check No:" },
    { name: "check_amount", label: "Check Amount:" },
    { name: "check_date", label: "Check Date:" },
    { name: "payor_name", label: "Payor Name:" },
    { name: "drawee_bank_id", label: "Drawee Bank:" },
    { name: "entity_id", label: "Beneficiary Name:" },
    { name: "remarks", label: "Remarks:" },
];
const CheckStreamModal = ({ settingsRef, refetchData, selectedData }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const { data: checkStreamBanks } = useCheckStreamBanks();
    const { data: checkStreamEntities } = useCheckEntities();

    const [formData, setFormData] = useState({
        check_no: "",
        check_amount: "",
        check_date: "",
        payor_name: "",
        drawee_bank_id: "",
        entity_id: "",
        remarks: "",
    });

    useEffect(() => {
        if (selectedData) {
            setFormData({
                ...selectedData,
                drawee_bank_id:
                    selectedData?.drawee_bank_id ||
                    selectedData?.check_stream_bank?.id,
                entity_id: selectedData?.entity_id || selectedData?.check_entities.id,
            });
        }
    }, [selectedData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const validateFields = () => {
        const errors = {};

        for (let field of FIELDS) {
            let value;

            if (field.name === "check_no") {
                value = formData.check_no;
            } else {
                value = formData[field.name];
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

            response = await transaction.updatePrintedCheck(
                selectedData.id,
                formData
            );

            if (response.status === 200) {
                showToast("Saved successfully", "success");
            } else {
                settingsRef.current.close();
                showToast("Save failed", "error");
            }
        } catch (error) {
            setIsLoading(false);
            settingsRef.current.close();
            showToast("Save failed", "error");
        } finally {
            setIsLoading(false);
        }

        if (response.status === 200 && settingsRef.current) {
            settingsRef.current.close();

            if (typeof refetchData === "function") {
                refetchData();
            }
        }
    };

    const getInputType = (name) => {
        const numericFields = ["check_no", "check_amount", "remarks"];
        return numericFields.includes(name) ? "number" : "text";
    };

    const handleCloseModal = () => {
        if (settingsRef.current) {
            settingsRef.current.close();
            setValidationErrors({});
        }
    };

    return (
        <dialog
            className="modal w-[700px] rounded-[10px] shadow-custom5 backdrop:bg-black/50 outline-none transaction-scrollbar p-10"
            ref={settingsRef}
        >
            <div
                className="bg-white rounded-full absolute top-2 right-5 h-6 w-6 shadow-md flex justify-center cursor-pointer"
                onClick={handleCloseModal}
            >
                <span>X</span>
            </div>
            <div className="flex flex-col gap-4 mt-3">
                {FIELDS.map((item, index) => (
                    <div
                        key={index}
                        className="grid grid-cols-2 gap-4 items-start"
                    >
                        <div className="flex items-center h-full font-semibold">
                            {item.label}
                        </div>

                        <div className="flex flex-col gap-1">
                            {item.name === "drawee_bank_id" ? (
                                <SelectInput
                                    label=""
                                    name="drawee_bank_id"
                                    value={formData.drawee_bank_id}
                                    onChange={(val) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            drawee_bank_id: val.id,
                                        }))
                                    }
                                    options={checkStreamBanks || []}
                                    valueKey="id"
                                    labelKey="bank_name"
                                />
                            ) : item.name === "entity_id" ? (
                                <SelectInput
                                    label=""
                                    name="entity_id"
                                    value={formData.entity_id}
                                    onChange={(val) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            entity_id: val.id,
                                        }))
                                    }
                                    options={checkStreamEntities || []}
                                    valueKey="id"
                                    labelKey="payTo"
                                />
                            ) : (
                                <CustomInput
                                    type={getInputType(item.name)}
                                    name={item.name}
                                    value={formData[item.name]}
                                    onChange={(e) => handleChange(e)}
                                    className="border border-gray-300 rounded-[5px] p-2 w-full"
                                />
                            )}

                            {validationErrors[item.name] && (
                                <span className="text-red-500 text-xs">
                                    {validationErrors[item.name][0]}
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
                    {isLoading ? <Spinner color="inherit" /> : "Save"}
                </button>
            </div>
        </dialog>
    );
};

export default CheckStreamModal;

import React, { useState, useEffect } from "react";
import { settings } from "@/component/servicesApi/apiCalls/markupSettings/settings";
import { showToast } from "@/util/toastUtil";
import usePagination from "@/hooks/usePagination";
import { useTransactionContext } from "@/context/Transaction/TransactionContext";

const MarkupSettingModal = ({
    settingsRef,
    fields,
    type,
    selectedData = null,
}) => {
    const [formData, setFormData] = useState({
        payment_method: "",
        pti_bank_rate_percent: 0,
        pti_bank_fixed_amount: 0,
        cli_markup: 0,
    });

    /* const { markupSettings, setMarkupSettings } = useTransactionContext();
    const { getData } = usePagination(
        settings.retrieveSettings,
        markupSettings,
        setMarkupSettings
    ); */

    useEffect(() => {
        if (type === "update" && selectedData) {
            setFormData(selectedData);
        }
    }, [type, selectedData]);

    const handleCloseModal = () => {
        console.log("trigger", settingsRef.current);
        if (settingsRef.current) {
            settingsRef.current.close();
        }
    };

    const getInputType = (name) => {
        const numericFields = [
            "pti_bank_rate_percent",
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

    const handleSave = async () => {
        try {
            if (type === "store") {
                await settings.storeSettings(formData);
                showToast('Markup settings saved successfully', 'success');
                getData();
            } else {
                await settings.updateSettings(formData);
            }
            if (settingsRef.current) {
                settingsRef.current.close();
            }
        } catch (error) {
            console.error("Error saving markup settings:", error);
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
                                <input
                                    type={getInputType(item.name)}
                                    name={item.name}
                                    value={formData[item.name]}
                                    onChange={handleChange}
                                    className="border border-gray-300 rounded-[5px] p-2"
                                    step={
                                        getInputType(item.name) === "number"
                                            ? "any"
                                            : undefined
                                    }
                                />
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end">
                        <div
                            className="flex justify-center bg-gradient-to-r from-[#175D5F] to-[#70AD47] rounded-[10px] items-center shadow-md w-[150px] px-3 py-3 h-[40px] space-x-2 cursor-pointer"
                            onClick={handleSave}
                        >
                            <button className="text-white">Save</button>
                        </div>
                    </div>
                </div>
            </div>
        </dialog>
    );
};

export default MarkupSettingModal;

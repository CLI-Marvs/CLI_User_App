import React, { useState } from "react";
import DatePicker from "react-datepicker";
import DateLogo from "../../../../../../public/Images/Date_range.svg";
import moment from "moment";
import SelectInput from "frontend/component/shared/components/SelectInput";
import {
    useCheckEntities,
    useCheckStreamBanks,
    useCreateBank,
    useCreateEntity,
} from "../hooks/useTransactionQueries";
import CustomInput from "frontend/component/Input/CustomInput";
import useValidation from "../hooks/useValidation";
import { requiredKeys } from "../constant/requiredKeys";
import { showToast } from "frontend/util/toastUtil";
import { valueExistsFuzzy } from "../utils/stringChecker";

const ChequeSettings = ({ handleCheck, data, setData, endDate }) => {
    const { data: checkStreamBanks } = useCheckStreamBanks();
    const { data: checkStreamEntities } = useCheckEntities();
    const { errors, validateField, validateAll, clearError } = useValidation();
    const { mutate: createEntity } = useCreateEntity();
    const { mutate: createBank } = useCreateBank();

    const handlePreviewChecks = () => {
        const fieldsToValidate = {};
        requiredKeys.forEach((key) => {
            fieldsToValidate[key] = data[key];
        });

        validateAll(fieldsToValidate);
    };
    const handleFieldChange = (fieldKey, value, customOnChange) => {
        clearError(fieldKey);

        if (customOnChange) {
            customOnChange(fieldKey, value);
        } else {
            setData((prev) => ({ ...prev, [fieldKey]: value }));
        }
    };
    const handleAddOption = (name, type) => {
        const isEntity = type === "entity";

        const config = isEntity
            ? {
                list: checkStreamEntities,
                key: "payTo",
                createFn: createEntity,
                payload: { name },
                existsMsg: "Pay To Order already exists",
                successMsg: "Pay To Order created successfully",
                errorMsg: "Failed to create Pay To Order",
            }
            : {
                list: checkStreamBanks,
                key: "bank_name",
                createFn: createBank,
                payload: { bank_name: name },
                existsMsg: "Bank already exists",
                successMsg: "Bank created successfully",
                errorMsg: "Failed to create bank",
            };

        if (valueExistsFuzzy(config.list, name, config.key, 0.9)) {
            showToast(config.existsMsg, "error");
            return;
        }

        config.createFn(config.payload, {
            onSuccess: () => showToast(config.successMsg),
            onError: () => showToast(config.errorMsg, "error"),
        });
    };

    const fields = [
        {
            label: "Payor Name:",
            type: "text",
            key: "payor_name",
            placeholder: "Enter payor name",
        },
        {
            label: "Contract Number:",
            type: "number",
            key: "contract_number",
            placeholder: "Enter contract number",
            onChange: handleCheck,
        },
        {
            label: "Monthly Amortization (₱):",
            type: "text",
            key: "amount",
            inputMode: "decimal",
            onChange: handleCheck,
            placeholder: "Enter monthly amortization",
        },
        {
            label: "Number of Months to Pay:",
            type: "number",
            key: "totalMonths",
            onChange: handleCheck,
            placeholder: "Enter number of months",
        },
        {
            label: "Total Equity Amount (₱):",
            type: "text",
            key: "total_purchased_amount",
            inputMode: "decimal",
            onChange: handleCheck,
            placeholder: "Enter total equity amount",
        },

        {
            label: "Check Number:",
            type: "number",
            key: "checkBaseNo",
            onChange: handleCheck,
            placeholder: "Enter check number",
        },
    ];

    const renderField = ({
        label,
        type,
        key,
        placeholder,
        inputMode,
        pattern,
        onChange,
    }) => (
        <div key={key} className="w-full flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <CustomInput
                type={type}
                value={data[key]}
                placeholder={placeholder}
                pattern={pattern}
                inputMode={inputMode}
                onBlur={() => {
                    validateField(key, data[key]);
                }}
                onChange={(e) =>
                    handleFieldChange(key, e.target.value, onChange)
                }
                className={`w-full p-3 border rounded-md outline-none ${errors[key]
                        ? "border-red-500 focus:ring-2 focus:ring-red-300"
                        : "border-gray-300 focus:ring-2 focus:ring-custom-lightgreen"
                    }`}
            />
            {errors[key] && (
                <span className="text-red-500 text-xs mt-1">{errors[key]}</span>
            )}
        </div>
    );

    return (
        <div className="flex justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg mb-8 print:hidden w-full max-w-4xl space-y-4 montserrat-regular">
                <div className="flex justify-between">
                    <h2 className="text-xl font-semibold mb-2">
                        Fill Check Settings
                    </h2>
                    <button
                        type="button"
                        onClick={handlePreviewChecks}
                        className="h-[38px] w-auto px-10 gradient-btn5 text-white text-sm montserrat-semibold rounded-[10px] shadow-card"
                    >
                        Preview Checks
                    </button>
                </div>
                <div className="w-full flex gap-4">
                    <div className="flex-1 flex-col">
                        <SelectInput
                            label="Drawee Bank:"
                            options={checkStreamBanks}
                            value={data.bank_name}
                            onChange={(val) => {
                                clearError("bank_name");
                                const updatedData = {
                                    ...data,
                                    bank_name: val.id,
                                };
                                setData(updatedData);
                            }}
                            onBlur={() =>
                                validateField("bank_name", data.bank_name)
                            }
                            valueKey="id"
                            labelKey="bank_name"
                            onAddOption={(bankName) =>
                                handleAddOption(bankName, "bank")
                            }
                            className={`${errors["bank_name"]
                                    ? "border-red-500 focus:ring-2 focus:ring-red-300"
                                    : ""
                                }`}
                        />
                        {errors["bank_name"] && (
                            <span className="text-red-500 text-xs mt-1">
                                {errors["bank_name"]}
                            </span>
                        )}
                    </div>
                    <div className="flex-1 flex-col">
                        <SelectInput
                            label="Pay to the Order of (Beneficiary Name):"
                            options={checkStreamEntities}
                            value={data.entity_id}
                            onChange={(val) => {
                                clearError("payTo");
                                const updatedData = {
                                    ...data,
                                    payTo: val.payTo,
                                    entity_id: val.id,
                                };
                                setData(updatedData);
                            }}
                            onBlur={() => validateField("payTo", data.payTo)}
                            valueKey="id"
                            labelKey="payTo"
                            onAddOption={(entityName) =>
                                handleAddOption(entityName, "entity")
                            }
                            className={`${errors["payTo"]
                                    ? "border-red-500 focus:ring-2 focus:ring-red-300"
                                    : ""
                                }`}
                        />
                        {errors["payTo"] && (
                            <span className="text-red-500 text-xs mt-1">
                                {errors["payTo"]}
                            </span>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {fields.map(renderField)}
                    <div className="w-full flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Start Date */}
                            <div className="w-full">
                                <label className="text-sm font-medium text-gray-700 mb-1">
                                    Start Date:
                                </label>
                                <div className="relative">
                                    <DatePicker
                                        className={`w-full p-3 border rounded-md outline-none ${errors["startDate"]
                                                ? "border-red-500 focus:ring-2 focus:ring-red-300"
                                                : "border-gray-300 focus:ring-2 focus:ring-custom-lightgreen focus:border-custom-lightgreen"
                                            }`}
                                        calendarClassName="custom-calendar"
                                        selected={
                                            data.startDate
                                                ? moment(
                                                    data.startDate
                                                ).toDate()
                                                : null
                                        }
                                        onChange={(startDate) => {
                                            clearError("startDate");
                                            if (startDate) {
                                                const formatted =
                                                    moment(startDate).format(
                                                        "YYYY-MM-DD"
                                                    );
                                                const updatedData = {
                                                    ...data,
                                                    startDate: formatted,
                                                };
                                                setData(updatedData);
                                            }
                                        }}
                                        onBlur={() =>
                                            validateField(
                                                "startDate",
                                                data.startDate
                                            )
                                        }
                                    />
                                    <img
                                        src={DateLogo}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-[30px]"
                                    />
                                </div>
                                {errors["startDate"] && (
                                    <span className="text-red-500 text-xs mt-1">
                                        {errors["startDate"]}
                                    </span>
                                )}
                            </div>
                            {/* End Date */}
                            <div className="w-full">
                                <label className="text-sm font-medium text-gray-700 mb-1">
                                    End Date:
                                </label>
                                <div className="relative">
                                    <DatePicker
                                        className="w-full p-3 border border-gray-300 rounded-md bg-gray-200 cursor-not-allowed outline-none"
                                        calendarClassName="custom-calendar"
                                        selected={
                                            endDate
                                                ? moment(endDate).toDate()
                                                : null
                                        }
                                        disabled
                                    />
                                    <img
                                        src={DateLogo}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-[30px]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col w-full">
                        <label className="text-sm font-medium text-gray-700 mb-1">
                            Total Checks:
                        </label>
                        <input
                            type="number"
                            value={data.totalChecks}
                            readOnly
                            className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed outline-none"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChequeSettings;

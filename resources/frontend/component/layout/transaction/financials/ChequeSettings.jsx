import React, { useState } from "react";
import DatePicker from "react-datepicker";
import DateLogo from "../../../../../../public/Images/Date_range.svg";
import moment from "moment";
import SelectInput from "@/component/shared/components/SelectInput";
import { useCheckStreamBanks } from "../hooks/useTransactionQueries";
import CustomInput from "@/component/Input/CustomInput";
import useValidation from "../hooks/useValidation";

const requiredKeys = [
    "payTo",
    "payor_name",
    "contract_number",
    "checkBaseNo",
    "total_purchased_amount",
    "totalMonths",
    "amount",
    "bank_name",
    "startDate",
];

const ChequeSettings = ({
    handleCheck,
    data,
    setData,
    endDate,
    setIsError,
}) => {
    const { data: checkStreamBanks } = useCheckStreamBanks();
    const { errors, validateField, clearError } = useValidation();

    const fields = [
        {
            label: "Pay to the Order of (Beneficiary Name):",
            type: "text",
            key: "payTo",
            placeholder: "Enter beneficiary name",
        },
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
        },
        {
            label: "Check Number:",
            type: "number",
            key: "checkBaseNo",
            onChange: handleCheck,
            placeholder: "Enter check number",
        },
        {
            label: "Total Equity Amount (₱):",
            type: "text",
            key: "total_purchased_amount",
            inputMode: "decimal",
            pattern: "^\\d+(\\.\\d{0,2})?$",
            onChange: handleCheck,
            placeholder: "Enter total equity amount",
        },
        {
            label: "Number of Months to Pay:",
            type: "number",
            key: "totalMonths",
            onChange: handleCheck,
            placeholder: "Enter number of months",
        },
        {
            label: "Monthly Amortization (₱):",
            type: "text",
            key: "amount",
            inputMode: "decimal",
            pattern: "^\\d+(\\.\\d{0,2})?$",
            onChange: (field, value) =>
                setData({ ...data, [field]: value.replace(/[^0-9.]/g, "") }),
            placeholder: "Enter monthly amortization",
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
                onBlur={() => validateField(key, data[key])}
                onChange={(e) => {
                    const value = e.target.value;
                    clearError(key);

                    const updatedData = {
                        ...data,
                        [key]: value,
                    };

                    onChange ? onChange(key, value) : setData(updatedData);

                    const allFieldsFilled = requiredKeys.every(
                        (fieldKey) =>
                            updatedData[fieldKey]?.toString().trim() !== ""
                    );

                    setIsError(allFieldsFilled);
                }}
                className={`w-full p-3 border rounded-md outline-none ${
                    errors[key]
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
                <h2 className="text-xl font-semibold mb-2">
                    Fill Check Settings
                </h2>

                <div className="w-full max-w-md">
                    <SelectInput
                        label="Drawee Bank:"
                        options={checkStreamBanks}
                        value={data.bank_name}
                        onChange={(val) => {
                            const updatedData = { ...data, bank_name: val };
                            setData(updatedData);

                            const allFieldsFilled = requiredKeys.every(
                                (fieldKey) =>
                                    updatedData[fieldKey]?.toString().trim() !==
                                    ""
                            );

                            setIsError(allFieldsFilled);
                        }}
                        valueKey="id"
                        labelKey="bank_name"
                    />
                    {errors["bank_name"] && (
                        <span className="text-red-500 text-xs mt-1">
                            {errors["bank_name"]}
                        </span>
                    )}
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
                                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-custom-lightgreen focus:border-custom-lightgreen outline-none"
                                        calendarClassName="custom-calendar"
                                        selected={
                                            data.startDate
                                                ? moment(
                                                      data.startDate
                                                  ).toDate()
                                                : null
                                        }
                                        onChange={(startDate) => {
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

                                                const allFieldsFilled =
                                                    requiredKeys.every(
                                                        (fieldKey) =>
                                                            updatedData[
                                                                fieldKey
                                                            ]
                                                                ?.toString()
                                                                .trim() !== ""
                                                    );
                                                setIsError(allFieldsFilled);
                                            }
                                        }}
                                    />
                                    <img
                                        src={DateLogo}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-[30px]"
                                    />
                                </div>
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

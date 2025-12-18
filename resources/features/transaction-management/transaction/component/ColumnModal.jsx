import React, { useEffect, useMemo, useRef, useState } from "react";
import columnIcon from "@/assets/images/column-icon.png";
import columnDropdown from "@/assets/images/column-dropdown.png";
import { columnData } from "@/constant/data/transaction";
import { transaction } from "@/servicesApi/apiCalls/transactions";
import { useTransactionContext } from "@/context/Transaction/TransactionContext";
import { useSaveView, useSetDefaultView } from "../hooks/useTransactionQueries";
import Spinner from "@/util/Spinner";
import { showToast } from "@/util/toastUtil";

const ColumnModal = ({ subFeatureId, views }) => {
    const { setDefaultColumns } = useTransactionContext();
    const [openColumn, setOpenColumn] = useState(false);
    const [hasManuallySelected, setHasManuallySelected] = useState(false);
    const [selectedView, setSelectedView] = useState(null);
    const [selectedFields, setSelectedFields] = useState({});
    const [message, setMessage] = useState({ success: "", error: "" });
    const [isView, setIsView] = useState(true);
    const [isMaster, setIsMaster] = useState(false);
    const [viewName, setViewName] = useState("");
    const modalRef = useRef(null);

    const isSelectedView = views?.find((item) => item.id === selectedView);
    const renderColumns = isSelectedView?.columns;

    const { mutateAsync: setDefaultView, isPending: isDefaultViewPending } =
        useSetDefaultView(subFeatureId, setHasManuallySelected);

    const mutation = useSaveView(subFeatureId);
    const { mutateAsync: saveView, isPending } = mutation;

    useEffect(() => {
        if (renderColumns) {
            const initialFields = {};
            renderColumns.forEach((col) => {
                initialFields[col.column_name] = true;
            });
            setSelectedFields(initialFields);
            setIsView(false);
        }
    }, [renderColumns]);

    useEffect(() => {
        if (views && views.length > 0 && !hasManuallySelected) {
            const defaultView = views.find((view) => view.is_default);
            if (defaultView) {
                setSelectedView(defaultView.id);
                setDefaultColumns(defaultView.columns);
            }
        }
    }, [views]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setOpenColumn(false);
                clearFields();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleCheckboxChange = (field) => {
        setSelectedFields((prev) => {
            const newFields = { ...prev };

            if (newFields[field]) {
                delete newFields[field];
            } else {
                newFields[field] = true;
            }

            return newFields;
        });
    };

    /*   const viewChange = (e) => {
        setSelectedView(Number(e.target.value));
        setIsView(false);
        setHasManuallySelected(false);
        setMessage({ success: "", error: "" });
        setViewName("");
    }; */

    const viewChange = (e) => {
        const value = e.target.value;

        if (value === "master") {
            setIsMaster(true);
            setSelectedView("master");
            const allFields = {};
            columnData.forEach((group) => {
                group.fields.forEach((field) => {
                    allFields[field] = true;
                });
            });
            setIsView(false);
            setSelectedFields(allFields);
            return;
        }

        setIsMaster(false);
        setSelectedView(Number(value));
        setIsView(false);
        setHasManuallySelected(false);
        setMessage({ success: "", error: "" });
        setViewName("");
    };

    const messageFunc = () => {
        const hasSelection = Object.values(selectedFields).some(
            (value) => value === true
        );
        const hasViewName = viewName.trim().length > 0;

        setMessage({
            success: hasSelection ? "" : "Please select at least one column",
            error: !hasViewName ? "Please enter a view name" : "",
        });
        return hasSelection && hasViewName;
    };

    const clearFields = () => {
        setSelectedView(null);
        setSelectedFields({});
        setIsView(true);
        setHasManuallySelected(true);
        setMessage({ success: "", error: "" });
        setOpenColumn(false);
        setViewName("");
    };

    const createNewView = () => {
        setSelectedView(null);
        setSelectedFields({});
        setIsView(true);
        setHasManuallySelected(true);
        setMessage({ success: "", error: "" });
    };

    const handleSetDefault = async () => {
        if (isView) {
            if (messageFunc()) {
                const response = await setDefaultView({
                    presetId: selectedView,
                    selectedFields,
                    viewName,
                });
                showToast("Columns saved successfully", "success");
                setDefaultColumns(response?.columns);
                clearFields();
            }
        } else {
            const response = await setDefaultView({
                presetId: selectedView,
                selectedFields,
                viewName,
            });
            clearFields();
            setDefaultColumns(response?.columns);

            showToast("Default view saved successfully", "success");
        }
    };

    const handleCloseModal = () => {
        clearFields();
    };

    const handleSaveView = async () => {
        if (isView) {
            if (messageFunc()) {
                try {
                    const response = await saveView({
                        selectedFields,
                        viewName,
                    });
                    setDefaultColumns(response?.columns);
                    showToast("Columns saved successfully", "success");
                    clearFields();
                } catch (error) {
                    console.error("Failed to save view:", error);
                }
            }
        } else {
            if (isMaster) {
                setHasManuallySelected(true);
                setMessage({ success: "", error: "" });
                setDefaultColumns([]);
                setOpenColumn(false);
                return;
            }
            setDefaultColumns(renderColumns);
            setOpenColumn(false);
        }
    };

    return (
        <div className="relative">
            <div
                className="flex items-center gap-2 h-[39px] rounded-md border-1 border-custom-solidgreen px-2 cursor-pointer text-custom-solidgreen"
                onClick={() => setOpenColumn((prev) => !prev)}
            >
                <img src={columnIcon} alt="column-icon" />
                <span className="text-sm">Columns</span>
                <img src={columnDropdown} alt="column-dropdown" />
            </div>

            {openColumn && (
                <div
                    ref={modalRef}
                    className="absolute -right-1 top-10 bg-white border border-gray-300 mt-[10px] w-[640px] h-auto rounded-2xl pt-[48px] px-[32px] pb-[32px] z-50"
                >
                    <div className="flex justify-center items-center mb-2">
                        <span
                            className={`montserrat-regular text-sm ${message?.success.includes("column")
                                ? "text-red-500"
                                : "text-custom-solidgreen"
                                }`}
                        >
                            {message?.success}
                        </span>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
                        {isView && (
                            <div className="w-full sm:w-auto flex items-center gap-2">
                                <div className="flex flex-col">
                                    <input
                                        type="text"
                                        placeholder="Save view"
                                        onChange={(e) =>
                                            setViewName(e.target.value)
                                        }
                                        value={viewName}
                                        className="w-full sm:w-64 px-4 py-2 text-sm rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-custom-solidgreen focus:border-transparent"
                                    />
                                    <span className="text-red-500 montserrat-regular text-sm">
                                        {message?.error}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="w-full flex justify-end items-start gap-2">
                            {/*  <select
                                className="w-full sm:w-48 px-4 py-2 text-sm rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-custom-solidgreen focus:border-transparent"
                                onChange={viewChange}
                                value={selectedView || ""}
                            >
                                <option value="" disabled>
                                    {views && views.length > 0
                                        ? "Select a view"
                                        : "No views created yet"}
                                </option>
                                {views &&
                                    views.map((item, index) => (
                                        <option key={index} value={item.id}>
                                            {item.name}{" "}
                                            {item.is_default ? "(default)" : ""}
                                        </option>
                                    ))}
                            </select> */}

                            <select
                                className="w-full sm:w-48 px-4 py-2 text-sm rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-custom-solidgreen focus:border-transparent"
                                onChange={viewChange}
                                value={selectedView || ""}
                            >
                                <option value="" disabled>
                                    {views && views.length > 0
                                        ? "Select a view"
                                        : "No views created yet"}
                                </option>
                                <option value="master">Master View</option>{" "}
                                {/* ✅ add this */}
                                {views &&
                                    views.map((item, index) => (
                                        <option key={index} value={item.id}>
                                            {item.name}{" "}
                                            {item.is_default ? "(default)" : ""}
                                        </option>
                                    ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col space-y-6 text-sm">
                        {columnData
                            .filter((group) => {
                                if (!isSelectedView) return true;
                                return group.fields.some((field) =>
                                    renderColumns?.some(
                                        (col) => col.column_name === field
                                    )
                                );
                            })
                            .map((item, index) => (
                                <div
                                    className="grid grid-cols-[100px_1fr] gap-4"
                                    key={index}
                                >
                                    <div className="row-span-2 flex items-start pt-1 font-semibold">
                                        {item.label}
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        {(isSelectedView
                                            ? item.fields.filter((field) =>
                                                renderColumns?.some(
                                                    (col) =>
                                                        col.column_name ===
                                                        field
                                                )
                                            )
                                            : item.fields
                                        ).map((field, idx) => (
                                            <label
                                                key={idx}
                                                className="flex items-center space-x-2"
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="form-checkbox shrink-0"
                                                    checked={
                                                        !!selectedFields[field]
                                                    }
                                                    onChange={() =>
                                                        handleCheckboxChange(
                                                            field
                                                        )
                                                    }
                                                />
                                                <span className="break-words">
                                                    {field}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                    </div>

                    <div className="flex justify-between mt-3">
                        <div className="flex gap-2">
                            {!isView && (
                                <>
                                    <button
                                        className="font-semibold text-base text-custom-solidgreen"
                                        onClick={createNewView}
                                    >
                                        Create new view +
                                    </button>
                                </>
                            )}
                            <button
                                className="font-semibold text-base text-custom-solidgreen underline flex items-center gap-2"
                                onClick={handleSetDefault}
                                disabled={isDefaultViewPending}
                            >
                                {isDefaultViewPending ? (
                                    <>
                                        <svg
                                            className="animate-spin h-4 w-4 text-custom-solidgreen"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                            />
                                        </svg>
                                        Saving...
                                    </>
                                ) : (
                                    "Set as default"
                                )}
                            </button>
                        </div>

                        <div className="flex justify-end gap-6">
                            <button
                                className="font-semibold text-base text-custom-solidgreen"
                                onClick={handleCloseModal}
                            >
                                Cancel
                            </button>

                            <button
                                className="h-[38px] w-[121px] gradient-btn5 text-white text-sm montserrat-semibold rounded-[10px] shadow-card"
                                onClick={handleSaveView}
                                disabled={isPending}
                            >
                                {isPending ? <Spinner /> : "Apply"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ColumnModal;

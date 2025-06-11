import React, { useEffect, useMemo, useRef, useState } from "react";
import columnIcon from "../../../../../../public/Images/column-icon.png";
import columnDropdown from "../../../../../../public/Images/column-dropdown.png";
import { columnData } from "@/constant/data/transaction";
import { transaction } from "@/component/servicesApi/apiCalls/transactions";
import { useTransactionContext } from "@/context/Transaction/TransactionContext";
import { useSaveView, useSetDefaultView } from "../hooks/useTransactionQueries";

const ColumnModal = ({ subFeatureId, views }) => {
    const { setDefaultColumns } = useTransactionContext();
    const [openColumn, setOpenColumn] = useState(false);
    const [hasManuallySelected, setHasManuallySelected] = useState(false);
    const [selectedView, setSelectedView] = useState(null);
    const [selectedFields, setSelectedFields] = useState({});
    const [message, setMessage] = useState("");
    const [isView, setIsView] = useState(true);
    const [viewName, setViewName] = useState("");
    const modalRef = useRef(null);

    const isSelectedView = views?.find((item) => item.id === selectedView);
    const renderColumns = isSelectedView?.columns;
    const { mutate: setDefaultView } = useSetDefaultView(
        subFeatureId,
        setHasManuallySelected
    );
    const { mutate: saveView } = useSaveView(subFeatureId);

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
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleCheckboxChange = (field) => {
        setSelectedFields((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    const viewChange = (e) => {
        setSelectedView(Number(e.target.value));
        setIsView(false);
        setHasManuallySelected(false);
    };

    const messageFunc = () => {
        const hasSelection = Object.values(selectedFields).some(
            (value) => value === true
        );
        setMessage(
            hasSelection
                ? "Successfully created view"
                : "Please select at least one column"
        );
        return hasSelection;
    };
    const createNewView = () => {
        setSelectedView(null);
        setSelectedFields({});
        setIsView(true);
        setHasManuallySelected(true);
    };

    const handleSetDefault = () => {
        if (messageFunc()) {
            setDefaultView({
                presetId: selectedView,
                selectedFields,
                viewName,
            });
        }
    };

    const handleSaveView = () => {
        if (isView) {
            saveView({
                selectedFields,
                viewName,
            });
        } else {
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
                        <span>{message}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        {isView && (
                            <div className="w-full sm:w-auto flex items-center gap-2">
                                <input
                                    type="text"
                                    placeholder="Save view"
                                    onChange={(e) =>
                                        setViewName(e.target.value)
                                    }
                                    value={viewName}
                                    className="w-full sm:w-64 px-4 py-2 text-sm rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-custom-solidgreen focus:border-transparent"
                                />
                            </div>
                        )}

                        <div className="w-full flex justify-end items-center gap-2">
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
                                className="font-semibold text-base text-custom-solidgreen underline"
                                onClick={handleSetDefault}
                            >
                                Set as default
                            </button>
                        </div>

                        <div className="flex justify-end gap-6">
                            <button className="font-semibold text-base text-custom-solidgreen">
                                Cancel
                            </button>

                            <button
                                className="h-[38px] w-[121px] gradient-btn5 text-white text-sm montserrat-semibold rounded-[10px] shadow-card"
                                onClick={handleSaveView}
                            >
                                {isView ? "Save" : "Apply"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ColumnModal;

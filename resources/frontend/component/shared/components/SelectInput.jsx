import React, { useEffect, useMemo, useRef, useState } from "react";
import { IoChevronDownCircleOutline, IoAddCircleOutline } from "react-icons/io5";

const SelectInput = ({
    label,
    options = [],
    value,
    onChange,
    onBlur,
    placeholder = "Select...",
    name,
    getOptionClassName = () => "",
    valueKey = "id",
    labelKey = "label",
    onAddOption
}) => {
    const [search, setSearch] = useState("");
    const [showOptions, setShowOptions] = useState(false);

    const wrapperRef = useRef(null);

    const selectedOption =
        typeof value === "object"
            ? value
            : options.find((opt) => opt[valueKey] === value);

    const filteredOptions = useMemo(() => {
        return options.filter((opt) =>
            String(opt[labelKey]).toLowerCase().includes(search.toLowerCase())
        );
    }, [search, options, labelKey]);

    const handleSelect = (option) => {
        onChange(option);
        setShowOptions(false);
        setSearch("");
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target)
            ) {
                setShowOptions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div ref={wrapperRef} className="relative w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}

            <div
                className="border border-gray-300 rounded-md px-3 py-2 cursor-pointer bg-white flex justify-between items-center"
                onClick={() => setShowOptions((prev) => !prev)}
            >
                <span>{selectedOption?.[labelKey] || placeholder}</span>
                <IoChevronDownCircleOutline
                    className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                        showOptions ? "rotate-180" : ""
                    }`}
                />
            </div>

            {showOptions && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                    <input
                        type="text"
                        className="w-full px-3 py-2 border-b border-gray-200 focus:outline-none"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        autoFocus
                    />
                    <div className="max-h-60 overflow-y-auto">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option[valueKey]}
                                    className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${getOptionClassName(
                                        option
                                    )}`}
                                    onClick={() => handleSelect(option)}
                                >
                                    {option[labelKey]}
                                </div>
                            ))
                        ) : (
                            <div className="px-3 py-2 text-gray-400">
                                No results found
                            </div>
                        )}

                        {onAddOption && search && (
                            <div
                                className="px-3 py-2 cursor-pointer bg-green-50 hover:bg-green-100 text-green-600 font-medium flex gap-1 items-center"
                                onClick={() => {
                                    onAddOption(search);
                                    setSearch("");
                                    setShowOptions(false);
                                }}
                            >
                            <IoAddCircleOutline className="h-5 w-5" />
                               Add “{search}”
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SelectInput;

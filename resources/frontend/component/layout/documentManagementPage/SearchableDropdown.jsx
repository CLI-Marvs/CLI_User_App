import React, {
    useState,
    useEffect,
    useRef,
    useMemo,
    useCallback,
} from "react";
import CheckedIcon from "../../../../../public/Images/checkbox_icon.svg";
import UncheckedIcon from "../../../../../public/Images/uncheck_box.svg";

const SearchableDropdown = ({
    options,
    selectedOptions,
    setSelectedOptions,
    optionKey = "id",
    optionLabel = "name",
    placeholder = "Select an option",
    getOptionLabel,
    showCheckbox = true,
    showSelectedTags = false,
    hideInputValue = true,
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const dropdownRef = useRef(null);
    const optionRefs = useRef({});

    const renderOption = (option) => {
        if (placeholder === "Select Account") {
            return (
                <div className="ml-4">
                    <span>{option.account_name}</span>
                    <br />
                    <span>{option.contract_no}</span>
                    <br />
                    <span>{option.property_name}</span>
                    <br />
                    <span>{option.unit_no}</span>
                </div>
            );
        } else if (placeholder === "Select Work Order Type") {
            return <span>{option.type_name}</span>;
        } else if (placeholder === "Select Assignee") {
            return (
                <div>
                    <span>
                        {option.firstname} {option.lastname}
                    </span>
                    <br />
                    <span>{option.employee_email}</span>
                </div>
            );
        } else {
            return <span>{option.account_name}</span>;
        }
    };

    const getLabel = useCallback(
        (option) => {
            if (typeof getOptionLabel === "function") {
                return getOptionLabel(option) || "";
            }
            if (optionLabel && option[optionLabel]) return option[optionLabel];
            if (option.name) return option.name;
            if (option.account_name) return option.account_name;
            return "";
        },
        [getOptionLabel, optionLabel]
    );

    const displayInputValue = useMemo(() => {
        if (hideInputValue) return "";
        if (isInputFocused) return searchTerm;
        if (Array.isArray(selectedOptions) && selectedOptions.length > 0) {
            return selectedOptions.map(getLabel).join(", ");
        }
        return "";
    }, [hideInputValue, isInputFocused, searchTerm, selectedOptions, getLabel]);

    const displayOptions = useMemo(() => {
        if (!searchTerm) return options;
        return options.filter((option) => {
            const label = getLabel(option);
            return (
                label && label.toLowerCase().includes(searchTerm.toLowerCase())
            );
        });
    }, [options, searchTerm, getLabel]);

    const handleSelect = useCallback(
        (optionToAdd) => {
            if (showCheckbox) {
                setSelectedOptions((prevSelected) => {
                    const current = Array.isArray(prevSelected)
                        ? prevSelected
                        : [];
                    const exists = current.find(
                        (o) => o[optionKey] === optionToAdd[optionKey]
                    );
                    return exists ? current : [...current, optionToAdd];
                });
            } else {
                setSelectedOptions([optionToAdd]);
            }
        },
        [setSelectedOptions, optionKey, showCheckbox]
    );

    const handleDeselect = useCallback(
        (optionToRemove) => {
            setSelectedOptions((prevSelected) => {
                const current = Array.isArray(prevSelected) ? prevSelected : [];
                return current.filter(
                    (o) => o[optionKey] !== optionToRemove[optionKey]
                );
            });
        },
        [setSelectedOptions, optionKey]
    );

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target)
            ) {
                setIsOpen(false);
                setIsInputFocused(false);
                setSearchTerm("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <div
                className="flex flex-wrap items-center mt-1 w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus-within:ring-indigo-500 focus-within:border-indigo-500 sm:text-sm rounded-md shadow-sm bg-white min-h-[42px]"
                onClick={() => {
                    setIsOpen(true);
                    setIsInputFocused(true);
                }}
            >
                {showSelectedTags &&
                    Array.isArray(selectedOptions) &&
                    selectedOptions.length > 0 && (
                        <div className="flex items-center justify-center h-full">
                            {selectedOptions.map((selectedOption) => (
                                <div
                                    key={selectedOption[optionKey]}
                                    className="flex items-center bg-custom-solidgreen text-white px-3 py-1 rounded-[10px] font-normal text-sm mr-2 mb-1"
                                >
                                    <span>{getLabel(selectedOption)}</span>
                                    <button
                                        className="ml-2 text-white hover:text-gray-200"
                                        tabIndex={-1}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeselect(selectedOption);
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                <input
                    type="text"
                    className="flex-1 min-w-[80px] border-none outline-none bg-transparent"
                    placeholder={
                        hideInputValue &&
                        Array.isArray(selectedOptions) &&
                        selectedOptions.length > 0
                            ? ""
                            : placeholder
                    }
                    value={displayInputValue}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setIsOpen(true);
                        setIsInputFocused(true);
                    }}
                    onFocus={() => {
                        setIsOpen(true);
                        setIsInputFocused(true);
                        if (selectedOptions.length > 0) {
                            setSearchTerm("");
                        }
                    }}
                    style={{ minWidth: 0 }}
                />
            </div>
            {isOpen && (
                <ul className="absolute z-10 mt-1 w-full bg-[#F7F7F7] p-5 shadow-lg max-h-60 rounded-md text-base ring-1 ring-black ring-opacity-5 overflow-auto sm:text-sm">
                    {displayOptions.length > 0 ? (
                        displayOptions.map((option) => {
                            const isSelected =
                                Array.isArray(selectedOptions) &&
                                selectedOptions.some(
                                    (selOpt) =>
                                        selOpt[optionKey] === option[optionKey]
                                );
                            return (
                                <li
                                    key={option[optionKey]}
                                    ref={(el) =>
                                        (optionRefs.current[option[optionKey]] =
                                            el)
                                    }
                                    className={`cursor-pointer select-none rounded-[10px] relative py-5 pl-6 mb-4 hover:bg-[#A8C18C] hover:bg-opacity-40 ${
                                        isSelected
                                            ? "bg-custom-lightestgreen font-semibold"
                                            : "bg-[#D7E9D066]"
                                    }`}
                                    onClick={() => {
                                        if (isSelected) {
                                            handleDeselect(option);
                                        } else {
                                            handleSelect(option);
                                        }

                                        if (!showCheckbox) {
                                            setIsOpen(false);
                                            setIsInputFocused(false);
                                            setSearchTerm("");
                                        }
                                    }}
                                >
                                    <div className="flex items-center">
                                        {showCheckbox && (
                                            <img
                                                src={
                                                    isSelected
                                                        ? CheckedIcon
                                                        : UncheckedIcon
                                                }
                                                alt="Checked Icon"
                                                className="mr-2 h-5 w-5"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            />
                                        )}
                                        <div className="flex-grow">
                                            {renderOption(option)}
                                        </div>
                                    </div>
                                </li>
                            );
                        })
                    ) : (
                        <li className="text-gray-500 py-2 px-3">
                            No options found
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
};

export default SearchableDropdown;

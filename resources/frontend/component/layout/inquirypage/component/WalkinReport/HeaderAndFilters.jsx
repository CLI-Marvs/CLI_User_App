import React, { useState, useEffect, useRef } from "react";
import { Filter } from "lucide-react";
import { MdCalendarToday } from "react-icons/md";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import { IoMdArrowDropdown } from "react-icons/io";

export const HeaderAndFilters = ({
    filters,
    onApply,
    onReset,
    branchesData,
    personTypes,
    emojis,
}) => {
    const [pendingFilters, setPendingFilters] = useState(filters);
    const [showEmojiDropdown, setShowEmojiDropdown] = useState(false);
    const emojiDropdownRef = useRef(null);

    //Hooks
    useEffect(() => {
        setPendingFilters(filters);
    }, [filters]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                emojiDropdownRef.current &&
                !emojiDropdownRef.current.contains(event.target)
            ) {
                setShowEmojiDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl montserrat-bold text-custom-gray12">
                        Emoji Insight Dashboard
                    </h1>
                    <p className="text-custom-gray71 mt-2 montserrat-regular">
                        Unified feedback analytics from queue and stand-alone
                        feature.
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white border border-custom-lightestgreen rounded-md shadow-sm">
                <div className="bg-custom-tablebg px-4 py-3 border-b">
                    <h2 className="text-lg font-semibold text-custom-bluegreen flex items-center montserrat-medium">
                        <Filter className="h-5 w-5 mr-2" />
                        Filters
                    </h2>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 p-2">
                        {/* Date From */}
                        <div className="space-y-2">
                            <label className="text-sm  montserrat-medium text-custom-gray12">
                                Date From
                            </label>
                            <div className="relative">
                                <DatePicker
                                    selected={
                                        pendingFilters.dateFrom
                                            ? new Date(pendingFilters.dateFrom)
                                            : null
                                    }
                                    onChange={(date) =>
                                        setPendingFilters((prev) => ({
                                            ...prev,
                                            dateFrom: date
                                                ? format(date, "yyyy-MM-dd")
                                                : "",
                                        }))
                                    }
                                    dateFormat="yyyy-MM-dd"
                                    className="w-full px-2 py-2 border border-custom-gray rounded-none sm:rounded-md border-b-2 border-b-custom-gray pl-[35px]"
                                    placeholderText="Select date"
                                />
                                <MdCalendarToday className="absolute left-2 top-1/2 -translate-y-1/2 text-custom-gray71 w-5 h-5 pointer-events-none" />
                            </div>
                        </div>

                        {/* Date To */}
                        <div className="space-y-2">
                            <label className="text-sm montserrat-medium text-custom-gray12">
                                Date To
                            </label>
                            <div className="relative">
                                <DatePicker
                                    selected={
                                        pendingFilters.dateTo
                                            ? new Date(pendingFilters.dateTo)
                                            : null
                                    }
                                    onChange={(date) =>
                                        setPendingFilters((prev) => ({
                                            ...prev,
                                            dateTo: date
                                                ? format(date, "yyyy-MM-dd")
                                                : "",
                                        }))
                                    }
                                    dateFormat="yyyy-MM-dd"
                                    className="w-full px-2 py-2 border border-custom-gray rounded-none sm:rounded-md border-b-2 border-b-custom-gray pl-[35px]"
                                    placeholderText="Select date"
                                />
                                <MdCalendarToday className="absolute left-2 top-1/2 -translate-y-1/2 text-custom-gray71 w-5 h-5 pointer-events-none" />
                            </div>
                        </div>

                        {/* Branch */}
                        <div className="space-y-2">
                            <label className="text-sm montserrat-medium text-custom-gray12">
                                Branch
                            </label>
                            <select
                                value={pendingFilters.branch}
                                onChange={(e) =>
                                    setPendingFilters((prev) => ({
                                        ...prev,
                                        branch: e.target.value,
                                    }))
                                }
                                className="w-full px-2 py-2 border border-custom-gray rounded-none sm:rounded-md border-b-2 border-b-custom-gray"
                            >
                                <option value="all">All Branches</option>
                                {branchesData &&
                                    branchesData?.map((branch) => (
                                        <option
                                            key={branch.id}
                                            value={branch.id}
                                        >
                                            {branch.name}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        {/* Person Type */}
                        <div className="space-y-2">
                            <label className="text-sm montserrat-medium text-custom-gray12">
                                Person Type
                            </label>
                            <select
                                value={pendingFilters.personType}
                                onChange={(e) =>
                                    setPendingFilters((prev) => ({
                                        ...prev,
                                        personType: e.target.value,
                                    }))
                                }
                                className="w-full px-2 py-2 border border-custom-gray rounded-none sm:rounded-md border-b-2 border-b-custom-gray"
                            >
                                <option value="all">All Types</option>
                                {personTypes &&
                                    personTypes?.map((type) => (
                                        <option key={type.id} value={type.id}>
                                            {type.name}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        {/* Source Type */}
                        <div className="space-y-2">
                            <label className="text-sm montserrat-medium text-custom-gray12">
                                Source Type
                            </label>
                            <select
                                value={pendingFilters.sourceType}
                                onChange={(e) =>
                                    setPendingFilters((prev) => ({
                                        ...prev,
                                        sourceType: e.target.value,
                                    }))
                                }
                                className="w-full px-2 py-2 border border-custom-gray rounded-none sm:rounded-md border-b-2 border-b-custom-gray"
                            >
                                <option value="all">All Sources</option>
                                <option value="Queue-linked">
                                    Queue-linked
                                </option>
                                <option value="Stand-alone">Stand-alone</option>
                            </select>
                        </div>

                        {/* Rating */}
                        <div
                            className="space-y-2 relative"
                            ref={emojiDropdownRef}
                        >
                            <label className="text-sm montserrat-medium text-custom-gray12">
                                Rating
                            </label>

                            <button
                                type="button"
                                className="w-full h-[40px] p-2 border border-custom-gray rounded-none sm:rounded-md border-b-2 border-b-custom-gray flex items-center gap-2 bg-white"
                                onClick={() => setShowEmojiDropdown((v) => !v)}
                            >
                                {pendingFilters.emojiRating ===
                                "All Ratings" ? (
                                    <span className="text-custom-gray12 text-base flex-1 text-left">
                                        All Ratings
                                    </span> // Ensures alignment and font
                                ) : (
                                    (() => {
                                        const emoji = emojis.find(
                                            (e) =>
                                                String(e.rating) ===
                                                String(
                                                    pendingFilters.emojiRating
                                                )
                                        );
                                        return emoji ? (
                                            <span
                                                className={`w-8 h-8 rounded-full flex items-center justify-center`}
                                            >
                                                <img
                                                    src={emoji.src}
                                                    alt={emoji.satifaction_name}
                                                    className="w-6 h-6"
                                                />
                                            </span>
                                        ) : (
                                            <span className="text-custom-gray12 text-base flex-1 text-left">
                                                All Ratings
                                            </span>
                                        );
                                    })()
                                )}
                            </button>

                            {showEmojiDropdown && (
                                <div className="absolute z-10 mt-2 w-full bg-white border border-custom-gray rounded-md shadow-lg max-h-60 overflow-auto">
                                    <div
                                        className="p-2 hover:bg-custom-grayF1 cursor-pointer"
                                        onClick={() => {
                                            setPendingFilters((prev) => ({
                                                ...prev,
                                                emojiRating: "All Ratings",
                                            }));
                                            setShowEmojiDropdown(false);
                                        }}
                                    >
                                        All Ratings
                                    </div>
                                    {emojis
                                        .sort((a, b) => b.rating - a.rating)
                                        .map((emoji) => (
                                            <div
                                                key={emoji.rating}
                                                className="flex items-center gap-2 p-2 hover:bg-custom-grayF1 cursor-pointer"
                                                onClick={() => {
                                                    setPendingFilters(
                                                        (prev) => ({
                                                            ...prev,
                                                            emojiRating:
                                                                emoji.rating,
                                                        })
                                                    );
                                                    setShowEmojiDropdown(false);
                                                }}
                                            >
                                                <span
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center `}
                                                >
                                                    <img
                                                        src={emoji.src}
                                                        alt={
                                                            emoji.satifaction_name
                                                        }
                                                        className="w-6 h-6"
                                                    />
                                                </span>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-4 pt-4 border-t border-custom-lightestgreen">
                        <button
                            onClick={() => onReset()}
                            className="px-4 py-2 rounded-md border border-custom-gray text-custom-gray71 hover:bg-custom-grayF1 transition text-sm"
                        >
                            Reset
                        </button>
                        <button
                            onClick={() => onApply(pendingFilters)}
                            className="px-4 py-2 rounded-md bg-custom-solidgreen hover:bg-custom-lightgreen text-white transition text-sm"
                        >
                            Search
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

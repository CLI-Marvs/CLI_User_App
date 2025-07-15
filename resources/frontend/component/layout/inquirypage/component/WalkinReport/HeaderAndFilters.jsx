import React, { useState, useEffect } from "react";
import { Download, Filter } from "lucide-react";
import { MdCalendarToday } from "react-icons/md";
import DatePicker from "react-datepicker";
import { format } from "date-fns";

export const HeaderAndFilters = ({
    filters,
    onApply,
    onReset,
    branchesData,
    personTypes,
    emojis,
}) => {
    const [pendingFilters, setPendingFilters] = useState(filters);

    useEffect(() => {
        setPendingFilters(filters);
    }, [filters]);

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
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
                                    className="w-full p-2 border border-custom-gray rounded-md pl-10"
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
                                    className="w-full p-2 border border-custom-gray rounded-md pl-10"
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
                                className="w-full p-2 border border-custom-gray rounded-md"
                            >
                                <option value="all">All Branches</option>
                                {branchesData?.map((branch) => (
                                    <option key={branch.id} value={branch.id}>
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
                                className="w-full p-2 border border-custom-gray rounded-md"
                            >
                                <option value="all">All Types</option>
                                {personTypes?.map((type) => (
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
                                className="w-full p-2 border border-custom-gray rounded-md"
                            >
                                <option value="all">All Sources</option>
                                <option value="Queue-linked">
                                    Queue-linked
                                </option>
                                <option value="Stand-alone">Stand-alone</option>
                            </select>
                        </div>

                        {/* Rating */}
                        <div className="space-y-2">
                            <label className="text-sm montserrat-medium text-custom-gray12">
                                Rating
                            </label>
                            <select
                                value={pendingFilters.emojiRating}
                                onChange={(e) =>
                                    setPendingFilters((prev) => ({
                                        ...prev,
                                        emojiRating: e.target.value,
                                    }))
                                }
                                className="w-full p-2 border border-custom-gray rounded-md"
                            >
                                <option value="All Ratings">All Ratings</option>
                                {emojis
                                    .sort((a, b) => b.rating - a.rating)
                                    .map((emoji) => (
                                        <option
                                            key={emoji.rating}
                                            value={emoji.rating}
                                        >
                                            {emoji.satifaction_name}
                                        </option>
                                    ))}
                            </select>
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

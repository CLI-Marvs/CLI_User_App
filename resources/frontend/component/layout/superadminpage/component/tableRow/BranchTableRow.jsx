import React, { useState,useEffect } from "react";
import { HiPencil } from "react-icons/hi";
import { MdDelete, MdContentCopy } from "react-icons/md";
import CustomToolTip from "@/component/CustomToolTip";

const BranchTableRow = ({ item, onCopyAll, onEdit, onDelete }) => {
    const linkLabels = {
        queue: "Main URL",
        serving_display_1: "Serving Display 1",
        // serving_display_2: "Serving Display 2",
        survey: "Survey",
        stand_alone_survey: "Stand-alone Survey",
    };

    return (
        <tr className="text-center border-b border-gray-200 hover:bg-gray-100 transition-colors">
            <td className="montserrat-medium py-2">{item?.name}</td>
            <td className="montserrat-regular py-2">
                <div className="flex flex-col gap-2">
                    {item?.url &&
                        Object.keys(item.url).map((key) => {
                            return (
                                <div
                                    key={key}
                                    className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-1 sm:gap-3"
                                >
                                    {/* Label with arrow - keeps together on small screens */}
                                    <div className="flex items-center justify-center gap-1 text-sm sm:text-base whitespace-nowrap">
                                        <span>{linkLabels[key] || key}</span>
                                        <span className="text-gray-500">
                                            &rarr;
                                        </span>
                                    </div>

                                    {/* Link - breaks properly on small screens */}
                                    <a
                                        href={item.url[key]}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block text-blue-600 hover:text-blue-800 underline underline-offset-4 cursor-pointer text-sm sm:text-base break-all sm:break-normal max-w-full"
                                    >
                                        {item.url[key]}
                                    </a>
                                </div>
                            );
                        })}
                </div>
            </td>
            <td className="py-2 montserrat-regular">
                <div className="flex justify-center items-center gap-x-2">
                    <CustomToolTip text="Copy all links" position="top">
                        <button
                            onClick={() => onCopyAll(item.url)}
                            className="p-1 rounded hover:bg-gray-200 transition-colors"
                        >
                            <MdContentCopy className="w-5 h-5 sm:w-6 sm:h-6 text-custom-bluegreen cursor-pointer" />
                        </button>
                    </CustomToolTip>

                    <CustomToolTip text="Edit branch" position="top">
                        <button
                            onClick={() => onEdit(item)}
                            className="p-1 rounded hover:bg-gray-200 transition-colors"
                        >
                            <HiPencil className="w-4 h-4 sm:w-5 sm:h-5 text-custom-bluegreen cursor-pointer" />
                        </button>
                    </CustomToolTip>

                    <CustomToolTip
                        text="Delete branch"
                        position="left"
                    >
                        <button
                            onClick={() => onDelete(item)}
                            className="p-1 rounded hover:bg-red-100 transition-colors"
                        >
                            <MdDelete className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 cursor-pointer" />
                        </button>
                    </CustomToolTip>
                </div>
            </td>
        </tr>
    );
};

export default BranchTableRow;

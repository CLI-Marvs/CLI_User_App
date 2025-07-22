import React from "react";
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
            <td className="montserrat-regular py-2 h-auto flex flex-col gap-1">
                {item?.url &&
                    Object.keys(item.url).map((key) => {
                        return (
                            <div className="flex items-center justify-center gap-x-3">
                                <div>{linkLabels[key] || key} &rarr;</div>
                                <a
                                    href={item.url[key]}
                                    key={key}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-blue-600 hover:text-blue-800"
                                >
                                    <div className="underline-offset-4 underline cursor-pointer ">
                                        {item.url[key]}
                                    </div>
                                </a>
                            </div>
                        );
                    })}
            </td>
            <td className="py-2 montserrat-regular">
                <div className="flex justify-center items-center gap-x-2">
                    <CustomToolTip text="Copy all links" position="top">
                        <button onClick={() => onCopyAll(item.url)}>
                            <MdContentCopy className="w-6 h-6 text-custom-bluegreen cursor-pointer" />
                        </button>
                    </CustomToolTip>

                    <CustomToolTip text="Edit branch" position="top">
                        <button onClick={() => onEdit(item)}>
                            <HiPencil className="w-5 h-5 text-custom-bluegreen cursor-pointer" />
                        </button>
                    </CustomToolTip>

                    <CustomToolTip text="Delete branch" position="top">
                        <button onClick={() => onDelete(item)}>
                            <MdDelete className="w-6 h-6 text-red-500 cursor-pointer" />
                        </button>
                    </CustomToolTip>
                    {/* <button onClick={() => onDelete(item)}>
                        <MdDelete className="w-6 h-6 text-red-500 cursor-pointer" />
                    </button> */}
                </div>
            </td>
        </tr>
    );
};

export default BranchTableRow;

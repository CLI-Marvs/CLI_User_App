import React from "react";
import CustomInput from "@/component/Input/CustomInput";
import { FaRegTrashAlt } from "react-icons/fa";

const FloorPremiumRow = ({
    floorNumber,
    floorData,
    priceListData,
    onChangeFloorPremium,
    handleOpenModal,
    handleRemoveFloorPremium,
}) => {
    return (
        <tr
            key={floorNumber}
            className="h-[46px] bg-white text-sm flex items-center "
        >
            <td className="text-custom-gray81 pl-4 w-[150px]">{floorNumber}</td>
            <td className="w-[150px]">
                <CustomInput
                    type="number"
                    name="premiumCost"
                    id="premiumCost"
                    value={floorData.premiumCost || ""}
                    className="bg-white h-[29px] w-[120px] border border-[#D9D9D9] rounded-[5px] px-2 outline-none text-center"
                    onChange={(e) => onChangeFloorPremium(floorNumber, e)}
                    restrictNumbers={true}
                    disabled={priceListData?.data?.status !== "Draft"}
                />
            </td>
            <td className="w-[150px]">
                <input
                    onChange={(e) => onChangeFloorPremium(floorNumber, e)}
                    checked={floorData.luckyNumber || false}
                    name="luckyNumber"
                    id="luckyNumber"
                    type="checkbox"
                    className="h-[16px] w-[16px] ml-[20px] rounded-[2px] appearance-none border border-gray-400 checked:bg-transparent checked:before:bg-black checked:before:w-[12px] checked:before:h-[12px] checked:before:block checked:before:content-['']"
                    disabled={priceListData?.data?.status !== "Draft"}
                />
            </td>
            <td
                onClick={() => handleOpenModal(floorNumber)}
                className="text-blue-500 underline cursor-pointer w-[150px]"
            >
                {priceListData?.data?.status === "Draft" ? "Assign" : "View"}
            </td>
            {priceListData?.data?.status === "Draft" && (
                <td>
                    <FaRegTrashAlt
                        onClick={() => handleRemoveFloorPremium(floorNumber)}
                        className="size-5 text-custom-gray81 hover:text-red-500 cursor-pointer"
                    />
                </td>
            )}
        </tr>
    );
};

export default FloorPremiumRow;

import React from "react";
import { toLowerCaseText } from "@/util/formatToLowerCase";

const PriceVersionRow = ({ item }) => {
   
    return (
        <tr
            key={item.property_masters_id} 
            className="flex gap-[10px] overflow-hidden p-1 border-b border-custom-lightestgreen py-6"
        >
            {/* Property Name and Edit */}
            <td className="flex flex-col gap-[10px] justify-center w-[169px] p-[20px] rounded-[10px] shadow-custom5">
                <p className="montserrat-semibold text-sm leading-[17px]">
                    {toLowerCaseText(item?.propertyName)}
                    {item?.tower_phase_name
                        ? `, Tower ${item?.tower_phase_name}`
                        : ""}
                </p>
            </td>

            {/* Price Versions Table */}
            <td className="rounded-[10px] shadow-custom5 text-sm w-[572px] overflow-hidden">
                <table className="w-full border-collapse">
                    <tbody>
                        {item?.versions.map((versionItem, versionIndex) => {
                          
                            return (
                                <tr
                                    key={versionItem.id || versionIndex}
                                    className="flex items-center bg-white gap-[30px]"
                                >
                                    <td className="w-[150px] p-[15px]">
                                        {versionItem?.version}
                                    </td>
                                    <td className="w-[100px] p-[15px]">
                                        {versionItem?.percent_increase} %
                                    </td>
                                    <td className="w-[100px] p-[15px] px-10">
                                        {versionItem?.no_of_allowed_buyers}
                                    </td>
                                    <td className="w-[120px] p-[15px]">
                                        {versionItem?.expiry_date}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </td>
        </tr>
    );
};

export default PriceVersionRow;

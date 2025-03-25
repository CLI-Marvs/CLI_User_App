import React from "react";
import CustomTableHeader from "@/component/layout/propertyandpricingpage/component/CustomTableHeader";
import Skeleton from "@/component/Skeletons";

const CustomTable = ({ isLoading, columns, data, renderRow, className }) => {
    return (
        <table>
            <CustomTableHeader columns={columns} className={className} />
            <tbody className="">
                {isLoading ? (
                    <tr>
                        <td className="w-full mt-1">
                            <Skeleton height={140} />
                            <Skeleton height={140} />
                            <Skeleton height={140} />
                        </td>
                    </tr>
                ) : data && data.length > 0 ? (
                    data.map(renderRow)
                ) : (
                    <tr>
                        <td
                            colSpan={8}
                            className="text-center py-4 text-custom-bluegreen"
                        >
                            No data found
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    );
};

export default CustomTable;

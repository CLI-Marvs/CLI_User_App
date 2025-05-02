import React from "react";
import CustomTableHeader from "@/component/layout/propertyandpricingpage/component/CustomTableHeader";
import Skeleton from "@/component/Skeletons";

const CustomTable = ({
    isLoading,
    columns,
    data,
    renderRow,
    className,
    tableSkeleton = 140,
    tableClassName = "w-full"
}) => {
    return (
        <div className={tableClassName}>
            <table className="w-full border-collapse">
                <CustomTableHeader columns={columns} className={className} />
                <tbody className="">
                    {isLoading ? (
                        <tr>
                            <td className="w-full mt-1">
                                <Skeleton height={tableSkeleton} className="my-1" />
                                <Skeleton height={tableSkeleton} className="my-1" />
                                <Skeleton height={tableSkeleton} className="my-1" />
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
                                No data available
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default CustomTable;

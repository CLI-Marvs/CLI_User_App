import React from "react";
import CustomTableHeader from "frontend/component/layout/propertyandpricingpage/component/CustomTableHeader";
import Skeleton from "frontend/component/Skeletons";

const CustomTable = ({
    isLoading,
    columns,
    data,
    renderRow,
    className,
    tableSkeleton = 140,
    tableClassName = "w-full",
    textAlign,
}) => {
    return (
        <div className={tableClassName}>
            <table className="w-full border-collapse">
                <CustomTableHeader
                    columns={columns}
                    className={className}
                    textAlign={textAlign}
                />
                <tbody className="">
                    {isLoading ? (
                        <tr>
                            <td className="w-full mt-1">
                                <Skeleton
                                    height={tableSkeleton}
                                    className="my-1"
                                />
                                <Skeleton
                                    height={tableSkeleton}
                                    className="my-1"
                                />
                                <Skeleton
                                    height={tableSkeleton}
                                    className="my-1"
                                />
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

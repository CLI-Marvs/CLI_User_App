import React from "react";

const SkeletonBox = ({ className }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

const WalkinReportSkeleton = () => {
    return (
        <div className="min-h-screen bg-custombg p-6">
            <div className="max-w-1xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <SkeletonBox className="h-8 w-60 mb-2" />
                        <SkeletonBox className="h-4 w-96" />
                    </div>
                    <SkeletonBox className="h-10 w-40" />
                </div>

                {/* Filters */}
                <div className="bg-white border rounded-md shadow-sm">
                    <div className="bg-custom-tablebg px-6 py-4">
                        <SkeletonBox className="h-6 w-32" />
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="space-y-2">
                                <SkeletonBox className="h-4 w-24" />
                                <SkeletonBox className="h-10 w-full" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-white border rounded-md p-6">
                            <div className="flex justify-between items-center">
                                <div className="space-y-2">
                                    <SkeletonBox className="h-4 w-32" />
                                    <SkeletonBox className="h-8 w-16" />
                                </div>
                                <SkeletonBox className="h-12 w-12 rounded-full" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white border rounded-md p-6 space-y-4">
                        <SkeletonBox className="h-6 w-64" />
                        <SkeletonBox className="h-[300px] w-full" />
                    </div>
                    <div className="bg-white border rounded-md p-6 space-y-4">
                        <SkeletonBox className="h-6 w-64" />
                        <SkeletonBox className="h-[300px] w-full" />
                    </div>
                </div>

                {/* Tabs */}
                <div className="space-y-4">
                    <div className="flex space-x-2">
                        <SkeletonBox className="h-10 w-40 rounded-md" />
                        <SkeletonBox className="h-10 w-40 rounded-md" />
                    </div>

                    <div className="bg-white border rounded-md overflow-x-auto">
                        <SkeletonBox className="h-12 w-full bg-custom-tablebg" />
                        <table className="min-w-full">
                            <thead className="bg-custom-lightestgreen">
                                <tr>
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <th key={i} className="px-6 py-3">
                                            <SkeletonBox className="h-4 w-20" />
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: 4 }).map(
                                    (_, rowIndex) => (
                                        <tr key={rowIndex} className="divide-x">
                                            {Array.from({ length: 6 }).map(
                                                (_, colIndex) => (
                                                    <td
                                                        key={colIndex}
                                                        className="px-6 py-4"
                                                    >
                                                        <SkeletonBox className="h-4 w-full" />
                                                    </td>
                                                )
                                            )}
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WalkinReportSkeleton;

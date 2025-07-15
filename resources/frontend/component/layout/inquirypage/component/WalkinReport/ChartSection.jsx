import React, { useState, useMemo } from "react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
} from "recharts";
import Pagination from "@/component/layout/propertyandpricingpage/component/Pagination";
import { paginate } from "@/component/layout/inquirypage/component/utils/paginate";
const COLORS = ["#348017", "#70AD47", "#1A73E8", "#5B9BD5", "#175D5F"];

const ChartsSection = ({ analytics, emojis }) => {
    const [branchPage, setBranchPage] = useState(1);
    const branchesPerPage = 5;

    const totalBranches = analytics.branchData?.length || 0;
    const totalPages = Math.ceil(totalBranches / branchesPerPage);

    const paginatedBranchData = paginate(analytics.branchData, {
        page: branchPage,
        pageSize: branchesPerPage,
    });

    const EmojiYAxisTick = (props) => {
        const { x, y, payload } = props;
        const emojiObj = emojis.find((e) => e.rating === Number(payload.value));
        return (
            <g transform={`translate(${x},${y})`}>
                <text
                    x={0}
                    y={0}
                    dy={6}
                    textAnchor="end"
                    fill="#666"
                    fontSize={12}
                >
                    {payload.value}
                </text>
                {emojiObj && (
                    <image
                        href={emojiObj.src}
                        x={8}
                        y={-12}
                        width={18}
                        height={18}
                    />
                )}
            </g>
        );
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Type Distribution */}
            <div className="bg-white border border-custom-lightestgreen rounded-md shadow-sm">
                <div className="bg-custom-tablebg px-4 py-3 border-b">
                    <h2 className="text-lg montserrat-semibold text-custom-bluegreen">
                        Customer Type Distribution (Queue-linked)
                    </h2>
                </div>
                <div className="p-6">
                    {analytics.customerTypeData &&
                    analytics.customerTypeData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={analytics.customerTypeData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    dataKey="value"
                                    labelLine={false}
                                    label={({ name, percent }) =>
                                        `${name} ${(percent * 100).toFixed(0)}%`
                                    }
                                >
                                    {analytics?.customerTypeData?.map(
                                        (entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={
                                                    COLORS[
                                                        index % COLORS.length
                                                    ]
                                                }
                                            />
                                        )
                                    )}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-sm text-gray-500 montserrat-regular">
                            No customer type data available.
                        </p>
                    )}
                </div>
            </div>

            {/* Average Rating by Branch */}
            <div className="bg-white border border-custom-lightestgreen rounded-md shadow-sm">
                <div className="bg-custom-tablebg px-4 py-3 border-b">
                    <h2 className="text-lg montserrat-semibold text-custom-bluegreen">
                        Average Rating by Branch
                    </h2>
                </div>
                <div className="p-6">
                    {paginatedBranchData && paginatedBranchData.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={paginatedBranchData}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#D6E4D1"
                                    />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis
                                        domain={[0, 5]}
                                        tick={<EmojiYAxisTick />}
                                        tickCount={6}
                                    />
                                    <Tooltip
                                        formatter={(value, name) => [
                                            value,
                                            "Average Rating",
                                        ]}
                                        labelFormatter={(label) =>
                                            `Branch: ${label}`
                                        }
                                    />
                                    <Bar
                                        dataKey="average"
                                        fill="#348017"
                                        radius={[4, 4, 0, 0]}
                                        barSize={
                                            paginatedBranchData.length === 1
                                                ? "100%"
                                                : paginatedBranchData.length > 5
                                                ? 18
                                                : 100
                                        }
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                            {/* Pagination Controls */}
                            <div className="flex justify-end mt-4 space-x-2">
                                <Pagination
                                    pageCount={totalPages || 1}
                                    currentPage={branchPage}
                                    onPageChange={setBranchPage}
                                />
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-gray-500 montserrat-regular">
                            No branch rating data available.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChartsSection;

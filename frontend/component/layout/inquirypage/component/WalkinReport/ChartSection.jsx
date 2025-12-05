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
    Legend,
} from "recharts";
import Pagination from "frontend/component/layout/propertyandpricingpage/component/Pagination";
import { paginate } from "frontend/component/layout/inquirypage/component/utils/paginate";
import EmojiYAxisTick from "frontend/component/layout/inquirypage/component/WalkinReport/component/EmojiYAxisTick";
import CustomXAxisTick from "frontend/component/layout/inquirypage/component/WalkinReport/component/CustomXAxisTick";

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

    //Rendering labels for pie chart
    const ResponsivePieLabel = ({ name, percent, x, y, index }) => {
        const fontSize = window.innerWidth < 640 ? 10 : 14;
        const offset = window.innerWidth < 640 ? 10 : 0;
        return (
            <text
                x={x}
                y={y - offset}
                fontSize={fontSize}
                fill={COLORS[index % COLORS.length]}
                textAnchor="middle"
                alignmentBaseline="middle"
                style={{
                    letterSpacing: 1,
                    pointerEvents: "none",
                    fontWeight: 600,
                }}
            >
                {`${name} ${(percent * 100).toFixed(0)}%`}
            </text>
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
                    {!!analytics.customerTypeData &&
                        analytics.customerTypeData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart width={300} height={300}>
                                <Pie
                                    data={analytics.customerTypeData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={
                                        window.innerWidth < 640 ? 50 : 90
                                    }
                                    dataKey="value"
                                    labelLine={true}
                                    label={({
                                        name,
                                        percent,
                                        cx,
                                        cy,
                                        midAngle,
                                        outerRadius,
                                        index,
                                    }) => {
                                        const RADIAN = Math.PI / 180;
                                        // Keep label closer to the pie
                                        const labelRadius =
                                            outerRadius +
                                            (window.innerWidth < 640 ? 10 : 20);
                                        const labelX =
                                            cx +
                                            labelRadius *
                                            Math.cos(-midAngle * RADIAN);
                                        const labelY =
                                            cy +
                                            labelRadius *
                                            Math.sin(-midAngle * RADIAN);
                                        const fontSize =
                                            analytics.customerTypeData.length >
                                                6
                                                ? window.innerWidth < 640
                                                    ? 7
                                                    : 10
                                                : window.innerWidth < 640
                                                    ? 10
                                                    : 14;
                                        return (
                                            <text
                                                x={labelX}
                                                y={labelY}
                                                fontSize={fontSize}
                                                fill={
                                                    COLORS[
                                                    index % COLORS.length
                                                    ]
                                                }
                                                textAnchor={
                                                    labelX > cx
                                                        ? "start"
                                                        : "end"
                                                }
                                                alignmentBaseline="middle"
                                                style={{
                                                    letterSpacing: 1,
                                                    pointerEvents: "none",
                                                    fontWeight: 600,
                                                    whiteSpace: "pre",
                                                }}
                                            >
                                                {`${name} ${(
                                                    percent * 100
                                                ).toFixed(0)}%`}
                                            </text>
                                        );
                                    }}
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
                        <div className="">
                            <p className="text-sm text-gray-500 montserrat-regular">
                                No customer type data available.
                            </p>
                        </div>
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
                                <BarChart
                                    data={paginatedBranchData}
                                    margin={{
                                        top: 20,
                                        right: 40,
                                        left: 0,
                                        bottom: 20,
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#D6E4D1"
                                    />
                                    <XAxis
                                        dataKey="name"
                                        tick={<CustomXAxisTick />}
                                        interval={0}
                                    />

                                    <YAxis
                                        domain={[0, 5]}
                                        tick={
                                            <EmojiYAxisTick emojis={emojis} />
                                        }
                                        tickCount={6}
                                        tickMargin={32}
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
                                            window.innerWidth < 640
                                                ? 12
                                                : paginatedBranchData.length ===
                                                    1
                                                    ? "100%"
                                                    : paginatedBranchData.length > 5
                                                        ? 20
                                                        : 95
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

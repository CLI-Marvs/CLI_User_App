import React, { useState, useEffect } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Line,
    Legend,
    Area,
    AreaChart,
} from "recharts";
import {
    DocumentTextIcon,
    CheckCircleIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    CalendarIcon,
    BellIcon,
    ChartBarIcon,
    ChartPieIcon,
    ArrowPathIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import {
    CheckCircleIcon as CheckCircleSolid,
    ExclamationTriangleIcon as ExclamationTriangleSolid,
    ArrowUpIcon as ArrowUpSolid,
    ArrowDownIcon as ArrowDownSolid,
} from "@heroicons/react/24/solid";
import CountUp from "react-countup";
import { format } from "date-fns";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
    getDashboardData,
    getCachedDashboardData,
    revalidateDashboardData,
    invalidateDashboardData,
} from "./service/dashboardDataService.jsx";
import EmployeeEvaluationModal from "./EmployeeEvaluationModal";

// Color constants
const COLORS = {
    primary: "#3b82f6",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#06b6d4",
};

const STATUS_COLORS = {
    Complete: "#10b981",
    "In Progress": "#3b82f6",
    Pending: "#f59e0b",
    Overdue: "#ef4444",
    Assigned: "#06b6d4",
};

const PRIORITY_COLORS = {
    Critical: "#ef4444",
    High: "#f59e0b",
    Medium: "#06b6d4",
    Low: "#10b981",
};

const KPICard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    color = "primary",
    loading: cardLoading,
    onClick,
}) => {
    const colorMap = {
        primary: COLORS.primary,
        success: COLORS.success,
        warning: COLORS.warning,
        error: COLORS.error,
        info: COLORS.info,
    };

    if (cardLoading) {
        return (
            <div className="p-4 h-full">
                <div className="animate-pulse h-36 rounded-md bg-gray-200" />
            </div>
        );
    }

    return (
        <div
            onClick={onClick}
            className="relative p-4 h-full bg-white rounded-lg shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer overflow-hidden"
            style={{ borderLeft: `4px solid ${colorMap[color]}` }}
        >
            <div className="flex flex-col justify-between h-full">
                <div className="flex items-center gap-3 mb-3">
                    <div
                        className="flex items-center justify-center w-10 h-10 rounded-full"
                        style={{
                            backgroundColor: `${colorMap[color]}20`,
                            color: colorMap[color],
                        }}
                    >
                        <Icon className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">
                            {title}
                        </p>
                        <p className="text-2xl font-bold text-gray-800">
                            <CountUp
                                end={
                                    typeof value === "string"
                                        ? parseFloat(value)
                                        : value
                                }
                                duration={1.5}
                                decimals={
                                    value.toString().includes(".") ? 1 : 0
                                }
                                suffix={
                                    typeof value === "string" &&
                                    value.includes("%")
                                        ? "%"
                                        : ""
                                }
                                formattingFn={(value) =>
                                    typeof value === "number" && value >= 1000
                                        ? `${(value / 1000).toFixed(1)}k`
                                        : value.toString()
                                }
                            />
                        </p>
                    </div>
                </div>
                <div className="flex justify-between items-end">
                    <p className="text-xs text-gray-500">{subtitle}</p>
                    {trend !== undefined && (
                        <div className="flex items-center space-x-1">
                            {trend > 0 ? (
                                <ArrowUpSolid className="w-3.5 h-3.5 text-green-500" />
                            ) : (
                                <ArrowDownSolid className="w-3.5 h-3.5 text-red-500" />
                            )}
                            <span
                                className={`text-xs font-medium ${
                                    trend > 0
                                        ? "text-green-500"
                                        : "text-red-500"
                                }`}
                            >
                                {Math.abs(trend)}%
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ExecutiveDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState("week");
    const [searchQuery, setSearchQuery] = useState("");
    const [evalOpen, setEvalOpen] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const loadDashboard = async () => {
            const cachedData = getCachedDashboardData();
            if (isMounted && cachedData) {
                setDashboardData(cachedData);
                setLoading(false);
            } else if (isMounted) {
                setLoading(true);
            }

            try {
                const freshData = await revalidateDashboardData();
                if (isMounted && freshData) {
                    setDashboardData(freshData);
                }
            } catch (err) {
                if (isMounted) {
                    console.error("Failed to refresh dashboard data:", err);
                    setError(err);
                    if (!cachedData) {
                        const message = err.response
                            ? `Request failed with status ${err.response.status}`
                            : err.message;
                        toast.error(
                            `Failed to load dashboard data: ${message}`
                        );
                    }
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadDashboard();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleRefresh = async () => {
        setLoading(true);
        setError(null);
        try {
            invalidateDashboardData();
            const data = await revalidateDashboardData();
            setDashboardData(data);
            toast.success("Dashboard data refreshed successfully!");
        } catch (err) {
            console.error("Failed to refresh dashboard data:", err);
            setError(err);
            const message =
                err.response && err.response.data && err.response.data.message
                    ? err.response.data.message
                    : err.message;
            toast.error(`Failed to refresh dashboard data: ${message}`);
        } finally {
            setLoading(false);
        }
    };

    const renderCustomizedLabel = ({
        cx,
        cy,
        midAngle,
        innerRadius,
        outerRadius,
        percent,
        index,
        name,
    }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180);
        const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180);

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={12}
                fontWeight={600}
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    if (loading) {
        return (
            <div className="container max-w-screen-xl mx-auto py-8 px-4">
                <div className="mb-8">
                    <div className="animate-pulse h-10 w-1/3 bg-gray-200 rounded mb-2"></div>
                    <div className="animate-pulse h-5 w-1/2 bg-gray-200 rounded"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="animate-pulse h-36 bg-gray-200 rounded-lg"
                        ></div>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    <div className="animate-pulse h-80 bg-gray-200 rounded-lg"></div>
                    <div className="animate-pulse h-80 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="animate-pulse h-96 bg-gray-200 rounded-lg mt-6"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                    <div className="animate-pulse h-96 bg-gray-200 rounded-lg lg:col-span-2"></div>
                    <div className="animate-pulse h-96 bg-gray-200 rounded-lg"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container max-w-screen-xl mx-auto py-8 px-4">
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <ExclamationTriangleSolid className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-red-500 mb-2">
                        Error loading dashboard
                    </h2>
                    <p className="text-gray-600 mb-4">
                        {error.message || "An unknown error occurred"}
                    </p>
                    <p className="text-sm text-gray-500">
                        Please try again later or contact support if the problem
                        persists.
                    </p>
                </div>
            </div>
        );
    }

    if (!dashboardData) {
        return null;
    }

    const filteredAlerts = dashboardData.systemAlerts.filter(
        (alert) =>
            alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            alert.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (alert.workOrderId &&
                alert.workOrderId.toString().includes(searchQuery))
    );

    return (
        <div className="container max-w-screen-xl mx-auto py-8 px-4">
            <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex border-b border-gray-200">
                        {["week", "month", "quarter"].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-4 py-2 text-xs font-medium ${
                                    timeRange === range
                                        ? "text-blue-600 border-b-2 border-blue-600"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                {range.charAt(0).toUpperCase() + range.slice(1)}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center border border-gray-300 rounded-full px-3 py-1 text-sm text-gray-600">
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        <span>
                            Last updated:{" "}
                            {format(new Date(), "MMM dd, hh:mm a")}
                        </span>
                    </div>
                    <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                        <BellIcon className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                        onClick={() => setEvalOpen(true)}
                        className="gradient-btn5 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                        Employee Evaluation
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <KPICard
                    title="Total WOs"
                    value={dashboardData.kpis.totalWorkOrders}
                    subtitle="Active work orders"
                    icon={DocumentTextIcon}
                    color="primary"
                    loading={loading}
                />
                <KPICard
                    title="Completed WOs"
                    value={dashboardData.kpis.completedWorkOrders}
                    subtitle="All work orders completed"
                    icon={CheckCircleIcon}
                    color="success"
                    trend={dashboardData.kpis.completedWorkOrders > 0 ? 12 : 0}
                    loading={loading}
                />
                <KPICard
                    title="WOs in Progress"
                    value={dashboardData.kpis.pendingWorkOrders}
                    subtitle="Contains pending work orders"
                    icon={ClockIcon}
                    color="warning"
                    trend={dashboardData.kpis.pendingWorkOrders > 0 ? -5 : 0}
                    loading={loading}
                />
                <KPICard
                    title="Overdue WOs"
                    value={dashboardData.kpis.overdueWorkOrders}
                    subtitle="Contains overdue work orders"
                    icon={ExclamationTriangleIcon}
                    color="error"
                    trend={dashboardData.kpis.overdueWorkOrders > 0 ? 8 : 0}
                    loading={loading}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="px-5 pt-5 pb-2 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Work Orders by Status
                        </h3>
                        <button className="p-1 text-gray-500 hover:text-gray-700">
                            <ChartPieIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="h-80 p-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={dashboardData.workOrdersByStatus}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={2}
                                    dataKey="value"
                                    label={renderCustomizedLabel}
                                    labelLine={false}
                                >
                                    {dashboardData.workOrdersByStatus.map(
                                        (entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={
                                                    STATUS_COLORS[entry.name] ||
                                                    "#9ca3af"
                                                }
                                            />
                                        )
                                    )}
                                </Pie>
                                <RechartsTooltip
                                    formatter={(value, name, props) => [
                                        value,
                                        `${name}: ${(
                                            props.payload.percent * 100
                                        ).toFixed(1)}%`,
                                    ]}
                                />
                                <Legend
                                    layout="horizontal"
                                    verticalAlign="bottom"
                                    align="center"
                                    formatter={(value, entry, index) => (
                                        <span className="text-xs text-gray-700 ml-1">
                                            {value}
                                        </span>
                                    )}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="px-5 pt-5 pb-2 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Work Orders by Type
                        </h3>
                        <button className="p-1 text-gray-500 hover:text-gray-700">
                            <ChartBarIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="h-80 p-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={dashboardData.workOrdersByType}
                                margin={{
                                    top: 20,
                                    right: 20,
                                    left: 0,
                                    bottom: 20,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="type"
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis tickLine={false} axisLine={false} />
                                <RechartsTooltip
                                    cursor={{
                                        fill: "rgba(243, 244, 246, 0.5)",
                                    }}
                                    contentStyle={{
                                        borderRadius: "0.5rem",
                                        border: "none",
                                        boxShadow:
                                            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                                        backgroundColor: "#fff",
                                    }}
                                />
                                <Legend
                                    layout="horizontal"
                                    verticalAlign="bottom"
                                    align="center"
                                />
                                <Bar
                                    dataKey="count"
                                    name="Total"
                                    radius={[4, 4, 0, 0]}
                                    fill={COLORS.primary}
                                />
                                <Bar
                                    dataKey="completed"
                                    name="Complete"
                                    radius={[4, 4, 0, 0]}
                                    fill={COLORS.success}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                <div className="px-5 pt-5 pb-2 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Monthly Performance Trends
                    </h3>
                    <div className="flex gap-2">
                        {["Created", "Completed", "Efficiency"].map((label) => (
                            <div
                                key={label}
                                className="flex items-center border border-gray-300 rounded-full px-3 py-1 text-xs"
                            >
                                {label === "Created" && (
                                    <ArrowUpSolid className="w-3.5 h-3.5 text-blue-500 mr-1" />
                                )}
                                {label === "Completed" && (
                                    <CheckCircleSolid className="w-3.5 h-3.5 text-green-500 mr-1" />
                                )}
                                {label === "Efficiency" && (
                                    <ArrowPathIcon className="w-3.5 h-3.5 text-yellow-500 mr-1" />
                                )}
                                {label}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="h-96 p-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={dashboardData.monthlyTrends}
                            margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient
                                    id="colorCreated"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="5%"
                                        stopColor={COLORS.primary}
                                        stopOpacity={0.8}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor={COLORS.primary}
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                                <linearGradient
                                    id="colorCompleted"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="5%"
                                        stopColor={COLORS.success}
                                        stopOpacity={0.8}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor={COLORS.success}
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke="#e5e7eb"
                            />
                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                yAxisId="left"
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                tickLine={false}
                                axisLine={false}
                            />
                            <RechartsTooltip
                                contentStyle={{
                                    borderRadius: "0.5rem",
                                    border: "none",
                                    boxShadow:
                                        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                                    backgroundColor: "#fff",
                                }}
                            />
                            <Area
                                yAxisId="left"
                                type="monotone"
                                dataKey="created"
                                stroke={COLORS.primary}
                                fillOpacity={1}
                                fill="url(#colorCreated)"
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                            <Area
                                yAxisId="left"
                                type="monotone"
                                dataKey="complete"
                                stroke={COLORS.success}
                                fillOpacity={1}
                                fill="url(#colorCompleted)"
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                connectNulls={true}
                                dataKey="efficiency"
                                stroke={COLORS.warning}
                                strokeWidth={2}
                                dot={{ r: 3 }}
                                activeDot={{ r: 5 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="px-5 pt-5 pb-2 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Recent Work Orders
                        </h3>
                        <div className="flex gap-1">
                            <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
                                <FunnelIcon className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleRefresh}
                                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                            >
                                <ArrowPathIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <div className="px-4 pb-4">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Work Order
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            STEP
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Accounts
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Assignees
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Priority
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Days Open
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {dashboardData.recentWorkOrders.map(
                                        (row) => (
                                            <tr
                                                key={row.id}
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {row.workOrderId}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <span className="px-2 py-1 text-xs font-medium border border-gray-300 rounded-full">
                                                        {row.type}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 max-w-xs truncate">
                                                    {row.account}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                                                            row.status ===
                                                            "Complete"
                                                                ? "bg-green-100 text-green-800"
                                                                : row.status ===
                                                                  "In Progress"
                                                                ? "bg-blue-100 text-blue-800"
                                                                : row.status ===
                                                                  "Pending"
                                                                ? "bg-yellow-100 text-yellow-800"
                                                                : "bg-red-100 text-red-800"
                                                        }`}
                                                    >
                                                        {row.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-700">
                                                            {row.assignee
                                                                .split(",")[0]
                                                                .split(" ")
                                                                .map(
                                                                    (n) => n[0]
                                                                )
                                                                .join("")
                                                                .slice(0, 2)}
                                                        </div>
                                                        <div className="ml-2 text-sm text-gray-700 truncate max-w-xs">
                                                            {row.assignee}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`px-2 py-1 text-xs font-semibold text-white rounded-full ${
                                                            row.priority ===
                                                            "Critical"
                                                                ? "bg-red-500"
                                                                : row.priority ===
                                                                  "High"
                                                                ? "bg-yellow-500"
                                                                : row.priority ===
                                                                  "Medium"
                                                                ? "bg-cyan-500"
                                                                : "bg-green-500"
                                                        }`}
                                                    >
                                                        {row.priority}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="w-28">
                                                        <div className="text-sm font-medium text-gray-900 mb-1">
                                                            {row.daysOpen.toFixed(
                                                                2
                                                            )}
                                                            d
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                            <div
                                                                className={`h-1.5 rounded-full ${
                                                                    row.daysOpen >
                                                                    14
                                                                        ? "bg-red-500"
                                                                        : row.daysOpen >
                                                                          7
                                                                        ? "bg-yellow-500"
                                                                        : "bg-green-500"
                                                                }`}
                                                                style={{
                                                                    width: `${Math.min(
                                                                        row.daysOpen *
                                                                            10,
                                                                        100
                                                                    )}%`,
                                                                }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="px-5 pt-5 pb-3 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900">
                            System Alerts
                        </h3>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center bg-gray-100 rounded-lg px-3 py-1.5">
                                <MagnifyingGlassIcon className="w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search alerts..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="bg-transparent border-none focus:outline-none text-sm ml-2 w-28"
                                />
                            </div>
                            <button
                                onClick={handleRefresh}
                                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                            >
                                <ArrowPathIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <div className="h-[32rem] overflow-y-auto p-4">
                        {filteredAlerts.length > 0 ? (
                            <div className="space-y-4">
                                {filteredAlerts.map((alert) => (
                                    <div
                                        key={alert.id}
                                        className="p-4 hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 mt-1">
                                                {alert.type === "success" ? (
                                                    
                                                    <CheckCircleSolid className="w-5 h-5 text-green-500" />
                                                ) : (
                                                    <ExclamationTriangleSolid
                                                        className={`w-5 h-5 ${
                                                            alert.type ===
                                                            "warning"
                                                                ? "text-yellow-500"
                                                                : "text-blue-500"
                                                        }`}
                                                    />
                                                )}
                                            </div>
                                            <div className="ml-3">
                                                <div className="flex items-center flex-wrap gap-2 mb-1">
                                                    {alert.workOrderId && (
                                                        <span className="px-2 py-0.5 text-xs font-bold border border-gray-300 rounded-full">
                                                            WO:{" "}
                                                            {alert.workOrderId}
                                                        </span>
                                                    )}
                                                    <h4 className="text-sm font-semibold text-gray-900">
                                                        {alert.title}
                                                    </h4>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    {alert.message}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {format(
                                                        new Date(
                                                            alert.timestamp
                                                        ),
                                                        "MMM dd, hh:mm a"
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8">
                                <MagnifyingGlassIcon className="w-12 h-12 text-gray-400 mb-4" />
                                <p className="text-gray-600 mb-1">
                                    No alerts found
                                </p>
                                <p className="text-sm text-gray-500">
                                    Try adjusting your search query
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <EmployeeEvaluationModal
                open={evalOpen}
                onClose={() => setEvalOpen(false)}
                fullScreen={true}
            />
        </div>
    );
};

export default ExecutiveDashboard;

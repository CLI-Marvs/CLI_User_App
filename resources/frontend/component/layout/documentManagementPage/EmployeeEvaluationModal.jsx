import React, { useState, useEffect, useMemo } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    TextField,
    InputAdornment,
    Box,
    Paper,
    Chip,
    Grid,
    Card,
    CardContent,
    Divider,
    Tabs,
    Tab,
    FormControl,
    Select,
    MenuItem,
    InputLabel,
} from "@mui/material";
import {
    UsersIcon,
    DocumentTextIcon,
    FolderIcon,
    TrophyIcon,
    StarIcon,
} from "@heroicons/react/24/outline";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Area,
    AreaChart,
    ScatterChart,
    Scatter,
} from "recharts";
import apiService from "../../servicesApi/apiService";

const EmployeeEvaluationModal = ({ open, onClose, fullScreen = false }) => {
    const [evaluationData, setEvaluationData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [selectedPeriod, setSelectedPeriod] = useState("current");
    const [chartType, setChartType] = useState("bar");

    // Chart colors
    const COLORS = [
        "#0088FE",
        "#00C49F",
        "#FFBB28",
        "#FF8042",
        "#8884d8",
        "#82ca9d",
    ];
    const PERFORMANCE_COLORS = {
        excellent: "#22c55e",
        good: "#3b82f6",
        average: "#f59e0b",
        poor: "#ef4444",
    };

    useEffect(() => {
        if (open) {
            setLoading(true);
            apiService
                .get("/employee-evaluation")
                .then((res) => {
                    console.log("Employee evaluation API response:", res.data);
                    const data = res.data;
                    setEvaluationData(Array.isArray(data) ? data : []);
                })
                .catch((err) => {
                    console.error(err);
                    setEvaluationData([]);
                })
                .finally(() => setLoading(false));
        }
    }, [open]);

    // Enhanced columns with better formatting and styling
    const columns = [
        {
            field: "employeeName",
            headerName: "Employee Name",
            flex: 1.2,
            minWidth: 200,
            renderCell: (params) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 gradient-btn5 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {params.value?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                        <div className="font-medium text-gray-800">
                            {params.value}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            field: "completedWorkOrders",
            headerName: "Work Orders",
            type: "number",
            flex: 0.8,
            minWidth: 120,
            align: "center",
            headerAlign: "center",
            renderCell: (params) => {
                const value = params.value;
                const colorClass =
                    value > 15
                        ? "bg-green-100 text-green-800 border-green-300"
                        : value > 10
                        ? "bg-blue-100 text-blue-800 border-blue-300"
                        : value > 5
                        ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                        : "bg-red-100 text-red-800 border-red-300";

                return (
                    <div className="flex items-center gap-2">
                        <span
                            className={`px-3 py-1 text-sm font-medium rounded-full border ${colorClass}`}
                        >
                            {value}
                        </span>
                    </div>
                );
            },
        },
        {
            field: "filesSubmitted",
            headerName: "Files Uploaded",
            type: "number",
            flex: 0.8,
            minWidth: 120,
            align: "center",
            headerAlign: "center",
            renderCell: (params) => {
                const value = params.value;
                const colorClass =
                    value > 5
                        ? "bg-green-100 text-green-800 border-green-300"
                        : value > 2
                        ? "bg-blue-100 text-blue-800 border-blue-300"
                        : value > 0
                        ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                        : "bg-red-100 text-red-800 border-red-300";

                return (
                    <span
                        className={`px-3 py-1 text-sm font-medium rounded-full border ${colorClass}`}
                    >
                        {value}
                    </span>
                );
            },
        },
        {
            field: "performance",
            headerName: "Performance",
            flex: 1,
            minWidth: 150,
            align: "center",
            headerAlign: "center",
            renderCell: (params) => {
                const score = (
                    params.row.completedWorkOrders * 0.7 +
                    params.row.filesSubmitted * 0.3
                ).toFixed(1);

                const getPerformanceLevel = (score) => {
                    if (score >= 15)
                        return {
                            level: "Excellent",
                            color: "bg-green-500",
                            textColor: "text-white",
                        };
                    if (score >= 10)
                        return {
                            level: "Good",
                            color: "bg-blue-500",
                            textColor: "text-white",
                        };
                    if (score >= 5)
                        return {
                            level: "Average",
                            color: "bg-yellow-500",
                            textColor: "text-white",
                        };
                    return {
                        level: "Needs Improvement",
                        color: "bg-red-500",
                        textColor: "text-white",
                    };
                };

                const performance = getPerformanceLevel(score);

                return (
                    <div className="flex flex-col items-center gap-1">
                        <span
                            className={`px-3 py-1 text-sm font-bold rounded-full ${performance.color} ${performance.textColor}`}
                        >
                            {score}
                        </span>
                        <span className="text-xs text-gray-500">
                            {performance.level}
                        </span>
                    </div>
                );
            },
        },
        {
            field: "efficiency",
            headerName: "Efficiency %",
            flex: 0.8,
            minWidth: 120,
            align: "center",
            headerAlign: "center",
            renderCell: (params) => {
                const efficiency = Math.min(
                    100,
                    Math.round((params.row.completedWorkOrders / 20) * 100)
                );
                const colorClass =
                    efficiency >= 80
                        ? "text-green-600"
                        : efficiency >= 60
                        ? "text-blue-600"
                        : efficiency >= 40
                        ? "text-yellow-600"
                        : "text-red-600";

                return (
                    <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full ${
                                    efficiency >= 80
                                        ? "bg-green-500"
                                        : efficiency >= 60
                                        ? "bg-blue-500"
                                        : efficiency >= 40
                                        ? "bg-yellow-500"
                                        : "bg-red-500"
                                }`}
                                style={{ width: `${efficiency}%` }}
                            ></div>
                        </div>
                        <span className={`text-sm font-semibold ${colorClass}`}>
                            {efficiency}%
                        </span>
                    </div>
                );
            },
        },
    ];

    // Filter data based on search term
    const filteredData = useMemo(() => {
        if (!searchTerm.trim()) return evaluationData;

        return evaluationData.filter((item) =>
            item.employeeName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [evaluationData, searchTerm]);

    const rows = (Array.isArray(filteredData) ? filteredData : []).map(
        (item, index) => ({
            id: item.id || index,
            employeeName: item.employeeName || "",
            completedWorkOrders: Number(item.completedWorkOrders) || 0,
            filesSubmitted: Number(item.filesSubmitted) || 0,
        })
    );

    // Enhanced summary statistics with more metrics
    const summaryStats = useMemo(() => {
        if (!evaluationData.length)
            return {
                totalEmployees: 0,
                avgWO: 0,
                avgFiles: 0,
                topPerformer: null,
                totalProductivity: 0,
                highPerformers: 0,
            };

        const totalWO = evaluationData.reduce(
            (sum, emp) => sum + (Number(emp.completedWorkOrders) || 0),
            0
        );
        const totalFiles = evaluationData.reduce(
            (sum, emp) => sum + (Number(emp.filesSubmitted) || 0),
            0
        );
        const avgWO = (totalWO / evaluationData.length).toFixed(1);
        const avgFiles = (totalFiles / evaluationData.length).toFixed(1);

        const topPerformer = evaluationData.reduce((top, emp) => {
            const empScore =
                Number(emp.completedWorkOrders) * 0.7 +
                Number(emp.filesSubmitted) * 0.3;
            const topScore =
                Number(top.completedWorkOrders) * 0.7 +
                Number(top.filesSubmitted) * 0.3;
            return empScore > topScore ? emp : top;
        }, evaluationData[0]);

        const highPerformers = evaluationData.filter((emp) => {
            const score =
                Number(emp.completedWorkOrders) * 0.7 +
                Number(emp.filesSubmitted) * 0.3;
            return score >= 10;
        }).length;

        const totalProductivity = totalWO + totalFiles;

        return {
            totalEmployees: evaluationData.length,
            avgWO,
            avgFiles,
            topPerformer: topPerformer?.employeeName,
            totalProductivity,
            highPerformers,
        };
    }, [evaluationData]);

    // Chart data preparation
    const chartData = useMemo(() => {
        const performanceData = evaluationData
            .map((emp) => ({
                name: emp.employeeName,
                workOrders: Number(emp.completedWorkOrders) || 0,
                files: Number(emp.filesSubmitted) || 0,
                score: (
                    (Number(emp.completedWorkOrders) || 0) * 0.7 +
                    (Number(emp.filesSubmitted) || 0) * 0.3
                ).toFixed(1),
            }))
            .sort((a, b) => parseFloat(b.score) - parseFloat(a.score)); // Sort by score descending

        const performanceLevels = {
            "Excellent (≥15)": evaluationData.filter((emp) => {
                const score =
                    (Number(emp.completedWorkOrders) || 0) * 0.7 +
                    (Number(emp.filesSubmitted) || 0) * 0.3;
                return score >= 15;
            }).length,
            "Good (10-14.9)": evaluationData.filter((emp) => {
                const score =
                    (Number(emp.completedWorkOrders) || 0) * 0.7 +
                    (Number(emp.filesSubmitted) || 0) * 0.3;
                return score >= 10 && score < 15;
            }).length,
            "Average (5-9.9)": evaluationData.filter((emp) => {
                const score =
                    (Number(emp.completedWorkOrders) || 0) * 0.7 +
                    (Number(emp.filesSubmitted) || 0) * 0.3;
                return score >= 5 && score < 10;
            }).length,
            "Needs Improvement (<5)": evaluationData.filter((emp) => {
                const score =
                    (Number(emp.completedWorkOrders) || 0) * 0.7 +
                    (Number(emp.filesSubmitted) || 0) * 0.3;
                return score < 5;
            }).length,
        };

        const performancePieData = Object.entries(performanceLevels).map(
            ([name, value]) => ({
                name,
                value,
                color: name.includes("Excellent")
                    ? PERFORMANCE_COLORS.excellent
                    : name.includes("Good")
                    ? PERFORMANCE_COLORS.good
                    : name.includes("Average")
                    ? PERFORMANCE_COLORS.average
                    : PERFORMANCE_COLORS.poor,
            })
        );

        return {
            performanceData: performanceData.slice(0, 10),
            performancePieData,
        };
    }, [evaluationData]);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleClearSearch = () => {
        setSearchTerm("");
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth={fullScreen ? false : "xl"}
            fullScreen={fullScreen}
            PaperProps={{
                className: "rounded-2xl shadow-2xl bg-white overflow-hidden",
                style: {
                    height: fullScreen ? "100vh" : "90vh",
                    borderRadius: fullScreen ? 0 : undefined,
                },
            }}
        >
            {/* Enhanced Header */}
            <div className="bg-custom-bluegreen text-white p-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-white bg-opacity-20 rounded-lg p-1">
                            <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold">
                                Employee Performance Dashboard
                            </h2>
                            <p className="text-blue-100 text-xs">
                                Comprehensive evaluation and analytics
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white hover:bg-opacity-20 rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            <DialogContent className="p-0 overflow-hidden">
                {/* Enhanced Summary Statistics */}
                <div className="bg-white p-1 border-b">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <div className="bg-white rounded-xl shadow-lg p-2 text-center border-l-4 border-blue-500">
                            <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 rounded-full bg-blue-100">
                                <UsersIcon className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="text-lg font-bold text-blue-600 mb-0.5">
                                {summaryStats.totalEmployees}
                            </div>
                            <div className="text-xs text-gray-600">
                                Total Employees
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-2 text-center border-l-4 border-green-500">
                            <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 rounded-full bg-green-100">
                                <DocumentTextIcon className="w-4 h-4 text-green-600" />
                            </div>
                            <div className="text-lg font-bold text-green-600 mb-0.5">
                                {summaryStats.avgWO}
                            </div>
                            <div className="text-xs text-gray-600">
                                Avg Work Orders
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-2 text-center border-l-4 border-purple-500">
                            <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 rounded-full bg-purple-100">
                                <FolderIcon className="w-4 h-4 text-purple-600" />
                            </div>
                            <div className="text-lg font-bold text-purple-600 mb-0.5">
                                {summaryStats.avgFiles}
                            </div>
                            <div className="text-xs text-gray-600">
                                Avg Files Uploaded
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-2 text-center border-l-4 border-orange-500">
                            <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 rounded-full bg-orange-100">
                                <TrophyIcon className="w-4 h-4 text-orange-600" />
                            </div>
                            <div
                                className="text-base font-bold text-orange-600 mb-0.5 truncate"
                                title={summaryStats.topPerformer || "N/A"}
                            >
                                {summaryStats.topPerformer || "N/A"}
                            </div>
                            <div className="text-xs text-gray-600">
                                Top Performer
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-2 text-center border-l-4 border-emerald-500">
                            <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 rounded-full bg-emerald-100">
                                <StarIcon className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div className="text-lg font-bold text-emerald-600 mb-0.5">
                                {summaryStats.highPerformers}
                            </div>
                            <div className="text-xs text-gray-600">
                                High Performers
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Controls */}
                <div className="bg-white p-4 border-b shadow-sm">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex-1 min-w-64">
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="🔍 Search employees by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                size="small"
                                InputProps={{
                                    endAdornment: searchTerm && (
                                        <Button
                                            size="small"
                                            onClick={handleClearSearch}
                                            sx={{ minWidth: "auto", p: 0.5 }}
                                        >
                                            ✕
                                        </Button>
                                    ),
                                }}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "12px",
                                    },
                                }}
                            />
                        </div>

                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Period</InputLabel>
                            <Select
                                value={selectedPeriod}
                                label="Period"
                                onChange={(e) =>
                                    setSelectedPeriod(e.target.value)
                                }
                                sx={{ borderRadius: "12px" }}
                            >
                                <MenuItem value="current">
                                    Current Month
                                </MenuItem>
                                <MenuItem value="quarter">
                                    This Quarter
                                </MenuItem>
                                <MenuItem value="year">This Year</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Chart Type</InputLabel>
                            <Select
                                value={chartType}
                                label="Chart Type"
                                onChange={(e) => setChartType(e.target.value)}
                                sx={{ borderRadius: "12px" }}
                            >
                                <MenuItem value="bar">Bar Chart</MenuItem>
                                <MenuItem value="line">Line Chart</MenuItem>
                                <MenuItem value="area">Area Chart</MenuItem>
                                <MenuItem value="scatter">
                                    Scatter Plot
                                </MenuItem>
                            </Select>
                        </FormControl>

                        {searchTerm && (
                            <Chip
                                label={`${rows.length} of ${evaluationData.length} employees`}
                                variant="outlined"
                                size="small"
                                color="primary"
                            />
                        )}
                    </div>
                </div>

                {/* Tabbed Content */}
                <Box
                    sx={{
                        borderBottom: 1,
                        borderColor: "divider",
                        bgcolor: "background.paper",
                    }}
                >
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        variant="fullWidth"
                        sx={{
                            "& .MuiTab-root": {
                                textTransform: "none",
                                fontWeight: 600,
                                fontSize: "0.9rem",
                            },
                        }}
                    >
                        <Tab label="📊 Employee Data" />
                        <Tab label="📈 Performance Charts" />
                        <Tab label="📋 Detailed Reports" />
                    </Tabs>
                </Box>

                <div
                    style={{
                        height: fullScreen
                            ? "calc(100vh - 280px)"
                            : "calc(90vh - 280px)",
                    }}
                >
                    {/* Tab Panel 0: Employee Data */}
                    {activeTab === 0 && (
                        <div className="p-6 h-full">
                            {evaluationData.length > 0 ? (
                                <div className="bg-white rounded-2xl shadow-xl border h-full">
                                    <DataGrid
                                        loading={loading}
                                        getRowId={(row) => row.id}
                                        rows={rows}
                                        columns={columns}
                                        initialState={{
                                            pagination: {
                                                paginationModel: {
                                                    pageSize: 15,
                                                },
                                            },
                                            sorting: {
                                                sortModel: [
                                                    {
                                                        field: "completedWorkOrders",
                                                        sort: "desc",
                                                    },
                                                ],
                                            },
                                        }}
                                        pageSizeOptions={[10, 15, 25, 50]}
                                        disableSelectionOnClick
                                        slots={{ toolbar: GridToolbar }}
                                        slotProps={{
                                            toolbar: {
                                                showQuickFilter: true,
                                                quickFilterProps: {
                                                    debounceMs: 500,
                                                },
                                            },
                                        }}
                                        sx={{
                                            height: "100%",
                                            border: "none",
                                            "& .MuiDataGrid-columnHeaders": {
                                                backgroundColor: "#f8fafc",
                                                fontWeight: "bold",
                                                fontSize: "0.9rem",
                                                borderBottom:
                                                    "2px solid #e2e8f0",
                                            },
                                            "& .MuiDataGrid-row": {
                                                "&:hover": {
                                                    backgroundColor: "#f1f5f9",
                                                },
                                                "&:nth-of-type(even)": {
                                                    backgroundColor: "#fafbfc",
                                                },
                                            },
                                            "& .MuiDataGrid-cell": {
                                                borderBottom:
                                                    "1px solid #e2e8f0",
                                                display: "flex",
                                                alignItems: "center",
                                            },
                                            "& .MuiDataGrid-toolbarContainer": {
                                                padding: "12px 16px",
                                                backgroundColor: "#f8fafc",
                                                borderBottom:
                                                    "1px solid #e2e8f0",
                                            },
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-12 text-center shadow-lg h-full flex flex-col justify-center">
                                    <div className="text-8xl mb-6">📊</div>
                                    <h3 className="text-2xl font-bold text-gray-700 mb-4">
                                        No Evaluation Data Available
                                    </h3>
                                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                        Employee evaluation data will appear
                                        here once available. Try refreshing or
                                        check your data source.
                                    </p>
                                    <Button
                                        variant="contained"
                                        onClick={() => window.location.reload()}
                                        sx={{ borderRadius: "12px" }}
                                    >
                                        Refresh Data
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab Panel 1: Performance Charts */}
                    {activeTab === 1 && (
                        <div className="p-6 space-y-6 h-full overflow-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Performance Distribution Pie Chart */}
                                <Card className="shadow-xl rounded-2xl overflow-hidden">
                                    <CardContent className="p-6">
                                        <Typography
                                            variant="h6"
                                            className="mb-4 font-bold text-gray-800"
                                        >
                                            Performance Distribution
                                        </Typography>
                                        <ResponsiveContainer
                                            width="100%"
                                            height={300}
                                        >
                                            <PieChart>
                                                <Pie
                                                    data={
                                                        chartData.performancePieData
                                                    }
                                                    dataKey="value"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={100}
                                                    fill="#8884d8"
                                                    label={({
                                                        name,
                                                        percent,
                                                    }) =>
                                                        `${name}: ${(
                                                            percent * 100
                                                        ).toFixed(0)}%`
                                                    }
                                                >
                                                    {chartData.performancePieData.map(
                                                        (entry, index) => (
                                                            <Cell
                                                                key={`cell-${index}`}
                                                                fill={
                                                                    entry.color
                                                                }
                                                            />
                                                        )
                                                    )}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                {/* Top Performers Chart */}
                                <Card className="shadow-xl rounded-2xl overflow-hidden">
                                    <CardContent className="p-6">
                                        <Typography
                                            variant="h6"
                                            className="mb-4 font-bold text-gray-800"
                                        >
                                            Top 10 Performers
                                        </Typography>
                                        <ResponsiveContainer
                                            width="100%"
                                            height={300}
                                        >
                                            {chartType === "bar" && (
                                                <BarChart
                                                    data={
                                                        chartData.performanceData
                                                    }
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis
                                                        dataKey="name"
                                                        angle={-45}
                                                        textAnchor="end"
                                                        height={60}
                                                        fontSize={12}
                                                    />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Bar
                                                        dataKey="workOrders"
                                                        fill="#3b82f6"
                                                        name="Work Orders"
                                                    />
                                                    <Bar
                                                        dataKey="files"
                                                        fill="#10b981"
                                                        name="Files"
                                                    />
                                                </BarChart>
                                            )}
                                            {chartType === "line" && (
                                                <LineChart
                                                    data={
                                                        chartData.performanceData
                                                    }
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis
                                                        dataKey="name"
                                                        angle={-45}
                                                        textAnchor="end"
                                                        height={60}
                                                        fontSize={12}
                                                    />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="workOrders"
                                                        stroke="#3b82f6"
                                                        strokeWidth={3}
                                                        name="Work Orders"
                                                    />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="files"
                                                        stroke="#10b981"
                                                        strokeWidth={3}
                                                        name="Files"
                                                    />
                                                </LineChart>
                                            )}
                                            {chartType === "area" && (
                                                <AreaChart
                                                    data={
                                                        chartData.performanceData
                                                    }
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis
                                                        dataKey="name"
                                                        angle={-45}
                                                        textAnchor="end"
                                                        height={60}
                                                        fontSize={12}
                                                    />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="workOrders"
                                                        stackId="1"
                                                        stroke="#3b82f6"
                                                        fill="#3b82f6"
                                                        fillOpacity={0.7}
                                                        name="Work Orders"
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="files"
                                                        stackId="1"
                                                        stroke="#10b981"
                                                        fill="#10b981"
                                                        fillOpacity={0.7}
                                                        name="Files"
                                                    />
                                                </AreaChart>
                                            )}
                                            {chartType === "scatter" && (
                                                <ScatterChart
                                                    data={
                                                        chartData.performanceData
                                                    }
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis
                                                        dataKey="workOrders"
                                                        name="Work Orders"
                                                    />
                                                    <YAxis
                                                        dataKey="files"
                                                        name="Files"
                                                    />
                                                    <Tooltip
                                                        cursor={{
                                                            strokeDasharray:
                                                                "3 3",
                                                        }}
                                                    />
                                                    <Legend />
                                                    <Scatter
                                                        name="Employees"
                                                        data={
                                                            chartData.performanceData
                                                        }
                                                        fill="#8884d8"
                                                    />
                                                </ScatterChart>
                                            )}
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* Tab Panel 2: Detailed Reports */}
                    {activeTab === 2 && (
                        <div className="p-6 h-full overflow-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <Card className="shadow-lg rounded-xl">
                                    <CardContent className="p-6">
                                        <Typography
                                            variant="h6"
                                            className="mb-4 font-semibold"
                                        >
                                            Quick Actions
                                        </Typography>
                                        <div className="space-y-3">
                                            <Button
                                                fullWidth
                                                variant="outlined"
                                                className="justify-start"
                                            >
                                                📊 Export Performance Report
                                            </Button>
                                            <Button
                                                fullWidth
                                                variant="outlined"
                                                className="justify-start"
                                            >
                                                📈 Generate Analytics
                                            </Button>
                                            <Button
                                                fullWidth
                                                variant="outlined"
                                                className="justify-start"
                                            >
                                                📧 Email Summary
                                            </Button>
                                            <Button
                                                fullWidth
                                                variant="outlined"
                                                className="justify-start"
                                            >
                                                🎯 Set Performance Goals
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-lg rounded-xl">
                                    <CardContent className="p-6">
                                        <Typography
                                            variant="h6"
                                            className="mb-4 font-semibold"
                                        >
                                            Performance Insights
                                        </Typography>
                                        <div className="space-y-3 text-sm">
                                            <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                                                <strong>
                                                    High File Upload Activity:
                                                </strong>{" "}
                                                Employees with file uploads show
                                                better engagement
                                            </div>
                                            <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                                                <strong>
                                                    Work Order Completion:
                                                </strong>{" "}
                                                Consistent work order completion
                                                indicates reliability
                                            </div>
                                            <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                                                <strong>
                                                    Improvement Opportunity:
                                                </strong>{" "}
                                                Focus on employees with low file
                                                upload rates
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-lg rounded-xl">
                                    <CardContent className="p-6">
                                        <Typography
                                            variant="h6"
                                            className="mb-4 font-semibold"
                                        >
                                            System Status
                                        </Typography>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">
                                                    Data Freshness
                                                </span>
                                                <Chip
                                                    label="Real-time"
                                                    color="success"
                                                    size="small"
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">
                                                    Last Update
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {new Date().toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">
                                                    System Health
                                                </span>
                                                <Chip
                                                    label="Optimal"
                                                    color="success"
                                                    size="small"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>

            {/* Enhanced Footer */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-200 px-6 py-2 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-500">
                        Last updated: {new Date().toLocaleString()}
                    </div>
                    <Chip
                        label={`${evaluationData.length} employees`}
                        size="small"
                        variant="outlined"
                        color="primary"
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outlined"
                        size="small"
                        sx={{ borderRadius: "8px" }}
                    >
                        Export
                    </Button>
                </div>
            </div>
        </Dialog>
    );
};

export default EmployeeEvaluationModal;

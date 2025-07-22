import React, { useState, useEffect, useMemo } from "react";
import Drawer from "@mui/material/Drawer";
import {
    Dialog,
    DialogContent,
    Button,
    Typography,
    TextField,
    Box,
    Card,
    CardContent,
    Tabs,
    Tab,
    FormControl,
    Select,
    MenuItem,
    InputLabel,
    Chip,
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
    AreaChart,
    Area,
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

    // Performance colors
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

    // Compact columns with smaller fonts and dimensions
    const columns = [
        {
            field: "employeeName",
            headerName: "Employee",
            flex: 1,
            minWidth: 150,
            align: "left",
            headerAlign: "left",
            renderCell: (params) => (
                <div
                    className="flex items-center gap-2 h-full"
                    style={{ alignItems: "center", height: "100%" }}
                >
                    <div className="w-6 h-6 gradient-btn5 rounded-full flex items-center justify-center text-white font-medium text-xs">
                        {params.value?.charAt(0)?.toUpperCase()}
                    </div>
                    <div
                        className="text-xs font-medium text-gray-800 truncate flex items-center h-full"
                        style={{ alignItems: "center" }}
                    >
                        {params.value}
                    </div>
                </div>
            ),
        },
        {
            field: "completedWorkOrders",
            headerName: "Work Orders",
            type: "number",
            flex: 0.6,
            minWidth: 100,
            align: "center",
            headerAlign: "center",
            renderCell: (params) => {
                const value = params.value;
                const colorClass =
                    value > 15
                        ? "bg-green-100 text-green-700 border-green-200"
                        : value > 10
                        ? "bg-blue-100 text-blue-700 border-blue-200"
                        : value > 5
                        ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                        : "bg-red-100 text-red-700 border-red-200";

                return (
                    <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-md border ${colorClass}`}
                    >
                        {value}
                    </span>
                );
            },
        },
        {
            field: "filesSubmitted",
            headerName: "Files",
            type: "number",
            flex: 0.5,
            minWidth: 80,
            align: "center",
            headerAlign: "center",
            renderCell: (params) => {
                const value = params.value;
                const colorClass =
                    value > 5
                        ? "bg-green-100 text-green-700 border-green-200"
                        : value > 2
                        ? "bg-blue-100 text-blue-700 border-blue-200"
                        : value > 0
                        ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                        : "bg-red-100 text-red-700 border-red-200";

                return (
                    <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-md border ${colorClass}`}
                    >
                        {value}
                    </span>
                );
            },
        },
        {
            field: "performance",
            headerName: "Score",
            flex: 0.7,
            minWidth: 100,
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
                            level: "Exc",
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
                            level: "Avg",
                            color: "bg-yellow-500",
                            textColor: "text-white",
                        };
                    return {
                        level: "Low",
                        color: "bg-red-500",
                        textColor: "text-white",
                    };
                };

                const performance = getPerformanceLevel(score);

                return (
                    <div className="flex flex-col items-center">
                        <span
                            className={`px-2 py-0.5 text-xs font-bold rounded-md ${performance.color} ${performance.textColor}`}
                        >
                            {score}
                        </span>
                        <span className="text-xs text-gray-400 mt-0.5">
                            {performance.level}
                        </span>
                    </div>
                );
            },
        },
        {
            field: "efficiency",
            headerName: "Efficiency",
            flex: 0.7,
            minWidth: 90,
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
                    <div className="flex flex-col items-center">
                        <div className="w-12 bg-gray-200 rounded-full h-1.5 mb-1">
                            <div
                                className={`h-1.5 rounded-full ${
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
                        <span className={`text-xs font-medium ${colorClass}`}>
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

    // Side drawer state for drill-down
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [employeeComments, setEmployeeComments] = useState({}); // { [employeeId]: [{text, date}] }
    const [newComment, setNewComment] = useState("");

    const rows = (Array.isArray(filteredData) ? filteredData : []).map(
        (item, index) => ({
            id: item.id || index,
            employeeName: item.employeeName || "",
            completedWorkOrders: Number(item.completedWorkOrders) || 0,
            filesSubmitted: Number(item.filesSubmitted) || 0,
            performance: item.performance,
            efficiency: item.efficiency,
            ...item,
        })
    );

    // Handle row click to open drawer
    const handleRowClick = (params) => {
        setSelectedEmployee(params.row);
        setDrawerOpen(true);
        setNewComment("");
    };

    // Add a comment for the selected employee
    const handleAddComment = () => {
        if (!selectedEmployee || !newComment.trim()) return;
        setEmployeeComments((prev) => {
            const empId = selectedEmployee.id;
            const prevComments = prev[empId] || [];
            return {
                ...prev,
                [empId]: [
                    ...prevComments,
                    {
                        text: newComment.trim(),
                        date: new Date().toLocaleString(),
                    },
                ],
            };
        });
        setNewComment("");
    };

    // Enhanced summary statistics
    const summaryStats = useMemo(() => {
        if (!evaluationData.length)
            return {
                totalEmployees: 0,
                avgWO: 0,
                avgFiles: 0,
                topPerformer: null,
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

        return {
            totalEmployees: evaluationData.length,
            avgWO,
            avgFiles,
            topPerformer: topPerformer?.employeeName,
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
            .sort((a, b) => parseFloat(b.score) - parseFloat(a.score));

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
        <>
            <Dialog
                open={open}
                onClose={onClose}
                fullWidth
                maxWidth={fullScreen ? false : "lg"}
                fullScreen={fullScreen}
                PaperProps={{
                    className: "rounded-xl shadow-2xl bg-white overflow-hidden",
                    style: {
                        height: fullScreen ? "100vh" : "75vh",
                        borderRadius: fullScreen ? 0 : undefined,
                    },
                }}
            >
                {/* Compact Header */}
                <div className="bg-custom-bluegreen text-white p-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="bg-white bg-opacity-20 rounded-lg p-1.5">
                                <svg
                                    className="w-4 h-4"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-base font-semibold">
                                    Employee Performance
                                </h2>
                                <p className="text-blue-100 text-xs">
                                    Analytics Dashboard
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full w-7 h-7 flex items-center justify-center transition-all duration-200"
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
                    {/* Compact Summary Statistics */}
                    <div className="bg-gray-50 p-3 border-b">
                        <div className="grid grid-cols-5 gap-3">
                            <div className="bg-white rounded-lg shadow-sm p-2 text-center border-l-2 border-blue-500">
                                <div className="flex items-center justify-center w-6 h-6 mx-auto mb-1 rounded-full bg-blue-100">
                                    <UsersIcon className="w-3 h-3 text-blue-600" />
                                </div>
                                <div className="text-sm font-bold text-blue-600">
                                    {summaryStats.totalEmployees}
                                </div>
                                <div className="text-xs text-gray-500">
                                    Employees
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm p-2 text-center border-l-2 border-green-500">
                                <div className="flex items-center justify-center w-6 h-6 mx-auto mb-1 rounded-full bg-green-100">
                                    <DocumentTextIcon className="w-3 h-3 text-green-600" />
                                </div>
                                <div className="text-sm font-bold text-green-600">
                                    {summaryStats.avgWO}
                                </div>
                                <div className="text-xs text-gray-500">
                                    Avg Orders
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm p-2 text-center border-l-2 border-purple-500">
                                <div className="flex items-center justify-center w-6 h-6 mx-auto mb-1 rounded-full bg-purple-100">
                                    <FolderIcon className="w-3 h-3 text-purple-600" />
                                </div>
                                <div className="text-sm font-bold text-purple-600">
                                    {summaryStats.avgFiles}
                                </div>
                                <div className="text-xs text-gray-500">
                                    Avg Files
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm p-2 text-center border-l-2 border-orange-500">
                                <div className="flex items-center justify-center w-6 h-6 mx-auto mb-1 rounded-full bg-orange-100">
                                    <TrophyIcon className="w-3 h-3 text-orange-600" />
                                </div>
                                <div
                                    className="text-xs font-bold text-orange-600 truncate"
                                    title={summaryStats.topPerformer || "N/A"}
                                >
                                    {summaryStats.topPerformer
                                        ? summaryStats.topPerformer.split(
                                              " "
                                          )[0]
                                        : "N/A"}
                                </div>
                                <div className="text-xs text-gray-500">
                                    Top Performer
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm p-2 text-center border-l-2 border-emerald-500">
                                <div className="flex items-center justify-center w-6 h-6 mx-auto mb-1 rounded-full bg-emerald-100">
                                    <StarIcon className="w-3 h-3 text-emerald-600" />
                                </div>
                                <div className="text-sm font-bold text-emerald-600">
                                    {summaryStats.highPerformers}
                                </div>
                                <div className="text-xs text-gray-500">
                                    High Performers
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Compact Filters and Controls */}
                    <div className="bg-white p-3 border-b shadow-sm">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex-1 min-w-48">
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    placeholder="🔍 Search employees..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    size="small"
                                    InputProps={{
                                        style: { fontSize: "0.8rem" },
                                        endAdornment: searchTerm && (
                                            <Button
                                                size="small"
                                                onClick={handleClearSearch}
                                                sx={{
                                                    minWidth: "auto",
                                                    p: 0.5,
                                                    fontSize: "0.7rem",
                                                }}
                                            >
                                                ✕
                                            </Button>
                                        ),
                                    }}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: "8px",
                                            height: "32px",
                                        },
                                    }}
                                />
                            </div>

                            <FormControl size="small" sx={{ minWidth: 100 }}>
                                <InputLabel style={{ fontSize: "0.8rem" }}>
                                    Period
                                </InputLabel>
                                <Select
                                    value={selectedPeriod}
                                    label="Period"
                                    onChange={(e) =>
                                        setSelectedPeriod(e.target.value)
                                    }
                                    sx={{
                                        borderRadius: "8px",
                                        height: "32px",
                                        fontSize: "0.8rem",
                                    }}
                                >
                                    <MenuItem
                                        value="current"
                                        style={{ fontSize: "0.8rem" }}
                                    >
                                        Current Month
                                    </MenuItem>
                                    <MenuItem
                                        value="quarter"
                                        style={{ fontSize: "0.8rem" }}
                                    >
                                        This Quarter
                                    </MenuItem>
                                    <MenuItem
                                        value="year"
                                        style={{ fontSize: "0.8rem" }}
                                    >
                                        This Year
                                    </MenuItem>
                                </Select>
                            </FormControl>

                            <FormControl size="small" sx={{ minWidth: 100 }}>
                                <InputLabel style={{ fontSize: "0.8rem" }}>
                                    Chart
                                </InputLabel>
                                <Select
                                    value={chartType}
                                    label="Chart"
                                    onChange={(e) =>
                                        setChartType(e.target.value)
                                    }
                                    sx={{
                                        borderRadius: "8px",
                                        height: "32px",
                                        fontSize: "0.8rem",
                                    }}
                                >
                                    <MenuItem
                                        value="bar"
                                        style={{ fontSize: "0.8rem" }}
                                    >
                                        Bar
                                    </MenuItem>
                                    <MenuItem
                                        value="line"
                                        style={{ fontSize: "0.8rem" }}
                                    >
                                        Line
                                    </MenuItem>
                                    <MenuItem
                                        value="area"
                                        style={{ fontSize: "0.8rem" }}
                                    >
                                        Area
                                    </MenuItem>
                                    <MenuItem
                                        value="scatter"
                                        style={{ fontSize: "0.8rem" }}
                                    >
                                        Scatter
                                    </MenuItem>
                                </Select>
                            </FormControl>

                            {searchTerm && (
                                <Chip
                                    label={`${rows.length}/${evaluationData.length}`}
                                    variant="outlined"
                                    size="small"
                                    color="primary"
                                    sx={{ fontSize: "0.7rem", height: "24px" }}
                                />
                            )}
                        </div>
                    </div>

                    {/* Compact Tabbed Content */}
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
                                    fontSize: "0.75rem",
                                    minHeight: "40px",
                                    padding: "8px 12px",
                                },
                            }}
                        >
                            <Tab label="📊 Data" />
                            <Tab label="📈 Charts" />
                            <Tab label="📋 Reports" />
                        </Tabs>
                    </Box>

                    <div
                        style={{
                            height: fullScreen
                                ? "calc(100vh - 220px)"
                                : "calc(75vh - 220px)",
                        }}
                    >
                        {/* Tab Panel 0: Employee Data */}
                        {activeTab === 0 && (
                            <div className="p-4 h-full">
                                {evaluationData.length > 0 ? (
                                    <div className="bg-white rounded-lg shadow-lg border h-full">
                                        <DataGrid
                                            loading={loading}
                                            getRowId={(row) => row.id}
                                            rows={rows}
                                            columns={columns}
                                            initialState={{
                                                pagination: {
                                                    paginationModel: {
                                                        pageSize: 20,
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
                                            pageSizeOptions={[10, 20, 50]}
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
                                                fontSize: "0.75rem",
                                                "& .MuiDataGrid-columnHeaders":
                                                    {
                                                        backgroundColor:
                                                            "#f8fafc",
                                                        fontWeight: "bold",
                                                        fontSize: "0.7rem",
                                                        minHeight: "44px",
                                                        borderBottom:
                                                            "1px solid #e2e8f0",
                                                        display: "flex",
                                                        alignItems: "center",
                                                    },
                                                "& .MuiDataGrid-columnHeaderTitle":
                                                    {
                                                        display: "flex",
                                                        alignItems: "center",
                                                        height: "100%",
                                                    },
                                                "& .MuiDataGrid-row": {
                                                    minHeight: "44px",
                                                    maxHeight: "44px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    cursor: "pointer",
                                                },
                                                "& .MuiDataGrid-cell": {
                                                    borderBottom:
                                                        "1px solid #f1f5f9",
                                                    fontSize: "0.75rem",
                                                    padding: "4px 8px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                },
                                                "& .MuiDataGrid-toolbarContainer":
                                                    {
                                                        padding: "8px 12px",
                                                        backgroundColor:
                                                            "#f8fafc",
                                                        borderBottom:
                                                            "1px solid #e2e8f0",
                                                        "& .MuiButton-root": {
                                                            fontSize: "0.7rem",
                                                        },
                                                    },
                                            }}
                                            onRowClick={handleRowClick}
                                        />
                                    </div>
                                ) : (
                                    <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-8 text-center shadow-lg h-full flex flex-col justify-center">
                                        <div className="text-4xl mb-3">📊</div>
                                        <h3 className="text-lg font-bold text-gray-700 mb-2">
                                            No Data Available
                                        </h3>
                                        <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
                                            Employee evaluation data will appear
                                            here once available.
                                        </p>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            onClick={() =>
                                                window.location.reload()
                                            }
                                        >
                                            Refresh Data
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab Panel 1: Performance Charts */}
                        {activeTab === 1 && (
                            <div className="p-4 space-y-4 h-full overflow-auto">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {/* Performance Distribution Pie Chart */}
                                    <Card className="shadow-lg rounded-lg overflow-hidden">
                                        <CardContent className="p-4">
                                            <Typography
                                                variant="body1"
                                                className="mb-3 font-semibold text-gray-800 text-sm"
                                            >
                                                Performance Distribution
                                            </Typography>
                                            <ResponsiveContainer
                                                width="100%"
                                                height={240}
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
                                                        outerRadius={80}
                                                        fill="#8884d8"
                                                        label={({
                                                            name,
                                                            percent,
                                                        }) =>
                                                            `${(
                                                                percent * 100
                                                            ).toFixed(0)}%`
                                                        }
                                                        labelStyle={{
                                                            fontSize: "10px",
                                                        }}
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
                                                    <Legend
                                                        wrapperStyle={{
                                                            fontSize: "11px",
                                                        }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </CardContent>
                                    </Card>

                                    {/* Top Performers Chart */}
                                    <Card className="shadow-lg rounded-lg overflow-hidden">
                                        <CardContent className="p-4">
                                            <Typography
                                                variant="body1"
                                                className="mb-3 font-semibold text-gray-800 text-sm"
                                            >
                                                Top 10 Performers
                                            </Typography>
                                            <ResponsiveContainer
                                                width="100%"
                                                height={240}
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
                                                            height={50}
                                                            fontSize={10}
                                                        />
                                                        <YAxis fontSize={10} />
                                                        <Tooltip
                                                            contentStyle={{
                                                                fontSize:
                                                                    "11px",
                                                            }}
                                                        />
                                                        <Legend
                                                            wrapperStyle={{
                                                                fontSize:
                                                                    "11px",
                                                            }}
                                                        />
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
                                                            height={50}
                                                            fontSize={10}
                                                        />
                                                        <YAxis fontSize={10} />
                                                        <Tooltip
                                                            contentStyle={{
                                                                fontSize:
                                                                    "11px",
                                                            }}
                                                        />
                                                        <Legend
                                                            wrapperStyle={{
                                                                fontSize:
                                                                    "11px",
                                                            }}
                                                        />
                                                        <Line
                                                            type="monotone"
                                                            dataKey="workOrders"
                                                            stroke="#3b82f6"
                                                            strokeWidth={2}
                                                            name="Work Orders"
                                                        />
                                                        <Line
                                                            type="monotone"
                                                            dataKey="files"
                                                            stroke="#10b981"
                                                            strokeWidth={2}
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
                                                            height={50}
                                                            fontSize={10}
                                                        />
                                                        <YAxis fontSize={10} />
                                                        <Tooltip
                                                            contentStyle={{
                                                                fontSize:
                                                                    "11px",
                                                            }}
                                                        />
                                                        <Legend
                                                            wrapperStyle={{
                                                                fontSize:
                                                                    "11px",
                                                            }}
                                                        />
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
                                                    <ScatterChart>
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis
                                                            type="number"
                                                            dataKey="workOrders"
                                                            name="Work Orders"
                                                            fontSize={10}
                                                        />
                                                        <YAxis
                                                            type="number"
                                                            dataKey="files"
                                                            name="Files"
                                                            fontSize={10}
                                                        />
                                                        <Tooltip
                                                            cursor={{
                                                                strokeDasharray:
                                                                    "3 3",
                                                            }}
                                                            contentStyle={{
                                                                fontSize:
                                                                    "11px",
                                                            }}
                                                        />
                                                        <Legend
                                                            wrapperStyle={{
                                                                fontSize:
                                                                    "11px",
                                                            }}
                                                        />
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

                                {/* Productivity Trend Chart */}
                                <Card className="shadow-lg rounded-lg overflow-hidden">
                                    <CardContent className="p-4">
                                        <Typography
                                            variant="body1"
                                            className="mb-3 font-semibold text-gray-800 text-sm"
                                        >
                                            Productivity Trend
                                        </Typography>
                                        <ResponsiveContainer
                                            width="100%"
                                            height={240}
                                        >
                                            <LineChart
                                                data={chartData.performanceData}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="name"
                                                    angle={-45}
                                                    textAnchor="end"
                                                    height={50}
                                                    fontSize={10}
                                                />
                                                <YAxis fontSize={10} />
                                                <Tooltip
                                                    contentStyle={{
                                                        fontSize: "11px",
                                                    }}
                                                />
                                                <Legend
                                                    wrapperStyle={{
                                                        fontSize: "11px",
                                                    }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="score"
                                                    stroke="#8b5cf6"
                                                    strokeWidth={2}
                                                    name="Performance Score"
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Tab Panel 2: Detailed Reports */}
                        {activeTab === 2 && (
                            <div className="p-4 h-full overflow-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {/* Quick Actions Card */}
                                    <Card className="shadow rounded-lg">
                                        <CardContent className="p-4">
                                            <Typography
                                                variant="body1"
                                                className="mb-3 font-semibold text-gray-800 text-sm"
                                            >
                                                Quick Actions
                                            </Typography>
                                            <div className="space-y-2">
                                                <Button
                                                    fullWidth
                                                    variant="outlined"
                                                    size="small"
                                                    className="justify-start text-xs"
                                                    sx={{
                                                        textAlign: "left",
                                                        justifyContent:
                                                            "flex-start",
                                                    }}
                                                >
                                                    📊 Export Performance Report
                                                </Button>
                                                <Button
                                                    fullWidth
                                                    variant="outlined"
                                                    size="small"
                                                    className="justify-start text-xs"
                                                    sx={{
                                                        textAlign: "left",
                                                        justifyContent:
                                                            "flex-start",
                                                    }}
                                                >
                                                    📈 Generate Analytics
                                                </Button>
                                                <Button
                                                    fullWidth
                                                    variant="outlined"
                                                    size="small"
                                                    className="justify-start text-xs"
                                                    sx={{
                                                        textAlign: "left",
                                                        justifyContent:
                                                            "flex-start",
                                                    }}
                                                >
                                                    📧 Email Summary
                                                </Button>
                                                <Button
                                                    fullWidth
                                                    variant="outlined"
                                                    size="small"
                                                    className="justify-start text-xs"
                                                    sx={{
                                                        textAlign: "left",
                                                        justifyContent:
                                                            "flex-start",
                                                    }}
                                                >
                                                    🎯 Set Performance Goals
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Performance Insights Card */}
                                    <Card className="shadow rounded-lg">
                                        <CardContent className="p-4">
                                            <Typography
                                                variant="body1"
                                                className="mb-3 font-semibold text-gray-800 text-sm"
                                            >
                                                Performance Insights
                                            </Typography>
                                            <div className="space-y-2 text-xs">
                                                <div className="p-2 bg-green-50 rounded border-l-3 border-green-400">
                                                    <strong>
                                                        High File Upload
                                                        Activity:
                                                    </strong>{" "}
                                                    Employees with file uploads
                                                    show better engagement
                                                </div>
                                                <div className="p-2 bg-blue-50 rounded border-l-3 border-blue-400">
                                                    <strong>
                                                        Work Order Completion:
                                                    </strong>{" "}
                                                    Consistent completion
                                                    indicates reliability
                                                </div>
                                                <div className="p-2 bg-yellow-50 rounded border-l-3 border-yellow-400">
                                                    <strong>
                                                        Improvement Opportunity:
                                                    </strong>{" "}
                                                    Focus on employees with low
                                                    file upload rates
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* System Status Card */}
                                    <Card className="shadow rounded-lg">
                                        <CardContent className="p-4">
                                            <Typography
                                                variant="body1"
                                                className="mb-3 font-semibold text-gray-800 text-sm"
                                            >
                                                System Status
                                            </Typography>
                                            <div className="space-y-3 text-xs">
                                                <div className="flex items-center justify-between">
                                                    <span>Last Update</span>
                                                    <span className="text-gray-500">
                                                        {new Date().toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span>Data Points</span>
                                                    <span className="text-gray-500">
                                                        {evaluationData.length}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span>Report Period</span>
                                                    <span className="text-gray-500">
                                                        {selectedPeriod ===
                                                        "current"
                                                            ? "Current Month"
                                                            : selectedPeriod ===
                                                              "quarter"
                                                            ? "This Quarter"
                                                            : "This Year"}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span>Data Status</span>
                                                    <Chip
                                                        label={
                                                            evaluationData.length
                                                                ? "Complete"
                                                                : "Incomplete"
                                                        }
                                                        size="small"
                                                        color={
                                                            evaluationData.length
                                                                ? "success"
                                                                : "warning"
                                                        }
                                                        sx={{
                                                            fontSize: "0.65rem",
                                                            height: "20px",
                                                        }}
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

                {/* Compact Footer */}
                <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="text-xs text-gray-500">
                            Updated: {new Date().toLocaleTimeString()}
                        </div>
                        <span className="inline-flex items-center px-2 h-[22px] rounded-full border border-custom-solidgreen text-custom-solidgreen bg-white text-[0.65rem] font-medium">
                            {`${evaluationData.length} records`}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            className="rounded-md border border-custom-solidgreen text-custom-solidgreen bg-white hover:bg-blue-50 text-xs px-2 py-1 min-w-0 transition-colors duration-150"
                        >
                            Export CSV
                        </button>
                        <button
                            type="button"
                            className="rounded-md gradient-btn5 text-white hover:bg-blue-700 text-xs px-3 py-1 min-w-0 transition-colors duration-150 shadow"
                        >
                            Save Report
                        </button>
                    </div>
                </div>
            </Dialog>

            {/* Side Drawer for Employee Details */}
            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                PaperProps={{
                    sx: {
                        width: { xs: "100vw", sm: 420, md: 500 },
                        maxWidth: "100vw",
                        bgcolor: "#f8fafc",
                        borderTopLeftRadius: 16,
                        borderBottomLeftRadius: 16,
                    },
                }}
                ModalProps={{ sx: { zIndex: 1402 }, hideBackdrop: true }}
            >
                {/* Header with avatar and name */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white rounded-tl-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full gradient-btn5 flex items-center justify-center text-xl font-bold text-white border border-gray-200">
                            {selectedEmployee?.employeeName?.[0] || (
                                <svg
                                    className="w-6 h-6 text-blue-300"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                </svg>
                            )}
                        </div>
                        <div>
                            <div className="text-lg font-semibold text-gray-900 leading-tight">
                                {selectedEmployee?.employeeName ||
                                    "Employee Details"}
                            </div>
                            {selectedEmployee?.role && (
                                <div className="text-xs text-gray-400 mt-0.5">
                                    {selectedEmployee.role}
                                </div>
                            )}
                        </div>
                    </div>
                    <Button
                        onClick={() => setDrawerOpen(false)}
                        size="small"
                        sx={{ color: "#64748b", borderColor: "#e2e8f0" }}
                        variant="outlined"
                    >
                        Close
                    </Button>
                </div>
                <div
                    className="p-6 space-y-6 overflow-y-auto"
                    style={{ maxHeight: "calc(100vh - 120px)" }}
                >
                    {selectedEmployee && (
                        <>
                            {/* Stats Card */}
                            <div className="bg-white rounded-xl border border-gray-300 p-4 flex flex-col gap-3 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 text-center">
                                        <div className="text-xs text-gray-400 mb-1">
                                            Work Orders
                                        </div>
                                        <div className="text-lg font-bold text-blue-600">
                                            {
                                                selectedEmployee.completedWorkOrders
                                            }
                                        </div>
                                    </div>
                                    <div className="flex-1 text-center">
                                        <div className="text-xs text-gray-400 mb-1">
                                            Files Submitted
                                        </div>
                                        <div className="text-lg font-bold text-green-600">
                                            {selectedEmployee.filesSubmitted}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {selectedEmployee.performance !==
                                        undefined && (
                                        <div className="flex-1 text-center">
                                            <div className="text-xs text-gray-400 mb-1">
                                                Performance
                                            </div>
                                            <div className="text-lg font-bold text-purple-600">
                                                {selectedEmployee.performance}
                                            </div>
                                        </div>
                                    )}
                                    {selectedEmployee.efficiency !==
                                        undefined && (
                                        <div className="flex-1 text-center">
                                            <div className="text-xs text-gray-400 mb-1">
                                                Efficiency
                                            </div>
                                            <div className="text-lg font-bold text-orange-500">
                                                {selectedEmployee.efficiency}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* Divider */}
                            <div className="border-t border-gray-200" />
                            {/* Comments Section */}
                            <div className="comments-section-fixed-height">
                                <div className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <svg
                                        className="w-4 h-4 text-emerald-500"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2h2m2-4h4a2 2 0 012 2v2H7V6a2 2 0 012-2z"
                                        />
                                    </svg>
                                    Messages/Comments
                                </div>
                                <div className="flex-1 flex flex-col gap-2 mb-2 overflow-y-auto">
                                    {(
                                        employeeComments[selectedEmployee.id] ||
                                        []
                                    ).length === 0 && (
                                        <div className="text-xs text-gray-400 text-center py-4">
                                            No comments yet.
                                        </div>
                                    )}
                                    {(
                                        employeeComments[selectedEmployee.id] ||
                                        []
                                    ).map((c, idx) => {
                                        // Alternate alignment for demo: even idx right, odd idx left
                                        const isRight = idx % 2 === 0;
                                        return (
                                            <div
                                                key={idx}
                                                className={`flex ${
                                                    isRight
                                                        ? "justify-end"
                                                        : "justify-start"
                                                }`}
                                            >
                                                <div
                                                    className={`max-w-[75%] px-4 py-2 rounded-2xl shadow text-xs break-words relative ${
                                                        isRight
                                                            ? "bg-custom-bluegreen text-white rounded-br-sm"
                                                            : "bg-gray-100 text-gray-800 rounded-bl-sm"
                                                    }`}
                                                >
                                                    <span>{c.text}</span>
                                                    <span
                                                        className={`block mt-1 text-[10px] ${
                                                            isRight
                                                                ? "text-blue-100"
                                                                : "text-gray-400"
                                                        } text-right`}
                                                    >
                                                        {c.date}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}
                </div>
                {/* Comments Input Card at the bottom */}
                {selectedEmployee && (
                    <div className="px-6 pb-6 pt-2 bg-white border-t border-gray-100 rounded-b-2xl">
                        <form
                            className="flex items-end gap-2"
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (newComment.trim()) handleAddComment();
                            }}
                        >
                            <input
                                type="text"
                                className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-custom-solidgreen bg-gray-50 shadow placeholder:text-gray-400"
                                placeholder="Type a message..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        if (newComment.trim())
                                            handleAddComment();
                                    }
                                }}
                            />
                            <button
                                type="submit"
                                disabled={!newComment.trim()}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-custom-solidgreen text-white shadow disabled:opacity-50 disabled:cursor-not-allowed transition"
                                tabIndex={0}
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </button>
                        </form>
                    </div>
                )}
            </Drawer>
        </>
    );
};

export default EmployeeEvaluationModal;

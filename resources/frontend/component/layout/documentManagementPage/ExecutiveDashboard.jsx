import React, { useState, useEffect } from "react";
import {
    CardContent,
    Typography,
    Grid,
    Box,
    Chip,
    IconButton,
    Container,
    Avatar,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    useTheme,
    Paper,
    Tabs,
    Tab,
    Stack,
    LinearProgress,
} from "@mui/material";
import { DataGrid, gridClasses } from "@mui/x-data-grid";
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
import Skeleton from "react-loading-skeleton";
import "react-toastify/dist/ReactToastify.css";
import {
    getDashboardData,
    getCachedDashboardData,
    revalidateDashboardData,
    invalidateDashboardData,
} from "./service/dashboardDataService.jsx";
import "react-loading-skeleton/dist/skeleton.css";

const ExecutiveDashboard = () => {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    const [timeRange, setTimeRange] = useState("week");
    const [searchQuery, setSearchQuery] = useState("");

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
            primary: theme.palette.primary.main,
            success: theme.palette.success.main,
            warning: theme.palette.warning.main,
            error: theme.palette.error.main,
            info: theme.palette.info.main,
        };

        if (cardLoading) {
            return (
                <Paper elevation={0} sx={{ p: 2, height: "100%" }}>
                    <Skeleton height={140} />
                </Paper>
            );
        }

        return (
            <Paper
                elevation={2}
                sx={{
                    p: 2,
                    height: "100%",
                    borderLeft: `4px solid ${colorMap[color]}`,
                    transition: "all 0.3s ease",
                    "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: theme.shadows[6],
                        cursor: "pointer",
                    },
                }}
                onClick={onClick}
            >
                <Box
                    display="flex"
                    flexDirection="column"
                    justifyContent="space-between"
                    height="100%"
                >
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <Avatar
                            sx={{
                                bgcolor: `${colorMap[color]}20`,
                                color: colorMap[color],
                            }}
                        >
                            <Icon style={{ width: 20, height: 20 }} />
                        </Avatar>
                        <Box>
                            <Typography
                                variant="subtitle2"
                                color="text.secondary"
                                fontWeight={500}
                            >
                                {title}
                            </Typography>
                            <Typography
                                variant="h4"
                                fontWeight={700}
                                color="text.primary"
                            >
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
                                        typeof value === "number" &&
                                        value >= 1000
                                            ? `${(value / 1000).toFixed(1)}k`
                                            : value.toString()
                                    }
                                />
                            </Typography>
                        </Box>
                    </Box>
                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="flex-end"
                    >
                        <Typography variant="caption" color="text.secondary">
                            {subtitle}
                        </Typography>
                        {trend !== undefined && (
                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={0.5}
                            >
                                {trend > 0 ? (
                                    <ArrowUpSolid
                                        style={{
                                            width: 14,
                                            height: 14,
                                            color: theme.palette.success.main,
                                        }}
                                    />
                                ) : (
                                    <ArrowDownSolid
                                        style={{
                                            width: 14,
                                            height: 14,
                                            color: theme.palette.error.main,
                                        }}
                                    />
                                )}
                                <Typography
                                    variant="caption"
                                    color={
                                        trend > 0
                                            ? "success.main"
                                            : "error.main"
                                    }
                                    fontWeight={500}
                                >
                                    {Math.abs(trend)}%
                                </Typography>
                            </Stack>
                        )}
                    </Box>
                </Box>
            </Paper>
        );
    };

    const workOrderColumns = [
        {
            field: "workOrderId",
            headerName: "WO ID",
            width: 100,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={500}>
                    #{params.value}
                </Typography>
            ),
        },
        {
            field: "type",
            headerName: "Type",
            width: 180,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    size="small"
                    variant="outlined"
                    sx={{
                        borderWidth: "1.5px",
                        fontWeight: 500,
                    }}
                />
            ),
        },
        {
            field: "account",
            headerName: "Account",
            width: 140,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={500}>
                    {params.value}
                </Typography>
            ),
        },
        {
            field: "status",
            headerName: "Status",
            width: 130,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    size="small"
                    sx={{
                        fontWeight: 600,
                        textTransform: "capitalize",
                        backgroundColor:
                            params.value === "Complete"
                                ? `${theme.palette.success.light}20`
                                : params.value === "In Progress" ||
                                  params.value === "Assigned"
                                ? `${theme.palette.primary.light}20`
                                : params.value === "Pending"
                                ? `${theme.palette.warning.light}20`
                                : `${theme.palette.error.light}20`,
                        color:
                            params.value === "Complete"
                                ? theme.palette.success.dark
                                : params.value === "In Progress" ||
                                  params.value === "Assigned"
                                ? theme.palette.primary.dark
                                : params.value === "Pending"
                                ? theme.palette.warning.dark
                                : theme.palette.error.dark,
                    }}
                />
            ),
        },
        {
            field: "assignee",
            headerName: "Assignee",
            width: 150,
            renderCell: (params) => (
                <Box display="flex" alignItems="center" gap={1}>
                    <Avatar
                        sx={{
                            width: 24,
                            height: 24,
                            fontSize: "0.75rem",
                            backgroundColor: theme.palette.grey[300],
                            color: theme.palette.text.primary,
                        }}
                    >
                        {params.value
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                    </Avatar>
                    <Typography variant="body2">{params.value}</Typography>
                </Box>
            ),
        },
        {
            field: "priority",
            headerName: "Priority",
            width: 110,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    variant="filled"
                    size="small"
                    sx={{
                        fontWeight: 600,
                        backgroundColor:
                            params.value === "Critical"
                                ? theme.palette.error.main
                                : params.value === "High"
                                ? theme.palette.warning.main
                                : params.value === "Medium"
                                ? theme.palette.info.main
                                : theme.palette.success.main,
                        color: theme.palette.common.white,
                    }}
                />
            ),
        },
        {
            field: "daysOpen",
            headerName: "Days Open",
            type: "number",
            width: 120,
            renderCell: (params) => (
                <Box width="100%">
                    <Typography variant="body2" fontWeight={500} mb={0.5}>
                        {params.value}d
                    </Typography>
                    <LinearProgress
                        variant="determinate"
                        value={Math.min(params.value * 10, 100)}
                        sx={{
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: theme.palette.grey[200],
                            "& .MuiLinearProgress-bar": {
                                backgroundColor:
                                    params.value > 14
                                        ? theme.palette.error.main
                                        : params.value > 7
                                        ? theme.palette.warning.main
                                        : theme.palette.success.main,
                            },
                        }}
                    />
                </Box>
            ),
        },
    ];

    const statusColors = {
        Complete: theme.palette.success.main,
        "In Progress": theme.palette.primary.main,
        Pending: theme.palette.warning.main,
        Overdue: theme.palette.error.main,
        Assigned: theme.palette.info.main,
    };

    const priorityColors = {
        Critical: theme.palette.error.main,
        High: theme.palette.warning.main,
        Medium: theme.palette.info.main,
        Low: theme.palette.success.main,
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
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Box mb={4}>
                    <Skeleton height={40} width="30%" />
                    <Skeleton height={20} width="50%" />
                </Box>
                <Grid container spacing={3}>
                    {[1, 2, 3, 4].map((i) => (
                        <Grid item xs={12} sm={6} md={3} key={i}>
                            <Skeleton height={140} />
                        </Grid>
                    ))}
                    <Grid item xs={12} md={6}>
                        <Skeleton height={350} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Skeleton height={350} />
                    </Grid>
                    <Grid item xs={12}>
                        <Skeleton height={400} />
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <Skeleton height={450} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Skeleton height={450} />
                    </Grid>
                </Grid>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Paper elevation={0} sx={{ p: 4, textAlign: "center" }}>
                    <ExclamationTriangleSolid
                        style={{
                            width: 48,
                            height: 48,
                            color: theme.palette.error.main,
                            marginBottom: 16,
                        }}
                    />
                    <Typography variant="h5" color="error" gutterBottom>
                        Error loading dashboard
                    </Typography>
                    <Typography
                        variant="body1"
                        color="text.secondary"
                        paragraph
                    >
                        {error.message || "An unknown error occurred"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Please try again later or contact support if the problem
                        persists.
                    </Typography>
                </Paper>
            </Container>
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
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box
                mb={4}
                display="flex"
                justifyContent="space-between"
                alignItems="flex-start"
                flexWrap="wrap"
                gap={2}
            >
                <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                    <Tabs
                        value={timeRange}
                        onChange={(e, newValue) => setTimeRange(newValue)}
                        sx={{
                            "& .MuiTabs-indicator": {
                                height: 3,
                                borderRadius: 3,
                            },
                        }}
                    >
                        <Tab
                            value="week"
                            label="Week"
                            sx={{
                                minHeight: 36,
                                minWidth: 80,
                                fontSize: "0.75rem",
                                fontWeight: 600,
                            }}
                        />
                        <Tab
                            value="month"
                            label="Month"
                            sx={{
                                minHeight: 36,
                                minWidth: 80,
                                fontSize: "0.75rem",
                                fontWeight: 600,
                            }}
                        />
                        <Tab
                            value="quarter"
                            label="Quarter"
                            sx={{
                                minHeight: 36,
                                minWidth: 80,
                                fontSize: "0.75rem",
                                fontWeight: 600,
                            }}
                        />
                    </Tabs>
                    <Chip
                        icon={
                            <CalendarIcon style={{ width: 16, height: 16 }} />
                        }
                        label={`Last updated: ${format(
                            new Date(),
                            "MMM dd, hh:mm a"
                        )}`}
                        variant="outlined"
                        sx={{
                            borderColor: theme.palette.divider,
                            color: theme.palette.text.secondary,
                        }}
                    />
                    <IconButton
                        sx={{
                            backgroundColor: theme.palette.action.hover,
                            "&:hover": {
                                backgroundColor: theme.palette.action.selected,
                            },
                        }}
                    >
                        <BellIcon style={{ width: 20, height: 20 }} />
                    </IconButton>
                </Box>
            </Box>

            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6} md={3}>
                    <KPICard
                        title="Total Work Orders"
                        value={dashboardData.kpis.totalWorkOrders}
                        subtitle="Currently active"
                        icon={DocumentTextIcon}
                        trend={dashboardData.kpis.monthlyGrowth}
                        color="primary"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KPICard
                        title="Completion Rate"
                        value={`${(
                            (dashboardData.kpis.completedWorkOrders /
                                dashboardData.kpis.totalWorkOrders) *
                            100
                        ).toFixed(1)}`}
                        subtitle="Orders completed"
                        icon={CheckCircleIcon}
                        trend={5.2}
                        color="success"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KPICard
                        title="Avg. Completion"
                        value={`${dashboardData.kpis.averageCompletionTime}`}
                        subtitle="Days on average"
                        icon={ClockIcon}
                        trend={-12.1}
                        color="warning"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KPICard
                        title="Overdue Orders"
                        value={dashboardData.kpis.overdueWorkOrders}
                        subtitle="Require attention"
                        icon={ExclamationTriangleIcon}
                        trend={-23.5}
                        color="error"
                    />
                </Grid>
            </Grid>

            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ height: "100%" }}>
                        <CardContent>
                            <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                mb={2}
                            >
                                <Typography variant="h6" fontWeight={600}>
                                    Work Orders by Status
                                </Typography>
                                <IconButton size="small">
                                    <ChartPieIcon
                                        style={{ width: 18, height: 18 }}
                                    />
                                </IconButton>
                            </Box>
                            <Box height={300}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={
                                                dashboardData.workOrdersByStatus
                                            }
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
                                                            statusColors[
                                                                entry.name
                                                            ] ||
                                                            theme.palette
                                                                .grey[500]
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
                                            formatter={(
                                                value,
                                                entry,
                                                index
                                            ) => (
                                                <span
                                                    style={{
                                                        color: theme.palette
                                                            .text.primary,
                                                        fontSize: "0.75rem",
                                                        marginLeft: 4,
                                                    }}
                                                >
                                                    {value}
                                                </span>
                                            )}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ height: "100%" }}>
                        <CardContent>
                            <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                mb={2}
                            >
                                <Typography variant="h6" fontWeight={600}>
                                    Work Orders by Type
                                </Typography>
                                <IconButton size="small">
                                    <ChartBarIcon
                                        style={{ width: 18, height: 18 }}
                                    />
                                </IconButton>
                            </Box>
                            <Box height={300}>
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
                                            tick={{ fontSize: 12 }}
                                        />
                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fontSize: 12 }}
                                        />
                                        <RechartsTooltip
                                            cursor={{
                                                fill: theme.palette.action
                                                    .hover,
                                            }}
                                            contentStyle={{
                                                borderRadius: 8,
                                                border: "none",
                                                boxShadow: theme.shadows[3],
                                                backgroundColor:
                                                    theme.palette.background
                                                        .paper,
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
                                            fill={theme.palette.primary.main}
                                        />
                                        <Bar
                                            dataKey="completed"
                                            name="Complete"
                                            radius={[4, 4, 0, 0]}
                                            fill={theme.palette.success.main}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Paper>
                </Grid>
            </Grid>

            <Paper elevation={2} sx={{ mb: 4, borderRadius: 2 }}>
                <CardContent>
                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={2}
                    >
                        <Typography variant="h6" fontWeight={600}>
                            Monthly Performance Trends
                        </Typography>
                        <Stack direction="row" spacing={1}>
                            <Chip
                                label="Created"
                                size="small"
                                variant="outlined"
                                icon={
                                    <ArrowUpSolid
                                        style={{
                                            width: 14,
                                            height: 14,
                                            color: theme.palette.primary.main,
                                        }}
                                    />
                                }
                            />
                            <Chip
                                label="Completed"
                                size="small"
                                variant="outlined"
                                icon={
                                    <CheckCircleSolid
                                        style={{
                                            width: 14,
                                            height: 14,
                                            color: theme.palette.success.main,
                                        }}
                                    />
                                }
                            />
                            <Chip
                                label="Efficiency"
                                size="small"
                                variant="outlined"
                                icon={
                                    <ArrowPathIcon
                                        style={{
                                            width: 14,
                                            height: 14,
                                            color: theme.palette.warning.main,
                                        }}
                                    />
                                }
                            />
                        </Stack>
                    </Box>
                    <Box height={350}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={dashboardData.monthlyTrends}
                                margin={{
                                    top: 10,
                                    right: 20,
                                    left: 0,
                                    bottom: 0,
                                }}
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
                                            stopColor={
                                                theme.palette.primary.main
                                            }
                                            stopOpacity={0.8}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor={
                                                theme.palette.primary.main
                                            }
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
                                            stopColor={
                                                theme.palette.success.main
                                            }
                                            stopOpacity={0.8}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor={
                                                theme.palette.success.main
                                            }
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke={theme.palette.divider}
                                />
                                <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis
                                    yAxisId="left"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fontSize: 12 }}
                                />
                                <RechartsTooltip
                                    contentStyle={{
                                        borderRadius: 8,
                                        border: "none",
                                        boxShadow: theme.shadows[3],
                                        backgroundColor:
                                            theme.palette.background.paper,
                                    }}
                                />
                                <Area
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="created"
                                    stroke={theme.palette.primary.main}
                                    fillOpacity={1}
                                    fill="url(#colorCreated)"
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                                <Area
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="complete"
                                    stroke={theme.palette.success.main}
                                    fillOpacity={1}
                                    fill="url(#colorCompleted)"
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    connectNulls={true}
                                    dataKey="efficiency"
                                    stroke={theme.palette.warning.main}
                                    strokeWidth={2}
                                    dot={{ r: 3 }}
                                    activeDot={{ r: 5 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Box>
                </CardContent>
            </Paper>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Paper
                        elevation={2}
                        sx={{ height: "100%", borderRadius: 2 }}
                    >
                        <CardContent>
                            <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                mb={2}
                            >
                                <Typography variant="h6" fontWeight={600}>
                                    Recent Work Orders
                                </Typography>
                                <Stack direction="row" spacing={1}>
                                    <IconButton size="small">
                                        <FunnelIcon
                                            style={{ width: 16, height: 16 }}
                                        />
                                    </IconButton>
                                    <IconButton size="small">
                                        <ArrowPathIcon
                                            style={{ width: 16, height: 16 }}
                                        />
                                    </IconButton>
                                </Stack>
                            </Box>
                            <Box height={400}>
                                <DataGrid
                                    rows={dashboardData.recentWorkOrders.map(
                                        (row, index) => ({
                                            ...row,
                                            id: row.id || index,
                                        })
                                    )}
                                    columns={workOrderColumns.map((col) => ({
                                        ...col,
                                        // Ensure consistent alignment
                                        headerAlign: col.headerAlign || "left",
                                        align: col.align || "left",
                                        // Add minimum width if not specified
                                        minWidth: col.minWidth || 100,
                                        // Ensure flex property for responsive columns
                                        flex: col.flex || (col.width ? 0 : 1),
                                    }))}
                                    pageSize={5}
                                    rowsPerPageOptions={[5]}
                                    disableSelectionOnClick
                                    getRowId={(row) => row.id}
                                    autoHeight={false}
                                    sx={{
                                        border: "none",
                                        height: "100%",
                                        "& .MuiDataGrid-root": {
                                            border: "none",
                                        },
                                        "& .MuiDataGrid-main": {
                                            border: "none",
                                        },
                                        "& .MuiDataGrid-columnHeaders": {
                                            backgroundColor:
                                                theme.palette.grey[100],
                                            borderRadius: 1,
                                            minHeight: "48px !important",
                                            maxHeight: "48px !important",
                                        },
                                        "& .MuiDataGrid-columnHeader": {
                                            padding: "0 16px",
                                            "&:focus, &:focus-within": {
                                                outline: "none",
                                            },
                                        },
                                        "& .MuiDataGrid-columnHeaderTitle": {
                                            fontWeight: 600,
                                            fontSize: "0.875rem",
                                        },
                                        "& .MuiDataGrid-cell": {
                                            borderBottom: `1px solid ${theme.palette.divider}`,
                                            padding: "0 16px",
                                            display: "flex",
                                            alignItems: "center",
                                            minHeight: "52px !important",
                                            maxHeight: "52px !important",
                                            "&:focus, &:focus-within": {
                                                outline: "none",
                                            },
                                        },
                                        "& .MuiDataGrid-row": {
                                            minHeight: "52px !important",
                                            maxHeight: "52px !important",
                                            "&:hover": {
                                                backgroundColor:
                                                    theme.palette.action.hover,
                                            },
                                            "&.Mui-selected": {
                                                backgroundColor: "transparent",
                                                "&:hover": {
                                                    backgroundColor:
                                                        theme.palette.action
                                                            .hover,
                                                },
                                            },
                                        },
                                        "& .MuiDataGrid-virtualScroller": {
                                            // Ensure consistent scrolling behavior
                                            overflowX: "auto",
                                        },
                                        "& .MuiDataGrid-footerContainer": {
                                            borderTop: `1px solid ${theme.palette.divider}`,
                                            minHeight: "52px",
                                        },
                                        // Remove alternating row colors that might cause alignment issues
                                        [`& .${gridClasses.row}.even`]: {
                                            backgroundColor: "transparent",
                                            "&:hover": {
                                                backgroundColor:
                                                    theme.palette.action.hover,
                                            },
                                        },
                                    }}
                                    components={{
                                        NoRowsOverlay: () => (
                                            <Stack
                                                height="100%"
                                                alignItems="center"
                                                justifyContent="center"
                                            >
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    No work orders found
                                                </Typography>
                                            </Stack>
                                        ),
                                    }}
                                    disableColumnMenu
                                    disableColumnFilter
                                    disableColumnSelector
                                    disableDensitySelector
                                />
                            </Box>
                        </CardContent>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper
                        elevation={2}
                        sx={{ height: "100%", borderRadius: 2 }}
                    >
                        <CardContent>
                            <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                mb={2}
                            >
                                <Typography variant="h6" fontWeight={600}>
                                    System Alerts
                                </Typography>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            px: 1,
                                            py: 0.5,
                                            backgroundColor:
                                                theme.palette.grey[100],
                                            borderRadius: 1,
                                        }}
                                    >
                                        <MagnifyingGlassIcon
                                            style={{
                                                width: 16,
                                                height: 16,
                                                color: theme.palette.text
                                                    .secondary,
                                            }}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Search alerts..."
                                            value={searchQuery}
                                            onChange={(e) =>
                                                setSearchQuery(e.target.value)
                                            }
                                            style={{
                                                border: "none",
                                                background: "transparent",
                                                outline: "none",
                                                fontSize: "0.875rem",
                                                padding: "0 4px",
                                                width: 120,
                                            }}
                                        />
                                    </Paper>
                                    <IconButton size="small">
                                        <ArrowPathIcon
                                            style={{ width: 16, height: 16 }}
                                        />
                                    </IconButton>
                                </Box>
                            </Box>
                            <Box height={400} overflow="auto">
                                {filteredAlerts.length > 0 ? (
                                    <List dense disablePadding>
                                        {filteredAlerts.map((alert) => (
                                            <React.Fragment key={alert.id}>
                                                <ListItem
                                                    alignItems="flex-start"
                                                    sx={{
                                                        transition: "all 0.2s",
                                                        "&:hover": {
                                                            backgroundColor:
                                                                theme.palette
                                                                    .action
                                                                    .hover,
                                                            borderRadius: 1,
                                                        },
                                                    }}
                                                >
                                                    <ListItemIcon
                                                        sx={{ minWidth: 36 }}
                                                    >
                                                        {alert.type ===
                                                        "success" ? (
                                                            <CheckCircleSolid
                                                                style={{
                                                                    width: 18,
                                                                    height: 18,
                                                                    color: theme
                                                                        .palette
                                                                        .success
                                                                        .main,
                                                                }}
                                                            />
                                                        ) : (
                                                            <ExclamationTriangleSolid
                                                                style={{
                                                                    width: 18,
                                                                    height: 18,
                                                                    color:
                                                                        alert.type ===
                                                                        "warning"
                                                                            ? theme
                                                                                  .palette
                                                                                  .warning
                                                                                  .main
                                                                            : theme
                                                                                  .palette
                                                                                  .info
                                                                                  .main,
                                                                }}
                                                            />
                                                        )}
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={
                                                            <Typography
                                                                variant="body2"
                                                                fontWeight={600}
                                                                sx={{
                                                                    display:
                                                                        "flex",
                                                                    alignItems:
                                                                        "center",
                                                                    gap: 1,
                                                                }}
                                                            >
                                                                {alert.workOrderId && (
                                                                    <Chip
                                                                        label={`WO: ${alert.workOrderId}`}
                                                                        size="small"
                                                                        variant="outlined"
                                                                        sx={{
                                                                            height: 20,
                                                                            fontSize:
                                                                                "0.65rem",
                                                                            fontWeight: 700,
                                                                        }}
                                                                    />
                                                                )}
                                                                {alert.title}
                                                            </Typography>
                                                        }
                                                        secondary={
                                                            <>
                                                                <Typography
                                                                    variant="body2"
                                                                    color="text.secondary"
                                                                    sx={{
                                                                        mt: 0.5,
                                                                    }}
                                                                >
                                                                    {
                                                                        alert.message
                                                                    }
                                                                </Typography>
                                                                <Typography
                                                                    variant="caption"
                                                                    color="text.secondary"
                                                                    sx={{
                                                                        display:
                                                                            "block",
                                                                        mt: 0.5,
                                                                    }}
                                                                >
                                                                    {format(
                                                                        new Date(
                                                                            alert.timestamp
                                                                        ),
                                                                        "MMM dd, hh:mm a"
                                                                    )}
                                                                </Typography>
                                                            </>
                                                        }
                                                        sx={{ my: 0 }}
                                                    />
                                                </ListItem>
                                                <Divider sx={{ my: 1 }} />
                                            </React.Fragment>
                                        ))}
                                    </List>
                                ) : (
                                    <Box
                                        display="flex"
                                        flexDirection="column"
                                        alignItems="center"
                                        justifyContent="center"
                                        height="100%"
                                        textAlign="center"
                                        p={2}
                                    >
                                        <MagnifyingGlassIcon
                                            style={{
                                                width: 48,
                                                height: 48,
                                                color: theme.palette.grey[400],
                                                marginBottom: 2,
                                            }}
                                        />
                                        <Typography
                                            variant="body1"
                                            color="text.secondary"
                                        >
                                            No alerts found
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Try adjusting your search query
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </CardContent>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default ExecutiveDashboard;

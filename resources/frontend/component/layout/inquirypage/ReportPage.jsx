import React, { PureComponent, useCallback, useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    Rectangle,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LabelList,
    Label,
} from "recharts";
import apiService from "../../servicesApi/apiService";
import debounce from "lodash/debounce";
import { useStateContext } from "../../../context/contextprovider";
import { IoMdArrowDropdown } from "react-icons/io";
import { useLocation } from "react-router-dom";

const data = [
    { name: "01", Resolved: 0, Unresolved: 0 },
    { name: "02", Resolved: 23, Unresolved: 5 },
    { name: "03", Resolved: 26, Unresolved: 15 },
    { name: "04", Resolved: 15, Unresolved: 13 },
    { name: "05", Resolved: 4, Unresolved: 1 },
    { name: "06", Resolved: 5, Unresolved: 11 },
    { name: "07", Resolved: 19, Unresolved: 9 },
    { name: "08", Resolved: 19, Unresolved: 19 },
    { name: "09", Resolved: 15, Unresolved: 20 },
    { name: "10", Resolved: 23, Unresolved: 9 },
    { name: "11", Resolved: 28, Unresolved: 26 },
    { name: "12", Resolved: 13, Unresolved: 9 },
];

const data2 = [
    { name: "Group A", value: 40 },
    { name: "Group B", value: 60 },
];

const data3 = [
    { name: "38 Park Ave.", value1: 44, value2: 123 },
    { name: "Casa Mira", value1: 136, value2: 220 },
    { name: "Mivessa", value1: 275, value2: 44 },
];

const barHeight = 20;


const COLORS = ["#5B9BD5", "#348017"];

const categoryColors = {
    "Reservation Documents": "#348017",
    "Payment Issues": "#5B9BD5",
    "Statement of Account and Billing Statement": "#348017",
    "Turnover Status/Unit Concerns": "#5B9BD5",
    "Loan Application": "#348017",
    "Title and Other Registration Documents": "#5B9BD5",
    Commissions: "#5B9BD5",
    "Other Concerns": "#5B9BD5",
};

const SINGLE_COLOR = "#5B9BD5";

const getCategoryColor = (categoryName) => {
    return categoryColors[categoryName] || "#8884d8";
};
const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-2 shadow-lg rounded">
                {/*  <p>{`${payload[0].name}`}</p> */}
                <p>{`Resolved: ${payload[0].value}`}</p>
                <p>{`Unresolved: ${payload[1].value}`}</p>
            </div>
        );
    }

    return null;
};

const monthNames = {
    "01": "January",
    "02": "February",
    "03": "March",
    "04": "April",
    "05": "May",
    "06": "June",
    "07": "July",
    "08": "August",
    "09": "September",
    10: "October",
    11: "November",
    12: "December",
};

const CustomTooltip1 = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const monthName = monthNames[label] || label;
        return (
            <div className="custom-tooltip bg-white p-2 shadow-md rounded">
                <p className="label">{`${monthName}`}</p>
                <p>{`Resolved: ${payload[0].value}`}</p>
                <p>{`Unresolved: ${payload[1].value}`}</p>
            </div>
        );
    }

    return null;
};

const ReportPage = () => {
    const {
        setMonth,
        month,
        dataCategory,
        fetchCategory,
        dataProperty,
        getInquiriesPerProperty,
        propertyMonth,
        setPropertyMonth,
        user,
        department,
        setDepartment,
        dataSet,
        fetchDataReport
    } = useStateContext();

    const defaultData = [{ name: "No Data" }];
    const dataToDisplay = dataCategory.length > 0 ? dataCategory : defaultData;
    const location = useLocation();

    const getCurrentMonth = () => {
        const months = [
          'january', 'february', 'march', 'april', 'may', 'june',
          'july', 'august', 'september', 'october', 'november', 'december'
        ];
        const currentMonthIndex = new Date().getMonth(); 
        return months[currentMonthIndex];
      };
    
    const chartHeight = dataProperty.length * (barHeight + 60);

    const allDepartment = [
        { key: "All", value: "All" },
        { key: "CRS", value: "Customer Relations Services" },
        { key: "SALES", value: "Sales" },
        { key: "AP", value: "Ap Commission" },
        { key: "PM", value: "Property Management" },
    ];


    // const getCurrentMonth = () => {
    //     const date = new Date();
    //     const options = { month: "long" };
    //     return new Intl.DateTimeFormat("en-US", options).format(date);
    // };

    const handleInputChange = (e) => {
        setMonth(e.target.value);
    };

    const handleInputChangeProperty = (e) => {
        setPropertyMonth(e.target.value);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            fetchCategory(month);
        }
    };

    const handleKeyDownProperty = (e) => {
        if (e.key === "Enter") {
            getInquiriesPerProperty(propertyMonth);
        }
    };
    // useEffect(() => {
    //     const currentMonth = getCurrentMonth();
    //     setMonth(currentMonth);
    //     setPropertyMonth(currentMonth);
    // }, []);
  
    useEffect(() => {
        fetchCategory();
        getInquiriesPerProperty();
        fetchDataReport();
    }, []);

    useEffect(() => {
        setMonth(getCurrentMonth()); 
        setPropertyMonth(getCurrentMonth());
      }, []);


    return (
        <div className="h-screen bg-custom-grayFA p-4">
            <div className="bg-white p-4 rounded-[10px]">
                <div className="w-[300px] mb-2">
                    <p className="text-lg montserrat-bold">
                        Resolved vs. Unresolved Chart
                    </p>
                    <div className="flex items-center border rounded-md overflow-hidden">
                        <span className="text-custom-gray81 bg-custom-grayFA flex items-center w-44 -mr-3 pl-3 py-1">
                            Department
                        </span>
                        <div className="relative w-full">
                            <select
                                name="concern"
                                className="appearance-none w-full px-4 py-1 bg-white focus:outline-none border-0"
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                            >
                                {user?.department === "CRS" ? (
                                    allDepartment.map((item, index) => (
                                        <option key={index} value={item.key}>
                                            {item.value}
                                        </option>
                                    ))
                                ) : (
                                    <option value={user?.department}>
                                        {user?.department}
                                    </option>
                                )}
                            </select>
                            <span className="absolute inset-y-0 right-0 flex items-center text-custom-gray81 pr-3 pl-3 bg-custom-grayFA pointer-events-none">
                                <IoMdArrowDropdown />
                            </span>
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <BarChart
                        width={1000}
                        height={180}
                        data={dataSet}
                        margin={{
                            top: 5,
                            right: 30,
                            left: -25,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis ticks={[10, 20, 30]} />
                        <Tooltip content={<CustomTooltip1 />} />
                        <Bar
                            dataKey="Resolved"
                            fill="#348017"
                            barSize={12}
                            radius={[3, 3, 0, 0]}
                        />
                        <Bar
                            dataKey="Unresolved"
                            fill="#D6E4D1"
                            barSize={12}
                            radius={[3, 3, 0, 0]}
                        />
                    </BarChart>
                </div>
                <div className="flex gap-6">
                    <div className="flex items-center px-3 py-2 gap-3">
                        <span className="flex items-center text-custom-solidgreen text-2xl">
                            ●
                        </span>
                        <span className="text-custom-gray12">Resolved</span>
                    </div>
                    <div className="flex items-center px-3 py-2 gap-3">
                        <span className="flex items-center text-custom-lightestgreen text-2xl">
                            ●
                        </span>
                        <span className="text-custom-gray12">Unresolved</span>
                    </div>
                </div>
            </div>
            <div className="flex gap-3 mt-4 bg-custom-grayFA items-start">
                <div className="w-[418px] pb-7 min-h-[335px] flex-grow-1 bg-white rounded-lg">
                    <p className="p-4 text-base montserrat-bold">
                        Inquiries per category
                    </p>
                    <div className="border border-t-1"></div>
                    <div className="mt-4 w-[300px]">
                        <div className="flex items-center border rounded-md overflow-hidden">
                            <span className="text-custom-gray81 bg-custom-grayFA flex items-center text-sm w-[150px] -mr-3 pl-3 py-1">
                                For the month of
                            </span>
                            <div className="relative w-[159px]">
                                <select
                                    name="concern"
                                    className="appearance-none w-full px-4 py-1 bg-white focus:outline-none border-0"
                                    value={month}
                                    onChange={(e) => setMonth(e.target.value)}
                                >
                                    <option value="january">January</option>
                                    <option value="february">February</option>
                                    <option value="march">March</option>
                                    <option value="april">April</option>
                                    <option value="may">May</option>
                                    <option value="june">June</option>
                                    <option value="july">July</option>
                                    <option value="august">August</option>
                                    <option value="september">September</option>
                                    <option value="october">October</option>
                                    <option value="november">November</option>
                                    <option value="december">December</option>
                                </select>
                                <span className="absolute inset-y-0 right-0 flex items-center text-custom-gray81 pr-3 pl-3 bg-custom-grayFA pointer-events-none">
                                    <IoMdArrowDropdown />
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex">
                        <div>
                            <PieChart width={230} height={260}>
                                <Pie
                                    data={dataToDisplay}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    innerRadius={0}
                                    paddingAngle={1}
                                    strokeWidth={5}
                                    cornerRadius={0}
                                    fill="#8884d8"
                                    dataKey="value"
                                    startAngle={90}
                                    endAngle={450}
                                >
                                    {dataToDisplay.map((entry, index) => (
                                        <Cell
                                            key={index}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                            </PieChart>
                        </div>

                        {/*  <div className="w-full flex justify-start items-center">
                            <div className="flex flex-col">
                                <div className="flex gap-10 ">
                                    <div className="flex gap-1 items-center">
                                        <span className="text-xl mb-1 text-custom-lightblue">
                                            ●
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            Reservation Documents
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-gray-700 font-semibold text-lg">
                                            40
                                        </span>
                                        <span className="text-custom-gray81">
                                            %
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-10 justify-between">
                                    <div className="flex gap-1 items-center">
                                        <span className="text-xl mb-1 text-custom-solidgreen">
                                            ●
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            Payment Issues
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-gray-700 font-semibold text-lg">
                                            60
                                        </span>
                                        <span className="text-custom-gray81">
                                            %
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div> */}
                        <div className="w-full flex justify-start mt-[90px]">
                            <div className="flex flex-col">
                                {dataToDisplay.map((category, index) => (
                                    <div
                                        className="flex justify-between"
                                        key={index}
                                    >
                                        <div className="flex gap-1 items-center">
                                            <span
                                                className="text-xl mb-1"
                                                style={{
                                                    color: getCategoryColor(
                                                        category.name
                                                    ),
                                                }}
                                            >
                                                ●
                                            </span>
                                            <span className="text-sm text-gray-500 leading-[15px] py-[4px]">
                                                {category.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-gray-700 font-semibold text-lg">
                                                {category.value}
                                            </span>
                                            <span className="text-custom-gray81">
                                                {category.value ? "%" : ""}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className=" bg-white rounded-[10px]  w-[500px] flex flex-col overflow-y-auto">
                    <p className="p-4  text-base montserrat-bold">
                        Inquiries per property
                    </p>
                    <div className="border border-t-1"></div>
                    <div className="mt-4 w-[300px]">
                        <div className="flex items-center border rounded-md overflow-hidden">
                            <span className="text-custom-gray81 bg-custom-grayFA flex items-center text-sm w-[150px] -mr-3 pl-3 py-1">
                                For the month of
                            </span>
                            <div className="relative w-[159px]">
                                <select
                                    name="concern"
                                    className="appearance-none w-full px-4 py-1 bg-white focus:outline-none border-0"
                                    onChange={(e) => setPropertyMonth(e.target.value)}
                                    value={propertyMonth}
                                >
                                    <option value="january">January</option>
                                    <option value="february">February</option>
                                    <option value="march">March</option>
                                    <option value="april">April</option>
                                    <option value="may">May</option>
                                    <option value="june">June</option>
                                    <option value="july">July</option>
                                    <option value="august">August</option>
                                    <option value="september">September</option>
                                    <option value="october">October</option>
                                    <option value="november">November</option>
                                    <option value="december">December</option>
                                </select>
                                <span className="absolute inset-y-0 right-0 flex items-center text-custom-gray81 pr-3 pl-3 bg-custom-grayFA pointer-events-none">
                                    <IoMdArrowDropdown />
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex-grow">

                        <BarChart
                            width={400}
                            height={chartHeight}
                            data={dataProperty}
                            layout="vertical"
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <XAxis type="number" hide />
                            <YAxis
                                type="category"
                                dataKey="name"
                                hide
                                tick={false}
                            />
                            <Tooltip content={<CustomTooltip />} />

                            <Bar
                                dataKey="resolved"
                                fill="#348017"
                                barSize={15}
                                radius={[0, 4, 4, 0]}
                            >
                                <LabelList
                                    dataKey="resolved"
                                    position="right"
                                    fill="#4a5568"
                                />
                                <LabelList
                                    dataKey="name"
                                    position="top"
                                    content={({ x, y, value }) => (
                                        <text
                                            x={x}
                                            y={y - 13}
                                            fill="#00000"
                                            textAnchor="start"
                                            dominantBaseline="central"
                                        >
                                            {value}
                                        </text>
                                    )}
                                />
                            </Bar>

                            <Bar
                                dataKey="unresolved" // Update this to unresolved
                                fill="#D3F1D8"
                                barSize={15}
                                radius={[0, 4, 4, 0]}
                            >
                                <LabelList
                                    dataKey="unresolved" // Update this to unresolved
                                    position="right"
                                    fill="#4a5568"
                                />
                            </Bar>
                        </BarChart>

                        <div className="flex justify-end">
                            <div className="flex items-center px-3 py-2 gap-3">
                                <span className="flex items-center text-custom-lightestgreen text-2xl">
                                    ●
                                </span>
                                <span className="text-custom-gray12">
                                    Unresolved
                                </span>
                            </div>
                            <div className="flex items-center px-3 py-2 gap-3">
                                <span className="flex items-center text-custom-solidgreen text-2xl">
                                    ●
                                </span>
                                <span className="text-custom-gray12">
                                    Resolved
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportPage;

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
import { TiDownload } from "react-icons/ti";
import { useStateContext } from "../../../context/contextprovider";
import { IoMdArrowDropdown } from "react-icons/io";
import { useLocation } from "react-router-dom";

const barHeight = 20;

const dataSet2 = [
    { name: "Email", value: 20 },
    { name: "Call", value: 15 },
    { name: "Walk-in", value: 25 },
    { name: "Website", value: 30 },
    { name: "Social Media", value: 18 },
    { name: "Branch Tablet", value: 22 },
    { name: "Internal Endorsement", value: 12 },
];
const colors = ["#348017", "#70AD47", "#1A73E8", "#5B9BD5", "#175D5F", "#404B52", "#A5A5A5"];

const COLORS = [
    "#1F77B4", // Blue
    "#FF7F0E", // Orange
    "#2CA02C", // Green
    "#D62728", // Red
    "#9467BD", // Purple
    "#8C564B", // Brown
    "#E377C2", // Pink
    "#7F7F7F", // Gray
    "#BCBD22", // Olive
    "#17BECF"  // Teal
];

const CustomTick = ({ x, y, payload }) => {
    const words = payload.value.split(' '); // Split by spaces to handle word wrapping
    return (
      <g transform={`translate(${x},${y})`}>
        {words.map((word, index) => (
          <text
            key={index}
            x={0}
            y={index * 12} // Adjust the y position for each line of text
            textAnchor="middle"
            fontSize={10}
            fill="#000"
          >
            {word}
          </text>
        ))}
      </g>
    );
  };

const categoryColors = {
    "Commissions": COLORS[0],
    "Leasing": COLORS[1],
    "Loan Application": COLORS[2],
    "Other Concerns": COLORS[3],
    "Payment Issues": COLORS[4],
    "Reservation Documents": COLORS[5],
    "SOA/ Buyer's Ledger": COLORS[6],
    "Title and Other Registration Documents": COLORS[7],
    "Turn Over Status": COLORS[8],
    "Unit Status": COLORS[9],
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
const CustomTooltip2 = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-2 shadow-lg rounded">
                {/*  <p>{`${payload[0].name}`}</p> */}
                <p>{`Complaints: ${payload[0].value}`}</p>
                <p>{`Requests: ${payload[1].value}`}</p>
                <p>{`Inquiries: ${payload[2].value}`}</p>
                <p>{`Suggestions or Recommendations: ${payload[3].value}`}</p>
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
        communicationTypeData,
        getCommunicationTypePerProperty,
        getInquiriesPerProperty,
        propertyMonth,
        setPropertyMonth,
        setCommunicationTypeMonth,
        communicationTypeMonth,
        user,
        setDepartment,
        department,
        dataSet,
        fetchDataReport,
        allEmployees,
        data,
        setDepartmentStatusYear,
        departmentStatusYear,
        setInquiriesPerCategoryYear,
        inquiriesPerCategoryYear,
        setInquiriesPerPropertyYear,
        inquiriesPerPropertyYear,
        setCommunicationTypeYear,
        communicationTypeYear,
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
    const chartHeight2 = communicationTypeData.length * (barHeight + 100);

    const allDepartment = allEmployees
        ? ["All", ...Array.from(new Set(allEmployees
            .map((employee) => employee.department)
            .filter((department) => department !== null && department !== undefined && department !== "PM")
        ))]
        : ["All"];



    /*  const allDepartment = [
         { key: "All", value: "All" },
         { key: "Customer Relations - Services", value: "Customer Relations - Services" },
         { key: "SALES", value: "Sales" },
         { key: "AP", value: "Ap Commission" },
         { key: "PM", value: "Property Management" },
     ]; */


    // const getCurrentMonth = () => {
    //     const date = new Date();
    //     const options = { month: "long" };
    //     return new Intl.DateTimeFormat("en-US", options).format(date);
    // };

    const handleInputChange = (e) => {
        setMonth(e.target.value);
    };



    // Handle year change from the dropdown
    const handleDepartmentYearChange = (e) => {
        setDepartmentStatusYear(e.target.value);
    }
    const handleInquiriesPerCategoryYearChange = (e) => {
        setInquiriesPerCategoryYear(e.target.value);
    }
    const handleInquiriesPerPropertyYearChange = (e) => {
        setInquiriesPerPropertyYear(e.target.value);
    }

    const handleCommunicationTypeYearChange = (e) => {
        setCommunicationTypeYear(e.target.value);
    }
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
        getCommunicationTypePerProperty();

    }, []);

    useEffect(() => {
        setMonth(getCurrentMonth());
        setPropertyMonth(getCurrentMonth());
        setCommunicationTypeMonth(getCurrentMonth())

    }, []);

    //  console.log("department", department);

    return (
        <div className="h-screen bg-custom-grayFA p-4">
            <div className="bg-white p-4 rounded-[10px]">
                <div className=" mb-2">
                    <p className="text-lg montserrat-bold">
                        Resolved vs. Unresolved Chart
                    </p>
                    <div className="flex gap-[10px] px-[16px]">
                        <div className="flex w-[300px] items-center border rounded-md overflow-hidden">
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
                                    {user?.department === "Customer Relations - Services" ? (
                                        allDepartment.map((item, index) => (
                                            <option key={index} value={item}>
                                                {item}
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
                        <div className="flex w-[95px] items-center border rounded-md overflow-hidden">
                            <div className="relative w-full">
                                <select
                                    name="year"
                                    value={departmentStatusYear}
                                    className="appearance-none w-[100px] px-4 py-1 bg-white focus:outline-none border-0"
                                    /*  value={department} */
                                    onChange={handleDepartmentYearChange}
                                >
                                    <option value="2023">
                                        2023
                                    </option>
                                    <option value="2024">
                                        2024
                                    </option>
                                    <option value="2025">
                                        2025
                                    </option>
                                </select>
                                <span className="absolute inset-y-0 right-0 flex items-center text-custom-gray81 pr-3 pl-3 bg-custom-grayFA pointer-events-none">
                                    <IoMdArrowDropdown />
                                </span>
                            </div>
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
            <div className="relative flex gap-3 mt-4 bg-custom-grayFA items-start">
                <div className="flex flex-col gap-[15px] w-[571px]">
                    <div className="w-full pb-7 min-h-[335px] flex-grow-1 bg-white rounded-lg">
                        <p className="p-4 text-base montserrat-bold">
                            Inquiries Per Category
                        </p>
                        <div className="border border-t-1"></div>
                        <div className="mt-4">
                            <div className="flex gap-[10px] px-[16px]">
                                <div className="flex  w-[300px] items-center border rounded-md overflow-hidden">
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
                                <div className="flex w-[95px] items-center border rounded-md overflow-hidden">
                                    <div className="relative w-full">
                                        <select
                                            name="year"
                                            className="appearance-none w-[100px] px-4 py-1 bg-white focus:outline-none border-0"
                                            value={inquiriesPerCategoryYear}
                                            onChange={handleInquiriesPerCategoryYearChange}
                                        >
                                            <option value="2023">
                                                2023
                                            </option>
                                            <option value="2024">
                                                2024
                                            </option>
                                            <option value="2025">
                                                2025
                                            </option>
                                        </select>
                                        <span className="absolute inset-y-0 right-0 flex items-center text-custom-gray81 pr-3 pl-3 bg-custom-grayFA pointer-events-none">
                                            <IoMdArrowDropdown />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <div>
                                <PieChart width={548} height={360}>
                                    <Pie
                                        data={dataToDisplay}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={170}
                                        innerRadius={0}
                                        paddingAngle={1}
                                        strokeWidth={1}
                                        stroke="white"
                                        cornerRadius={0}
                                        fill="#8884d8"
                                        dataKey="value"
                                        startAngle={90}
                                        endAngle={450}
                                    >
                                        {dataToDisplay.map((entry, index) => (
                                            <Cell
                                                key={index}
                                                fill={categoryColors[entry.name] || COLORS[index % COLORS.length]}
                                            />
                                        ))}

                                    </Pie>
                                    <Tooltip formatter={(value, name) => ` ${value}%`} />
                                </PieChart>
                            </div>

                            <div className="w-full px-[70px]">
                                <div className="flex flex-col">
                                    {dataToDisplay.map((category, index) => (
                                        <div
                                            className="flex justify-between w-full"
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
                    <div className="w-full pb-7 min-h-[335px] flex-grow-1 bg-white rounded-lg">
                        <p className="p-4 text-base montserrat-bold">
                            Inquiries Per Channel
                        </p>
                        <div className="border border-t-1"></div>
                        <div className="mt-4">
                            <div className="flex gap-[10px] px-[16px]">
                                <div className="flex  w-[300px] items-center border rounded-md overflow-hidden">
                                    <span className="text-custom-gray81 bg-custom-grayFA flex items-center text-sm w-[150px] -mr-3 pl-3 py-1">
                                        For the month of
                                    </span>
                                    <div className="relative w-[159px]">
                                        <select
                                            name="concern"
                                            className="appearance-none w-full px-4 py-1 bg-white focus:outline-none border-0"
                                           /*  value={month}
                                            onChange={(e) => setMonth(e.target.value)} */
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
                                <div className="flex w-[95px] items-center border rounded-md overflow-hidden">
                                    <div className="relative w-full">
                                        <select
                                            name="year"
                                            className="appearance-none w-[100px] px-4 py-1 bg-white focus:outline-none border-0"
                                           /*  value={inquiriesPerCategoryYear}
                                            onChange={handleInquiriesPerCategoryYearChange} */
                                        >
                                            <option value="2023">
                                                2023
                                            </option>
                                            <option value="2024">
                                                2024
                                            </option>
                                            <option value="2025">
                                                2025
                                            </option>
                                        </select>
                                        <span className="absolute inset-y-0 right-0 flex items-center text-custom-gray81 pr-3 pl-3 bg-custom-grayFA pointer-events-none">
                                            <IoMdArrowDropdown />
                                        </span>
                                    </div>
                                </div>
                                
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <div className="py-[10px]">
                                <BarChart
                                    width={571}
                                    height={200}
                                    data={dataSet2}
                                    margin={{
                                        top: 5,
                                        right: 20,
                                        left: -25,
                                        bottom: 15,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#000', width: 10,   }} angle={-25}  dy={5} />
                                    <YAxis ticks={[10, 20, 30,]} />
                                    <Tooltip formatter={(value, name) => ` ${value}%`} />
                                    <Bar
                                        dataKey="value"
                                        fill="#348017"
                                        barSize={15}
                                        radius={[3, 3, 0, 0]}
                                        
                                    >
                                   {dataSet2.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                    ))}
                                    </Bar>
                                </BarChart>
                            </div>
                            <div className="w-full px-[10px]">
                                <div className="flex flex-wrap text-[#121212]">
                                    <div className="flex items-center pr-3 gap-[11px] ">
                                        <span className="flex h-[20px] items-center pb-1 text-custom-solidgreen text-2xl">
                                            ●
                                        </span>
                                        <span className="text-custom-gray12 text-xs">
                                            Email
                                        </span>
                                    </div>
                                    <div className="flex items-center pr-3 gap-[11px]">
                                        <span className="flex h-[20px] items-center pb-1 text-custom-lightgreen text-2xl">
                                            ●
                                        </span>
                                        <span className="text-custom-gray12 text-xs">
                                            Call
                                        </span>
                                    </div>
                                    <div className="flex items-center pr-3 gap-[11px]">
                                        <span className="flex h-[20px] items-center pb-1 text-[#1A73E8] text-2xl">
                                            ●
                                        </span>
                                        <span className="text-custom-gray12 text-xs">
                                            Walk-in
                                        </span>
                                    </div>
                                    <div className="flex items-center pr-3 gap-[11px]">
                                        <span className="flex h-[20px] items-center pb-1 text-[#5B9BD5] text-2xl">
                                            ●
                                        </span>
                                        <span className="text-custom-gray12 text-sm">
                                            Website
                                        </span>
                                    </div>
                                    <div className="flex items-center pr-3 gap-[11px]">
                                        <span className="flex h-[20px] items-center pb-1 text-custom-bluegreen text-2xl">
                                            ●
                                        </span>
                                        <span className="text-custom-gray12 text-xs">
                                            Social Media
                                        </span>
                                    </div>
                                    <div className="flex items-center pr-3 gap-[11px] ">
                                        <span className="flex h-[20px] items-center pb-1 text-[#404B52] text-2xl">
                                            ●
                                        </span>
                                        <span className="text-custom-gray12 text-xs">
                                            Branch Tablet
                                        </span>
                                    </div>
                                    <div className="flex items-center pr-3 gap-[11px] ">
                                        <span className="flex h-[20px] items-center pb-1 text-custom-grayA5 text-2xl">
                                            ●
                                        </span>
                                        <span className="text-custom-gray12 text-xs">
                                            Internal Endorsement
                                        </span>
                                    </div>
                                    
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-3">
                    <div className=" bg-whiterounded-[10px] bg-white w-[579px] flex flex-col overflow-y-auto">
                        <p className="p-4  text-base montserrat-bold">
                            Inquiries Per Property
                        </p>
                        <div className="border border-t-1"></div>
                        <div className="mt-4 ">
                            <div className="flex gap-[10px] px-[16px]">
                                <div className="flex w-[300px] items-center border rounded-md overflow-hidden">
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
                                <div className="flex w-[95px] items-center border rounded-md overflow-hidden">
                                    <div className="relative w-full">
                                        <select
                                            name="year"
                                            className="appearance-none w-[100px] px-4 py-1 bg-white focus:outline-none border-0"
                                            value={inquiriesPerPropertyYear}
                                            onChange={handleInquiriesPerPropertyYearChange}
                                        >
                                            <option value="2023">
                                                2023
                                            </option>
                                            <option value="2024">
                                                2024
                                            </option>
                                            <option value="2025">
                                                2025
                                            </option>
                                        </select>
                                        <span className="absolute inset-y-0 right-0 flex items-center text-custom-gray81 pr-3 pl-3 bg-custom-grayFA pointer-events-none">
                                            <IoMdArrowDropdown />
                                        </span>
                                    </div>
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
                                <div className="flex items-center px-3 py-2 gap-2">
                                    <span className="flex h-[20px] items-center pb-1 text-custom-lightestgreen text-2xl">
                                        ●
                                    </span>
                                    <span className="text-custom-gray12 text-sm">
                                        Unresolved
                                    </span>
                                </div>
                                <div className="flex items-center px-3 py-2 gap-2">
                                    <span className="flex h-[20px] items-center pb-1 text-custom-solidgreen text-2xl">
                                        ●
                                    </span>
                                    <span className="text-custom-gray12 text-sm">
                                        Resolved
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className=" bg-white rounded-[10px]  w-[579px] flex flex-col overflow-y-auto">
                        <p className="p-4  text-base montserrat-bold">
                            Type
                        </p>
                        <div className="border border-t-1"></div>
                        <div className="mt-4 ">
                            <div className="flex gap-[10px] px-[16px]">
                                <div className="flex w-[300px] items-center border rounded-md overflow-hidden">
                                    <span className="text-custom-gray81 bg-custom-grayFA flex items-center text-sm w-[150px] -mr-3 pl-3 py-1">
                                        For the month of
                                    </span>
                                    <div className="relative w-[159px]">
                                        <select
                                            name="concern"
                                            className="appearance-none w-full px-4 py-1 bg-white focus:outline-none border-0"
                                            onChange={(e) => setCommunicationTypeMonth(e.target.value)}
                                            value={communicationTypeMonth}
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
                                <div className="flex w-[95px] items-center border rounded-md overflow-hidden">
                                    <div className="relative w-full">
                                        <select
                                            name="year"
                                            className="appearance-none w-[100px] px-4 py-1 bg-white focus:outline-none border-0"
                                            value={communicationTypeYear}
                                            onChange={handleCommunicationTypeYearChange}
                                        >
                                            <option value="2023">
                                                2023
                                            </option>
                                            <option value="2024">
                                                2024
                                            </option>
                                            <option value="2025">
                                                2025
                                            </option>
                                        </select>
                                        <span className="absolute inset-y-0 right-0 flex items-center text-custom-gray81 pr-3 pl-3 bg-custom-grayFA pointer-events-none">
                                            <IoMdArrowDropdown />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex-grow">

                            <BarChart
                                width={400}
                                height={chartHeight2}
                                data={communicationTypeData}
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
                                <Tooltip content={<CustomTooltip2 />} />

                                <Bar
                                    dataKey="complainCount"
                                    fill="#EB4444"
                                    barSize={15}
                                    radius={[0, 4, 4, 0]}
                                >
                                    <LabelList
                                        dataKey="complainCount"
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
                                    dataKey="requestCount"
                                    fill="#348017"
                                    barSize={15}
                                    radius={[0, 4, 4, 0]}
                                >
                                    <LabelList
                                        dataKey="requestCount"
                                        position="right"
                                        fill="#4a5568"
                                    />
                                </Bar>
                                <Bar
                                    dataKey="inquiryCount"
                                    fill="#1A73E8"
                                    barSize={15}
                                    radius={[0, 4, 4, 0]}
                                >
                                    <LabelList
                                        dataKey="inquiryCount"
                                        position="right"
                                        fill="#4a5568"
                                    />
                                </Bar>
                                <Bar
                                    dataKey="suggestionCount"
                                    fill="#E4EA3B"
                                    barSize={15}
                                    radius={[0, 4, 4, 0]}
                                >
                                    <LabelList
                                        dataKey="suggestionCount"
                                        position="right"
                                        fill="#4a5568"
                                    />
                                </Bar>
                            </BarChart>

                            <div className="flex justify-end">
                                <div className="flex items-center pr-3 py-2 gap-2">
                                    <span className="flex h-[20px] items-center pb-1 text-[#EB4444] text-2xl">
                                        ●
                                    </span>
                                    <span className="text-custom-gray12 text-sm">
                                        Complaints
                                    </span>
                                </div>
                                <div className="flex items-center pr-3 py-2 gap-2">
                                    <span className="flex h-[20px] items-center pb-1 text-[#348017] text-2xl">
                                        ●
                                    </span>
                                    <span className="text-custom-gray12 text-sm">
                                        Requests
                                    </span>
                                </div>
                                <div className="flex items-center pr-3 py-2 gap-2">
                                    <span className="flex h-[20px] items-center pb-1 text-[#1A73E8] text-2xl">
                                        ●
                                    </span>
                                    <span className="text-custom-gray12 text-sm">
                                        Inquiries
                                    </span>
                                </div>
                                <div className="flex items-center pr-3 py-2 gap-2">
                                    <span className="flex h-[20px] items-center pb-1 text-[#E4EA3B] text-2xl">
                                        ●
                                    </span>
                                    <span className="text-custom-gray12 text-sm">
                                        Suggestion or Recommendations
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="fixed bottom-[50px] right-[41px]">
                    <button className="flex justify-center items-center size-[60px] shadow-custom8 rounded-full bg-[#1A73E8] text-white text-lg">
                        <TiDownload className="text-white text-[30px]" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportPage;

import React, { PureComponent, useCallback, useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    Rectangle,
    LineChart,
    Line,
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
import { MdCalendarToday } from "react-icons/md";
import { useLocation } from "react-router-dom";
import { get, set } from "lodash";

const barHeight = 20;



const colors = ["#348017", "#70AD47", "#1A73E8", "#5B9BD5", "#175D5F", "#404B52", "#A5A5A5"];
const communicationColors = ["#EB4444", "#348017", "#1A73E8", "#E4EA3B"];

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
// Function to get a unique color from COLORS if a category is missing from categoryColors 
const getColor = (category, index) => {
    if (categoryColors[category]) return categoryColors[category];
    return COLORS[index % COLORS.length];
};
const SINGLE_COLOR = "#5B9BD5";

const getCategoryColor = (categoryName) => {
    return categoryColors[categoryName] || "#8884d8";
};
const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const { name } = payload[0].payload;
        return (
            <div className="bg-white p-2 shadow-lg rounded">
                <p className="font-bold">{`${name}`}</p>
                <p className="text-custom-solidgreen">{`Resolved: ${payload[0].value}`}</p>
                <p className="text-custom-lightgreen">{`Unresolved: ${payload[1].value}`}</p>
                <p className="text-red-500">{`Closed: ${payload[2].value}`}</p>
            </div>
        );
    }

    return null;
};


const CustomTooltipPieChart = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip bg-white p-3 rounded shadow-md">
                {payload.map((entry, index) => (
                    <div key={index} className="text-gray-700">
                        <p className="font-bold">{`${entry.name}`}</p>
                        <p>{`Count: ${entry.value}`}</p>
                    </div>
                ))}
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
    "10": "October",
    "11": "November",
    "12": "December",
};

const CustomTooltip1 = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const monthName = monthNames[label] || label;

        return (
            <div className="custom-tooltip bg-white p-3 shadow-lg rounded-lg border border-gray-200">
                <p className="font-bold text-lg text-gray-800">{monthName}</p>
                <div className="mt-2">
                    <p className="text-sm text-gray-600">
                        <span className="text-red-500">Closed:</span> {payload[0].value}
                    </p>
                    <p className="text-sm text-gray-600">
                        <span className="text-custom-solidgreen">Resolved:</span> {payload[1].value}
                    </p>
                    <p className="text-sm text-gray-600">
                        <span className="text-custom-lightgreen">Unresolved:</span> {payload[2].value}
                    </p>
                </div>
            </div>
        );
    }

    return null;
};


const CustomTooltip3 = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const monthName = monthNames[label] || label;

        return (
            <div className="custom-tooltip bg-white p-3 shadow-lg rounded-lg border border-gray-200">
                <p className="font-bold text-lg text-gray-800">{monthName}</p>
                <div className="mt-2">
                    <p className="text-sm text-gray-600">
                        <span className="text-red-500">Complaint:</span> {payload[0].value}
                    </p>
                    <p className="text-sm text-gray-600">
                        <span className="text-green-500">Request:</span> {payload[1].value}
                    </p>
                    <p className="text-sm text-gray-600">
                        <span className="text-blue-500">Inquiry:</span> {payload[2].value}
                    </p>
                    <p className="text-sm text-gray-600">
                        <span className="text-yellow-500">Suggestion:</span> {payload[3].value}
                    </p>
                </div>
            </div>
        );
    }

    return null;
};


const CustomTooltipBar1 = ({ active, payload, label }) => {
    if (active && payload && payload.length) {

        const colorMapping = {
            'Email': '#348017', // Green
            'Call': '#70ad47', // Light green
            'Walk-in': '#1A73E8', // Blue
            'Website': '#5B9BD5', // Light blue
            'Social Media': '#175d5f', // Dark green
            'Branch Tablet': '#404B52', // Dark gray
            'Internal Endorsement': '#a5a5a5' // Gray
        };

        const dataType = label; // Or use payload[0].name if `label` is not directly available

        // Get the color corresponding to the data type
        const color = colorMapping[dataType] || '#000000'; // Default to black if no color found

        return (
            <div
                className="custom-tooltip bg-white p-2 shadow-md rounded"
                style={{ borderLeft: `4px solid ${color}` }} // Color border
            >
                <div className="flex items-center pr-3 gap-[11px]">
                    <span
                        className="flex h-[20px] items-center pb-1 text-2xl"
                        style={{ color }} // Set the color of the dot
                    >
                        ●
                    </span>
                    <span className="text-custom-gray12 text-sm">{dataType}</span>
                </div>
                <p>
                    Count:{" "}
                    <span className="font-bold">
                        {payload[0].value}
                    </span>
                </p>
            </div>
        );
    }

    return null;
};

const CustomTooltipBar2 = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
                                                            /*  const communicationColors = ["#EB4444", "#348017", "#1A73E8", "#E4EA3B"]; */
        const colorMapping = {
            'Complaint': '#EB4444',
            'Request': '#348017', 
            'Inquiry': '#1A73E8', 
            'Suggestion or Recommendation': '#E4EA3B', 
            
        };

        const dataType = label; // Or use payload[0].name if `label` is not directly available

        // Get the color corresponding to the data type
        const color = colorMapping[dataType] || '#000000'; // Default to black if no color found

        return (
            <div
                className="custom-tooltip bg-white p-2 shadow-md rounded"
                style={{ borderLeft: `4px solid ${color}` }} // Color border
            >
                <div className="flex items-center pr-3 gap-[11px]">
                    <span
                        className="flex h-[20px] items-center pb-1 text-2xl"
                        style={{ color }} // Set the color of the dot
                    >
                        ●
                    </span>
                    <span className="text-custom-gray12 text-sm">{dataType}</span>
                </div>
                <p>
                    Count:{" "}
                    <span className="font-bold">
                        {payload[0].value}
                    </span>
                </p>
            </div>
        );
    }

    return null;
};



const ReportPage = () => {
    const {
        setMonth,
        month,
        setYear,
        year,
        setProject,
        project,
        fullYear,
        getFullYear,
        dataCategory,
        fetchCategory,
        dataProperty,
        communicationTypeData,
        getCommunicationTypePerProperty,
        getInquiriesPerProperty,
        getInquiriesPerDepartment,
        dataDepartment,
        setDataDepartment,
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
        inquiriesPerChanelYear,
        setInquiriesPerChanelYear,
        inquiriesPerChannelMonth,
        setInquiriesPerChannelMonth,
        getInquiriesPerChannel,
        inquriesPerChannelData,
        propertyNamesList
    } = useStateContext();

    const [departmentValue, setDepartmentValue] = useState("All");
    const [projectValue, setProjectValue] = useState("All");
    const [yearValue, setYearValue] = useState("");
    const [monthValue, setMonthValue] = useState("All");

    const defaultData = [{ name: "No Data" }];
    const dataToDisplay = dataCategory.length > 0 ? dataCategory : defaultData;
    const location = useLocation();
    /*  console.log("inquriesPerChannelData", inquriesPerChannelData); */
    const getCurrentMonth = () => {
        const months = [
            'january', 'february', 'march', 'april', 'may', 'june',
            'july', 'august', 'september', 'october', 'november', 'december'
        ];
        const currentMonthIndex = new Date().getMonth();
        return months[currentMonthIndex];
    };

    const formatFunc = (name) => {
        return name
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };


    const formattedPropertyNames = [
        "N/A",
        ...(Array.isArray(propertyNamesList) && propertyNamesList.length > 0
            ? propertyNamesList
                .filter((item) => !item.toLowerCase().includes("phase"))
                .map((item) => {
                    let formattedItem = formatFunc(item);

                    // Capitalize each word in the string
                    formattedItem = formattedItem
                        .split(" ")
                        .map((word) => {
                            // Check for specific words that need to be fully capitalized
                            if (/^(Sjmv|Lpu|Cdo|Dgt)$/i.test(word)) {
                                return word.toUpperCase();
                            }
                            // Capitalize the first letter of all other words
                            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                        })
                        .join(" ");

                    // Replace specific names if needed
                    if (formattedItem === "Casamira South") {
                        formattedItem = "Casa Mira South";
                    }

                    return formattedItem;
                })
                .sort((a, b) => {
                    if (a === "N/A") return -1;
                    if (b === "N/A") return 1;
                    return a.localeCompare(b);
                })
            : []),
    ];

    //Get current year
    const currentYear = new Date().getFullYear();

    const chartHeight = dataProperty.length * (barHeight + 80);
    const chartHeight2 = communicationTypeData.length * (barHeight + 100);

    const allDepartment = allEmployees
        ? ["All", ...Array.from(new Set(allEmployees
            .map((employee) => employee.department)
            .filter((department) => department !== null && department !== undefined && department !== "PM")
        ))]
        : ["All"];


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

    const handleInquiriesPerChannelYearChange = (e) => {
        setInquiriesPerChanelYear(e.target.value);
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

    const handleSearchFilter = () => {
        setDepartment(departmentValue);
        setProject(projectValue);
        setYear(yearValue);
        setMonth(monthValue);

    };

    useEffect(() => {

        fetchCategory();
        getInquiriesPerDepartment();
        getInquiriesPerProperty();
        fetchDataReport();
        getCommunicationTypePerProperty();
        getInquiriesPerChannel();
        getFullYear();
        setYear(currentYear);

    }, []);



    /*  useEffect(() => {
         setMonth(getCurrentMonth());
         setPropertyMonth(getCurrentMonth());
         setCommunicationTypeMonth(getCurrentMonth())
         setInquiriesPerChannelMonth(getCurrentMonth());
 
         setDepartmentStatusYear(currentYear);
         setInquiriesPerCategoryYear(currentYear);
         setInquiriesPerPropertyYear(currentYear);
         setCommunicationTypeYear(currentYear);
         setInquiriesPerChanelYear(currentYear);
     }, []); */

    // console.log("department", department);


    const totalValue = dataCategory.reduce((total, category) => total + category.value, 0); //total value of category

    return (
        <div className="h-screen bg-custom-grayFA p-4 flex flex-col gap-[21px]">
            <div className="flex flex-col gap-[10px] bg-[#F2F8FC] rounded-[10px] w-full py-[24px] px-[30px]">
                <div className="flex gap-[10px]">
                    <div className="relative flex border border-custom-lightgreen rounded-[5px] overflow-hidden">
                        <span className="text-white bg-custom-lightgreen text-sm flex items-center w-[60px] px-[15px] -mr-3 pl-3 py-1 shrink-0">
                            Year
                        </span>
                        <select
                            name="year"
                            value={yearValue}
                            className="appearance-none w-[100px] px-4 py-1 bg-white focus:outline-none border-0"
                            onChange={(e) => setYearValue(e.target.value)}
                        >
                            {fullYear.map((item, index) => (
                                <option key={index} value={item.year}>  {item.year}</option>
                            ))}
                        </select>
                        <span className="absolute inset-y-0 right-0 flex items-center text-white pr-3 pl-3 bg-custom-lightgreen pointer-events-none">
                            <MdCalendarToday />
                        </span>
                    </div>
                    <div className="relative flex border w-[203px] border-custom-lightgreen rounded-[5px] overflow-hidden shrink-0">
                        <span className="text-white bg-custom-lightgreen text-sm flex items-center w-[75px] px-[15px] -mr-3 pl-3 py-1 shrink-0">
                            Month
                        </span>
                        <select
                            name="month"
                            value={monthValue}
                            className="appearance-none w-full px-4 py-1 bg-white focus:outline-none border-0"
                            onChange={(e) => setMonthValue(e.target.value)}
                        >
                            <option value="All">All</option>
                            {Object.entries(monthNames)
                                .sort(([keyA], [keyB]) => keyA - keyB)
                                .map(([key, name]) => (
                                    <option key={key} value={key}>
                                        {name}
                                    </option>
                                ))}
                        </select>
                        <span className="absolute inset-y-0 right-0 flex items-center text-white pr-3 pl-3 bg-custom-lightgreen pointer-events-none">
                            <MdCalendarToday />
                        </span>
                    </div>
                </div>
                <div className="flex gap-[10px]">
                    <div className="flex w-[550px] items-center border border-custom-lightgreen rounded-[5px] overflow-hidden shrink-0">
                        <span className="text-white text-sm h-full bg-custom-lightgreen flex items-center w-[110px] -mr-3 pl-3 py-1 shrink-0">
                            Department
                        </span>
                        <div className="relative w-full">
                            <select
                                name="concern"
                                className="appearance-none w-full px-4 py-1 bg-white focus:outline-none border-0"
                                value={departmentValue}
                                onChange={(e) => setDepartmentValue(e.target.value)}
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
                            <span className="absolute inset-y-0 right-0 flex items-center text-white pr-3 pl-3 bg-custom-lightgreen pointer-events-none">
                                <IoMdArrowDropdown />
                            </span>
                        </div>
                    </div>
                    <div className="flex w-[388px] items-center border border-custom-lightgreen rounded-[5px] overflow-hidden shrink-0">
                        <span className="text-white text-sm h-full bg-custom-lightgreen flex items-center w-[76px] px-[15px] -mr-3 pl-3 py-1 shrink-0">
                            Project
                        </span>
                        <div className="relative w-full">
                            <select
                                name="concern"
                                className="appearance-none w-full px-4 py-1 bg-white focus:outline-none border-0"
                                value={projectValue}
                                onChange={(e) => setProjectValue(e.target.value)}
                            >
                                <option value="All">All</option>
                                {formattedPropertyNames.map(
                                    (item, index) => {
                                        return (
                                            <option
                                                key={index}
                                                value={item}
                                            >
                                                {item}
                                            </option>
                                        );
                                    }
                                )}

                            </select>
                            <span className="absolute inset-y-0 right-0 flex items-center text-white pr-3 pl-3 bg-custom-lightgreen pointer-events-none">
                                <IoMdArrowDropdown />
                            </span>
                        </div>
                    </div>
                </div>
                <div>
                    <button onClick={handleSearchFilter} className="hover:shadow-custom4 bg-custom-lightgreen text-white rounded-[6px] px-4 py-1 font-semibold">
                        Search
                    </button>
                </div>
            </div>
            <div className="bg-[#F2F8FC] p-4 rounded-[10px]">
                <div className=" mb-2">
                    <p className="text-lg montserrat-bold">
                        Resolved vs. Unresolved vs. Closed Chart
                    </p>
                </div>
                <div className="overflow-x-auto mt-[40px]">
                    <ResponsiveContainer width="100%" height={218}>
                        <BarChart
                            data={dataSet}
                            margin={{
                                top: 5,
                                right: 30,
                                left: -25,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name"
                                tick={{
                                    fill: '#175D5F', // Change the tick color
                                    fontSize: 10,    // Set font size
                                    fontWeight: 600, // Set font weight
                                }}
                            />
                            <YAxis
                                tickCount={8} // Divides the Y-axis into increments of 10
                                interval={0} // Ensures all ticks are displayed
                                domain={[0, 'dataMax + 10']} // Adjusts the range dynamically
                                tickFormatter={(value) => `${value}`} // Optional: Customize tick format
                                tick={{
                                    fill: '#348017', // Change the tick color
                                    fontSize: 12,    // Set font size
                                    fontWeight: 400, // Set font weight
                                }}
                            />
                            <Tooltip content={<CustomTooltip1 />} />

                            <Bar
                                dataKey="Resolved"
                                fill="#348017"
                                barSize={15}
                                radius={[3, 3, 0, 0]}
                            >
                                <LabelList dataKey="Resolved" position="top" />
                            </Bar>
                            <Bar
                                dataKey="Unresolved"
                                fill="#D6E4D1"
                                barSize={15}
                                radius={[3, 3, 0, 0]}
                            >
                                <LabelList dataKey="Unresolved" position="top" />
                            </Bar>
                            <Bar
                                dataKey="Closed"
                                fill="#EF4444"
                                barSize={15}
                                radius={[3, 3, 0, 0]}
                            >
                                <LabelList dataKey="Closed" position="top" />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>

                </div>
                <div className="flex justify-end gap-6 text-sm">

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
                    <div className="flex items-center px-3 py-2 gap-3">
                        <span className="flex items-center text-red-500 text-2xl">
                            ●
                        </span>
                        <span className="text-custom-gray12">Closed</span>
                    </div>
                </div>
            </div>
            <div className="flex gap-[10px]">
                <div className=" w-[579px] pb-7 min-h-[335px] flex-grow-1 bg-[#F2F8FC] rounded-lg">
                    <p className="p-4  text-base montserrat-bold">
                        Inquiries Per Type
                    </p>
                    <div className="border border-t-1"></div>
                    <div className="flex-grow mt-[40px]">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                layout="vertical"
                                data={communicationTypeData}
                                margin={{
                                    top: 5,
                                    right: 20,
                                    left: 20,
                                    bottom: 15,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis
                                    type="number"
                                    tick={{
                                        fontSize: 12,
                                        fill: '#000',
                                    }}
                                    domain={[0, 'dataMax + 10']}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    tick={{
                                        fontSize: 12,
                                        fill: '#000',
                                    }}
                                    width={100}
                                />
                                <Tooltip content={<CustomTooltipBar2 />} />
                                <Bar
                                    dataKey="value" // Green color for values    
                                    barSize={45}
                                >
                                    {communicationTypeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={communicationColors[index % 20]} />
                                    ))}
                                    <LabelList dataKey="value" fill="#4a5568" position="right" />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>


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
                <div className="w-[571px] pb-7  flex-grow-1 bg-[#F2F8FC] rounded-lg">
                    <p className="p-4 text-base montserrat-bold">
                        Per Channel
                    </p>
                    <div className="border border-t-1"></div>
                    <div className="mt-4"></div>
                    <div className="flex flex-col">
                        <div className="py-[10px]">
                            <ResponsiveContainer width="100%" height={312}>
                                <BarChart
                                    layout="vertical"
                                    data={inquriesPerChannelData}
                                    margin={{
                                        top: 5,
                                        right: 20,
                                        left: 20,
                                        bottom: 15,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis
                                        type="number"
                                        tick={{
                                            fontSize: 12,
                                            fill: '#000',
                                        }}
                                        domain={[0, 'dataMax + 10']}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        tick={{
                                            fontSize: 12,
                                            fill: '#000',
                                        }}
                                        width={100}
                                    />
                                    <Tooltip content={<CustomTooltipBar1 />} />
                                    <Bar
                                        dataKey="value" // Green color for values    
                                        barSize={25}
                                    >
                                        {inquriesPerChannelData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={colors[index % 20]} />

                                        ))}
                                        <LabelList dataKey="value" fill="#4a5568" position="right" />
                                    </Bar>

                                </BarChart>

                            </ResponsiveContainer>
                        </div>
                        <div className="w-full px-[10px]">
                            <div className="flex flex-wrap justify-end text-[#121212]">
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
            <div className="relative flex gap-3 mt-[10px]  items-start">
                <div className="flex flex-col gap-3">
                    <div className=" bg-whiterounded-[10px] bg-[#F2F8FC] w-[579px] flex flex-col overflow-y-auto">
                        <p className="p-4  text-base montserrat-bold">
                            Per Property
                        </p>
                        <div className="border border-t-1"></div>
                        <div className="flex-grow overflow-x-auto px-[10px] mt-[5px] pb-[50px]">
                            <table class="table-auto border-collapse border border-gray-300 w-full text-sm text-left">
                                <thead class="bg-gray-100">
                                    <tr>
                                        <th class="border border-gray-300 px-4 py-2 w-[300px]">Property</th>
                                        <th class="border border-gray-300 px-4 py-2">Resolved</th>
                                        <th class="border border-gray-300 px-4 py-2">Unresolved</th>
                                        <th class="border border-gray-300 px-4 py-2">Closed</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dataProperty.map((item, index) => (
                                        <tr class="hover:bg-gray-50" key={index}>
                                            <td class="border border-gray-300 px-4 py-2">{item.name}</td>
                                            <td class="border border-gray-300 px-4 py-2">{item.resolved}</td>
                                            <td class="border border-gray-300 px-4 py-2">{item.unresolved}</td>
                                            <td class="border border-gray-300 px-4 py-2">{item.closed}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {/*  <BarChart
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

                                <Bar
                                    dataKey="closed"
                                    fill="#EF4444"
                                    barSize={15}
                                    radius={[0, 4, 4, 0]}
                                >
                                    <LabelList
                                        dataKey="closed"
                                        position="right"
                                        fill="#4a5568"
                                    />
                                </Bar>
                            </BarChart> */}

                            {/*  <div className="flex justify-end">
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
                                <div className="flex items-center px-3 py-2 gap-2">
                                    <span className="flex h-[20px] items-center pb-1 text-red-500 text-2xl">
                                        ●
                                    </span>
                                    <span className="text-custom-gray12 text-sm">
                                        Closed
                                    </span>
                                </div>
                            </div> */}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-3">
                    <div className=" bg-whiterounded-[10px] bg-[#F2F8FC] w-[579px] flex flex-col overflow-y-auto">
                        <p className="p-4  text-base montserrat-bold">
                            Per Department
                        </p>
                        <div className="border border-t-1"></div>
                        <div className="flex-grow overflow-x-auto px-[10px] mt-[5px] pb-[50px]">
                            <table class="table-auto border-collapse border border-gray-300 w-full text-sm text-left">
                                <thead class="bg-gray-100">
                                    <tr>
                                        <th class="border border-gray-300 px-4 py-2 w-[300px]">Department</th>
                                        <th class="border border-gray-300 px-4 py-2">Resolved</th>
                                        <th class="border border-gray-300 px-4 py-2">Unresolved</th>
                                        <th class="border border-gray-300 px-4 py-2">Closed</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dataDepartment.map((item, index) => (
                                        <tr class="hover:bg-gray-50" key={index}>
                                            <td class="border border-gray-300 px-4 py-2">{item.name}</td>
                                            <td class="border border-gray-300 px-4 py-2">{item.resolved}</td>
                                            <td class="border border-gray-300 px-4 py-2">{item.unresolved}</td>
                                            <td class="border border-gray-300 px-4 py-2">{item.closed}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex-grow mt-[10px]">
                <div className="flex flex-col gap-[15px] w-full">
                    <div className="w-full pb-7 min-h-[335px] flex-grow-1 bg-[#F2F8FC] rounded-lg">
                        <p className="p-4 text-base montserrat-bold">
                            Per Category
                        </p>
                        <div className="border border-t-1"></div>
                        <div className="flex flex-col">
                            <div className="flex justify-center">
                                <PieChart width={648} height={630}>
                                    <Pie
                                        data={dataCategory}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={300}
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
                                        {dataCategory.map((entry, index) => (
                                            <Cell
                                                key={index}
                                                // fill={categoryColors[entry.name] || COLORS[index % COLORS.length]}
                                                fill={getColor(entry.name, index)}
                                            />
                                        ))}
                                        <LabelList
                                            dataKey="value"
                                            position="inside"
                                            fill="white"
                                            fontSize={20}
                                        />
                                    </Pie>
                                    <Tooltip content={<CustomTooltipPieChart />} />
                                </PieChart>
                            </div>
                            <div className="flex justify-center w-full">
                                <div className="flex w-[150px]"></div> {/* dummy div to align the chart */}
                                <div className="grid grid-cols-2 gap-[3px]">
                                    {dataCategory.map((category, index) => (

                                        <div className=" shrink-0 items-center" key={index}>
                                            <div
                                                className="flex w-[420px] gap-[10px]"
                                                key={index}
                                            >
                                                <span
                                                    className="text-[20px] mb-1"
                                                    style={{
                                                        color: getCategoryColor(
                                                            category.name
                                                        ),
                                                    }}
                                                >
                                                    ●
                                                </span>
                                                <div className="flex gap-1 shrink-0 items-center">

                                                    <span className="text-[18px] text-[#121212] leading-[15px] py-[4px]">
                                                        {category.name}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-gray-700 font-bold text-sm">
                                                        {`${((category.value / totalValue) * 100).toFixed(0)}%`}
                                                    </span>
                                                    {/*  <span className="text-custom-gray81 text-[10px]">
                                                        {category.value ? "%" : ""}
                                                    </span> */}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
            <div className="hidden fixed bottom-[50px] right-[41px]">
                <button className="flex justify-center items-center size-[60px] shadow-custom8 rounded-full bg-[#1A73E8]  text-white text-lg">
                    <TiDownload className="text-white text-[30px]" />
                </button>
            </div>
        </div>
    );
};

export default ReportPage;

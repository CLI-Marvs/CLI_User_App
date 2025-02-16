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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import apiService from "../../servicesApi/apiService";
import debounce from "lodash/debounce";
import { TiDownload } from "react-icons/ti";
import { useStateContext } from "../../../context/contextprovider";
import { IoMdArrowDropdown } from "react-icons/io";
import { MdCalendarToday } from "react-icons/md";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { get, set } from "lodash";
import { toast } from "react-toastify";
import { format } from "date-fns";

const barHeight = 20;

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
        propertyNamesList,
        setSearchFilter,
        setDepartmentValue,
        departmentValue,
        setProjectValue,
        projectValue,
        setYearValue,
        yearValue,
        setMonthValue,
        monthValue,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        startDateValue,
        setStartDateValue,
        endDateValue,
        setEndDateValue
    } = useStateContext();



    const [searchSummary, setSearchSummary] = useState([]);

    const colors = [
        "#348017",
        "#70AD47",
        "#1A73E8",
        "#5B9BD5",
        "#175D5F",
        "#404B52",
        "#A5A5A5",
    ];

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
        "#17BECF", // Teal
    ];

    const navigate = useNavigate();
    const getBarColorPerType = (name) => {
        const colors = {
            Complaints: "#EB4444",
            Requests: "#348017",
            Inquiries: "#1A73E8",
            "Suggestion or Recommendations": "#E4EA3B",
        };
        return colors[name] || "#CCCCCC";
    };

    const getBarColorPerChannel = (name) => {
        const colors = {
            Email: "#348017",
            Call: "#70AD47",
            "Walk-in": "#1A73E8",
            Website: "#5B9BD5",
            "Social Media": "#175D5F",
            "Branch Tablet": "#404B52",
            "Internal Endorsement": "#F3D48F",
        };
        return colors[name] || "#CCCCCC"; // Default to gray if no match
    };

    const CustomTick = ({ x, y, payload }) => {
        const words = payload.value.split(" "); // Split by spaces to handle word wrapping
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
        Commissions: COLORS[0],
        Leasing: COLORS[1],
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
                            <p>{`${formatPercentage(entry.value)}`}</p>
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
        10: "October",
        11: "November",
        12: "December",
    };

    const formatMonth = (monthValue) => {
        const date = new Date(0);
        date.setMonth(monthValue - 1);
        return date.toLocaleString("default", { month: "long" });
    };

    const CustomTooltip1 = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const monthName = monthNames[label] || label;

            return (
                <div className="custom-tooltip bg-white p-3 shadow-lg rounded-lg border border-gray-200">
                    <p className="font-bold text-lg text-gray-800">
                        {monthName}
                    </p>
                    <div className="mt-2">
                        <p className="text-sm text-gray-600">
                            <span className="text-custom-solidgreen">
                                Resolved:
                            </span>{" "}
                            {payload[0].value}
                        </p>
                        <p className="text-sm text-gray-600">
                            <span className="text-custom-lightgreen">
                                Closed:
                            </span>{" "}
                            {payload[1].value}
                        </p>
                        <p className="text-sm text-gray-600">
                            <span className="text-red-500 ">Unresolved:</span>{" "}
                            {payload[2].value}
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
                    <p className="font-bold text-lg text-gray-800">
                        {monthName}
                    </p>
                    <div className="mt-2">
                        <p className="text-sm text-gray-600">
                            <span className="text-red-500">Complaint:</span>{" "}
                            {payload[0].value}
                        </p>
                        <p className="text-sm text-gray-600">
                            <span className="text-green-500">Request:</span>{" "}
                            {payload[1].value}
                        </p>
                        <p className="text-sm text-gray-600">
                            <span className="text-blue-500">Inquiry:</span>{" "}
                            {payload[2].value}
                        </p>
                        <p className="text-sm text-gray-600">
                            <span className="text-yellow-500">Suggestion:</span>{" "}
                            {payload[3].value}
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
                Email: "#348017", // Green
                Call: "#70ad47", // Light green
                "Walk-in": "#1A73E8", // Blue
                Website: "#5B9BD5", // Light blue
                "Social Media": "#175d5f", // Dark green
                "Branch Tablet": "#404B52", // Dark gray
                "Internal Endorsement": "#F3D48F", // Gray
            };

            const dataType = label; // Or use payload[0].name if `label` is not directly available

            // Get the color corresponding to the data type
            const color = colorMapping[dataType] || "#000000"; // Default to black if no color found

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
                        <span className="text-custom-gray12 text-sm">
                            {dataType}
                        </span>
                    </div>
                    <p>
                        Count:{" "}
                        <span className="font-bold">{payload[0].value}</span>
                    </p>
                </div>
            );
        }

        return null;
    };

    const CustomTooltipBar2 = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const colorMapping = {
                Complaints: "#EB4444",
                Requests: "#348017",
                Inquiries: "#1A73E8",
                "Suggestion or Recommendations": "#E4EA3B",
            };

            const dataType = label; // Or use payload[0].name if `label` is not directly available

            // Get the color corresponding to the data type
            const color = colorMapping[dataType] || "#000000"; // Default to black if no color found

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
                        <span className="text-custom-gray12 text-sm">
                            {dataType}
                        </span>
                    </div>
                    <p>
                        Count:{" "}
                        <span className="font-bold">{payload[0].value}</span>
                    </p>
                </div>
            );
        }

        return null;
    };

    const currentYear = new Date().getFullYear();



    const defaultData = [{ name: "No Data" }];
    const dataToDisplay = dataCategory.length > 0 ? dataCategory : defaultData;
    const location = useLocation();
    /*  console.log("inquriesPerChannelData", inquriesPerChannelData); */
    const getCurrentMonth = () => {
        const months = [
            "january",
            "february",
            "march",
            "april",
            "may",
            "june",
            "july",
            "august",
            "september",
            "october",
            "november",
            "december",
        ];
        const currentMonthIndex = new Date().getMonth();
        return months[currentMonthIndex];
    };

    const formatFunc = (name) => {
        return name
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const totalValuePieChart = dataCategory.reduce(
        (acc, curr) => acc + curr.value,
        0
    );

    const formatPercentage = (value) => {
        const total = totalValuePieChart || 1; // Prevent division by zero
        return ((value / total) * 100).toFixed(2) + "%";
    };

    const renderCustomLabel = ({ x, y, value, index, payload, cx }) => {
        if (!value || !payload?.name) return null; // Prevent errors if data is missing

        const percentage = formatPercentage(value);
        const name = payload.name;

        // Adjust text alignment based on label's position relative to pie center
        const textAnchor = x > cx ? "start" : "end";

        return (
            <text
                x={x}
                y={y}
                fill="black"
                fontSize={20}
                textAnchor={textAnchor}
                dominantBaseline="middle"
            >
                {`${percentage} ${name}`}
            </text>
        );
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
                            return (
                                word.charAt(0).toUpperCase() +
                                word.slice(1).toLowerCase()
                            );
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



    const chartHeight = dataProperty.length * (barHeight + 80);
    const chartHeight2 = communicationTypeData.length * (barHeight + 100);

    const allDepartment = allEmployees
        ? [
            "All",
            ...Array.from(
                new Set(
                    allEmployees
                        .map((employee) => employee.department)
                        .filter(
                            (department) =>
                                department !== null &&
                                department !== undefined &&
                                department !== "PM"
                        )
                )
            ),
        ]
        : ["All"];

    const handleInputChange = (e) => {
        setMonth(e.target.value);
    };

    // Handle year change from the dropdown
    const handleDepartmentYearChange = (e) => {
        setDepartmentStatusYear(e.target.value);
    };

    const handleInquiriesPerCategoryYearChange = (e) => {
        setInquiriesPerCategoryYear(e.target.value);
    };
    const handleInquiriesPerPropertyYearChange = (e) => {
        setInquiriesPerPropertyYear(e.target.value);
    };

    const handleCommunicationTypeYearChange = (e) => {
        setCommunicationTypeYear(e.target.value);
    };

    const handleInquiriesPerChannelYearChange = (e) => {
        setInquiriesPerChanelYear(e.target.value);
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




    const handleSearchFilter = () => {

        const summaryParts = [];


        if (yearValue !== "All"){
            summaryParts.push(`Year: ${yearValue}`)
        } else{
            if(startDateValue || endDateValue){
                
            }else{
                summaryParts.push(`Year: All`)
            }
        }
        if (monthValue !== "All"){
            summaryParts.push(`Month: ${formatMonth(monthValue)}`)
        }else{
            if(startDateValue || endDateValue){
                    
            }else{
                summaryParts.push(`Month: All`)
            }
        }

        if (startDateValue && endDateValue) {
            summaryParts.push(`Start Date: ${format(startDateValue, "MMM dd, yyyy")}`);
            summaryParts.push(`End Date: ${format(endDateValue, "MMM dd, yyyy")}`);
        } else if (startDateValue) {
            summaryParts.push(`Start Date: ${format(startDateValue, "MMM dd, yyyy")}`);
        } else if (endDateValue) {
            summaryParts.push(`End Date: ${format(endDateValue, "MMM dd, yyyy")}`);
        }

        if (projectValue !== "All" && projectValue !== "") summaryParts.push(`Project: ${projectValue}`);
        if (departmentValue !== "All" && departmentValue !== "") summaryParts.push(`Department: ${departmentValue}`);

     
        if (!startDateValue && !endDateValue && (yearValue == "All" && monthValue == "All" && projectValue == "All" && departmentValue == "All")) {
            summaryParts.push(`Year: All`);
            summaryParts.push(`Project: All`);
            summaryParts.push(`Department: All`);
        }


        setSearchSummary(summaryParts);
        setDepartment(departmentValue);
        setProject(projectValue);
        setYear(yearValue);
        setMonth(monthValue);
        setStartDate(startDateValue);
        setEndDate(endDateValue);
    };

    const handleResetFilter = () => {

        setDepartmentValue("");
        setProjectValue("");
        setYearValue(new Date().getFullYear());
        setMonthValue("All");
        setStartDateValue(null);
        setEndDateValue(null);
    };

    useEffect(() => {

        setYear(new Date().getFullYear());
        setMonthValue("All");
        setDepartmentValue("");
        setProjectValue("");
        setStartDateValue(null);
        setEndDateValue(null);


        const summaryParts = [];

        summaryParts.push(`Year: 2025`);
        summaryParts.push(`Month: All`);

        setSearchSummary(summaryParts);


    }, []);

    useEffect(() => {
        fetchCategory();
        getInquiriesPerDepartment();
        getInquiriesPerProperty();
        fetchDataReport();
        getCommunicationTypePerProperty();
        getInquiriesPerChannel();
        getFullYear();
    }, []);

    /*   useEffect(() => {
          if (yearValue) {
              setYear(yearValue);
          }
      }, [yearValue]); 
   */
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
    /* communicationTypeData; */

    const totalValue = dataCategory.reduce(
        (total, category) => total + category.value,
        0
    );

    const totalResolved = dataSet.reduce(
        (total, item) => total + item.Resolved,
        0
    );
    const totalUnresolved = dataSet.reduce(
        (total, item) => total + item.Unresolved,
        0
    );
    const totalClosed = dataSet.reduce((total, item) => total + item.Closed, 0);
    const totalAll = dataSet.reduce(
        (total, item) => total + item.Resolved + item.Unresolved + item.Closed,
        0
    );

    const totalValueChannel = inquriesPerChannelData.reduce(
        (total, channel) => total + channel.value,
        0
    );
    const totalValuetype = communicationTypeData.reduce(
        (total, type) => total + type.value,
        0
    );
    const totalValueCategory = dataCategory.reduce(
        (total, category) => total + category.value,
        0
    );



    return (
        <div className="h-screen bg-custom-grayFA p-4 flex flex-col gap-[21px]">
            <div className="flex flex-col gap-[10px] bg-[#F2F8FC] rounded-[10px] w-full py-[24px] px-[30px]">
                <div className=" flex gap-[10px]">
                    <div className="relative flex border border-custom-lightgreen rounded-[5px] overflow-hidden">
                        <span className="text-white bg-custom-lightgreen text-sm flex items-center w-[60px] px-[15px] -mr-3 pl-3 py-1 shrink-0">
                            Year
                        </span>
                        <select
                            name="year"
                            value={yearValue}
                            className="appearance-none w-[100px] px-4 py-1 bg-white focus:outline-none border-0"
                            onChange={(e) => {
                                setYearValue(e.target.value);
                                setStartDateValue(null);
                                setEndDateValue(null);
                            }}
                        >
                            <option value="All">All</option>
                            {fullYear.map((item, index) => (
                                <option key={index} value={item.year}>
                                    {" "}
                                    {item.year}
                                </option>
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
                            onChange={(e) => {
                                setMonthValue(e.target.value);
                                setStartDateValue(null);
                                setEndDateValue(null);
                            }}
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
                <div className="flex gap-[10px] flex-wrap">
                    <div className="relative flex border w-max border-custom-lightgreen rounded-[5px] shrink-0 z-10">
                        <span className="text-white bg-custom-lightgreen text-sm flex items-center w-max px-[15px] pl-3 py-1 shrink-0">
                            Filter by duration
                        </span>
                        <span className="border-l border-white text-white bg-custom-lightgreen text-sm flex items-center w-max px-[15px] pl-3 py-1 shrink-0">
                            From
                        </span>
                        <div className="relative flex items-center bg-white">
                            <DatePicker
                                selected={startDateValue}
                                onChange={(date) => {
                                    setStartDateValue(date);
                                    setYearValue("All");
                                    setMonthValue("All");
                                }}
                                onFocus={() => {
                                    setYearValue("All");
                                    setMonthValue("All");
                                }}
                                className="outline-none w-[126px] h-full text-sm px-2"
                                calendarClassName="custom-calendar"
                            />
                        </div>
                        <span className="absolute inset-y-0 right-0 flex items-center text-white pr-3 pl-3 bg-custom-lightgreen pointer-events-none">
                            <MdCalendarToday />
                        </span>
                        <span className="text-white bg-custom-lightgreen text-sm flex items-center w-max px-[15px] pl-3 py-1 shrink-0">
                            To
                        </span>
                        <div className="relative flex items-center bg-white">
                            <DatePicker
                                selected={endDateValue}
                                onChange={(date) => {
                                    setEndDateValue(date);
                                    setYearValue("All");
                                    setMonthValue("All");
                                }}
                                onFocus={() => {
                                    setYearValue("All");
                                    setMonthValue("All");
                                }}
                                className="outline-none w-[156px] h-full text-sm px-2"
                                calendarClassName="custom-calendar"
                                minDate={startDateValue}
                            />
                        </div>
                        <span className="absolute inset-y-0 right-0 flex items-center text-white pr-3 pl-3 bg-custom-lightgreen pointer-events-none">
                            <MdCalendarToday />
                        </span>
                    </div>
                </div>
                <div className="flex gap-[10px] flex-wrap">
                    <div className="flex w-[388px] items-center border border-custom-lightgreen rounded-[5px] overflow-hidden shrink-0">
                        <span className="text-white text-sm h-full bg-custom-lightgreen flex items-center w-[76px] px-[15px] -mr-3 pl-3 py-1 shrink-0">
                            Project
                        </span>
                        <div className="relative w-full">
                            <select
                                name="concern"
                                className="appearance-none w-full px-4 py-1 bg-white focus:outline-none border-0"
                                value={projectValue}
                                onChange={(e) => setProjectValue(e.target.value || "All")}
                            >
                                <option value="">Select Project</option> {/* Empty default option */}
                                <option value="All">All</option>
                                {formattedPropertyNames.map((item, index) => (
                                    <option key={index} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                            <span className="absolute inset-y-0 right-0 flex items-center text-white pr-3 pl-3 bg-custom-lightgreen pointer-events-none">
                                <IoMdArrowDropdown />
                            </span>
                        </div>
                    </div>
                    <div className="flex w-[550px] items-center border border-custom-lightgreen rounded-[5px] overflow-hidden shrink-0">
                        <span className="text-white text-sm h-full bg-custom-lightgreen flex items-center w-[110px] -mr-3 pl-3 py-1 shrink-0">
                            Department
                        </span>
                        <div className="relative w-full">
                            <select
                                name="concern"
                                className="appearance-none w-full px-4 py-1 bg-white focus:outline-none border-0"
                                value={departmentValue}
                                onChange={(e) => setDepartmentValue(e.target.value || "All")}
                            >
                                <option value="">Select Department</option> {/* Empty default option */}
                                <option value="All">All</option>
                                {user?.department === "Customer Relations - Services"
                                    ? allDepartment
                                        .filter((item) => item !== "All")
                                        .sort()
                                        .map((item, index) => (
                                            <option key={index} value={item}>
                                                {item}
                                            </option>
                                        ))
                                    : user?.department && (
                                        <option value={user?.department}>{user?.department}</option>
                                    )}
                                <option value="Unassigned">Unassigned</option>
                            </select>
                            <span className="absolute inset-y-0 right-0 flex items-center text-white pr-3 pl-3 bg-custom-lightgreen pointer-events-none">
                                <IoMdArrowDropdown />
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-[10px] items-center">
                    <button
                        onClick={handleSearchFilter}
                        className="hover:shadow-custom4 h-[35px] w-[88px] gradient-btn rounded-[10px] text-white text-sm"
                    >
                        Search
                    </button>
                    <button
                        onClick={handleResetFilter}
                        className="hover:shadow-custom4 h-[35px] w-[88px] gradient-btn rounded-[10px] text-white text-sm"
                    >
                        Reset
                    </button>
                </div>
            </div>
            <div className="flex flex-col gap-1 p-2 mt-[15px] bg-white w-max rounded-[8px] shadow-custom7 text-sm">
                <div className="flex flex-col">
                    <div className="mb-5">
                        <strong>Search {data?.length > 1 ? 'results for' : 'result for'} &nbsp;</strong>
                    </div>
                    <div className="flex flex-col flex-wrap gap-2">
                        {searchSummary.map((part, index) => {
                            const [label, value] = part.split(": ");
                            return (
                                <div key={index}>
                                    <strong>{label}:</strong>{" "}
                                    {value}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <div className="bg-[#F2F8FC] p-4 rounded-[10px]">
                <div className=" mb-2 flex gap-[8px] text-lg montserrat-bold">
                    <p className="">Resolved vs. Closed vs. Unresolved</p>
                    {dataSet &&
                        dataSet.every(
                            (item) =>
                                item.Resolved === 0 &&
                                item.Unresolved === 0 &&
                                item.Closed === 0
                        ) && <p>- (No {dataSet.length > 1 ? 'results' : 'result'} found)</p>}
                </div>
                <div className="overflow-x-auto mt-[40px]">
                    <div className="min-w-[600px]"> {/* Ensures horizontal scrolling when needed */}
                        <ResponsiveContainer
                            width={dataSet.length > 13 ? dataSet.length * 200 : "100%"}
                            height={228}
                        >

                            <BarChart
                                data={dataSet}
                                margin={{
                                    top: 20,
                                    right: 30,
                                    left: -25,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    tick={{
                                        fill: "#175D5F",
                                        fontSize: 10,
                                        fontWeight: 600,
                                    }}
                                />
                                <YAxis
                                    tickCount={8}
                                    interval={0}
                                    domain={[0, "dataMax + 10"]}
                                    tick={{
                                        fill: "#348017",
                                        fontSize: 12,
                                        fontWeight: 400,
                                    }}
                                />
                                <Tooltip content={<CustomTooltip1 />} />
                                <Bar dataKey="Resolved" fill="#348017" barSize={15} radius={[3, 3, 0, 0]}>
                                    <LabelList dataKey="Resolved" position="top" />
                                </Bar>
                                <Bar dataKey="Closed" fill="#D6E4D1" barSize={15} radius={[3, 3, 0, 0]}>
                                    <LabelList dataKey="Closed" position="top" />
                                </Bar>
                                <Bar dataKey="Unresolved" fill="#EF4444" barSize={15} radius={[3, 3, 0, 0]}>
                                    <LabelList dataKey="Unresolved" position="top" />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="w-full flex-col flex items-start justify-start h-max pl-[15px]">
                    <p className="text-[18px] montserrat-bold">
                        Resolved: {totalResolved}
                    </p>
                    <p className="text-[18px] montserrat-bold">
                        Closed: {totalClosed}
                    </p>
                    <p className="text-[18px] montserrat-bold text-red-500">
                        Unresolved: {totalUnresolved}
                    </p>
                    <p className="text-[18px] montserrat-bold">
                        Total: {totalAll}
                    </p>
                </div>
                <div className="flex justify-end gap-6 text-sm">
                    <div className="flex items-center px-3 gap-2">
                        <span className="flex items-center mb-1 text-custom-solidgreen text-2xl">
                            ●
                        </span>
                        <span className="text-custom-gray12 hover:underline hover:text-blue-500 cursor-pointer">
                            <Link
                                onClick={(e) => {
                                    e.preventDefault();
                                    setSearchFilter({
                                        status: "Resolved",
                                        selectedYear: yearValue !== "All" ? yearValue : "",
                                        selectedMonth: monthValue !== "All" ? monthValue : "",
                                        departments: departmentValue !== "All" ? departmentValue : "",
                                        selectedProperty: projectValue !== "All" ? projectValue : "",
                                        startDate: startDateValue,
                                        endDate: endDateValue,
                                    });
                                    navigate("/inquirymanagement/inquirylist");
                                }}
                            >
                                Resolved
                            </Link>
                        </span>
                    </div>
                    <div className="flex items-center px-3 py-2 gap-2">
                        <span className="flex items-center mb-1 text-custom-lightestgreen text-2xl">
                            ●
                        </span>
                        <span className="text-custom-gray12 hover:underline hover:text-blue-500 cursor-pointer">
                            <Link
                                /*  to={`/inquirymanagement/inquirylist?status=Closed&year=${encodeURIComponent(
                                    yearValue
                                )}${
                                    monthValue !== "All"
                                        ? `&month=${encodeURIComponent(
                                              monthValue
                                          )}`
                                        : ""
                                }${
                                    departmentValue !== "All"
                                        ? `&department=${encodeURIComponent(
                                              departmentValue
                                          )}`
                                        : ""
                                }
                                ${
                                    projectValue !== "All"
                                        ? `&property=${encodeURIComponent(
                                              projectValue
                                          )}`
                                        : ""
                                }`} */
                                onClick={(e) => {
                                    e.preventDefault();
                                    setSearchFilter({
                                        status: "Closed",
                                        selectedYear: yearValue !== "All" ? yearValue : "",
                                        selectedMonth: monthValue !== "All" ? monthValue : "",
                                        departments: departmentValue !== "All" ? departmentValue : "",
                                        selectedProperty: projectValue !== "All" ? projectValue : "",
                                        startDate: startDateValue,
                                        endDate: endDateValue,
                                    });
                                    navigate("/inquirymanagement/inquirylist");
                                }}
                            >
                                Closed
                            </Link>
                        </span>
                    </div>
                    <div className="flex items-center px-3 py-2 gap-2">
                        <span className="flex items-center mb-1 text-red-500 text-2xl">
                            ●
                        </span>
                        <span className="text-custom-gray12 hover:underline hover:text-blue-500 cursor-pointer">
                            <Link
                                /*    to={`/inquirymanagement/inquirylist?status=unresolved&year=${encodeURIComponent(
                                    yearValue
                                )}${
                                    monthValue !== "All"
                                        ? `&month=${encodeURIComponent(
                                              monthValue
                                          )}`
                                        : ""
                                }${
                                    departmentValue !== "All"
                                        ? `&department=${encodeURIComponent(
                                              departmentValue
                                          )}`
                                        : ""
                                }
                                ${
                                    projectValue !== "All"
                                        ? `&property=${encodeURIComponent(
                                              projectValue
                                          )}`
                                        : ""
                                }`} */
                                onClick={(e) => {
                                    e.preventDefault();
                                    setSearchFilter({
                                        status: "unresolved",
                                        selectedYear: yearValue !== "All" ? yearValue : "",
                                        selectedMonth: monthValue !== "All" ? monthValue : "",
                                        departments: departmentValue !== "All" ? departmentValue : "",
                                        selectedProperty: projectValue !== "All" ? projectValue : "",
                                        startDate: startDateValue,
                                        endDate: endDateValue,
                                    });
                                    navigate("/inquirymanagement/inquirylist");
                                }}
                            >
                                Unresolved
                            </Link>
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex gap-[10px]">
                <div className=" w-[579px] pb-7 min-h-[335px] flex-grow-1 bg-[#F2F8FC] rounded-lg">
                    <div className="flex p-4 gap-[8px] text-base montserrat-bold">
                        <p className="">By Type</p>
                        {communicationTypeData &&
                            communicationTypeData.every(
                                (item) => item.value === 0
                            ) && <p>- (No {communicationTypeData.length > 1 ? 'results' : 'result'} found)</p>}
                    </div>

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
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    horizontal={false}
                                />
                                <XAxis
                                    type="number"
                                    tick={{
                                        fontSize: 12,
                                        fill: "#000",
                                    }}
                                    domain={[0, "dataMax + 10"]}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    tick={{
                                        fontSize: 12,
                                        fill: "#000",
                                    }}
                                    width={100}
                                />
                                <Tooltip content={<CustomTooltipBar2 />} />
                                <Bar
                                    dataKey="value" // Green color for values
                                    barSize={45}
                                >
                                    {communicationTypeData.map(
                                        (entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={getBarColorPerType(
                                                    entry.name
                                                )}
                                            />
                                        )
                                    )}
                                    <LabelList
                                        dataKey="value"
                                        fill="#4a5568"
                                        position="right"
                                    />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>

                        <div className="w-full h-[40px] flex items-start justify-start pl-[6%]">
                            <p className="text-[18px] montserrat-bold">
                                Total: {totalValuetype}
                            </p>
                        </div>
                        <div className="flex flex-col items-end ">
                            <div className="flex">
                                <div className="flex items-center pr-3 gap-2">
                                    <span className="flex h-[20px] items-center pb-1 text-[#EB4444] text-2xl">
                                        ●
                                    </span>
                                    <span className="text-custom-gray12 text-sm hover:underline hover:text-blue-500 cursor-pointer">
                                        <Link
                                            /*  to={`/inquirymanagement/inquirylist?type=Complaint&year=${encodeURIComponent(
                                                yearValue
                                            )}${
                                                monthValue !== "All"
                                                    ? `&month=${encodeURIComponent(
                                                          monthValue
                                                      )}`
                                                    : ""
                                            }${
                                                departmentValue !== "All"
                                                    ? `&department=${encodeURIComponent(
                                                          departmentValue
                                                      )}`
                                                    : ""
                                            }
                                            ${
                                                projectValue !== "All"
                                                    ? `&property=${encodeURIComponent(
                                                          projectValue
                                                      )}`
                                                    : ""
                                            }`} */
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setSearchFilter({
                                                    type: "Complaint",
                                                    selectedYear: yearValue,
                                                    selectedMonth:
                                                        monthValue !== "All"
                                                            ? monthValue
                                                            : "",
                                                    departments:
                                                        departmentValue !== "All"
                                                            ? departmentValue
                                                            : "",
                                                    selectedProperty:
                                                        projectValue !== "All"
                                                            ? projectValue
                                                            : "",
                                                });
                                                navigate(
                                                    "/inquirymanagement/inquirylist"
                                                );
                                            }}
                                        >
                                            Complaints
                                        </Link>
                                    </span>
                                </div>
                                <div className="flex items-center pr-3 gap-2">
                                    <span className="flex h-[20px] items-center pb-1 text-[#348017] text-2xl">
                                        ●
                                    </span>
                                    <span className="text-custom-gray12 text-sm hover:underline hover:text-blue-500 cursor-pointer">
                                        <Link
                                            /*  to={`/inquirymanagement/inquirylist?type=Request&year=${encodeURIComponent(
                                                yearValue
                                            )}${
                                                monthValue !== "All"
                                                    ? `&month=${encodeURIComponent(
                                                          monthValue
                                                      )}`
                                                    : ""
                                            }${
                                                departmentValue !== "All"
                                                    ? `&department=${encodeURIComponent(
                                                          departmentValue
                                                      )}`
                                                    : ""
                                            }
                                            ${
                                                projectValue !== "All"
                                                    ? `&property=${encodeURIComponent(
                                                          projectValue
                                                      )}`
                                                    : ""
                                            }`} */

                                            onClick={(e) => {
                                                e.preventDefault();
                                                setSearchFilter({
                                                    type: "Request",
                                                    selectedYear: yearValue,
                                                    selectedMonth:
                                                        monthValue !== "All"
                                                            ? monthValue
                                                            : "",
                                                    departments:
                                                        departmentValue !== "All"
                                                            ? departmentValue
                                                            : "",
                                                    selectedProperty:
                                                        projectValue !== "All"
                                                            ? projectValue
                                                            : "",
                                                });
                                                navigate(
                                                    "/inquirymanagement/inquirylist"
                                                );
                                            }}
                                        >
                                            Requests
                                        </Link>
                                    </span>
                                </div>
                                <div className="flex items-center pr-3 gap-2">
                                    <span className="flex h-[20px] items-center pb-1 text-[#1A73E8] text-2xl">
                                        ●
                                    </span>
                                    <span className="text-custom-gray12 text-sm hover:underline hover:text-blue-500 cursor-pointer">
                                        <Link
                                            /* to={`/inquirymanagement/inquirylist?type=Inquiry&year=${encodeURIComponent(
                                                yearValue
                                            )}${
                                                monthValue !== "All"
                                                    ? `&month=${encodeURIComponent(
                                                          monthValue
                                                      )}`
                                                    : ""
                                            }${
                                                departmentValue !== "All"
                                                    ? `&department=${encodeURIComponent(
                                                          departmentValue
                                                      )}`
                                                    : ""
                                            }
                                            ${
                                                projectValue !== "All"
                                                    ? `&property=${encodeURIComponent(
                                                          projectValue
                                                      )}`
                                                    : ""
                                            }`} */

                                            onClick={(e) => {
                                                e.preventDefault();
                                                setSearchFilter({
                                                    type: "Inquiry",
                                                    selectedYear: yearValue,
                                                    selectedMonth:
                                                        monthValue !== "All"
                                                            ? monthValue
                                                            : "",
                                                    departments:
                                                        departmentValue !== "All"
                                                            ? departmentValue
                                                            : "",
                                                    selectedProperty:
                                                        projectValue !== "All"
                                                            ? projectValue
                                                            : "",
                                                });
                                                navigate(
                                                    "/inquirymanagement/inquirylist"
                                                );
                                            }}
                                        >
                                            Inquiries
                                        </Link>
                                    </span>
                                </div>
                                <div className="flex items-center pr-3 py-1 gap-2">
                                    <span className="flex h-[20px] items-center pb-1 text-[#E4EA3B] text-2xl">
                                        ●
                                    </span>
                                    <span className="text-custom-gray12 text-sm hover:underline hover:text-blue-500 cursor-pointer">
                                        <Link
                                            /*  to={`/inquirymanagement/inquirylist?type=Suggestion or Recommendation&year=${encodeURIComponent(
                                                yearValue
                                            )}${
                                                monthValue !== "All"
                                                    ? `&month=${encodeURIComponent(
                                                          monthValue
                                                      )}`
                                                    : ""
                                            }${
                                                departmentValue !== "All"
                                                    ? `&department=${encodeURIComponent(
                                                          departmentValue
                                                      )}`
                                                    : ""
                                            }
                                            ${
                                                projectValue !== "All"
                                                    ? `&property=${encodeURIComponent(
                                                          projectValue
                                                      )}`
                                                    : ""
                                            }`} */

                                            onClick={(e) => {
                                                e.preventDefault();
                                                setSearchFilter({
                                                    type: "Suggestion or Recommendation",
                                                    selectedYear: yearValue,
                                                    selectedMonth:
                                                        monthValue !== "All"
                                                            ? monthValue
                                                            : "",
                                                    departments:
                                                        departmentValue !== "All"
                                                            ? departmentValue
                                                            : "",

                                                });
                                                navigate(
                                                    "/inquirymanagement/inquirylist"
                                                );
                                            }}
                                        >
                                            Suggestion or recommendations
                                        </Link>
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center pr-3 gap-2">
                                <span className="flex h-[20px] items-center pb-1 text-gray-400 text-2xl">
                                    ●
                                </span>
                                <span className="text-custom-gray12 text-sm hover:underline hover:text-blue-500 cursor-pointer">
                                    <Link
                                        /*  to={`/inquirymanagement/inquirylist?type=Request&year=${encodeURIComponent(
                                            yearValue
                                        )}${
                                            monthValue !== "All"
                                                ? `&month=${encodeURIComponent(
                                                      monthValue
                                                  )}`
                                                : ""
                                        }${
                                            departmentValue !== "All"
                                                ? `&department=${encodeURIComponent(
                                                      departmentValue
                                                  )}`
                                                : ""
                                        }
                                        ${
                                            projectValue !== "All"
                                                ? `&property=${encodeURIComponent(
                                                      projectValue
                                                  )}`
                                                : ""
                                        }`} */

                                        onClick={(e) => {
                                            e.preventDefault();
                                            setSearchFilter({
                                                type: "No Type",
                                                selectedYear: yearValue,
                                                selectedMonth:
                                                    monthValue !== "All"
                                                        ? monthValue
                                                        : "",
                                                departments:
                                                    departmentValue !== "All"
                                                        ? departmentValue
                                                        : "",
                                                selectedProperty:
                                                    projectValue !== "All"
                                                        ? projectValue
                                                        : "",
                                            });
                                            navigate(
                                                "/inquirymanagement/inquirylist"
                                            );
                                        }}
                                    >
                                        No Type
                                    </Link>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-[571px] pb-7  flex-grow-1 bg-[#F2F8FC] rounded-lg">
                    <div className="flex p-4 gap-[8px] text-base montserrat-bold">
                        <p className="">By Channel</p>
                        {inquriesPerChannelData &&
                            inquriesPerChannelData.every(
                                (item) => item.value === 0
                            ) && <p> - ({inquriesPerChannelData.length > 1 ? 'No results' : 'No result'} found)</p>}
                    </div>
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
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        horizontal={false}
                                    />
                                    <XAxis
                                        type="number"
                                        tick={{
                                            fontSize: 12,
                                            fill: "#000",
                                        }}
                                        domain={[0, "dataMax + 10"]}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        tick={{
                                            fontSize: 12,
                                            fill: "#000",
                                        }}
                                        width={100}
                                    />
                                    <Tooltip content={<CustomTooltipBar1 />} />
                                    <Bar
                                        dataKey="value" // Green color for values
                                        barSize={25}
                                    >
                                        {inquriesPerChannelData.map(
                                            (entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={getBarColorPerChannel(
                                                        entry.name
                                                    )}
                                                />
                                            )
                                        )}
                                        <LabelList
                                            dataKey="value"
                                            fill="#4a5568"
                                            position="right"
                                        />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="w-full h-[40px] flex items-start justify-start pl-[6%]">
                            <p className="text-[18px] montserrat-bold">
                                Total: {totalValueChannel}
                            </p>
                        </div>
                        <div className="w-full px-[10px]">
                            <div className="flex flex-wrap justify-end text-[#121212]">
                                <div className="flex items-center pr-3 gap-[11px] ">
                                    <span className="flex h-[20px] items-center pb-1 text-custom-solidgreen text-2xl">
                                        ●
                                    </span>
                                    <span className="text-custom-gray12 text-xs hover:underline hover:text-blue-500 cursor-pointer">
                                        <Link
                                            /*  to={`/inquirymanagement/inquirylist?channels=Email&year=${encodeURIComponent(
                                                yearValue
                                            )}${
                                                monthValue !== "All"
                                                    ? `&month=${encodeURIComponent(
                                                          monthValue
                                                      )}`
                                                    : ""
                                            }${
                                                departmentValue !== "All"
                                                    ? `&department=${encodeURIComponent(
                                                          departmentValue
                                                      )}`
                                                    : ""
                                            }
                                            ${
                                                projectValue !== "All"
                                                    ? `&property=${encodeURIComponent(
                                                          projectValue
                                                      )}`
                                                    : ""
                                            }`} */

                                            onClick={(e) => {
                                                e.preventDefault();
                                                setSearchFilter({
                                                    channels: "Email",
                                                    selectedYear: yearValue,
                                                    selectedMonth:
                                                        monthValue !== "All"
                                                            ? monthValue
                                                            : "",
                                                    departments:
                                                        departmentValue !==
                                                            "All"
                                                            ? departmentValue
                                                            : "",
                                                    selectedProperty:
                                                        projectValue !== "All"
                                                            ? projectValue
                                                            : "",
                                                });
                                                navigate(
                                                    "/inquirymanagement/inquirylist"
                                                );
                                            }}
                                        >
                                            Email
                                        </Link>
                                    </span>
                                </div>
                                <div className="flex items-center pr-3 gap-[11px]">
                                    <span className="flex h-[20px] items-center pb-1 text-custom-lightgreen text-2xl">
                                        ●
                                    </span>
                                    <span className="text-custom-gray12 text-xs hover:underline hover:text-blue-500 cursor-pointer">
                                        <Link
                                            /*  to={`/inquirymanagement/inquirylist?channels=Call&year=${encodeURIComponent(
                                                yearValue
                                            )}${
                                                monthValue !== "All"
                                                    ? `&month=${encodeURIComponent(
                                                          monthValue
                                                      )}`
                                                    : ""
                                            }${
                                                departmentValue !== "All"
                                                    ? `&department=${encodeURIComponent(
                                                          departmentValue
                                                      )}`
                                                    : ""
                                            }
                                            ${
                                                projectValue !== "All"
                                                    ? `&property=${encodeURIComponent(
                                                          projectValue
                                                      )}`
                                                    : ""
                                            }`} */

                                            onClick={(e) => {
                                                e.preventDefault();
                                                setSearchFilter({
                                                    channels: "Call",
                                                    selectedYear: yearValue,
                                                    selectedMonth:
                                                        monthValue !== "All"
                                                            ? monthValue
                                                            : "",
                                                    departments:
                                                        departmentValue !==
                                                            "All"
                                                            ? departmentValue
                                                            : "",
                                                    selectedProperty:
                                                        projectValue !== "All"
                                                            ? projectValue
                                                            : "",
                                                });
                                                navigate(
                                                    "/inquirymanagement/inquirylist"
                                                );
                                            }}
                                        >
                                            Call
                                        </Link>
                                    </span>
                                </div>
                                <div className="flex items-center pr-3 gap-[11px]">
                                    <span className="flex h-[20px] items-center pb-1 text-[#1A73E8] text-2xl">
                                        ●
                                    </span>
                                    <span className="text-custom-gray12 text-xs hover:underline hover:text-blue-500 cursor-pointer">
                                        <Link
                                            /*  to={`/inquirymanagement/inquirylist?channels=Walk in&year=${encodeURIComponent(
                                                yearValue
                                            )}${
                                                monthValue !== "All"
                                                    ? `&month=${encodeURIComponent(
                                                          monthValue
                                                      )}`
                                                    : ""
                                            }${
                                                departmentValue !== "All"
                                                    ? `&department=${encodeURIComponent(
                                                          departmentValue
                                                      )}`
                                                    : ""
                                            }
                                            ${
                                                projectValue !== "All"
                                                    ? `&property=${encodeURIComponent(
                                                          projectValue
                                                      )}`
                                                    : ""
                                            }`} */

                                            onClick={(e) => {
                                                e.preventDefault();
                                                setSearchFilter({
                                                    channels: "Walk in",
                                                    selectedYear: yearValue,
                                                    selectedMonth:
                                                        monthValue !== "All"
                                                            ? monthValue
                                                            : "",
                                                    departments:
                                                        departmentValue !==
                                                            "All"
                                                            ? departmentValue
                                                            : "",
                                                    selectedProperty:
                                                        projectValue !== "All"
                                                            ? projectValue
                                                            : "",
                                                });
                                                navigate(
                                                    "/inquirymanagement/inquirylist"
                                                );
                                            }}
                                        >
                                            Walk-in
                                        </Link>
                                    </span>
                                </div>
                                <div className="flex items-center pr-3 gap-[11px]">
                                    <span className="flex h-[20px] items-center pb-1 text-[#5B9BD5] text-2xl">
                                        ●
                                    </span>
                                    <span className="text-custom-gray12 text-xs hover:underline hover:text-blue-500 cursor-pointer">
                                        <Link
                                            /*  to={`/inquirymanagement/inquirylist?channels=Website&year=${encodeURIComponent(
                                                yearValue
                                            )}${
                                                monthValue !== "All"
                                                    ? `&month=${encodeURIComponent(
                                                          monthValue
                                                      )}`
                                                    : ""
                                            }${
                                                departmentValue !== "All"
                                                    ? `&department=${encodeURIComponent(
                                                          departmentValue
                                                      )}`
                                                    : ""
                                            }
                                            ${
                                                projectValue !== "All"
                                                    ? `&property=${encodeURIComponent(
                                                          projectValue
                                                      )}`
                                                    : ""
                                            }`} */

                                            onClick={(e) => {
                                                e.preventDefault();
                                                setSearchFilter({
                                                    channels: "Website",
                                                    selectedYear: yearValue,
                                                    selectedMonth:
                                                        monthValue !== "All"
                                                            ? monthValue
                                                            : "",
                                                    departments:
                                                        departmentValue !==
                                                            "All"
                                                            ? departmentValue
                                                            : "",
                                                    selectedProperty:
                                                        projectValue !== "All"
                                                            ? projectValue
                                                            : "",
                                                });
                                                navigate(
                                                    "/inquirymanagement/inquirylist"
                                                );
                                            }}
                                        >
                                            Website
                                        </Link>
                                    </span>
                                </div>
                                <div className="flex items-center pr-3 gap-[11px]">
                                    <span className="flex h-[20px] items-center pb-1 text-custom-bluegreen text-2xl">
                                        ●
                                    </span>
                                    <span className="text-custom-gray12 text-xs hover:underline hover:text-blue-500 cursor-pointer">
                                        <Link
                                            /*  to={`/inquirymanagement/inquirylist?channels=Social media&year=${encodeURIComponent(
                                                yearValue
                                            )}${
                                                monthValue !== "All"
                                                    ? `&month=${encodeURIComponent(
                                                          monthValue
                                                      )}`
                                                    : ""
                                            }${
                                                departmentValue !== "All"
                                                    ? `&department=${encodeURIComponent(
                                                          departmentValue
                                                      )}`
                                                    : ""
                                            }
                                            ${
                                                projectValue !== "All"
                                                    ? `&property=${encodeURIComponent(
                                                          projectValue
                                                      )}`
                                                    : ""
                                            }`} */

                                            onClick={(e) => {
                                                e.preventDefault();
                                                setSearchFilter({
                                                    channels: "Social media",
                                                    selectedYear: yearValue,
                                                    selectedMonth:
                                                        monthValue !== "All"
                                                            ? monthValue
                                                            : "",
                                                    departments:
                                                        departmentValue !==
                                                            "All"
                                                            ? departmentValue
                                                            : "",
                                                    selectedProperty:
                                                        projectValue !== "All"
                                                            ? projectValue
                                                            : "",
                                                });
                                                navigate(
                                                    "/inquirymanagement/inquirylist"
                                                );
                                            }}
                                        >
                                            Social Media
                                        </Link>
                                    </span>
                                </div>
                                <div className="flex items-center pr-3 gap-[11px] ">
                                    <span className="flex h-[20px] items-center pb-1 text-[#404B52] text-2xl">
                                        ●
                                    </span>
                                    <span className="text-custom-gray12 text-xs hover:underline hover:text-blue-500 cursor-pointer">
                                        <Link
                                            /*   to={`/inquirymanagement/inquirylist?channels=Branch Tablet&year=${encodeURIComponent(
                                                yearValue
                                            )}${
                                                monthValue !== "All"
                                                    ? `&month=${encodeURIComponent(
                                                          monthValue
                                                      )}`
                                                    : ""
                                            }${
                                                departmentValue !== "All"
                                                    ? `&department=${encodeURIComponent(
                                                          departmentValue
                                                      )}`
                                                    : ""
                                            }
                                            ${
                                                projectValue !== "All"
                                                    ? `&property=${encodeURIComponent(
                                                          projectValue
                                                      )}`
                                                    : ""
                                            }`} */

                                            onClick={(e) => {
                                                e.preventDefault();
                                                setSearchFilter({
                                                    channels: "Branch Tablet",
                                                    selectedYear: yearValue,
                                                    selectedMonth:
                                                        monthValue !== "All"
                                                            ? monthValue
                                                            : "",
                                                    departments:
                                                        departmentValue !==
                                                            "All"
                                                            ? departmentValue
                                                            : "",
                                                    selectedProperty:
                                                        projectValue !== "All"
                                                            ? projectValue
                                                            : "",
                                                });
                                                navigate(
                                                    "/inquirymanagement/inquirylist"
                                                );
                                            }}
                                        >
                                            Branch Tablet
                                        </Link>
                                    </span>
                                </div>
                                <div className="flex items-center pr-3 gap-[11px] ">
                                    <span className="flex h-[20px] items-center pb-1 text-[#F3D48F] text-2xl">
                                        ●
                                    </span>
                                    <span className="text-custom-gray12 text-xs hover:underline hover:text-blue-500 cursor-pointer">
                                        <Link
                                            /*  to={`/inquirymanagement/inquirylist?channels=Internal Endorsement&year=${encodeURIComponent(
                                                yearValue
                                            )}${
                                                monthValue !== "All"
                                                    ? `&month=${encodeURIComponent(
                                                          monthValue
                                                      )}`
                                                    : ""
                                            }${
                                                departmentValue !== "All"
                                                    ? `&department=${encodeURIComponent(
                                                          departmentValue
                                                      )}`
                                                    : ""
                                            }
                                            ${
                                                projectValue !== "All"
                                                    ? `&property=${encodeURIComponent(
                                                          projectValue
                                                      )}`
                                                    : ""
                                            }`} */

                                            onClick={(e) => {
                                                e.preventDefault();
                                                setSearchFilter({
                                                    channels:
                                                        "Internal Endorsement",
                                                    selectedYear: yearValue,
                                                    selectedMonth:
                                                        monthValue !== "All"
                                                            ? monthValue
                                                            : "",
                                                    departments:
                                                        departmentValue !==
                                                            "All"
                                                            ? departmentValue
                                                            : "",
                                                    selectedProperty:
                                                        projectValue !== "All"
                                                            ? projectValue
                                                            : "",
                                                });
                                                navigate(
                                                    "/inquirymanagement/inquirylist"
                                                );
                                            }}
                                        >
                                            Internal Endorsement
                                        </Link>
                                    </span>
                                </div>
                                <div className="flex items-center pr-3 gap-[11px] ">
                                    <span className="flex h-[20px] items-center pb-1 text-custom-grayA5 text-2xl">
                                        ●
                                    </span>
                                    <span className="text-custom-gray12 text-xs hover:underline hover:text-blue-500 cursor-pointer">
                                        <Link
                                            /*  to={`/inquirymanagement/inquirylist?channels=Internal Endorsement&year=${encodeURIComponent(
                                                yearValue
                                            )}${
                                                monthValue !== "All"
                                                    ? `&month=${encodeURIComponent(
                                                          monthValue
                                                      )}`
                                                    : ""
                                            }${
                                                departmentValue !== "All"
                                                    ? `&department=${encodeURIComponent(
                                                          departmentValue
                                                      )}`
                                                    : ""
                                            }
                                            ${
                                                projectValue !== "All"
                                                    ? `&property=${encodeURIComponent(
                                                          projectValue
                                                      )}`
                                                    : ""
                                            }`} */

                                            onClick={(e) => {
                                                e.preventDefault();
                                                setSearchFilter({
                                                    channels:
                                                        "No Channel",
                                                    selectedYear: yearValue,
                                                    selectedMonth:
                                                        monthValue !== "All"
                                                            ? monthValue
                                                            : "",
                                                    departments:
                                                        departmentValue !==
                                                            "All"
                                                            ? departmentValue
                                                            : "",
                                                    selectedProperty:
                                                        projectValue !== "All"
                                                            ? projectValue
                                                            : "",
                                                });
                                                navigate(
                                                    "/inquirymanagement/inquirylist"
                                                );
                                            }}
                                        >
                                            No Channel
                                        </Link>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="relative flex gap-3 mt-[6px]  items-start">
                <div className="flex flex-col gap-3">
                    <div className=" bg-whiterounded-[10px] bg-[#F2F8FC] w-[579px] flex flex-col overflow-y-auto">
                        <div className="p-4 flex gap-[8px] text-base montserrat-bold">
                            <p className="">By Property</p>
                            {dataProperty &&
                                dataProperty.every(
                                    (item) =>
                                        item.resolved === 0 &&
                                        item.unresolved === 0 &&
                                        item.closed === 0
                                ) && <p>- (No {dataProperty.length > 1 ? 'results' : 'result'} found)</p>}
                        </div>

                        <div className="border border-t-1"></div>
                        <div className="flex-grow overflow-x-auto px-[10px] mt-[5px] pb-[50px]">
                            <table className="table-auto border-collapse border border-gray-300 w-full text-sm text-left">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="border border-gray-300 px-4 py-2 w-[300px]">
                                            Property
                                        </th>
                                        <th className="border border-gray-300 px-4 py-2">
                                            Resolved
                                        </th>
                                        <th className="border border-gray-300 px-4 py-2">
                                            Closed
                                        </th>
                                        <th className="border border-gray-300 text-red-500 px-4 py-2">
                                            Unresolved
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dataProperty
                                        .slice() // Create a shallow copy to avoid mutating the original array
                                        .sort((a, b) => {
                                            if (a.name === "N/A") return -1; // Move "N/A" to the top
                                            if (b.name === "N/A") return 1;
                                            return a.name.localeCompare(b.name); // Sort alphabetically
                                        })
                                        .map((item, index) => (
                                            <tr
                                                className="hover:bg-gray-50"
                                                key={index}
                                            >
                                                <td className="border border-gray-300 px-4 py-2 hover:text-blue-500 hover:underline cursor-pointer">
                                                    <Link
                                                        /*  to={`/inquirymanagement/inquirylist?property=${encodeURIComponent(
                                                            item.name
                                                        )}&year=${encodeURIComponent(
                                                            yearValue
                                                        )}${
                                                            monthValue !== "All"
                                                                ? `&month=${encodeURIComponent(
                                                                      monthValue
                                                                  )}`
                                                                : ""
                                                        }`} */

                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setSearchFilter({
                                                                selectedProperty:
                                                                    item.name,
                                                                selectedYear:
                                                                    yearValue,
                                                                selectedMonth:
                                                                    monthValue !==
                                                                        "All"
                                                                        ? monthValue
                                                                        : "",
                                                                departments: departmentValue !== "All" ? departmentValue : ""
                                                            });
                                                            navigate(
                                                                "/inquirymanagement/inquirylist"
                                                            );
                                                        }}
                                                    >
                                                        {item.name}
                                                    </Link>
                                                </td>
                                                <td className="border border-gray-300 px-4 py-2 hover:text-blue-500 hover:underline cursor-pointer">
                                                    <Link
                                                        /* to={`/inquirymanagement/inquirylist?property=${encodeURIComponent(
                                                            item.name
                                                        )}&status=Resolved&year=${encodeURIComponent(
                                                            yearValue
                                                        )}${
                                                            monthValue !== "All"
                                                                ? `&month=${encodeURIComponent(
                                                                      monthValue
                                                                  )}`
                                                                : ""
                                                        }`} */

                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setSearchFilter({
                                                                selectedProperty:
                                                                    item.name,
                                                                selectedYear:
                                                                    yearValue,
                                                                status: "Resolved",
                                                                selectedMonth:
                                                                    monthValue !==
                                                                        "All"
                                                                        ? monthValue
                                                                        : "",
                                                                departments: departmentValue !== "All" ? departmentValue : ""

                                                            });
                                                            navigate(
                                                                "/inquirymanagement/inquirylist"
                                                            );
                                                        }}
                                                    >
                                                        {item.resolved}
                                                    </Link>
                                                </td>
                                                <td className="border border-gray-300 px-4 py-2 hover:text-blue-500 hover:underline cursor-pointer">
                                                    <Link
                                                        /*   to={`/inquirymanagement/inquirylist?property=${encodeURIComponent(
                                                            item.name
                                                        )}&status=Closed&year=${encodeURIComponent(
                                                            yearValue
                                                        )}${
                                                            monthValue !== "All"
                                                                ? `&month=${encodeURIComponent(
                                                                      monthValue
                                                                  )}`
                                                                : ""
                                                        }`} */

                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setSearchFilter({
                                                                selectedProperty:
                                                                    item.name,
                                                                status: "Closed",
                                                                selectedYear:
                                                                    yearValue,
                                                                selectedMonth:
                                                                    monthValue !==
                                                                        "All"
                                                                        ? monthValue
                                                                        : "",
                                                                departments: departmentValue !== "All" ? departmentValue : ""

                                                            });
                                                            navigate(
                                                                "/inquirymanagement/inquirylist"
                                                            );
                                                        }}
                                                    >
                                                        {item.closed}
                                                    </Link>
                                                </td>
                                                <td className="border border-gray-300 px-4 py-2 hover:text-blue-500 hover:underline cursor-pointer">
                                                    <Link
                                                        /*   to={`/inquirymanagement/inquirylist?property=${encodeURIComponent(
                                                            item.name
                                                        )}&status=unresolved&year=${encodeURIComponent(
                                                            yearValue
                                                        )}${
                                                            monthValue !== "All"
                                                                ? `&month=${encodeURIComponent(
                                                                      monthValue
                                                                  )}`
                                                                : ""
                                                        }`} */

                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setSearchFilter({
                                                                selectedProperty:
                                                                    item.name,
                                                                status: "unresolved",
                                                                selectedYear:
                                                                    yearValue,
                                                                selectedMonth:
                                                                    monthValue !==
                                                                        "All"
                                                                        ? monthValue
                                                                        : "",
                                                                /* department: departmentValue, */
                                                            });
                                                            navigate(
                                                                "/inquirymanagement/inquirylist"
                                                            );
                                                        }}
                                                    >
                                                        {item.unresolved}
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    <tr className="bg-gray-100 font-semibold">
                                        <td className="border border-gray-300 px-4 py-2">
                                            Total
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            {dataProperty.reduce(
                                                (sum, item) =>
                                                    sum + item.resolved,
                                                0
                                            )}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            {dataProperty.reduce(
                                                (sum, item) =>
                                                    sum + item.closed,
                                                0
                                            )}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            {dataProperty.reduce(
                                                (sum, item) =>
                                                    sum + item.unresolved,
                                                0
                                            )}
                                        </td>
                                    </tr>
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
                        <div className="flex p-4 gap-[8px] text-base montserrat-bold">
                            <p className="">By Department</p>
                            {dataDepartment &&
                                dataDepartment.every(
                                    (item) =>
                                        item.resolved === 0 &&
                                        item.unresolved === 0 &&
                                        item.closed === 0
                                ) && <p>- (No {dataDepartment.length > 1 ? 'results' : 'result'} found)</p>}
                        </div>
                        <div className="border border-t-1"></div>
                        <div className="flex-grow overflow-x-auto px-[10px] mt-[5px] pb-[50px]">
                            <table className="table-auto border-collapse border border-gray-300 w-full text-sm text-left">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="border border-gray-300 px-4 py-2 w-[300px]">
                                            Department
                                        </th>
                                        <th className="border border-gray-300 px-4 py-2">
                                            Resolved
                                        </th>
                                        <th className="border border-gray-300 px-4 py-2">
                                            Closed
                                        </th>
                                        <th className="border border-gray-300 text-red-500 px-4 py-2">
                                            Unresolved
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dataDepartment
                                        .slice() // Create a copy to avoid mutating the original array
                                        .filter((item) => item.name !== null)
                                        .sort((a, b) =>
                                            a.name.localeCompare(b.name)
                                        ) // Sort alphabetically by name
                                        .map((item, index) => (
                                            <tr
                                                className="hover:bg-gray-50"
                                                key={index}
                                            >
                                                <td className="border border-gray-300 px-4 py-2 hover:text-blue-500 hover:underline cursor-pointer">
                                                    <Link
                                                        /* to={`/inquirymanagement/inquirylist?${
                                                            item.name !== "All"
                                                                ? `department=${encodeURIComponent(
                                                                      item.name
                                                                  )}&`
                                                                : ""
                                                        }year=${encodeURIComponent(
                                                            yearValue
                                                        )}${
                                                            monthValue !== "All"
                                                                ? `&month=${encodeURIComponent(
                                                                      monthValue
                                                                  )}`
                                                                : ""
                                                        }`} */

                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setSearchFilter({
                                                                departments:
                                                                    item.name !==
                                                                        "All"
                                                                        ? item.name
                                                                        : "",
                                                                selectedYear:
                                                                    yearValue,
                                                                selectedMonth:
                                                                    monthValue !==
                                                                        "All"
                                                                        ? monthValue
                                                                        : "",
                                                                /* department: departmentValue, */
                                                            });
                                                            navigate(
                                                                "/inquirymanagement/inquirylist"
                                                            );
                                                        }}
                                                    >
                                                        {item.name}
                                                    </Link>
                                                </td>
                                                <td className="border border-gray-300 px-4 py-2 hover:text-blue-500 hover:underline cursor-pointer">
                                                    <Link
                                                        /* to={`/inquirymanagement/inquirylist?${
                                                            item.name !== "All"
                                                                ? `department=${encodeURIComponent(
                                                                      item.name
                                                                  )}&`
                                                                : ""
                                                        }status=Resolved&year=${encodeURIComponent(
                                                            yearValue
                                                        )}${
                                                            monthValue !== "All"
                                                                ? `&month=${encodeURIComponent(
                                                                      monthValue
                                                                  )}`
                                                                : ""
                                                        }`} */

                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setSearchFilter({
                                                                departments:
                                                                    item.name !==
                                                                        "All"
                                                                        ? item.name
                                                                        : "",
                                                                selectedYear:
                                                                    yearValue,
                                                                status: "Resolved",
                                                                selectedMonth:
                                                                    monthValue !==
                                                                        "All"
                                                                        ? monthValue
                                                                        : "",
                                                                /* department: departmentValue, */
                                                            });
                                                            navigate(
                                                                "/inquirymanagement/inquirylist"
                                                            );
                                                        }}
                                                    >
                                                        {item.resolved}
                                                    </Link>
                                                </td>
                                                <td className="border border-gray-300 px-4 py-2 hover:text-blue-500 hover:underline cursor-pointer">
                                                    <Link
                                                        /*  to={`/inquirymanagement/inquirylist?${
                                                            item.name !== "All"
                                                                ? `department=${encodeURIComponent(
                                                                      item.name
                                                                  )}&`
                                                                : ""
                                                        }status=Closed&year=${encodeURIComponent(
                                                            yearValue
                                                        )}${
                                                            monthValue !== "All"
                                                                ? `&month=${encodeURIComponent(
                                                                      monthValue
                                                                  )}`
                                                                : ""
                                                        }`} */

                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setSearchFilter({
                                                                departments:
                                                                    item.name !==
                                                                        "All"
                                                                        ? item.name
                                                                        : "",
                                                                status: "Closed",
                                                                selectedYear:
                                                                    yearValue,
                                                                selectedMonth:
                                                                    monthValue !==
                                                                        "All"
                                                                        ? monthValue
                                                                        : "",
                                                                /* department: departmentValue, */
                                                            });
                                                            navigate(
                                                                "/inquirymanagement/inquirylist"
                                                            );
                                                        }}
                                                    >
                                                        {item.closed}
                                                    </Link>
                                                </td>
                                                <td className="border border-gray-300 px-4 py-2 hover:text-blue-500 hover:underline cursor-pointer">
                                                    <Link
                                                        /*  to={`/inquirymanagement/inquirylist?${
                                                            item.name !== "All"
                                                                ? `department=${encodeURIComponent(
                                                                      item.name
                                                                  )}&`
                                                                : ""
                                                        }status=unresolved&year=${encodeURIComponent(
                                                            yearValue
                                                        )}${
                                                            monthValue !== "All"
                                                                ? `&month=${encodeURIComponent(
                                                                      monthValue
                                                                  )}`
                                                                : ""
                                                        }`} */

                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setSearchFilter({
                                                                departments:
                                                                    item.name !==
                                                                        "All"
                                                                        ? item.name
                                                                        : "",
                                                                status: "unresolved",
                                                                selectedYear:
                                                                    yearValue,
                                                                selectedMonth:
                                                                    monthValue !==
                                                                        "All"
                                                                        ? monthValue
                                                                        : "",
                                                                /* department: departmentValue, */
                                                            });
                                                            navigate(
                                                                "/inquirymanagement/inquirylist"
                                                            );
                                                        }}
                                                    >
                                                        {item.unresolved}
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    <tr className="bg-gray-100 font-semibold">
                                        <td className="border border-gray-300 px-4 py-2">
                                            Total
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            {dataDepartment.reduce(
                                                (sum, item) =>
                                                    sum + item.resolved,
                                                0
                                            )}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            {dataDepartment.reduce(
                                                (sum, item) =>
                                                    sum + item.closed,
                                                0
                                            )}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            {dataDepartment.reduce(
                                                (sum, item) =>
                                                    sum + item.unresolved,
                                                0
                                            )}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex-grow mt-[6px]">
                <div className="flex flex-col gap-[15px] w-full">
                    <div className="w-full pb-7 min-h-[335px] flex-grow-1 bg-[#F2F8FC] rounded-lg">
                        <div className="flex p-4 gap-[8px] text-base montserrat-bold">
                            <p className="">By Category</p>
                            {dataCategory &&
                                dataCategory.every(
                                    (item) => item.value === 0
                                ) && <p>- (No {dataCategory.length > 1 ? 'results' : 'result'} found)</p>}
                        </div>
                        <div className="border border-t-1"></div>
                        <div className="flex flex-col">
                            <div className="flex justify-center">
                                <PieChart width={1648} height={730}>
                                    <Pie
                                        data={dataCategory}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={300}
                                        innerRadius={0}
                                        paddingAngle={1}
                                        strokeWidth={2}
                                        stroke="white"
                                        cornerRadius={0}
                                        fill="#8884d8"
                                        dataKey="value"
                                        startAngle={90}
                                        endAngle={450}
                                        label={renderCustomLabel}
                                        labelLine={true}
                                    >
                                        {dataCategory.map((entry, index) => (
                                            <Cell
                                                key={index}
                                                fill={getColor(
                                                    entry.name,
                                                    index
                                                )}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        content={<CustomTooltipPieChart />}
                                    />
                                </PieChart>
                            </div>
                            <div className="flex w-full justify-center">
                                <div className="flex w-[150px] py-4 justify-center"> {/* dummy div to align the chart */}
                                    <p className="font-bold text-[20px]">Total: {totalValueCategory}</p>
                                </div>
                            </div>
                            <div className="flex justify-center w-full">
                                <div className="flex w-[150px]"></div>{" "}
                                {/* dummy div to align the chart */}
                                <div className="grid grid-cols-2 gap-[3px]">
                                    {dataCategory.map((category, index) => (
                                        <div
                                            className=" shrink-0 items-center"
                                            key={index}
                                        >
                                            <div
                                                className="flex w-[450px] gap-[10px]"
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
                                                    <span className="text-[18px] text-[#121212] leading-[15px] py-[4px] hover:underline hover:text-blue-500 cursor-pointer">
                                                        <Link
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                setSearchFilter(
                                                                    {
                                                                        category:
                                                                            category.name,
                                                                        departments:
                                                                            departmentValue !==
                                                                                "All"
                                                                                ? departmentValue
                                                                                : "",
                                                                        selectedYear:
                                                                            yearValue,
                                                                        selectedMonth:
                                                                            monthValue !==
                                                                                "All"
                                                                                ? monthValue
                                                                                : "",
                                                                        selectedProperty:
                                                                            projectValue !==
                                                                                "All"
                                                                                ? projectValue
                                                                                : "",
                                                                    }
                                                                );
                                                                navigate(
                                                                    "/inquirymanagement/inquirylist"
                                                                );
                                                            }}
                                                        >
                                                            {category.name}
                                                        </Link>
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-gray-500 font-bold text-sm">
                                                        {`${(
                                                            (category.value /
                                                                totalValue) *
                                                            100
                                                        ).toFixed(2)}%`}
                                                    </span>
                                                    <span className="text-gray-500 font-bold text-sm">
                                                        {"("}
                                                        {category.value}
                                                        {")"}
                                                    </span>
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

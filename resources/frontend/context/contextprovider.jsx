import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import apiService from "../component/servicesApi/apiService";
import debounce from "lodash/debounce";

const StateContext = createContext({
    user: null,
    token: null,
    setUser: () => {},
    setToken: () => {},
});

export const ContextProvider = ({ children }) => {
    const [user, setUser] = useState({});
    const [token, _setToken] = useState(localStorage.getItem("authToken"));
    const [allEmployees, setAllEmployees] = useState([]);
    const [daysFilter, setDaysFilter] = useState(null);
    const [hasAttachments, setHasAttachments] = useState(false);
    const [statusFilter, setStatusFilter] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifStatus, setNotifStatus] = useState("");
    const [specificAssigneeCsr, setSpecificAssigneeCsr] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [notifCurrentPage, setNotifCurrentPage] = useState(0);
    const [searchFilter, setSearchFilter] = useState({});
    const [data, setData] = useState([]);
    const itemsPerPage = 20;
    const [pageCount, setPageCount] = useState(0);
    const [notifPageCount, setNotifPageCount] = useState(0);
    const [messages, setMessages] = useState([]);
    const [logs, setLogs] = useState([]);
    const [ticketId, setTicketId] = useState(null);
    const [dataCategory, setDataCategory] = useState([]);
    const [dataProperty, setDataPropery] = useState([]);
    const [month, setMonth] = useState("");
    const [propertyMonth, setPropertyMonth] = useState("");
    const [specificInquiry, setSpecificInquiry] = useState(null);
    const [dataSet, setDataSet] = useState([]);
    const [department, setDepartment] = useState("");
    const [isDepartmentInitialized, setIsDepartmentInitialized] =
        useState(false);
    const [pricingMasterLists, setPricingMasterLists] = useState([]);
    const [paymentSchemes, setPaymentSchemes] = useState([]);
    const [propertyId, setPropertyId] = useState(null);
    const [floorPremiumsAccordionOpen, setFloorPremiumsAccordionOpen] =
        useState(false);
    const [propertyFloors, setPropertyFloors] = useState([]);
    const [selectedFloor, setSelectedFloor] = useState(null);
    const [propertyUnit, setPropertyUnits] = useState([]);
    const [towerPhaseId, setTowerPhaseId] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [concernMessages, setConcernMessages] = useState([]);
    const [assigneesPersonnel, setAssigneesPersonnel] = useState([]);
    useEffect(() => {
        if (user && user.department && !isDepartmentInitialized) {
            setDepartment(user.department === "CRS" ? "All" : user.department);
            setIsDepartmentInitialized(true);
        }
    }, [user, isDepartmentInitialized]);

    const setToken = (token) => {
        _setToken(token);
        if (token) {
            localStorage.setItem("authToken", token);
        } else {
            localStorage.removeItem("authToken");
        }
    };

    const getAllConcerns = async () => {
        if (token) {
            try {
                const searchParams = new URLSearchParams({
                    search: JSON.stringify(searchFilter),
                    page: currentPage + 1,
                    days: daysFilter || "",
                    status: statusFilter || "",
                    specificAssigneeCsr: specificAssigneeCsr || "",
                    /*  has_attachments: hasAttachments, */
                }).toString();

                const response = await apiService.get(
                    `/get-concern?${searchParams}`
                );

                setData(response.data.data);
                setPageCount(response.data.last_page);
            } catch (error) {
                console.error("Error fetching data: ", error);
            }
        }
    };

    const fetchCategory = async () => {
        if (!isDepartmentInitialized) return;
        try {
            const response = await apiService.get("category-monthly", {
                params: { month: month, department: department },
            });
            const result = response.data;
            const formattedData = result.map((item) => ({
                name: item.details_concern,
                value: item.total,
            }));
            setDataCategory(formattedData);
        } catch (error) {
            console.log("Error retrieving data", error);
        }
    };

    const fetchDataReport = async () => {
        if (!isDepartmentInitialized) return;
        try {
            const response = await apiService.get("report-monthly", {
                params: { department: department },
            });
            const result = response.data;

            const formattedData = result.map((item) => ({
                name: item.month.toString().padStart(2, "0"),
                Resolved: item.resolved,
                Unresolved: item.unresolved,
            }));

            setDataSet(formattedData);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const getInquiriesPerProperty = async () => {
        if (!isDepartmentInitialized) return;
        try {
            const response = await apiService.get("inquiries-property", {
                params: {
                    propertyMonth: propertyMonth,
                    department: department,
                },
            });
            const result = response.data;
            const formattedData = result.map((item) => ({
                name: item.property,
                resolved: item.resolved,
                unresolved: item.unresolved,
            }));
            setDataPropery(formattedData);
        } catch (error) {
            console.log("error retrieving", error);
        }
    };

    const getSpecificInquiry = async () => {
        if (token) {
            try {
                const response = await apiService.get("specific-assignee");
                setSpecificInquiry(response.data);
            } catch (error) {
                console.log("error", error);
            }
        }
    };

    const getCount = async () => {
        if (token) {
            try {
                const response = await apiService.get("unread-count");
                setUnreadCount(response.data.unreadCount);
            } catch (error) {
                console.log("errror", error);
            }
        }
    };

    const getNotifications = async () => {
        if (token) {
            try {
                const response = await apiService.get(
                    `notifications?page=${notifCurrentPage + 1}&status=${
                        notifStatus || ""
                    }`
                );
                setNotifications(response.data.data);
                setNotifPageCount(response.data.last_page);
            } catch (error) {
                console.log("error retrieving", error);
            }
        }
    };

    const getAssigneesPersonnel = async () => {
        if (ticketId) {
            try {
                const encodedTicketId = encodeURIComponent(ticketId);

                const response = await apiService.get(
                    `personnel-assignee?ticketId=${encodedTicketId}`
                );
                const data = response.data;

                setAssigneesPersonnel((prevAssigneesPersonnel) => ({
                    ...prevAssigneesPersonnel,
                    [ticketId]: data,
                }));
            } catch (error) {
                console.log("error");
            }
        }
    };

    const getConcernMessages = async () => {
        if (ticketId) {
            try {
                const encodedTicketId = encodeURIComponent(ticketId);

                const response = await apiService.get(
                    `get-concern-messages?ticketId=${encodedTicketId}`
                );
                const data = response.data;
                setConcernMessages((prevMessages) => ({
                    ...prevMessages,
                    [ticketId]: data,
                }));
            } catch (error) {
                console.log("error retrieving", error);
            }
        }
    };

    const getMessages = async (ticketId) => {
        /* if (messages[id]) return; */
        try {
            const encodedTicketId = encodeURIComponent(ticketId);
            const response = await apiService.get(
                `get-message/${encodedTicketId}`
            );
            const data = response.data;
            setMessages((prevMessages) => ({
                ...prevMessages,
                [ticketId]: data,
            }));
        } catch (error) {
            console.error("Error fetching messages", error);
        }
    };

    const getInquiryLogs = async (ticketId) => {
        /* if (messages[id]) return; */
        try {
            const encodedTicketId = encodeURIComponent(ticketId);
            const response = await apiService.get(
                `get-logs/${encodedTicketId}`
            );
            const data = response.data;
            setLogs((prevLogs) => ({
                ...prevLogs,
                [ticketId]: data,
            }));
        } catch (error) {
            console.error("Error fetching messages", error);
        }
    };

    const isValidMonth = (month) => {
        const validMonths = {
            January: "January",
            Feb: "February",
            February: "February",
            Mar: "March",
            March: "March",
            Apr: "April",
            April: "April",
            May: "May",
            Jun: "June",
            June: "June",
            Jul: "July",
            July: "July",
            Aug: "August",
            August: "August",
            Sep: "September",
            September: "September",
            Oct: "October",
            October: "October",
            Nov: "November",
            November: "November",
            Dec: "December",
            December: "December",
        };

        const normalizedMonth =
            month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();

        return validMonths.hasOwnProperty(normalizedMonth);
    };

    const getPricingMasterLists = async () => {
        if (token) {
            try {
                const response = await apiService.get(
                    "get-pricing-master-lists"
                );
                setPricingMasterLists(response.data);
            } catch (error) {
                console.error("Error fetching pricing master lists:", error);
            }
        }
    }; //get all pricing master lists data

    const getPaymentSchemes = async () => {
        if (token) {
            try {
                const response = await apiService.get("get-payment-schemes");
                setPaymentSchemes(response.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }
    }; //get all payment schemes

    const getPropertyFloors = async (towerPhaseId) => {
        // Check if property floors have already been fetched
        if (!propertyFloors[towerPhaseId] && towerPhaseId && token) {
            try {
                setIsLoading(true);
                const response = await apiService.get(
                    `property-floors/${towerPhaseId}`
                );
                return response.data; // Return the data
                // Merge the new floors data with existing propertyFloors
                // setPropertyFloors((prev) => ({
                //     ...prev,
                //     [towerPhaseId]: response.data, // Store floors based on towerPhaseId
                // }));
            } catch (error) {
                console.error("Error fetching property floors:", error);
                return null;
            } finally {
                setIsLoading(false);
            }
        }
    }; //get property floors

    const getPropertyUnits = async (towerPhaseId, selectedFloor) => {
        if (token || selectedFloor || towerPhaseId) {
            try {
                setIsLoading(true);
                const response = await apiService.post("property-units", {
                    towerPhaseId,
                    selectedFloor,
                });
                setPropertyUnits(response.data);
            } catch (error) {
                console.error("Error fetching property units:", error);
            } finally {
                setIsLoading(false);
            }
        }
    }; //get property units

    useEffect(() => {
        getPropertyUnits(towerPhaseId, selectedFloor);
    }, [token, towerPhaseId, selectedFloor]);

    useEffect(() => {
        getPricingMasterLists();
        getPaymentSchemes();
    }, [token]);

    useEffect(() => {
        if (towerPhaseId) {
            getPropertyFloors(towerPhaseId);
        }
    }, [towerPhaseId, token]);
    // useEffect(() => {
    //     getPaymentSchemes();
    // }, [token]);
    useEffect(() => {
        if (token) {
            const getData = async () => {
                const response = await apiService.get("user");
                setUser(response.data);
            };
            getData();
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            const getEmployeeData = async () => {
                const response = await apiService.get("employee-list");
                setAllEmployees(response.data);
            };
            getEmployeeData();
        }
    }, [token]);

    useEffect(() => {
        getAllConcerns();
    }, [
        currentPage,
        daysFilter,
        token,
        statusFilter,
        searchFilter,
        hasAttachments,
        specificAssigneeCsr,
    ]);

    useEffect(() => {
        getNotifications();
    }, [notifCurrentPage, notifStatus, token]);

    useEffect(() => {
        if (ticketId) {
            getMessages(ticketId);
            getInquiryLogs(ticketId);
            getConcernMessages();
            getAssigneesPersonnel();
        }
    }, [ticketId]);

    useEffect(() => {
        getCount();
    }, [unreadCount, token]);

    useEffect(() => {}, [user, token]);

    useEffect(() => {
        getSpecificInquiry();
    }, []);

    //* For Report Page
    useEffect(() => {
        const fetchData = async () => {
            try {
                await fetchDataReport();
                await getInquiriesPerProperty();
                await fetchCategory();
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [department, propertyMonth, month]);

    return (
        <StateContext.Provider
            value={{
                user,
                token,
                setUser,
                setToken,
                currentPage,
                setCurrentPage,
                data,
                pageCount,
                getAllConcerns,
                setMessages,
                messages,
                ticketId,
                setTicketId,
                daysFilter,
                getMessages,
                setDaysFilter,
                getInquiryLogs,
                logs,
                setLogs,
                allEmployees,
                setStatusFilter,
                setNotifCurrentPage,
                notifPageCount,
                notifications,
                notifCurrentPage,
                getNotifications,
                setNotifStatus,
                unreadCount,
                setSearchFilter,
                setHasAttachments,
                hasAttachments,
                setMonth,
                month,
                dataCategory,
                fetchCategory,
                propertyMonth,
                dataProperty,
                getInquiriesPerProperty,
                setPropertyMonth,
                setData,
                searchFilter,
                statusFilter,
                specificInquiry,
                setSpecificAssigneeCsr,
                specificAssigneeCsr,
                getCount,
                department,
                setDepartment,
                fetchDataReport,
                dataSet,
                pricingMasterLists,
                getPricingMasterLists,
                paymentSchemes,
                getPaymentSchemes,
                getPropertyFloors,
                setPropertyId,
                propertyFloors,
                propertyId,
                floorPremiumsAccordionOpen,
                setFloorPremiumsAccordionOpen,
                selectedFloor,
                setSelectedFloor,
                propertyUnit,
                setPropertyUnits,
                getPropertyUnits,
                towerPhaseId,
                setTowerPhaseId,
                isLoading,
                setPropertyFloors,
                concernMessages,
                setConcernMessages,
                getConcernMessages,
                setAssigneesPersonnel,
                assigneesPersonnel,
                getAssigneesPersonnel,
            }}
        >
            {children}
        </StateContext.Provider>
    );
};

export const useStateContext = () => useContext(StateContext);

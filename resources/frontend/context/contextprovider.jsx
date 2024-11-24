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
    setUser: () => { },
    setToken: () => { },
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
    const [communicationTypeData, setCommunicationTypeData] = useState([]);
    const [inquriesPerChannelData, setInquriesPerChannelData] = useState([]);
    const [month, setMonth] = useState("");
    const [propertyMonth, setPropertyMonth] = useState("");
    const [communicationTypeMonth, setCommunicationTypeMonth] = useState("");
    const [specificInquiry, setSpecificInquiry] = useState(null);
    const [dataSet, setDataSet] = useState([]);
    const [department, setDepartment] = useState("");
    const [year, setYear] = useState("");
    const [departmentStatusYear, setDepartmentStatusYear] = useState("");
    const [inquiriesPerCategoryYear, setInquiriesPerCategoryYear] = useState("");
    const [inquiriesPerPropertyYear, setInquiriesPerPropertyYear] = useState("");
    const [communicationTypeYear, setCommunicationTypeYear] = useState("");
    const [isDepartmentInitialized, setIsDepartmentInitialized] =
        useState(false);
    const [inquiriesPerChanelYear, setInquiriesPerChanelYear] = useState("");
    const [inquiriesPerChannelMonth, setInquiriesPerChannelMonth] = useState("");
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
    const [concernId, setConcernId] = useState(null);
    const [propertyMasterData, setPropertyMasterData] = useState([]);
    const [assigneesPersonnel, setAssigneesPersonnel] = useState([]);
    const [propertyNamesList, setPropertyNamesList] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [currentPageTransaction, setCurrentPageTransaction] = useState(0);
    const [transactionsPageCount, setTransactionsPageCount] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [matchesData, setMatchesData] = useState([]);
    const [currentPageInvoices, setCurrentPageInvoices] = useState(0);
    const [invoicesPageCount, setInvoicesPageCount] = useState(0);
    const [bankNames, setBankNames] = useState("All");
    const [bankList, setBankList] = useState([]);
    const [filterDueDate, setFilterDueDate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [navBarData, setNavBarData] = useState([]);
 
    useEffect(() => {
        if (user && user.department && !isDepartmentInitialized) {
            setDepartment(user.department === "Customer Relations - Services" ? "All" : user.department);
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
            setLoading(true);
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
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data: ", error);
            }
        }
    };

    const updateConcern = ({ id, ...dataToUpdate }) => {
        setData((prevData) =>
            prevData.map((concern) =>
                concern.id === id ? { ...dataToUpdate } : concern
            )
        );
    };

    const getBankName = async () => {
        if (token) {
            try {
                const response = await apiService.get("get-transaction-bank");
                setBankList(response.data);
            } catch (error) {
                console.log("error retrieving banks", error);
            }
        }
    };

    const getTransactions = async () => {
        try {
            const searchParams = new URLSearchParams({
                /*   search: JSON.stringify(searchFilter), */
                page: currentPageTransaction + 1,
                bank_name: bankNames ? bankNames : null
            }).toString();
            const response = await apiService.get(`get-transactions?${searchParams}`);
            setTransactions(response.data.data);
            setTransactionsPageCount(response.data.last_page);

        } catch (error) {
            console.error("Error fetching data: ", error);
        }
    };

    const getMatches = async () => {
        if (token) {
            try {
                const response = await apiService.get("get-matches");
                setMatchesData(response.data);
            } catch (error) {
                console.log("error uploading data", error);
            }
        }
    };

    const getInvoices = async () => {
        try {
            const searchParams = new URLSearchParams({
                dueDate: filterDueDate ? filterDueDate : null,
                page: currentPageInvoices,
            });
            const response = await apiService.get(`get-invoices?${searchParams}`);
            setInvoices(response.data.data);
            setInvoicesPageCount(response.data.last_page);
        } catch (error) {
            console.log("error", error);
        }
    };

    const fetchCategory = async () => {
        if (!isDepartmentInitialized) return;
        try {
            const response = await apiService.get("category-monthly", {
                params: { month: month, department: department, year: inquiriesPerCategoryYear },
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


    const getPropertyNames = async () => {
        if (token) {
            try {
                const response = await apiService.get("property-name");
                setPropertyNamesList(response.data);
            } catch (error) {
                console.log("Error retrieving data", error);
            }
        }
    };
    const fetchDataReport = async () => {
        if (!isDepartmentInitialized) return;
        try {

            const response = await apiService.get("report-monthly", {
                params: { department: department, year: departmentStatusYear },
            });
            const result = response.data;
           
            const formattedData = result.map((item) => ({
                name: item.month.toString().padStart(2, "0"),
                Resolved: item.resolved,
                Unresolved: item.unresolved,
                Closed:item.closed
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
                    year: inquiriesPerPropertyYear
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
    const getCommunicationTypePerProperty = async () => {
        if (!isDepartmentInitialized) return;
        try {
            const response = await apiService.get("communication-type-property", {
                params: {
                    propertyMonth: communicationTypeMonth,
                    department: department,
                    year: communicationTypeYear
                },
            });
            const result = response.data;
            const formattedData = result.map((item) => ({
                name: item.property,
                complainCount: item.complaint,
                requestCount: item.request,
                inquiryCount: item.inquiry,
                suggestionCount: item.suggestion,

            }));

            setCommunicationTypeData(formattedData);
        } catch (error) {
            console.log("Error retrieving communication types:", error);
        }
    };

    const getInquiriesPerChannel = async () => {
        if (!isDepartmentInitialized) return;

        try {
            const response = await apiService.get("inquiries-channel", {
                params: {
                    propertyMonth: inquiriesPerChannelMonth,
                    department: department,
                    year: communicationTypeYear
                },
            });
            const result = response.data;
 
            const formattedData = result.map((item) => ({
                name: item.channels,
                value: item.total,
            }));

            setInquriesPerChannelData(formattedData);
        } catch (error) {
            console.error("Error fetching data:", error);
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
                    `notifications?page=${notifCurrentPage + 1}&status=${notifStatus || ""
                    }`
                );
                setNotifications(response.data.data);
                setNotifPageCount(response.data.last_page);
            } catch (error) {
                console.log("error retrieving", error);
            }
        }
    };

    const getNavBarData = async() => {
        if(token) {
            try {
                const encodedTicketId = encodeURIComponent(ticketId);
                
                const response = await apiService.get(`navbar-data?ticketId=${encodedTicketId}`);
                
                const data = response.data;

                setNavBarData((prevData) => ({
                    ...prevData,
                    [ticketId]: data,
                }));
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

    const getPricingMasterLists = useCallback(async () => {
        if (token) {
            try {
                setIsLoading(true);
                const response = await apiService.get(
                    "get-pricing-master-lists"
                );
                setPricingMasterLists(response.data);
            } catch (error) {
                console.error("Error fetching pricing master lists:", error);
            } finally {
                setIsLoading(false);
            }
        }
    }, []); //get all pricing master lists data

    const getPaymentSchemes = useCallback(async () => {
        if (token) {
            try {
                const response = await apiService.get("get-payment-schemes");

                setPaymentSchemes(response.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }
    }, []); //get all payment schemes
    const getPropertyFloors = useCallback(async (towerPhaseId) => {
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
    }, []); //get property floors

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

    const getPropertyMaster = async (id) => {
        if (token) {
            try {
                setIsLoading(true);
                const response = await apiService.get(
                    `get-property-master/${id}`
                );

                return response.data;
            } catch (e) {
                console.error("Error fetching propertymaster data:", error);
            }
        }
    };

    useEffect(() => {
        getPropertyUnits(towerPhaseId, selectedFloor);
    }, [towerPhaseId, selectedFloor]);

    useEffect(() => {
        getPricingMasterLists();
        getPaymentSchemes();
    }, []);

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
            getPropertyNames();
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
        getBankName();
        getTransactions();
    }, [currentPageTransaction, bankNames]);

    useEffect(() => {
        getInvoices();
    }, [currentPageInvoices, filterDueDate])

    useEffect(() => {
        getNotifications();
    }, [notifCurrentPage, notifStatus, token]);

    useEffect(() => {
        if (ticketId) {
            getMessages(ticketId);
            getInquiryLogs(ticketId);
            getConcernMessages();
            getAssigneesPersonnel();
            getNavBarData();
        }
    }, [ticketId]);

    useEffect(() => {
        getCount();
    }, [unreadCount, token]);

    useEffect(() => { }, [user, token]);

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
                await getCommunicationTypePerProperty();
                await getInquiriesPerChannel();
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [department, propertyMonth, month, departmentStatusYear, inquiriesPerCategoryYear, inquiriesPerPropertyYear, communicationTypeYear, communicationTypeMonth, inquiriesPerChannelMonth, inquiriesPerChanelYear]);

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
                getCommunicationTypePerProperty,
                communicationTypeData,
                setCommunicationTypeData,
                setPropertyMonth,
                setCommunicationTypeMonth,
                communicationTypeMonth,
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
                concernId,
                setConcernId,
                getPropertyMaster,
                getConcernMessages,
                setAssigneesPersonnel,
                assigneesPersonnel,
                getAssigneesPersonnel,
                propertyNamesList,
                invoices,
                transactions,
                currentPageTransaction,
                setCurrentPageTransaction,
                transactionsPageCount,
                getTransactions,
                getMatches,
                matchesData,
                invoicesPageCount,
                setInvoicesPageCount,
                currentPageInvoices,
                setCurrentPageInvoices,
                bankNames,
                setBankNames,
                bankList,
                getInvoices,
                filterDueDate,
                setFilterDueDate,
                notifStatus,
                updateConcern,
                loading,
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
                navBarData,
                getNavBarData
               
            }}

        >
            {children}
        </StateContext.Provider>
    );
};

export const useStateContext = () => useContext(StateContext);

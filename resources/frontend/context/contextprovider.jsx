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

    const fetchCategory = useCallback(
        debounce(async (month) => {
            if (!month || !isValidMonth(month)) {
                return;
            }

            try {
                const response = await apiService.get("category-monthly", {
                    params: { month: month },
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
        }, 300),
        []
    );

    const getInquiriesPerProperty = useCallback(
        debounce(async (propertyMonth) => {
            if (!propertyMonth) {
                return;
            }
            try {
                const response = await apiService.get("inquiries-property", {
                    params: { propertyMonth: propertyMonth },
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
        }, 300),
        []
    );

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
    ]);

    useEffect(() => {
        getNotifications();
    }, [notifCurrentPage, notifStatus, token]);

    useEffect(() => {
        if (ticketId) {
            getMessages(ticketId);
            getInquiryLogs(ticketId);
        }
    }, [ticketId]);

    useEffect(() => {
        getCount();
    }, [unreadCount, token]);

    useEffect(() => {}, [user, token]);

    useEffect(() => {
        if (month) {
            fetchCategory(month);
        }
    }, [month]);

    useEffect(() => {
        if (propertyMonth) {
            getInquiriesPerProperty(propertyMonth);
        }
    }, [propertyMonth]);
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
            }}
        >
            {children}
        </StateContext.Provider>
    );
};

export const useStateContext = () => useContext(StateContext);

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import apiService from "../component/servicesApi/apiService";

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
    const [statusFilter, setStatusFilter] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifStatus, setNotifStatus] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [notifCurrentPage, setNotifCurrentPage] = useState(0);
    const [data, setData] = useState([]);
    const itemsPerPage = 20;
    const [pageCount, setPageCount] = useState(0);
    const [notifPageCount, setNotifPageCount] = useState(0);
    const [messages, setMessages] = useState([]);
    const [logs, setLogs] = useState([]);
    const [ticketId, setTicketId] = useState(null);

    const setToken = (token) => {
        _setToken(token);
        if (token) {
            localStorage.setItem("authToken", token);
        } else {
            localStorage.removeItem("authToken");
        }
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
                console.log("allEmployees", response.data);
                setAllEmployees(response.data);
            };
            getEmployeeData();
        }
    }, [token]);

    const getAllConcerns = async () => {
        if (token) {
            try {
                const response = await apiService.get(
                    `get-concern?page=${currentPage + 1}&days=${
                        daysFilter || ""
                    }&status=${statusFilter || ""}`
                );

                setData(response.data.data);
                setPageCount(response.data.last_page);
            } catch (error) {
                console.error("Error fetching data: ", error);
            }
        }
    };

    const getCount = async () => {
        if(token) {
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

                console.log("notifications", response.data);

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

    useEffect(() => {
        getAllConcerns();
    }, [currentPage, daysFilter, token, statusFilter]);

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
            }}
        >
            {children}
        </StateContext.Provider>
    );
};

export const useStateContext = () => useContext(StateContext);

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
    /*     const [getConcernData, setGetConcernData] = useState([]); */

    const [currentPage, setCurrentPage] = useState(0);
    const [data, setData] = useState([]);
    const itemsPerPage = 20;
    const [pageCount, setPageCount] = useState(0);

    const setToken = (token) => {
        _setToken(token);
        if (token) {
            localStorage.setItem("authToken", token);
        } else {
            localStorage.removeItem("authToken");
        }
    };

    const getAllConcerns = async () => {
        try {
            const response = await apiService.get(
                `get-concern?page=${currentPage + 1}`
            );
            setData(response.data.data);
            setPageCount(response.data.last_page);
        } catch (error) {
            console.error("Error fetching data: ", error);
        }
    };


    useEffect(() => {
        getAllConcerns();
    }, [currentPage]);
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
            }}
        >
            {children}
        </StateContext.Provider>
    );
};

export const useStateContext = () => useContext(StateContext);

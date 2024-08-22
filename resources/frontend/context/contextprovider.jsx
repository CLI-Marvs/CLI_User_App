import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";



const StateContext = createContext({
    user: null,
    token: null,
    setUser: () => { },
    setToken: () => { },
});

export const ContextProvider = ({ children }) => {
    const [user, setUser] = useState({});
    const [token, _setToken] = useState(localStorage.getItem("authToken"));
    const [getConcernData, setGetConcernData] = useState([]);


    const setToken = (token) => {
        _setToken(token);
        if (token) {
            localStorage.setItem("authToken", token);
        } else {
            localStorage.removeItem("authToken");
        }
    };

    const getAllBuyerConcern = async () => {
        const response = await apiService.get(`get-concern/${user?.id}`);
        const data = response.data;
        setGetConcernData(data);
    };


    useEffect(() => {
        if (user?.email) {
            getAllBuyerConcern();
        }

    }, [user]);
    return (
        <StateContext.Provider
            value={{
                user,
                token,
                setUser,
                setToken,
                getConcernData
            }}
        >
            {children}
        </StateContext.Provider>
    );
};


export const useStateContext = () => useContext(StateContext);

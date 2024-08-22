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


    const setToken = (token) => {
        _setToken(token);
        if (token) {
            setIsAuthenticated(true);
            localStorage.setItem("authToken", token);
        } else {
            setIsAuthenticated(false);
            localStorage.removeItem("authToken");
        }
    };

    return (
        <StateContext.Provider
            value={{
                user,
                token,
                setUser,
                setToken,
            }}
        >
            {children}
        </StateContext.Provider>
    );
};


export const useStateContext = () => useContext(StateContext);

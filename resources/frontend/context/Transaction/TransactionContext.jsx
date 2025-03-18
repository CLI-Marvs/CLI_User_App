import React, {
    createContext,
    useContext,
    useState,
} from "react";

const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
    const [transactionList, setTransactionList] = useState([]);
    const [currentPageTransaction, setCurrentPageTransaction] = useState(0);
    const [totalPageTransaction, setTotalPageTransaction] = useState(0);
    const [postingList, setPostingList] = useState([]);
    const [currentPagePosting, setCurrentPagePosting] = useState(0);
    const [totalPagePosting, setTotalPagePosting] = useState(0);
    const [activeItemTransaction, setActiveItemTransaction] = useState("Cleared");
    const [dataToSubmit, setDataToSubmit] = useState({});


    return (
        <TransactionContext.Provider
            value={{
                transactionList,
                setTransactionList,
                currentPageTransaction,
                setCurrentPageTransaction,
                totalPageTransaction,
                setTotalPageTransaction,
                postingList,
                setPostingList,
                currentPagePosting,
                setCurrentPagePosting,
                totalPagePosting,
                setTotalPagePosting,
                activeItemTransaction,
                setActiveItemTransaction,
                dataToSubmit,
                setDataToSubmit
            }}
        >
            {children}
        </TransactionContext.Provider>
    );
};



export const useTransactionContext = () => useContext(TransactionContext);

